import authService from '../app/services/authService';
import apiService from '../app/services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock apiService
jest.mock('../app/services/apiService', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock conditionalLog
jest.mock('../app/utils/logUtils', () => ({
  conditionalLog: {
    auth: jest.fn(),
    authError: jest.fn(),
  },
}));

describe('AuthService Logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logout', () => {
    it('should call logout API endpoint', async () => {
      // Mock successful API response
      apiService.post.mockResolvedValue({});

      await authService.logout();

      expect(apiService.post).toHaveBeenCalledWith('/users/logout');
    });

    it('should clear local tokens even if API call fails', async () => {
      // Mock API failure
      const error = new Error('Network error');
      apiService.post.mockRejectedValue(error);

      // Mock AsyncStorage methods
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await authService.logout();

      // Should still clear tokens even if API fails
      expect(AsyncStorage.removeItem).toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      // Mock network error
      const networkError = {
        request: {},
        message: 'Network error'
      };
      apiService.post.mockRejectedValue(networkError);

      // Should not throw error
      await expect(authService.logout()).resolves.not.toThrow();
    });

    it('should handle server errors gracefully', async () => {
      // Mock server error
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      };
      apiService.post.mockRejectedValue(serverError);

      // Should not throw error
      await expect(authService.logout()).resolves.not.toThrow();
    });
  });
}); 