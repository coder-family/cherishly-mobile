import { API_BASE_URL } from '@env';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { getUser } from '../services/userService';

interface MemberInfo {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string | undefined;
  avatar?: string;
  role?: string;
  joinedAt?: string;
}

export const useMemberInfoModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);

  const showMemberInfo = useCallback(async (memberId: string) => {
    try {
      // Lấy thông tin chi tiết từ API
      const userData = await getUser(memberId);
      
      // Xử lý avatar URL
      let avatarUrl = userData.avatar;
      if (avatarUrl && !avatarUrl.startsWith('http')) {
        // Nếu avatar URL không bắt đầu bằng http, thêm base URL
        const baseUrl = API_BASE_URL || 'https://growing-together-app.onrender.com/api';
        avatarUrl = `${baseUrl}/${avatarUrl.replace(/^\//, '')}`;
      }
      
      const memberData: MemberInfo = {
        _id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName || '',
        email: userData.email,
        avatar: avatarUrl,
        role: 'member', // Default role, có thể cập nhật sau
        joinedAt: new Date().toISOString(), // Có thể lấy từ API sau
      };
      
      setMemberInfo(memberData);
      setIsVisible(true);
    } catch (error: any) {
      console.error('Error fetching member info:', error);
      Alert.alert(
        'Lỗi',
        'Không thể tải thông tin thành viên. Vui lòng thử lại sau.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  const hideMemberInfo = useCallback(() => {
    setIsVisible(false);
    setMemberInfo(null);
  }, []);

  const handleViewProfile = useCallback(() => {
    if (memberInfo?._id) {
      hideMemberInfo();
      // Navigate to user profile (if implemented)
      // router.push(`/user/${memberInfo._id}/profile`);
      // For now, show an alert
      Alert.alert('Thông báo', 'Tính năng xem hồ sơ sẽ được phát triển sau');
    }
  }, [memberInfo, hideMemberInfo]);

  const handleSendMessage = useCallback(() => {
    if (memberInfo?._id) {
      hideMemberInfo();
      // Navigate to chat/message screen (if implemented)
      // router.push(`/chat/${memberInfo._id}`);
      // For now, show an alert
      Alert.alert('Thông báo', 'Tính năng nhắn tin sẽ được phát triển sau');
    }
  }, [memberInfo, hideMemberInfo]);

  return {
    isVisible,
    memberInfo,
    showMemberInfo,
    hideMemberInfo,
    handleViewProfile,
    handleSendMessage,
  };
};
