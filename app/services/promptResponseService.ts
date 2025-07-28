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
  
  return {
    id: apiResponse.id || apiResponse._id || '',
    promptId: apiResponse.promptId?._id || apiResponse.promptId || '',
    childId: apiResponse.child?._id || apiResponse.childId || '',
    parentId: apiResponse.parentId || '',
    content: apiResponse.response?.content || apiResponse.content || '',
    attachments: mappedAttachments,
    feedback: apiResponse.feedback,
    createdAt: apiResponse.createdAt || '',
    updatedAt: apiResponse.updatedAt || '',
  };
}

// API functions
export async function getChildResponses(params: GetResponsesParams): Promise<{ responses: PromptResponse[]; total: number; page: number; limit: number }> {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.promptId) queryParams.append('promptId', params.promptId);
  if (params.childId) queryParams.append('childId', params.childId);

  // Try different endpoint patterns
  const endpoints = [
    `/prompt-responses/child/${params.childId}?${queryParams.toString()}`,
    `/prompt-responses?${queryParams.toString()}`,
    `/responses/child/${params.childId}?${queryParams.toString()}`,
    `/responses?${queryParams.toString()}`
  ];
  
  console.log('promptResponseService: Trying endpoints:', endpoints);
  
  for (const endpoint of endpoints) {
    try {
      console.log(`promptResponseService: Trying endpoint:`, endpoint);
      const response = await apiService.get(endpoint);
      console.log(`promptResponseService: Endpoint ${endpoint} successful:`, response);
      
      const data = response.data || response;
      
      console.log('promptResponseService: Raw API response:', data);
      
      // Map the responses to ensure they have the correct structure
      const mappedResponses = (data.responses || []).map(mapPromptResponseFromApi);
      
      console.log('promptResponseService: Mapped responses:', mappedResponses);
      
      return {
        responses: mappedResponses,
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || 10,
      };
    } catch (error) {
      console.log(`promptResponseService: Endpoint ${endpoint} failed:`, error);
      // Continue to next endpoint
    }
  }
  
  // If all endpoints fail, return empty result
  console.log('promptResponseService: All endpoints failed, returning empty result');
  return {
    responses: [],
    total: 0,
    page: 1,
    limit: params.limit || 10,
  };
}

export async function createResponse(data: CreatePromptResponseData): Promise<PromptResponse> {
  console.log('promptResponseService: Creating response with data:', {
    promptId: data.promptId,
    childId: data.childId,
    content: data.content,
    attachmentsCount: data.attachments?.length || 0
  });

  // Create FormData for file uploads
  const formData = new FormData();
  
  // Add text fields
  formData.append('promptId', data.promptId);
  formData.append('childId', data.childId);
  formData.append('content', data.content);
  
  // Add attachments if any
  if (data.attachments && data.attachments.length > 0) {
    data.attachments.forEach((file, index) => {
      const fileObj = file as unknown as ReactNativeFile;
      formData.append('attachments', {
        uri: fileObj.uri,
        type: fileObj.type || 'image/jpeg',
        name: fileObj.name || `attachment_${index}.jpg`,
      } as any);
    });
  }

  // Use fetch for multipart/form-data
  const token = await authService.getAccessToken();
  
  const url = `${BASE_URL}/prompt-responses`;
  console.log('promptResponseService: Creating response at:', url);
  
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
    const errorData = await response.json().catch(() => ({}));
    console.error('promptResponseService: Create response error:', errorData);
    throw new Error(errorData.message || 'Failed to create response');
  }

  const result = await response.json();
  console.log('promptResponseService: Create response success:', result);
  
  const responseData = result.data || result;
  const mappedResponse = mapPromptResponseFromApi(responseData);
  console.log('promptResponseService: Mapped created response:', mappedResponse);
  
  return mappedResponse;
}

export async function updateResponse(responseId: string, data: UpdatePromptResponseData): Promise<PromptResponse> {
  // Create FormData for file uploads
  const formData = new FormData();
  
  // Add text fields
  if (data.content) {
    formData.append('content', data.content);
  }
  
  // Add attachments if any
  if (data.attachments && data.attachments.length > 0) {
    data.attachments.forEach((file, index) => {
      const fileObj = file as unknown as ReactNativeFile;
      formData.append('attachments', {
        uri: fileObj.uri,
        type: fileObj.type || 'image/jpeg',
        name: fileObj.name || `attachment_${index}.jpg`,
      } as any);
    });
  }

  // Use fetch for multipart/form-data
  const token = await authService.getAccessToken();
  
  const response = await fetch(`${BASE_URL}/prompt-responses/${responseId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update response');
  }

  const result = await response.json();
  const responseData = result.data || result;
  return mapPromptResponseFromApi(responseData);
}

export async function addFeedback(responseId: string, feedback: FeedbackData): Promise<PromptResponse> {
  const response = await apiService.post(`/prompt-responses/${responseId}/feedback`, feedback);
  const responseData = response.data || response;
  return mapPromptResponseFromApi(responseData);
}

export async function deleteResponse(responseId: string): Promise<void> {
  await apiService.delete(`/prompt-responses/${responseId}`);
} 