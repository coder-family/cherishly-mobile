// Mock apiService
jest.mock('../app/services/apiService', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

import apiService from '../app/services/apiService';
import { createGrowthRecord, deleteGrowthRecord, getGrowthRecords, updateGrowthRecord } from '../app/services/healthService';
import { mockGrowthRecords } from '../app/utils/mockData';

describe('Health Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGrowthRecords', () => {
    it('should fetch growth records with correct URL and parameters', async () => {
      const mockResponse = { data: mockGrowthRecords };
      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const childId = 'child1';
      const filter = { type: 'height' as const, dateRange: '6months' as const };

      const result = await getGrowthRecords(childId, filter);

      expect(apiService.get).toHaveBeenCalledWith('/growth-records?childId=child1&limit=100&dateRange=6months');
      expect(result).toEqual(mockGrowthRecords);
    });

    it('should fetch growth records without filter', async () => {
      const mockResponse = { data: mockGrowthRecords };
      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const childId = 'child1';

      const result = await getGrowthRecords(childId);

      expect(apiService.get).toHaveBeenCalledWith('/growth-records?childId=child1&limit=100');
      expect(result).toEqual(mockGrowthRecords);
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      (apiService.get as jest.Mock).mockRejectedValue(error);

      const childId = 'child1';

      await expect(getGrowthRecords(childId)).rejects.toThrow('API Error');
    });
  });

  describe('createGrowthRecord', () => {
    it('should create a growth record', async () => {
      const newRecord = {
        child: 'child1',
        type: 'height' as const,
        value: 90,
        unit: 'cm',
        date: '2024-05-15',
        source: 'home' as const,
        notes: 'Test record',
      };

      const mockResponse = { 
        data: { 
          _id: 'new-id', 
          child: 'child1',
          type: 'height',
          value: 90,
          unit: 'cm',
          date: '2024-05-15',
          source: 'home',
          notes: 'Test record',
          createdAt: '2024-05-15T10:00:00Z',
          updatedAt: '2024-05-15T10:00:00Z'
        } 
      };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await createGrowthRecord(newRecord);

      expect(apiService.post).toHaveBeenCalledWith('/growth-records', newRecord);
      expect(result).toEqual({
        id: 'new-id',
        childId: 'child1',
        type: 'height',
        value: 90,
        unit: 'cm',
        date: '2024-05-15',
        source: 'home',
        notes: 'Test record',
        createdAt: '2024-05-15T10:00:00Z',
        updatedAt: '2024-05-15T10:00:00Z'
      });
    });
  });

  describe('updateGrowthRecord', () => {
    it('should update a growth record', async () => {
      const recordId = 'record1';
      const updateData = {
        value: 95,
        notes: 'Updated record',
      };

      const mockResponse = { data: { id: recordId, ...updateData } };
      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await updateGrowthRecord(recordId, updateData);

      expect(apiService.put).toHaveBeenCalledWith(`/growth-records/${recordId}`, updateData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteGrowthRecord', () => {
    it('should delete a growth record', async () => {
      const recordId = 'record1';
      (apiService.delete as jest.Mock).mockResolvedValue({});

      await deleteGrowthRecord(recordId);

      expect(apiService.delete).toHaveBeenCalledWith(`/growth-records/${recordId}`);
    });
  });
}); 