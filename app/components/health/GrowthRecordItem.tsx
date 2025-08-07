import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { updateGrowthRecord } from '../../redux/slices/healthSlice';
import { GrowthRecord } from '../../types/health';
import VisibilityToggle from '../ui/VisibilityToggle';

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
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const { children } = useAppSelector((state) => state.children);
  
  // Check if current user is the owner of the child (not just a member)
  // Only the owner can see visibility toggle
  const getChildId = (childId: any) => {
    if (typeof childId === 'string') return childId;
    if (childId && typeof childId === 'object' && childId._id) return childId._id;
    if (childId && typeof childId === 'object' && childId.id) return childId.id;
    return null;
  };
  
  const recordChildId = getChildId(record?.childId);
  
  // Helper function to get parentId from child
  const getParentId = (parentId: any) => {
    if (typeof parentId === 'string') return parentId;
    if (parentId && typeof parentId === 'object' && parentId._id) return parentId._id;
    if (parentId && typeof parentId === 'object' && parentId.id) return parentId.id;
    return null;
  };
  
  const isOwner = currentUser && record && recordChildId && 
    children && children.some(child => {
      const childId = child.id;
      const childParentId = getParentId(child.parentId);
      const currentUserId = currentUser.id;
      
      return childId === recordChildId && childParentId === currentUserId;
    });
  


  const handleVisibilityUpdate = async (newVisibility: 'private' | 'public') => {
    try {
      const result = await dispatch(updateGrowthRecord({
        recordId: record.id,
        data: { visibility: newVisibility }
      })).unwrap();
      
      // Success - no alert needed, toggle switch provides visual feedback
    } catch (error) {
      throw error; // Re-throw to let VisibilityToggle handle the error
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'home':
        return 'home';
      case 'doctor':
        return 'medical-services';
      case 'clinic':
        return 'local-hospital';
      case 'hospital':
        return 'local-hospital';
      default:
        return 'location-on';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'home':
        return '#10B981'; // Green
      case 'doctor':
        return '#3B82F6'; // Blue
      case 'clinic':
        return '#8B5CF6'; // Purple
      case 'hospital':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatValue = (value: number, unit: string) => {
    return `${value} ${unit}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <View style={styles.typeContainer}>
            <MaterialIcons 
              name={getSourceIcon(record.source)} 
              size={16} 
              color={getSourceColor(record.source)} 
            />
            <Text style={styles.typeText}>
              {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
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

        {/* Visibility Controls - Only show for owner */}
        {isOwner && (
          <VisibilityToggle
            visibility={record.visibility || 'private'}
            onUpdate={handleVisibilityUpdate}
            size="small"
          />
        )}

        {record.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {record.notes}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        {onEdit && isOwner && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => onEdit(record)}
          >
            <MaterialIcons name="edit" size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        )}
        {onDelete && isOwner && (
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