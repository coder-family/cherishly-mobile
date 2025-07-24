import { API_BASE_URL } from '@env';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { createFamilyGroup, fetchFamilyGroups } from '../../redux/slices/familySlice';
import { authService } from '../../services/authService';
import ErrorText from '../form/ErrorText';
import InputField from '../form/InputField';
import AvatarUpload from '../media/AvatarUpload';

interface AddFamilyGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddFamilyGroupModal: React.FC<AddFamilyGroupModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.family);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (visible) {
      setFormData({ name: '', description: '' });
      setAvatarUrl('');
      setFormErrors({});
    }
  }, [visible]);

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Family group name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Family group name must be at least 2 characters';
    }

    if (formData.description && formData.description.length > 200) {
      errors.description = 'Description must be less than 200 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // First create the family group without avatar
      const createData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      };

      const result = await dispatch(createFamilyGroup(createData)).unwrap();
      
      // If avatar was selected, upload it after group creation
      if (avatarUrl && result.id) {
        try {
          await uploadGroupAvatar(result.id, avatarUrl);
          // Refresh family groups to show updated avatar
          dispatch(fetchFamilyGroups());
        } catch {
          // console.warn('Avatar upload failed, but group was created:', avatarError); // Commented out - not related to health/growth
          // Don't fail the entire operation if avatar upload fails
        }
      }
      
      Alert.alert(
        'Success!',
        'Your family group has been created successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              onClose();
              onSuccess?.();
            }
          }
        ]
      );
    } catch (err: any) {
      // console.error('Error creating family group:', err); // Commented out - not related to health/growth
      Alert.alert(
        'Error',
        err.message || 'Failed to create family group. Please try again.'
      );
    }
  };

  // Helper function to upload group avatar (same pattern as successful child avatar upload)
  const uploadGroupAvatar = async (groupId: string, imageUri: string) => {
    // Create FormData for file upload
    const formData = new FormData();
    
    // Get file name from URI
    const fileName = imageUri.split('/').pop() || 'avatar.jpg';
    
    // Append the file to FormData
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg', // You might want to detect this dynamically
      name: fileName,
    } as any);

    // Use a separate axios instance for file uploads to avoid JSON content-type issues
    const token = await authService.getAccessToken();
    
    const response = await fetch(`${API_BASE_URL}/family-groups/${groupId}/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || 'Failed to upload avatar';
      if (response.status === 413) {
        throw new Error(`File size too large: ${errorMessage}`);
      } else if (response.status === 415) {
        throw new Error(`Unsupported file type: ${errorMessage}`);
      } else {
        throw new Error(`Avatar upload failed: ${errorMessage}`);
      }
    }

    const data = await response.json();
    return data;
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>Create Family Group</Text>
          
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={[styles.saveButtonText, loading && styles.saveButtonTextDisabled]}>
              {loading ? 'Creating...' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback>
            <View style={styles.form}>
              {/* Avatar Upload */}
              <View style={styles.avatarSection}>
                <Text style={styles.sectionLabel}>Family Group Picture</Text>
                <AvatarUpload
                  onAvatarPicked={(url: string) => setAvatarUrl(url)}
                  initialUri={avatarUrl}
                  userId="family-group-new"
                />
              </View>

              {/* Family Group Name */}
              <View style={styles.inputSection}>
                <Text style={styles.sectionLabel}>Family Group Name *</Text>
                <InputField
                  placeholder="e.g., The Smith Family"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  error={formErrors.name}
                  autoCapitalize="words"
                  maxLength={50}
                />
                {formErrors.name && <ErrorText>{formErrors.name}</ErrorText>}
              </View>

              {/* Description */}
              <View style={styles.inputSection}>
                <Text style={styles.sectionLabel}>Description (Optional)</Text>
                <InputField
                  placeholder="Tell us about your family..."
                  value={formData.description}
                  onChangeText={(value) => handleInputChange('description', value)}
                  error={formErrors.description}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                  style={styles.descriptionInput}
                />
                <Text style={styles.characterCount}>
                  {formData.description.length}/200 characters
                </Text>
                {formErrors.description && <ErrorText>{formErrors.description}</ErrorText>}
              </View>

              {/* General Error Display */}
              {error && (
                <View style={styles.errorSection}>
                  <ErrorText>{error}</ErrorText>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#4f8cff',
    borderRadius: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButtonTextDisabled: {
    color: '#999',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  avatarSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  inputSection: {
    marginBottom: 20,
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  errorSection: {
    marginTop: 16,
  },
});

export default AddFamilyGroupModal; 