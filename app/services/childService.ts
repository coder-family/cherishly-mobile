import { API_BASE_URL } from "@env";
import { conditionalLog } from "../utils/logUtils";
import { sanitizeObjectId } from '../utils/validation';
import apiService from "./apiService";
import authService from "./authService";

// Use the same fallback as apiService
const BASE_URL =
  API_BASE_URL || "https://growing-together-app.onrender.com/api";

// Type definitions matching API response
export interface ApiChild {
  _id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  dateOfBirth: string;
  avatar?: string;
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
  firstName: string;
  lastName: string;
  nickname?: string;
  name: string; // Display name (nickname or firstName + lastName)
  birthdate: string;
  avatarUrl?: string;
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
  avatar?: string;
  gender?: string;
  familyGroupId?: string;
}

export interface UpdateChildData {
  firstName?: string;
  lastName?: string;
  nickname?: string;
  dateOfBirth?: string;
  avatar?: string;
  gender?: string;
  familyGroupId?: string;
}

// Transform API child to UI child format
function transformChild(apiChild: ApiChild): Child {
  const displayName =
    apiChild.nickname || `${apiChild.firstName} ${apiChild.lastName}`.trim();

  return {
    id: apiChild._id,
    firstName: apiChild.firstName,
    lastName: apiChild.lastName,
    nickname: apiChild.nickname,
    name: displayName, // Keep for backward compatibility
    birthdate: apiChild.dateOfBirth,
    avatarUrl: apiChild.avatar,
    gender: apiChild.gender,
    parentId: apiChild.createdBy,
    createdAt: apiChild.createdAt,
    updatedAt: apiChild.updatedAt,
  };
}

// API functions
export async function getChildren(): Promise<Child[]> {
  try {
    const response = await apiService.get("/children/accessible-children");

    // Get the actual children data from response
    const childrenData: ApiChild[] = Array.isArray(response)
      ? response
      : response.data || response || [];

    // Transform API format to UI format
    const transformedChildren = childrenData.map(transformChild);

    conditionalLog.child("Fetched accessible children:", {
      count: transformedChildren.length,
      children: transformedChildren.map((child) => ({
        id: child.id,
        name: child.name,
      })),
    });

    return transformedChildren;
  } catch (error) {
    conditionalLog.child("Error fetching accessible children:", error);
    throw error; // Re-throw to allow calling code to handle the error
  }
}

// Get only children created by current user (for "Your Babies" section)
export async function getMyOwnChildren(): Promise<Child[]> {
  try {
    const response = await apiService.get("/children/my-children");

    // Get the actual children data from response
    const childrenData: ApiChild[] = Array.isArray(response)
      ? response
      : response.data || response || [];

    // Transform API format to UI format
    const transformedChildren = childrenData.map(transformChild);

    conditionalLog.child("Fetched my own children:", {
      count: transformedChildren.length,
      children: transformedChildren.map((child) => ({
        id: child.id,
        name: child.name,
      })),
    });

    return transformedChildren;
  } catch (error) {
    conditionalLog.child("Error fetching my own children:", error);
    throw error;
  }
}

export async function getChild(childId: string): Promise<Child> {
  const sanitizedId = sanitizeObjectId(childId);
  const response = await apiService.get(`/children/${sanitizedId}`);
  const apiChild: ApiChild = response.data || response;
  return transformChild(apiChild);
}

export async function createChild(data: CreateChildData): Promise<Child> {
  const response = await apiService.post("/children", data);
  const apiChild: ApiChild = response.data || response;
  return transformChild(apiChild);
}

export async function updateChild(
  childId: string,
  data: UpdateChildData
): Promise<Child> {
  try {
    conditionalLog.child("Updating child:", { childId, data });

    // Check if avatar is a local URI (needs to be uploaded)
    if (data.avatar && data.avatar.startsWith("file://")) {
      conditionalLog.child("Avatar detected, uploading with child data");

      // Create FormData for file upload with child data
      const formData = new FormData();

      // Add avatar file
      const fileName = data.avatar.split("/").pop() || "avatar.jpg";
      formData.append("avatar", {
        uri: data.avatar,
        type: "image/jpeg",
        name: fileName,
      } as any);

      // Add other data as form fields
      const { avatar, ...otherData } = data;
      Object.keys(otherData).forEach((key) => {
        const value = (otherData as any)[key];
        if (value !== undefined) {
          formData.append(key, value);
          conditionalLog.child(`Added form field: ${key} = ${value}`);
        }
      });

      conditionalLog.child("FormData created with avatar and child data:", {
        hasAvatar: !!data.avatar,
        otherFields: Object.keys(otherData),
        formDataEntries: "FormData created",
      });

      // Use fetch for FormData upload
      const token = await authService.getAccessToken();
      const sanitizedId = sanitizeObjectId(childId);
      const response = await fetch(`${BASE_URL}/children/${sanitizedId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      conditionalLog.child("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        conditionalLog.child("Error response text:", errorText);
        conditionalLog.child("Response headers:", response.headers);
        conditionalLog.child("Response status:", response.status);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
          conditionalLog.child("Parsed error data:", errorData);
        } catch {
          errorData = { message: errorText || "Failed to update child" };
          conditionalLog.child("Failed to parse error as JSON, using raw text");
        }

        throw new Error(
          errorData.message || `HTTP ${response.status}: Failed to update child`
        );
      }

      const responseText = await response.text();
      conditionalLog.child("Response text:", responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (error) {
        conditionalLog.child("Failed to parse response as JSON:", error);
        throw new Error("Invalid response format from server");
      }

      const apiChild: ApiChild = responseData.data || responseData;
      conditionalLog.child("Child updated successfully with avatar:", {
        childId,
        updatedChild: apiChild,
      });
      return transformChild(apiChild);
    } else {
      conditionalLog.child("Regular JSON update without avatar");
      // Regular JSON update without avatar
      const response = await apiService.put(`/children/${childId}`, data);
      const apiChild: ApiChild = response.data || response;
      conditionalLog.child("Child updated successfully:", {
        childId,
        updatedChild: apiChild,
      });
      return transformChild(apiChild);
    }
  } catch (error) {
    conditionalLog.child("Error updating child:", { childId, error, data });
    throw error;
  }
}

export async function deleteChild(childId: string): Promise<void> {
  const sanitizedId = sanitizeObjectId(childId);
  await apiService.delete(`/children/${sanitizedId}`);
}

export async function uploadAvatar(
  childId: string,
  imageUri: string
): Promise<{ avatar: string }> {
  // Create FormData for file upload
  const formData = new FormData();

  // Get file name from URI
  const fileName = imageUri.split("/").pop() || "avatar.jpg";

  // Append the file to FormData
  formData.append("avatar", {
    uri: imageUri,
    type: "image/jpeg", // You might want to detect this dynamically
    name: fileName,
  } as any);

  // Use a separate axios instance for file uploads to avoid JSON content-type issues
  const token = await authService.getAccessToken();

  const sanitizedId = sanitizeObjectId(childId);
  const response = await fetch(`${BASE_URL}/children/${sanitizedId}/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to upload avatar");
  }

  const data = await response.json();
  return data;
}

// New interfaces for child family groups feature
export interface ChildFamilyGroup {
  _id: string;
  childId: string;
  familyGroupId: {
    _id: string;
    name: string;
    avatar?: string;
    description?: string;
  };
  addedBy: string;
  role: 'primary' | 'secondary';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddChildToFamilyGroupData {
  familyGroupId: string;
  role?: 'primary' | 'secondary';
}

// New API functions for child multiple family groups
export async function addChildToFamilyGroup(
  childId: string,
  data: AddChildToFamilyGroupData
): Promise<ChildFamilyGroup> {
  try {
    const sanitizedId = sanitizeObjectId(childId);
    const response = await apiService.post(`/children/${sanitizedId}/family-groups`, data);
    return response.data || response;
  } catch (error: any) {
    conditionalLog.child('Error adding child to family group:', error);
    
    // Check if the error message contains the specific text
    if (error.message && error.message.includes('Child is already a member of this family group')) {
      // Don't re-throw, just return the error message
      const customError = new Error('Child is already a member of this family group');
      customError.name = 'AlreadyMemberError';
      throw customError;
    }
    
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Child or family group not found');
      } else if (error.response.status === 403) {
        throw new Error('You do not have permission to add this child to the family group');
      } else if (error.response.status === 409) {
        throw new Error('Child is already a member of this family group');
      } else if (error.response.status === 400) {
        throw new Error('Invalid request: ' + (error.response.data?.message || 'Bad request'));
      } else {
        throw new Error(error.response.data?.message || 'Failed to add child to family group');
      }
    } else if (error.request) {
      throw new Error('Network error: Unable to add child to family group');
    } else {
      throw new Error('Failed to add child to family group: ' + (error.message || 'Unknown error'));
    }
  }
}

export async function removeChildFromFamilyGroup(
  childId: string,
  familyGroupId: string
): Promise<void> {
  try {
    const sanitizedChildId = sanitizeObjectId(childId);
    const sanitizedGroupId = sanitizeObjectId(familyGroupId);
    await apiService.delete(`/children/${sanitizedChildId}/family-groups/${sanitizedGroupId}`);
  } catch (error: any) {
    conditionalLog.child('Error removing child from family group:', error);
    
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Child or family group not found');
      } else if (error.response.status === 403) {
        throw new Error('You do not have permission to remove this child from the family group');
      } else {
        throw new Error(error.response.data?.message || 'Failed to remove child from family group');
      }
    } else if (error.request) {
      throw new Error('Network error: Unable to remove child from family group');
    } else {
      throw new Error('Failed to remove child from family group: ' + (error.message || 'Unknown error'));
    }
  }
}

export async function getChildFamilyGroups(childId: string): Promise<ChildFamilyGroup[]> {
  try {
    const sanitizedId = sanitizeObjectId(childId);
    const response = await apiService.get(`/children/${sanitizedId}/family-groups`);
    return response.data || response;
  } catch (error: any) {
    conditionalLog.child('Error getting child family groups:', error);
    
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Child not found');
      } else if (error.response.status === 403) {
        throw new Error('You do not have permission to view this child\'s family groups');
      } else {
        throw new Error(error.response.data?.message || 'Failed to get child family groups');
      }
    } else if (error.request) {
      throw new Error('Network error: Unable to get child family groups');
    } else {
      throw new Error('Failed to get child family groups: ' + (error.message || 'Unknown error'));
    }
  }
}

export async function setPrimaryFamilyGroup(
  childId: string,
  familyGroupId: string
): Promise<ChildFamilyGroup> {
  try {
    const sanitizedChildId = sanitizeObjectId(childId);
    const sanitizedGroupId = sanitizeObjectId(familyGroupId);
    const response = await apiService.patch(`/children/${sanitizedChildId}/family-groups/${sanitizedGroupId}/primary`);
    return response.data || response;
  } catch (error: any) {
    conditionalLog.child('Error setting primary family group:', error);
    
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Child or family group not found');
      } else if (error.response.status === 403) {
        throw new Error('You do not have permission to set primary family group for this child');
      } else {
        throw new Error(error.response.data?.message || 'Failed to set primary family group');
      }
    } else if (error.request) {
      throw new Error('Network error: Unable to set primary family group');
    } else {
      throw new Error('Failed to set primary family group: ' + (error.message || 'Unknown error'));
    }
  }
}
