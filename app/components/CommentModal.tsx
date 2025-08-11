import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Colors } from '../constants/Colors';
import { RootState } from '../redux/store';
import { commentService } from '../services/commentService';

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
  targetType: 'promptResponse' | 'memory' | 'healthRecord' | 'growthRecord' | 'comment';
  targetId: string;
  user: User;
  parentComment?: string | null;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  targetType: 'promptResponse' | 'memory' | 'healthRecord' | 'growthRecord' | 'comment';
  targetId: string;
  onCommentAdded?: (comment: Comment) => void;
  onCommentDeleted?: (commentId: string) => void;
  onCommentEdited?: (comment: Comment) => void;
}

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
  const [showReplies, setShowReplies] = useState(false);

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
      console.error('Error updating comment:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật bình luận. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Xóa bình luận',
      'Bạn có chắc chắn muốn xóa bình luận này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await commentService.deleteComment(comment._id);
              onDelete(comment._id);
            } catch (error) {
              console.error('Error deleting comment:', error);
              Alert.alert('Lỗi', 'Không thể xóa bình luận. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays > 0) {
      return `${diffInDays} ngày trước`;
    } else if (diffInHours > 0) {
      return `${diffInHours} giờ trước`;
    } else {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      if (diffInMinutes > 0) {
        return `${diffInMinutes} phút trước`;
      } else {
        return 'Vừa xong';
      }
    }
  };

  const isOwner = comment.user?._id === currentUserId;
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <View style={[styles.commentContainer, { marginLeft: level * 20 }]}>
      <View style={styles.commentHeader}>
        <View style={styles.avatarContainer}>
          {comment.user?.avatar ? (
            <Image source={{ uri: comment.user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.defaultAvatar}>
              <Text style={styles.defaultAvatarText}>
                {comment.user?.firstName?.charAt(0) || 'U'}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.commentInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>
              {comment.user?.firstName || 'Unknown'} {comment.user?.lastName || ''}
            </Text>
            {isOwner && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#1877f2" />
              </View>
            )}
          </View>
          
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.editInput}
                value={editContent}
                onChangeText={setEditContent}
                multiline
                maxLength={1000}
              />
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.cancelEditButton}
                  onPress={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                >
                  <Text style={styles.cancelEditButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveEditButton, (!editContent.trim() || loading) && styles.saveEditButtonDisabled]}
                  onPress={handleEdit}
                  disabled={!editContent.trim() || loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveEditButtonText}>Lưu</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.commentContent}>{comment.content}</Text>
              <View style={styles.commentActions}>
                <Text style={styles.timestamp}>{formatDate(comment.createdAt)}</Text>
                <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
                  <Text style={styles.actionText}>Thích</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleReply}>
                  <Text style={styles.actionText}>Trả lời</Text>
                </TouchableOpacity>
                {isOwner && (
                  <>
                    <TouchableOpacity style={styles.actionButton} onPress={() => setIsEditing(true)}>
                      <Text style={styles.actionText}>Sửa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
                      <Text style={styles.actionText}>Xóa</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </>
          )}
        </View>
      </View>

      {hasReplies && (
        <View style={styles.repliesContainer}>
          {showReplies ? (
            comment.replies?.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                currentUserId={currentUserId}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                level={level + 1}
              />
            ))
          ) : (
            <TouchableOpacity
              style={styles.viewRepliesButton}
              onPress={() => setShowReplies(true)}
            >
              <Text style={styles.viewRepliesText}>
                Xem {comment.replies?.length} phản hồi
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

// Main Comment Modal Component
const CommentModal: React.FC<CommentModalProps> = ({
  visible,
  onClose,
  targetType,
  targetId,
  onCommentAdded,
  onCommentDeleted,
  onCommentEdited,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyComment, setReplyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const fetchComments = async (pageNum = 1, refresh = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await commentService.getComments(targetType, targetId, pageNum, 10);
      
      // Handle nested response format from backend
      let newComments: Comment[] = [];
      const responseData = response as any;
      if (responseData?.data?.data) {
        // Backend returns: { data: { data: [...], pagination: {...} } }
        newComments = Array.isArray(responseData.data.data) ? responseData.data.data : [];
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        // Direct array format
        newComments = responseData.data;
      } else if (Array.isArray(responseData)) {
        // Fallback
        newComments = responseData;
      }
      
      if (refresh) {
        setComments(newComments);
      } else {
        setComments(prev => [...prev, ...newComments]);
      }
      
      setHasMore(newComments.length === 10);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching comments:', error);
      if (refresh) {
        setComments([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchComments(1, true);
    }
  }, [visible, fetchComments]);

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
    setComments(prev => [newComment, ...prev]);
    onCommentAdded?.(newComment);
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment._id !== commentId));
    onCommentDeleted?.(commentId);
  };

  const handleCommentEdited = (editedComment: Comment) => {
    setComments(prev => prev.map(comment => 
      comment._id === editedComment._id ? editedComment : comment
    ));
    onCommentEdited?.(editedComment);
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    setShowReplyInput(true);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const comment = await commentService.createComment({
        content: newComment.trim(),
        targetType: targetType as any,
        targetId,
        parentCommentId: null, // Main comment
      });

      setNewComment('');
      handleCommentAdded(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
      Alert.alert('Lỗi', 'Không thể tạo bình luận. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyComment.trim() || submitting || !replyingTo) return;
    setSubmitting(true);
    try {
      const comment = await commentService.createComment({
        content: replyComment.trim(),
        targetType: targetType as any,
        targetId,
        parentCommentId: replyingTo,
      });
      setReplyComment('');
      // Refresh comments to show the new reply
      fetchComments(1, true); // Changed from handleCommentAdded(comment)
      setShowReplyInput(false);
      setReplyingTo(null);
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể tạo bình luận. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <CommentItem
      comment={item}
      currentUserId={currentUser?.id || ''}
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
    if (loading && comments.length > 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ flex: 1, alignItems: 'center' }}
            activeOpacity={1}
            onPress={() => {
              // Close reply input when tapping on header title
              if (showReplyInput) {
                setShowReplyInput(false);
                setReplyingTo(null);
                setReplyComment('');
              }
            }}
          >
            <Text style={styles.headerTitle}>
              Bình luận ({comments.length})
            </Text>
          </TouchableOpacity>
          <View style={styles.headerSpacer} />
        </View>

        {/* Comments List */}
        <View style={styles.commentsList}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => {
              // Close reply input when tapping on comments list
              if (showReplyInput) {
                setShowReplyInput(false);
                setReplyingTo(null);
                setReplyComment('');
              }
            }}
          >
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item._id || Math.random().toString()}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.1}
              ListEmptyComponent={renderEmptyState}
              ListFooterComponent={renderFooter}
              showsVerticalScrollIndicator={false}
              scrollEnabled={true}
            />
          </TouchableOpacity>
        </View>

        {/* Reply Input */}
        {showReplyInput && replyingTo && (
          <View style={styles.replyInputContainer}>
            <Text style={styles.replyLabel}>Trả lời bình luận</Text>
            <View style={styles.replyInputRow}>
              <TextInput
                style={styles.replyInput}
                value={replyComment}
                onChangeText={setReplyComment}
                placeholder="Viết reply..."
                placeholderTextColor="#999"
                multiline
                maxLength={1000}
                onBlur={() => {
                  // Auto-hide reply input when user taps outside
                  setTimeout(() => {
                    setShowReplyInput(false);
                    setReplyingTo(null);
                    setReplyComment('');
                  }, 100);
                }}
              />
              <TouchableOpacity
                style={[styles.replySubmitButton, (!replyComment.trim() || submitting) && styles.replySubmitButtonDisabled]}
                onPress={handleSubmitReply}
                disabled={!replyComment.trim() || submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.cancelReplyButton}
              onPress={() => {
                setShowReplyInput(false);
                setReplyingTo(null);
                setReplyComment('');
              }}
            >
              <Text style={styles.cancelReplyButtonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Comment Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <View style={styles.userAvatarContainer}>
              {(currentUser as any)?.avatar ? (
                <Image source={{ uri: (currentUser as any).avatar }} style={styles.userAvatar} />
              ) : (
                <View style={styles.defaultUserAvatar}>
                  <Text style={styles.defaultUserAvatarText}>
                    {(currentUser as any)?.firstName?.charAt(0) || 'U'}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.mainInput}
                value={newComment}
                onChangeText={setNewComment}
                placeholder={`Bình luận dưới tên ${currentUser?.firstName || 'Bạn'}`}
                placeholderTextColor="#999"
                multiline
                maxLength={1000}
              />
            </View>
            
            <TouchableOpacity
              style={[styles.submitButton, (!newComment.trim() || submitting) && styles.submitButtonDisabled]}
              onPress={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  headerSpacer: {
    width: 40,
  },
  commentsList: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  commentContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  commentInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    color: '#333',
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
  },
  editContainer: {
    marginBottom: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelEditButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelEditButtonText: {
    fontSize: 14,
    color: '#666',
  },
  saveEditButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  saveEditButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveEditButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  repliesContainer: {
    marginTop: 8,
  },
  viewRepliesButton: {
    paddingVertical: 8,
  },
  viewRepliesText: {
    fontSize: 12,
    color: '#1877f2',
    fontWeight: '500',
  },
  replyInputContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  replyLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  replyInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  replySubmitButton: {
    backgroundColor: Colors.light.tint,
    padding: 12,
    borderRadius: 6,
  },
  replySubmitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  cancelReplyButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  cancelReplyButtonText: {
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  userAvatarContainer: {
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  defaultUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultUserAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  inputWrapper: {
    flex: 1,
  },
  mainInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    padding: 12,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#f8f9fa',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
    padding: 12,
    borderRadius: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});

export default CommentModal; 