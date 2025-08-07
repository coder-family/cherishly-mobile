import { API_BASE_URL } from "@env";
import { conditionalLog } from "../utils/logUtils";
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
  const response = await apiService.get(`/children/${childId}`);
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
      const response = await fetch(`${BASE_URL}/children/${childId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
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
  await apiService.delete(`/children/${childId}`);
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

  const response = await fetch(`${BASE_URL}/children/${childId}/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
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
