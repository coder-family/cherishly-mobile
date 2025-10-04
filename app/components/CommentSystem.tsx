import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from '@react-navigation/elements';
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from "react-redux";
import { Colors } from "../constants/Colors";
import { useThemeColor } from "../hooks/useThemeColor";
import { RootState } from "../redux/store";
import { commentService } from "../services/commentService";

// Types
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

interface Comment {
  _id: string;
  content: string;
  targetType:
    | "promptResponse"
    | "memory"
    | "healthRecord"
    | "growthRecord"
    | "comment";
  targetId: string;
  user: User;
  parentComment?: string | null;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

interface CommentSystemProps {
  targetType:
    | "promptResponse"
    | "memory"
    | "healthRecord"
    | "growthRecord"
    | "comment";
  targetId: string;
  useScrollView?: boolean; // Add this prop to handle nesting issues
  onCommentAdded?: (comment: Comment) => void;
  onCommentDeleted?: (commentId: string) => void;
  onCommentEdited?: (comment: Comment) => void;
  // New props for unified behavior
  mode?: 'modal' | 'inline'; // 'modal' for full-screen, 'inline' for embedded
  maxHeight?: number; // Custom max height for inline mode
  showHeader?: boolean; // Show/hide header
  onClose?: () => void; // Close callback for modal mode
}

// Comment Input Component
const CommentInput: React.FC<{
  targetType: string;
  targetId: string;
  parentCommentId?: string | null;
  onCommentAdded: (comment: Comment) => void;
  onCancel?: () => void;
  placeholder?: string;
  onFocus?: () => void;
}> = ({
  targetType,
  targetId,
  parentCommentId = null,
  onCommentAdded,
  onCancel,
  placeholder,
  onFocus,
}) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = "#e0e0e0";

  const handleSubmit = async () => {
    if (!content.trim() || loading) return;

    setLoading(true);
    try {
      console.log('Creating comment/reply:', {
        content: content.trim(),
        targetType,
        targetId,
        parentCommentId,
      });
      
      const newComment = await commentService.createComment({
        content: content.trim(),
        targetType: targetType as any,
        targetId,
        parentCommentId,
      });

      setContent("");
      onCommentAdded(newComment);
      onCancel?.();
      
      // Success feedback - comment will be visible immediately
    } catch (error: any) {
      console.error("Error creating comment:", error);
      Alert.alert(
        "Lỗi", 
        `Không thể tạo bình luận. ${error.message || 'Vui lòng thử lại.'}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.inputContainer}>
      {parentCommentId && (
        <View style={styles.replyHeader}>
          <Text style={styles.replyLabel}>Trả lời bình luận</Text>
          <TouchableOpacity
            style={styles.addCommentButton}
            onPress={onCancel}
          >
            <Text style={styles.addCommentButtonText}>+ Thêm bình luận</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={content}
          onChangeText={setContent}
          placeholder={
            placeholder ||
            (parentCommentId ? "Viết reply..." : "Viết bình luận...")
          }
          placeholderTextColor="#999"
          multiline
          textAlignVertical="top"
          blurOnSubmit={false}
          maxLength={1000}
          editable={true}
          onFocus={onFocus}
        />
        
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!content.trim() || loading) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!content.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={16} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
      
      {onCancel && (
        <View style={styles.inputActions}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Comment Item Component
const CommentItem: React.FC<{
  comment: Comment;
  currentUserId: string;
  onReply: (commentId: string) => void;
  onEdit: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
  level?: number;
}> = ({ comment, currentUserId, onReply, onEdit, onDelete, level = 0 }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [loading, setLoading] = useState(false);
  const [showReplies, setShowReplies] = useState(level === 0);
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = "#e0e0e0";

  // Auto-expand when new replies are added
  useEffect(() => {
    if (comment.replies && comment.replies.length > 0 && level === 0) {
      setShowReplies(true);
    }
  }, [comment.replies, level]);

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const handleReply = () => {
    onReply(comment._id);
  };

  const handleEdit = async () => {
    if (!editContent.trim() || loading) return;

    setLoading(true);
    try {
      const updatedComment = await commentService.updateComment(comment._id, {
        content: editContent.trim(),
      });

      onEdit(updatedComment);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating comment:", error);
      Alert.alert("Lỗi", "Không thể cập nhật bình luận. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Xóa bình luận", "Bạn có chắc chắn muốn xóa bình luận này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await commentService.deleteComment(comment._id);
            onDelete(comment._id);
          } catch (error) {
            console.error("Error deleting comment:", error);
            Alert.alert("Lỗi", "Không thể xóa bình luận. Vui lòng thử lại.");
          }
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} ngày trước`;
    } else if (diffInHours > 0) {
      return `${diffInHours} giờ trước`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} phút trước`;
    } else {
      return "Vừa xong";
    }
  };

  const isOwner = comment.user._id === currentUserId;

  return (
    <View style={[styles.commentContainer, { marginLeft: level * 20 }]}>
      <View style={styles.commentHeader}>
        <View style={styles.avatarContainer}>
          {comment.user.avatar ? (
            <Image
              source={{ uri: comment.user.avatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.defaultAvatar}>
              <Text style={styles.defaultAvatarText}>
                {comment.user.firstName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.commentInfo}>
          <Text style={[styles.userName, { color: textColor }]}>
            {comment.user.firstName} {comment.user.lastName}
          </Text>
          <Text style={styles.timestamp}>{formatDate(comment.createdAt)}</Text>
        </View>
      </View>

      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={[styles.editInput, { color: textColor, borderColor }]}
            value={editContent}
            onChangeText={setEditContent}
            multiline
            maxLength={1000}
          />
          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsEditing(false);
                setEditContent(comment.content);
              }}
            >
              <Text style={[styles.cancelButtonText, { color: textColor }]}>
                Hủy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!editContent.trim() || loading) && styles.submitButtonDisabled,
              ]}
              onPress={handleEdit}
              disabled={!editContent.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={[styles.commentContent, { color: textColor }]}>
          {comment.content}
        </Text>
      )}

      <View style={styles.commentActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleReply}>
          <Ionicons name="chatbubble-outline" size={16} color="#666" />
          <Text style={styles.actionText}>Trả lời</Text>
        </TouchableOpacity>
        {isOwner && (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="pencil" size={16} color="#666" />
              <Text style={styles.actionText}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash" size={16} color="#e53935" />
              <Text style={[styles.actionText, { color: "#e53935" }]}>Xóa</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {comment.replies && comment.replies.length > 0 && (
        <View style={styles.repliesSection}>
          {/* View Replies Button */}
          <TouchableOpacity style={styles.viewRepliesButton} onPress={toggleReplies}>
            <Ionicons
              name={showReplies ? "chevron-up" : "chevron-down"}
              size={16}
              color="#1877f2"
            />
            <Text style={styles.viewRepliesText}>
              {showReplies ? "Ẩn" : "Xem"} {comment.replies.length} trả lời
            </Text>
          </TouchableOpacity>

          {/* Replies Container */}
          {showReplies && (
            <View style={[styles.repliesContainer, { maxWidth: "100%" }]}>
              {comment.replies.map((reply, index) => (
                <CommentItem
                  key={`${reply._id}-${index}`}
                  comment={reply}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  level={level + 1}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// Main Comment System Component
const CommentSystem: React.FC<CommentSystemProps> = ({
  targetType,
  targetId,
  useScrollView = false,
  onCommentAdded,
  onCommentDeleted,
  onCommentEdited,
  mode = 'inline',
  maxHeight = 400,
  showHeader = false,
  onClose,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);

  // Ensure comments is always an array
  const safeComments = comments || [];
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showReplyInput, setShowReplyInput] = useState(false);

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  
  // Safe area and header height hooks
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Comment>>(null);
  const fetchingRef = useRef(false);

  const fetchComments = useCallback(async (pageNum = 1, refresh = false) => {
    if (fetchingRef.current && !refresh) return; // Prevent multiple simultaneous requests
    
    fetchingRef.current = true;
    setLoading(true);
    try {
      const response = await commentService.getComments(
        targetType,
        targetId,
        pageNum,
        10,
        5
      );
      // Handle nested response format from backend
      let newComments: Comment[] = [];
      const responseData = response as any;
      if (responseData?.data?.data) {
        // Backend returns: { data: { data: [...], pagination: {...} } }
        newComments = Array.isArray(responseData.data.data)
          ? responseData.data.data
          : [];
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        // Direct array format
        newComments = responseData.data;
      } else if (Array.isArray(responseData)) {
        // Fallback
        newComments = responseData;
      }
      
      console.log('Comments parsed successfully:', newComments.length, 'comments');

      if (refresh) {
        setComments(newComments);
      } else {
        setComments((prev) => [...prev, ...newComments]);
      }

      setHasMore(newComments.length === 10);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching comments:", error);
      // Set empty array on error to prevent undefined issues
      if (refresh) {
        setComments([]);
      }
    } finally {
      fetchingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [targetType, targetId]); // Remove 'loading' from dependencies to prevent infinite loop

  useEffect(() => {
    fetchComments(1, true);
  }, [targetType, targetId, fetchComments]); // Only run when target changes

  const handleRefresh = () => {
    setRefreshing(true);
    fetchComments(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchComments(page + 1, false);
    }
  };

  const handleCommentAdded = (newComment: Comment) => {
    setComments((prev) => [newComment, ...(prev || [])]);
    onCommentAdded?.(newComment);
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments((prev) =>
      (prev || []).filter((comment) => comment._id !== commentId)
    );
    onCommentDeleted?.(commentId);
  };

  const handleCommentEdited = (editedComment: Comment) => {
    setComments((prev) =>
      (prev || []).map((comment) =>
        comment._id === editedComment._id ? editedComment : comment
      )
    );
    onCommentEdited?.(editedComment);
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    setShowReplyInput(true);
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <CommentItem
      comment={item}
      currentUserId={currentUser?.id || ""}
      onReply={handleReply}
      onEdit={handleCommentEdited}
      onDelete={handleCommentDeleted}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (loading && safeComments.length > 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      );
    }
    return null;
  };

  // Dynamic styles based on mode
  const containerStyle = mode === 'modal' 
    ? [styles.container, styles.modalContainer]
    : [styles.container, styles.inlineContainer, { maxHeight }];

  const commentsListStyle = mode === 'modal'
    ? [styles.commentsList, styles.modalCommentsList]
    : [styles.commentsList, styles.inlineCommentsList];

  const headerHeight = useHeaderHeight?.() ?? 0;

  // Keyboard offset based on mode and safe area
  const keyboardOffset =
  Platform.OS === 'ios'
    ? (mode === 'modal' ? 12 : headerHeight + insets.top) 
    : 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? keyboardOffset : 0}
    >
      <View style={containerStyle}>
        {/* Header for modal mode */}
        {showHeader && mode === 'modal' && (
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              Bình luận ({safeComments.length})
            </Text>
          </View>
        )}

        <View style={commentsListStyle}>
          {useScrollView ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              keyboardShouldPersistTaps="handled"
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                />
              }
              onScroll={({ nativeEvent }: any) => {
                const { layoutMeasurement, contentOffset, contentSize } =
                  nativeEvent;
                const paddingToBottom = 20;
                if (
                  layoutMeasurement.height + contentOffset.y >=
                  contentSize.height - paddingToBottom
                ) {
                  handleLoadMore();
                }
              }}
              scrollEventThrottle={400}
              style={{ flex: 1 }}
              contentContainerStyle={[styles.scrollViewContent, { paddingBottom: 120 }]}
            >
              {safeComments.length === 0 ? (
                renderEmptyState()
              ) : (
                <>
                  {safeComments.map((comment) => (
                    <View key={comment._id}>
                      {renderComment({ item: comment })}
                    </View>
                  ))}
                  {renderFooter()}
                </>
              )}
            </ScrollView>
          ) : (
            <FlatList
              ref={listRef}
              data={safeComments}
              renderItem={renderComment}
              keyExtractor={(item) => item._id}
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              keyboardShouldPersistTaps="handled"
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                />
              }
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.1}
              ListEmptyComponent={renderEmptyState}
              ListFooterComponent={renderFooter}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
              contentContainerStyle={[styles.flatListContent, { paddingBottom: 120 }]}
            />
          )}
        </View>

        {showReplyInput && replyingTo && (
          <CommentInput
            targetType={targetType}
            targetId={targetId}
            parentCommentId={replyingTo}
            onCommentAdded={(newReply) => {
              console.log('Reply added in CommentSystem:', newReply);
              // Add the reply to the parent comment
              setComments(prev => prev.map(comment => {
                if (comment._id === replyingTo) {
                  const updatedComment = {
                    ...comment,
                    replies: [...(comment.replies || []), newReply]
                  };
                  console.log('Updated comment with reply in CommentSystem:', updatedComment);
                  return updatedComment;
                }
                return comment;
              }));
              setShowReplyInput(false);
              setReplyingTo(null);
              onCommentAdded?.(newReply);
            }}
            onCancel={() => {
              setShowReplyInput(false);
              setReplyingTo(null);
            }}
            placeholder="Viết reply..."
          />
        )}

        {/* Main Comment Input - Only show when not replying */}
        {!showReplyInput && (
          <CommentInput
            targetType={targetType}
            targetId={targetId}
            onCommentAdded={handleCommentAdded}
            onFocus={() => {
              requestAnimationFrame(() => {
                // Scroll to end when input is focused
                if (listRef.current) {
                  listRef.current.scrollToEnd({ animated: true });
                }
              });
            }}
          />
        )}
        
        {/* Safe area spacer for iOS home indicator */}
        <View style={{ height: insets.bottom }} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalContainer: {
    flex: 1,
  },
  inlineContainer: {
    flex: 0, // Don't expand in inline mode
  },
  commentsList: {
    backgroundColor: "#f8f9fa",
  },
  modalCommentsList: {
    flex: 1, // Take full available space in modal
  },
  inlineCommentsList: {
    maxHeight: 300, // Keep original maxHeight for inline
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  inputContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    flexWrap: "nowrap",
  },
  replyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  replyLabel: {
    fontSize: 12,
    color: "#666",
  },
  addCommentButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
  },
  addCommentButtonText: {
    fontSize: 12,
    color: Colors.light.tint,
    fontWeight: "500",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: "#fff",
    fontSize: 14,
  },
  inputActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "nowrap", // Prevent wrapping
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    fontSize: 14,
    color: "#666",
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0, // Prevent shrinking
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  commentContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  defaultAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  defaultAvatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  commentInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: "row",
    gap: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: "#666",
  },
  editContainer: {
    marginBottom: 8,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    minHeight: 40,
    maxHeight: 100,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  repliesSection: {
    marginTop: 8,
  },
  viewRepliesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 4,
    borderRadius: 4,
    backgroundColor: '#f8f9fa',
  },
  viewRepliesText: {
    fontSize: 12,
    color: '#1877f2',
    fontWeight: '500',
    marginLeft: 4,
  },
  repliesContainer: {
    marginTop: 8,
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
});

// Modal wrapper for CommentSystem
export const CommentModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  targetType: 'promptResponse' | 'memory' | 'healthRecord' | 'growthRecord' | 'comment';
  targetId: string;
  onCommentAdded?: (comment: Comment) => void;
  onCommentDeleted?: (commentId: string) => void;
  onCommentEdited?: (comment: Comment) => void;
}> = ({ visible, onClose, targetType, targetId, onCommentAdded, onCommentDeleted, onCommentEdited }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <CommentSystem
        targetType={targetType}
        targetId={targetId}
        mode="modal"
        showHeader={true}
        onClose={onClose}
        onCommentAdded={onCommentAdded}
        onCommentDeleted={onCommentDeleted}
        onCommentEdited={onCommentEdited}
        useScrollView={true}
      />
    </Modal>
  );
};

export default CommentSystem;
