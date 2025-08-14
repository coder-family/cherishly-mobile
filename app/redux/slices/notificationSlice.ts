import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification, NotificationResponse, notificationService, PopulatedNotification, PopulatedNotificationResponse, UnreadCountResponse } from '../../services/notificationService';

// Re-export types for convenience
export type { Notification, NotificationResponse, PopulatedNotification, PopulatedNotificationResponse, UnreadCountResponse };

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  } | null;
  refreshing: boolean;
  polling: boolean;
  pollInterval: NodeJS.Timeout | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: null,
  refreshing: false,
  polling: false,
  pollInterval: null,
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async ({ page = 1, limit = 20 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications(page, limit);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 [NotificationSlice] fetchUnreadCount thunk started');
      const response = await notificationService.getUnreadCount();
      console.log('🔄 [NotificationSlice] fetchUnreadCount thunk response:', response);
      return response;
    } catch (error: any) {
      console.log('🔄 [NotificationSlice] fetchUnreadCount thunk error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      return { notificationId, response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAllAsRead();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await notificationService.deleteNotification(notificationId);
      return { notificationId, response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

// Thêm polling functionality
export const startNotificationPolling = createAsyncThunk(
  'notification/startPolling',
  async (intervalMs: number = 30000, { dispatch, getState }) => {
    const state = getState() as any;
    const currentInterval = state.notification.pollInterval;
    
    // Clear existing interval before creating a new one
    if (currentInterval) {
      clearInterval(currentInterval);
    }
    
    const pollInterval = setInterval(async () => {
      try {
        await dispatch(fetchUnreadCount());
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, intervalMs);
    
    return pollInterval;
  }
);

// Thêm refresh functionality
export const refreshNotifications = createAsyncThunk(
  'notification/refresh',
  async (_, { dispatch }) => {
    await dispatch(fetchNotifications({ page: 1, limit: 20 }));
    await dispatch(fetchUnreadCount());
  }
);

// Stop polling functionality
export const stopNotificationPolling = createAsyncThunk(
  'notification/stopPolling',
  async (_, { dispatch, getState }) => {
    const state = getState() as any;
    const currentInterval = state.notification.pollInterval;
    
    if (currentInterval) {
      clearInterval(currentInterval);
    }
    
    dispatch(stopPolling());
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.pagination = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    refreshNotificationCount: (state) => {
      // Trigger a refresh by setting refreshing to true
      console.log('🔄 [NotificationSlice] refreshNotificationCount action dispatched, setting refreshing to true');
      state.refreshing = true;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    updateUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.refreshing = action.payload;
    },
    setPolling: (state, action: PayloadAction<boolean>) => {
      state.polling = action.payload;
    },
    setPollInterval: (state, action: PayloadAction<NodeJS.Timeout | null>) => {
      state.pollInterval = action.payload;
    },
    stopPolling: (state) => {
      state.polling = false;
      state.pollInterval = null;
    },
  },
  extraReducers: (builder) => {
    // fetchNotifications
    builder
      .addCase(fetchNotifications.pending, (state, action) => {
        const page = (action as any).meta?.arg?.page || 1;
        if (page === 1) {
          state.loading = true;
        } else {
          state.refreshing = true;
        }
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<NotificationResponse>) => {
        state.loading = false;
        state.refreshing = false;
        const page = (action as any).meta?.arg?.page || 1;
        
        // Access data correctly based on our API structure
        const notifications = action.payload.data;
        const pagination = action.payload.pagination;
        
        if (page === 1) {
          state.notifications = notifications;
        } else {
          state.notifications = [...state.notifications, ...notifications];
        }
        state.pagination = pagination;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload as string;
      });

    // fetchUnreadCount
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action: PayloadAction<UnreadCountResponse>) => {
        if (action.payload && action.payload.data) {
          state.unreadCount = action.payload.data.unreadCount;
        }
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // markNotificationAsRead
    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const { notificationId } = action.payload;
        const notification = state.notifications.find(n => n._id === notificationId);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // markAllNotificationsAsRead
    builder
      .addCase(markAllNotificationsAsRead.fulfilled, (state, action) => {
        state.notifications.forEach(notification => {
          notification.isRead = true;
        });
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // deleteNotification
    builder
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const { notificationId } = action.payload;
        const notification = state.notifications.find(n => n._id === notificationId);
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(n => n._id !== notificationId);
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // startNotificationPolling
    builder
      .addCase(startNotificationPolling.fulfilled, (state, action) => {
        state.polling = true;
        state.pollInterval = action.payload;
      })
      .addCase(startNotificationPolling.rejected, (state) => {
        state.polling = false;
        state.pollInterval = null;
      });

    // stopNotificationPolling
    builder
      .addCase(stopNotificationPolling.fulfilled, (state) => {
        state.polling = false;
        state.pollInterval = null;
      });

    // refreshNotifications
    builder
      .addCase(refreshNotifications.pending, (state) => {
        state.refreshing = true;
        state.error = null;
      })
      .addCase(refreshNotifications.fulfilled, (state) => {
        state.refreshing = false;
      })
      .addCase(refreshNotifications.rejected, (state, action) => {
        state.refreshing = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearNotifications,
  clearError,
  refreshNotificationCount,
  addNotification,
  updateUnreadCount,
  setRefreshing,
  setPolling,
  setPollInterval,
  stopPolling,
} = notificationSlice.actions;

export default notificationSlice.reducer;
