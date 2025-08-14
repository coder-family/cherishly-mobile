import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    refreshNotifications,
    startNotificationPolling,
    stopPolling
} from '../redux/slices/notificationSlice';
import { RootState } from '../redux/store';

export const useNotificationPolling = (intervalMs: number = 30000) => {
  const dispatch = useDispatch();
  const { polling, pollInterval } = useSelector((state: RootState) => state.notifications);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Start polling when authenticated
  useEffect(() => {
    if (isAuthenticated && !polling) {
      dispatch(startNotificationPolling(intervalMs) as any);
    }
  }, [isAuthenticated, polling, intervalMs, dispatch]);

  // Cleanup polling on unmount or when not authenticated
  useEffect(() => {
    if (!isAuthenticated && polling) {
      dispatch(stopPolling());
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isAuthenticated, polling, dispatch]);

  // Manual refresh function
  const refresh = () => {
    dispatch(refreshNotifications() as any);
  };

  // Stop polling manually
  const stop = () => {
    dispatch(stopPolling());
  };

  // Start polling manually
  const start = () => {
    if (isAuthenticated && !polling) {
      dispatch(startNotificationPolling(intervalMs) as any);
    }
  };

  return {
    polling,
    refresh,
    stop,
    start,
  };
};
