import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as promptResponseService from '../../services/promptResponseService';
import type { CreatePromptResponseData, FeedbackData, GetResponsesParams, PromptResponse, UpdatePromptResponseData } from '../../services/promptService';

// Async thunks
export const fetchChildResponses = createAsyncThunk(
  'promptResponses/fetchChildResponses',
  async (params: GetResponsesParams) => {
    return await promptResponseService.getChildResponses(params);
  }
);

export const createResponse = createAsyncThunk(
  'promptResponses/createResponse',
  async (data: CreatePromptResponseData, { rejectWithValue }) => {
    try {
      const result = await promptResponseService.createResponse(data);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create response');
    }
  }
);

export const updateResponse = createAsyncThunk(
  'promptResponses/updateResponse',
  async ({ responseId, data }: { responseId: string; data: UpdatePromptResponseData }, { rejectWithValue }) => {
    try {
      const result = await promptResponseService.updateResponse(responseId, data);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update response');
    }
  }
);

export const addFeedback = createAsyncThunk(
  'promptResponses/addFeedback',
  async ({ responseId, feedback }: { responseId: string; feedback: FeedbackData }, { rejectWithValue }) => {
    try {
      const result = await promptResponseService.addFeedback(responseId, feedback);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add feedback');
    }
  }
);

export const deleteResponse = createAsyncThunk(
  'promptResponses/deleteResponse',
  async (responseId: string) => {
    await promptResponseService.deleteResponse(responseId);
    return responseId;
  }
);

export const addAttachments = createAsyncThunk(
  'promptResponses/addAttachments',
  async ({ responseId, files }: { responseId: string; files: File[] }, { rejectWithValue }) => {
    try {
      const result = await promptResponseService.addAttachments(responseId, files);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add attachments');
    }
  }
);

export const removeAttachments = createAsyncThunk(
  'promptResponses/removeAttachments',
  async ({ responseId, attachmentIds }: { responseId: string; attachmentIds: string[] }, { rejectWithValue }) => {
    try {
      const result = await promptResponseService.removeAttachments(responseId, attachmentIds);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove attachments');
    }
  }
);

export const replaceAttachments = createAsyncThunk(
  'promptResponses/replaceAttachments',
  async ({ responseId, files }: { responseId: string; files: File[] }, { rejectWithValue }) => {
    try {
      const result = await promptResponseService.replaceAttachments(responseId, files);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to replace attachments');
    }
  }
);

// State interface
interface PromptResponseState {
  responses: PromptResponse[];
  currentResponse: PromptResponse | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  deletingResponseId: string | null;
}

// Initial state
const initialState: PromptResponseState = {
  responses: [],
  currentResponse: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  hasMore: true,
  deletingResponseId: null,
};

// Slice
const promptResponseSlice = createSlice({
  name: 'promptResponses',
  initialState,
  reducers: {
    clearCurrentResponse: (state) => {
      state.currentResponse = null;
    },
    clearResponses: (state) => {
      state.responses = [];
      state.total = 0;
      state.page = 1;
      state.hasMore = true;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchChildResponses
    builder
      .addCase(fetchChildResponses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChildResponses.fulfilled, (state, action) => {
        const { responses, total, page, limit } = action.payload;
        
        // Replace existing responses for the first page, append for subsequent pages
        if (page === 1) {
          state.responses = responses;
        } else {
          state.responses = [...state.responses, ...responses];
        }
        
        state.total = total;
        state.page = page;
        state.limit = limit;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchChildResponses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch responses';
      });

    // createResponse
    builder
      .addCase(createResponse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createResponse.fulfilled, (state, action) => {
        state.responses.unshift(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(createResponse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create response';
      });

    // updateResponse
    builder
      .addCase(updateResponse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateResponse.fulfilled, (state, action) => {
        const updatedResponse = action.payload;
        const index = state.responses.findIndex(r => r.id === updatedResponse.id);
        
        if (index !== -1) {
          state.responses[index] = updatedResponse;
        }
        
        state.loading = false;
        state.error = null;
      })
      .addCase(updateResponse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update response';
      });

    // addFeedback
    builder
      .addCase(addFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFeedback.fulfilled, (state, action) => {
        state.loading = false;
        const updatedResponse = action.payload;
        const index = state.responses.findIndex(r => r.id === updatedResponse.id);
        if (index !== -1) {
          state.responses[index] = updatedResponse;
        }
        if (state.currentResponse?.id === updatedResponse.id) {
          state.currentResponse = updatedResponse;
        }
      })
      .addCase(addFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to add feedback';
      });

    // deleteResponse
    builder
      .addCase(deleteResponse.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.deletingResponseId = action.meta.arg;
      })
      .addCase(deleteResponse.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.responses = state.responses.filter(r => r.id !== deletedId);
        if (state.currentResponse?.id === deletedId) {
          state.currentResponse = null;
        }
        state.total = Math.max(0, state.total - 1);
        state.deletingResponseId = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteResponse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete response';
        state.deletingResponseId = null;
      });

    // addAttachments
    builder
      .addCase(addAttachments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAttachments.fulfilled, (state, action) => {
        state.loading = false;
        const updatedResponse = action.payload;
        const index = state.responses.findIndex(r => r.id === updatedResponse.id);
        if (index !== -1) {
          state.responses[index] = updatedResponse;
        }
        if (state.currentResponse?.id === updatedResponse.id) {
          state.currentResponse = updatedResponse;
        }
      })
      .addCase(addAttachments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to add attachments';
      });

    // removeAttachments
    builder
      .addCase(removeAttachments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeAttachments.fulfilled, (state, action) => {
        state.loading = false;
        const updatedResponse = action.payload;
        const index = state.responses.findIndex(r => r.id === updatedResponse.id);
        if (index !== -1) {
          state.responses[index] = updatedResponse;
        }
        if (state.currentResponse?.id === updatedResponse.id) {
          state.currentResponse = updatedResponse;
        }
      })
      .addCase(removeAttachments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to remove attachments';
      });

    // replaceAttachments
    builder
      .addCase(replaceAttachments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(replaceAttachments.fulfilled, (state, action) => {
        state.loading = false;
        const updatedResponse = action.payload;
        const index = state.responses.findIndex(r => r.id === updatedResponse.id);
        if (index !== -1) {
          state.responses[index] = updatedResponse;
        }
        if (state.currentResponse?.id === updatedResponse.id) {
          state.currentResponse = updatedResponse;
        }
      })
      .addCase(replaceAttachments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to replace attachments';
      });
  },
});

export const { clearCurrentResponse, clearResponses, clearError } = promptResponseSlice.actions;
export default promptResponseSlice.reducer; 