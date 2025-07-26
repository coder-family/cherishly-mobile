import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { CreatePromptData, GetPromptsParams, Prompt, UpdatePromptData } from '../../services/promptService';
import * as promptService from '../../services/promptService';

// Async thunks
export const fetchPrompts = createAsyncThunk(
  'prompts/fetchPrompts',
  async (params: GetPromptsParams = {}) => {
    return await promptService.getPrompts(params);
  }
);

export const fetchPrompt = createAsyncThunk(
  'prompts/fetchPrompt',
  async (promptId: string) => {
    return await promptService.getPrompt(promptId);
  }
);

export const createPrompt = createAsyncThunk(
  'prompts/createPrompt',
  async (data: CreatePromptData, { rejectWithValue }) => {
    try {
      const result = await promptService.createPrompt(data);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create prompt');
    }
  }
);

export const updatePrompt = createAsyncThunk(
  'prompts/updatePrompt',
  async ({ promptId, data }: { promptId: string; data: UpdatePromptData }, { rejectWithValue }) => {
    try {
      const result = await promptService.updatePrompt(promptId, data);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update prompt');
    }
  }
);

export const deletePrompt = createAsyncThunk(
  'prompts/deletePrompt',
  async (promptId: string) => {
    await promptService.deletePrompt(promptId);
    return promptId;
  }
);

// State interface
interface PromptState {
  prompts: Prompt[];
  currentPrompt: Prompt | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Initial state
const initialState: PromptState = {
  prompts: [],
  currentPrompt: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  hasMore: true,
};

// Slice
const promptSlice = createSlice({
  name: 'prompts',
  initialState,
  reducers: {
    clearCurrentPrompt: (state) => {
      state.currentPrompt = null;
    },
    clearPrompts: (state) => {
      state.prompts = [];
      state.total = 0;
      state.page = 1;
      state.hasMore = true;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchPrompts
    builder
      .addCase(fetchPrompts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrompts.fulfilled, (state, action) => {
        state.loading = false;
        const { prompts, total, page, limit } = action.payload;
        if (page === 1) {
          state.prompts = prompts;
        } else {
          state.prompts = [...state.prompts, ...prompts];
        }
        state.total = total;
        state.page = page;
        state.limit = limit;
        state.hasMore = prompts.length === limit;
      })
      .addCase(fetchPrompts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch prompts';
      });

    // fetchPrompt
    builder
      .addCase(fetchPrompt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrompt.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPrompt = action.payload;
      })
      .addCase(fetchPrompt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch prompt';
      });

    // createPrompt
    builder
      .addCase(createPrompt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPrompt.fulfilled, (state, action) => {
        state.loading = false;
        state.prompts.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createPrompt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to create prompt';
      });

    // updatePrompt
    builder
      .addCase(updatePrompt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePrompt.fulfilled, (state, action) => {
        state.loading = false;
        const updatedPrompt = action.payload;
        const index = state.prompts.findIndex(p => p.id === updatedPrompt.id);
        if (index !== -1) {
          state.prompts[index] = updatedPrompt;
        }
        if (state.currentPrompt?.id === updatedPrompt.id) {
          state.currentPrompt = updatedPrompt;
        }
      })
      .addCase(updatePrompt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to update prompt';
      });

    // deletePrompt
    builder
      .addCase(deletePrompt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePrompt.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.prompts = state.prompts.filter(p => p.id !== deletedId);
        if (state.currentPrompt?.id === deletedId) {
          state.currentPrompt = null;
        }
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deletePrompt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to delete prompt';
      });
  },
});

export const { clearCurrentPrompt, clearPrompts, clearError } = promptSlice.actions;
export default promptSlice.reducer; 