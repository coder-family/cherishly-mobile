import { API_BASE_URL } from '@env';
import { conditionalLog } from '../utils/logUtils';
import apiService from './apiService';
import authService from './authService';

// Use the same fallback as apiService
const BASE_URL = API_BASE_URL || "https://growing-together-app.onrender.com/api";

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
  gender?: string;
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
    gender: apiChild.gender,
    parentId: apiChild.createdBy,
    createdAt: apiChild.createdAt,
    updatedAt: apiChild.updatedAt,
  };
}

// API functions
export async function getChildren(): Promise<Child[]> {
  try {
    const response = await apiService.get('/children/my-children');
    
    // Get the actual children data from response
    const childrenData: ApiChild[] = Array.isArray(response) 
      ? response 
      : (response.data || response || []);
    
    // Transform API format to UI format
    const transformedChildren = childrenData.map(transformChild);
    
    conditionalLog.child('Fetched children:', {
      count: transformedChildren.length,
      children: transformedChildren.map(child => ({ id: child.id, name: child.name }))
    });
    
    return transformedChildren;
  } catch (error) {
    conditionalLog.child('Error fetching children:', error);
    throw error; // Re-throw to allow calling code to handle the error
  }
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

export async function uploadAvatar(childId: string, imageUri: string): Promise<{ avatar: string }> {
  // Create FormData for file upload
  const formData = new FormData();
  
  // Get file name from URI
  const fileName = imageUri.split('/').pop() || 'avatar.jpg';
  
  // Append the file to FormData
  formData.append('avatar', {
    uri: imageUri,
    type: 'image/jpeg', // You might want to detect this dynamically
    name: fileName,
  } as any);

  // Use a separate axios instance for file uploads to avoid JSON content-type issues
  const token = await authService.getAccessToken();
  
  const response = await fetch(`${BASE_URL}/children/${childId}/avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to upload avatar');
  }

  const data = await response.json();
  return data;
} 