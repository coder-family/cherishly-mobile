import apiService from './apiService';

export interface UploadResponse {
  url: string;
  filename: string;
}

export async function uploadFile(fileUri: string, type: 'avatar' | 'image' | 'video' = 'image'): Promise<UploadResponse> {
  try {
    // Create form data
    const formData = new FormData();
    
    // Get file info from URI
    const filename = fileUri.split('/').pop() || 'image.jpg';
    
    // Use a whitelist of allowed file extensions for better security
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const extension = filename.split('.').pop()?.toLowerCase();
    const mimeType = extension && allowedExtensions.includes(extension) ? `image/${extension}` : 'image/jpeg';
    
    // Append file to form data
    formData.append('file', {
      uri: fileUri,
      name: filename,
      type: mimeType,
    } as any);
    
    formData.append('type', type);
    
    // Upload to server
    const response = await apiService.post('/upload', formData);
    
    return response.data || response;
  } catch (error: any) {
    // Upload error handled silently
    throw new Error(error.message || 'Failed to upload file');
  }
}

export async function uploadAvatar(fileUri: string): Promise<string> {
  try {
    const result = await uploadFile(fileUri, 'avatar');
    return result.url;
  } catch (error: any) {
    // Avatar upload error handled silently
    throw new Error('Failed to upload avatar');
  }
}

 