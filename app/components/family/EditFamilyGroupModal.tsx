import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { updateFamilyGroupDetails, uploadFamilyGroupAvatar } from '../../services/familyService';
import AvatarUpload from '../media/AvatarUpload';
import LoadingSpinner from '../ui/LoadingSpinner';

interface EditFamilyGroupModalProps {
  visible: boolean;
  onClose: () => void;
  familyGroup: any;
  onDeleteGroup?: () => void;
  currentUser?: any;
}

export default function EditFamilyGroupModal({
  visible,
  onClose,
  familyGroup,
  onDeleteGroup,
  currentUser,
}: EditFamilyGroupModalProps) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.family);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with current group data
  useEffect(() => {
    if (familyGroup) {
      setName(familyGroup.name || '');
      setDescription(familyGroup.description || '');
      setAvatarUrl(familyGroup.avatarUrl || '');
    }
  }, [familyGroup]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Group name is required');
      return;
    }

    if (!familyGroup?.id) {
      Alert.alert('Error', 'Group ID is missing');
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData: any = {
        name: name.trim(),
      };

      if (description.trim()) {
        updateData.description = description.trim();
      }

      // Handle avatar upload if it's a new local file
      if (avatarUrl && avatarUrl.startsWith('file://')) {
        try {
          await uploadFamilyGroupAvatar(familyGroup.id, avatarUrl);
          // Avatar đã được upload và lưu vào database
          // Không cần gửi avatar URL trong updateData nữa
        } catch (uploadError: any) {
          console.error('Group avatar upload failed:', uploadError);
          Alert.alert('Warning', 'Avatar upload failed. Group will be updated without avatar.');
        }
      } else if (avatarUrl && !avatarUrl.startsWith('file://')) {
        // Avatar là remote URL, gửi URL để update
        updateData.avatar = avatarUrl;
      }

      // Update group details (name, description)
      await updateFamilyGroupDetails(familyGroup.id, updateData);

      Alert.alert('Success', 'Family group updated successfully', [
        { text: 'OK', onPress: onClose }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update family group');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Family Group',
      'Are you sure you want to delete this family group? This action cannot be undone and will remove all group data including memories, timeline posts, and member associations.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            onDeleteGroup?.();
            onClose();
          }
        }
      ]
    );
  };

  const isFormValid = name.trim().length > 0;
  const hasChanges = 
    name !== (familyGroup?.name || '') ||
    description !== (familyGroup?.description || '') ||
    avatarUrl !== (familyGroup?.avatarUrl || '');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} disabled={isSubmitting}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Family Group</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!isFormValid || !hasChanges || isSubmitting}
            style={[
              styles.saveButton,
              (!isFormValid || !hasChanges || isSubmitting) && styles.saveButtonDisabled
            ]}
          >
            <Text style={[
              styles.saveButtonText,
              (!isFormValid || !hasChanges || isSubmitting) && styles.saveButtonTextDisabled
            ]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <Text style={styles.sectionTitle}>Group Avatar</Text>
            <AvatarUpload
              onAvatarPicked={setAvatarUrl}
              initialUri={avatarUrl}
              userId="group-avatar"
            />
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Group Information</Text>
            
            {/* Name Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Group Name *</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter group name"
                placeholderTextColor="#999"
                maxLength={50}
              />
              <Text style={styles.characterCount}>{name.length}/50</Text>
            </View>

            {/* Description Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter group description (optional)"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                maxLength={200}
              />
              <Text style={styles.characterCount}>{description.length}/200</Text>
            </View>
          </View>

          {/* Current Group Info */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Current Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Created:</Text>
                <Text style={styles.infoValue}>
                  {familyGroup?.createdAt ? 
                    new Date(familyGroup.createdAt).toLocaleDateString() : 
                    'Unknown'
                  }
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Members:</Text>
                <Text style={styles.infoValue}>
                  {familyGroup?.members?.length || 0} members
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Children:</Text>
                <Text style={styles.infoValue}>
                  {familyGroup?.children?.length || 0} children
                </Text>
              </View>
            </View>
          </View>

          {/* Delete Group Section - Only for owners */}
          {familyGroup?.ownerId && currentUser?.id === familyGroup.ownerId && onDeleteGroup && (
            <View style={styles.deleteSection}>
              <Text style={styles.sectionTitle}>Danger Zone</Text>
              <View style={styles.deleteCard}>
                <View style={styles.deleteInfo}>
                  <MaterialIcons name="warning" size={24} color="#e74c3c" />
                  <View style={styles.deleteTextContainer}>
                    <Text style={styles.deleteTitle}>Delete Family Group</Text>
                    <Text style={styles.deleteDescription}>
                      This will permanently delete the family group and all associated data including memories, timeline posts, and member associations.
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDeleteGroup}
                  disabled={isSubmitting}
                >
                  <MaterialIcons name="delete-forever" size={20} color="#fff" />
                  <Text style={styles.deleteButtonText}>Delete Group</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Loading Overlay */}
        {isSubmitting && (
          <View style={styles.loadingOverlay}>
            <LoadingSpinner message="Updating group..." />
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  saveButton: {
    backgroundColor: '#4f8cff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: '#999',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  avatarSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  deleteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteTextContainer: {
    marginLeft: 12,
  },
  deleteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e74c3c',
    marginBottom: 4,
  },
  deleteDescription: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 