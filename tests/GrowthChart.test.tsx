import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';
import GrowthChart from '../app/components/health/GrowthChart';
import { store } from '../app/redux/store';
import { GrowthRecord } from '../app/types/health';

// Mock the health service
jest.mock('../app/services/healthService', () => ({
  getWHOStandardsInRange: jest.fn().mockResolvedValue([]),
  getAllWHOStandardData: jest.fn().mockResolvedValue([]),
}));

describe('GrowthChart', () => {
  const mockGrowthData: GrowthRecord[] = [
    {
      id: '1',
      childId: 'child1',
      type: 'weight',
      value: 3.2,
      unit: 'kg',
      date: '2024-01-15',
      source: 'hospital',
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z'
    },
    {
      id: '2',
      childId: 'child1',
      type: 'weight',
      value: 4.1,
      unit: 'kg',
      date: '2024-02-15',
      source: 'clinic',
      createdAt: '2024-02-15T00:00:00.000Z',
      updatedAt: '2024-02-15T00:00:00.000Z'
    },
    {
      id: '3',
      childId: 'child1',
      type: 'weight',
      value: 5.2,
      unit: 'kg',
      date: '2024-03-15',
      source: 'home',
      createdAt: '2024-03-15T00:00:00.000Z',
      updatedAt: '2024-03-15T00:00:00.000Z'
    }
  ];

  const renderWithProvider = (props: any) => {
    return render(
      <Provider store={store}>
        <GrowthChart {...props} />
      </Provider>
    );
  };

  it('renders correctly with weight data', async () => {
    const { getByText } = renderWithProvider({
      data: mockGrowthData,
      type: 'weight',
      childAgeInMonths: 3,
      childGender: 'male'
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(getByText('Weight Growth Chart')).toBeTruthy();
    });

    expect(getByText('Age 0-10 years with WHO growth standards')).toBeTruthy();
  });

  it('renders correctly with height data', async () => {
    const heightData = mockGrowthData.map(record => ({
      ...record,
      type: 'height' as const,
      value: 50 + (parseInt(record.id) * 2), // Mock height values
      unit: 'cm'
    }));

    const { getByText } = renderWithProvider({
      data: heightData,
      type: 'height',
      childAgeInMonths: 3,
      childGender: 'male'
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(getByText('Height Growth Chart')).toBeTruthy();
    });
  });

  it('shows empty state when no data is provided', async () => {
    const { getByText } = renderWithProvider({
      data: [],
      type: 'weight',
      childAgeInMonths: 3,
      childGender: 'male'
    });

    // Wait for loading to complete and empty state to show
    await waitFor(() => {
      expect(getByText('No weight data available')).toBeTruthy();
    });

    expect(getByText('Add your first weight measurement to see the chart')).toBeTruthy();
  });

  it('displays statistics correctly', async () => {
    const { getByText, getAllByText } = renderWithProvider({
      data: mockGrowthData,
      type: 'weight',
      childAgeInMonths: 3,
      childGender: 'male'
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(getByText('Weight Growth Chart')).toBeTruthy();
    });

    // Should show current weight (last measurement) - check if multiple exist
    expect(getAllByText('5.2 kg').length).toBeGreaterThan(0);
    
    // Should show number of measurements
    expect(getByText('3')).toBeTruthy();
  });

  it('shows legend with correct labels', async () => {
    const { getByText } = renderWithProvider({
      data: mockGrowthData,
      type: 'weight',
      childAgeInMonths: 3,
      childGender: 'male'
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(getByText('Weight Growth Chart')).toBeTruthy();
    });

    expect(getByText('Chart Legend')).toBeTruthy();
    expect(getByText('🟢 WHO Standard (Average growth)')).toBeTruthy();
    expect(getByText('🔴 Your child\'s measurements')).toBeTruthy();
  });

  it('renders chart component correctly', async () => {
    const { getByText } = renderWithProvider({
      data: mockGrowthData,
      type: 'weight',
      childAgeInMonths: 3,
      childGender: 'male'
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(getByText('Weight Growth Chart')).toBeTruthy();
    });

    // Should show chart labels
    expect(getByText('Weight (kg)')).toBeTruthy();
    expect(getByText('Age (years: 0-10)')).toBeTruthy();
  });

  it('shows increasing growth trend correctly', async () => {
    // Create data with clear increasing trend
    const increasingData: GrowthRecord[] = [
      {
        id: '1',
        childId: 'child1',
        type: 'weight',
        value: 3.0,
        unit: 'kg',
        date: '2024-01-01',
        source: 'hospital',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '2',
        childId: 'child1',
        type: 'weight',
        value: 4.0,
        unit: 'kg',
        date: '2024-02-01',
        source: 'clinic',
        createdAt: '2024-02-01T00:00:00.000Z',
        updatedAt: '2024-02-01T00:00:00.000Z'
      },
      {
        id: '3',
        childId: 'child1',
        type: 'weight',
        value: 5.0,
        unit: 'kg',
        date: '2024-03-01',
        source: 'home',
        createdAt: '2024-03-01T00:00:00.000Z',
        updatedAt: '2024-03-01T00:00:00.000Z'
      }
    ];

    const { getByText, getAllByText } = renderWithProvider({
      data: increasingData,
      type: 'weight',
      childAgeInMonths: 3,
      childGender: 'male'
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(getByText('Weight Growth Chart')).toBeTruthy();
    });

    // Should show the highest value as current weight (may appear multiple times)
    expect(getAllByText('5.0 kg').length).toBeGreaterThan(0);
    
    // Should show correct number of measurements
    expect(getByText('3')).toBeTruthy();
  });
}); 