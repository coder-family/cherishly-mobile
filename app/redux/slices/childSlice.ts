import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type {
  AddChildToFamilyGroupData,
  Child,
  ChildFamilyGroup,
  CreateChildData,
  UpdateChildData
} from '../../services/childService';
import * as childService from '../../services/childService';

// Async thunks
export const fetchChildren = createAsyncThunk(
  'children/fetchChildren',
  async () => {
    return await childService.getChildren();
  }
);

export const fetchMyOwnChildren = createAsyncThunk(
  'children/fetchMyOwnChildren',
  async () => {
    return await childService.getMyOwnChildren();
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

// New async thunks for child family groups
export const addChildToFamilyGroup = createAsyncThunk(
  'children/addToFamilyGroup',
  async ({ childId, data }: { childId: string; data: AddChildToFamilyGroupData }) => {
    return await childService.addChildToFamilyGroup(childId, data);
  }
);

export const removeChildFromFamilyGroup = createAsyncThunk(
  'children/removeFromFamilyGroup',
  async ({ childId, familyGroupId }: { childId: string; familyGroupId: string }) => {
    await childService.removeChildFromFamilyGroup(childId, familyGroupId);
    return { childId, familyGroupId };
  }
);

export const fetchChildFamilyGroups = createAsyncThunk(
  'children/fetchFamilyGroups',
  async (childId: string) => {
    return await childService.getChildFamilyGroups(childId);
  }
);

export const setPrimaryFamilyGroup = createAsyncThunk(
  'children/setPrimaryFamilyGroup',
  async ({ childId, familyGroupId }: { childId: string; familyGroupId: string }) => {
    return await childService.setPrimaryFamilyGroup(childId, familyGroupId);
  }
);

// Slice
interface ChildState {
  children: Child[];
  currentChild: Child | null;
  childFamilyGroups: ChildFamilyGroup[];
  loading: boolean;
  error: string | null;
}

const initialState: ChildState = {
  children: [],
  currentChild: null,
  childFamilyGroups: [],
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
    clearChildFamilyGroups: (state) => {
      state.childFamilyGroups = [];
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
      // Fetch my own children
      .addCase(fetchMyOwnChildren.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOwnChildren.fulfilled, (state, action) => {
        state.children = action.payload;
        state.loading = false;
      })
      .addCase(fetchMyOwnChildren.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch my own children';
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
      })
      // Add child to family group
      .addCase(addChildToFamilyGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addChildToFamilyGroup.fulfilled, (state, action) => {
        // Add to child family groups if not already present
        const existingIndex = state.childFamilyGroups.findIndex(
          group => group._id === action.payload._id
        );
        if (existingIndex === -1) {
          state.childFamilyGroups.push(action.payload);
        }
        state.loading = false;
      })
      .addCase(addChildToFamilyGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add child to family group';
      })
      // Remove child from family group
      .addCase(removeChildFromFamilyGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeChildFromFamilyGroup.fulfilled, (state, action) => {
        // Remove from child family groups
        state.childFamilyGroups = state.childFamilyGroups.filter(
          group => !(group.childId === action.payload.childId && group.familyGroupId._id === action.payload.familyGroupId)
        );
        state.loading = false;
      })
      .addCase(removeChildFromFamilyGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to remove child from family group';
      })
      // Fetch child family groups
      .addCase(fetchChildFamilyGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChildFamilyGroups.fulfilled, (state, action) => {
        state.childFamilyGroups = action.payload;
        state.loading = false;
      })
      .addCase(fetchChildFamilyGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch child family groups';
      })
      // Set primary family group
      .addCase(setPrimaryFamilyGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setPrimaryFamilyGroup.fulfilled, (state, action) => {
        // Update the role of the family group to primary and set others to secondary
        state.childFamilyGroups = state.childFamilyGroups.map(group => ({
          ...group,
          role: group._id === action.payload._id ? 'primary' : 'secondary'
        }));
        state.loading = false;
      })
      .addCase(setPrimaryFamilyGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to set primary family group';
      });
  },
});

export const { clearError, setCurrentChild, clearCurrentChild, clearChildFamilyGroups } = childSlice.actions;
export default childSlice.reducer; 