import apiService from './apiService';

// Type definitions matching API response
export interface ApiChild {
  _id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  dateOfBirth: string;
  avatar?: string;
  bio?: string;
  createdBy: string;
  familyGroupId?: string;
  gender?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Transformed child for UI components
export interface Child {
  id: string;
  name: string;
  birthdate: string;
  avatarUrl?: string;
  bio?: string;
  parentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChildData {
  firstName: string;
  lastName: string;
  nickname?: string;
  dateOfBirth: string;
  bio?: string;
  avatar?: string;
  gender?: string;
}

export interface UpdateChildData {
  firstName?: string;
  lastName?: string;
  nickname?: string;
  dateOfBirth?: string;
  bio?: string;
  avatar?: string;
  gender?: string;
}

// Transform API child to UI child format
function transformChild(apiChild: ApiChild): Child {
  return {
    id: apiChild._id,
    name: apiChild.nickname || `${apiChild.firstName} ${apiChild.lastName}`.trim(),
    birthdate: apiChild.dateOfBirth,
    avatarUrl: apiChild.avatar,
    bio: apiChild.bio,
    parentId: apiChild.createdBy,
    createdAt: apiChild.createdAt,
    updatedAt: apiChild.updatedAt,
  };
}

// API functions
export async function getChildren(): Promise<Child[]> {
  const response = await apiService.get('/children/my-children');
  console.log('Raw children response:', response);
  console.log('Response type:', typeof response);
  console.log('Is array?', Array.isArray(response));
  
  // Get the actual children data from response
  const childrenData: ApiChild[] = Array.isArray(response) 
    ? response 
    : (response.data || response || []);
  
  console.log('Children data before transform:', childrenData);
  
  // Transform API format to UI format
  const transformedChildren = childrenData.map(transformChild);
  console.log('Transformed children:', transformedChildren);
  
  return transformedChildren;
}

export async function getChild(childId: string): Promise<Child> {
  const response = await apiService.get(`/children/${childId}`);
  const apiChild: ApiChild = response.data || response;
  return transformChild(apiChild);
}

export async function createChild(data: CreateChildData): Promise<Child> {
  const response = await apiService.post('/children', data);
  const apiChild: ApiChild = response.data || response;
  return transformChild(apiChild);
}

export async function updateChild(childId: string, data: UpdateChildData): Promise<Child> {
  const response = await apiService.patch(`/children/${childId}`, data);
  const apiChild: ApiChild = response.data || response;
  return transformChild(apiChild);
}

export async function deleteChild(childId: string): Promise<void> {
  await apiService.delete(`/children/${childId}`);
} 