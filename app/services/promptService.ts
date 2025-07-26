import apiService from './apiService';

// Type definitions
export interface Prompt {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromptData {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
}

export interface UpdatePromptData {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface GetPromptsParams {
  page?: number;
  limit?: number;
  category?: string;
  tags?: string[];
  isActive?: boolean;
  search?: string;
}

export interface PromptResponse {
  id: string;
  promptId: string;
  childId: string;
  parentId: string;
  content: string;
  attachments?: PromptResponseAttachment[];
  feedback?: {
    rating: number;
    comment?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PromptResponseAttachment {
  id: string;
  publicId: string;
  url: string;
  type: 'image' | 'video' | 'audio';
  filename: string;
  size: number;
  createdAt: string;
}

export interface CreatePromptResponseData {
  promptId: string;
  childId: string;
  content: string;
  attachments?: File[];
}

export interface UpdatePromptResponseData {
  content?: string;
  attachments?: File[];
}

export interface GetResponsesParams {
  childId: string;
  page?: number;
  limit?: number;
  promptId?: string;
}

export interface FeedbackData {
  rating: number;
  comment?: string;
}

// Helper function to map API response to Prompt interface
function mapPromptFromApi(apiPrompt: any): Prompt {
  console.log('promptService: Mapping prompt from API:', {
    id: apiPrompt.id || apiPrompt._id,
    title: apiPrompt.title,
    content: apiPrompt.content,
    question: apiPrompt.question,
    category: apiPrompt.category
  });
  
  return {
    id: apiPrompt.id || apiPrompt._id || '',
    title: apiPrompt.title || '',
    content: apiPrompt.question || apiPrompt.content || '', // Use question field if available
    category: apiPrompt.category,
    tags: apiPrompt.tags || [],
    isActive: apiPrompt.isActive !== undefined ? apiPrompt.isActive : true,
    createdAt: apiPrompt.createdAt || '',
    updatedAt: apiPrompt.updatedAt || '',
  };
}

// API functions
export async function getPrompts(params: GetPromptsParams = {}): Promise<{ prompts: Prompt[]; total: number; page: number; limit: number }> {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.category) queryParams.append('category', params.category);
  if (params.tags) queryParams.append('tags', params.tags.join(','));
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
  if (params.search) queryParams.append('search', params.search);

  const response = await apiService.get(`/prompts?${queryParams.toString()}`);
  const data = response.data || response;
  
  // Map the prompts to ensure they have the correct structure
  const mappedPrompts = (data.prompts || []).map(mapPromptFromApi);
  
  return {
    prompts: mappedPrompts,
    total: data.total || 0,
    page: data.page || 1,
    limit: data.limit || 10,
  };
}

export async function getPrompt(promptId: string): Promise<Prompt> {
  const response = await apiService.get(`/prompts/${promptId}`);
  const data = response.data || response;
  return mapPromptFromApi(data);
}

export async function createPrompt(data: CreatePromptData): Promise<Prompt> {
  const response = await apiService.post('/prompts', data);
  const responseData = response.data || response;
  return mapPromptFromApi(responseData);
}

export async function updatePrompt(promptId: string, data: UpdatePromptData): Promise<Prompt> {
  const response = await apiService.put(`/prompts/${promptId}`, data);
  const responseData = response.data || response;
  return mapPromptFromApi(responseData);
}

export async function deletePrompt(promptId: string): Promise<void> {
  await apiService.delete(`/prompts/${promptId}`);
}

export async function getPromptResponses(promptId: string, params: { page?: number; limit?: number } = {}): Promise<{ responses: PromptResponse[]; total: number; page: number; limit: number }> {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const response = await apiService.get(`/prompts/${promptId}/responses?${queryParams.toString()}`);
  return response.data || response;
} 