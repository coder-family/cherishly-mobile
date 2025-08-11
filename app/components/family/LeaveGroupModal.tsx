import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import * as familyService from '../../services/familyService';
import LoadingSpinner from '../ui/LoadingSpinner';

interface LeaveGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groupId: string;
  groupName: string;
  userRole: string;
  isOwner: boolean;
}

export default function LeaveGroupModal({
  visible,
  onClose,
  onSuccess,
  groupId,
  groupName,
  userRole,
  isOwner,
}: LeaveGroupModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLeaveGroup = async () => {
    setIsSubmitting(true);
    try {
      await familyService.leaveFamilyGroup(groupId);
      Alert.alert(
        'Success',
        `You have successfully left ${groupName}.`,
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess();
              onClose();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to leave group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <MaterialIcons name="exit-to-app" size={32} color="#e74c3c" />
            <Text style={styles.title}>Leave Group</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.message}>
              Are you sure you want to leave{' '}
              <Text style={styles.groupName}>{groupName}</Text>?
            </Text>

            {isOwner && (
              <View style={styles.warningContainer}>
                <MaterialIcons name="warning" size={20} color="#f39c12" />
                <Text style={styles.warningText}>
                  You are the group owner. Leaving the group will transfer ownership to another member or delete the group entirely.
                </Text>
              </View>
            )}

            <View style={styles.consequencesContainer}>
              <Text style={styles.consequencesTitle}>What happens when you leave:</Text>
              <View style={styles.consequenceItem}>
                <MaterialIcons name="remove-circle" size={16} color="#666" />
                <Text style={styles.consequenceText}>You will lose access to all group content</Text>
              </View>
              <View style={styles.consequenceItem}>
                <MaterialIcons name="remove-circle" size={16} color="#666" />
                <Text style={styles.consequenceText}>You will no longer see group updates</Text>
              </View>
              <View style={styles.consequenceItem}>
                <MaterialIcons name="remove-circle" size={16} color="#666" />
                <Text style={styles.consequenceText}>You will need to be re-invited to rejoin</Text>
              </View>
            </View>

            <Text style={styles.note}>
              This action cannot be undone.
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.leaveButton]}
              onPress={handleLeaveGroup}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LoadingSpinner size="small" color="#fff" />
              ) : (
                <Text style={styles.leaveButtonText}>Leave Group</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 8,
  },
  content: {
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  groupName: {
    fontWeight: 'bold',
    color: '#4f8cff',
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  consequencesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  consequencesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  consequenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  consequenceText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  note: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  leaveButton: {
    backgroundColor: '#e74c3c',
  },
  leaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 