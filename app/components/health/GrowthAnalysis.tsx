import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import * as healthService from '../../services/healthService';
import { GrowthAnalysis } from '../../types/health';

interface GrowthAnalysisProps {
  childValue: number;
  childAgeInMonths: number;
  childGender: 'male' | 'female';
  type: 'height' | 'weight';
  unit: string;
}

const GrowthAnalysisComponent: React.FC<GrowthAnalysisProps> = ({
  childValue,
  childAgeInMonths,
  childGender,
  type,
  unit
}) => {
  const [analysis, setAnalysis] = useState<GrowthAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch WHO standard data for the child's age and gender
        const whoStandard = await healthService.getWHOStandardData(childAgeInMonths, childGender);
        
        if (!whoStandard) {
          setError('WHO standard data not available for this age and gender');
          return;
        }
        
        // Analyze the child's growth
        const growthAnalysis = healthService.analyzeGrowth(
          childValue,
          childAgeInMonths,
          childGender,
          whoStandard,
          type
        );
        
        setAnalysis(growthAnalysis);
      } catch (err) {
        setError('Failed to analyze growth data');
        console.error('Growth analysis error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [childValue, childAgeInMonths, childGender, type]);

  const getStatusColor = (status: GrowthAnalysis['status']) => {
    switch (status) {
      case 'below_p3':
      case 'above_p97':
        return '#EF4444'; // Red
      case 'p3_to_p10':
      case 'p90_to_p97':
        return '#F59E0B'; // Amber
      case 'p10_to_p25':
      case 'p75_to_p90':
        return '#10B981'; // Green
      case 'p25_to_p75':
        return '#3B82F6'; // Blue
      default:
        return Colors.light.textSecondary;
    }
  };

  const getStatusText = (status: GrowthAnalysis['status']) => {
    switch (status) {
      case 'below_p3':
        return 'Below 3rd percentile';
      case 'p3_to_p10':
        return '3rd-10th percentile';
      case 'p10_to_p25':
        return '10th-25th percentile';
      case 'p25_to_p75':
        return '25th-75th percentile (Normal)';
      case 'p75_to_p90':
        return '75th-90th percentile';
      case 'p90_to_p97':
        return '90th-97th percentile';
      case 'above_p97':
        return 'Above 97th percentile';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = (status: GrowthAnalysis['status']) => {
    switch (status) {
      case 'below_p3':
      case 'above_p97':
        return 'warning';
      case 'p3_to_p10':
      case 'p90_to_p97':
        return 'info';
      case 'p10_to_p25':
      case 'p75_to_p90':
        return 'check-circle';
      case 'p25_to_p75':
        return 'check-circle';
      default:
        return 'help';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Analyzing growth data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!analysis) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No analysis available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons 
          name={type === 'height' ? 'straighten' : 'fitness-center'} 
          size={20} 
          color={Colors.light.primary} 
        />
        <Text style={styles.title}>WHO Growth Analysis</Text>
      </View>

      <View style={styles.content}>
        {/* Current Measurement */}
        <View style={styles.measurementSection}>
          <Text style={styles.measurementLabel}>Current {type}:</Text>
          <Text style={styles.measurementValue}>
            {childValue} {unit}
          </Text>
        </View>

        {/* Percentile */}
        <View style={styles.percentileSection}>
          <Text style={styles.percentileLabel}>Percentile:</Text>
          <Text style={[styles.percentileValue, { color: getStatusColor(analysis.status) }]}>
            {analysis.percentile}th
          </Text>
        </View>

        {/* Status */}
        <View style={styles.statusSection}>
          <MaterialIcons 
            name={getStatusIcon(analysis.status) as any} 
            size={16} 
            color={getStatusColor(analysis.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(analysis.status) }]}>
            {getStatusText(analysis.status)}
          </Text>
        </View>

        {/* WHO Standards */}
        <View style={styles.standardsSection}>
          <Text style={styles.standardsTitle}>WHO Standards for {childAgeInMonths} months:</Text>
          <View style={styles.standardsGrid}>
            <View style={styles.standardItem}>
              <Text style={styles.standardLabel}>3rd</Text>
              <Text style={styles.standardValue}>{analysis.whoStandard.p3} {unit}</Text>
            </View>
            <View style={styles.standardItem}>
              <Text style={styles.standardLabel}>10th</Text>
              <Text style={styles.standardValue}>{analysis.whoStandard.p10} {unit}</Text>
            </View>
            <View style={styles.standardItem}>
              <Text style={styles.standardLabel}>25th</Text>
              <Text style={styles.standardValue}>{analysis.whoStandard.p25} {unit}</Text>
            </View>
            <View style={styles.standardItem}>
              <Text style={styles.standardLabel}>50th</Text>
              <Text style={styles.standardValue}>{analysis.whoStandard.p50} {unit}</Text>
            </View>
            <View style={styles.standardItem}>
              <Text style={styles.standardLabel}>75th</Text>
              <Text style={styles.standardValue}>{analysis.whoStandard.p75} {unit}</Text>
            </View>
            <View style={styles.standardItem}>
              <Text style={styles.standardLabel}>90th</Text>
              <Text style={styles.standardValue}>{analysis.whoStandard.p90} {unit}</Text>
            </View>
            <View style={styles.standardItem}>
              <Text style={styles.standardLabel}>97th</Text>
              <Text style={styles.standardValue}>{analysis.whoStandard.p97} {unit}</Text>
            </View>
          </View>
        </View>

        {/* Recommendation */}
        {analysis.recommendation && (
          <View style={styles.recommendationSection}>
            <MaterialIcons name="lightbulb" size={16} color="#F59E0B" />
            <Text style={styles.recommendationText}>{analysis.recommendation}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 8,
  },
  content: {
    gap: 12,
  },
  measurementSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  measurementLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  measurementValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  percentileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  percentileLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  percentileValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  standardsSection: {
    marginTop: 8,
  },
  standardsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  standardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  standardItem: {
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    padding: 8,
    minWidth: 60,
  },
  standardLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  standardValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
  },
  recommendationSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  recommendationText: {
    fontSize: 13,
    color: '#92400E',
    flex: 1,
    lineHeight: 18,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    padding: 20,
  },
});

export default GrowthAnalysisComponent; 