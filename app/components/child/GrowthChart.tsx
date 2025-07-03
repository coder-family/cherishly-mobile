import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface GrowthDataPoint {
  date: string;
  height: number;
  weight: number;
}

interface GrowthChartProps {
  data: GrowthDataPoint[];
}

const GrowthChart: React.FC<GrowthChartProps> = ({ data }) => {
  // Placeholder: Integrate with a chart library like Victory-native or Recharts for real chart
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Growth Chart (Height/Weight)</Text>
      <View style={styles.chartPlaceholder}>
        <Text>Chart will be rendered here</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chartPlaceholder: {
    height: 180,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GrowthChart; 