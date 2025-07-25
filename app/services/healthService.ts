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

const transformHealthRecord = (record: any): HealthRecord => {
  console.log('[HEALTH-SERVICE] Transforming health record:', {
    rawRecord: record,
    startDate: record.startDate,
    date: record.date, // API uses 'date' field
    endDate: record.endDate,
    attachments: record.attachments,
    attachmentsType: typeof record.attachments,
    isAttachmentsArray: Array.isArray(record.attachments)
  });
  
  return {
    id: record._id || record.id,
    childId: record.child || record.childId,
    type: record.type,
    title: record.title,
    description: record.description,
    startDate: record.startDate || record.date, // Use 'date' field if 'startDate' is not available
    endDate: record.endDate,
    doctorName: record.doctorName || record.doctor, // Also map 'doctor' to 'doctorName'
    location: record.location,
    attachments: record.attachments,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
};

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
    
    // Re-throw the error instead of using mock data
    throw error;
  }
}

export async function getWHOStandardsInRange(gender: 'male' | 'female', startAge: number, endAge: number): Promise<WHOStandardGrowthData[]> {
  try {
    // Try to get WHO data from a different endpoint that might exist
    // First, let's try to get all WHO data and filter it
    conditionalLog.health(`[WHO-API] Requesting WHO standards range for ${gender}: ${startAge}-${endAge} months`);
    
    // Try different possible endpoints
    let response;
    let data = [];
    
    try {
      // Try the original endpoint first
      const url = `/who-standards/${gender}/range?minAge=${startAge}&maxAge=${endAge}`;
      conditionalLog.health(`[WHO-API] Calling: ${url}`);
      response = await apiService.get(url);
      const rawData = response.data || response || [];
      
      conditionalLog.health(`[WHO-API] Response structure:`, {
        hasResponse: !!response,
        hasData: !!response?.data,
        hasWhoStandards: !!response?.data?.whoStandards,
        isArray: Array.isArray(rawData),
        rawDataLength: Array.isArray(rawData) ? rawData.length : 'not array'
      });
      
      // Handle nested response structure
      if (response && response.data && response.data.data) {
        // Your backend returns: { success: true, data: { data: [...], count: 33, range: {...} } }
        data = response.data.data;
        conditionalLog.health(`[WHO-API] Using response.data.data: ${data.length} items`);
      } else if (response && response.data && response.data.whoStandards) {
        data = response.data.whoStandards;
        conditionalLog.health(`[WHO-API] Using response.data.whoStandards: ${data.length} items`);
      } else if (Array.isArray(rawData)) {
        data = rawData;
        conditionalLog.health(`[WHO-API] Using rawData array: ${data.length} items`);
      } else {
        conditionalLog.health(`[WHO-API] No valid data structure found in response`);
      }
      
      // Log first item if available
      if (data.length > 0) {
        conditionalLog.health(`[WHO-API] First item:`, {
          age: data[0].ageInMonths,
          gender: data[0].gender,
          weight: data[0].weight?.mean
        });
      }
    } catch (firstError) {
      conditionalLog.health(`[WHO-API] First endpoint failed, trying alternative...`);
      
      try {
        // Try getting all WHO data and filtering
        response = await apiService.get(`/who-standards/${gender}`);
        const rawData = response.data || response || [];
        
        if (response && response.data && response.data.whoStandards) {
          data = response.data.whoStandards;
        } else if (Array.isArray(rawData)) {
          data = rawData;
        }
        
        // Filter to the requested range
        data = data.filter((item: any) => {
          const ageInMonths = item.ageInMonths || parseInt(item.age) || 0;
          return ageInMonths >= startAge && ageInMonths <= endAge;
        });
      } catch (secondError) {
        conditionalLog.health(`[WHO-API] Second endpoint also failed, trying generic endpoint...`);
        
        try {
          // Try a generic WHO endpoint
          response = await apiService.get('/who-standards');
          const rawData = response.data || response || [];
          
          if (response && response.data && response.data.whoStandards) {
            data = response.data.whoStandards;
          } else if (Array.isArray(rawData)) {
            data = rawData;
          }
          
          // Filter by gender and age range
          data = data.filter((item: any) => {
            const ageInMonths = item.ageInMonths || parseInt(item.age) || 0;
            const itemGender = item.gender || 'male';
            return itemGender === gender && ageInMonths >= startAge && ageInMonths <= endAge;
          });
        } catch (thirdError) {
          conditionalLog.health(`[WHO-API] All endpoints failed, using hardcoded WHO data`);
          throw new Error('All WHO endpoints failed');
        }
      }
    }
    
    const result = Array.isArray(data) ? data.map(transformWHOStandardData) : [];
    conditionalLog.health(`[WHO-API] Successfully fetched ${result.length} WHO standards for ${gender}: ${startAge}-${endAge} months`);
    
    // If API returned empty data, throw an error
    if (result.length === 0) {
      conditionalLog.health(`[WHO-API] API returned empty data for ${gender}: ${startAge}-${endAge} months`);
      throw new Error(`No WHO standards data available for ${gender} in age range ${startAge}-${endAge} months`);
    }
    
    return result;
  } catch (error: any) {
    conditionalLog.health(`[WHO-API] Error fetching WHO standards range for ${gender}: ${startAge}-${endAge} months:`, {
      message: error?.message || 'Unknown error',
      status: error?.status || error?.response?.status,
      url: error?.url || error?.config?.url,
      hasResponseData: !!error?.response?.data
    });
    
    // Re-throw the error instead of using hardcoded data
    throw error;
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
    if (response && response.data && response.data.data) {
      // Your backend returns: { success: true, data: { data: [...], count: 33, range: {...} } }
      data = response.data.data;
    } else if (response && response.data && response.data.whoStandards) {
      data = response.data.whoStandards;
    } else if (Array.isArray(rawData)) {
      data = rawData;
    } else {
      data = [];
    }
    
    const result = Array.isArray(data) ? data.map(transformWHOStandardData) : [];
    conditionalLog.health(`[WHO-API] Successfully fetched ${result.length} WHO standards for ${gender || 'all genders'}`);
    
    // If API returned empty data, throw an error
    if (result.length === 0) {
      conditionalLog.health(`[WHO-API] API returned empty data for ${gender || 'all genders'}`);
      throw new Error(`No WHO standards data available for ${gender || 'all genders'}`);
    }
    
    return result;
  } catch (error: any) {
    conditionalLog.health(`[WHO-API] Error fetching all WHO standards for ${gender || 'all genders'}:`, {
      message: error?.message || 'Unknown error',
      status: error?.status || error?.response?.status,
      url: error?.url || error?.config?.url,
      hasResponseData: !!error?.response?.data
    });
    
    // Re-throw the error instead of using hardcoded data
    throw error;
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