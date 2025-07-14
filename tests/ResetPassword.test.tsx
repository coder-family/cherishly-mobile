import { configureStore } from '@reduxjs/toolkit';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Provider } from 'react-redux';

import authSlice from '../app/redux/slices/authSlice';
import ResetPassword from '../app/reset-password/ResetPassword';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

// Mock authService
jest.mock('../app/services/authService', () => ({
  __esModule: true,
  default: {
    resetPassword: jest.fn(),
  },
}));

const mockRouter = {
  replace: jest.fn(),
  push: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(),
  navigate: jest.fn(),
  dismiss: jest.fn(),
  dismissTo: jest.fn(),
  setParams: jest.fn(),
  getState: jest.fn(),
} as any;

const mockUseRouter = useRouter as jest.Mock;
const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;

const renderWithStore = (initialState = {}) => {
  const store = configureStore({
    reducer: {
      auth: authSlice,
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

  return {
    ...render(
      <Provider store={store}>
        <ResetPassword />
      </Provider>
    ),
    store,
  };
};

describe('ResetPassword Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
    mockUseLocalSearchParams.mockReturnValue({ token: 'valid-token-123' });
  });

  describe('Rendering', () => {
    it('renders reset password form when token is provided', () => {
      const { getByText, getByPlaceholderText } = renderWithStore();

      expect(getByText('Reset Your Password')).toBeTruthy();
      expect(getByPlaceholderText('New password')).toBeTruthy();
      expect(getByPlaceholderText('Confirm new password')).toBeTruthy();
      expect(getByText('Reset Password')).toBeTruthy();
    });

    it('shows error state when no token is provided', async () => {
      mockUseLocalSearchParams.mockReturnValue({});
      
      const { getByText, getByPlaceholderText } = renderWithStore();

      const passwordInput = getByPlaceholderText('New password');
      const confirmPasswordInput = getByPlaceholderText('Confirm new password');
      
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'password123');

      const resetButton = getByText('Reset Password');
      await act(async () => {
        fireEvent.press(resetButton);
      });

      await waitFor(() => {
        expect(getByText('Invalid or missing token.')).toBeTruthy();
      });
    });
  });

  describe('Form Validation', () => {
    it('shows validation error for empty password', async () => {
      const { getByText, getByPlaceholderText } = renderWithStore();

      const confirmPasswordInput = getByPlaceholderText('Confirm new password');
      fireEvent.changeText(confirmPasswordInput, 'password123');

      const resetButton = getByText('Reset Password');
      await act(async () => {
        fireEvent.press(resetButton);
      });

      await waitFor(() => {
        expect(getByText('Please fill in all fields.')).toBeTruthy();
      });
    });

    it('shows validation error when passwords do not match', async () => {
      const { getByText, getByPlaceholderText } = renderWithStore();

      const passwordInput = getByPlaceholderText('New password');
      const confirmPasswordInput = getByPlaceholderText('Confirm new password');
      
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'differentpassword');

      const resetButton = getByText('Reset Password');
      await act(async () => {
        fireEvent.press(resetButton);
      });

      await waitFor(() => {
        expect(getByText('Passwords do not match.')).toBeTruthy();
      });
    });

    it('does not show validation errors when form is valid', async () => {
      const { getByText, getByPlaceholderText, queryByText } = renderWithStore();

      const passwordInput = getByPlaceholderText('New password');
      const confirmPasswordInput = getByPlaceholderText('Confirm new password');
      
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'password123');

      // Wait a bit and check that no validation errors are shown
      await waitFor(() => {
        expect(queryByText('Please fill in all fields.')).toBeNull();
        expect(queryByText('Passwords do not match.')).toBeNull();
      });
    });
  });

  describe('User Interactions', () => {
    it('updates form fields when user types', () => {
      const { getByPlaceholderText } = renderWithStore();

      const passwordInput = getByPlaceholderText('New password');
      const confirmPasswordInput = getByPlaceholderText('Confirm new password');

      fireEvent.changeText(passwordInput, 'newpassword123');
      fireEvent.changeText(confirmPasswordInput, 'newpassword123');

      expect(passwordInput.props.value).toBe('newpassword123');
      expect(confirmPasswordInput.props.value).toBe('newpassword123');
    });
  });

  describe('Password Visibility Toggle', () => {
    it('has password fields with secure text entry enabled by default', () => {
      const { getByPlaceholderText } = renderWithStore();

      const passwordInput = getByPlaceholderText('New password');
      const confirmPasswordInput = getByPlaceholderText('Confirm new password');
      
      // Initially passwords should be hidden
      expect(passwordInput.props.secureTextEntry).toBe(true);
      expect(confirmPasswordInput.props.secureTextEntry).toBe(true);
    });

    it('toggles password visibility when eye button is pressed', () => {
      const { getByPlaceholderText, getAllByText } = renderWithStore();

      const passwordInput = getByPlaceholderText('New password');
      const confirmPasswordInput = getByPlaceholderText('Confirm new password');
      
      // Initially passwords should be hidden
      expect(passwordInput.props.secureTextEntry).toBe(true);
      expect(confirmPasswordInput.props.secureTextEntry).toBe(true);

      // Find and press the first eye button (for password field)
      const eyeButtons = getAllByText('👁️');
      fireEvent.press(eyeButtons[0]);

      // Password should now be visible
      expect(passwordInput.props.secureTextEntry).toBe(false);
      expect(confirmPasswordInput.props.secureTextEntry).toBe(true);

      // Press the second eye button (for confirm password field)
      fireEvent.press(eyeButtons[1]);

      // Both passwords should now be visible
      expect(passwordInput.props.secureTextEntry).toBe(false);
      expect(confirmPasswordInput.props.secureTextEntry).toBe(false);
    });
  });

  describe('API Integration', () => {
    it('calls authService.resetPassword with correct parameters', async () => {
      const mockResetPassword = require('../app/services/authService').default.resetPassword;
      mockResetPassword.mockResolvedValue(undefined);

      const { getByText, getByPlaceholderText } = renderWithStore();

      const passwordInput = getByPlaceholderText('New password');
      const confirmPasswordInput = getByPlaceholderText('Confirm new password');
      
      fireEvent.changeText(passwordInput, 'newpassword123');
      fireEvent.changeText(confirmPasswordInput, 'newpassword123');

      const resetButton = getByText('Reset Password');
      await act(async () => {
        fireEvent.press(resetButton);
      });

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith('valid-token-123', 'newpassword123');
      });
    });

    it('shows loading state during API call', async () => {
      const mockResetPassword = require('../app/services/authService').default.resetPassword;
      let resolvePromise: () => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockResetPassword.mockReturnValue(promise);

      const { getByText, getByPlaceholderText, queryByText } = renderWithStore();

      const passwordInput = getByPlaceholderText('New password');
      const confirmPasswordInput = getByPlaceholderText('Confirm new password');
      
      fireEvent.changeText(passwordInput, 'newpassword123');
      fireEvent.changeText(confirmPasswordInput, 'newpassword123');

      const resetButton = getByText('Reset Password');
      
      // Wrap the button press in act to handle state updates
      await act(async () => {
        fireEvent.press(resetButton);
      });

      // Wait for the loading state to be set
      await waitFor(() => {
        expect(queryByText('Reset Password')).toBeNull();
      }, { timeout: 3000 });

      // Resolve the promise and wait for cleanup
      await act(async () => {
        resolvePromise!();
      });
    });

    it('shows success state after successful password reset', async () => {
      const mockResetPassword = require('../app/services/authService').default.resetPassword;
      mockResetPassword.mockResolvedValue(undefined);

      const { getByText, getByPlaceholderText } = renderWithStore();

      const passwordInput = getByPlaceholderText('New password');
      const confirmPasswordInput = getByPlaceholderText('Confirm new password');
      
      fireEvent.changeText(passwordInput, 'newpassword123');
      fireEvent.changeText(confirmPasswordInput, 'newpassword123');

      const resetButton = getByText('Reset Password');
      await act(async () => {
        fireEvent.press(resetButton);
      });

      await waitFor(() => {
        expect(getByText('Password Reset Successful!')).toBeTruthy();
        expect(getByText('You can now log in with your new password.')).toBeTruthy();
        expect(getByText('Go to Login')).toBeTruthy();
      }, { timeout: 3000 });
    });

    it('navigates to login when Go to Login button is pressed in success state', async () => {
      const mockResetPassword = require('../app/services/authService').default.resetPassword;
      mockResetPassword.mockResolvedValue(undefined);

      const { getByText, getByPlaceholderText } = renderWithStore();

      const passwordInput = getByPlaceholderText('New password');
      const confirmPasswordInput = getByPlaceholderText('Confirm new password');
      
      fireEvent.changeText(passwordInput, 'newpassword123');
      fireEvent.changeText(confirmPasswordInput, 'newpassword123');

      const resetButton = getByText('Reset Password');
      await act(async () => {
        fireEvent.press(resetButton);
      });

      await waitFor(() => {
        expect(getByText('Go to Login')).toBeTruthy();
      }, { timeout: 3000 });

      const goToLoginButton = getByText('Go to Login');
      await act(async () => {
        fireEvent.press(goToLoginButton);
      });
      
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });

    it('shows error message for expired/invalid token', async () => {
      const mockResetPassword = require('../app/services/authService').default.resetPassword;
      mockResetPassword.mockRejectedValue({ response: { data: { message: 'Token expired' } } });

      const { getByText, getByPlaceholderText } = renderWithStore();

      const passwordInput = getByPlaceholderText('New password');
      const confirmPasswordInput = getByPlaceholderText('Confirm new password');
      
      fireEvent.changeText(passwordInput, 'newpassword123');
      fireEvent.changeText(confirmPasswordInput, 'newpassword123');

      const resetButton = getByText('Reset Password');
      await act(async () => {
        fireEvent.press(resetButton);
      });

      await waitFor(() => {
        expect(getByText('The password reset link is invalid or has expired. Please request it again.')).toBeTruthy();
      }, { timeout: 3000 });
    });

    it('shows error message for same password', async () => {
      const mockResetPassword = require('../app/services/authService').default.resetPassword;
      mockResetPassword.mockRejectedValue({ response: { data: { message: 'Password trùng lặp' } } });

      const { getByText, getByPlaceholderText } = renderWithStore();

      const passwordInput = getByPlaceholderText('New password');
      const confirmPasswordInput = getByPlaceholderText('Confirm new password');
      
      fireEvent.changeText(passwordInput, 'newpassword123');
      fireEvent.changeText(confirmPasswordInput, 'newpassword123');

      const resetButton = getByText('Reset Password');
      await act(async () => {
        fireEvent.press(resetButton);
      });

      await waitFor(() => {
        expect(getByText('The new password cannot be the same as the old password.')).toBeTruthy();
      }, { timeout: 3000 });
    });

    it('shows generic error message for other errors', async () => {
      const mockResetPassword = require('../app/services/authService').default.resetPassword;
      mockResetPassword.mockRejectedValue({ response: { data: { message: 'Server error' } } });

      const { getByText, getByPlaceholderText } = renderWithStore();

      const passwordInput = getByPlaceholderText('New password');
      const confirmPasswordInput = getByPlaceholderText('Confirm new password');
      
      fireEvent.changeText(passwordInput, 'newpassword123');
      fireEvent.changeText(confirmPasswordInput, 'newpassword123');

      const resetButton = getByText('Reset Password');
      await act(async () => {
        fireEvent.press(resetButton);
      });

      await waitFor(() => {
        expect(getByText('Server error')).toBeTruthy();
      }, { timeout: 3000 });
    });
  });
}); 