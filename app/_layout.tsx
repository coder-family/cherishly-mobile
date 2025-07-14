import { Stack } from "expo-router";
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { initializeAuth } from './redux/slices/authSlice';
import { store } from './redux/store';

// Initialize authentication on app start
store.dispatch(initializeAuth());

export default function Layout() {
  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <Stack 
          screenOptions={{
            headerShown: false,
          }}
        />
      </PaperProvider>
    </ReduxProvider>
  );
}
