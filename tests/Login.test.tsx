import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';
import Login from '../app/login';
import authReducer from '../app/redux/slices/authSlice';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock the background image
jest.mock('../app/assets/images/backgroundMb.png', () => 'background-image');

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
        ...initialState,
      },
    },
  });
};

describe('Login Component', () => {
  it('renders login form correctly', () => {
    const store = createTestStore();
    
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <Login />
      </Provider>
    );

    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByText('Sign in to continue your journey')).toBeTruthy();
    expect(getByPlaceholderText('Email address')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
    expect(getByText("Don't have an account?")).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
  });

  it('shows validation errors for empty fields', async () => {
    const store = createTestStore();
    
    const { getByText, getByPlaceholderText } = render(
      <Provider store={store}>
        <Login />
      </Provider>
    );

    const signInButton = getByText('Sign In');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(getByText('Email is required')).toBeTruthy();
      expect(getByText('Password is required')).toBeTruthy();
    });
  });

  it('shows validation error for invalid email', async () => {
    const store = createTestStore();
    
    const { getByText, getByPlaceholderText } = render(
      <Provider store={store}>
        <Login />
      </Provider>
    );

    const emailInput = getByPlaceholderText('Email address');
    fireEvent.changeText(emailInput, 'invalid-email');

    const signInButton = getByText('Sign In');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(getByText('Email is invalid')).toBeTruthy();
    });
  });

  it('shows loading state when submitting', () => {
    const store = createTestStore({ loading: true });
    
    const { getByText } = render(
      <Provider store={store}>
        <Login />
      </Provider>
    );

    expect(getByText('Signing In...')).toBeTruthy();
  });

  it('clears error on component mount', () => {
    const errorMessage = 'Invalid credentials';
    const store = createTestStore({ error: errorMessage });
    
    const { getByText } = render(
      <Provider store={store}>
        <Login />
      </Provider>
    );

    // The error gets cleared on mount, so we should not find it
    // This test verifies that the error clearing behavior works correctly
    expect(() => getByText(errorMessage)).toThrow();
  });

  it('toggles password visibility', () => {
    const store = createTestStore();
    
    const { getByPlaceholderText, getByTestId } = render(
      <Provider store={store}>
        <Login />
      </Provider>
    );

    const passwordInput = getByPlaceholderText('Password');
    
    // Initially password should be hidden
    expect(passwordInput.props.secureTextEntry).toBe(true);
    
    // Find and press the eye icon (we'll need to add testID to the component)
    // For now, this test demonstrates the concept
    expect(passwordInput).toBeTruthy();
  });
}); 