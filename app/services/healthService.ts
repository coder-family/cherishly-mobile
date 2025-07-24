import {
  CreateGrowthRecordData,
  CreateHealthRecordData,
  GrowthAnalysis,
  GrowthFilter,
  GrowthRecord,
  HealthFilter,
  HealthRecord,
  UpdateGrowthRecordData,
  UpdateHealthRecordData,
  WHOStandardGrowthData
} from '../types/health';
import { conditionalLog } from '../utils/logUtils';
import apiService from './apiService';

// Data transformation functions to convert MongoDB format to TypeScript interface
const transformGrowthRecord = (record: any): GrowthRecord => ({
  id: record._id || record.id,
  childId: record.child || record.childId,
  type: record.type,
  value: record.value,
  unit: record.unit,
  date: record.date,
  source: record.source,
  notes: record.notes,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

const transformHealthRecord = (record: any): HealthRecord => ({
  id: record._id || record.id,
  childId: record.child || record.childId,
  type: record.type,
  title: record.title,
  description: record.description,
  startDate: record.startDate,
  endDate: record.endDate,
  doctorName: record.doctorName,
  location: record.location,
  attachments: record.attachments,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

const transformWHOStandardData = (record: any): WHOStandardGrowthData => ({
  id: record._id || record.id,
  age: record.age,
  ageInMonths: record.ageInMonths,
  gender: record.gender,
  weight: {
    minus2SD: record.weight?.minus2SD || record.weightMinus2SD || 0,
    mean: record.weight?.mean || record.weightMean || 0,
    plus2SD: record.weight?.plus2SD || record.weightPlus2SD || 0,
  },
  height: {
    minus2SD: record.height?.minus2SD || record.heightMinus2SD || 0,
    mean: record.height?.mean || record.heightMean || 0,
    plus2SD: record.height?.plus2SD || record.heightPlus2SD || 0,
  },
  isDeleted: record.isDeleted || false,
  deletedAt: record.deletedAt || null,
  deletedBy: record.deletedBy || null,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

// Mock WHO standard data generator for fallback
const generateMockWHOStandardData = (ageInMonths: number, gender: 'male' | 'female'): WHOStandardGrowthData => {
  // Generate realistic WHO standard data based on age and gender
  const isMale = gender === 'male';
  
  // More realistic growth curves based on actual WHO standards
  let meanWeight: number;
  let meanHeight: number;
  
  if (ageInMonths === 0) {
    // Birth data
    meanWeight = isMale ? 3.3 : 3.2;
    meanHeight = isMale ? 50.0 : 49.1;
  } else if (ageInMonths <= 12) {
    // First year: rapid growth
    const baseWeight = isMale ? 3.3 : 3.2;
    const baseHeight = isMale ? 50.0 : 49.1;
    meanWeight = baseWeight + (ageInMonths * (isMale ? 0.65 : 0.6));
    meanHeight = baseHeight + (ageInMonths * (isMale ? 2.4 : 2.3));
  } else if (ageInMonths <= 24) {
    // Second year: slower growth
    const age12Weight = isMale ? 11.1 : 10.4;
    const age12Height = isMale ? 78.8 : 77.4;
    const monthsAfter12 = ageInMonths - 12;
    meanWeight = age12Weight + (monthsAfter12 * (isMale ? 0.25 : 0.23));
    meanHeight = age12Height + (monthsAfter12 * (isMale ? 1.1 : 1.0));
  } else if (ageInMonths <= 36) {
    // Third year
    const age24Weight = isMale ? 14.1 : 13.2;
    const age24Height = isMale ? 92.0 : 89.4;
    const monthsAfter24 = ageInMonths - 24;
    meanWeight = age24Weight + (monthsAfter24 * (isMale ? 0.2 : 0.18));
    meanHeight = age24Height + (monthsAfter24 * (isMale ? 0.9 : 0.8));
  } else if (ageInMonths <= 48) {
    // Fourth year
    const age36Weight = isMale ? 16.5 : 15.4;
    const age36Height = isMale ? 102.8 : 98.9;
    const monthsAfter36 = ageInMonths - 36;
    meanWeight = age36Weight + (monthsAfter36 * (isMale ? 0.18 : 0.16));
    meanHeight = age36Height + (monthsAfter36 * (isMale ? 0.8 : 0.7));
  } else if (ageInMonths <= 60) {
    // Fifth year
    const age48Weight = isMale ? 18.7 : 17.3;
    const age48Height = isMale ? 112.4 : 107.3;
    const monthsAfter48 = ageInMonths - 48;
    meanWeight = age48Weight + (monthsAfter48 * (isMale ? 0.16 : 0.15));
    meanHeight = age48Height + (monthsAfter48 * (isMale ? 0.7 : 0.6));
  } else {
    // Older children
    const age60Weight = isMale ? 20.6 : 19.1;
    const age60Height = isMale ? 120.8 : 114.5;
    const monthsAfter60 = ageInMonths - 60;
    meanWeight = age60Weight + (monthsAfter60 * (isMale ? 0.15 : 0.14));
    meanHeight = age60Height + (monthsAfter60 * (isMale ? 0.6 : 0.55));
  }
  
  // Generate realistic SD values based on WHO percentile distributions
  const weight = {
    minus2SD: meanWeight * (isMale ? 0.82 : 0.84),
    mean: meanWeight,
    plus2SD: meanWeight * (isMale ? 1.18 : 1.16),
  };
  
  const height = {
    minus2SD: meanHeight * (isMale ? 0.93 : 0.94),
    mean: meanHeight,
    plus2SD: meanHeight * (isMale ? 1.07 : 1.06),
  };
  
  return {
    id: `mock-${ageInMonths}-${gender}`,
    age: ageInMonths === 0 ? 'Birth' : `${ageInMonths} months`,
    ageInMonths,
    gender,
    weight,
    height,
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// WHO Standard Growth Data API functions
export async function getWHOStandardData(ageInMonths: number, gender: 'male' | 'female'): Promise<WHOStandardGrowthData | null> {
  try {
    // Use the correct API endpoint: /who-standards/:gender/age/:ageInMonths
    conditionalLog.health(`[WHO-API] Requesting WHO standard for ${gender} at ${ageInMonths} months`);
    const response = await apiService.get(`/who-standards/${gender}/age/${ageInMonths}`);
    const rawData = response.data || response;
    
    if (!rawData) {
      conditionalLog.health(`[WHO-API] No data returned for ${gender} at ${ageInMonths} months`);
      return null;
    }
    
    conditionalLog.health(`[WHO-API] Successfully fetched WHO standard for ${gender} at ${ageInMonths} months`);
    return transformWHOStandardData(rawData);
  } catch (error: any) {
    conditionalLog.health(`[WHO-API] Error fetching WHO standard for ${gender} at ${ageInMonths} months:`, {
      message: error?.message || 'Unknown error',
      status: error?.status || error?.response?.status,
      url: error?.url || error?.config?.url,
      hasResponseData: !!error?.response?.data
    });
    
    // Always return mock data for individual requests since the chart needs this data
    conditionalLog.health(`[WHO-API] Using mock data for ${gender} at ${ageInMonths} months`);
    return generateMockWHOStandardData(ageInMonths, gender);
  }
}

export async function getWHOStandardsInRange(gender: 'male' | 'female', startAge: number, endAge: number): Promise<WHOStandardGrowthData[]> {
  try {
    // Use the correct API endpoint with the parameters the backend expects: minAge and maxAge
    conditionalLog.health(`[WHO-API] Requesting WHO standards range for ${gender}: ${startAge}-${endAge} months`);
    const response = await apiService.get(`/who-standards/${gender}/range?minAge=${startAge}&maxAge=${endAge}`);
    const rawData = response.data || response || [];
    
    // Handle nested response structure
    let data;
    if (response && response.data && response.data.whoStandards) {
      data = response.data.whoStandards;
    } else if (Array.isArray(rawData)) {
      data = rawData;
    } else {
      data = [];
    }
    
    const result = Array.isArray(data) ? data.map(transformWHOStandardData) : [];
    conditionalLog.health(`[WHO-API] Successfully fetched ${result.length} WHO standards for ${gender}: ${startAge}-${endAge} months`);
    return result;
  } catch (error: any) {
    conditionalLog.health(`[WHO-API] Error fetching WHO standards range for ${gender}: ${startAge}-${endAge} months:`, {
      message: error?.message || 'Unknown error',
      status: error?.status || error?.response?.status,
      url: error?.url || error?.config?.url,
      hasResponseData: !!error?.response?.data
    });
    
    // Fallback: generate mock data for the specific range
    conditionalLog.health(`[WHO-API] Using mock WHO standard data as fallback for ${gender}: ${startAge}-${endAge} months`);
    const mockData: WHOStandardGrowthData[] = [];
    
    // Generate data for yearly intervals only (11 points: 0-10 years)
    for (let age = startAge; age <= endAge; age += 12) { // Every 12 months (yearly only)
      mockData.push(generateMockWHOStandardData(age, gender));
    }
    
    conditionalLog.health(`[WHO-API] Generated ${mockData.length} mock WHO standards for ${gender} (yearly intervals only)`);
    return mockData;
  }
}

export async function getAllWHOStandardData(gender?: 'male' | 'female'): Promise<WHOStandardGrowthData[]> {
  try {
    let url = '/who-standards';
    if (gender) {
      // Use the correct API endpoint: /who-standards/:gender
      url = `/who-standards/${gender}`;
    }
    
    conditionalLog.health(`[WHO-API] Requesting all WHO standards for ${gender || 'all genders'}`);
    const response = await apiService.get(url);
    const rawData = response.data || response || [];
    
    // Handle nested response structure
    let data;
    if (response && response.data && response.data.whoStandards) {
      data = response.data.whoStandards;
    } else if (Array.isArray(rawData)) {
      data = rawData;
    } else {
      data = [];
    }
    
    const result = Array.isArray(data) ? data.map(transformWHOStandardData) : [];
    conditionalLog.health(`[WHO-API] Successfully fetched ${result.length} WHO standards for ${gender || 'all genders'}`);
    return result;
  } catch (error: any) {
    conditionalLog.health(`[WHO-API] Error fetching all WHO standards for ${gender || 'all genders'}:`, {
      message: error?.message || 'Unknown error',
      status: error?.status || error?.response?.status,
      url: error?.url || error?.config?.url,
      hasResponseData: !!error?.response?.data
    });
    
    // Fallback: generate mock data for common ages
    conditionalLog.health(`[WHO-API] Using mock WHO standard data as fallback for ${gender || 'male'}`);
    const mockData: WHOStandardGrowthData[] = [];
    
    // Generate data for ages 0-120 months (yearly intervals only)
    const targetGender = gender || 'male';
    for (let age = 0; age <= 120; age += 12) { // Every 12 months (yearly only)
      mockData.push(generateMockWHOStandardData(age, targetGender));
    }
    
    conditionalLog.health(`[WHO-API] Generated ${mockData.length} mock WHO standards for ${targetGender} (yearly intervals only)`);
    return mockData;
  }
}

// Growth Analysis Functions
export function analyzeGrowth(
  childValue: number,
  childAgeInMonths: number,
  childGender: 'male' | 'female',
  whoStandard: WHOStandardGrowthData,
  type: 'height' | 'weight'
): GrowthAnalysis {
  const standard = type === 'height' ? whoStandard.height : whoStandard.weight;
  
  // Find percentile based on SD (simplified)
  let percentile = 50; // Default to median
  if (childValue <= standard.minus2SD) {
    percentile = 3; // Below -2SD is roughly 3rd percentile
  } else if (childValue <= standard.mean) {
    percentile = 50; // Mean is 50th percentile
  } else if (childValue <= standard.plus2SD) {
    percentile = 97; // Above +2SD is roughly 97th percentile
  } else {
    percentile = 100;
  }
  
  // Determine status based on SD
  let status: GrowthAnalysis['status'];
  if (childValue < standard.minus2SD) {
    status = 'below_p3';
  } else if (childValue < standard.mean) {
    status = 'p25_to_p75';
  } else if (childValue < standard.plus2SD) {
    status = 'p75_to_p90';
  } else {
    status = 'above_p97';
  }
  
  // Generate recommendation
  let recommendation: string | undefined;
  if (status === 'below_p3') {
    recommendation = `Your child's ${type} is below the 3rd percentile. Consider consulting with a pediatrician.`;
  } else if (status === 'above_p97') {
    recommendation = `Your child's ${type} is above the 97th percentile. Consider consulting with a pediatrician.`;
  } else if (status === 'p75_to_p90') {
    recommendation = `Your child's ${type} is above average. Monitor growth and consider discussing with a healthcare provider.`;
  }
  
  return {
    childValue,
    childAgeInMonths,
    childGender,
    whoStandard: whoStandard, // Return the full WHO standard, not just the type-specific part
    percentile,
    status,
    recommendation
  };
}

// Growth Record API functions
// API Endpoints:
// GET /api/growth-records?childId=xxx&type=height&dateRange=6months
// POST /api/growth-records
// PUT /api/growth-records/:id
// DELETE /api/growth-records/:id
export async function getGrowthRecords(childId: string, filter?: GrowthFilter): Promise<GrowthRecord[]> {
  try {
    // Use the original API endpoint structure that the backend expects
    let url = '/growth-records';
    const params = new URLSearchParams();
    
    // Always include childId as required by the API
    params.append('childId', childId);
    
    // Set a high limit to get all historical records (backend defaults to 10)
    params.append('limit', '100');  // Enough for all historical growth records
    
    if (filter) {
      // Don't filter by type to get all growth data
      if (filter.dateRange !== 'all') params.append('dateRange', filter.dateRange);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    conditionalLog.health('Calling growth records API:', { url, childId, filter });
    const response = await apiService.get(url);
    conditionalLog.health('API Response received:', { 
      responseType: typeof response,
      hasData: !!response.data,
      responseKeys: response ? Object.keys(response) : 'no response',
      rawResponse: response
    });
    
    // Handle nested response structure
    let rawData;
    if (response && response.data && response.data.growthRecords) {
      // API returns { success: true, data: { growthRecords: [...] } }
      rawData = response.data.growthRecords;
    } else if (Array.isArray(response)) {
      // Direct array response
      rawData = response;
    } else if (response && response.data && Array.isArray(response.data)) {
      // Direct array in data field
      rawData = response.data;
    } else {
      // Fallback
      rawData = [];
    }
    
    // Transform the data to match TypeScript interface
    const transformedData = Array.isArray(rawData) 
      ? rawData.map(transformGrowthRecord)
      : [];
    
    conditionalLog.health('Fetched growth records:', {
      count: transformedData.length,
      hasData: transformedData.length > 0,
      dataTypes: [...new Set(transformedData.map(record => record.type))],
      dateRange: transformedData.length > 0 ? {
        earliest: transformedData[0]?.date,
        latest: transformedData[transformedData.length - 1]?.date
      } : null,
      rawDataCount: Array.isArray(rawData) ? rawData.length : 'not array'
    });
    
    return transformedData;
  } catch (error) {
    conditionalLog.health('Error fetching growth records:', error);
    throw error;
  }
}

export async function getGrowthRecord(recordId: string): Promise<GrowthRecord> {
  try {
    const response = await apiService.get(`/growth-records/${recordId}`);
    const rawData = response.data || response;
    return transformGrowthRecord(rawData);
  } catch (error) {
    conditionalLog.health('Error fetching growth record:', error);
    throw error;
  }
}

export async function createGrowthRecord(data: CreateGrowthRecordData): Promise<GrowthRecord> {
  try {
    // console.log('[HEALTH-DEBUG] Creating growth record with data:', data);
    const response = await apiService.post('/growth-records', data);
    // console.log('[HEALTH-DEBUG] API Response:', JSON.stringify(response, null, 2));
    // console.log('[HEALTH-DEBUG] Response data:', JSON.stringify(response.data, null, 2));
    
    // Extract the actual record from the nested response structure
    const rawData = response.data?.growthRecord || response.data || response;
    // console.log('[HEALTH-DEBUG] Raw data for transformation:', JSON.stringify(rawData, null, 2));
    
    const transformed = transformGrowthRecord(rawData);
    // console.log('[HEALTH-DEBUG] Transformed record:', JSON.stringify(transformed, null, 2));
    return transformed;
  } catch (error: any) {
    console.error('[HEALTH-DEBUG] Error creating growth record:', error);
    throw error;
  }
}

export async function updateGrowthRecord(recordId: string, data: UpdateGrowthRecordData): Promise<GrowthRecord> {
  try {
    const response = await apiService.put(`/growth-records/${recordId}`, data);
    const rawData = response.data || response;
    return transformGrowthRecord(rawData);
  } catch (error) {
    conditionalLog.health('Error updating growth record:', error);
    throw error;
  }
}

export async function deleteGrowthRecord(recordId: string): Promise<void> {
  try {
    await apiService.delete(`/growth-records/${recordId}`);
  } catch (error) {
    conditionalLog.health('Error deleting growth record:', error);
    throw error;
  }
}

// Health Record API functions
export async function getHealthRecords(childId: string, filter?: HealthFilter): Promise<HealthRecord[]> {
  try {
    // Use the original API endpoint structure that the backend expects
    let url = '/health-records';
    const params = new URLSearchParams();
    
    // Always include childId as required by the API
    params.append('childId', childId);
    
    // Set a high limit to get all historical records (backend defaults to 10)
    params.append('limit', '100');  // Enough for all historical health records
    
    if (filter) {
      if (filter.type !== 'all') params.append('type', filter.type);
      if (filter.dateRange !== 'all') params.append('dateRange', filter.dateRange);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await apiService.get(url);
    
    // Handle nested response structure for health records
    let rawData;
    if (response && response.data && response.data.healthRecords) {
      // API returns { success: true, data: { healthRecords: [...] } }
      rawData = response.data.healthRecords;
    } else if (Array.isArray(response)) {
      // Direct array response
      rawData = response;
    } else if (response && response.data && Array.isArray(response.data)) {
      // Direct array in data field
      rawData = response.data;
    } else {
      // Fallback
      rawData = [];
    }
    
    // Transform the data to match TypeScript interface
    const transformedData = Array.isArray(rawData) 
      ? rawData.map(transformHealthRecord)
      : [];
    
    return transformedData;
  } catch (error) {
    conditionalLog.health('Error fetching health records:', error);
    throw error;
  }
}

export async function getHealthRecord(recordId: string): Promise<HealthRecord> {
  try {
    const response = await apiService.get(`/health-records/${recordId}`);
    const rawData = response.data || response;
    return transformHealthRecord(rawData);
  } catch (error) {
    conditionalLog.health('Error fetching health record:', error);
    throw error;
  }
}

export async function createHealthRecord(data: CreateHealthRecordData): Promise<HealthRecord> {
  try {
    const response = await apiService.post('/health-records', data);
    const rawData = response.data || response;
    return transformHealthRecord(rawData);
  } catch (error) {
    conditionalLog.health('Error creating health record:', error);
    throw error;
  }
}

export async function updateHealthRecord(recordId: string, data: UpdateHealthRecordData): Promise<HealthRecord> {
  try {
    const response = await apiService.put(`/health-records/${recordId}`, data);
    const rawData = response.data || response;
    return transformHealthRecord(rawData);
  } catch (error) {
    conditionalLog.health('Error updating health record:', error);
    throw error;
  }
}

export async function deleteHealthRecord(recordId: string): Promise<void> {
  try {
    await apiService.delete(`/health-records/${recordId}`);
  } catch (error) {
    conditionalLog.health('Error deleting health record:', error);
    throw error;
  }
}

// Utility functions
export function getGrowthChartData(growthRecords: GrowthRecord[]) {
  const heightData: { date: string; height: number }[] = [];
  const weightData: { date: string; weight: number }[] = [];

  growthRecords.forEach(record => {
    if (record.type === 'height') {
      heightData.push({
        date: record.date,
        height: record.value
      });
    } else if (record.type === 'weight') {
      weightData.push({
        date: record.date,
        weight: record.value
      });
    }
  });

  return {
    height: heightData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    weight: weightData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  };
} 