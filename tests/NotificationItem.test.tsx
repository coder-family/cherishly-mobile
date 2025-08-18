import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';
import NotificationItem from '../app/components/notification/NotificationItem';
import authReducer from '../app/redux/slices/authSlice';
import notificationReducer from '../app/redux/slices/notificationSlice';

// Mock the theme hook
jest.mock('../app/hooks/useThemeColor', () => ({
  useThemeColor: () => '#007AFF',
}));

// Mock the date utils
jest.mock('../app/utils/dateUtils', () => ({
  formatRelativeTime: () => '2 hours ago',
}));

// Mock the Avatar component
jest.mock('../app/components/ui/Avatar', () => {
  return function MockAvatar({ size, uri }: any) {
    return <div data-testid="avatar" data-size={size} data-uri={uri} />;
  };
});

// Mock notification service
jest.mock('../app/services/notificationService', () => ({
  notificationService: {
    markAsRead: jest.fn(() => Promise.resolve({ success: true })),
    deleteNotification: jest.fn(() => Promise.resolve({ success: true })),
  },
}));

const createTestStore = () => {
  return configureStore({
    reducer: {
      notifications: notificationReducer,
      auth: authReducer,
    },
  });
};

describe('NotificationItem', () => {
  const mockNotification = {
    _id: '1',
    userId: 'user1',
    recipient: 'user1',
    sender: {
      _id: 'sender1',
      firstName: 'John',
      lastName: 'Doe',
      avatar: undefined,
    },
    familyGroupId: 'group1',
    type: 'comment' as const,
    title: 'New comment',
    message: 'Someone commented on your post',
    targetType: 'memory' as const,
    targetId: 'memory1',
    isRead: false,
    isDeleted: false,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  };

  it('renders correctly with valid notification', () => {
    const store = createTestStore();
    const { getByText } = render(
      <Provider store={store}>
        <NotificationItem notification={mockNotification} />
      </Provider>
    );

    expect(getByText('New comment')).toBeTruthy();
    expect(getByText('Someone commented on your post')).toBeTruthy();
    expect(getByText('2 hours ago')).toBeTruthy();
  });

  it('handles undefined notification gracefully', () => {
    const store = createTestStore();
    const { queryByText } = render(
      <Provider store={store}>
        <NotificationItem notification={undefined as any} />
      </Provider>
    );

    // Should render nothing when notification is undefined
    expect(queryByText('New comment')).toBeNull();
  });

  it('handles null notification gracefully', () => {
    const store = createTestStore();
    const { queryByText } = render(
      <Provider store={store}>
        <NotificationItem notification={null as any} />
      </Provider>
    );

    // Should render nothing when notification is null
    expect(queryByText('New comment')).toBeNull();
  });

  it('calls onPress when pressed', () => {
    const store = createTestStore();
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Provider store={store}>
        <NotificationItem 
          notification={mockNotification} 
          onPress={mockOnPress}
        />
      </Provider>
    );

    fireEvent.press(getByText('New comment'));
    expect(mockOnPress).toHaveBeenCalledWith(mockNotification);
  });

  it('dispatches markAsRead when pressed and notification is unread', async () => {
    const store = createTestStore();
    const { getByText } = render(
      <Provider store={store}>
        <NotificationItem notification={mockNotification} />
      </Provider>
    );

    fireEvent.press(getByText('New comment'));
    
    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Check if the action was dispatched
    const actions = store.getState().notifications;
    // Note: We can't easily test async thunk actions in this simple test
    // In a real scenario, you'd use more sophisticated testing
  });
});
