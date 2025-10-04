// Comprehensive AsyncStorage mock for testing
// This mock implements all AsyncStorage methods that your app uses

const AsyncStorageMock = {
  // Core storage methods
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
  
  // Advanced methods that were causing issues
  getAllKeys: jest.fn().mockResolvedValue([]),
  multiGet: jest.fn().mockResolvedValue([]),
  multiSet: jest.fn().mockResolvedValue(undefined),
  multiRemove: jest.fn().mockResolvedValue(undefined),
  mergeItem: jest.fn().mockResolvedValue(undefined),
  multiMerge: jest.fn().mockResolvedValue(undefined),
  
  // Utility methods for testing
  flushGetRequests: jest.fn(),
};

module.exports = AsyncStorageMock;