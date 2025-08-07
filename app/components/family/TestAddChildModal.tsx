import React, { useState } from 'react';
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchChildren } from '../../redux/slices/childSlice';
import { addChildToFamilyGroup } from '../../redux/slices/familySlice';

interface TestAddChildModalProps {
  visible: boolean;
  onClose: () => void;
  familyGroupId: string;
}

export default function TestAddChildModal({
  visible,
  onClose,
  familyGroupId,
}: TestAddChildModalProps) {
  const dispatch = useAppDispatch();
  const { children, loading } = useAppSelector((state) => state.children);
  const [testChildId, setTestChildId] = useState<string>('');

  const handleTestAddChild = async () => {
    if (!testChildId) {
      Alert.alert('Error', 'Please enter a child ID');
      return;
    }

    try {
      const result = await dispatch(addChildToFamilyGroup({
        groupId: familyGroupId,
        childId: testChildId
      })).unwrap();
      Alert.alert('Success', 'Child added successfully!');
    } catch (error: any) {
      console.error('Test: Error adding child:', error);
      Alert.alert('Error', error.message || 'Failed to add child');
    }
  };

  const handleLoadChildren = async () => {
    try {
      await dispatch(fetchChildren()).unwrap();
    } catch (error: any) {
      console.error('Test: Error loading children:', error);
      Alert.alert('Error', 'Failed to load children');
    }
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
          <Text style={styles.title}>Test Add Child to Group</Text>
          
          <Text style={styles.subtitle}>
            Group ID: {familyGroupId}
          </Text>
          
          <Text style={styles.subtitle}>
            Available Children: {children?.length || 0}
          </Text>
          
          {children?.map((child, index) => (
            <Text key={child.id} style={styles.childText}>
              {index + 1}. {child.name} (ID: {child.id})
            </Text>
          ))}
          
          <TouchableOpacity
            style={styles.button}
            onPress={handleLoadChildren}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Loading...' : 'Load Children'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
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
    width: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  childText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#4f8cff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
}); 