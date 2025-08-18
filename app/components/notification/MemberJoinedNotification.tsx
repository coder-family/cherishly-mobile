import { API_BASE_URL } from '@env';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useMemberInfoModal } from '../../hooks/useMemberInfoModal';
import { useThemeColor } from '../../hooks/useThemeColor';
import { deleteNotification } from '../../redux/slices/notificationSlice';
import { PopulatedNotification } from '../../services/notificationService';
import MemberInfoModal from '../family/MemberInfoModal';
import Avatar from '../ui/Avatar';

interface MemberJoinedNotificationProps {
  notification: PopulatedNotification;
  onPress?: (notification: PopulatedNotification) => void;
}

export default function MemberJoinedNotification({
  notification,
  onPress,
}: MemberJoinedNotificationProps) {
  const dispatch = useDispatch();
  const primaryColor = useThemeColor({}, 'primary');
  const {
    isVisible,
    memberInfo,
    showMemberInfo,
    hideMemberInfo,
    handleViewProfile,
    handleSendMessage,
  } = useMemberInfoModal();

  // Xử lý avatar URL
  const getAvatarUrl = () => {
    let avatarUrl = notification.sender?.avatar;
    
    if (avatarUrl && !avatarUrl.startsWith('http')) {
      // Nếu avatar URL không bắt đầu bằng http, thêm base URL
      const baseUrl = API_BASE_URL || 'https://growing-together-app.onrender.com/api';
      avatarUrl = `${baseUrl}/${avatarUrl.replace(/^\//, '')}`;
    }
    return avatarUrl;
  };

  const handleNotificationPress = () => {
    // Gọi callback gốc trước để mark as read
    onPress?.(notification);
    
    // Nếu là thông báo thành viên mới, hiển thị modal
    if (notification.type === 'member_joined' && notification.sender) {
      showMemberInfo(notification.sender._id);
    }
  };

  const handleDelete = () => {
    dispatch(deleteNotification(notification._id) as any);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !notification.isRead && {
            backgroundColor: `${primaryColor}10`,
            borderLeftColor: primaryColor,
            borderLeftWidth: 3,
          }
        ]}
        onPress={handleNotificationPress}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Avatar
            uri={getAvatarUrl()}
            size={40}
          />
          <View style={styles.iconOverlay}>
            <MaterialIcons 
              name="person-add" 
              size={12} 
              color="white" 
            />
          </View>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.message}>{notification.message}</Text>
          <View style={styles.metaContainer}>
            <Text style={styles.time}>
              {new Date(notification.createdAt).toLocaleDateString('vi-VN')}
            </Text>
            {!notification.isRead && (
              <View style={[styles.unreadDot, { backgroundColor: primaryColor }]} />
            )}
          </View>
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-outline" size={20} color="#666" />
          </TouchableOpacity>
          
          <View style={styles.arrowContainer}>
            <MaterialIcons 
              name="chevron-right" 
              size={20} 
              color="#ccc" 
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* Member Info Modal */}
      <MemberInfoModal
        visible={isVisible}
        onClose={hideMemberInfo}
        member={memberInfo}
        onViewProfile={handleViewProfile}
        onSendMessage={handleSendMessage}
      />
    </>
  );
}

const styles = StyleSheet.create({
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  iconOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#4f8cff',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 4,
    marginRight: 8,
  },
  arrowContainer: {
    padding: 4,
  },
});
