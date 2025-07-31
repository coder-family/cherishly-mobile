import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { GrowthRecord } from '../../types/health';
import GrowthChart from './GrowthChart';

const GrowthChartDemo: React.FC = () => {
  // Sample growth data for a 12-month-old child (more realistic with irregular dates)
  const sampleGrowthData: GrowthRecord[] = [
    {
      id: '1',
      childId: 'child1',
      type: 'weight',
      value: 3.2,
      unit: 'kg',
      date: '2023-01-15', // Birth
      source: 'hospital',
      createdAt: '2023-01-15T00:00:00.000Z',
      updatedAt: '2023-01-15T00:00:00.000Z'
    },
    {
      id: '2',
      childId: 'child1',
      type: 'weight',
      value: 4.8,
      unit: 'kg',
      date: '2023-03-20', // ~2.5 months (irregular)
      source: 'clinic',
      createdAt: '2023-03-20T00:00:00.000Z',
      updatedAt: '2023-03-20T00:00:00.000Z'
    },
    {
      id: '3',
      childId: 'child1',
      type: 'weight',
      value: 6.2,
      unit: 'kg',
      date: '2023-05-10', // ~4 months (irregular)
      source: 'home',
      createdAt: '2023-05-10T00:00:00.000Z',
      updatedAt: '2023-05-10T00:00:00.000Z'
    },
    {
      id: '4',
      childId: 'child1',
      type: 'weight',
      value: 7.1,
      unit: 'kg',
      date: '2023-07-25', // ~6.5 months (irregular)
      source: 'doctor',
      createdAt: '2023-07-25T00:00:00.000Z',
      updatedAt: '2023-07-25T00:00:00.000Z'
    },
    {
      id: '5',
      childId: 'child1',
      type: 'weight',
      value: 8.3,
      unit: 'kg',
      date: '2023-09-05', // ~8 months (irregular)
      source: 'home',
      createdAt: '2023-09-05T00:00:00.000Z',
      updatedAt: '2023-09-05T00:00:00.000Z'
    },
    {
      id: '6',
      childId: 'child1',
      type: 'weight',
      value: 9.1,
      unit: 'kg',
      date: '2023-11-30', // ~10.5 months (irregular)
      source: 'clinic',
      createdAt: '2023-11-30T00:00:00.000Z',
      updatedAt: '2023-11-30T00:00:00.000Z'
    },
    {
      id: '7',
      childId: 'child1',
      type: 'weight',
      value: 9.8,
      unit: 'kg',
      date: '2024-01-15', // 12 months
      source: 'home',
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z'
    },
    // Add data up to 10 years to test full range display
    {
      id: '8',
      childId: 'child1',
      type: 'weight',
      value: 12.5,
      unit: 'kg',
      date: '2025-01-15', // 2 years
      source: 'clinic',
      createdAt: '2025-01-15T00:00:00.000Z',
      updatedAt: '2025-01-15T00:00:00.000Z'
    },
    {
      id: '9',
      childId: 'child1',
      type: 'weight',
      value: 15.2,
      unit: 'kg',
      date: '2027-01-15', // 4 years
      source: 'doctor',
      createdAt: '2027-01-15T00:00:00.000Z',
      updatedAt: '2027-01-15T00:00:00.000Z'
    },
    {
      id: '10',
      childId: 'child1',
      type: 'weight',
      value: 18.8,
      unit: 'kg',
      date: '2029-01-15', // 6 years
      source: 'clinic',
      createdAt: '2029-01-15T00:00:00.000Z',
      updatedAt: '2029-01-15T00:00:00.000Z'
    },
    {
      id: '11',
      childId: 'child1',
      type: 'weight',
      value: 22.1,
      unit: 'kg',
      date: '2031-01-15', // 8 years
      source: 'home',
      createdAt: '2031-01-15T00:00:00.000Z',
      updatedAt: '2031-01-15T00:00:00.000Z'
    },
    {
      id: '12',
      childId: 'child1',
      type: 'weight',
      value: 25.5,
      unit: 'kg',
      date: '2033-01-15', // 10 years
      source: 'clinic',
      createdAt: '2033-01-15T00:00:00.000Z',
      updatedAt: '2033-01-15T00:00:00.000Z'
    }
  ];

  const sampleHeightData: GrowthRecord[] = [
    {
      id: '8',
      childId: 'child1',
      type: 'height',
      value: 50,
      unit: 'cm',
      date: '2023-01-15', // Birth
      source: 'hospital',
      createdAt: '2023-01-15T00:00:00.000Z',
      updatedAt: '2023-01-15T00:00:00.000Z'
    },
    {
      id: '9',
      childId: 'child1',
      type: 'height',
      value: 55,
      unit: 'cm',
      date: '2023-03-20', // ~2.5 months (irregular)
      source: 'clinic',
      createdAt: '2023-03-20T00:00:00.000Z',
      updatedAt: '2023-03-20T00:00:00.000Z'
    },
    {
      id: '10',
      childId: 'child1',
      type: 'height',
      value: 62,
      unit: 'cm',
      date: '2023-05-10', // ~4 months (irregular)
      source: 'home',
      createdAt: '2023-05-10T00:00:00.000Z',
      updatedAt: '2023-05-10T00:00:00.000Z'
    },
    {
      id: '11',
      childId: 'child1',
      type: 'height',
      value: 67,
      unit: 'cm',
      date: '2023-07-25', // ~6.5 months (irregular)
      source: 'doctor',
      createdAt: '2023-07-25T00:00:00.000Z',
      updatedAt: '2023-07-25T00:00:00.000Z'
    },
    {
      id: '12',
      childId: 'child1',
      type: 'height',
      value: 71,
      unit: 'cm',
      date: '2023-09-05', // ~8 months (irregular)
      source: 'home',
      createdAt: '2023-09-05T00:00:00.000Z',
      updatedAt: '2023-09-05T00:00:00.000Z'
    },
    {
      id: '13',
      childId: 'child1',
      type: 'height',
      value: 75,
      unit: 'cm',
      date: '2023-11-30', // ~10.5 months (irregular)
      source: 'clinic',
      createdAt: '2023-11-30T00:00:00.000Z',
      updatedAt: '2023-11-30T00:00:00.000Z'
    },
    {
      id: '14',
      childId: 'child1',
      type: 'height',
      value: 78,
      unit: 'cm',
      date: '2024-01-15', // 12 months
      source: 'home',
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z'
    },
    // Add height data up to 10 years to test full range display
    {
      id: '15',
      childId: 'child1',
      type: 'height',
      value: 85,
      unit: 'cm',
      date: '2025-01-15', // 2 years
      source: 'clinic',
      createdAt: '2025-01-15T00:00:00.000Z',
      updatedAt: '2025-01-15T00:00:00.000Z'
    },
    {
      id: '16',
      childId: 'child1',
      type: 'height',
      value: 95,
      unit: 'cm',
      date: '2027-01-15', // 4 years
      source: 'doctor',
      createdAt: '2027-01-15T00:00:00.000Z',
      updatedAt: '2027-01-15T00:00:00.000Z'
    },
    {
      id: '17',
      childId: 'child1',
      type: 'height',
      value: 105,
      unit: 'cm',
      date: '2029-01-15', // 6 years
      source: 'clinic',
      createdAt: '2029-01-15T00:00:00.000Z',
      updatedAt: '2029-01-15T00:00:00.000Z'
    },
    {
      id: '18',
      childId: 'child1',
      type: 'height',
      value: 115,
      unit: 'cm',
      date: '2031-01-15', // 8 years
      source: 'home',
      createdAt: '2031-01-15T00:00:00.000Z',
      updatedAt: '2031-01-15T00:00:00.000Z'
    },
    {
      id: '19',
      childId: 'child1',
      type: 'height',
      value: 125,
      unit: 'cm',
      date: '2033-01-15', // 10 years
      source: 'clinic',
      createdAt: '2033-01-15T00:00:00.000Z',
      updatedAt: '2033-01-15T00:00:00.000Z'
    }
  ];

  // Combine all data for the chart
  const allData = [...sampleGrowthData, ...sampleHeightData];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Growth Chart Demo</Text>
      <Text style={styles.subtitle}>
        WHO Standards (chronological ages) vs Your Child (actual measurement dates)
      </Text>
      <Text style={styles.description}>
        The green line shows WHO standards at exact ages (0m, 3m, 6m, etc.). 
        The brown line shows your child&apos;s actual measurements at real dates.
      </Text>
      
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Weight Growth Chart</Text>
        <GrowthChart 
          data={allData} 
          type="weight" 
          childAgeInMonths={12}
          childGender="male"
        />
      </View>
      
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Height Growth Chart</Text>
        <GrowthChart 
          data={allData} 
          type="height" 
          childAgeInMonths={12}
          childGender="male"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  chartContainer: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: 'center',
  },
});

export default GrowthChartDemo; 