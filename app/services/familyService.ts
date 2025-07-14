import apiService from './apiService';

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
  const response = await apiService.get('/family-groups');
  return response.data || response;
}

export async function getFamilyGroup(groupId: string): Promise<FamilyGroup> {
  const response = await apiService.get(`/family-groups/${groupId}`);
  return response.data || response;
}

export async function createFamilyGroup(data: CreateFamilyGroupData): Promise<FamilyGroup> {
  const response = await apiService.post('/family-groups', data);
  return response.data || response;
}

export async function updateFamilyGroup(groupId: string, data: UpdateFamilyGroupData): Promise<FamilyGroup> {
  const response = await apiService.patch(`/family-groups/${groupId}`, data);
  return response.data || response;
}

export async function deleteFamilyGroup(groupId: string): Promise<void> {
  await apiService.delete(`/family-groups/${groupId}`);
}

export async function joinFamilyGroup(groupId: string, inviteCode?: string): Promise<FamilyGroup> {
  const response = await apiService.post(`/family-groups/${groupId}/join`, { inviteCode });
  return response.data || response;
}

export async function leaveFamilyGroup(groupId: string): Promise<void> {
  await apiService.post(`/family-groups/${groupId}/leave`);
}

export async function inviteToFamilyGroup(groupId: string, email: string): Promise<void> {
  await apiService.post(`/family-groups/${groupId}/invite`, { email });
} 