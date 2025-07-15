import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { ChangePasswordData, UpdateUserData, User } from '../../services/userService';
import * as userService from '../../services/userService';

// Async thunks
export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (userId: string) => {
    return await userService.getCurrentUserById(userId);
  }
);

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId: string) => {
    return await userService.getUser(userId);
  }
);

export const fetchAllUsers = createAsyncThunk(
  'user/fetchAllUsers',
  async () => {
    return await userService.getAllUsers();
  }
);

export const fetchUsersInGroup = createAsyncThunk(
  'user/fetchUsersInGroup',
  async () => {
    return await userService.getUsersInGroup();
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ userId, data }: { userId: string; data: UpdateUserData }) => {
    return await userService.updateUser(userId, data);
  }
);

export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (data: ChangePasswordData) => {
    await userService.changePassword(data);
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (userId: string) => {
    await userService.deleteUser(userId);
    return userId;
  }
);

export const restoreUser = createAsyncThunk(
  'user/restoreUser',
  async (userId: string) => {
    return await userService.restoreUser(userId);
  }
);

export const logout = createAsyncThunk(
  'user/logout',
  async () => {
    await userService.logout();
  }
);

export const uploadUserAvatar = createAsyncThunk(
  'user/uploadAvatar',
  async ({ userId, imageUri }: { userId: string; imageUri: string }) => {
    return await userService.uploadAvatar(userId, imageUri);
  }
);

// Slice
interface UserState {
  currentUser: User | null;
  users: User[];
  groupUsers: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  users: [],
  groupUsers: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user data';
      })
      // Fetch single user
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.loading = false;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user';
      })
      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      // Fetch users in group
      .addCase(fetchUsersInGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersInGroup.fulfilled, (state, action) => {
        state.groupUsers = action.payload;
        state.loading = false;
      })
      .addCase(fetchUsersInGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch group users';
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.loading = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update user';
      })
      // Change password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to change password';
      })
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload);
        if (state.currentUser?.id === action.payload) {
          state.currentUser = null;
        }
        state.loading = false;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete user';
      })
      // Restore user
      .addCase(restoreUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(restoreUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to restore user';
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.currentUser = null;
        state.users = [];
        state.groupUsers = [];
        state.error = null;
      })
      // Upload avatar
      .addCase(uploadUserAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadUserAvatar.fulfilled, (state, action) => {
        if (state.currentUser) {
          state.currentUser.avatar = action.payload.avatar;
        }
        state.loading = false;
      })
      .addCase(uploadUserAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to upload avatar';
      });
  },
});

export const { clearError, setCurrentUser, clearCurrentUser } = userSlice.actions;
export default userSlice.reducer; 