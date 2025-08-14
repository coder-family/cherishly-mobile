import { router } from 'expo-router';
import { Alert } from 'react-native';
import { linkingUtils } from '../utils/linkingUtils';
import { Notification } from './notificationService';

// Import modal component

export interface NavigationInfo {
  targetType: string;
  targetId: string;
  childId?: string; // ID của child liên quan
  deepLinks?: {
    mobile: string;
    web: string;
    universal: string;
  };
  route: string;
}

export interface NotificationNavigationResponse {
  success: boolean;
  data: {
    notification: Notification;
    navigation: NavigationInfo;
  };
}

class NotificationNavigationService {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Xử lý khi người dùng click vào notification
   */
  async handleNotificationClick(
    notification: Notification,
    navigation: any,
    token: string
  ): Promise<void> {
    try {
      console.log('🔍 [NotificationNavigation] Handling notification click:', notification._id);
      
      // Xử lý thông báo thành viên mới
      if (notification.type === 'member_joined' && notification.sender) {
        console.log('🔍 [NotificationNavigation] Member joined notification - will show modal');
        // Logic modal sẽ được xử lý ở component level
        return;
      }
      
      // Xử lý thông báo thành viên rời/xóa - không cần điều hướng
      if (notification.type === 'member_left' || notification.type === 'member_removed') {
        console.log('🔍 [NotificationNavigation] Member left/removed - no navigation needed');
        return;
      }
      
      // Kiểm tra xem notification có childId không
      if (notification.childId) {
        // Xử lý childId có thể là object hoặc string
        const childId = typeof notification.childId === 'object' && notification.childId !== null 
          ? (notification.childId as any)._id 
          : notification.childId;
        console.log('🔍 [NotificationNavigation] Using childId:', childId);
        
        // Sử dụng childId trực tiếp từ notification
        await this.navigateToChildProfile(notification.targetType, notification.targetId, childId, navigation);
        return;
      }
      
      // Fallback: điều hướng về Home
      console.log('🔍 [NotificationNavigation] No specific navigation, falling back to Home');
      this.navigateToHome(navigation);
    } catch (error) {
      console.error('🔍 [NotificationNavigation] Error handling notification click:', error);
      
      // Fallback: điều hướng về Home
      Alert.alert(
        'Lỗi',
        'Không thể mở nội dung này. Vui lòng thử lại sau.',
        [{ text: 'OK', onPress: () => this.navigateToHome(navigation) }]
      );
    }
  }

  /**
   * Lấy thông tin điều hướng từ backend
   */
  private async getNotificationNavigation(
    notificationId: string,
    token: string
  ): Promise<NotificationNavigationResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/notifications/${notificationId}/navigation`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('🔍 [NotificationNavigation] Error fetching navigation info:', error);
      throw error;
    }
  }

  /**
   * Điều hướng đến nội dung dựa trên thông tin navigation
   */
  private async navigateToContent(navigationInfo: NavigationInfo, navigation: any): Promise<void> {
    const { targetType, targetId, childId, deepLinks } = navigationInfo;

    console.log('🔍 [NotificationNavigation] Navigating to:', { targetType, targetId, childId });

    try {
      // Thử sử dụng deep link trước
      if (deepLinks?.mobile) {
        const canOpen = await linkingUtils.canOpenURL(deepLinks.mobile);
        if (canOpen) {
          await linkingUtils.openURL(deepLinks.mobile);
          return;
        }
      }

      // Fallback: sử dụng navigation trực tiếp
      await this.navigateByTargetType(targetType, targetId, childId || targetId, navigation);
    } catch (error) {
      console.error('🔍 [NotificationNavigation] Error navigating to content:', error);
      throw error;
    }
  }

  /**
   * Điều hướng dựa trên loại nội dung
   */
  private async navigateByTargetType(
    targetType: string,
    targetId: string,
    childId: string,
    navigation: any
  ): Promise<void> {
    switch (targetType) {
      case 'memory':
      case 'prompt_response':
      case 'health_record':
      case 'growth_record':
        await this.navigateToChildProfile(targetType, targetId, childId, navigation);
        break;
      case 'family_group':
        await this.navigateToFamilyGroup(targetId, navigation);
        break;
      case 'member_joined':
        // Hiển thị modal thông tin thành viên mới
        // Logic này sẽ được xử lý ở component level
        console.log('🔍 [NotificationNavigation] Member joined - show modal');
        break;
      case 'member_left':
      case 'member_removed':
        // Không cần điều hướng gì cả
        console.log('🔍 [NotificationNavigation] Member left/removed - no navigation needed');
        break;
      default:
        console.warn('🔍 [NotificationNavigation] Unknown target type:', targetType);
        this.navigateToHome(navigation);
    }
  }

  /**
   * Điều hướng đến child profile với focus vào post cụ thể
   */
  private async navigateToChildProfile(targetType: string, targetId: string, childId: string, navigation: any): Promise<void> {
    try {
      // Chuyển đổi targetType để phù hợp với postType trong child profile
      let postType = targetType;
      if (targetType === 'prompt_response') {
        postType = 'prompt_response';
      } else if (targetType === 'health_record') {
        postType = 'health_record';
      } else if (targetType === 'growth_record') {
        postType = 'growth_record';
      }
      
      // Điều hướng đến child profile với focusPost
      router.push(`/children/${childId}/profile?focusPost=${targetId}&postType=${postType}`);
    } catch (error) {
      console.error('🔍 [NotificationNavigation] Error navigating to child profile:', error);
      this.navigateToHome(navigation);
    }
  }

  /**
   * Điều hướng đến family group
   */
  private async navigateToFamilyGroup(groupId: string, navigation: any): Promise<void> {
    try {
      router.push(`/family/${groupId}`);
    } catch (error) {
      console.error('🔍 [NotificationNavigation] Error navigating to family group:', error);
      this.navigateToHome(navigation);
    }
  }

  /**
   * Điều hướng về Home screen
   */
  private navigateToHome(navigation: any): void {
    try {
      router.push('/tabs/home');
    } catch (error) {
      console.error('🔍 [NotificationNavigation] Error navigating to home:', error);
      // Final fallback - do nothing
    }
  }

  /**
   * Tạo deep link cho notification
   */
  generateDeepLink(targetType: string, targetId: string, params?: Record<string, string>): string {
    const baseParams = { id: targetId, ...params };
    // Xử lý số nhiều cho targetType
    const pluralType = this.getPluralType(targetType);
    return linkingUtils.generateDeepLink(`${pluralType}/${targetId}`, baseParams);
  }

  /**
   * Tạo web link cho notification
   */
  generateWebLink(targetType: string, targetId: string, params?: Record<string, string>): string {
    const baseParams = { id: targetId, ...params };
    // Xử lý số nhiều cho targetType
    const pluralType = this.getPluralType(targetType);
    return linkingUtils.generateWebLink(`${pluralType}/${targetId}`, baseParams);
  }

  /**
   * Chuyển đổi targetType thành dạng số nhiều
   */
  private getPluralType(targetType: string): string {
    const pluralMap: Record<string, string> = {
      'memory': 'memories',
      'prompt_response': 'prompt-responses',
      'health_record': 'health-records',
      'growth_record': 'growth-records',
      'family_group': 'family-groups'
    };
    return pluralMap[targetType] || `${targetType}s`;
  }
}

export default NotificationNavigationService;
