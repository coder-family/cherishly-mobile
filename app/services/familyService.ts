import apiService from './apiService';

// Utility function to transform API response to FamilyGroup interface
function transformFamilyGroupData(group: any): FamilyGroup {
  return {
    id: group._id || group.id,
    name: group.name,
    description: group.description,
    avatarUrl: group.avatar || group.avatarUrl,
    ownerId: group.createdBy || group.ownerId,
    members: group.members?.map((member: any) => ({
      id: member._id || member.id,
      userId: member.userId?._id || member.userId?.id || member.userId,
      groupId: group._id || group.id,
      role: member.role === 'admin' ? 'admin' : member.role === 'owner' ? 'owner' : 'member',
      joinedAt: member.joinedAt,
      user: member.userId ? {
        id: member.userId._id || member.userId.id,
        firstName: member.userId.firstName,
        lastName: member.userId.lastName,
        avatarUrl: member.userId.avatar || member.userId.avatarUrl,
      } : undefined,
    })) || [],
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
  };
}

// Type definitions
export interface FamilyGroup {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  ownerId: string;
  members: FamilyMember[];
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
      console.log('No primary family group found, returning null');
      return null;
    }
    
    // Transform and return single group
    const transformed = transformFamilyGroupData(group);
    return transformed;
  } catch (error: any) {    // If the error is 404 (no family group found), return null instead of throwing
    if (error.status === 404 || error.message?.includes('not found') || error.message?.includes('No family group')) {
      console.log('404 error for primary family group, returning null');
      return null;
    }
    // For other errors, re-throw to maintain error handling
    throw error;
  }
}

export async function getFamilyGroup(groupId: string): Promise<FamilyGroup> {
  const response = await apiService.get(`/family-groups/${groupId}`);
  const group = response.data || response;
  return transformFamilyGroupData(group);
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

export async function inviteToFamilyGroup(groupId: string, email: string): Promise<void> {
  await apiService.post(`/family-groups/${groupId}/invite`, { email });
} 