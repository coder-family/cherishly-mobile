import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { deleteGrowthRecord, deleteHealthRecord, fetchGrowthRecords, fetchHealthRecords } from '../../redux/slices/healthSlice';
import { GrowthRecord, HealthFilter } from '../../types/health';
import AddGrowthRecordModal from '../health/AddGrowthRecordModal';
import AddHealthRecordModal from '../health/AddHealthRecordModal';
import EditGrowthRecordModal from '../health/EditGrowthRecordModal';
import GrowthChart from '../health/GrowthChart';
import HealthRecordItem from '../health/HealthRecordItem';
import ErrorView from '../ui/ErrorView';
import SectionCard from '../ui/SectionCard';

interface HealthContentProps {
  childId: string;
}

const HealthContent: React.FC<HealthContentProps> = ({ childId }) => {
  const dispatch = useAppDispatch();
  
  // Modal state
  const [showAddGrowthModal, setShowAddGrowthModal] = useState(false);
  const [showAddHealthModal, setShowAddHealthModal] = useState(false);
  const [showEditGrowthModal, setShowEditGrowthModal] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<GrowthRecord | null>(null);
  
  // Health filter state
  const [healthFilter] = useState<HealthFilter>({
    type: 'all',
    dateRange: 'all'  // Changed from '6months' to 'all' to get all historical data
  });

  // Get health data from Redux
  const healthState = useAppSelector((state) => state.health);
  const growthRecords = (healthState && Array.isArray(healthState.growthRecords)) ? healthState.growthRecords : [];
  const healthRecords = (healthState && Array.isArray(healthState.healthRecords)) ? healthState.healthRecords : [];
  const healthLoading = healthState?.loading || false;
  const healthError = healthState?.error || null;

  // Debug logging for health data
  console.log('[HEALTH-CONTENT-DEBUG] Health state:', {
    childId,
    healthStateExists: !!healthState,
    growthRecordsLength: growthRecords?.length || 0,
    healthRecordsLength: healthRecords?.length || 0,
    healthLoading,
    healthError,
    firstGrowthRecord: growthRecords?.[0] ? {
      id: growthRecords[0].id,
      type: growthRecords[0].type,
      value: growthRecords[0].value,
      date: growthRecords[0].date
    } : 'none'
  });

  // Log growth records count from backend
  console.log('[HEALTH-UI] Growth records count from backend:', {
    childId,
    growthRecordsCount: growthRecords.length,
    growthRecords: growthRecords.map(record => ({
      id: record.id,
      type: record.type,
      value: record.value,
      unit: record.unit,
      date: record.date
    }))
  });

  // Additional verification logging for height data specifically
  const heightRecords = growthRecords.filter(record => record.type === 'height');
  const heightValues = heightRecords.map(record => record.value);
  const latestHeight = heightValues.length > 0 ? heightValues[heightValues.length - 1] : 0;
  const averageHeight = heightValues.length > 0 ? heightValues.reduce((a, b) => a + b, 0) / heightValues.length : 0;
  
  console.log('[HEALTH-UI] Height data verification:', {
    heightRecordsCount: heightRecords.length,
    heightValues: heightValues,
    latestHeight: latestHeight,
    averageHeight: averageHeight,
    heightRecords: heightRecords.map(record => ({
      id: record.id,
      value: record.value,
      date: record.date,
      unit: record.unit
    }))
  });

  // Get child data for age calculation
  const { currentChild } = useAppSelector((state) => state.children);

  // Calculate child's age in months with better accuracy
  const getChildAgeInMonths = useCallback(() => {
    if (!currentChild?.birthdate) return 0;
    const birthDate = new Date(currentChild.birthdate);
    const today = new Date();
    
    let months = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                 (today.getMonth() - birthDate.getMonth());
    
    // Adjust for day of month
    if (today.getDate() < birthDate.getDate()) {
      months--;
    }
    
    return Math.max(0, months);
  }, [currentChild?.birthdate]);

  // Consolidated data fetching function
  const fetchHealthData = useCallback(() => {
    if (childId) {
      console.log('[HEALTH-FETCH] Dispatching fetch actions for childId:', childId, 'with filter:', healthFilter);
      // Fetch all growth records without filter to get both height and weight data
      dispatch(fetchGrowthRecords({ childId }));
      dispatch(fetchHealthRecords({ childId, filter: healthFilter }));
    } else {
      console.log('[HEALTH-FETCH] No childId provided, skipping fetch');
    }
  }, [childId, dispatch, healthFilter]);

  // Fetch health data when component mounts or filter changes
  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  // Handle growth record deletion
  const handleDeleteGrowthRecord = useCallback(async (recordId: string) => {
    Alert.alert(
      'Delete Growth Record',
      'Are you sure you want to delete this growth record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteGrowthRecord(recordId)).unwrap();
              fetchHealthData();
            } catch (error) {
              console.error('Failed to delete growth record:', error);
            }
          },
        },
      ]
    );
  }, [dispatch, fetchHealthData]);

  // Handle health record deletion
  const handleDeleteHealthRecord = useCallback(async (recordId: string) => {
    Alert.alert(
      'Delete Health Record',
      'Are you sure you want to delete this health record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteHealthRecord(recordId)).unwrap();
              fetchHealthData();
            } catch (error) {
              console.error('Failed to delete health record:', error);
            }
          },
        },
      ]
    );
  }, [dispatch, fetchHealthData]);

  // Handle modal success
  const handleGrowthModalSuccess = useCallback(() => {
    setShowAddGrowthModal(false);
    fetchHealthData();
  }, [fetchHealthData]);

  const handleHealthModalSuccess = useCallback(() => {
    setShowAddHealthModal(false);
    fetchHealthData();
  }, [fetchHealthData]);

  // Handle edit modal
  const handleEditGrowthRecord = useCallback((record: GrowthRecord) => {
    setRecordToEdit(record);
    setShowEditGrowthModal(true);
  }, []);

  const handleEditModalSuccess = useCallback(() => {
    setShowEditGrowthModal(false);
    setRecordToEdit(null);
    fetchHealthData();
  }, [fetchHealthData]);

  const handleEditModalClose = useCallback(() => {
    setShowEditGrowthModal(false);
    setRecordToEdit(null);
  }, []);

  if (healthLoading) {
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.contentTitle}>Health & Growth</Text>
        <View style={styles.loadingContainer}>
          <Text>Loading health data...</Text>
        </View>
      </View>
    );
  }

  if (healthError) {
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.contentTitle}>Health & Growth</Text>
        <ErrorView 
          message={healthError} 
          onRetry={fetchHealthData}
        />
      </View>
    );
  }

  const childAgeInMonths = getChildAgeInMonths();
  const childGender = currentChild?.gender as 'male' | 'female' || 'male';

  return (
    <View style={styles.healthContainer}>
      {/* Growth Section */}
      <SectionCard title="Growth Tracking">
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionSubtitle}>Height & Weight</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddGrowthModal(true)}
          >
            <MaterialIcons name="add" size={18} color={Colors.light.primary} />
            <Text style={styles.addButtonText}>Add Record</Text>
          </TouchableOpacity>
        </View>

        {/* Growth Charts */}
        <View style={styles.chartsContainer}>
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Weight</Text>
            <GrowthChart 
              data={growthRecords} 
              type="weight" 
              childAgeInMonths={childAgeInMonths}
              childGender={childGender}
              childBirthDate={currentChild?.birthdate}
            />
          </View>
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Height</Text>
            <GrowthChart 
              data={growthRecords} 
              type="height" 
              childAgeInMonths={childAgeInMonths}
              childGender={childGender}
              childBirthDate={currentChild?.birthdate}
            />
          </View>
        </View>

        {/* Growth Records Table */}
        {growthRecords.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="trending-up" size={48} color={Colors.light.text} />
            <Text style={styles.emptyStateText}>No growth records yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add your first height or weight measurement to start tracking
            </Text>
          </View>
        ) : (
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Date</Text>
              <Text style={styles.tableHeaderText}>Type</Text>
              <Text style={styles.tableHeaderText}>Value</Text>
              <Text style={styles.tableHeaderText}>Unit</Text>
              <Text style={styles.tableHeaderText}>Age</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>Actions</Text>
            </View>
            
            {/* Table Rows */}
            {growthRecords.map((record) => {
              const recordDate = new Date(record.date);
              const recordAgeInMonths = currentChild?.birthdate ? 
                Math.max(0, (recordDate.getFullYear() - new Date(currentChild.birthdate).getFullYear()) * 12 + 
                (recordDate.getMonth() - new Date(currentChild.birthdate).getMonth())) : 0;
              
              return (
                <View key={record.id} style={styles.tableRow}>
                  <Text style={styles.tableCell}>
                    {recordDate.toLocaleDateString('vi-VN', {
                      month: 'numeric',
                      day: 'numeric',
                      year: '2-digit'
                    })}
                  </Text>
                  <View style={styles.tableCell}>
                    {record.type === 'height' ? (
                      <MaterialIcons name="height" size={20} color={Colors.light.primary} />
                    ) : (
                      <MaterialIcons name="fitness-center" size={20} color={Colors.light.primary} />
                    )}
                  </View>
                  <Text style={styles.tableCell}>
                    {record.value}
                  </Text>
                  <Text style={styles.tableCell}>
                    {record.unit}
                  </Text>
                  <Text style={styles.tableCell}>
                    {recordAgeInMonths}m
                  </Text>
                  <View style={[styles.actionButtons, { flex: 1.2 }]}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => handleEditGrowthRecord(record)}
                    >
                      <MaterialIcons name="edit" size={16} color={Colors.light.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteGrowthRecord(record.id)}
                    >
                      <MaterialIcons name="delete" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </SectionCard>

      {/* Health Records Section */}
      <SectionCard title="Health Records">
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionSubtitle}>Medical History</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddHealthModal(true)}
          >
            <MaterialIcons name="add" size={18} color={Colors.light.primary} />
            <Text style={styles.addButtonText}>Add Record</Text>
          </TouchableOpacity>
        </View>

        {/* Health Records Timeline */}
        {healthRecords.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="healing" size={48} color={Colors.light.text} />
            <Text style={styles.emptyStateText}>No health records yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add vaccinations, illnesses, or medications to track health history
            </Text>
          </View>
        ) : (
          <View style={styles.timelineContainer}>
            {healthRecords.map((record, index) => (
              <HealthRecordItem
                key={record.id}
                record={record}
                onDelete={() => handleDeleteHealthRecord(record.id)}
                isLast={index === healthRecords.length - 1}
              />
            ))}
          </View>
        )}
      </SectionCard>

      {/* Modals */}
      <AddGrowthRecordModal
        visible={showAddGrowthModal}
        onClose={() => setShowAddGrowthModal(false)}
        childId={childId}
        onSuccess={handleGrowthModalSuccess}
      />

      <AddHealthRecordModal
        visible={showAddHealthModal}
        onClose={() => setShowAddHealthModal(false)}
        childId={childId}
        onSuccess={handleHealthModalSuccess}
      />

      <EditGrowthRecordModal
        visible={showEditGrowthModal}
        onClose={handleEditModalClose}
        record={recordToEdit}
        onSuccess={handleEditModalSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.light.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthContainer: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  addButtonText: {
    marginLeft: 4,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 32,
  },
  recordsList: {
    marginTop: 16,
  },
  timelineContainer: {
    marginTop: 16,
  },
  chartsContainer: {
    marginBottom: 10,
  },
  chartSection: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  tableContainer: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.light.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    flex: 1,
    textAlign: 'left',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableCell: {
    fontSize: 12,
    color: Colors.light.text,
    flex: 1,
    textAlign: 'left',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: 80, // Fixed width for action buttons
  },
  actionButton: {
    padding: 8,
  },
  editButton: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  deleteButton: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
});

export default HealthContent; 