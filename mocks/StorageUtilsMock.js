// StorageUtils mock for testing
// This prevents AsyncStorage errors in tests by mocking all StorageUtils methods

const StorageUtilsMock = {
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
  getAllKeys: jest.fn().mockResolvedValue([]),
  isAvailable: jest.fn().mockResolvedValue(true),
  debugStorage: jest.fn().mockResolvedValue(undefined),
};

module.exports = { StorageUtils: StorageUtilsMock };