import apiService from "./apiService";

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
  category?: 'personal' | 'academic' | 'social' | 'emotional' | 'family' | 'hobbies' | 'future' | 'other';
  frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
  ageRange?: '0-3' | '4-6' | '7-9' | '10-12' | '13-15' | '16-18';
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
  type: "image" | "video" | "audio";
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
  console.log('promptService: Mapping API prompt:', {
    _id: apiPrompt._id,
    id: apiPrompt.id,
    title: apiPrompt.title,
    question: apiPrompt.question,
    content: apiPrompt.content,
    category: apiPrompt.category
  });
  
  const mappedPrompt = {
    id: apiPrompt._id || apiPrompt.id || crypto.randomUUID(),
    title: apiPrompt.title || "",
    content: apiPrompt.question || apiPrompt.content || "",
    category: apiPrompt.category,
    tags: apiPrompt.tags || [],
    isActive: apiPrompt.isActive !== undefined ? apiPrompt.isActive : true,
    createdAt: apiPrompt.createdAt || "",
    updatedAt: apiPrompt.updatedAt || "",
  };
  
  console.log('promptService: Mapped prompt:', mappedPrompt);
  return mappedPrompt;
}

// API functions
export async function getPrompts(
  params: GetPromptsParams = {}
): Promise<{ prompts: Prompt[]; total: number; page: number; limit: number }> {
  console.log('promptService: Getting prompts with params:', params);
  
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.category) queryParams.append("category", params.category);
  if (params.tags) queryParams.append("tags", params.tags.join(","));
  if (params.isActive !== undefined)
    queryParams.append("isActive", params.isActive.toString());
  if (params.search) queryParams.append("search", params.search);

  const response = await apiService.get(`/prompts?${queryParams.toString()}`);
  const data = response.data || response;
  
  console.log('promptService: Raw API response:', data);
  console.log('promptService: Raw prompts array:', data.prompts);

  // Map the prompts to ensure they have the correct structure
  const mappedPrompts = (data.prompts || []).map(mapPromptFromApi);
  
  console.log('promptService: Mapped prompts:', mappedPrompts);

  return {
    prompts: mappedPrompts,
    total: data.total || 0,
    page: data.currentPage || 1,
    limit: data.limit || 10,
  };
}

export async function getPrompt(promptId: string): Promise<Prompt> {
  const response = await apiService.get(`/prompts/${promptId}`);
  const data = response.data || response;
  return mapPromptFromApi(data);
}

export async function createPrompt(data: CreatePromptData): Promise<Prompt> {
  console.log('promptService: Creating prompt with data:', data);
  
  // Try JSON approach instead of FormData
  const requestData = {
    title: data.title,
    question: data.content, // Use 'question' field for backend
    category: data.category || 'other',
    frequency: data.frequency || 'daily',
    ageRange: data.ageRange || '4-6',
    isActive: true,
    tags: data.tags || [],
  };
  
  console.log('promptService: Sending JSON data:', requestData);
  console.log('promptService: Request data JSON:', JSON.stringify(requestData, null, 2));
  
  try {
    // Use apiService with JSON data
    const response = await apiService.post("/prompts", requestData);
    console.log('promptService: API response received:', response);
    const responseData = response.data || response;
    console.log('promptService: Response data:', responseData);
    return mapPromptFromApi(responseData);
  } catch (error: any) {
    console.error('promptService: Error creating prompt:', error);
    console.error('promptService: Error response:', error.response);
    console.error('promptService: Error data:', error.response?.data);
    throw error;
  }
}

export async function updatePrompt(
  promptId: string,
  data: UpdatePromptData
): Promise<Prompt> {
  const response = await apiService.put(`/prompts/${promptId}`, data);
  const responseData = response.data || response;
  return mapPromptFromApi(responseData);
}

export async function deletePrompt(promptId: string): Promise<void> {
  await apiService.delete(`/prompts/${promptId}`);
}

export async function getPromptResponses(
  promptId: string,
  params: { page?: number; limit?: number } = {}
): Promise<{
  responses: PromptResponse[];
  total: number;
  page: number;
  limit: number;
}> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());

  const response = await apiService.get(
    `/prompts/${promptId}/responses?${queryParams.toString()}`
  );
  return response.data || response;
}
