import { API_BASE_URL } from '@env';
import apiService from './apiService';
import authService from './authService';
import { CreatePromptResponseData, FeedbackData, GetResponsesParams, PromptResponse, UpdatePromptResponseData } from './promptService';

// Use the same fallback as apiService
const BASE_URL = API_BASE_URL || "https://growing-together-app.onrender.com/api";

// React Native file type
interface ReactNativeFile {
  uri: string;
  type?: string;
  name?: string;
}

// Helper function to map API response to PromptResponse interface
function mapPromptResponseFromApi(apiResponse: any): PromptResponse {
  console.log('promptResponseService: Mapping API response:', {
    id: apiResponse.id || apiResponse._id,
    promptId: apiResponse.promptId,
    response: apiResponse.response,
    content: apiResponse.response?.content,
    child: apiResponse.child,
    attachments: apiResponse.attachments,
    attachmentsLength: apiResponse.attachments?.length
  });
  
  // Map attachments to ensure they have the correct structure
  const mappedAttachments = (apiResponse.attachments || []).map((attachment: any) => ({
    id: attachment.id || attachment._id || attachment.url, // Use _id as fallback, then URL
    publicId: attachment.publicId || '',
    url: attachment.url || '',
    type: attachment.type || 'image',
    filename: attachment.filename || attachment.caption || '',
    size: attachment.size || 0,
    createdAt: attachment.createdAt || attachment.uploadedAt || '',
  }));
  
  // Handle different content structures
  let content = '';
  if (apiResponse.response && typeof apiResponse.response === 'object') {
    // New structure: response.content
    content = apiResponse.response.content || '';
  } else if (typeof apiResponse.content === 'string') {
    // Old structure: direct content
    content = apiResponse.content;
  } else if (typeof apiResponse.response === 'string') {
    // Fallback: response as string
    content = apiResponse.response;
  }
  
  // Handle different promptId structures
  let promptId = '';
  if (apiResponse.promptId && typeof apiResponse.promptId === 'object') {
    // New structure: promptId._id
    promptId = apiResponse.promptId._id || '';
  } else if (typeof apiResponse.promptId === 'string') {
    // Old structure: direct promptId
    promptId = apiResponse.promptId;
  }
  
  // Handle different child structures
  let childId = '';
  if (apiResponse.child && typeof apiResponse.child === 'object') {
    // New structure: child._id
    childId = apiResponse.child._id || '';
  } else if (typeof apiResponse.childId === 'string') {
    // Old structure: direct childId
    childId = apiResponse.childId;
  }
  
  return {
    id: apiResponse.id || apiResponse._id || '',
    promptId: promptId,
    childId: childId,
    parentId: apiResponse.parentId || '',
    content: content,
    attachments: mappedAttachments,
    feedback: apiResponse.feedback,
    createdAt: apiResponse.createdAt || '',
    updatedAt: apiResponse.updatedAt || '',
  };
}

// API functions
export async function getChildResponses(params: GetResponsesParams): Promise<{ responses: PromptResponse[]; total: number; page: number; limit: number }> {
  console.log('promptResponseService: Getting child responses for:', params);

  try {
    // Use the correct endpoint: /responses/child/:childId
    const response = await apiService.get(`/responses/child/${params.childId}`, {
      params: {
        page: params.page,
        limit: params.limit,
        promptId: params.promptId
      }
    });

    console.log('promptResponseService: Raw response:', response);

    // Handle different response structures
    let responses: PromptResponse[] = [];
    let total = 0;
    let page = params.page || 1;
    let limit = params.limit || 10;

    const responseData = response as any;

    if (Array.isArray(responseData)) {
      // Direct array of responses
      responses = responseData.map(mapPromptResponseFromApi);
      total = responseData.length;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      // Response with data array
      responses = responseData.data.map(mapPromptResponseFromApi);
      total = responseData.total || responseData.data.length;
      page = responseData.page || page;
      limit = responseData.limit || limit;
    } else if (responseData.responses && Array.isArray(responseData.responses)) {
      // Response with responses property
      responses = responseData.responses.map(mapPromptResponseFromApi);
      total = responseData.total || responseData.responses.length;
      page = responseData.page || page;
      limit = responseData.limit || limit;
    } else if (responseData.data && responseData.data.responses && Array.isArray(responseData.data.responses)) {
      // Response with data.responses structure (your backend format)
      responses = responseData.data.responses.map(mapPromptResponseFromApi);
      total = responseData.data.totalResponses || responseData.data.responses.length;
      page = responseData.data.currentPage || page;
      limit = params.limit || limit;
    } else {
      console.error('promptResponseService: Unexpected response structure:', responseData);
      throw new Error('Invalid response structure from server');
    }

    console.log('promptResponseService: Mapped responses:', responses.length);
    
    return {
      responses,
      total,
      page,
      limit
    };
    
  } catch (error: any) {
    console.error('promptResponseService: Failed to get child responses:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      response: error.response?.data
    });
    
    // Fallback to empty response
    return {
      responses: [],
      total: 0,
      page: 1,
      limit: params.limit || 10,
    };
  }
}

export async function createResponse(data: CreatePromptResponseData): Promise<PromptResponse> {
  console.log('promptResponseService: Creating response with data:', {
    promptId: data.promptId,
    childId: data.childId,
    content: data.content,
    attachmentsCount: data.attachments?.length || 0
  });

  // Validate required fields
  if (!data.promptId || !data.childId || !data.content) {
    const error = 'Missing required fields: promptId, childId, or content';
    console.error('promptResponseService: Validation error:', error);
    throw new Error(error);
  }

  // Create FormData for file uploads
  const formData = new FormData();
  
  // Add text fields
  formData.append('promptId', data.promptId);
  formData.append('child', data.childId); // Use 'child' as that's what the backend expects
  formData.append('response', JSON.stringify({ 
    type: 'text',
    content: data.content 
  }));
  
  console.log('promptResponseService: FormData text fields added:', {
    promptId: data.promptId,
    child: data.childId, // Using 'child' field name for backend
    contentLength: data.content.length
  });
  
  // Add attachments if any
  if (data.attachments && data.attachments.length > 0) {
    console.log('promptResponseService: Adding attachments:', data.attachments.length);
    data.attachments.forEach((file, index) => {
      // Handle both File objects and React Native file objects
      if (file instanceof File) {
        // Web File object
        console.log('promptResponseService: Adding web File:', file.name, file.type);
        
        // Validate file type against backend requirements
        const allowedTypes = [
          'image/jpeg', 'image/png', 'image/gif', 
          'video/mp4', 'video/quicktime', 
          'audio/mpeg', 'audio/wav'
        ];
        
        if (!allowedTypes.includes(file.type)) {
          console.warn('promptResponseService: Skipping web file with unsupported type:', file.type, file.name);
          return; // Skip this file
        }
        
        formData.append('attachments', file);
      } else {
        // React Native file object
        const fileObj = file as unknown as ReactNativeFile;
        const fileType = fileObj.type || 'image/jpeg';
        const fileName = fileObj.name || `attachment_${index}.jpg`;
        
        console.log('promptResponseService: Adding React Native file:', fileName, fileType);
        
        // Validate file type against backend requirements
        const allowedTypes = [
          'image/jpeg', 'image/png', 'image/gif', 
          'video/mp4', 'video/quicktime', 
          'audio/mpeg', 'audio/wav'
        ];
        
        if (!allowedTypes.includes(fileType)) {
          console.warn('promptResponseService: Skipping React Native file with unsupported type:', fileType, fileName);
          return; // Skip this file
        }
        
        formData.append('attachments', {
          uri: fileObj.uri,
          type: fileType,
          name: fileName,
        } as any);
      }
    });
  } else {
    console.log('promptResponseService: No attachments to add');
  }

  // Use fetch for multipart/form-data
  const token = await authService.getAccessToken();
  
  const url = `${BASE_URL}/responses`;
  console.log('promptResponseService: Creating response at:', url);
  console.log('promptResponseService: Request details:', {
    method: 'POST',
    url,
    hasToken: !!token,
    tokenLength: token ? token.length : 0
  });
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  console.log('promptResponseService: Create response status:', response.status);

  if (!response.ok) {
    let errorMessage = 'Failed to create response';
    let errorData: any = {};
    
    try {
      errorData = await response.json();
      errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
    } catch (parseError) {
      // If JSON parsing fails, use status text
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      console.error('promptResponseService: Failed to parse error response:', parseError);
    }
    
    console.error('promptResponseService: Create response error:', {
      status: response.status,
      statusText: response.statusText,
      errorData,
      errorMessage
    });
    
    throw new Error(errorMessage);
  }

  const result = await response.json();
  console.log('promptResponseService: Create response success:', result);
  
  const responseData = result.data || result;
  const mappedResponse = mapPromptResponseFromApi(responseData);
  console.log('promptResponseService: Mapped created response:', mappedResponse);
  
  return mappedResponse;
}

export async function updateResponse(responseId: string, data: UpdatePromptResponseData): Promise<PromptResponse> {
  console.log('promptResponseService: Updating response:', responseId, data);

  // Create FormData for text content only
  const formData = new FormData();
  
  // Add text fields - backend expects 'response' field as JSON
  if (data.content) {
    formData.append('response', JSON.stringify({ 
      content: data.content 
    }));
  }

  // Use fetch for multipart/form-data
  const token = await authService.getAccessToken();
  
  const url = `${BASE_URL}/responses/${responseId}`;
  console.log('promptResponseService: Updating response at:', url);
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = 'Failed to update response';
    let errorData: any = {};
    
    try {
      errorData = await response.json();
      errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
    } catch (parseError) {
      // If JSON parsing fails, use status text
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      console.error('promptResponseService: Failed to parse error response:', parseError);
    }
    
    console.error('promptResponseService: Update response error:', {
      status: response.status,
      statusText: response.statusText,
      errorData,
      errorMessage
    });
    
    throw new Error(errorMessage);
  }

  const result = await response.json();
  console.log('promptResponseService: Update response result:', result);
  
  // Handle the backend response structure: { data: { promptResponse: ... } }
  let responseData;
  if (result.data && result.data.promptResponse) {
    responseData = result.data.promptResponse;
  } else if (result.promptResponse) {
    responseData = result.promptResponse;
  } else {
    responseData = result.data || result;
  }
  
  return mapPromptResponseFromApi(responseData);
}

export async function addFeedback(responseId: string, feedback: FeedbackData): Promise<PromptResponse> {
  // Note: This endpoint might need to be updated based on your backend structure
  // You might need to pass promptId as well
  const response = await apiService.post(`/responses/${responseId}/feedback`, feedback);
  const responseData = response.data || response;
  return mapPromptResponseFromApi(responseData);
}

export async function deleteResponse(responseId: string): Promise<void> {
  console.log('promptResponseService: Deleting response:', responseId);
  
  try {
    await apiService.delete(`/responses/${responseId}`);
    console.log('promptResponseService: Response deleted successfully');
  } catch (error: any) {
    console.error('promptResponseService: Error deleting response:', error);
    console.error('promptResponseService: Error response:', error.response);
    console.error('promptResponseService: Error data:', error.response?.data);
    throw error;
  }
}

// Attachment management functions
export async function addAttachments(responseId: string, files: File[]): Promise<PromptResponse> {
  console.log('promptResponseService: Adding attachments to response:', responseId, files.length);
  console.log('promptResponseService: Files received:', files);
  
  const formData = new FormData();
  formData.append('action', 'add');
  
  let validFilesCount = 0;
  
  // Add files
  files.forEach((file, index) => {
    console.log('promptResponseService: Processing file at index:', index, file);
    
    if (file instanceof File) {
      console.log('promptResponseService: Adding web file:', file.name, file.type, 'size:', file.size);
      
      // Validate file size
      if (file.size === 0) {
        console.warn('promptResponseService: Skipping empty web file:', file.name);
        return;
      }
      
      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 
        'video/mp4', 'video/quicktime', 
        'audio/mpeg', 'audio/wav'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        console.warn('promptResponseService: Skipping file with unsupported type:', file.type, file.name);
        return;
      }
      
      formData.append('attachments', file);
      validFilesCount++;
    } else {
      // React Native file object
      const fileObj = file as unknown as ReactNativeFile;
      const fileType = fileObj.type || 'image/jpeg';
      const fileName = fileObj.name || `attachment_${index}.jpg`;
      
      console.log('promptResponseService: Adding React Native file:', fileName, fileType, 'uri:', fileObj.uri);
      
      if (!fileObj.uri || fileObj.uri.trim() === '') {
        console.warn('promptResponseService: Skipping React Native file with empty URI:', fileName);
        return;
      }
      
      // Get file size for React Native files
      const getFileSize = async (uri: string): Promise<number> => {
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          return blob.size;
        } catch (error) {
          console.error('Error getting file size:', error);
          return 0;
        }
      };
      
      // Check file size before uploading
      getFileSize(fileObj.uri).then(fileSize => {
        console.log('promptResponseService: React Native file size:', fileSize, 'bytes,', (fileSize / (1024 * 1024)).toFixed(2), 'MB');
        
        if (fileSize > 10 * 1024 * 1024) { // 10MB limit
          console.warn('promptResponseService: File too large:', fileSize, 'bytes');
        }
      });
      
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 
        'video/mp4', 'video/quicktime', 
        'audio/mpeg', 'audio/wav'
      ];
      
      if (!allowedTypes.includes(fileType)) {
        console.warn('promptResponseService: Skipping file with unsupported type:', fileType, fileName);
        return;
      }
      
      formData.append('attachments', {
        uri: fileObj.uri,
        type: fileType,
        name: fileName,
      } as any);
      validFilesCount++;
    }
  });
  
  console.log('promptResponseService: Valid files to upload:', validFilesCount);
  
  if (validFilesCount === 0) {
    throw new Error('No valid files to upload');
  }

  const token = await authService.getAccessToken();
  const url = `${BASE_URL}/responses/${responseId}/attachments`;
  
  console.log('promptResponseService: Sending request to:', url);
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = 'Failed to add attachments';
    let errorData: any = {};
    
    try {
      errorData = await response.json();
      errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
    } catch (parseError) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      console.error('promptResponseService: Failed to parse error response:', parseError);
    }
    
    console.error('promptResponseService: Add attachments error:', {
      status: response.status,
      statusText: response.statusText,
      errorData,
      errorMessage
    });
    
    throw new Error(errorMessage);
  }

  const result = await response.json();
  console.log('promptResponseService: Add attachments result:', result);
  
  // Handle the backend response structure
  let responseData;
  if (result.data && result.data.promptResponse) {
    responseData = result.data.promptResponse;
  } else if (result.promptResponse) {
    responseData = result.promptResponse;
  } else {
    responseData = result.data || result;
  }
  
  return mapPromptResponseFromApi(responseData);
}

export async function removeAttachments(responseId: string, attachmentIds: string[]): Promise<PromptResponse> {
  console.log('promptResponseService: Removing attachments from response:', responseId, attachmentIds);
  
  const token = await authService.getAccessToken();
  const url = `${BASE_URL}/responses/${responseId}/attachments`;
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'remove',
      attachmentIds: attachmentIds
    }),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to remove attachments';
    let errorData: any = {};
    
    try {
      errorData = await response.json();
      errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
    } catch (parseError) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      console.error('promptResponseService: Failed to parse error response:', parseError);
    }
    
    console.error('promptResponseService: Remove attachments error:', {
      status: response.status,
      statusText: response.statusText,
      errorData,
      errorMessage
    });
    
    throw new Error(errorMessage);
  }

  const result = await response.json();
  console.log('promptResponseService: Remove attachments result:', result);
  
  // Handle the backend response structure
  let responseData;
  if (result.data && result.data.promptResponse) {
    responseData = result.data.promptResponse;
  } else if (result.promptResponse) {
    responseData = result.promptResponse;
  } else {
    responseData = result.data || result;
  }
  
  return mapPromptResponseFromApi(responseData);
}

export async function replaceAttachments(responseId: string, files: File[]): Promise<PromptResponse> {
  console.log('promptResponseService: Replacing attachments for response:', responseId, files.length);
  
  const formData = new FormData();
  formData.append('action', 'replace');
  
  // Add files
  files.forEach((file, index) => {
    if (file instanceof File) {
      console.log('promptResponseService: Adding file for replacement:', file.name, file.type, 'size:', file.size);
      
      // Validate file size
      if (file.size === 0) {
        console.warn('promptResponseService: Skipping empty file:', file.name);
        return;
      }
      
      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 
        'video/mp4', 'video/quicktime', 
        'audio/mpeg', 'audio/wav'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        console.warn('promptResponseService: Skipping file with unsupported type:', file.type, file.name);
        return;
      }
      
      formData.append('attachments', file);
    } else {
      // React Native file object
      const fileObj = file as unknown as ReactNativeFile;
      const fileType = fileObj.type || 'image/jpeg';
      const fileName = fileObj.name || `attachment_${index}.jpg`;
      
      console.log('promptResponseService: Adding React Native file for replacement:', fileName, fileType, 'uri:', fileObj.uri);
      
      if (!fileObj.uri || fileObj.uri.trim() === '') {
        console.warn('promptResponseService: Skipping React Native file with empty URI:', fileName);
        return;
      }
      
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 
        'video/mp4', 'video/quicktime', 
        'audio/mpeg', 'audio/wav'
      ];
      
      if (!allowedTypes.includes(fileType)) {
        console.warn('promptResponseService: Skipping file with unsupported type:', fileType, fileName);
        return;
      }
      
      formData.append('attachments', {
        uri: fileObj.uri,
        type: fileType,
        name: fileName,
      } as any);
    }
  });

  const token = await authService.getAccessToken();
  const url = `${BASE_URL}/responses/${responseId}/attachments`;
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = 'Failed to replace attachments';
    let errorData: any = {};
    
    try {
      errorData = await response.json();
      errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
    } catch (parseError) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      console.error('promptResponseService: Failed to parse error response:', parseError);
    }
    
    console.error('promptResponseService: Replace attachments error:', {
      status: response.status,
      statusText: response.statusText,
      errorData,
      errorMessage
    });
    
    throw new Error(errorMessage);
  }

  const result = await response.json();
  console.log('promptResponseService: Replace attachments result:', result);
  
  // Handle the backend response structure
  let responseData;
  if (result.data && result.data.promptResponse) {
    responseData = result.data.promptResponse;
  } else if (result.promptResponse) {
    responseData = result.promptResponse;
  } else {
    responseData = result.data || result;
  }
  
  return mapPromptResponseFromApi(responseData);
}

// Test function to check if endpoints exist
export async function testEndpoints(): Promise<void> {
  console.log('promptResponseService: Testing endpoints...');
  
  try {
    // Test the base endpoint
    const response = await apiService.get('/responses');
    console.log('promptResponseService: Base endpoint test successful:', response);
  } catch (error) {
    console.error('promptResponseService: Base endpoint test failed:', error);
  }
} 