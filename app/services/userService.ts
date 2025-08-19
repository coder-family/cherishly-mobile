import { API_BASE_URL } from '@env';
import { sanitizeObjectId } from '../utils/validation';
import apiService from './apiService';
import authService from './authService';

// Use the same fallback as apiService
const BASE_URL = API_BASE_URL || "https://growing-together-app.onrender.com/api";

// Type definitions
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  dateOfBirth?: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  role: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  newPassword: string;
}

// API functions
export async function getCurrentUser(): Promise<User> {
  // Since there's no /me endpoint, we'll need to get the user ID from auth context
  // This function should be called with the user ID from the auth state
  throw new Error('getCurrentUser requires user ID. Use getUser(userId) instead.');
}

export async function getCurrentUserById(userId: string): Promise<User> {
  const sanitizedId = sanitizeObjectId(userId);
  const response = await apiService.get(`/users/${sanitizedId}`);
  return response.data || response;
}

export async function getUser(userId: string): Promise<User> {
  const sanitizedId = sanitizeObjectId(userId);
  const response = await apiService.get(`/users/${sanitizedId}`);
  return response.data || response;
}

export async function getAllUsers(): Promise<User[]> {
  const response = await apiService.get('/users');
  return response.data || response;
}

export async function getUsersInGroup(): Promise<User[]> {
  const response = await apiService.get('/users/group');
  return response.data || response;
}

export async function updateUser(userId: string, data: UpdateUserData): Promise<User> {
  const sanitizedId = sanitizeObjectId(userId);
  const response = await apiService.put(`/users/${sanitizedId}`, data);
  return response.data || response;
}

export async function changePassword(data: ChangePasswordData): Promise<void> {
  await apiService.put('/users/change-password', data);
}

export async function deleteUser(userId: string): Promise<void> {
  const sanitizedId = sanitizeObjectId(userId);
  await apiService.delete(`/users/${sanitizedId}`);
}

export async function restoreUser(userId: string): Promise<User> {
  const sanitizedId = sanitizeObjectId(userId);
  const response = await apiService.patch(`/users/${sanitizedId}/restore`);
  return response.data || response;
}

export async function forgotPassword(email: string): Promise<void> {
  await apiService.post('/users/forgot-password', { email });
}

export async function resetPassword(token: string, data: ResetPasswordData): Promise<void> {
  await apiService.post(`/users/reset-password/${token}`, data);
}

export async function verifyResetToken(token: string): Promise<{ valid: boolean }> {
  const response = await apiService.get(`/users/verify-reset-token/${token}`);
  return response.data || response;
}

export async function uploadAvatar(userId: string, imageUri: string): Promise<{ avatar: string }> {
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
  
  const sanitizedId = sanitizeObjectId(userId);
  const response = await fetch(`${BASE_URL}/users/${sanitizedId}/avatar`, {
    method: 'POST',
          headers: {
        'Authorization': `Bearer ${token}`,
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

export async function logout(): Promise<void> {
  await apiService.post('/users/logout');
}

// Note: Login and createUser are handled in authService.ts
// since they're authentication-related operations 

/**
 * Lấy thông tin chi tiết của user theo userId
 * Sử dụng API GET /api/users/{userId}
 */
export async function getUserById(userId: string): Promise<User> {
  try {
    const response = await apiService.get(`/users/${userId}`);
    const userData = response.data || response;
    return transformUserData(userData);
  } catch (error: any) {
    conditionalLog.user('Error fetching user by ID:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('User not found');
      } else if (error.response.status === 403) {
        throw new Error('You do not have permission to view this user');
      } else {
        throw new Error(error.response.data?.message || 'Failed to fetch user');
      }
    } else if (error.request) {
      throw new Error('Network error: Unable to fetch user');
    } else {
      throw new Error('Failed to fetch user: ' + (error.message || 'Unknown error'));
    }
  }
} 