import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { HealthRecord } from '../../types/health';

interface HealthRecordItemProps {
  record: HealthRecord;
  onEdit?: (record: HealthRecord) => void;
  onDelete?: (recordId: string) => void;
  isLast?: boolean;
}

const HealthRecordItem: React.FC<HealthRecordItemProps> = ({ 
  record, 
  onEdit, 
  onDelete,
  isLast = false
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vaccination':
        return 'vaccines';
      case 'medication':
        return 'medication';
      case 'illness':
        return 'sick';
      default:
        return 'healing';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vaccination':
        return '#10B981'; // Green
      case 'medication':
        return '#3B82F6'; // Blue
      case 'illness':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateRange = () => {
    const startDate = formatDate(record.startDate);
    if (record.endDate) {
      const endDate = formatDate(record.endDate);
      return `${startDate} - ${endDate}`;
    }
    return startDate;
  };

  return (
    <View style={styles.container}>
      {/* Timeline line */}
      <View style={styles.timelineContainer}>
        <View style={styles.timelineDot}>
          <MaterialIcons 
            name={getTypeIcon(record.type)} 
            size={16} 
            color="white" 
          />
        </View>
        {!isLast && <View style={styles.timelineLine} />}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.typeContainer}>
            <View 
              style={[
                styles.typeBadge, 
                { backgroundColor: getTypeColor(record.type) }
              ]}
            >
              <Text style={styles.typeText}>
                {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
              </Text>
            </View>
          </View>
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => onEdit(record)}
              >
                <MaterialIcons name="edit" size={18} color={Colors.light.textSecondary} />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => onDelete(record.id)}
              >
                <MaterialIcons name="delete" size={18} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.title}>{record.title}</Text>
        <Text style={styles.description} numberOfLines={3}>
          {record.description}
        </Text>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <MaterialIcons name="schedule" size={14} color={Colors.light.textSecondary} />
            <Text style={styles.metaText}>{formatDateRange()}</Text>
          </View>
          
          {record.doctorName && (
            <View style={styles.metaItem}>
              <MaterialIcons name="person" size={14} color={Colors.light.textSecondary} />
              <Text style={styles.metaText}>{record.doctorName}</Text>
            </View>
          )}
          
          {record.location && (
            <View style={styles.metaItem}>
              <MaterialIcons name="location-on" size={14} color={Colors.light.textSecondary} />
              <Text style={styles.metaText}>{record.location}</Text>
            </View>
          )}
        </View>

        {record.attachments && record.attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            <Text style={styles.attachmentsLabel}>
              Attachments ({record.attachments.length})
            </Text>
            <View style={styles.attachmentsList}>
              {record.attachments.slice(0, 3).map((attachment, index) => (
                <View key={index} style={styles.attachmentItem}>
                  <MaterialIcons name="attachment" size={16} color={Colors.light.textSecondary} />
                </View>
              ))}
              {record.attachments.length > 3 && (
                <Text style={styles.attachmentsMore}>
                  +{record.attachments.length - 3} more
                </Text>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    height: 60,
    backgroundColor: Colors.light.card,
    marginTop: 8,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  typeContainer: {
    flex: 1,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 4,
    marginLeft: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  metaContainer: {
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginLeft: 6,
  },
  attachmentsContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.card,
    paddingTop: 12,
  },
  attachmentsLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  attachmentsList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachmentItem: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  attachmentsMore: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
});

export default HealthRecordItem; 