import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import authReducer from '../app/redux/slices/authSlice';
import childReducer from '../app/redux/slices/childSlice';
import familyReducer from '../app/redux/slices/familySlice';
import userReducer from '../app/redux/slices/userSlice';
import HomeScreen from '../app/tabs/home';

// Native module mocks for Jest/Expo
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  getEnforcing: () => ({}),
  get: () => ({}),
}));
jest.mock('react-native/Libraries/Components/Clipboard/Clipboard', () => ({}));
jest.mock('react-native/Libraries/Components/ProgressBarAndroid/ProgressBarAndroid', () => 'ProgressBarAndroid');

// Mock NativeModules
jest.mock('react-native/Libraries/BatchedBridge/NativeModules', () => ({
  NativeModules: {
    DeviceInfo: {
      getConstants: () => ({
        Dimensions: {
          window: { width: 375, height: 667 },
          screen: { width: 375, height: 667 },
        },
      }),
    },
  },
}));

// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: () => ({
    window: { width: 375, height: 667 },
    screen: { width: 375, height: 667 },
  }),
  set: () => {},
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: any) => children,
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock all the components to simple strings
jest.mock('../app/components/child/ChildProfileCard', () => 'ChildProfileCard');
jest.mock('../app/components/form/InputField', () => 'InputField');
jest.mock('../app/components/form/PasswordInput', () => 'PasswordInput');
jest.mock('../app/components/media/AvatarUpload', () => 'AvatarUpload');
jest.mock('../app/components/ui/LoadingSpinner', () => 'LoadingSpinner');
jest.mock('../app/components/ui/ErrorView', () => 'ErrorView');

// Mock react-native-paper dropdown
jest.mock('react-native-paper-dropdown', () => ({ Dropdown: 'Dropdown' }));
// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

// Mock PixelRatio
jest.mock('react-native/Libraries/Utilities/PixelRatio', () => {
  const pixelRatio = {
    get: () => 2,
    roundToNearestPixel: (n: number) => Math.round(n),
  };
  return {
    ...pixelRatio,
    default: pixelRatio,
  };
});

// Mock I18nManager for RN
jest.mock('react-native/Libraries/ReactNative/I18nManager', () => ({
  getConstants: () => ({
    isRTL: false,
    doLeftAndRightSwapInRTL: true,
    localeIdentifier: 'en_US',
  }),
}));

// Mock NativePlatformConstantsIOS for RN
jest.mock('react-native/Libraries/Utilities/NativePlatformConstantsIOS', () => ({
  __esModule: true,
  default: {
    getConstants: () => ({
      isTesting: true,
      isDisableAnimations: false,
    }),
  },
}));

describe('HomeScreen Welcome Message', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
        user: userReducer,
        children: childReducer,
        family: familyReducer,
      },
    });
  });

  it('should display welcome message with user first name', () => {
    // Set up the store with user data in both auth and user state
    store.dispatch({
      type: 'auth/loginUser/fulfilled',
      payload: {
        id: '1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
    });
    store.dispatch({
      type: 'user/setCurrentUser',
      payload: {
        id: '1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
    });
    let debug;
    try {
      ({ debug } = render(
        <SafeAreaProvider>
          <Provider store={store}>
            <HomeScreen />
          </Provider>
        </SafeAreaProvider>
      ));
      expect(screen.getByText(/Welcome, John!/)).toBeTruthy();
    } catch (error) {
      if (debug) debug();
      throw error;
    }
  });

  it('should display welcome message without first name if not available', () => {
    store.dispatch({
      type: 'auth/loginUser/fulfilled',
      payload: {
        id: '1',
        email: 'user@example.com',
        firstName: '',
        lastName: 'Doe',
      },
    });
    store.dispatch({
      type: 'user/setCurrentUser',
      payload: {
        id: '1',
        email: 'user@example.com',
        firstName: '',
        lastName: 'Doe',
      },
    });
    let debug;
    try {
      ({ debug } = render(
        <SafeAreaProvider>
          <Provider store={store}>
            <HomeScreen />
          </Provider>
        </SafeAreaProvider>
      ));
      expect(screen.getByText(/Welcome!/)).toBeTruthy();
    } catch (error) {
      if (debug) debug();
      throw error;
    }
  });
}); 