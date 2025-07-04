import { Slot } from 'expo-router';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { initializeAuth } from './redux/slices/authSlice';
import { store } from './redux/store';

export default function Layout() {
  useEffect(() => {
    // Initialize authentication on app start
    store.dispatch(initializeAuth());
  }, []);

  return (
    <Provider store={store}>
      <Slot />
    </Provider>
  );
} 