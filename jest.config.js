module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.globals.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-redux|@react-redux|expo|expo-modules-core|react-native-reanimated|@react-native|react-native|@expo|react-native-chart-kit|react-native-svg|@expo/metro-runtime)/)/',
  ],
  moduleNameMapper: {
    '^react-native/Libraries/Modal/Modal$': '<rootDir>/mocks/ModalMock.js',
    '^react-native/Libraries/Animated/NativeAnimatedHelper$': '<rootDir>/mocks/NativeAnimatedHelper.js',
    '^react-native-svg$': '<rootDir>/mocks/react-native-svg.js',
    '^expo/src/winter/runtime.native$': '<rootDir>/mocks/ExpoRuntimeMock.js',
    '^@env$': '<rootDir>/mocks/EnvMock.js',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironment: 'node',
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/index.tsx',
    '!app/**/_layout.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  // Timer and cleanup settings
  fakeTimers: {
    enableGlobally: true,
    legacyFakeTimers: false,
  },
  // Handle worker process cleanup
  maxWorkers: 1,
  // Increase timeout for async operations
  testTimeout: 15000,
  // Detect open handles to help with cleanup
  detectOpenHandles: true,
  // Force exit after tests complete
  forceExit: true,
};