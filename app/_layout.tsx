// import { Slot } from 'expo-router';
import { Stack } from "expo-router";
import React from 'react';
import { Provider } from 'react-redux';
import { initializeAuth } from './redux/slices/authSlice';
import { store } from './redux/store';

// Initialize authentication on app start
store.dispatch(initializeAuth());

export default function Layout() {
  return (
    <Provider store={store}>
      <Stack />
    </Provider>
  );
} 
