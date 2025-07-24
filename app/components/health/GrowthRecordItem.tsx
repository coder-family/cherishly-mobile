import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { GrowthRecord } from '../../types/health';

interface GrowthRecordItemProps {
  record: GrowthRecord;
  onEdit?: (record: GrowthRecord) => void;
  onDelete?: (recordId: string) => void;
}

const GrowthRecordItem: React.FC<GrowthRecordItemProps> = ({ 
  record, 
  onEdit, 
  onDelete 
}) => {
  // Add defensive checks to prevent crashes
  if (!record || !record.id || !record.type || record.value === undefined) {
    console.error('[GROWTH-RECORD-ITEM] Invalid record:', record);
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invalid record data</Text>
      </View>
    );
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'doctor':
        return 'medical-services';
      case 'clinic':
        return 'local-hospital';
      case 'hospital':
        return 'local-hospital';
      default:
        return 'home';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'doctor':
        return '#3B82F6'; // Blue
      case 'clinic':
        return '#10B981'; // Green
      case 'hospital':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (_error) {
      return 'Invalid date';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (value === undefined || value === null) return 'No value';
    return `${value} ${unit || ''}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <View style={styles.typeContainer}>
            <MaterialIcons 
              name={record.type === 'height' ? 'straighten' : 'fitness-center'} 
              size={20} 
              color={Colors.light.primary} 
            />
            <Text style={styles.typeText}>
              {record.type === 'height' ? 'Height' : 'Weight'}
            </Text>
          </View>
          <View style={styles.sourceContainer}>
            <MaterialIcons 
              name={getSourceIcon(record.source)} 
              size={16} 
              color={getSourceColor(record.source)} 
            />
            <Text style={styles.sourceText}>
              {record.source.charAt(0).toUpperCase() + record.source.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.valueContainer}>
          <Text style={styles.value}>
            {formatValue(record.value, record.unit)}
          </Text>
          <Text style={styles.date}>{formatDate(record.date)}</Text>
        </View>

        {record.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {record.notes}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => onEdit(record)}
          >
            <MaterialIcons name="edit" size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => onDelete(record.id)}
          >
            <MaterialIcons name="delete" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.card,
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 6,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginLeft: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  date: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  notes: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    paddingVertical: 10,
  },
});

export default GrowthRecordItem; 