import React, { useCallback, useEffect } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useThemeColor } from '../../hooks/useThemeColor';
import { fetchNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../../redux/slices/notificationSlice';
import { RootState } from '../../redux/store';
import NotificationNavigationService from '../../services/notificationNavigationService';
import { Notification, PopulatedNotification } from '../../services/notificationService';
import EmptyState from '../ui/EmptyState';
import ErrorView from '../ui/ErrorView';
import LoadingSpinner from '../ui/LoadingSpinner';
import MemberJoinedNotification from './MemberJoinedNotification';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  onNotificationPress?: (notification: Notification) => void;
  showMarkAllRead?: boolean;
  navigation?: any;
  token?: string;
  apiBaseUrl?: string;
}

const NotificationList: React.FC<NotificationListProps> = ({
  onNotificationPress,
  showMarkAllRead = true,
  navigation,
  token,
  apiBaseUrl,
}) => {
  const dispatch = useDispatch();
  const { notifications, loading, error, pagination, refreshing } = useSelector(
    (state: RootState) => state.notifications || {
      notifications: [],
      loading: false,
      error: null,
      pagination: null,
      refreshing: false,
    }
  );
  
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 20 }) as any);
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchNotifications({ page: 1, limit: 20 }) as any);
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    if (pagination && pagination.page < pagination.pages && !loading) {
      dispatch(fetchNotifications({ page: pagination.page + 1, limit: 20 }) as any);
    }
  }, [dispatch, pagination, loading]);

  const handleMarkAllRead = useCallback(() => {
    dispatch(markAllNotificationsAsRead() as any);
  }, [dispatch]);

  // Tạo notification navigation service
  const notificationService = React.useMemo(() => {
    if (apiBaseUrl) {
      return new NotificationNavigationService(apiBaseUrl);
    }
    return null;
  }, [apiBaseUrl]);

  // Xử lý khi người dùng click vào notification
  const handleNotificationPress = useCallback(async (notification: Notification) => {
    try {
      // Nếu có custom onNotificationPress, sử dụng nó
      if (onNotificationPress) {
        onNotificationPress(notification);
        return;
      }

      // Nếu có navigation service và token, sử dụng navigation
      if (notificationService && token && navigation) {
        await notificationService.handleNotificationClick(notification, navigation, token);
        return;
      }

      // Fallback: chỉ mark as read
    } catch (error) {
      console.error('🔍 [NotificationList] Error handling notification press:', error);
    }
  }, [onNotificationPress, notificationService, token, navigation]);

  const renderNotification = useCallback(({ item }: { item: Notification }) => {
    // Sử dụng MemberJoinedNotification cho thông báo member_joined
    if (item.type === 'member_joined' && typeof item.sender === 'object' && item.sender) {
      // Tạo PopulatedNotification từ Notification
      const populatedNotification: PopulatedNotification = {
        ...item,
        type: item.type || 'member_joined', // Đảm bảo type không undefined
        sender: item.sender as PopulatedNotification['sender'],
        familyGroupId: typeof item.familyGroupId === 'object' ? item.familyGroupId : { _id: item.familyGroupId as string, name: '' }
      };
      
      return (
        <MemberJoinedNotification
          notification={populatedNotification}
          onPress={(notification) => {
            // Chỉ mark as read, không điều hướng
            if (!notification.isRead) {
              dispatch(markNotificationAsRead(notification._id) as any);
            }
          }}
        />
      );
    }
    
    // Sử dụng NotificationItem cho các loại thông báo khác
    return (
      <NotificationItem
        notification={item}
        onPress={handleNotificationPress}
      />
    );
  }, [handleNotificationPress, dispatch]);

  const renderEmpty = () => (
    <EmptyState
      message="Bạn chưa có thông báo nào"
    />
  );

  const renderError = () => (
    <ErrorView
      message={error || 'Có lỗi xảy ra khi tải thông báo'}
      onRetry={handleRefresh}
    />
  );

  // Guard against undefined notifications
  const safeNotifications = notifications || [];

  // Render loading state
  if (loading && safeNotifications.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <LoadingSpinner />
      </View>
    );
  }

  // Render error state
  if (error && safeNotifications.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        {renderError()}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <FlatList
        data={safeNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[primaryColor]}
            tintColor={primaryColor}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          loading && notifications.length > 0 ? (
            <View style={styles.loadingFooter}>
              <LoadingSpinner size="small" />
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default NotificationList;
