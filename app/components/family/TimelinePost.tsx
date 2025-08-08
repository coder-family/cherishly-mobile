import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CommentSystem from '../CommentSystem';
import MediaViewerBase from '../media/MediaViewerBase';
// import ReactionSystem from './ReactionSystem';
import { commentService } from '../../services/commentService';
import type { TargetType } from '../../services/reactionService';
import CommentModal from '../CommentModal';
import ReactionBar from '../ui/ReactionBar';

interface TimelinePostProps {
  post: any;
  onReactionPress?: (reactionType: string) => void;
  onCommentPress?: () => void;
}

export default function TimelinePost({ post, onReactionPress, onCommentPress }: TimelinePostProps) {
  const [showComments, setShowComments] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const contentType = (post.contentType || 'memory');
  
  const safeText = (text: any) => {
    if (typeof text === 'string') return text;
    if (typeof text === 'number') return text.toString();
    if (text && typeof text === 'object') {
      return JSON.stringify(text);
    }
    return '';
  };

  const mapContentTypeToTargetType = (ct: string): TargetType => {
    // Normalize the content type to handle both PascalCase and camelCase
    const normalizedCt = ct.toLowerCase();
    
    switch (normalizedCt) {
      case 'promptresponse':
        return 'PromptResponse';
      case 'growthrecord':
        return 'GrowthRecord';
      case 'healthrecord':
        return 'HealthRecord';
      case 'memory':
      default:
        return 'Memory';
    }
  };

  const mapContentTypeToCommentTargetType = (ct: string): 'promptResponse' | 'memory' | 'healthRecord' | 'growthRecord' | 'comment' => {
    // Normalize the content type to handle both PascalCase and camelCase
    const normalizedCt = ct.toLowerCase();
    
    switch (normalizedCt) {
      case 'promptresponse':
        return 'promptResponse';
      case 'growthrecord':
        return 'growthRecord';
      case 'healthrecord':
        return 'healthRecord';
      case 'memory':
      default:
        return 'memory';
    }
  };

  const renderPostContent = () => {
    const normalizedContentType = contentType.toLowerCase();
    switch (normalizedContentType) {
      case 'memory':
        return (
          <>
            {post.title && <Text style={styles.postTitle}>{safeText(post.title)}</Text>}
            {post.content && <Text style={styles.postText}>{safeText(post.content)}</Text>}
            {post.tags && post.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {post.tags.map((tag: string) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>#{safeText(tag)}</Text>
                  </View>
                ))}
              </View>
            )}
            {post.attachments && post.attachments.length > 0 && (
              <View style={styles.mediaContainer}>
                <MediaViewerBase
                  attachments={post.attachments}
                  maxPreviewCount={3}
                  onAttachmentPress={(attachment: any, index: number) => {
                  }}
                />
              </View>
            )}
          </>
        );
        
      case 'promptResponse':
        return (
          <>
            {post.promptId?.title && <Text style={styles.postTitle}>Q: {safeText(post.promptId.title)}</Text>}
            {post.promptId?.question && <Text style={styles.postText}>{safeText(post.promptId.question)}</Text>}
            {post.response && (
              <View style={[styles.responseContainer, { flexDirection: 'row', alignItems: 'center' }]}> 
                <Text style={styles.responseLabel}>Answer: </Text>
                <Text style={styles.responseText}>
                  {typeof post.response === 'object' && post.response.content 
                    ? safeText(post.response.content)
                    : safeText(post.response)
                  }
                </Text>
              </View>
            )}
            {post.attachments && post.attachments.length > 0 && (
              <View style={styles.attachmentsContainer}>
                {post.attachments.map((attachment: any, index: number) => (
                  <View key={index} style={styles.attachmentItem}>
                    {attachment.type === 'image' && (
                      <Image 
                        source={{ uri: attachment.url }} 
                        style={styles.attachmentImage}
                        resizeMode="cover"
                      />
                    )}
                  </View>
                ))}
              </View>
            )}
          </>
        );
        
      case 'growthRecord':
        return (
          <>
            <Text style={styles.postTitle}>{safeText(post.type)}</Text>
            <Text style={styles.postText}>
              {safeText(post.value)} {safeText(post.unit)}
            </Text>
            {post.notes && <Text style={styles.postText}>{safeText(post.notes)}</Text>}
          </>
        );
        
      case 'healthRecord':
        return (
          <>
            <Text style={styles.postTitle}>{safeText(post.title || post.type)}</Text>
            {post.description && <Text style={styles.postText}>{safeText(post.description)}</Text>}
            {post.attachments && post.attachments.length > 0 && (
              <View style={styles.mediaContainer}>
                <MediaViewerBase
                  attachments={post.attachments}
                  maxPreviewCount={3}
                  onAttachmentPress={(attachment: any, index: number) => {
                  }}
                />
              </View>
            )}
          </>
        );
        
      default:
        return (
          <>
            {post.title && <Text style={styles.postTitle}>{safeText(post.title)}</Text>}
            {post.content && <Text style={styles.postText}>{safeText(post.content)}</Text>}
          </>
        );
    }
  };

  const handleCommentPress = () => {
    setShowCommentModal(true);
    onCommentPress?.();
  };

  // Fetch comment count
  useEffect(() => {
    if (!post?.id) return;
    
    const fetchCommentCount = async () => {
      try {
        const targetType = mapContentTypeToCommentTargetType(contentType);
        const apiResponse = await commentService.getComments(targetType, post.id, 1, 1);
        
        // Handle nested response format from backend
        let total = 0;
        const responseData = apiResponse as any;
        if (responseData.data?.pagination?.total) {
          // Backend returns: { data: { pagination: { total: 5 } } }
          total = responseData.data.pagination.total;
        } else if (responseData.pagination?.total) {
          // Direct format
          total = responseData.pagination.total;
        }
        
        setCommentCount(total);
      } catch (error) {
        console.error('Error fetching comment count:', error);
        setCommentCount(0);
      }
    };

    fetchCommentCount();
  }, [post?.id, contentType]);

  return (
    <View style={styles.timelinePost}>
      <View style={styles.postHeader}>
        <View style={styles.postChildInfo}>
          {post.child?.avatar ? (
            <Image source={{ uri: post.child.avatar }} style={styles.postChildAvatar} />
          ) : (
            <View style={styles.postChildAvatarPlaceholder}>
              <MaterialIcons name="child-care" size={16} color="#4f8cff" />
            </View>
          )}
          <View style={styles.postChildDetails}>
            <Text style={styles.postChildName}>{safeText(post.child?.nickname || post.child?.firstName)}</Text>
            <Text style={styles.postDate}>
              {new Date(post.date || post.createdAt).toLocaleDateString()} • {new Date(post.date || post.createdAt).toLocaleTimeString()}
            </Text>
          </View>
        </View>
        <View style={styles.postTypeBadge}>
          <Text style={styles.postTypeText}>
            {contentType === 'promptResponse' ? 'Q&A' : 
             contentType === 'growthRecord' ? 'Growth' :
             contentType === 'healthRecord' ? 'Health' : contentType}
          </Text>
        </View>
      </View>
      <View style={styles.postContent}>
        {renderPostContent()}
        <View style={styles.actionRow}>
          {(post._id || post.id) && (
            <ReactionBar 
              targetType={mapContentTypeToTargetType(contentType)}
              targetId={post._id || post.id}
              onReactionChange={(type) => onReactionPress?.(type || '')}
            />
          )}
          <TouchableOpacity style={styles.actionButton} onPress={handleCommentPress}>
            <MaterialIcons name="chat-bubble-outline" size={24} color="#1877F2" />
            <Text style={styles.actionText}>
              {commentCount > 0 ? `${commentCount} bình luận` : 'Bình luận'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Comments Section */}
      {showComments && (
        <View style={styles.commentsSection}>
          <CommentSystem
            targetType={mapContentTypeToCommentTargetType(contentType)}
            targetId={post._id || post.id}
            useScrollView={true}
            onCommentAdded={(comment) => {
              // Comment added successfully
            }}
            onCommentDeleted={(commentId) => {
              // Comment deleted successfully
            }}
            onCommentEdited={(comment) => {
              // Comment edited successfully
            }}
          />
        </View>
      )}

      {/* Comment Modal */}
      {(post._id || post.id) && (
        <CommentModal
          visible={showCommentModal}
          onClose={() => setShowCommentModal(false)}
          targetType={mapContentTypeToCommentTargetType(contentType)}
          targetId={post._id || post.id}
          onCommentAdded={(comment) => {
            // Update comment count when comment is added
            setCommentCount(prev => prev + 1);
          }}
          onCommentDeleted={(commentId) => {
            // Update comment count when comment is deleted
            setCommentCount(prev => Math.max(0, prev - 1));
          }}
          onCommentEdited={(comment) => {
            // Comment edited successfully
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  timelinePost: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  postChildInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postChildAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postChildAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  postChildDetails: {
    flex: 1,
  },
  postChildName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  postDate: {
    fontSize: 12,
    color: '#666',
  },
  postTypeBadge: {
    backgroundColor: '#4f8cff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  postTypeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  postContent: {
    padding: 16,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  postText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    backgroundColor: "#e0e7ff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#4f8cff",
    fontWeight: "600",
  },
  responseContainer: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f0f7ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d0e3ff",
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  attachmentsContainer: {
    marginTop: 8,
  },
  attachmentItem: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
    overflow: "hidden",
  },
  attachmentImage: {
    width: "100%",
    height: "100%",
  },
  mediaContainer: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f0f7ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d0e3ff",
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d0e3ff',
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1877F2',
    fontWeight: 'bold',
  },
  commentsSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    maxHeight: 400,
  },
}); 