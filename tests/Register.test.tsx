import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import * as authSliceModule from '../app/redux/slices/authSlice';
import Register from '../app/register';

const mockRegister = jest.fn();

// Mock the authSlice's registerUser thunk
jest.mock('../app/redux/slices/authSlice', () => {
  const actual = jest.requireActual('../app/redux/slices/authSlice');
  return {
    ...actual,
    registerUser: jest.fn((data: any) => {
      return (dispatch: any) => {
        dispatch({ type: actual.registerUser.pending.type });
        
        return {
          unwrap: async () => {
            try {
              const result = await mockRegister(data);
              dispatch({ type: actual.registerUser.fulfilled.type, payload: result });
              return result;
            } catch (error: any) {
              dispatch({
                type: actual.registerUser.rejected.type,
                error: {
                  message: error.message,
                  name: error.name || 'Error',
                },
                payload: undefined,
                meta: {
                  arg: data,
                  requestId: 'mockedRequestId',
                  rejectedWithValue: false,
                  requestStatus: 'rejected',
                },
              });
              throw error;
            }
          }
        };
      };
    }),
    clearError: actual.clearError,
    default: actual.default || actual.authSlice?.reducer || actual,
  };
});

// Helper to robustly extract the reducer function
const getReducer = (mod: any) =>
  typeof mod === 'function'
    ? mod
    : typeof mod.default === 'function'
      ? mod.default
      : typeof mod.default?.default === 'function'
        ? mod.default.default
        : undefined;

const authReducer = getReducer(authSliceModule);

// Mock expo-router
const mockRouter = {
  replace: jest.fn(),
  push: jest.fn(),
  back: jest.fn(),
};

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
}));

// Mock the background image
jest.mock('../app/assets/images/backgroundMb.png', () => 'background-image');

// Define the store state type
interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  error: string | null;
}

interface RootState {
  auth: AuthState;
}

const createTestStore = (initialAuthState: Partial<AuthState> = {}) => {
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
        ...initialAuthState, 
      },
    },
  });
};

const renderWithStore = (initialAuthState: Partial<AuthState> = {}) => {
  const store = createTestStore(initialAuthState);
  return {
    ...render(
      <Provider store={store}>
        <Register />
      </Provider>
    ),
    store,
  };
};

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.replace.mockClear();
    mockRouter.push.mockClear();
    mockRouter.back.mockClear();
    
    // Default: success
    mockRegister.mockImplementation(
      (data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ id: '1', email: data.email, firstName: data.firstName });
          }, 10);
        })
    );
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      const { getByText } = renderWithStore();
      
      // Check for basic elements that should always be present
      expect(getByText('Sign Up')).toBeTruthy();
      expect(getByText('Welcome to Growing Together')).toBeTruthy();
      expect(getByText('Create Account')).toBeTruthy();
    });

    it('renders all form fields correctly', () => {
      const { getByPlaceholderText } = renderWithStore();

      // Check if all form fields are rendered
      expect(getByPlaceholderText('First name')).toBeTruthy();
      expect(getByPlaceholderText('Last name')).toBeTruthy();
      expect(getByPlaceholderText('Date of birth (YYYY-MM-DD)')).toBeTruthy();
      expect(getByPlaceholderText('Email address')).toBeTruthy();
      expect(getByPlaceholderText('Password')).toBeTruthy();
      expect(getByPlaceholderText('Confirm password')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('navigates to login page when login link is pressed', () => {
      const { getByText } = renderWithStore();

      const loginLink = getByText('Sign In');
      fireEvent.press(loginLink);

      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });

    it('can submit form with valid data', async () => {
      const { getByText, getByPlaceholderText } = renderWithStore();

      // Fill in all fields with valid data
      fireEvent.changeText(getByPlaceholderText('First name'), 'John');
      fireEvent.changeText(getByPlaceholderText('Last name'), 'Doe');
      fireEvent.changeText(getByPlaceholderText('Date of birth (YYYY-MM-DD)'), '1990-01-01');
      fireEvent.changeText(getByPlaceholderText('Email address'), 'john.doe@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'Password123@');
      fireEvent.changeText(getByPlaceholderText('Confirm password'), 'Password123@');

      // Submit form
      const signUpButton = getByText('Create Account');
      fireEvent.press(signUpButton);

      // Wait for the action to be dispatched
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('Redux Integration', () => {
    it('clears error when component mounts', () => {
      const initialState = {
        error: 'Previous error message',
      };
      
      const { store } = renderWithStore(initialState);

      // Check that error is cleared on mount
      const state = store.getState() as RootState;
      expect(state.auth.error).toBe(null);
    });

    it('submits correct data structure', async () => {
      const { getByText, getByPlaceholderText } = renderWithStore();

      fireEvent.changeText(getByPlaceholderText('First name'), 'John');
      fireEvent.changeText(getByPlaceholderText('Last name'), 'Doe');
      fireEvent.changeText(getByPlaceholderText('Date of birth (YYYY-MM-DD)'), '1990-01-01');
      fireEvent.changeText(getByPlaceholderText('Email address'), 'john.doe@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'Password123@');
      fireEvent.changeText(getByPlaceholderText('Confirm password'), 'Password123@');

      const signUpButton = getByText('Create Account');
      fireEvent.press(signUpButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
          email: 'john.doe@example.com',
          password: 'Password123@',
          role: 'parent',
        });
      }, { timeout: 3000 });
    });
  });

  describe('Accessibility', () => {
    it('has accessible form fields', () => {
      const { getByPlaceholderText } = renderWithStore();

      const firstNameInput = getByPlaceholderText('First name');
      const lastNameInput = getByPlaceholderText('Last name');
      const emailInput = getByPlaceholderText('Email address');
      const passwordInput = getByPlaceholderText('Password');

      expect(firstNameInput).toBeTruthy();
      expect(lastNameInput).toBeTruthy();
      expect(emailInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
    });

    it('has accessible buttons', () => {
      const { getByText } = renderWithStore();

      const signUpButton = getByText('Create Account');
      const loginLink = getByText('Sign In');

      expect(signUpButton).toBeTruthy();
      expect(loginLink).toBeTruthy();
    });
  });
});

jest.setTimeout(10000); 