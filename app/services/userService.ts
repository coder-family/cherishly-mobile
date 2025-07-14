import { API_BASE_URL } from '@env';
import apiService from './apiService';
import authService from './authService';

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
  const response = await apiService.get(`/users/${userId}`);
  return response.data || response;
}

export async function getUser(userId: string): Promise<User> {
  const response = await apiService.get(`/users/${userId}`);
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
  const response = await apiService.put(`/users/${userId}`, data);
  return response.data || response;
}

export async function changePassword(data: ChangePasswordData): Promise<void> {
  await apiService.put('/users/change-password', data);
}

export async function deleteUser(userId: string): Promise<void> {
  await apiService.delete(`/users/${userId}`);
}

export async function restoreUser(userId: string): Promise<User> {
  const response = await apiService.patch(`/users/${userId}/restore`);
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
  
  const response = await fetch(`${API_BASE_URL}/users/${userId}/avatar`, {
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

export async function logout(): Promise<void> {
  await apiService.post('/users/logout');
}

// Note: Login and createUser are handled in authService.ts
// since they're authentication-related operations 