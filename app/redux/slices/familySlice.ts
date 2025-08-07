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

export const addChildToFamilyGroup = createAsyncThunk(
  'family/addChildToFamilyGroup',
  async ({ groupId, childId }: { groupId: string; childId: string }) => {
    // Validate inputs
    if (!groupId || !childId) {
      throw new Error('Group ID and Child ID are required');
    }
    
    await familyService.addChildToFamilyGroup(groupId, childId);
    return { groupId, childId };
  }
);

export const removeChildFromFamilyGroup = createAsyncThunk(
  'family/removeChildFromFamilyGroup',
  async ({ groupId, childId }: { groupId: string; childId: string }) => {
    await familyService.removeChildFromFamilyGroup(groupId, childId);
    return { groupId, childId };
  }
);

export const inviteToFamilyGroup = createAsyncThunk(
  'family/inviteToFamilyGroup',
  async ({ groupId, email, role }: { groupId: string; email: string; role?: 'parent' | 'admin' | 'member' }) => {
    return await familyService.inviteToFamilyGroup(groupId, email, role);
  }
);

export const joinGroupFromInvitation = createAsyncThunk(
  'family/joinGroupFromInvitation',
  async ({ token, userData }: { 
    token: string; 
    userData: {
      firstName: string;
      lastName: string;
      password: string;
      dateOfBirth: string;
    }
  }) => {
    return await familyService.joinGroupFromInvitation(token, userData);
  }
);

export const acceptInvitation = createAsyncThunk(
  'family/acceptInvitation',
  async (token: string) => {
    return await familyService.acceptInvitation(token);
  }
);

export const getMyPendingInvitations = createAsyncThunk(
  'family/getMyPendingInvitations',
  async () => {
    return await familyService.getMyPendingInvitations();
  }
);

export const declineInvitation = createAsyncThunk(
  'family/declineInvitation',
  async (token: string) => {
    return await familyService.declineInvitation(token);
  }
);

// Slice
interface FamilyState {
  familyGroups: FamilyGroup[];
  currentGroup: FamilyGroup | null;
  myInvitations: {
    _id: string;
    groupId: string;
    groupName: string;
    groupAvatar?: string;
    email: string;
    role: string;
    status: string;
    expiresAt?: string;
    createdAt?: string;
    sentAt?: string;
    invitedBy: string;
    token?: string;
  }[];
  loading: boolean;
  error: string | null;
}

const initialState: FamilyState = {
  familyGroups: [],
  currentGroup: null,
  myInvitations: [],
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
      })
      // Add child to family group
      .addCase(addChildToFamilyGroup.pending, (state) => {
        // Don't set global loading for this operation to avoid UI flicker
        state.error = null;
      })
      .addCase(addChildToFamilyGroup.fulfilled, (state, action) => {
        state.error = null;
        // Trigger a refresh of the current group data
        if (state.currentGroup?.id === action.payload.groupId) {
          // We'll handle the refresh in the component
  
        }
        // Also refresh the family groups list to reflect changes
        // The component will handle the actual refresh
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
        state.loading = false;
        // Optionally refresh the current group data
        if (state.currentGroup?.id === action.payload.groupId) {
          // You might want to refresh the group data here
        }
      })
      .addCase(removeChildFromFamilyGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to remove child from family group';
      })
      // Invite to family group
      .addCase(inviteToFamilyGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(inviteToFamilyGroup.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(inviteToFamilyGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send invitation';
      })
      // Join group from invitation
      .addCase(joinGroupFromInvitation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinGroupFromInvitation.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally refresh family groups after joining
      })
      .addCase(joinGroupFromInvitation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to join group from invitation';
      })
      // Accept invitation
      .addCase(acceptInvitation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptInvitation.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally refresh family groups after accepting invitation
      })
      .addCase(acceptInvitation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to accept invitation';
      })
      // Get my pending invitations
      .addCase(getMyPendingInvitations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyPendingInvitations.fulfilled, (state, action) => {
        state.myInvitations = action.payload.invitations;
        state.loading = false;
      })
      .addCase(getMyPendingInvitations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch my invitations';
      })
      
      // Decline invitation
      .addCase(declineInvitation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(declineInvitation.fulfilled, (state, action) => {
        state.loading = false;
        // Remove declined invitation from myInvitations
        // Note: We can't filter by status since we don't have the invitation ID in the response
        // The invitation will be removed on next fetch
      })
      .addCase(declineInvitation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to decline invitation';
      });
  },
});

export const { clearError, setCurrentGroup, clearCurrentGroup } = familySlice.actions;
export default familySlice.reducer; 