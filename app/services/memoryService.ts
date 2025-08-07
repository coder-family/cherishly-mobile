import { API_BASE_URL } from '@env';
import { conditionalLog } from '../utils/logUtils';
import { sanitizeObjectId } from '../utils/validation';
import apiService from './apiService';
import authService from './authService';

// Use the same fallback as apiService
const BASE_URL = API_BASE_URL || "https://growing-together-app.onrender.com/api";

// Type definitions
export interface Memory {
  id: string;
  title: string;
  content: string;
  childId: string;
  parentId: string | { // Can be string or object with user info
    _id: string;
    id: string;
    firstName: string;
    lastName?: string;
    avatar?: string;
    name?: string;
  };
  date: string; // Add date field
  visibility?: 'private' | 'public'; // Add visibility field
  location?: { // Add location field
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  attachments?: MemoryAttachment[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  creator?: { // Add creator information
    id: string;
    firstName: string;
    lastName?: string;
    avatar?: string;
  };
}

export interface MemoryAttachment {
  id: string;
  publicId: string;  // Backend requires this field for attachment identification
  url: string;
  type: 'image' | 'video' | 'audio';
  filename: string;
  size: number;
  createdAt: string;
}

// Helper function to map attachment from API response to frontend interface
function mapAttachment(att: any): MemoryAttachment {
  // DEBUG: Log the raw attachment object to see what fields are available
  conditionalLog.memoryApi('Raw attachment object from API:', {
    allKeys: Object.keys(att || {}),
    hasUnderscore_id: !!att._id,
    hasId: !!att.id,
    hasPublicId: !!att.publicId,
    hasFilename: !!att.filename,
    hasUrl: !!att.url,
    attachmentStructure: {
      _id: att._id,
      id: att.id,
      publicId: att.publicId,
      url: att.url?.substring(0, 100),
      type: att.type,
      size: att.size,
      filename: att.filename,
      createdAt: att.createdAt,
      updatedAt: att.updatedAt
    }
  });
  
  // REALITY CHECK: Backend doesn't return MongoDB _id for attachments
  // We need to work with what we actually get from the API
  let attachmentId = att._id || att.id;
  
  // Priority 2: Use publicId field if available
  if (!attachmentId) {
    attachmentId = att.publicId;
  }
  
  // Priority 3: Extract from Cloudinary URL (fallback only)
  if (!attachmentId && att.url) {
    // Extract Cloudinary public ID from URL like: .../upload/v1234567890/memories/public_id.jpg
    const urlMatch = att.url.match(/\/upload\/v\d+\/[^\/]+\/([^\/]+)\.[^\/]+$/);
    if (urlMatch) {
      attachmentId = urlMatch[1]; // Use the Cloudinary public ID
      conditionalLog.memoryApi('Using Cloudinary publicId as fallback (backend prefers MongoDB _id):', {
        originalUrl: att.url,
        extractedPublicId: attachmentId,
        hasMongoId: !!(att._id || att.id),
        hasPublicIdField: !!att.publicId
      });
    } else {
      // Try alternative Cloudinary URL patterns
      const altMatches = [
        // Pattern without version: .../upload/memories/public_id.jpg
        att.url.match(/\/upload\/[^\/]+\/([^\/]+)\.[^\/]+$/),
        // Pattern with subfolder: .../upload/v1234/folder/subfolder/public_id.jpg
        att.url.match(/\/upload\/v\d+\/[^\/]+\/[^\/]+\/([^\/]+)\.[^\/]+$/),
        // Direct publicId in URL: .../public_id.jpg
        att.url.match(/\/([^\/]+)\.[^\/]+$/)
      ];
      
      for (let i = 0; i < altMatches.length; i++) {
        if (altMatches[i]) {
          attachmentId = altMatches[i][1];
          conditionalLog.memoryApi('Using alternative Cloudinary pattern as fallback:', {
            originalUrl: att.url,
            extractedPublicId: attachmentId,
            patternIndex: i + 1
          });
          break;
        }
      }
      
      // Final fallback: use end of URL without extension
      if (!attachmentId) {
        attachmentId = `extracted_${att.url.split('/').pop()?.split('.')[0] || Date.now()}`;
        conditionalLog.memoryApi('Used final fallback ID extraction:', {
          originalUrl: att.url,
          fallbackId: attachmentId
        });
      }
    }
  }
  
  // Extract Cloudinary public ID for the publicId field
  let cloudinaryPublicId = '';
  if (att.url) {
    const urlMatch = att.url.match(/\/upload\/v\d+\/[^\/]+\/([^\/]+)\.[^\/]+$/);
    if (urlMatch) {
      cloudinaryPublicId = urlMatch[1];
    } else {
      // Try alternative patterns
      const altMatches = [
        att.url.match(/\/upload\/[^\/]+\/([^\/]+)\.[^\/]+$/),
        att.url.match(/\/upload\/v\d+\/[^\/]+\/[^\/]+\/([^\/]+)\.[^\/]+$/),
        att.url.match(/\/([^\/]+)\.[^\/]+$/)
      ];
      
      for (let i = 0; i < altMatches.length; i++) {
        if (altMatches[i]) {
          cloudinaryPublicId = altMatches[i][1];
          break;
        }
      }
    }
  }
  
  // Log the final mapping for debugging
  conditionalLog.memoryApi('Final attachment mapping:', {
    preferredId: att._id || att.id || 'none',
    publicIdField: att.publicId || 'none',
    extractedPublicId: cloudinaryPublicId || 'none',
    finalIdUsed: attachmentId,
    finalPublicId: att.publicId || cloudinaryPublicId,
    idSource: att._id || att.id ? 'MongoDB _id' : (att.publicId ? 'publicId field' : 'URL extraction'),
    url: att.url?.substring(0, 80) + '...'
  });

  return {
    id: attachmentId,
    publicId: att.publicId || cloudinaryPublicId,  // Backend requires this field
    url: att.url,
    type: att.type,
    filename: att.filename || att.url.split('/').pop() || 'attachment',
    size: att.size,
    createdAt: att.createdAt
  };
}

export interface CreateMemoryData {
  title: string;
  content: string;
  childId: string;
  date: string; // Required date field
  tags?: string[];
  visibility?: 'private' | 'public'; // Optional visibility
  location?: { // Optional location
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  attachments?: File[];
}

export interface UpdateMemoryData {
  title?: string;
  content?: string;
  date?: string; // Optional date field
  tags?: string[];
  visibility?: 'private' | 'public'; // Optional visibility
  location?: { // Optional location
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface GetMemoriesParams {
  childId: string; // Required childId
  startDate?: string; // Optional start date (ISO format)
  endDate?: string; // Optional end date (ISO format)
  tags?: string[]; // Optional tags array
  visibility?: 'private' | 'public'; // Optional visibility filter
  page?: number; // Optional pagination
  limit?: number; // Optional limit (1-100)
}

// Memory service functions
export async function getMemories(params: GetMemoriesParams): Promise<{ memories: Memory[]; total: number; page: number; limit: number }> {
  const queryParams = new URLSearchParams();
  
  // Required parameter
  queryParams.append('childId', params.childId);
  
  // Optional parameters
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.visibility) queryParams.append('visibility', params.visibility);
  if (params.tags && params.tags.length > 0) {
    // Send tags as JSON string as expected by backend validation
    queryParams.append('tags', JSON.stringify(params.tags));
  }

  const queryString = queryParams.toString();
  const url = queryString ? `/memories?${queryString}` : '/memories';
  
  conditionalLog.memoryApi('Memory API Request:', { url, params, queryString });
  
  const response = await apiService.get(url);
  const responseData = response.data || response;
  
  // Log the full response to understand the structure
  conditionalLog.memoryApi('Full API Response:', responseData);
  conditionalLog.memoryApi('Memory API Response:', { 
    count: responseData?.memories?.length || responseData?.count || responseData?.data?.length || 0,
    total: responseData?.total || responseData?.count,
    memories: responseData?.memories || responseData?.data || responseData?.results || [],
    firstMemory: (responseData?.memories || responseData?.data || responseData?.results || [])[0],
    lastMemory: (responseData?.memories || responseData?.data || responseData?.results || [])[(responseData?.memories || responseData?.data || responseData?.results || []).length - 1]
  });
  
  // Handle different possible response structures
  let memories = [];
  let total = 0;
  let page = 1;
  let limit = 50;
  
  if (responseData?.memories) {
    // Expected structure: { memories: [...], pagination: { total: 3, page: 1, limit: 50 } }
    memories = responseData.memories;
    
    // Handle pagination object structure
    if (responseData.pagination) {
      total = responseData.pagination.total || responseData.memories.length;
      page = responseData.pagination.page || 1;
      limit = responseData.pagination.limit || 50;
    } else {
      // Fallback to root level properties
      total = responseData.total || responseData.memories.length;
      page = responseData.page || 1;
      limit = responseData.limit || 50;
    }
  } else if (responseData?.data) {
    // Alternative structure: { data: [...], count: 3, ... }
    memories = responseData.data;
    total = responseData.count || responseData.total || responseData.data.length;
    page = responseData.page || 1;
    limit = responseData.limit || 50;
  } else if (responseData?.results) {
    // Another alternative: { results: [...], count: 3, ... }
    memories = responseData.results;
    total = responseData.count || responseData.total || responseData.results.length;
    page = responseData.page || 1;
    limit = responseData.limit || 50;
  } else if (Array.isArray(responseData)) {
    // Direct array response: [...]
    memories = responseData;
    total = responseData.length;
    page = 1;
    limit = 50;
  }
  
  conditionalLog.memoryApi('Parsed Memory Data:', { memories: memories.length, total, page, limit });
  
  // Map API fields to frontend interface
  const mappedMemories = memories.map((memory: any) => {
    // Debug: Log the raw memory data
    conditionalLog.memoryApi('Raw memory data:', {
      id: memory._id,
      parentId: memory.parentId,
      parentIdType: typeof memory.parentId,
      hasParentId: !!memory.parentId,
      parentIdKeys: memory.parentId ? Object.keys(memory.parentId) : null
    });

    // Extract creator info from parentId object
    let creator = null;
    if (memory.parentId && typeof memory.parentId === 'object' && memory.parentId._id) {
      creator = {
        id: memory.parentId._id,
        firstName: memory.parentId.firstName,
        lastName: memory.parentId.lastName,
        avatar: memory.parentId.avatar
      };
      conditionalLog.memoryApi('Created creator object:', creator);
    } else {
      conditionalLog.memoryApi('No creator extracted, parentId:', memory.parentId);
    }

    const mappedMemory = {
      id: memory._id || memory.id,
      title: memory.title,
      content: memory.content,
      childId: memory.child || memory.childId,
      parentId: memory.authorId || memory.parentId,
      date: memory.date || memory.createdAt, // Use date field or fallback to createdAt
      visibility: memory.visibility,
      location: memory.location,
      attachments: memory.attachments?.map((att: any) => mapAttachment(att)) || [],
      tags: memory.tags || [],
      createdAt: memory.createdAt,
      updatedAt: memory.updatedAt,
      creator: creator
    };

    conditionalLog.memoryApi('Final mapped memory creator:', mappedMemory.creator);
    return mappedMemory;
  });
  
  conditionalLog.memoryApi('Mapped Memories:', { count: mappedMemories.length, firstMapped: mappedMemories[0] });
  
  return { memories: mappedMemories, total, page, limit };
}

export async function getMemoryById(memoryId: string): Promise<Memory> {
  // Sanitize the memoryId to prevent NoSQL injection
  const sanitizedMemoryId = sanitizeObjectId(memoryId);
  const response = await apiService.get(`/memories/${sanitizedMemoryId}`);
  const memory = response.data || response;
  
  // Map API fields to frontend interface (same mapping as in getMemories)
  const mappedMemory: Memory = {
    id: memory._id || memory.id,
    title: memory.title,
    content: memory.content,
    childId: memory.child || memory.childId,
    parentId: memory.authorId || memory.parentId,
    date: memory.date || memory.createdAt, // Use date field or fallback to createdAt
    visibility: memory.visibility,
    location: memory.location,
    attachments: memory.attachments?.map((att: any) => mapAttachment(att)) || [],
    tags: memory.tags || [],
    createdAt: memory.createdAt,
    updatedAt: memory.updatedAt
  };
  
  return mappedMemory;
}

export async function createMemory(data: CreateMemoryData): Promise<Memory> {
  conditionalLog.memoryApi('Creating memory with data:', data);
  conditionalLog.memoryApi('API_BASE_URL:', API_BASE_URL);
  
  // Create FormData for file uploads
  const formData = new FormData();
  
  // Add text fields
  formData.append('title', data.title);
  formData.append('content', data.content);
  formData.append('child', data.childId); // Use 'child' as that's what the backend expects
  
  // Add date field (required by backend validation)
  formData.append('date', data.date);
  
  // Add optional fields if provided
  if (data.visibility) {
    formData.append('visibility', data.visibility);
  }
  
  if (data.location) {
    formData.append('location', JSON.stringify(data.location));
  }
  
  conditionalLog.memoryApi('FormData fields added:');
  conditionalLog.memoryApi('- title:', data.title);
  conditionalLog.memoryApi('- content:', data.content);
  conditionalLog.memoryApi('- child:', data.childId);
  conditionalLog.memoryApi('- date:', data.date);
  conditionalLog.memoryApi('- visibility:', data.visibility);
  conditionalLog.memoryApi('- location:', data.location);
  
  if (data.tags) {
    data.tags.forEach(tag => formData.append('tags', tag));
    conditionalLog.memoryApi('- tags:', data.tags);
  }
  
  // Add attachments if any
  if (data.attachments) {
    data.attachments.forEach((file, index) => {
      conditionalLog.memoryApi(`- attachment ${index}:`, {
        name: (file as any).name,
        type: (file as any).type,
        uri: (file as any).uri ? (file as any).uri.substring(0, 50) + '...' : 'no uri'
      });
      
      // Create proper file object for React Native FormData
      const fileObject = {
        uri: (file as any).uri,
        type: (file as any).type,
        name: (file as any).name || `file_${index}.${(file as any).type.includes('video') ? 'mp4' : 'jpg'}`,
        size: (file as any).size || 0,
      };
      
      // For React Native, we need to append the file object directly
      // Make sure the file object has all required properties
      if (fileObject.uri && fileObject.type && fileObject.name) {
        formData.append('attachments', fileObject as any);
        conditionalLog.memoryApi(`- Successfully added attachment ${index}:`, fileObject.name);
      } else {
        conditionalLog.memoryApi(`- Skipping invalid attachment ${index}:`, fileObject);
      }
    });
  }

  // Use fetch for multipart/form-data
  const token = await authService.getAccessToken();
  
  const baseUrl = API_BASE_URL || "https://growing-together-app.onrender.com/api";
  conditionalLog.memoryApi('Making API request to:', `${baseUrl}/memories`);
  conditionalLog.memoryApi('With token:', token ? 'Token present' : 'No token');
  conditionalLog.memoryApi('Request headers:', {
    'Content-Type': 'multipart/form-data',
    'Authorization': token ? 'Bearer [TOKEN]' : 'None'
  });
  
  const response = await fetch(`${baseUrl}/memories`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  conditionalLog.memoryApi('Response status:', response.status);
  conditionalLog.memoryApi('Response statusText:', response.statusText);
  conditionalLog.memoryApi('Response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    conditionalLog.memoryApi('Raw error response text:', errorText);
    conditionalLog.memoryApi('Error text length:', errorText.length);
    
    let errorData: any = {};
    try {
      errorData = JSON.parse(errorText);
      conditionalLog.memoryApi('Parsed error data:', errorData);
    } catch {
      conditionalLog.memoryApi('Failed to parse error response as JSON, treating as plain text');
    }
    
    // Create a more informative error message
    let errorMessage = errorData.message || errorData.error || errorText || `HTTP ${response.status}: ${response.statusText}`;
    if (!errorMessage || errorMessage.trim() === '') {
      errorMessage = `Server returned ${response.status} error but no error message`;
    }
    
    conditionalLog.memoryApi('Final error message:', errorMessage);
    
    const error: any = new Error(errorMessage);
    error.status = response.status;
    error.rawResponse = errorText;
    error.parsedError = errorData;
    throw error;
  }

  const result = await response.json();
  conditionalLog.memoryApi('Memory creation result:', result);
  
  // Map API fields to frontend interface (same mapping as in getMemories)
  const mappedMemory: Memory = {
    id: result._id || result.id,
    title: result.title,
    content: result.content,
    childId: result.child || result.childId,
    parentId: result.authorId || result.parentId,
    date: result.date || result.createdAt, // Use date field or fallback to createdAt
    visibility: result.visibility,
    location: result.location,
    attachments: result.attachments?.map((att: any) => mapAttachment(att)) || [],
    tags: result.tags || [],
    createdAt: result.createdAt,
    updatedAt: result.updatedAt
  };
  
  return mappedMemory;
}

export async function updateMemory(memoryId: string, data: UpdateMemoryData & { attachments?: any[] }): Promise<Memory> {
  // Sanitize the memoryId to prevent NoSQL injection
  const sanitizedMemoryId = sanitizeObjectId(memoryId);
  conditionalLog.memoryApi('updateMemory called with:', { memoryId: sanitizedMemoryId, data });
  
  // Check if we have attachments to upload
  const hasAttachments = data.attachments && data.attachments.length > 0;
  
  // For memory updates, we need to handle existing attachments differently
  // The backend expects all attachments to have publicId fields
  if (hasAttachments) {
    conditionalLog.memoryApi('=== HANDLING MEMORY UPDATE WITH ATTACHMENTS ===');
    conditionalLog.memoryApi('Attachments provided:', data.attachments?.map(att => ({
      name: att.name,
      type: att.type,
      hasPublicId: !!att.publicId,
      publicId: att.publicId
    })));
    
    // Check if these are new files or existing attachments
    const newFiles = data.attachments?.filter(att => att.uri && !att.publicId) || [];
    const existingAttachments = data.attachments?.filter(att => att.publicId) || [];
    
    conditionalLog.memoryApi('File analysis:', {
      newFiles: newFiles.length,
      existingAttachments: existingAttachments.length,
      newFileNames: newFiles.map(f => f.name),
      existingAttachmentIds: existingAttachments.map(a => a.publicId)
    });
    
    // If we have existing attachments, we need to include their publicId fields
    // This is what the backend validation is expecting
    if (existingAttachments.length > 0) {
      conditionalLog.memoryApi('Including existing attachments with publicId fields for backend validation');
    }
  }
  
  if (hasAttachments) {
    // Use FormData for multipart upload with attachments
    const formData = new FormData();
    
    // Add only the fields that the backend expects for updates
    if (data.title) formData.append('title', data.title);
    if (data.content) formData.append('content', data.content);
    if (data.date) formData.append('date', data.date);
    if (data.visibility) formData.append('visibility', data.visibility);
    if (data.location) formData.append('location', JSON.stringify(data.location));
    
    // Handle tags carefully - only send if they exist and are not empty
    if (data.tags && data.tags.length > 0) {
      // Send tags as individual fields like in memory creation
      data.tags.forEach(tag => {
        if (tag && tag.trim()) {
          formData.append('tags', tag.trim());
        }
      });
    }
    
    // Add new file attachments
    const newFiles = data.attachments?.filter(att => att.uri && !att.publicId) || [];
    newFiles.forEach((file, index) => {
      conditionalLog.memoryApi(`Adding new file attachment ${index}:`, {
        name: file.name,
        type: file.type,
        size: file.size
      });
      formData.append('attachments', file as any);
    });
    
    // Add existing attachments with their publicId fields for backend validation
    const existingAttachments = data.attachments?.filter(att => att.publicId) || [];
    existingAttachments.forEach((attachment, index) => {
      conditionalLog.memoryApi(`Adding existing attachment ${index} with publicId:`, {
        name: attachment.name,
        publicId: attachment.publicId,
        type: attachment.type
      });
      
      // For existing attachments, we need to send the publicId field
      // The backend expects this for validation
      formData.append('attachments', JSON.stringify({
        publicId: attachment.publicId,
        type: attachment.type,
        url: attachment.url,
        size: attachment.size,
        filename: attachment.filename
      }));
    });

    // Use fetch for multipart/form-data
    const token = await authService.getAccessToken();
    
    const baseUrl = API_BASE_URL || "https://growing-together-app.onrender.com/api";
    conditionalLog.memoryApi('Making multipart update request to:', `${baseUrl}/memories/${sanitizedMemoryId}`);
    conditionalLog.memoryApi('FormData contents:');
    conditionalLog.memoryApi('- title:', data.title);
    conditionalLog.memoryApi('- content:', data.content);
    conditionalLog.memoryApi('- tags:', data.tags);
    conditionalLog.memoryApi('- attachments count:', data.attachments!.length);
    
    const response = await fetch(`${baseUrl}/memories/${sanitizedMemoryId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    conditionalLog.memoryApi('Multipart update response status:', response.status);
    conditionalLog.memoryApi('Multipart update response statusText:', response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      conditionalLog.memoryApi('Multipart update error response:', errorData);
      const baseUrl = API_BASE_URL || "https://growing-together-app.onrender.com/api";
      conditionalLog.memoryApi('Request details:', {
        url: `${baseUrl}/memories/${sanitizedMemoryId}`,
        method: 'PUT',
        hasFormData: true
      });
      throw new Error(errorData.error || errorData.message || `Update failed: ${response.statusText}`);
    }

    const responseData = await response.json();
    conditionalLog.memoryApi('Multipart update success, response data:', responseData);
    
    // Handle nested response structure
    const memory = responseData.memory || responseData;
    conditionalLog.memoryApi('Multipart update extracted memory data:', memory);
    
    // Map API fields to frontend interface
    const mappedMemory: Memory = {
      id: memory._id || memory.id,
      title: memory.title,
      content: memory.content,
      childId: memory.child || memory.childId,
      parentId: memory.authorId || memory.parentId,
      date: memory.date || memory.createdAt, // Use date field or fallback to createdAt
      visibility: memory.visibility,
      location: memory.location,
      attachments: memory.attachments?.map((att: any) => mapAttachment(att)) || [],
      tags: memory.tags || [],
      createdAt: memory.createdAt,
      updatedAt: memory.updatedAt
    };
    
    conditionalLog.memoryApi('Multipart update mapped memory:', mappedMemory);
    
    return mappedMemory;
  } else {
    // Use regular JSON update for text-only changes
    conditionalLog.memoryApi('updateMemory: Using JSON update with data:', data);
    conditionalLog.memoryApi('updateMemory: Data validation check:', {
      hasTitle: !!data.title,
      hasContent: !!data.content,
      hasDate: !!data.date,
      hasTags: !!data.tags,
      titleLength: data.title?.length || 0,
      contentLength: data.content?.length || 0,
      tagsCount: data.tags?.length || 0
    });
    
    // Try to match the backend's expected format
    // The backend might expect the same field names as in createMemory
    const backendData = {
      ...data,
      // Don't send undefined values
      ...(data.title && { title: data.title }),
      ...(data.content && { content: data.content }),
      ...(data.date && { date: data.date }),
      ...(data.tags && data.tags.length > 0 && { tags: data.tags }),
      ...(data.visibility && { visibility: data.visibility }),
      ...(data.location && { location: data.location })
    };
    
    conditionalLog.memoryApi('updateMemory: Backend-formatted data:', backendData);
    
    let responseData: any;
    try {
      const response = await apiService.put(`/memories/${sanitizedMemoryId}`, backendData);
      conditionalLog.memoryApi('updateMemory API response:', response);
      
      responseData = response.data || response;
      conditionalLog.memoryApi('updateMemory raw response data:', responseData);
    } catch (error: any) {
      conditionalLog.memoryApi('updateMemory JSON API error:', error);
      conditionalLog.memoryApi('updateMemory error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        data: error.data
      });
      
      // If it's a validation error, provide more specific information
      if (error.status === 400) {
        conditionalLog.memoryApi('Validation error detected. Request data was:', data);
        if (error.data && typeof error.data === 'object') {
          conditionalLog.memoryApi('Validation error details:', error.data);
        }
      }
      
      throw error;
    }
    
    // Handle nested response structure
    const memory = responseData.memory || responseData;
    conditionalLog.memoryApi('updateMemory extracted memory data:', memory);
    
    // Map API fields to frontend interface (same mapping as in getMemories)
    const mappedMemory: Memory = {
      id: memory._id || memory.id,
      title: memory.title,
      content: memory.content,
      childId: memory.child || memory.childId,
      parentId: memory.authorId || memory.parentId,
      date: memory.date || memory.createdAt, // Use date field or fallback to createdAt
      visibility: memory.visibility,
      location: memory.location,
      attachments: memory.attachments?.map((att: any) => mapAttachment(att)) || [],
      tags: memory.tags || [],
      createdAt: memory.createdAt,
      updatedAt: memory.updatedAt
    };
    
    conditionalLog.memoryApi('updateMemory mapped memory:', mappedMemory);
    
    return mappedMemory;
  }
}

// Alternative method for removing attachments using different API approaches
async function removeAttachmentsAlternative(memoryId: string, attachmentIds: string[]): Promise<Memory> {
  // Sanitize the memoryId to prevent NoSQL injection
  const sanitizedMemoryId = sanitizeObjectId(memoryId);
  conditionalLog.memoryApi('removeAttachmentsAlternative called with:', { memoryId: sanitizedMemoryId, attachmentIds });
  
  const token = await authService.getAccessToken();
  if (!token) {
    throw new Error('Authentication token not available');
  }
  
      // Try Method 1: JSON PATCH request with Cloudinary public IDs
    conditionalLog.memoryApi('Trying Method 1: JSON PATCH request with Cloudinary public IDs');
    try {
      // Try multiple parameter formats the backend might expect
      const requestBodies = [
        // Format 1: Standard format with attachmentIds (Cloudinary public IDs)
        {
          action: 'remove',
          attachmentIds: attachmentIds  // These are Cloudinary public IDs
        },
        // Format 2: Try with publicId field name
        {
          action: 'remove',
          publicIds: attachmentIds
        },
        // Format 3: Try with cloudinaryIds field name
        {
          action: 'remove',
          cloudinaryIds: attachmentIds
        },
        // Format 4: Different field names
        {
          action: 'delete',
          ids: attachmentIds,
          attachments: attachmentIds
        },
        // Format 5: Nested format
        {
          type: 'remove',
          data: {
            attachmentIds: attachmentIds
          }
        },
        // Format 6: Simple array
        {
          removeAttachments: attachmentIds
        }
      ];

    for (let i = 0; i < requestBodies.length; i++) {
      const requestBody = requestBodies[i];
      conditionalLog.memoryApi(`Trying JSON format ${i + 1} with MongoDB _id values:`, requestBody);
      
      const response = await fetch(`${BASE_URL}/memories/${sanitizedMemoryId}/attachments`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      conditionalLog.memoryApi(`JSON format ${i + 1} response status:`, response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        conditionalLog.memoryApi(`Method 1 format ${i + 1} succeeded:`, responseData);
        
        // Check if attachments were actually removed using Cloudinary public IDs
        const memoryInResponse = responseData.memory || responseData.data || responseData;
        const remainingAttachments = memoryInResponse.attachments || [];
        
        // Extract Cloudinary public IDs from remaining attachments for comparison
        const remainingCloudinaryIds = remainingAttachments.map((att: any) => {
          if (att.url) {
            const urlMatch = att.url.match(/\/upload\/v\d+\/[^\/]+\/([^\/]+)\.[^\/]+$/);
            return urlMatch ? urlMatch[1] : null;
          }
          return null;
        }).filter(Boolean);
        
        const actuallyRemoved = attachmentIds.filter(id => !remainingCloudinaryIds.includes(id));
        conditionalLog.memoryApi(`Verification - attachments actually removed (Cloudinary public IDs):`, {
          requestedToRemove: attachmentIds,
          remainingAttachments: remainingCloudinaryIds,
          actuallyRemoved: actuallyRemoved,
          deletionSuccessful: actuallyRemoved.length === attachmentIds.length
        });
        
        if (actuallyRemoved.length > 0) {
          return await processAttachmentResponse(responseData, memoryId);
        } else {
          conditionalLog.memoryApi(`Format ${i + 1} got 200 OK but didn't actually delete attachments (MongoDB _id mismatch)`);
        }
      } else {
        const errorText = await response.text().catch(() => 'Could not read error');
        conditionalLog.memoryApi(`JSON format ${i + 1} failed with status ${response.status}:`, errorText);
      }
    }
    
    conditionalLog.memoryApi('All JSON PATCH formats failed to actually delete attachments');
  } catch (error) {
    conditionalLog.memoryApi('Method 1 (JSON PATCH) failed with exception:', error);
  }
  
  // Try Method 2: DELETE requests using MongoDB _id in URL
  conditionalLog.memoryApi('Trying Method 2: Individual DELETE requests with MongoDB _id');
  try {
    const deletePromises = attachmentIds.map(async (attachmentId) => {
      const response = await fetch(`${BASE_URL}/memories/${sanitizedMemoryId}/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        conditionalLog.memoryApi(`DELETE failed for attachment ${attachmentId} with status:`, response.status);
        const errorText = await response.text();
        conditionalLog.memoryApi(`DELETE error response for ${attachmentId}:`, errorText);
        throw new Error(`Failed to delete attachment ${attachmentId}: ${response.statusText}`);
      }
      
      return response.json().catch(() => ({ success: true }));
    });
    
    await Promise.all(deletePromises);
    conditionalLog.memoryApi('Method 2 (Individual DELETEs) succeeded');
    
    // Fetch the updated memory
    const updatedMemoryResponse = await apiService.get(`/memories/${sanitizedMemoryId}`);
    const memory = updatedMemoryResponse.data || updatedMemoryResponse;
    
    // Map API fields to frontend interface
    const mappedMemory: Memory = {
      id: memory._id || memory.id,
      title: memory.title,
      content: memory.content,
      childId: memory.child || memory.childId,
      parentId: memory.authorId || memory.parentId,
      date: memory.date || memory.createdAt, // Use date field or fallback to createdAt
      visibility: memory.visibility,
      location: memory.location,
      attachments: memory.attachments?.map((att: any) => mapAttachment(att)) || [],
      tags: memory.tags || [],
      createdAt: memory.createdAt,
      updatedAt: memory.updatedAt
    };
    
    return mappedMemory;
    
  } catch (error) {
    conditionalLog.memoryApi('Method 2 (Individual DELETEs) failed:', error);
  }
  
  // Try Method 3: Use the unified attachments endpoint
  conditionalLog.memoryApi('Trying Method 3: PATCH request to unified attachments endpoint');
  try {
    const response = await fetch(`${BASE_URL}/memories/${sanitizedMemoryId}/attachments`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'remove',
        attachmentIds: attachmentIds  // Cloudinary public IDs
      }),
    });
    
    if (response.ok) {
      const responseData = await response.json();
      conditionalLog.memoryApi('Method 3 (PATCH unified) succeeded:', responseData);
      return await processAttachmentResponse(responseData, memoryId);
    }
    
    conditionalLog.memoryApi('Method 3 failed with status:', response.status);
  } catch (error) {
    conditionalLog.memoryApi('Method 3 (PATCH unified) failed:', error);
  }
  
  throw new Error('All alternative removal methods failed. Please use the unified attachments endpoint for attachment operations.');
}

// Helper function to process attachment update responses
async function processAttachmentResponse(responseData: any, memoryId: string): Promise<Memory> {
  // Sanitize the memoryId to prevent NoSQL injection
  const sanitizedMemoryId = sanitizeObjectId(memoryId);
  let memory = responseData.data || responseData.memory || responseData;
  
  if (!memory || (!memory._id && !memory.id)) {
    conditionalLog.memoryApi('Response did not contain memory, fetching separately');
    const updatedMemoryResponse = await apiService.get(`/memories/${sanitizedMemoryId}`);
    memory = updatedMemoryResponse.data || updatedMemoryResponse;
  }
  
  // Map API fields to frontend interface
  const mappedMemory: Memory = {
    id: memory._id || memory.id,
    title: memory.title,
    content: memory.content,
    childId: memory.child || memory.childId,
    parentId: memory.authorId || memory.parentId,
    date: memory.date || memory.createdAt, // Use date field or fallback to createdAt
    visibility: memory.visibility,
    location: memory.location,
    attachments: memory.attachments?.map((att: any) => mapAttachment(att)) || [],
    tags: memory.tags || [],
    createdAt: memory.createdAt,
    updatedAt: memory.updatedAt
  };
  
  return mappedMemory;
}


export async function deleteMemory(memoryId: string): Promise<void> {
  // Sanitize the memoryId to prevent NoSQL injection
  const sanitizedMemoryId = sanitizeObjectId(memoryId);
  await apiService.delete(`/memories/${sanitizedMemoryId}`);
}

// Debug function to test backend attachment deletion API
export async function debugAttachmentDeletion(memoryId: string, attachmentIds: string[]): Promise<void> {
  // Sanitize the memoryId to prevent NoSQL injection
  const sanitizedMemoryId = sanitizeObjectId(memoryId);
  conditionalLog.memoryApi('=== DEBUGGING ATTACHMENT DELETION API ===');
  conditionalLog.memoryApi('Testing different API endpoints and formats for:', { memoryId: sanitizedMemoryId, attachmentIds });
  
  const token = await authService.getAccessToken();
  if (!token) {
    conditionalLog.memoryApi('No auth token available');
    return;
  }
  
  // Test 1: Check current memory state
  conditionalLog.memoryApi('TEST 1: Getting current memory state');
  try {
    const currentMemory = await getMemoryById(sanitizedMemoryId);
    conditionalLog.memoryApi('Current memory attachments:', {
      count: currentMemory.attachments?.length || 0,
      ids: currentMemory.attachments?.map(att => att.id) || []
    });
  } catch (error) {
    conditionalLog.memoryApi('Failed to get current memory:', error);
  }
  
  // Test 2: Check if backend has specific deletion endpoints
  const testEndpoints = [
    `/memories/${sanitizedMemoryId}/attachments`,
    `/attachments/delete`,
    `/cloudinary/delete`
  ];
  
  for (const endpoint of testEndpoints) {
    conditionalLog.memoryApi(`TEST: Checking endpoint ${endpoint}`);
    try {
      // Try OPTIONS request to see if endpoint exists
      const optionsResponse = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'OPTIONS',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      conditionalLog.memoryApi(`${endpoint} OPTIONS:`, {
        status: optionsResponse.status,
        allows: optionsResponse.headers.get('Allow') || 'Not specified'
      });
    } catch (error) {
      conditionalLog.memoryApi(`${endpoint} OPTIONS failed:`, error);
    }
  }
  
  // Test 3: Try different HTTP methods on main endpoint
  const methods = ['PATCH', 'DELETE', 'PUT', 'POST'];
  for (const method of methods) {
    conditionalLog.memoryApi(`TEST: Trying ${method} on /memories/${sanitizedMemoryId}/attachments`);
    try {
      const response = await fetch(`${BASE_URL}/memories/${sanitizedMemoryId}/attachments`, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: method !== 'DELETE' ? JSON.stringify({
          action: 'remove',
          attachmentIds: attachmentIds
        }) : undefined,
      });
      
      conditionalLog.memoryApi(`${method} response:`, {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('Content-Type')
      });
      
      if (response.ok) {
        const responseText = await response.text();
        conditionalLog.memoryApi(`${method} response body (first 200 chars):`, responseText.substring(0, 200));
      }
    } catch (error) {
      conditionalLog.memoryApi(`${method} failed:`, error);
    }
  }
  
  conditionalLog.memoryApi('=== END DEBUGGING ATTACHMENT DELETION API ===');
}

// Debug function to test different attachment deletion formats
export async function testAttachmentDeletionFormats(memoryId: string, attachmentIds: string[]): Promise<void> {
  // Sanitize the memoryId to prevent NoSQL injection
  const sanitizedMemoryId = sanitizeObjectId(memoryId);
  conditionalLog.memoryApi('=== TESTING ATTACHMENT DELETION FORMATS ===');
  conditionalLog.memoryApi('Testing with memory ID:', sanitizedMemoryId);
  conditionalLog.memoryApi('Testing with attachment IDs:', attachmentIds);
  
  const token = await authService.getAccessToken();
  if (!token) {
    conditionalLog.memoryApi('No auth token available');
    return;
  }
  
  // Test different field names and formats
  const testFormats = [
    { action: 'remove', attachmentIds: attachmentIds },
    { action: 'remove', publicIds: attachmentIds },
    { action: 'remove', cloudinaryIds: attachmentIds },
    { action: 'remove', ids: attachmentIds },
    { action: 'delete', attachmentIds: attachmentIds },
    { action: 'delete', publicIds: attachmentIds },
    { remove: attachmentIds },
    { delete: attachmentIds },
    { attachments: attachmentIds },
    { publicIds: attachmentIds }
  ];
  
  for (let i = 0; i < testFormats.length; i++) {
    const format = testFormats[i];
    conditionalLog.memoryApi(`Testing format ${i + 1}:`, format);
    
    try {
      const response = await fetch(`${BASE_URL}/memories/${sanitizedMemoryId}/attachments`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(format),
      });
      
      conditionalLog.memoryApi(`Format ${i + 1} response:`, {
        status: response.status,
        statusText: response.statusText
      });
      
      if (response.ok) {
        const responseText = await response.text();
        conditionalLog.memoryApi(`Format ${i + 1} success response:`, responseText.substring(0, 300));
        
        // Try to parse as JSON
        try {
          const responseData = JSON.parse(responseText);
          conditionalLog.memoryApi(`Format ${i + 1} parsed response:`, responseData);
          
          // Check if attachments were actually removed
          const memory = responseData.data || responseData.memory || responseData;
          if (memory && memory.attachments) {
            conditionalLog.memoryApi(`Format ${i + 1} remaining attachments:`, {
              count: memory.attachments.length,
              ids: memory.attachments.map((att: any) => att.publicId || att.id || 'unknown')
            });
          }
        } catch {
          conditionalLog.memoryApi(`Format ${i + 1} response is not JSON:`, responseText);
        }
      } else {
        const errorText = await response.text();
        conditionalLog.memoryApi(`Format ${i + 1} error response:`, errorText);
      }
    } catch (error) {
      conditionalLog.memoryApi(`Format ${i + 1} exception:`, error);
    }
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  conditionalLog.memoryApi('=== END TESTING ATTACHMENT DELETION FORMATS ===');
}

export async function updateMemoryAttachments(memoryId: string, attachments: any[], action: 'add' | 'remove' | 'replace' = 'add', attachmentIds: string[] = []): Promise<Memory> {
  // Sanitize the memoryId to prevent NoSQL injection
  const sanitizedMemoryId = sanitizeObjectId(memoryId);
  conditionalLog.memoryApi('updateMemoryAttachments called with:', { 
    memoryId: sanitizedMemoryId, 
    attachmentCount: attachments.length, 
    action, 
    attachmentIds,
    attachmentNames: attachments.map(f => f.name || 'unnamed'),
    attachmentTypes: attachments.map(f => f.type || 'unknown')
  });
  
  const token = await authService.getAccessToken();
  
  if (!token) {
    const error = new Error('Authentication token not available');
    conditionalLog.memoryApi('Authentication error:', error.message);
    throw error;
  }
  
  // Handle remove action using the unified attachments endpoint
  if (action === 'remove' && attachmentIds.length > 0) {
    conditionalLog.memoryApi('=== USING UNIFIED ATTACHMENTS ENDPOINT ===');
    conditionalLog.memoryApi('Using PATCH /memories/:id/attachments for attachment removal');
    
    try {
      const response = await fetch(`${BASE_URL}/memories/${sanitizedMemoryId}/attachments`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'remove',
          attachmentIds: attachmentIds // These are Cloudinary public IDs
        }),
      });
      
      conditionalLog.memoryApi('Delete attachments response status:', response.status);
      conditionalLog.memoryApi('Delete attachments response statusText:', response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        conditionalLog.memoryApi('Raw error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        conditionalLog.memoryApi('Parsed error data:', errorData);
        
        // If the backend doesn't support Cloudinary IDs, try alternative approach
        if (response.status === 400 && errorData.message?.includes('MongoDB')) {
          conditionalLog.memoryApi('Backend expects MongoDB _id, trying alternative approach');
          throw new Error('Backend requires MongoDB _id values. Please update backend to return _id fields for attachments or accept Cloudinary public IDs.');
        }
        
        throw new Error(errorData.error || errorData.message || `Delete attachments failed: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      conditionalLog.memoryApi('Delete attachments success, response data:', responseData);
      
      // Handle different possible response structures
      let memory = responseData.data || responseData.memory || responseData;
      
      // If the backend doesn't return the full memory object, fetch it separately
      if (!memory || (!memory._id && !memory.id)) {
        conditionalLog.memoryApi('Backend did not return memory object, fetching updated memory separately');
        
        try {
          const updatedMemoryResponse = await apiService.get(`/memories/${sanitizedMemoryId}`);
          memory = updatedMemoryResponse.data || updatedMemoryResponse;
          conditionalLog.memoryApi('Fetched updated memory separately:', memory);
        } catch (fetchError) {
          conditionalLog.memoryApi('Failed to fetch updated memory separately:', fetchError);
          throw new Error(`Delete attachments completed but failed to retrieve updated memory. Please refresh to see changes.`);
        }
      }
      
      // Map API fields to frontend interface
      const mappedMemory: Memory = {
        id: memory._id || memory.id,
        title: memory.title,
        content: memory.content,
        childId: memory.child || memory.childId,
        parentId: memory.authorId || memory.parentId,
        date: memory.date || memory.createdAt, // Use date field or fallback to createdAt
        visibility: memory.visibility,
        location: memory.location,
        attachments: memory.attachments?.map((att: any) => mapAttachment(att)) || [],
        tags: memory.tags || [],
        createdAt: memory.createdAt,
        updatedAt: memory.updatedAt
      };
      
      conditionalLog.memoryApi('Final mapped memory after delete attachments:', {
        id: mappedMemory.id,
        title: mappedMemory.title,
        attachmentCount: mappedMemory.attachments?.length || 0,
        attachmentIds: mappedMemory.attachments?.map(att => att.id) || []
      });
      
      return mappedMemory;
      
    } catch (error) {
      conditionalLog.memoryApi('Delete attachments endpoint failed, falling back to alternative methods:', error);
      // Fall back to alternative methods if the correct endpoint fails
      try {
        return await removeAttachmentsAlternative(sanitizedMemoryId, attachmentIds);
      } catch (alternativeError) {
        conditionalLog.memoryApi('All delete methods failed:', alternativeError);
        throw alternativeError;
      }
    }
  }
  
  // Handle add and replace actions using the PATCH endpoint
  const formData = new FormData();
  
  // Add the required parameters for the backend
  formData.append('action', action);
  conditionalLog.memoryApi('Added action to FormData:', action);
  
  // Add attachments if this is an add or replace action
  if (action === 'add' || action === 'replace') {
    attachments.forEach((file, index) => {
      conditionalLog.memoryApi(`Adding attachment ${index}:`, {
        name: file.name,
        type: file.type,
        size: file.size,
        uri: file.uri ? file.uri.substring(0, 50) + '...' : 'no uri'
      });
      
      // For React Native, we append the file object directly
      formData.append('attachments', file as any);
    });
  }

  conditionalLog.memoryApi('Making attachment update request to:', `${BASE_URL}/memories/${sanitizedMemoryId}/attachments`);
  conditionalLog.memoryApi('Request method: PATCH');
  conditionalLog.memoryApi('Action:', action);
  conditionalLog.memoryApi('Attachments to upload:', attachments.map(f => ({ name: f.name, type: f.type, size: f.size })));
  
  const response = await fetch(`${BASE_URL}/memories/${sanitizedMemoryId}/attachments`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  conditionalLog.memoryApi('Attachment update response status:', response.status);
  conditionalLog.memoryApi('Attachment update response statusText:', response.statusText);
  conditionalLog.memoryApi('Response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    conditionalLog.memoryApi('Raw error response:', errorText);
    
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    
    conditionalLog.memoryApi('Parsed error data:', errorData);
    conditionalLog.memoryApi('Request details for debugging:', {
      url: `${BASE_URL}/memories/${sanitizedMemoryId}/attachments`,
      method: 'PATCH',
      action,
      attachmentCount: attachments.length
    });
    
    throw new Error(errorData.error || errorData.message || `Attachment ${action} failed: ${response.statusText}`);
  }

  const responseData = await response.json();
  conditionalLog.memoryApi('Attachment update success, response data:', responseData);
  
  // Handle different possible response structures
  let memory = responseData.data || responseData.memory || responseData;
  conditionalLog.memoryApi('Attachment update extracted memory data:', memory);
  
  // If the backend doesn't return the full memory object, fetch it separately
  if (!memory || (!memory._id && !memory.id)) {
    conditionalLog.memoryApi('Backend did not return memory object, fetching updated memory separately');
    
    try {
      // Fetch the updated memory from the main memories endpoint
      const updatedMemoryResponse = await apiService.get(`/memories/${sanitizedMemoryId}`);
      memory = updatedMemoryResponse.data || updatedMemoryResponse;
      conditionalLog.memoryApi('Fetched updated memory separately:', memory);
    } catch (fetchError) {
      conditionalLog.memoryApi('Failed to fetch updated memory separately:', fetchError);
      // If we can't fetch the updated memory, return a minimal success response
      // The UI will need to refresh to see the changes
      throw new Error(`Attachment ${action} completed but failed to retrieve updated memory. Please refresh to see changes.`);
    }
  }
  
  // Validate that we now have a valid memory object
  if (!memory || (!memory._id && !memory.id)) {
    conditionalLog.memoryApi('Still no valid memory object after fallback fetch');
    conditionalLog.memoryApi('Final response data for debugging:', responseData);
    throw new Error(`Attachment ${action} completed but failed to retrieve updated memory. Please refresh to see changes.`);
  }
  
  // Map API fields to frontend interface (same mapping as in getMemories)
  const mappedMemory: Memory = {
    id: memory._id || memory.id,
    title: memory.title,
    content: memory.content,
    childId: memory.child || memory.childId,
    parentId: memory.authorId || memory.parentId,
    date: memory.date || memory.createdAt, // Use date field or fallback to createdAt
    visibility: memory.visibility,
    location: memory.location,
    attachments: memory.attachments?.map((att: any) => mapAttachment(att)) || [],
    tags: memory.tags || [],
    createdAt: memory.createdAt,
    updatedAt: memory.updatedAt
  };
  
  conditionalLog.memoryApi('Final mapped memory after attachment update:', {
    id: mappedMemory.id,
    title: mappedMemory.title,
    attachmentCount: mappedMemory.attachments?.length || 0,
    attachmentIds: mappedMemory.attachments?.map(att => att.id) || []
  });
  
  return mappedMemory;
}

// Note: updateMemoryAttachments is available but should be used via Redux async thunk
// in app/redux/slices/memorySlice.ts, not directly from this service

// Debug function to test memory update with minimal data
export async function testMemoryUpdate(memoryId: string): Promise<void> {
  // Sanitize the memoryId to prevent NoSQL injection
  const sanitizedMemoryId = sanitizeObjectId(memoryId);
  conditionalLog.memoryApi('=== TESTING MEMORY UPDATE ===');
  conditionalLog.memoryApi('Testing with memory ID:', sanitizedMemoryId);
  
  const token = await authService.getAccessToken();
  if (!token) {
    conditionalLog.memoryApi('No auth token available');
    return;
  }
  
  // Test JSON PUT update (this is what works)
  conditionalLog.memoryApi('TEST: JSON PUT update');
  try {
    const response = await fetch(`${BASE_URL}/memories/${sanitizedMemoryId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Update JSON',
        content: 'Test content for JSON update',
        date: new Date().toISOString()
      }),
    });
    
    conditionalLog.memoryApi('JSON update response:', {
      status: response.status,
      statusText: response.statusText
    });
    
    if (response.ok) {
      const result = await response.json();
      conditionalLog.memoryApi('JSON update succeeded:', result);
    } else {
      const errorText = await response.text();
      conditionalLog.memoryApi('JSON update failed:', errorText);
    }
  } catch (error) {
    conditionalLog.memoryApi('JSON update error:', error);
  }
  
  conditionalLog.memoryApi('=== END TESTING MEMORY UPDATE ===');
} 