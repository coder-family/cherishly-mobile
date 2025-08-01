import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as healthService from '../../services/healthService';
import type {
  CreateGrowthRecordData,
  CreateHealthRecordData,
  GrowthFilter,
  GrowthRecord,
  HealthFilter,
  HealthRecord,
  UpdateGrowthRecordData,
  UpdateHealthRecordData
} from '../../types/health';

// Growth Record Async Thunks
export const fetchGrowthRecords = createAsyncThunk(
  'health/fetchGrowthRecords',
  async ({ childId, filter }: { childId: string; filter?: GrowthFilter }) => {
    try {
      const result = await healthService.getGrowthRecords(childId, filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
);

export const createGrowthRecord = createAsyncThunk(
  'health/createGrowthRecord',
  async (data: CreateGrowthRecordData) => {
    return await healthService.createGrowthRecord(data);
  }
);

export const updateGrowthRecord = createAsyncThunk(
  'health/updateGrowthRecord',
  async ({ recordId, data }: { recordId: string; data: UpdateGrowthRecordData }) => {
    try {
      const result = await healthService.updateGrowthRecord(recordId, data);
      return result;
    } catch (error) {
      throw error;
    }
  }
);

export const deleteGrowthRecord = createAsyncThunk(
  'health/deleteGrowthRecord',
  async (recordId: string) => {
    await healthService.deleteGrowthRecord(recordId);
    return recordId;
  }
);

export const fetchGrowthRecord = createAsyncThunk(
  'health/fetchGrowthRecord',
  async (recordId: string) => {
    return await healthService.getGrowthRecord(recordId);
  }
);

// Health Record Async Thunks
export const fetchHealthRecords = createAsyncThunk(
  'health/fetchHealthRecords',
  async ({ childId, filter }: { childId: string; filter?: HealthFilter }) => {
    return await healthService.getHealthRecords(childId, filter);
  }
);

export const createHealthRecord = createAsyncThunk(
  'health/createHealthRecord',
  async (data: CreateHealthRecordData) => {
    return await healthService.createHealthRecord(data);
  }
);

export const updateHealthRecord = createAsyncThunk(
  'health/updateHealthRecord',
  async ({ recordId, data }: { recordId: string; data: UpdateHealthRecordData }) => {
    return await healthService.updateHealthRecord(recordId, data);
  }
);

export const updateHealthRecordAttachments = createAsyncThunk(
  'health/updateHealthRecordAttachments',
  async ({ recordId, attachments, action, attachmentIds }: { 
    recordId: string; 
    attachments: any[]; 
    action?: 'add' | 'remove' | 'replace';
    attachmentIds?: string[];
  }, { rejectWithValue }) => {
    try {
      const result = await healthService.updateHealthRecordAttachments(recordId, attachments, action, attachmentIds);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update health record attachments');
    }
  }
);

export const deleteHealthRecord = createAsyncThunk(
  'health/deleteHealthRecord',
  async (recordId: string) => {
    await healthService.deleteHealthRecord(recordId);
    return recordId;
  }
);

// Slice
interface HealthState {
  growthRecords: GrowthRecord[];
  healthRecords: HealthRecord[];
  loading: boolean;
  error: string | null;
  currentChildId: string | null;
}

const initialState: HealthState = {
  growthRecords: [],
  healthRecords: [],
  loading: false,
  error: null,
  currentChildId: null,
};

const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentChildId: (state, action) => {
      state.currentChildId = action.payload;
    },
    clearCurrentChildId: (state) => {
      state.currentChildId = null;
    },
    clearHealthData: (state) => {
      state.growthRecords = [];
      state.healthRecords = [];
      state.currentChildId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Growth Records
      .addCase(fetchGrowthRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGrowthRecords.fulfilled, (state, action) => {
        state.growthRecords = action.payload;
        state.loading = false;
      })
      .addCase(fetchGrowthRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch growth records';
      })
      .addCase(createGrowthRecord.fulfilled, (state, action) => {
        state.growthRecords.push(action.payload);
      })
      .addCase(updateGrowthRecord.fulfilled, (state, action) => {
        const index = state.growthRecords.findIndex(record => record.id === action.payload.id);
        if (index !== -1) {
          state.growthRecords[index] = action.payload;
        }
      })
      .addCase(deleteGrowthRecord.fulfilled, (state, action) => {
        state.growthRecords = state.growthRecords.filter(record => record.id !== action.payload);
      })
      .addCase(fetchGrowthRecord.fulfilled, (state, action) => {
        // Update or add the fetched record to the list
        const index = state.growthRecords.findIndex(record => record.id === action.payload.id);
        if (index !== -1) {
          state.growthRecords[index] = action.payload;
        } else {
          state.growthRecords.push(action.payload);
        }
      })
      // Health Records
      .addCase(fetchHealthRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHealthRecords.fulfilled, (state, action) => {
        state.healthRecords = action.payload;
        state.loading = false;
      })
      .addCase(fetchHealthRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch health records';
      })
      .addCase(createHealthRecord.fulfilled, (state, action) => {
        state.healthRecords.push(action.payload);
      })
      .addCase(updateHealthRecord.fulfilled, (state, action) => {
        const index = state.healthRecords.findIndex(record => record.id === action.payload.id);
        if (index !== -1) {
          state.healthRecords[index] = action.payload;
        }
      })
      .addCase(updateHealthRecordAttachments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHealthRecordAttachments.fulfilled, (state, action) => {
        const index = state.healthRecords.findIndex(record => record.id === action.payload.id);
        if (index !== -1) {
          state.healthRecords[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateHealthRecordAttachments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update health record attachments';
      })
      .addCase(deleteHealthRecord.fulfilled, (state, action) => {
        state.healthRecords = state.healthRecords.filter(record => record.id !== action.payload);
      });
  },
});

export const { clearError, setCurrentChildId, clearCurrentChildId, clearHealthData } = healthSlice.actions;
export default healthSlice.reducer; 