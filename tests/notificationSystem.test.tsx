import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';
import { NotificationBadge } from '../app/components/notification/NotificationBadge';
import authReducer from '../app/redux/slices/authSlice';
import notificationReducer, { refreshNotificationCount } from '../app/redux/slices/notificationSlice';

// Mock the theme hook
jest.mock('../app/hooks/useThemeColor', () => ({
  useThemeColor: () => '#007AFF',
}));

// Mock useNotificationPolling
jest.mock('../app/hooks/useNotificationPolling', () => ({
  useNotificationPolling: () => ({
    polling: false,
    refresh: jest.fn(),
    stop: jest.fn(),
    start: jest.fn(),
  }),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the notification service
jest.mock('../app/services/notificationService', () => ({
  notificationService: {
    getUnreadCount: jest.fn(),
  },
}));



const createTestStore = (initialUnreadCount = 0) => {
  return configureStore({
    reducer: {
      notifications: notificationReducer,
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: { 
          id: 'user1', 
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          avatar: undefined,
        },
        token: 'test-token',
        loading: false,
        error: null,
        isAuthenticated: true,
      },
      notifications: {
        notifications: [],
        unreadCount: initialUnreadCount,
        loading: false,
        error: null,
        pagination: null,
        refreshing: false,
        polling: false,
        pollInterval: null,
      },
    },
  });
};

describe('Notification System', () => {
  it('should refresh notification count when refreshNotificationCount is dispatched', async () => {
    const store = createTestStore();
    
    // Initial state
    expect(store.getState().notifications.unreadCount).toBe(0);
    expect(store.getState().notifications.refreshing).toBe(false);
    
    // Dispatch refresh action
    store.dispatch(refreshNotificationCount());
    
    // Check if refreshing is set to true
    expect(store.getState().notifications.refreshing).toBe(true);
  });

  it('should render NotificationBadge with correct unread count', () => {
    const store = createTestStore(5);
    
    const { getByText } = render(
      <Provider store={store}>
        <NotificationBadge />
      </Provider>
    );
    
    expect(getByText('5')).toBeTruthy();
  });

  it('should not show badge when unread count is 0', () => {
    const store = createTestStore(0);
    
    const { queryByText } = render(
      <Provider store={store}>
        <NotificationBadge />
      </Provider>
    );
    
    expect(queryByText('0')).toBeNull();
  });

  it('should show 99+ when unread count is over 99', () => {
    const store = createTestStore(150);
    
    const { getByText } = render(
      <Provider store={store}>
        <NotificationBadge />
      </Provider>
    );
    
    expect(getByText('99+')).toBeTruthy();
  });


});
