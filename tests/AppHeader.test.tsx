import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import { Provider } from 'react-redux';
import AppHeader from '../app/components/layout/AppHeader';
import authReducer from '../app/redux/slices/authSlice';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User' },
        loading: false,
        error: null,
        ...initialState,
      },
    },
  });
};

describe('AppHeader Component', () => {
  it('renders without logout button by default', () => {
    const store = createTestStore();
    
    const { queryByTestId } = render(
      <Provider store={store}>
        <AppHeader />
      </Provider>
    );

    expect(queryByTestId('logout-button')).toBeNull();
  });

  it('renders logout button when showLogoutButton is true', () => {
    const store = createTestStore();
    
    const { getByTestId } = render(
      <Provider store={store}>
        <AppHeader showLogoutButton={true} />
      </Provider>
    );

    expect(getByTestId('logout-button')).toBeTruthy();
  });

  it('shows logout confirmation dialog when logout button is pressed', () => {
    const store = createTestStore();
    
    const { getByTestId } = render(
      <Provider store={store}>
        <AppHeader showLogoutButton={true} />
      </Provider>
    );

    const logoutButton = getByTestId('logout-button');
    fireEvent.press(logoutButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Logout',
      'Are you sure you want to logout?',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
        expect.objectContaining({ text: 'Logout', style: 'destructive' })
      ])
    );
  });

  it('renders search input when showSearch is true', () => {
    const store = createTestStore();
    
    const { getByPlaceholderText } = render(
      <Provider store={store}>
        <AppHeader showSearch={true} searchPlaceholder="Search memories" />
      </Provider>
    );

    expect(getByPlaceholderText('Search memories')).toBeTruthy();
  });

  it('renders back button when showBackButton is true', () => {
    const store = createTestStore();
    
    const { getByTestId } = render(
      <Provider store={store}>
        <AppHeader showBackButton={true} />
      </Provider>
    );

    expect(getByTestId('back-button')).toBeTruthy();
  });

  it('does not render back button when showBackButton is false', () => {
    const store = createTestStore();
    
    const { queryByTestId } = render(
      <Provider store={store}>
        <AppHeader showBackButton={false} />
      </Provider>
    );

    expect(queryByTestId('back-button')).toBeNull();
  });

  it('calls onSearchChange when search text changes', () => {
    const store = createTestStore();
    const mockOnSearchChange = jest.fn();
    
    const { getByPlaceholderText } = render(
      <Provider store={store}>
        <AppHeader 
          showSearch={true} 
          searchPlaceholder="Search memories"
          onSearchChange={mockOnSearchChange}
        />
      </Provider>
    );

    const searchInput = getByPlaceholderText('Search memories');
    fireEvent.changeText(searchInput, 'test search');

    expect(mockOnSearchChange).toHaveBeenCalledWith('test search');
  });

  it('clears search text when clear button is pressed', () => {
    const store = createTestStore();
    
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <AppHeader showSearch={true} searchPlaceholder="Search memories" />
      </Provider>
    );

    const searchInput = getByPlaceholderText('Search memories');
    fireEvent.changeText(searchInput, 'test search');

    // Clear button should appear
    const clearButton = getByText('close-circle');
    fireEvent.press(clearButton);

    // Search input should be cleared
    expect(searchInput.props.value).toBe('');
  });
}); 