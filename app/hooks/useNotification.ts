import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    clearError,
    clearNotifications,
    deleteNotification,
    fetchNotifications,
    fetchUnreadCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from '../redux/slices/notificationSlice';
import { RootState } from '../redux/store';

export const useNotification = () => {
  const dispatch = useDispatch();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    pagination,
    refreshing,
  } = useSelector((state: RootState) => state.notifications);

  // Fetch notifications
  const loadNotifications = useCallback(
    (page: number = 1, limit: number = 20) => {
      dispatch(fetchNotifications({ page, limit }) as any);
    },
    [dispatch]
  );

  // Fetch unread count
  const loadUnreadCount = useCallback(() => {
    dispatch(fetchUnreadCount() as any);
  }, [dispatch]);

  // Mark notification as read
  const markAsRead = useCallback(
    (notificationId: string) => {
      dispatch(markNotificationAsRead(notificationId) as any);
    },
    [dispatch]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    dispatch(markAllNotificationsAsRead() as any);
  }, [dispatch]);

  // Delete notification
  const removeNotification = useCallback(
    (notificationId: string) => {
      dispatch(deleteNotification(notificationId) as any);
    },
    [dispatch]
  );

  // Clear notifications
  const clear = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  // Clear error
  const clearErrorState = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Load initial data
  useEffect(() => {
    loadNotifications(1, 20);
    loadUnreadCount();
  }, [loadNotifications, loadUnreadCount]);

  // Auto-refresh unread count when notifications change
  useEffect(() => {
    const hasUnreadNotifications = notifications.some(n => !n.isRead);
    if (hasUnreadNotifications !== (unreadCount > 0)) {
      loadUnreadCount();
    }
  }, [notifications, unreadCount, loadUnreadCount]);

  return {
    // State
    notifications,
    unreadCount,
    loading,
    error,
    pagination,
    refreshing,
    
    // Actions
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clear,
    clearError: clearErrorState,
    
    // Computed
    hasUnreadNotifications: unreadCount > 0,
    hasNotifications: notifications.length > 0,
    canLoadMore: pagination ? pagination.page < pagination.pages : false,
  };
};
