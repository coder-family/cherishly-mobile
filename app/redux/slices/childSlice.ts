import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Child, CreateChildData, UpdateChildData } from '../../services/childService';
import * as childService from '../../services/childService';

// Async thunks
export const fetchChildren = createAsyncThunk(
  'children/fetchChildren',
  async () => {
    return await childService.getChildren();
  }
);

export const fetchChild = createAsyncThunk(
  'children/fetchChild',
  async (childId: string) => {
    return await childService.getChild(childId);
  }
);

export const createChild = createAsyncThunk(
  'children/createChild',
  async (data: CreateChildData) => {
    return await childService.createChild(data);
  }
);

export const updateChild = createAsyncThunk(
  'children/updateChild',
  async ({ childId, data }: { childId: string; data: UpdateChildData }) => {
    return await childService.updateChild(childId, data);
  }
);

export const deleteChild = createAsyncThunk(
  'children/deleteChild',
  async (childId: string) => {
    await childService.deleteChild(childId);
    return childId;
  }
);

export const uploadChildAvatar = createAsyncThunk(
  'children/uploadAvatar',
  async ({ childId, imageUri }: { childId: string; imageUri: string }) => {
    return await childService.uploadAvatar(childId, imageUri);
  }
);

// Slice
interface ChildState {
  children: Child[];
  currentChild: Child | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChildState = {
  children: [],
  currentChild: null,
  loading: false,
  error: null,
};

const childSlice = createSlice({
  name: 'children',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentChild: (state, action) => {
      state.currentChild = action.payload;
    },
    clearCurrentChild: (state) => {
      state.currentChild = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch children
      .addCase(fetchChildren.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChildren.fulfilled, (state, action) => {
        state.children = action.payload;
        state.loading = false;
      })
      .addCase(fetchChildren.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch children';
      })
      // Fetch single child
      .addCase(fetchChild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChild.fulfilled, (state, action) => {
        state.currentChild = action.payload;
        state.loading = false;
      })
      .addCase(fetchChild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch child';
      })
      // Create child
      .addCase(createChild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChild.fulfilled, (state, action) => {
        state.children.push(action.payload);
        state.loading = false;
      })
      .addCase(createChild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create child';
      })
      // Update child
      .addCase(updateChild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateChild.fulfilled, (state, action) => {
        const index = state.children.findIndex(child => child.id === action.payload.id);
        if (index !== -1) {
          state.children[index] = action.payload;
        }
        if (state.currentChild?.id === action.payload.id) {
          state.currentChild = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateChild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update child';
      })
      // Delete child
      .addCase(deleteChild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteChild.fulfilled, (state, action) => {
        state.children = state.children.filter(child => child.id !== action.payload);
        if (state.currentChild?.id === action.payload) {
          state.currentChild = null;
        }
        state.loading = false;
      })
      .addCase(deleteChild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete child';
      })
      // Upload child avatar
      .addCase(uploadChildAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadChildAvatar.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(uploadChildAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to upload avatar';
      });
  },
});

export const { clearError, setCurrentChild, clearCurrentChild } = childSlice.actions;
export default childSlice.reducer; 