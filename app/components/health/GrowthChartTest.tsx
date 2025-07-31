import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { GrowthRecord } from '../../types/health';
import GrowthChart from './GrowthChart';

const GrowthChartTest: React.FC = () => {
  // Test data with measurements up to 10 years
  const testData: GrowthRecord[] = [
    {
      id: '1',
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
      id: '2',
      childId: 'child1',
      type: 'height',
      value: 75,
      unit: 'cm',
      date: '2024-01-15', // 1 year
      source: 'clinic',
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z'
    },
    {
      id: '3',
      childId: 'child1',
      type: 'height',
      value: 85,
      unit: 'cm',
      date: '2025-01-15', // 2 years
      source: 'doctor',
      createdAt: '2025-01-15T00:00:00.000Z',
      updatedAt: '2025-01-15T00:00:00.000Z'
    },
    {
      id: '4',
      childId: 'child1',
      type: 'height',
      value: 95,
      unit: 'cm',
      date: '2027-01-15', // 4 years
      source: 'clinic',
      createdAt: '2027-01-15T00:00:00.000Z',
      updatedAt: '2027-01-15T00:00:00.000Z'
    },
    {
      id: '5',
      childId: 'child1',
      type: 'height',
      value: 105,
      unit: 'cm',
      date: '2029-01-15', // 6 years
      source: 'home',
      createdAt: '2029-01-15T00:00:00.000Z',
      updatedAt: '2029-01-15T00:00:00.000Z'
    },
    {
      id: '6',
      childId: 'child1',
      type: 'height',
      value: 115,
      unit: 'cm',
      date: '2031-01-15', // 8 years
      source: 'clinic',
      createdAt: '2031-01-15T00:00:00.000Z',
      updatedAt: '2031-01-15T00:00:00.000Z'
    },
    {
      id: '7',
      childId: 'child1',
      type: 'height',
      value: 125,
      unit: 'cm',
      date: '2033-01-15', // 10 years
      source: 'doctor',
      createdAt: '2033-01-15T00:00:00.000Z',
      updatedAt: '2033-01-15T00:00:00.000Z'
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Growth Chart Test - Full Range (0-10 years)</Text>
      <Text style={styles.subtitle}>Testing height data from birth to 10 years</Text>
      
      <GrowthChart
        data={testData}
        type="height"
        childAgeInMonths={120} // 10 years
        childGender="male"
        childBirthDate="2023-01-15"
        mode="yearly"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default GrowthChartTest; 