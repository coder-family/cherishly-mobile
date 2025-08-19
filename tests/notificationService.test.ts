import NotificationNavigationService from '../app/services/notificationNavigationService';
import { notificationService } from '../app/services/notificationService';

// Mock apiService
jest.mock('../app/services/apiService', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock linkingUtils
jest.mock('../app/utils/linkingUtils', () => ({
  linkingUtils: {
    canOpenURL: jest.fn(),
    openURL: jest.fn(),
    generateDeepLink: jest.fn(),
    generateWebLink: jest.fn(),
  },
}));

// Mock Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('should fetch notifications successfully', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            _id: '1',
            title: 'Test notification',
            message: 'Test message',
            type: 'comment',
            isRead: false,
            sender: {
              _id: 'user1',
              firstName: 'John',
              lastName: 'Doe',
            },
            targetType: 'memory',
            targetId: 'memory1',
            childId: 'child1',
            familyGroupId: {
              _id: 'group1',
              name: 'Test Group',
            },
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        pagination: {
          total: 1,
          page: 1,
          pages: 1,
          limit: 20,
        },
      };

      const apiService = require('../app/services/apiService').default;
      apiService.get.mockResolvedValue({ data: mockResponse });

      const result = await notificationService.getNotifications(1, 20);

      expect(apiService.get).toHaveBeenCalledWith('/notifications?page=1&limit=20');
      expect(result).toEqual(mockResponse);
    });

    it('should handle error when fetching notifications', async () => {
      const apiService = require('../app/services/apiService').default;
      const error = new Error('Network error');
      apiService.get.mockRejectedValue(error);

      await expect(notificationService.getNotifications()).rejects.toThrow('Network error');
    });
  });

  describe('getUnreadCount', () => {
    it('should fetch unread count successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          unreadCount: 5,
        },
      };

      const apiService = require('../app/services/apiService').default;
      apiService.get.mockResolvedValue({ data: mockResponse });

      const result = await notificationService.getUnreadCount();

      expect(apiService.get).toHaveBeenCalledWith('/notifications/unread-count');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          _id: '507f1f77bcf86cd799439011',
          isRead: true,
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      };

      const apiService = require('../app/services/apiService').default;
      apiService.post.mockResolvedValue({ data: mockResponse });

      const result = await notificationService.markAsRead('507f1f77bcf86cd799439011');

      expect(apiService.post).toHaveBeenCalledWith('/notifications/507f1f77bcf86cd799439011/mark-read');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Đã đánh dấu 10 thông báo là đã đọc',
        data: {
          modifiedCount: 10,
        },
      };

      const apiService = require('../app/services/apiService').default;
      apiService.post.mockResolvedValue({ data: mockResponse });

      const result = await notificationService.markAllAsRead();

      expect(apiService.post).toHaveBeenCalledWith('/notifications/mark-all-read');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Đã xóa thông báo',
        data: {
          _id: '507f1f77bcf86cd799439011',
          isDeleted: true,
        },
      };

      const apiService = require('../app/services/apiService').default;
      apiService.delete.mockResolvedValue({ data: mockResponse });

      const result = await notificationService.deleteNotification('507f1f77bcf86cd799439011');

      expect(apiService.delete).toHaveBeenCalledWith('/notifications/507f1f77bcf86cd799439011');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getNotificationById', () => {
    it('should fetch notification by id successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          _id: '507f1f77bcf86cd799439011',
          title: 'Test notification',
          message: 'Test message',
          type: 'comment',
          isRead: false,
          sender: {
            _id: 'user1',
            firstName: 'John',
            lastName: 'Doe',
          },
                      targetType: 'memory',
            targetId: 'memory1',
            childId: 'child1',
            familyGroupId: {
              _id: 'group1',
              name: 'Test Group',
            },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      };

      const apiService = require('../app/services/apiService').default;
      apiService.get.mockResolvedValue({ data: mockResponse });

      const result = await notificationService.getNotificationById('507f1f77bcf86cd799439011');

      expect(apiService.get).toHaveBeenCalledWith('/notifications/507f1f77bcf86cd799439011');
      expect(result).toEqual(mockResponse);
    });
  });
});

describe('NotificationNavigationService', () => {
  let navigationService: NotificationNavigationService;
  const mockNavigation = { push: jest.fn() };

  beforeEach(() => {
    navigationService = new NotificationNavigationService('https://test-api.com');
    jest.clearAllMocks();
  });

  describe('handleNotificationClick', () => {
    it('should navigate to child profile when notification has childId', async () => {
      const notification = {
        _id: 'notif1',
        type: 'comment' as const,
        targetType: 'memory' as const,
        targetId: 'memory1',
        childId: 'child1',
        title: 'New comment',
        message: 'Someone commented on your post',
        isRead: false,
        recipient: 'user1',
        sender: 'user2',
        familyGroupId: 'group1',
        isDeleted: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const router = require('expo-router').router;

      await navigationService.handleNotificationClick(notification, mockNavigation, 'token');

      expect(router.push).toHaveBeenCalledWith('/children/child1/profile?focusPost=memory1&postType=memory');
    });

    it('should fallback to API navigation when notification has no childId', async () => {
      const notification = {
        _id: 'notif1',
        type: 'comment' as const,
        targetType: 'memory' as const,
        targetId: 'memory1',
        title: 'New comment',
        message: 'Someone commented on your post',
        isRead: false,
        recipient: 'user1',
        sender: 'user2',
        familyGroupId: 'group1',
        isDeleted: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      // Mock fetch for API call
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            navigation: {
              targetType: 'memory',
              targetId: 'memory1',
              childId: 'child1',
              route: 'children'
            }
          }
        })
      });

      const router = require('expo-router').router;

      await navigationService.handleNotificationClick(notification, mockNavigation, 'token');

      expect(router.push).toHaveBeenCalledWith('/children/child1/profile?focusPost=memory1&postType=memory');
    });

    it('should handle navigation errors gracefully', async () => {
      const notification = {
        _id: 'notif1',
        type: 'comment' as const,
        targetType: 'memory' as const,
        targetId: 'memory1',
        title: 'New comment',
        message: 'Someone commented on your post',
        isRead: false,
        recipient: 'user1',
        sender: 'user2',
        familyGroupId: 'group1',
        isDeleted: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      // Mock fetch to throw error
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const router = require('expo-router').router;
      const Alert = require('react-native').Alert;

      await navigationService.handleNotificationClick(notification, mockNavigation, 'token');

      // Should show alert and fallback to home
      expect(Alert.alert).toHaveBeenCalledWith(
        'Lỗi',
        'Không thể mở nội dung này. Vui lòng thử lại sau.',
        expect.any(Array)
      );
    });
  });

  describe('navigateToChildProfile', () => {
    it('should navigate to correct child profile with memory post', async () => {
      const router = require('expo-router').router;

      await navigationService['navigateToChildProfile']('memory', 'memory1', 'child1', mockNavigation);

      expect(router.push).toHaveBeenCalledWith('/children/child1/profile?focusPost=memory1&postType=memory');
    });

    it('should navigate to correct child profile with prompt response', async () => {
      const router = require('expo-router').router;

      await navigationService['navigateToChildProfile']('prompt_response', 'response1', 'child1', mockNavigation);

      expect(router.push).toHaveBeenCalledWith('/children/child1/profile?focusPost=response1&postType=prompt_response');
    });

    it('should navigate to correct child profile with health record', async () => {
      const router = require('expo-router').router;

      await navigationService['navigateToChildProfile']('health_record', 'health1', 'child1', mockNavigation);

      expect(router.push).toHaveBeenCalledWith('/children/child1/profile?focusPost=health1&postType=health_record');
    });

    it('should navigate to correct child profile with growth record', async () => {
      const router = require('expo-router').router;

      await navigationService['navigateToChildProfile']('growth_record', 'growth1', 'child1', mockNavigation);

      expect(router.push).toHaveBeenCalledWith('/children/child1/profile?focusPost=growth1&postType=growth_record');
    });
  });

  describe('generateDeepLink', () => {
    it('should generate correct deep link for memory', () => {
      const linkingUtils = require('../app/utils/linkingUtils').linkingUtils;
      linkingUtils.generateDeepLink.mockReturnValue('growing-together://memories/memory1?id=memory1');

      const result = navigationService.generateDeepLink('memory', 'memory1');

      expect(linkingUtils.generateDeepLink).toHaveBeenCalledWith('memories/memory1', { id: 'memory1' });
      expect(result).toBe('growing-together://memories/memory1?id=memory1');
    });

    it('should generate correct deep link with additional params', () => {
      const linkingUtils = require('../app/utils/linkingUtils').linkingUtils;
      linkingUtils.generateDeepLink.mockReturnValue('growing-together://memories/memory1?id=memory1&title=Test');

      const result = navigationService.generateDeepLink('memory', 'memory1', { title: 'Test' });

      expect(linkingUtils.generateDeepLink).toHaveBeenCalledWith('memories/memory1', { id: 'memory1', title: 'Test' });
      expect(result).toBe('growing-together://memories/memory1?id=memory1&title=Test');
    });
  });

  describe('generateWebLink', () => {
    it('should generate correct web link for memory', () => {
      const linkingUtils = require('../app/utils/linkingUtils').linkingUtils;
      linkingUtils.generateWebLink.mockReturnValue('https://growing-together.com/memories/memory1?id=memory1');

      const result = navigationService.generateWebLink('memory', 'memory1');

      expect(linkingUtils.generateWebLink).toHaveBeenCalledWith('memories/memory1', { id: 'memory1' });
      expect(result).toBe('https://growing-together.com/memories/memory1?id=memory1');
    });
  });
});
