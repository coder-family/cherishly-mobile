// jest.setup.js - Fixed version without circular dependencies

// Import Buffer for Node.js compatibility
const { Buffer } = require('buffer');

// ===== EXPO MOCKS =====
// Mock the Expo runtime registry and Metro runtime
jest.mock('expo/src/winter/runtime.native', () => ({
  __ExpoImportMetaRegistry: {},
  importMetaRegistry: {},
}));

// Mock @expo/metro-runtime
jest.mock('@expo/metro-runtime', () => ({
  __ExpoImportMetaRegistry: {},
}));

// Mock Expo module entirely
jest.mock('expo', () => ({
  // Add any expo exports that might be needed
  registerRootComponent: jest.fn(),
}));

// Add global Metro runtime mock
global.__ExpoImportMetaRegistry = global.__ExpoImportMetaRegistry || {};

// Add global polyfills
global.TextDecoder = global.TextDecoder || class TextDecoder {
  decode(input) {
    return input.toString();
  }
};

global.TextEncoder = global.TextEncoder || class TextEncoder {
  encode(input) {
    return new Uint8Array(Buffer.from(input));
  }
};

// Mock global fetch if not available
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  }));
}

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock("expo-constants", () => ({}));
jest.mock("expo-image-picker", () => ({}));
jest.mock("expo-linking", () => ({}));
jest.mock("expo-splash-screen", () => ({}));
jest.mock("expo-status-bar", () => ({}));
jest.mock("expo-av", () => ({}));
jest.mock("expo-haptics", () => ({}));

// Mock environment variables
jest.mock('@env', () => ({
  API_BASE_URL: 'https://api.test.com',
  CLOUDINARY_UPLOAD_URL: 'https://api.cloudinary.com/v1_1/test/upload',
  CLOUDINARY_UPLOAD_PRESET: 'test_preset',
}));

// ===== ICON MOCKS =====
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  
  const MockIcon = (props) => {
    return React.createElement('Text', {
      testID: props.testID || 'icon',
      ...props
    }, props.name || 'Icon');
  };

  return {
    Ionicons: MockIcon,
    MaterialIcons: MockIcon,
    AntDesign: MockIcon,
    FontAwesome: MockIcon,
    Feather: MockIcon,
    MaterialCommunityIcons: MockIcon,
  };
});

// ===== FORM LIBRARY MOCKS =====
// Mock react-hook-form
jest.mock('react-hook-form', () => {
  const React = require('react');
  
  return {
    useForm: jest.fn(() => ({
      control: {},
      handleSubmit: jest.fn((fn) => (data) => {
        // Mock form data for testing
        const mockData = {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
          email: 'john.doe@example.com',
          password: 'Password123@',
          confirmPassword: 'Password123@',
          role: 'parent',
        };
        return fn(mockData);
      }),
      formState: { errors: {} },
      setValue: jest.fn(),
      getValues: jest.fn(),
      watch: jest.fn(),
      reset: jest.fn(),
      trigger: jest.fn(),
    })),
    Controller: ({ render, name }) => {
      const mockField = {
        onChange: jest.fn(),
        onBlur: jest.fn(),
        value: '',
        name: name,
        ref: jest.fn(),
      };
      const mockFieldState = {
        invalid: false,
        isTouched: false,
        isDirty: false,
        error: undefined,
      };
      const mockFormState = {
        errors: {},
        touchedFields: {},
        dirtyFields: {},
        isSubmitted: false,
        isLoading: false,
        isValidating: false,
        isValid: true,
        submitCount: 0,
      };
      return render({
        field: mockField,
        fieldState: mockFieldState,
        formState: mockFormState,
      });
    },
    useController: jest.fn(() => ({
      field: {
        onChange: jest.fn(),
        onBlur: jest.fn(),
        value: '',
        name: 'mockField',
        ref: jest.fn(),
      },
      fieldState: {
        invalid: false,
        isTouched: false,
        isDirty: false,
        error: undefined,
      },
      formState: {
        errors: {},
        touchedFields: {},
        dirtyFields: {},
        isSubmitted: false,
        isLoading: false,
        isValidating: false,
        isValid: true,
        submitCount: 0,
      },
    })),
  };
});

// Mock @hookform/resolvers/yup
jest.mock('@hookform/resolvers/yup', () => ({
  yupResolver: jest.fn(() => jest.fn()),
}));

// ===== REACT NATIVE CORE COMPONENT MOCKS =====
jest.mock('react-native', () => ({
  // Mock the components you're using
  TouchableOpacity: 'TouchableOpacity',
  TouchableWithoutFeedback: 'TouchableWithoutFeedback',
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  ImageBackground: 'ImageBackground',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  Modal: 'Modal',
  ScrollView: 'ScrollView',
  FlatList: 'FlatList',
  SectionList: 'SectionList',
  Image: 'Image',
  SafeAreaView: 'SafeAreaView',
  StatusBar: 'StatusBar',
  ActivityIndicator: 'ActivityIndicator', // Add this missing component
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn(),
    hairlineWidth: 1,
  },
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios || obj.default),
    Version: 14,
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 390, height: 844 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  Animated: {
    timing: jest.fn(() => ({
      start: jest.fn((callback) => callback && callback({ finished: true })),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    spring: jest.fn(() => ({
      start: jest.fn((callback) => callback && callback({ finished: true })),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      addListener: jest.fn(() => 'listener-id'),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
      stopAnimation: jest.fn(),
      resetAnimation: jest.fn(),
      interpolate: jest.fn(() => ({
        addListener: jest.fn(() => 'listener-id'),
        removeListener: jest.fn(),
        removeAllListeners: jest.fn(),
      })),
    })),
    View: 'Animated.View',
    Text: 'Animated.Text',
    ScrollView: 'Animated.ScrollView',
    FlatList: 'Animated.FlatList',
  },
  Alert: {
    alert: jest.fn(),
    prompt: jest.fn(),
  },
  Keyboard: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    dismiss: jest.fn(),
  },
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  // Mock useColorScheme hook
  useColorScheme: jest.fn(() => 'light'),
}));

// ===== THIRD-PARTY LIBRARY MOCKS =====
// Mock AsyncStorage with comprehensive method support
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
    getAllKeys: jest.fn().mockResolvedValue([]),
    multiGet: jest.fn().mockResolvedValue([]),
    multiSet: jest.fn().mockResolvedValue(undefined),
    multiRemove: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
    mergeItem: jest.fn().mockResolvedValue(undefined),
    multiMerge: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock StorageUtils to prevent AsyncStorage issues in tests
jest.mock('./app/utils/storageUtils', () => ({
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

// Mock react-native-chart-kit
jest.mock('react-native-chart-kit', () => {
  const React = require('react');
  
  const MockLineChart = (props) => {
    return React.createElement('View', {
      testID: 'line-chart',
      ...props
    }, 'LineChart');
  };

  const MockBarChart = (props) => {
    return React.createElement('View', {
      testID: 'bar-chart',
      ...props
    }, 'BarChart');
  };

  const MockPieChart = (props) => {
    return React.createElement('View', {
      testID: 'pie-chart',
      ...props
    }, 'PieChart');
  };

  return {
    LineChart: MockLineChart,
    BarChart: MockBarChart,
    PieChart: MockPieChart,
    ProgressChart: MockLineChart,
    ContributionGraph: MockLineChart,
    StackedBarChart: MockBarChart,
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
}));

// Mock @react-native-community/datetimepicker
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  
  const MockDateTimePicker = (props) => {
    return React.createElement('View', { 
      testID: 'date-time-picker',
      ...props 
    }, 'DateTimePicker');
  };
  
  return {
    __esModule: true,
    default: MockDateTimePicker,
  };
});

// Mock react-native-paper-dropdown
jest.mock('react-native-paper-dropdown', () => ({
  Dropdown: 'Dropdown',
}));

// ===== GLOBAL CLEANUP =====
// Use real timers for testing
jest.useRealTimers();

// Clean up after each test
global.afterEach(() => {
  jest.clearAllMocks();
});

// Clean up after all tests
global.afterAll(() => {
  jest.restoreAllMocks();
});

// Silence console.warn during tests (optional)
global.console.warn = jest.fn();