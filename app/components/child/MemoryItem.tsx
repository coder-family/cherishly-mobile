import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Memory } from '../../services/memoryService';
import { User } from '../../services/userService';
import Avatar from '../ui/Avatar';
import MemoryMediaViewer from './MemoryMediaViewer';

interface MemoryItemProps {
  memory: Memory;
  creator?: User;
  onPress?: (_memory: Memory) => void;
  onEdit?: (_memory: Memory) => void;
  onDelete?: (_memory: Memory) => void;
  onLike?: (_memory: Memory) => void;
  onComment?: (_memory: Memory) => void;
}

export default function MemoryItem({ 
  memory, 
  creator,
  onPress: _onPress, 
  onEdit, 
  onDelete, 
  onLike, 
  onComment 
}: MemoryItemProps) {
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

  const getCreatorName = () => {
    if (creator) {
      return creator.firstName + (creator.lastName ? ` ${creator.lastName}` : '');
    }
    return 'Người dùng';
  };

  const renderTags = () => {
    if (!memory.tags || memory.tags.length === 0) {
      return null;
    }

    return (
      <View style={styles.tagsContainer}>
        {memory.tags.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Post Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar uri={creator?.avatar} size={36} style={styles.profilePicture} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{getCreatorName()}</Text>
            <Text style={styles.timestamp}>{formatTimeAgo(memory.createdAt)}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.optionsButton}>
          <MaterialIcons name="more-horiz" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Post Content */}
      <View style={styles.content}>
        {memory.title && (
          <Text style={styles.title} numberOfLines={2}>
            {memory.title}
          </Text>
        )}
        
        <Text style={styles.description}>
          {memory.content}
        </Text>
        
        {/* Media Attachments */}
        {memory.attachments && memory.attachments.length > 0 && (
          <MemoryMediaViewer attachments={memory.attachments} />
        )}

        {renderTags()}
      </View>

      {/* Interaction Bar */}
      <View style={styles.interactionBar}>
        <View style={styles.leftActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onLike?.(memory)}
          >
            <MaterialIcons name="favorite-border" size={20} color="#666" />
            <Text style={styles.actionText}>Thích</Text>
          </TouchableOpacity>
          
          <View style={styles.likeCount}>
            <MaterialIcons name="favorite" size={16} color="#ff4757" />
            <Text style={styles.likeCountText}>6</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onComment?.(memory)}
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
                  style={styles.memoryActionButton}
                  onPress={() => onEdit(memory)}
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                >
                  <MaterialIcons name="edit" size={16} color="#4f8cff" />
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity
                  style={styles.memoryActionButton}
                  onPress={() => onDelete(memory)}
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
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
    color: '#666',
  },
  optionsButton: {
    padding: 4,
  },
  content: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    lineHeight: 22,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#4f8cff',
    fontWeight: '500',
  },
  interactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  likeCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  likeCountText: {
    fontSize: 12,
    color: '#ff4757',
    fontWeight: '600',
    marginLeft: 4,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  otherUsers: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  smallProfilePicture: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4f8cff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otherUsersText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  memoryActions: {
    flexDirection: 'row',
  },
  memoryActionButton: {
    padding: 4,
    marginLeft: 8,
  },
}); 