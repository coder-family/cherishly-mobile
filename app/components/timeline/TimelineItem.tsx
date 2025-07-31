import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import MemoryMediaViewer from '../child/MemoryMediaViewer';
import Avatar from '../ui/Avatar';

export interface TimelineItemData {
  id: string;
  type: 'memory' | 'qa' | 'health' | 'growth';
  title: string;
  content: string;
  date: string;
  createdAt: string;
  childId: string;
  childName?: string;
  media?: any[];
  metadata?: any;
  creator?: any; // Add creator info for memory items
}

interface TimelineItemProps {
  item: TimelineItemData;
  onPress?: (item: TimelineItemData) => void;
  onEdit?: (item: TimelineItemData) => void;
  onDelete?: (item: TimelineItemData) => void;
  onLike?: (item: TimelineItemData) => void;
  onComment?: (item: TimelineItemData) => void;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ 
  item, 
  onPress, 
  onEdit, 
  onDelete, 
  onLike, 
  onComment 
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBackground = useThemeColor({}, 'card');
  
  const getTypeIcon = () => {
    switch (item.type) {
      case 'memory':
        return 'photo-library';
      case 'qa':
        return 'question-answer';
      case 'health':
        return 'local-hospital';
      case 'growth':
        return 'trending-up';
      default:
        return 'event';
    }
  };
  
  const getTypeColor = () => {
    switch (item.type) {
      case 'memory':
        return '#4CAF50';
      case 'qa':
        return '#2196F3';
      case 'health':
        return '#FF9800';
      case 'growth':
        return '#9C27B0';
      default:
        return '#757575';
    }
  };
  
  const getTypeLabel = () => {
    switch (item.type) {
      case 'memory':
        return 'Memory';
      case 'qa':
        return 'Q&A';
      case 'health':
        return 'Health';
      case 'growth':
        return 'Growth';
      default:
        return 'Item';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Reset time to start of day for accurate day comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffTime = today.getTime() - itemDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatTimeAgo = (dateString: string) => {
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
  
  const handlePress = () => {
    if (onPress) {
      onPress(item);
    }
  };

  const getCreatorName = () => {
    if (item.creator) {
      return item.creator.firstName + (item.creator.lastName ? ` ${item.creator.lastName}` : '');
    }
    return 'Người dùng';
  };

  // Special rendering for memory items - use MemoryItem-like layout
  if (item.type === 'memory') {
    return (
      <View style={styles.memoryContainer}>
        {/* Post Header */}
        <View style={styles.memoryHeader}>
          <View style={styles.userInfo}>
            <Avatar uri={item.creator?.avatar} size={36} style={styles.profilePicture} />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{getCreatorName()}</Text>
              <Text style={styles.timestamp}>{formatTimeAgo(item.createdAt)}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.optionsButton}>
            <MaterialIcons name="more-horiz" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Post Content */}
        <View style={styles.memoryContent}>
          {item.title && (
            <Text style={styles.memoryTitle} numberOfLines={2}>
              {item.title}
            </Text>
          )}
          
          <Text style={styles.memoryDescription}>
            {item.content}
          </Text>
          
          {/* Media Attachments */}
          {item.media && item.media.length > 0 && (
            <MemoryMediaViewer attachments={item.media} />
          )}

          {/* Tags */}
          {item.metadata?.tags && item.metadata.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.metadata.tags.map((tag: string) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Interaction Bar */}
        <View style={styles.interactionBar}>
          <View style={styles.leftActions}>
            <TouchableOpacity 
              style={styles.memoryActionButton}
              onPress={() => onLike?.(item)}
            >
              <MaterialIcons name="favorite-border" size={20} color="#666" />
              <Text style={styles.actionText}>Thích</Text>
            </TouchableOpacity>
            
            <View style={styles.likeCount}>
              <MaterialIcons name="favorite" size={16} color="#ff4757" />
              <Text style={styles.likeCountText}>6</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.memoryActionButton}
              onPress={() => onComment?.(item)}
            >
              <MaterialIcons name="chat-bubble-outline" size={20} color="#666" />
              <Text style={styles.actionText}>Bình luận</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.rightActions}>
            <View style={styles.otherUsers}>
              <View style={styles.smallProfilePicture}>
                <MaterialIcons name="person" size={12} color="#fff" />
              </View>
              <Text style={styles.otherUsersText}>+5</Text>
            </View>
            
            {(onEdit || onDelete) && (
              <View style={styles.memoryActions}>
                {onEdit && (
                  <TouchableOpacity
                    style={styles.memoryActionButtonIcon}
                    onPress={() => onEdit(item)}
                    hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                  >
                    <MaterialIcons name="edit" size={16} color="#4f8cff" />
                  </TouchableOpacity>
                )}
                {onDelete && (
                  <TouchableOpacity
                    style={styles.memoryActionButtonIcon}
                    onPress={() => onDelete(item)}
                    hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                  >
                    <MaterialIcons name="delete" size={16} color="#ff4757" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }

  // Special rendering for Q&A items
  if (item.type === 'qa') {
    return (
      <TouchableOpacity
        style={[styles.container, { backgroundColor: cardBackground }]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {/* Question Section */}
        <View style={styles.questionSection}>
          <View style={styles.questionHeader}>
            <MaterialIcons
              name="help-outline"
              size={20}
              color="#FF9800"
            />
            <Text style={styles.questionLabel}>
              Question
            </Text>
          </View>
          
          <Text style={[styles.questionText, { color: textColor }]} numberOfLines={3}>
            {item.metadata?.question || 'Question not available'}
          </Text>
        </View>

        {/* Answer Section */}
        <View style={styles.answerSection}>
          <View style={styles.answerHeader}>
            <MaterialIcons name="chat-bubble-outline" size={20} color="#2196F3" />
            <Text style={styles.answerLabel}>Answer</Text>
          </View>
          
          <Text style={[styles.answerText, { color: textColor }]} numberOfLines={4}>
            {item.content || 'No answer content'}
          </Text>

          {/* Media Preview */}
          {item.media && item.media.length > 0 && (
            <View style={styles.mediaSection}>
              <MemoryMediaViewer attachments={item.media} maxPreviewCount={3} />
            </View>
          )}
        </View>

        {/* Date */}
        <View style={styles.dateContainer}>
          <Text style={[styles.date, { color: textColor }]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>

        {/* Action buttons */}
        {(onEdit || onDelete) && (
          <View style={styles.actionButtons}>
            {onEdit && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: getTypeColor() }]}
                onPress={() => onEdit(item)}
              >
                <MaterialIcons name="edit" size={16} color="white" />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#ff4757' }]}
                onPress={() => onDelete(item)}
              >
                <MaterialIcons name="delete" size={16} color="white" />
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: cardBackground }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: getTypeColor() }]}>
          <MaterialIcons name={getTypeIcon()} size={20} color="white" />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.metaInfo}>
            <Text style={[styles.typeLabel, { color: getTypeColor() }]}>
              {getTypeLabel()}
            </Text>
            <Text style={[styles.date, { color: textColor }]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>
      
      {item.content && (
        <Text style={[styles.content, { color: textColor }]} numberOfLines={3}>
          {item.content}
        </Text>
      )}
      
      {/* Media Section - Sử dụng MemoryMediaViewer để đảm bảo tính thống nhất với MemoryItem */}
      {(() => {
        return item.media && item.media.length > 0 ? (
          <View style={styles.mediaSection}>
            <MemoryMediaViewer attachments={item.media} maxPreviewCount={3} />
          </View>
        ) : null;
      })()}
      
      {item.metadata && (
        <View style={styles.metadata}>
          {item.metadata.type && (
            <View style={[styles.tag, { backgroundColor: getTypeColor() + '20' }]}>
              <Text style={[styles.tagText, { color: getTypeColor() }]}>
                {item.metadata.type}
              </Text>
            </View>
          )}
          {item.metadata.location && (
            <View style={styles.locationContainer}>
              <MaterialIcons name="location-on" size={14} color="#666" />
              <Text style={[styles.locationText, { color: textColor }]} numberOfLines={1}>
                {typeof item.metadata.location === 'string' 
                  ? item.metadata.location 
                  : item.metadata.location.coordinates 
                    ? `${item.metadata.location.coordinates[1].toFixed(4)}, ${item.metadata.location.coordinates[0].toFixed(4)}`
                    : 'Location'
                }
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Action buttons */}
      {(onEdit || onDelete) && (
        <View style={styles.actionButtons}>
          {onEdit && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: getTypeColor() }]}
              onPress={() => onEdit(item)}
            >
              <MaterialIcons name="edit" size={16} color="white" />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#ff4757' }]}
              onPress={() => onDelete(item)}
            >
              <MaterialIcons name="delete" size={16} color="white" />
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  date: {
    fontSize: 12,
    opacity: 0.7,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  mediaSection: {
    marginTop: 8,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.7,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  // Q&A specific styles
  questionSection: {
    marginBottom: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 8,
  },
  answerSection: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  answerText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 12,
  },
  dateContainer: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  // New styles for memory item
  memoryContainer: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  optionsButton: {
    padding: 8,
  },
  memoryContent: {
    padding: 16,
  },
  memoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  memoryDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  memoryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
  },
  likeCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeCountText: {
    fontSize: 12,
    color: '#ff4757',
    fontWeight: '600',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  otherUsers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  smallProfilePicture: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4f8cff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otherUsersText: {
    fontSize: 12,
    color: '#666',
  },
  memoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  memoryActionButtonIcon: {
    padding: 8,
  },
});

export default TimelineItem; 