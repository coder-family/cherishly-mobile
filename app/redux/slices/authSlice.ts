import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { LoginCredentials, RegisterData, User } from '../../services/authService';
import { authService } from '../../services/authService';

// Async thunks
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async () => {
    return await authService.initialize();
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials) => {
    const result = await authService.login(credentials);
    return result.user;
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterData) => {
    const result = await authService.register(data);
    return result.user;
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    await authService.logout();
  }
);

// Slice
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isAuthenticated = action.payload;
        state.user = authService.getCurrentUser();
        state.loading = false;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        // Only set authenticated if we have valid user data
        if (action.payload && action.payload.id) {
          state.isAuthenticated = true;
          state.user = action.payload;
          state.loading = false;
          state.error = null;
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.loading = false;
          state.error = 'Invalid user data received';
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;