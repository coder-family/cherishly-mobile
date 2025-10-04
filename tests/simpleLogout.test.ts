import authService from '../app/services/authService';

// Mock StorageUtils
jest.mock('../app/utils/storageUtils', () => ({
  StorageUtils: {
    setItem: jest.fn().mockResolvedValue(undefined),
    getItem: jest.fn().mockResolvedValue(null),
    removeItem: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
    getAllKeys: jest.fn().mockResolvedValue([]),
    isAvailable: jest.fn().mockResolvedValue(true),
    debugStorage: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock apiService
jest.mock('../app/services/apiService', () => ({
  __esModule: true,
  default: {
    post: jest.fn().mockResolvedValue({}),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  removeItem: jest.fn(),
  getItem: jest.fn().mockResolvedValue('mock-token'),
}));

// Mock conditionalLog
jest.mock('../app/utils/logUtils', () => ({
  conditionalLog: {
    auth: jest.fn(),
  },
}));

describe('Simple Logout Test', () => {
  it('should call logout without error', async () => {
    // This should work without throwing any errors
    await expect(authService.logout()).resolves.not.toThrow();
  });
}); 