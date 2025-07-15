import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { CreateFamilyGroupData, FamilyGroup, UpdateFamilyGroupData } from '../../services/familyService';
import * as familyService from '../../services/familyService';

// Async thunks
export const fetchFamilyGroups = createAsyncThunk(
  'family/fetchFamilyGroups',
  async () => {
    return await familyService.getFamilyGroups();
  }
);

export const fetchFamilyGroup = createAsyncThunk(
  'family/fetchFamilyGroup',
  async (groupId: string) => {
    return await familyService.getFamilyGroup(groupId);
  }
);

export const createFamilyGroup = createAsyncThunk(
  'family/createFamilyGroup',
  async (data: CreateFamilyGroupData) => {
    return await familyService.createFamilyGroup(data);
  }
);

export const updateFamilyGroup = createAsyncThunk(
  'family/updateFamilyGroup',
  async ({ groupId, data }: { groupId: string; data: UpdateFamilyGroupData }) => {
    return await familyService.updateFamilyGroup(groupId, data);
  }
);

export const deleteFamilyGroup = createAsyncThunk(
  'family/deleteFamilyGroup',
  async (groupId: string) => {
    await familyService.deleteFamilyGroup(groupId);
    return groupId;
  }
);

export const joinFamilyGroup = createAsyncThunk(
  'family/joinFamilyGroup',
  async ({ groupId, inviteCode }: { groupId: string; inviteCode?: string }) => {
    return await familyService.joinFamilyGroup(groupId, inviteCode);
  }
);

export const leaveFamilyGroup = createAsyncThunk(
  'family/leaveFamilyGroup',
  async (groupId: string) => {
    await familyService.leaveFamilyGroup(groupId);
    return groupId;
  }
);

// Slice
interface FamilyState {
  familyGroups: FamilyGroup[];
  currentGroup: FamilyGroup | null;
  loading: boolean;
  error: string | null;
}

const initialState: FamilyState = {
  familyGroups: [],
  currentGroup: null,
  loading: false,
  error: null,
};

const familySlice = createSlice({
  name: 'family',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentGroup: (state, action) => {
      state.currentGroup = action.payload;
    },
    clearCurrentGroup: (state) => {
      state.currentGroup = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch family groups
      .addCase(fetchFamilyGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFamilyGroups.fulfilled, (state, action) => {
        state.familyGroups = action.payload;
        state.loading = false;
      })
      .addCase(fetchFamilyGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch family groups';
      })
      // Fetch single family group
      .addCase(fetchFamilyGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFamilyGroup.fulfilled, (state, action) => {
        state.currentGroup = action.payload;
        state.loading = false;
      })
      .addCase(fetchFamilyGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch family group';
      })
      // Create family group
      .addCase(createFamilyGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFamilyGroup.fulfilled, (state, action) => {
        state.familyGroups.push(action.payload);
        state.loading = false;
      })
      .addCase(createFamilyGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create family group';
      })
      // Update family group
      .addCase(updateFamilyGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFamilyGroup.fulfilled, (state, action) => {
        const index = state.familyGroups.findIndex(group => group.id === action.payload.id);
        if (index !== -1) {
          state.familyGroups[index] = action.payload;
        }
        if (state.currentGroup?.id === action.payload.id) {
          state.currentGroup = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateFamilyGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update family group';
      })
      // Delete family group
      .addCase(deleteFamilyGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFamilyGroup.fulfilled, (state, action) => {
        state.familyGroups = state.familyGroups.filter(group => group.id !== action.payload);
        if (state.currentGroup?.id === action.payload) {
          state.currentGroup = null;
        }
        state.loading = false;
      })
      .addCase(deleteFamilyGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete family group';
      })
      // Join family group
      .addCase(joinFamilyGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinFamilyGroup.fulfilled, (state, action) => {
        const index = state.familyGroups.findIndex(group => group.id === action.payload.id);
        if (index !== -1) {
          state.familyGroups[index] = action.payload;
        } else {
          state.familyGroups.push(action.payload);
        }
        state.loading = false;
      })
      .addCase(joinFamilyGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to join family group';
      })
      // Leave family group
      .addCase(leaveFamilyGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveFamilyGroup.fulfilled, (state, action) => {
        state.familyGroups = state.familyGroups.filter(group => group.id !== action.payload);
        if (state.currentGroup?.id === action.payload) {
          state.currentGroup = null;
        }
        state.loading = false;
      })
      .addCase(leaveFamilyGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to leave family group';
      });
  },
});

export const { clearError, setCurrentGroup, clearCurrentGroup } = familySlice.actions;
export default familySlice.reducer; 