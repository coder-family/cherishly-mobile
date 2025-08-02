import { conditionalLog } from '../utils/logUtils';
import apiService, { API_BASE_URL_EXPORT } from './apiService';
import authService from './authService';

// Utility function to transform API response to FamilyGroup interface
function transformFamilyGroupData(group: any): FamilyGroup {
  console.log('Transforming family group data:', group);
  
  // Handle nested response structure from getFamilyGroupDetails
  const groupData = group.group || group;
  const members = group.members || groupData.members || [];
  
  // Use createdBy as ownerId since that's what's stored in MongoDB
  const ownerId = groupData.createdBy || group.createdBy || group.ownerId;

  const transformed = {
    id: groupData._id || group._id || group.id,
    name: groupData.name || group.name,
    description: groupData.description || group.description,
    avatarUrl: groupData.avatar || group.avatar || group.avatarUrl,
    ownerId: ownerId,
    members: members.map((member: any) => ({
      id: member._id || member.id,
      userId: member.userId?._id || member.userId?.id || member.userId,
      groupId: groupData._id || group._id || group.id,
      role: member.role === 'admin' ? 'admin' : member.role === 'owner' ? 'owner' : 'member',
      joinedAt: member.joinedAt,
      user: member.userId && typeof member.userId === 'object' ? {
        id: member.userId._id || member.userId.id,
        firstName: member.userId.firstName,
        lastName: member.userId.lastName,
        avatarUrl: member.userId.avatar || member.userId.avatarUrl,
      } : undefined,
    })),
    children: groupData.children || group.children, // Add children to transformed object
    createdAt: groupData.createdAt || group.createdAt,
    updatedAt: groupData.updatedAt || group.updatedAt,
  };
  
  console.log('Transformed result:', transformed);
  return transformed;
}

// Type definitions
export interface FamilyGroup {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  ownerId: string;
  members: FamilyMember[];
  children?: any[]; // Add children field
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMember {
  id: string;
  userId: string;
  groupId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

export interface CreateFamilyGroupData {
  name: string;
  description?: string;
  avatarUrl?: string;
}

export interface UpdateFamilyGroupData {
  name?: string;
  description?: string;
  avatarUrl?: string;
}

// API functions
export async function getFamilyGroups(): Promise<FamilyGroup[]> {
  try {
    // Get all family groups the current user is a member of
    const response = await apiService.get('/family-groups/my-groups');
    
    // Handle nested response structure: response.data.groups or response.groups
    const responseData = response.data || response;
    const groups = responseData.groups || responseData;
        
    // If no groups exist, return empty array
    if (!groups || !Array.isArray(groups)) {
      return [];
    }
    
    // Transform and return all groups
    const transformed = groups.map(group => transformFamilyGroupData(group));
    return transformed;
  } catch (error: any) {    // If the error is 404 (no family groups found), return empty array instead of throwing
    if (error.status === 404 || error.message?.includes('not found') || error.message?.includes('No family group')) {
      return [];
    }
    // For other errors, re-throw to maintain error handling
    throw error;
  }
}

// Get the user's primary/first family group (for backward compatibility)
export async function getPrimaryFamilyGroup(): Promise<FamilyGroup | null> {
  try {
    // Get the current user's primary family group (first group for backward compatibility)
    const response = await apiService.get('/family-groups/my-group');
    const group = response.data || response;
        
    // If no group exists, return null
    if (!group || (!group.id && !group._id)) {
      conditionalLog.family('No primary family group found, returning null');
      return null;
    }
    
    // Transform and return single group
    const transformed = transformFamilyGroupData(group);
    return transformed;
  } catch (error: any) {    // If the error is 404 (no family group found), return null instead of throwing
    if (error.status === 404 || error.message?.includes('not found') || error.message?.includes('No family group')) {
      conditionalLog.family('404 error for primary family group, returning null');
      return null;
    }
    // For other errors, re-throw to maintain error handling
    throw error;
  }
}

export async function getFamilyGroup(groupId: string): Promise<FamilyGroup> {
  try {
    console.log('Fetching family group details for ID:', groupId);
    const response = await apiService.get(`/family-groups/${groupId}/details`);
    const group = response.data || response;
    console.log('Raw API response:', group);
    const transformed = transformFamilyGroupData(group);
    console.log('Transformed family group data:', transformed);
    return transformed;
  } catch (error) {
    console.error('Error fetching family group:', error);
    throw error;
  }
}

export async function createFamilyGroup(data: CreateFamilyGroupData): Promise<FamilyGroup> {
  const response = await apiService.post('/family-groups', data);
  const group = response.data || response;
  return transformFamilyGroupData(group);
}

export async function updateFamilyGroup(groupId: string, data: UpdateFamilyGroupData): Promise<FamilyGroup> {
  const response = await apiService.patch(`/family-groups/${groupId}`, data);
  const group = response.data || response;
  return transformFamilyGroupData(group);
}

export async function updateFamilyGroupDetails(groupId: string, data: {
  name: string;
  description?: string;
  avatar?: string;
}): Promise<FamilyGroup> {
  const response = await apiService.patch(`/family-groups/${groupId}`, data);
  const group = response.data || response;
  return transformFamilyGroupData(group);
}

export async function deleteFamilyGroup(groupId: string): Promise<void> {
  await apiService.delete(`/family-groups/${groupId}`);
}

export async function joinFamilyGroup(groupId: string, inviteCode?: string): Promise<FamilyGroup> {
  const response = await apiService.post(`/family-groups/${groupId}/join`, { inviteCode });
  const group = response.data || response;
  return transformFamilyGroupData(group);
}

export async function leaveFamilyGroup(groupId: string): Promise<void> {
  await apiService.post(`/family-groups/${groupId}/leave`);
}

export async function inviteToFamilyGroup(groupId: string, email: string, role: 'parent' | 'admin' = 'parent'): Promise<{ token: string }> {
  const response = await apiService.post('/family-groups/invite', { 
    email, 
    groupId, 
    role 
  });
  return response.data || response;
}

export async function joinGroupFromInvitation(token: string, userData: {
  firstName: string;
  lastName: string;
  password: string;
  dateOfBirth: string;
}): Promise<{ groupId: string; role: string }> {
  const response = await apiService.post('/family-groups/join-group-from-invitation', {
    token,
    ...userData
  });
  return response.data || response;
}

export async function acceptInvitation(token: string): Promise<{ groupId: string; role: string }> {
  const response = await apiService.post('/family-groups/accept-invitation', {
    token
  });
  return response.data || response;
}

export async function getPendingInvitations(groupId: string): Promise<{
  invitations: {
    _id: string;
    email: string;
    role: string;
    createdAt: string;
    expiresAt: string;
  }[];
}> {
  const response = await apiService.get(`/family-groups/${groupId}/pending-invitations`);
  return response.data || response;
}

export async function cancelInvitation(groupId: string, invitationId: string): Promise<void> {
  await apiService.delete(`/family-groups/${groupId}/invitations/${invitationId}`);
}

export async function resendInvitation(groupId: string, invitationId: string): Promise<void> {
  await apiService.post(`/family-groups/${groupId}/invitations/${invitationId}/resend`);
}

export async function getInvitationStats(groupId: string): Promise<{
  stats: {
    totalInvitations: number;
    pendingInvitations: number;
    acceptedInvitations: number;
    expiredInvitations: number;
  };
}> {
  const response = await apiService.get(`/family-groups/${groupId}/invitation-stats`);
  return response.data || response;
}

export async function addChildToFamilyGroup(groupId: string, childId: string): Promise<void> {
  await apiService.post(`/family-groups/${groupId}/children`, { childId });
}

export async function removeChildFromFamilyGroup(groupId: string, childId: string): Promise<void> {
  await apiService.delete(`/family-groups/${groupId}/children/${childId}`);
}

export async function getFamilyGroupChildren(groupId: string): Promise<any[]> {
  const response = await apiService.get(`/family-groups/${groupId}/children`);
  return response.data || response;
}

export async function uploadFamilyGroupAvatar(groupId: string, fileUri: string): Promise<{ avatar: string }> {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    
    // Get file name from URI
    const fileName = fileUri.split('/').pop() || 'avatar.jpg';
    
    // Append the file to FormData
    formData.append('avatar', {
      uri: fileUri,
      type: 'image/jpeg', // You might want to detect this dynamically
      name: fileName,
    } as any);

    // Use a separate axios instance for file uploads to avoid JSON content-type issues
    const token = await authService.getAccessToken();
    
    // Use the correct base URL
    const baseURL = API_BASE_URL_EXPORT || "https://growing-together-app.onrender.com/api";
    const uploadUrl = `${baseURL}/family-groups/${groupId}/avatar`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to upload group avatar');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Avatar upload error:', error);
    throw error;
  }
}

export async function getFamilyGroupTimeline(groupId: string, page: number = 1, limit: number = 20): Promise<{
  timeline: any[];
  children: any[];
  permissions: {
    userRole: string;
    isOwner: boolean;
    ownedChildren: number;
    canSeeAllContent: boolean;
  };
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}> {
  try {
    console.log('Fetching timeline posts for family group:', groupId, 'page:', page);
    const response = await apiService.get(`/family-groups/${groupId}/timeline?page=${page}&limit=${limit}`);
    const data = response.data || response;
    console.log('Timeline posts response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching family group timeline:', error);
    return {
      timeline: [],
      children: [],
      permissions: {
        userRole: 'member',
        isOwner: false,
        ownedChildren: 0,
        canSeeAllContent: false,
      },
      pagination: {
        page: 1,
        limit: 20,
        hasMore: false,
      },
    };
  }
}

// Helper function to get user info by ID
export async function getUserInfo(userId: string): Promise<{
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
} | null> {
  try {
    const response = await apiService.get(`/users/${userId}`);
    const user = response.data || response;
    return {
      id: user._id || user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatar || user.avatarUrl,
    };
  } catch (error) {
    console.warn(`Failed to get user info for ${userId}:`, error);
    return null;
  }
} 