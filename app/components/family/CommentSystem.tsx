import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Comment {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  updatedAt?: string;
}

interface CommentSystemProps {
  postId: string;
  comments?: Comment[];
  onAddComment?: (content: string) => void;
  onEditComment?: (commentId: string, content: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onReplyComment?: (commentId: string, content: string) => void;
  currentUserId?: string;
}

export default function CommentSystem({ 
  postId, 
  comments = [], 
  onAddComment, 
  onEditComment, 
  onDeleteComment, 
  onReplyComment,
  currentUserId 
}: CommentSystemProps) {
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmitComment = () => {
    if (!newComment.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung bình luận');
      return;
    }
    
    onAddComment?.(newComment.trim());
    setNewComment('');
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung bình luận');
      return;
    }
    
    onEditComment?.(editingCommentId!, editContent.trim());
    setEditingCommentId(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa bình luận này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: () => onDeleteComment?.(commentId) }
      ]
    );
  };

  const handleReply = (commentId: string) => {
    setReplyingToCommentId(commentId);
    setReplyContent('');
  };

  const handleSubmitReply = () => {
    if (!replyContent.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung trả lời');
      return;
    }
    
    onReplyComment?.(replyingToCommentId!, replyContent.trim());
    setReplyingToCommentId(null);
    setReplyContent('');
  };

  const handleCancelReply = () => {
    setReplyingToCommentId(null);
    setReplyContent('');
  };

  const renderComment = ({ item: comment }: { item: Comment }) => {
    const isOwnComment = currentUserId === comment.userId;
    const isEditing = editingCommentId === comment.id;
    const isReplying = replyingToCommentId === comment.id;

    return (
      <View style={styles.commentItem}>
        <View style={styles.commentHeader}>
          <View style={styles.commentUserInfo}>
            {comment.userAvatar ? (
              <Image source={{ uri: comment.userAvatar }} style={styles.userAvatar} />
            ) : (
              <View style={styles.userAvatarPlaceholder}>
                <MaterialIcons name="person" size={16} color="#fff" />
              </View>
            )}
            <View style={styles.commentUserDetails}>
              <Text style={styles.userName}>{comment.userName}</Text>
              <Text style={styles.commentDate}>
                {new Date(comment.createdAt).toLocaleDateString()} • {new Date(comment.createdAt).toLocaleTimeString()}
              </Text>
            </View>
          </View>
          
          {isOwnComment && (
            <View style={styles.commentActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEditComment(comment)}
              >
                <MaterialIcons name="edit" size={16} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteComment(comment.id)}
              >
                <MaterialIcons name="delete" size={16} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              value={editContent}
              onChangeText={setEditContent}
              placeholder="Chỉnh sửa bình luận..."
              multiline
            />
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.commentContent}>{comment.content}</Text>
        )}

        {!isEditing && (
          <TouchableOpacity
            style={styles.replyButton}
            onPress={() => handleReply(comment.id)}
          >
            <MaterialIcons name="reply" size={14} color="#666" />
            <Text style={styles.replyButtonText}>Trả lời</Text>
          </TouchableOpacity>
        )}

        {isReplying && (
          <View style={styles.replyContainer}>
            <TextInput
              style={styles.replyInput}
              value={replyContent}
              onChangeText={setReplyContent}
              placeholder="Viết trả lời..."
              multiline
            />
            <View style={styles.replyActions}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSubmitReply}>
                <Text style={styles.saveButtonText}>Gửi</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelReply}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Comment Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.commentInput}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Viết bình luận..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.submitButton, !newComment.trim() && styles.submitButtonDisabled]}
          onPress={handleSubmitComment}
          disabled={!newComment.trim()}
        >
          <MaterialIcons name="send" size={20} color={newComment.trim() ? "#4f8cff" : "#ccc"} />
        </TouchableOpacity>
      </View>

      {/* Comments List */}
      {comments.length > 0 && (
        <View style={styles.commentsContainer}>
          <Text style={styles.commentsTitle}>Bình luận ({comments.length})</Text>
          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            style={styles.commentsList}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    marginRight: 8,
  },
  submitButton: {
    padding: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  commentsContainer: {
    padding: 16,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  commentsList: {
    maxHeight: 300,
  },
  commentItem: {
    marginBottom: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  userAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4f8cff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  commentUserDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  commentDate: {
    fontSize: 12,
    color: '#666',
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginLeft: 40,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 40,
  },
  replyButtonText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  editContainer: {
    marginLeft: 40,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    minHeight: 60,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  saveButton: {
    backgroundColor: '#4f8cff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 12,
  },
  replyContainer: {
    marginLeft: 40,
    marginTop: 8,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    minHeight: 60,
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
}); 