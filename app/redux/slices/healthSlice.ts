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
    console.log('[REDUX-HEALTH] Fetching growth records for childId:', childId, 'with filter:', filter);
    try {
      const result = await healthService.getGrowthRecords(childId, filter);
      console.log('[REDUX-HEALTH] Successfully fetched growth records:', {
        count: result?.length || 0,
        first: result?.[0] ? { id: result[0].id, type: result[0].type, value: result[0].value, date: result[0].date } : 'none'
      });
      return result;
    } catch (error) {
      console.log('[REDUX-HEALTH] Error fetching growth records:', error);
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
    return await healthService.updateGrowthRecord(recordId, data);
  }
);

export const deleteGrowthRecord = createAsyncThunk(
  'health/deleteGrowthRecord',
  async (recordId: string) => {
    await healthService.deleteGrowthRecord(recordId);
    return recordId;
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
        // console.log('[HEALTH-REDUX] Fetching growth records...', {
        //   currentCount: state.growthRecords.length,
        //   timestamp: new Date().toISOString()
        // });
      })
      .addCase(fetchGrowthRecords.fulfilled, (state, action) => {
        state.growthRecords = action.payload;
        state.loading = false;
        // console.log('[HEALTH-REDUX] Growth records fetched:', {
        //   count: action.payload.length,
        //   firstRecord: action.payload[0] ? { id: action.payload[0].id, type: action.payload[0].type, value: action.payload[0].value } : null,
        //   timestamp: new Date().toISOString()
        // });
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
      .addCase(deleteHealthRecord.fulfilled, (state, action) => {
        state.healthRecords = state.healthRecords.filter(record => record.id !== action.payload);
      });
  },
});

export const { clearError, setCurrentChildId, clearCurrentChildId, clearHealthData } = healthSlice.actions;
export default healthSlice.reducer; 