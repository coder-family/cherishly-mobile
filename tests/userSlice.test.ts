import { configureStore } from '@reduxjs/toolkit';
import userReducer, { uploadUserAvatar } from '../app/redux/slices/userSlice';

// Mock userService
jest.mock('../app/services/userService', () => ({
  uploadAvatar: jest.fn(),
  getCurrentUserById: jest.fn(),
  updateUser: jest.fn(),
}));

// Create a test store
const createTestStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
    },
  });
};

describe('User Slice - Avatar Upload', () => {
  let store: ReturnType<typeof createTestStore>;
  
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'old-avatar-url',
  };

  beforeEach(() => {
    store = createTestStore();
    jest.clearAllMocks();
  });

  describe('uploadUserAvatar async thunk', () => {
    const mockUploadData = {
      userId: '1',
      imageUri: 'file://test-image.jpg',
    };

    const mockUploadResult = {
      avatar: 'new-avatar-url',
    };

    describe('pending state', () => {
      it('should set loading to true and clear error', () => {
        store.dispatch(uploadUserAvatar.pending('', mockUploadData));

        const state = store.getState().user;
        expect(state.loading).toBe(true);
        expect(state.error).toBe(null);
      });
    });

    describe('fulfilled state', () => {
      it('should update currentUser avatar and set loading to false', () => {
        // Set initial state with currentUser
        store.dispatch({
          type: 'user/setCurrentUser',
          payload: mockUser,
        });

        // Dispatch fulfilled action
        store.dispatch(uploadUserAvatar.fulfilled(mockUploadResult, '', mockUploadData));

        const state = store.getState().user;
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
        expect(state.currentUser?.avatar).toBe('new-avatar-url');
      });

      it('should not update avatar if no currentUser', () => {
        // Dispatch fulfilled action without currentUser
        store.dispatch(uploadUserAvatar.fulfilled(mockUploadResult, '', mockUploadData));

        const state = store.getState().user;
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
        expect(state.currentUser).toBe(null);
      });
    });

    describe('rejected state', () => {
      it('should set error message and set loading to false', () => {
        const errorMessage = 'Upload failed';
        store.dispatch(uploadUserAvatar.rejected(new Error(errorMessage), '', mockUploadData, { message: errorMessage }));

        const state = store.getState().user;
        expect(state.loading).toBe(false);
        expect(state.error).toBe(errorMessage);
      });

      it('should use default error message when no error message provided', () => {
        store.dispatch(uploadUserAvatar.rejected(new Error(), '', mockUploadData));

        const state = store.getState().user;
        expect(state.loading).toBe(false);
        expect(state.error).toBe('Failed to upload avatar');
      });
    });
  });

  describe('State transitions', () => {
    it('should handle complete avatar upload flow', async () => {
      // Set initial state with currentUser
      store.dispatch({
        type: 'user/setCurrentUser',
        payload: mockUser,
      });

      const mockUploadData = {
        userId: '1',
        imageUri: 'file://test-image.jpg',
      };

      const mockUploadResult = {
        avatar: 'new-avatar-url',
      };

      // Initial state
      expect(store.getState().user.loading).toBe(false);
      expect(store.getState().user.currentUser?.avatar).toBe('old-avatar-url');

      // Pending state
      store.dispatch(uploadUserAvatar.pending('', mockUploadData));
      expect(store.getState().user.loading).toBe(true);
      expect(store.getState().user.error).toBe(null);

      // Fulfilled state
      store.dispatch(uploadUserAvatar.fulfilled(mockUploadResult, '', mockUploadData));
      expect(store.getState().user.loading).toBe(false);
      expect(store.getState().user.currentUser?.avatar).toBe('new-avatar-url');
      expect(store.getState().user.error).toBe(null);
    });

    it('should handle avatar upload failure flow', async () => {
      const mockUploadData = {
        userId: '1',
        imageUri: 'file://test-image.jpg',
      };

      // Initial state
      expect(store.getState().user.loading).toBe(false);
      expect(store.getState().user.error).toBe(null);

      // Pending state
      store.dispatch(uploadUserAvatar.pending('', mockUploadData));
      expect(store.getState().user.loading).toBe(true);
      expect(store.getState().user.error).toBe(null);

      // Rejected state
      const errorMessage = 'Network error';
      store.dispatch(uploadUserAvatar.rejected(new Error(errorMessage), '', mockUploadData, { message: errorMessage }));
      expect(store.getState().user.loading).toBe(false);
      expect(store.getState().user.error).toBe(errorMessage);
    });
  });
}); 