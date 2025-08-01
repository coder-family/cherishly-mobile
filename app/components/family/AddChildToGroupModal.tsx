import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchChildren } from '../../redux/slices/childSlice';
import { addChildToFamilyGroup } from '../../redux/slices/familySlice';
import { Child } from '../../services/childService';
import LoadingSpinner from '../ui/LoadingSpinner';

interface AddChildToGroupModalProps {
  visible: boolean;
  onClose: () => void;
  familyGroupId: string;
  familyGroupName: string;
}

export default function AddChildToGroupModal({
  visible,
  onClose,
  familyGroupId,
  familyGroupName,
}: AddChildToGroupModalProps) {
  const dispatch = useAppDispatch();
  const { children, loading } = useAppSelector((state) => state.children);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (visible) {
      console.log('Modal opened, fetching children...');
      dispatch(fetchChildren());
    }
  }, [visible, dispatch]);

  // Filter children that are not already in this family group
  const availableChildren = children.filter(child => {
    // For now, we'll show all children. In the future, we can check if they're already in the group
    return true;
  });

  console.log('Children state:', children);
  console.log('Available children:', availableChildren);
  console.log('Loading state:', loading);

  const handleAddChildToGroup = async () => {
    if (!selectedChildId) {
      Alert.alert('Error', 'Please select a child to add to the group');
      return;
    }

    setUpdating(true);
    try {
      await dispatch(addChildToFamilyGroup({
        groupId: familyGroupId,
        childId: selectedChildId
      })).unwrap();
      
      Alert.alert(
        'Success',
        'Child has been added to the family group successfully!',
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add child to group');
    } finally {
      setUpdating(false);
    }
  };

  const renderChildItem = ({ item }: { item: Child }) => {
    const isSelected = selectedChildId === item.id;
    
    return (
      <TouchableOpacity
        style={[styles.childItem, isSelected && styles.selectedChildItem]}
        onPress={() => setSelectedChildId(item.id)}
      >
        <View style={styles.childInfo}>
          <Text style={styles.childName}>{item.name}</Text>
          <Text style={styles.childDetails}>
            {item.birthdate} • {item.gender || 'Not specified'}
          </Text>
        </View>
        {isSelected && (
          <MaterialIcons name="check-circle" size={24} color="#4f8cff" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>Add Child to Group</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>
              Select a child to add to &quot;{familyGroupName}&quot;
            </Text>

            {loading ? (
              <LoadingSpinner message="Loading children..." />
            ) : (
              <>
                {availableChildren.length === 0 ? (
                  <View style={styles.emptyState}>
                    <MaterialIcons name="child-care" size={48} color="#ccc" />
                    <Text style={styles.emptyStateText}>
                      No children available to add to this group
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.debugText}>
                      Found {availableChildren.length} children to display
                    </Text>
                    
                    {/* Debug: Show first child info */}
                    {availableChildren.length > 0 && (
                      <Text style={styles.debugText}>
                        First child: {availableChildren[0].name} - {availableChildren[0].birthdate}
                      </Text>
                    )}
                    
                    {/* Simple list for debugging */}
                    <View style={styles.childrenList}>
                      {availableChildren.map((child, index) => (
                        <View key={child.id} style={styles.simpleChildItem}>
                          <Text style={styles.simpleChildText}>
                            {index + 1}. {child.name} ({child.gender})
                          </Text>
                          <TouchableOpacity
                            style={styles.simpleSelectButton}
                            onPress={() => {
                              console.log('Selected child:', child.name);
                              setSelectedChildId(child.id);
                            }}
                          >
                            <Text style={styles.simpleSelectText}>
                              {selectedChildId === child.id ? '✓ Selected' : 'Select'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </>
            )}
          </ScrollView>
          
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={updating}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.addButton,
                !selectedChildId && styles.addButtonDisabled
              ]}
              onPress={handleAddChildToGroup}
              disabled={!selectedChildId || updating}
            >
              {updating ? (
                <LoadingSpinner message="Adding..." />
              ) : (
                <Text style={styles.addButtonText}>Add to Group</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  childrenList: {
    flex: 1,
    marginBottom: 20,
    maxHeight: 200,
    minHeight: 100,
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedChildItem: {
    borderColor: '#4f8cff',
    backgroundColor: '#e0e7ff',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  childDetails: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 'auto',
    paddingTop: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#4f8cff',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  debugText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  simpleChildItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 8,
  },
  simpleChildText: {
    fontSize: 16,
    color: '#333',
  },
  simpleSelectButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
  },
  simpleSelectText: {
    fontSize: 14,
    color: '#4f8cff',
    fontWeight: '600',
  },
}); 