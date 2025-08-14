import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useThemeColor } from '../../hooks/useThemeColor';
import { deleteNotification, markNotificationAsRead } from '../../redux/slices/notificationSlice';
import { Notification } from '../../services/notificationService';
import { formatRelativeTime } from '../../utils/dateUtils';
import Avatar from '../ui/Avatar';

interface NotificationItemProps {
  notification: Notification;
  onPress?: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onPress 
}) => {
  const dispatch = useDispatch();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');

  // Guard against undefined/null notification
  if (!notification) {
    return null;
  }

  const handlePress = () => {
    // Mark as read if not already read
    if (!notification.isRead) {
      dispatch(markNotificationAsRead(notification._id) as any);
    }
    
    // Call onPress callback if provided
    if (onPress) {
      onPress(notification);
    }
  };

  const handleDelete = () => {
    dispatch(deleteNotification(notification._id) as any);
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'comment':
        return 'chatbubble-outline';
      case 'member_joined':
        return 'person-add-outline';
      case 'member_left':
        return 'person-remove-outline';
      case 'member_removed':
        return 'person-remove-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = () => {
    switch (notification.type) {
      case 'comment':
        return '#007AFF';
      case 'member_joined':
        return '#34C759';
      case 'member_left':
        return '#FF9500';
      case 'member_removed':
        return '#FF3B30';
      default:
        return primaryColor;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor,
          borderBottomColor: borderColor,
        },
        !notification.isRead && {
          backgroundColor: `${primaryColor}10`,
          borderLeftColor: primaryColor,
          borderLeftWidth: 3,
        }
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
                  <Avatar
          size={40}
          uri={typeof notification.sender === 'object' ? notification.sender.avatar : undefined}
        />
          <View style={[styles.iconContainer, { backgroundColor: getNotificationColor() }]}>
            <Ionicons name={getNotificationIcon() as any} size={12} color="white" />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
            {notification.title}
          </Text>
          {typeof notification.sender === 'object' && notification.sender && (
            <Text style={[styles.sender, { color: textColor }]} numberOfLines={1}>
              {notification.sender.firstName} {notification.sender.lastName}
            </Text>
          )}
          <Text style={[styles.message, { color: textColor }]} numberOfLines={2}>
            {notification.message}
          </Text>
          <View style={styles.metaContainer}>
            <Text style={[styles.time, { color: textColor }]}>
              {formatRelativeTime(notification.createdAt)}
            </Text>
            {!notification.isRead && (
              <View style={[styles.unreadDot, { backgroundColor: primaryColor }]} />
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-outline" size={20} color={textColor} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  iconContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sender: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
    opacity: 0.7,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    opacity: 0.8,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 12,
    opacity: 0.6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  deleteButton: {
    padding: 4,
  },
});

export default NotificationItem;
