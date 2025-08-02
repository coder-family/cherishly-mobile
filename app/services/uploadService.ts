import apiService from './apiService';

export interface UploadResponse {
  url: string;
  filename: string;
}


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
    const match = /\.(\w+)$/.exec(filename);
    const mimeType = match ? `image/${match[1]}` : 'image/jpeg';
    
    // Append file to form data
    formData.append('file', {
      uri: fileUri,
      name: filename,
      type: mimeType,
    } as any);
    
    formData.append('type', type);
    
    // Upload to server
    const response = await apiService.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data || response;
  } catch (error: any) {
    console.error('Upload error:', error);
    throw new Error(error.message || 'Failed to upload file');
  }
}

export async function uploadAvatar(fileUri: string): Promise<string> {
  try {
    const result = await uploadFile(fileUri, 'avatar');
    return result.url;
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    throw new Error('Failed to upload avatar');
  }
}

 