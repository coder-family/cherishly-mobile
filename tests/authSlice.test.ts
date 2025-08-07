import { configureStore } from '@reduxjs/toolkit';
import authReducer, { clearError, registerUser } from '../app/redux/slices/authSlice';

// Mock authService
jest.mock('../app/services/authService', () => ({
  __esModule: true,
  default: {
    register: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

// Create a test store
const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
  });
};

describe('Auth Slice', () => {
  let store: ReturnType<typeof createTestStore>;
  
  const mockRegisterData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    dateOfBirth: '1990-01-01',
    role: 'parent',
  };

  beforeEach(() => {
    store = createTestStore();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().auth;
      
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBe(null);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe('clearError action', () => {
    it('should clear error state', () => {
      // Set initial state with error
      store.dispatch(registerUser.rejected(new Error('Test error'), '', mockRegisterData, { message: 'Test error' }));

      // Verify error is set
      expect(store.getState().auth.error).toBe('Test error');

      // Clear error
      store.dispatch(clearError());

      // Verify error is cleared
      expect(store.getState().auth.error).toBe(null);
    });
  });

  describe('registerUser async thunk', () => {
    const mockUser = {
      id: '1',
      email: 'john.doe@example.com',
      firstName: 'John',
    };

    describe('pending state', () => {
      it('should set loading to true and clear error', () => {
        store.dispatch(registerUser.pending('', mockRegisterData));

        const state = store.getState().auth;
        expect(state.loading).toBe(true);
        expect(state.error).toBe(null);
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBe(null);
      });
    });

    describe('fulfilled state', () => {
      it('should set user data and authentication state', () => {
        store.dispatch(registerUser.fulfilled(mockUser, '', mockRegisterData));

        const state = store.getState().auth;
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(mockUser);
      });
    });

    describe('rejected state', () => {
      it('should set error message and reset authentication state', () => {
        const errorMessage = 'Registration failed';
        store.dispatch(registerUser.rejected(new Error(errorMessage), '', mockRegisterData, { message: errorMessage }));

        const state = store.getState().auth;
        expect(state.loading).toBe(false);
        expect(state.error).toBe(errorMessage);
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBe(null);
      });

      it('should use default error message when no error message provided', () => {
        store.dispatch(registerUser.rejected(new Error(), '', mockRegisterData));

        const state = store.getState().auth;
        expect(state.loading).toBe(false);
        expect(state.error).toBe('Registration failed');
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBe(null);
      });
    });
  });

  describe('State transitions', () => {
    it('should handle complete registration flow', async () => {
      const mockUser = {
        id: '1',
        email: 'john.doe@example.com',
        firstName: 'John',
      };

      // Initial state
      expect(store.getState().auth.loading).toBe(false);
      expect(store.getState().auth.isAuthenticated).toBe(false);

      // Pending state
      store.dispatch(registerUser.pending('', mockRegisterData));
      expect(store.getState().auth.loading).toBe(true);
      expect(store.getState().auth.error).toBe(null);

      // Fulfilled state
      store.dispatch(registerUser.fulfilled(mockUser, '', mockRegisterData));
      expect(store.getState().auth.loading).toBe(false);
      expect(store.getState().auth.isAuthenticated).toBe(true);
      expect(store.getState().auth.user).toEqual(mockUser);
      expect(store.getState().auth.error).toBe(null);
    });

    it('should handle registration failure flow', async () => {

      // Initial state
      expect(store.getState().auth.loading).toBe(false);
      expect(store.getState().auth.isAuthenticated).toBe(false);

      // Pending state
      store.dispatch(registerUser.pending('', mockRegisterData));
      expect(store.getState().auth.loading).toBe(true);
      expect(store.getState().auth.error).toBe(null);

      // Rejected state
      const errorMessage = 'Network error';
      store.dispatch(registerUser.rejected(new Error(errorMessage), '', mockRegisterData, { message: errorMessage }));
      expect(store.getState().auth.loading).toBe(false);
      expect(store.getState().auth.isAuthenticated).toBe(false);
      expect(store.getState().auth.user).toBe(null);
      expect(store.getState().auth.error).toBe(errorMessage);
    });
  });

  describe('Error handling', () => {
    it('should clear error when clearError action is dispatched', () => {
      // Set an error first
      store.dispatch(registerUser.rejected(new Error('Test error'), '', mockRegisterData));
      expect(store.getState().auth.error).toBe('Test error');

      // Clear the error
      store.dispatch(clearError());
      expect(store.getState().auth.error).toBe(null);
    });

    it('should maintain other state when clearing error', () => {
      // Set up a state with user authenticated
      const mockUser = {
        id: '1',
        email: 'john.doe@example.com',
        firstName: 'John',
      };

      store.dispatch(registerUser.fulfilled(mockUser, '', mockRegisterData));
      store.dispatch(registerUser.rejected(new Error('Test error'), '', mockRegisterData));

      // Verify state before clearing error
      expect(store.getState().auth.isAuthenticated).toBe(false);
      expect(store.getState().auth.user).toBe(null);
      expect(store.getState().auth.error).toBe('Test error');

      // Clear error
      store.dispatch(clearError());

      // Verify error is cleared but other state remains
      expect(store.getState().auth.error).toBe(null);
      expect(store.getState().auth.isAuthenticated).toBe(false);
      expect(store.getState().auth.user).toBe(null);
    });
  });
}); 