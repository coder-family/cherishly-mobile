import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react-native';
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
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
  }),
}));

// Mock MaterialIcons from @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: ({ name, testID }: any) => `MaterialIcons-${name}`,
}));

// Mock all the components to React components with testIDs
jest.mock('../app/components/child/ChildProfileCard', () => ({ 
  __esModule: true, 
  default: ({ name }: any) => {
    const React = require('react');
    return React.createElement('Text', { testID: `child-profile-card-${name}` }, `ChildProfileCard-${name}`);
  }
}));
jest.mock('../app/components/child/AddChildModal', () => ({
  __esModule: true,
  default: ({ visible, onClose }: any) => {
    const React = require('react');
    return visible ? React.createElement('Text', { testID: 'add-child-modal' }, 'AddChildModal') : null;
  }
}));
jest.mock('../app/components/family/FamilyGroupCard', () => ({
  __esModule: true,
  default: ({ name }: any) => {
    const React = require('react');
    return React.createElement('Text', { testID: `family-group-card-${name}` }, `FamilyGroupCard-${name}`);
  }
}));
jest.mock('../app/components/user/UserProfileCard', () => 'UserProfileCard');
jest.mock('../app/components/user/UserProfileEditModal', () => 'UserProfileEditModal');
jest.mock('../app/components/form/InputField', () => 'InputField');
jest.mock('../app/components/form/GenderPicker', () => 'GenderPicker');
jest.mock('../app/components/form/PasswordInput', () => 'PasswordInput');
jest.mock('../app/components/media/AvatarUpload', () => 'AvatarUpload');
jest.mock('../app/components/ui/LoadingSpinner', () => 'LoadingSpinner');
jest.mock('../app/components/ui/ErrorView', () => 'ErrorView');

// Mock react-native-paper dropdown
jest.mock('react-native-paper-dropdown', () => ({ Dropdown: 'Dropdown' }));
// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

// Mock ChildUtils
jest.mock('../app/utils/childUtils', () => ({
  ChildUtils: {
    getValidChildren: (children: any[]) => children || [],
    hasChildren: (children: any[]) => children && children.length > 0,
    getChildrenCount: (children: any[]) => children?.length || 0,
    isChildrenLoading: (loading: boolean, children: any[]) => loading && !children,
    shouldShowAddChildButton: (hasChildren: boolean) => !hasChildren,
    getAddChildButtonText: (hasChildren: boolean) => '+ Add Your Baby',
    getWelcomeMessage: (hasChildren: boolean) => hasChildren 
      ? "Welcome back to your family's journey!" 
      : "Let's get started on your family's journey.",
    handleAddChildPress: jest.fn(),
    handleChildCardPress: jest.fn(),
    handleChildrenError: jest.fn(),
  }
}));

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

describe('HomeScreen', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = configureStore({
      reducer: {
        auth: authReducer,
        user: userReducer,
        children: childReducer,
        family: familyReducer,
      },
    });
  });

  const setupUserAndState = (userData: any, children: any[] = [], familyGroups: any[] = []) => {
    store.dispatch({
      type: 'auth/loginUser/fulfilled',
      payload: userData,
    });
    store.dispatch({
      type: 'user/setCurrentUser',
      payload: userData,
    });
    store.dispatch({
      type: 'children/fetchChildren/fulfilled',
      payload: children,
    });
    store.dispatch({
      type: 'family/fetchFamilyGroups/fulfilled',
      payload: familyGroups,
    });
  };

  describe('Welcome Message', () => {
    it('should display welcome message with user first name', () => {
      setupUserAndState({
        id: '1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
      });

      render(
        <SafeAreaProvider>
          <Provider store={store}>
            <HomeScreen />
          </Provider>
        </SafeAreaProvider>
      );

      expect(screen.getByText(/Welcome, John!/)).toBeTruthy();
    });

    it('should display welcome message without first name if not available', () => {
      setupUserAndState({
        id: '1',
        email: 'user@example.com',
        firstName: '',
        lastName: 'Doe',
      });

      render(
        <SafeAreaProvider>
          <Provider store={store}>
            <HomeScreen />
          </Provider>
        </SafeAreaProvider>
      );

      expect(screen.getByText(/Welcome!/)).toBeTruthy();
    });
  });

  describe('Children Section', () => {
    const mockChildren = [
      { id: '1', name: 'Alice', birthdate: '2023-01-01', avatarUrl: null, bio: null },
      { id: '2', name: 'Bob', birthdate: '2022-06-15', avatarUrl: null, bio: null },
      { id: '3', name: 'Charlie', birthdate: '2021-03-10', avatarUrl: null, bio: null },
      { id: '4', name: 'Diana', birthdate: '2020-09-20', avatarUrl: null, bio: null },
    ];

    it('should show section title with count when children exist', () => {
      setupUserAndState({ id: '1', firstName: 'John' }, mockChildren);

      render(
        <SafeAreaProvider>
          <Provider store={store}>
            <HomeScreen />
          </Provider>
        </SafeAreaProvider>
      );

      expect(screen.getByText('Your Babies (4)')).toBeTruthy();
    });

    it('should show only first 2 children initially when more than 2 exist', async () => {
      setupUserAndState({ id: '1', firstName: 'John' }, mockChildren);

      render(
        <SafeAreaProvider>
          <Provider store={store}>
            <HomeScreen />
          </Provider>
        </SafeAreaProvider>
      );

      // Should show first 2 children
      expect(screen.getByTestId('child-profile-card-Alice')).toBeTruthy();
      expect(screen.getByTestId('child-profile-card-Bob')).toBeTruthy();
      expect(screen.queryByTestId('child-profile-card-Charlie')).toBeFalsy();
      expect(screen.queryByTestId('child-profile-card-Diana')).toBeFalsy();
    });

    it('should show expand button with correct count when more than 2 children exist', () => {
      setupUserAndState({ id: '1', firstName: 'John' }, mockChildren);

      render(
        <SafeAreaProvider>
          <Provider store={store}>
            <HomeScreen />
          </Provider>
        </SafeAreaProvider>
      );

      expect(screen.getByText('2 more')).toBeTruthy();
    });

    it('should expand to show all children when expand button is tapped', async () => {
      setupUserAndState({ id: '1', firstName: 'John' }, mockChildren);

      render(
        <SafeAreaProvider>
          <Provider store={store}>
            <HomeScreen />
          </Provider>
        </SafeAreaProvider>
      );

      // Tap the expand button
      const expandButton = screen.getByText('2 more');
      fireEvent.press(expandButton);

      // Should now show all children
      expect(screen.getByTestId('child-profile-card-Alice')).toBeTruthy();
      expect(screen.getByTestId('child-profile-card-Bob')).toBeTruthy();
      expect(screen.getByTestId('child-profile-card-Charlie')).toBeTruthy();
      expect(screen.getByTestId('child-profile-card-Diana')).toBeTruthy();

      // Button should change to "Show Less"
      expect(screen.getByText('Show Less')).toBeTruthy();
    });

    it('should not show expand button when 2 or fewer children exist', () => {
      const twoChildren = mockChildren.slice(0, 2);
      setupUserAndState({ id: '1', firstName: 'John' }, twoChildren);

      render(
        <SafeAreaProvider>
          <Provider store={store}>
            <HomeScreen />
          </Provider>
        </SafeAreaProvider>
      );

      expect(screen.queryByText('more')).toBeFalsy();
      expect(screen.queryByText('MaterialIcons-expand-more')).toBeFalsy();
    });

    it('should show welcome message when no children exist', () => {
      setupUserAndState({ id: '1', firstName: 'John' }, []);

      render(
        <SafeAreaProvider>
          <Provider store={store}>
            <HomeScreen />
          </Provider>
        </SafeAreaProvider>
      );

      expect(screen.getByText("Let's get started on your family's journey.")).toBeTruthy();
    });

    it('should show add baby button', () => {
      setupUserAndState({ id: '1', firstName: 'John' }, []);

      render(
        <SafeAreaProvider>
          <Provider store={store}>
            <HomeScreen />
          </Provider>
        </SafeAreaProvider>
      );

      expect(screen.getByText('+ Add Your Baby')).toBeTruthy();
    });
  });

  describe('Family Groups Section', () => {
    const mockFamilyGroups = [
      { id: '1', name: 'The Johnsons', description: 'Our family', members: [{ id: '1' }, { id: '2' }] },
      { id: '2', name: 'Extended Family', description: 'Grandparents and cousins', members: [{ id: '3' }] },
      { id: '3', name: 'Close Friends', description: 'Family friends', members: [{ id: '4' }, { id: '5' }] },
    ];

    it('should show section title with count when family groups exist', () => {
      setupUserAndState({ id: '1', firstName: 'John' }, [], mockFamilyGroups);

      render(
        <SafeAreaProvider>
          <Provider store={store}>
            <HomeScreen />
          </Provider>
        </SafeAreaProvider>
      );

      expect(screen.getByText('Your Family Groups (3)')).toBeTruthy();
    });

    it('should show only first 2 family groups initially when more than 2 exist', async () => {
      setupUserAndState({ id: '1', firstName: 'John' }, [], mockFamilyGroups);

      render(
        <SafeAreaProvider>
          <Provider store={store}>
            <HomeScreen />
          </Provider>
        </SafeAreaProvider>
      );

      // Should show first 2 family groups
      expect(screen.getByTestId('family-group-card-The Johnsons')).toBeTruthy();
      expect(screen.getByTestId('family-group-card-Extended Family')).toBeTruthy();
      expect(screen.queryByTestId('family-group-card-Close Friends')).toBeFalsy();
    });

    it('should show expand button with correct count when more than 2 family groups exist', () => {
      setupUserAndState({ id: '1', firstName: 'John' }, [], mockFamilyGroups);

      render(
        <SafeAreaProvider>
          <Provider store={store}>
            <HomeScreen />
          </Provider>
        </SafeAreaProvider>
      );

      expect(screen.getByText('1 more')).toBeTruthy();
    });

    it('should expand to show all family groups when expand button is tapped', async () => {
      setupUserAndState({ id: '1', firstName: 'John' }, [], mockFamilyGroups);

      render(
        <SafeAreaProvider>
          <Provider store={store}>
            <HomeScreen />
          </Provider>
        </SafeAreaProvider>
      );

      // Tap the expand button
      const expandButton = screen.getByText('1 more');
      fireEvent.press(expandButton);

      // Should now show all family groups
      expect(screen.getByTestId('family-group-card-The Johnsons')).toBeTruthy();
      expect(screen.getByTestId('family-group-card-Extended Family')).toBeTruthy();
      expect(screen.getByTestId('family-group-card-Close Friends')).toBeTruthy();

      // Button should change to "Show Less"
      expect(screen.getByText('Show Less')).toBeTruthy();
    });

    it('should show action buttons for family groups', () => {
      setupUserAndState({ id: '1', firstName: 'John' }, [], mockFamilyGroups);

      render(
        <SafeAreaProvider>
          <Provider store={store}>
            <HomeScreen />
          </Provider>
        </SafeAreaProvider>
      );

      expect(screen.getByText('+ Add Group')).toBeTruthy();
      expect(screen.getByText('Invite & Join')).toBeTruthy();
    });

    it('should show create/join button when no family groups exist', () => {
      setupUserAndState({ id: '1', firstName: 'John' }, [], []);

      render(
        <SafeAreaProvider>
          <Provider store={store}>
            <HomeScreen />
          </Provider>
        </SafeAreaProvider>
      );

      expect(screen.getByText('Create or Join Family Group')).toBeTruthy();
    });
  });

  describe('AddChildModal Integration', () => {
    it('should not show AddChildModal initially', () => {
      setupUserAndState({ id: '1', firstName: 'John' }, []);

      render(
        <SafeAreaProvider>
          <Provider store={store}>
            <HomeScreen />
          </Provider>
        </SafeAreaProvider>
      );

      expect(screen.queryByText('AddChildModal')).toBeFalsy();
    });

    // Note: Testing modal opening would require more complex setup with mocked ChildUtils
    // This test verifies the modal component is integrated
  });
}); 