import apiService from './apiService';

export interface Notification {
  _id: string;
  recipient: string; // Thay vì userId
  sender: string | { _id: string; firstName: string; lastName: string; avatar?: string }; 
  type?: 'comment' | 'member_joined' | 'member_left' | 'member_removed' | 'invitation_accepted' | 'invitation_sent';
  title: string;
  message: string;
  targetType: 'memory' | 'prompt_response' | 'health_record' | 'growth_record' | 'family_group';
  targetId: string;
  childId?: string | { _id: string; firstName?: string; lastName?: string; avatar?: string }; 
  familyGroupId: string | { _id: string; name: string }; 
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PopulatedNotification {
  _id: string;
  recipient: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    email?: string;
  };
  type: 'comment' | 'member_joined' | 'member_left' | 'member_removed' | 'invitation_accepted' | 'invitation_sent';
  role?: string; // Role của thành viên trong nhóm
  title: string;
  message: string;
  targetType: 'memory' | 'prompt_response' | 'health_record' | 'growth_record' | 'family_group';
  targetId: string;
  childId?: string | { _id: string; firstName?: string; lastName?: string; avatar?: string }; 
  familyGroupId: {
    _id: string;
    name: string;
  };
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data: Notification[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface PopulatedNotificationResponse {
  success: boolean;
  message: string;
  data: {
    data: PopulatedNotification[];
    pagination: {
      total: number;
      page: number;
      pages: number;
      limit: number;
    };
  };
}

export interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: {
    unreadCount: number;
  };
}

export interface MarkReadResponse {
  success: boolean;
  data: {
    _id: string;
    isRead: boolean;
    updatedAt: string;
  };
}

export interface MarkAllReadResponse {
  success: boolean;
  message: string;
  data: {
    modifiedCount: number;
  };
}

export interface DeleteNotificationResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    isDeleted: boolean;
  };
}

class NotificationService {
  /**
   * Lấy danh sách thông báo với phân trang
   */
  async getNotifications(page: number = 1, limit: number = 20): Promise<NotificationResponse> {
    try {
      const response = await apiService.get(`/notifications?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Lấy số thông báo chưa đọc
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    try {
      const response = await apiService.get('/notifications/unread-count');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
      
      // If user is not authenticated, return 0 unread count
      if (error.status === 401 || error.message?.includes('Not authorized')) {
        return {
          success: true,
          message: 'User not authenticated',
          data: {
            unreadCount: 0
          }
        };
      }
      
      throw error;
    }
  }

  /**
   * Đánh dấu thông báo đã đọc
   */
  async markAsRead(notificationId: string): Promise<MarkReadResponse> {
    try {
      const response = await apiService.post(`/notifications/${notificationId}/mark-read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  async markAllAsRead(): Promise<MarkAllReadResponse> {
    try {
      const response = await apiService.post('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Xóa thông báo
   */
  async deleteNotification(notificationId: string): Promise<DeleteNotificationResponse> {
    try {
      const response = await apiService.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Lấy thông báo theo ID
   */
  async getNotificationById(notificationId: string): Promise<{ success: boolean; data: Notification }> {
    try {
      const response = await apiService.get(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notification by ID:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
