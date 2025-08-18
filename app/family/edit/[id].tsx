import { API_BASE_URL } from '@env';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ErrorText from '../../components/form/ErrorText';
import FormWrapper from '../../components/form/FormWrapper';
import InputField from '../../components/form/InputField';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import AvatarUpload from '../../components/media/AvatarUpload';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { deleteFamilyGroup, fetchFamilyGroup, fetchFamilyGroups, updateFamilyGroup } from '../../redux/slices/familySlice';
import { authService } from '../../services/authService';
import ScreenWithFooter from '../../components/layout/ScreenWithFooter';

// Use the same fallback as apiService
const BASE_URL = API_BASE_URL || "https://growing-together-app.onrender.com/api";

export default function EditFamilyGroupScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentGroup, loading, error } = useAppSelector((state) => state.family);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load family group data
  useEffect(() => {
    if (id) {
      dispatch(fetchFamilyGroup(id));
    }
  }, [dispatch, id]);

  // Update form when family group data loads
  useEffect(() => {
    if (currentGroup) {
      setFormData({
        name: currentGroup.name || '',
        description: currentGroup.description || '',
      });
      setAvatarUrl(currentGroup.avatarUrl || '');
    }
  }, [currentGroup]);

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
  const handleUpdate = async () => {
    if (!validateForm() || !id) {
      return;
    }

    setIsSubmitting(true);
    try {
      await updateFamilyGroupDetails(id);
      await handleAvatarUpload(id);
      showSuccessMessage();
    } catch (err: any) {
      handleUpdateError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update family group details
  const updateFamilyGroupDetails = async (groupId: string) => {
    const updateData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
    };

    await dispatch(updateFamilyGroup({ groupId, data: updateData })).unwrap();
  };

  // Handle avatar upload if changed
  const handleAvatarUpload = async (groupId: string) => {
    if (avatarUrl && avatarUrl !== currentGroup?.avatarUrl) {
      try {
        await uploadGroupAvatar(groupId, avatarUrl);
        // Refresh family groups to show updated avatar
        dispatch(fetchFamilyGroups());
      } catch (avatarError) {
        console.warn('Avatar upload failed, but group was updated:', avatarError);
        // Don't fail the entire operation if avatar upload fails
      }
    }
  };

  // Show success message and navigate
  const showSuccessMessage = () => {
    Alert.alert(
      'Success!',
      'Family group has been updated successfully.',
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  // Handle update errors
  const handleUpdateError = (err: any) => {
    console.error('Error updating family group:', err);
    Alert.alert(
      'Error',
      err.message || 'Failed to update family group. Please try again.'
    );
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
    
    const response = await fetch(`${BASE_URL}/family-groups/${groupId}/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Failed to upload avatar';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || 'Unknown server error';
      } catch {
        // If we can't parse the response, use status information
        errorMessage = `Server returned ${response.status} ${response.statusText}`;
      }
      throw new Error(`Avatar upload failed: ${errorMessage} (Status: ${response.status})`);
    }

    const data = await response.json();
    return data;
  };

  // Handle delete
  const handleDelete = () => {
    if (!id || !currentGroup) return;

    Alert.alert(
      'Delete Family Group',
      `Are you sure you want to delete "${currentGroup.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              await dispatch(deleteFamilyGroup(id)).unwrap();
              
              Alert.alert(
                'Deleted',
                'Family group has been deleted successfully.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.push('/tabs/home')
                  }
                ]
              );
            } catch (err: any) {
              console.error('Error deleting family group:', err);
              Alert.alert(
                'Error',
                err.message || 'Failed to delete family group. Please try again.'
              );
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading family group..." />;
  }

  if (!currentGroup && !loading) {
    return (
      <ScreenWrapper>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Family Group Not Found</Text>
          <Text style={styles.errorMessage}>
            The family group you&apos;re looking for could not be found.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView 
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FormWrapper>
            <View style={styles.header}>
              <Text style={styles.title}>Edit Family Group</Text>
              <Text style={styles.subtitle}>
                Update your family group information and settings.
              </Text>
            </View>

            {/* Avatar Upload */}
            <View style={styles.avatarSection}>
              <Text style={styles.sectionLabel}>Family Group Picture</Text>
              <AvatarUpload
                onAvatarPicked={(url: string) => setAvatarUrl(url)}
                initialUri={avatarUrl}
                userId={`family-group-${id}`}
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
              <Text style={styles.sectionLabel}>Description</Text>
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

            {/* Group Information */}
            {currentGroup && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionLabel}>Group Information</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Group ID:</Text>
                  <Text style={styles.infoValue}>{currentGroup.id}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Members:</Text>
                  <Text style={styles.infoValue}>
                    {currentGroup.members?.length || 0} member{currentGroup.members?.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Created:</Text>
                  <Text style={styles.infoValue}>
                    {new Date(currentGroup.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonSection}>
              <TouchableOpacity
                style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
                onPress={handleUpdate}
                disabled={isSubmitting}
              >
                <Text style={styles.primaryButtonText}>
                  {isSubmitting ? 'Updating...' : 'Update Group'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.back()}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteButton, isSubmitting && styles.deleteButtonDisabled]}
                onPress={handleDelete}
                disabled={isSubmitting}
              >
                <Text style={styles.deleteButtonText}>Delete Group</Text>
              </TouchableOpacity>
            </View>

            {/* General Error Display */}
            {error && (
              <View style={styles.errorSection}>
                <ErrorText>{error}</ErrorText>
              </View>
            )}
          </FormWrapper>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
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
  infoSection: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
  buttonSection: {
    marginTop: 32,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#4f8cff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonDisabled: {
    backgroundColor: '#ccc',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ff4757',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonDisabled: {
    backgroundColor: '#ffb3ba',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorSection: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
}); 