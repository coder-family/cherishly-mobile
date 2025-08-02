import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import MediaViewerBase from '../media/MediaViewerBase';
import CommentButton from './CommentButton';
import ReactionSystem from './ReactionSystem';

interface TimelinePostProps {
  post: any;
  onReactionPress?: (reactionType: string) => void;
  onCommentPress?: () => void;
}

export default function TimelinePost({ post, onReactionPress, onCommentPress }: TimelinePostProps) {
  const contentType = post.contentType || 'memory';
  
  const safeText = (text: any) => {
    if (typeof text === 'string') return text;
    if (typeof text === 'number') return text.toString();
    if (text && typeof text === 'object') {
      console.log('Attempting to render object as text:', text);
      return JSON.stringify(text);
    }
    return '';
  };

  const renderPostContent = () => {
    switch (contentType) {
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
                    console.log('Memory attachment pressed:', attachment, index);
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
                    console.log('Health record attachment pressed:', attachment, index);
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
          <ReactionSystem 
            postId={post._id || post.id}
            onReactionPress={onReactionPress}
          />
          <CommentButton onPress={onCommentPress} />
        </View>
      </View>
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
}); 