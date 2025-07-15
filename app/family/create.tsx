import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import ErrorText from '../components/form/ErrorText';
import FormWrapper from '../components/form/FormWrapper';
import InputField from '../components/form/InputField';
// Note: PrimaryButton is empty, using TouchableOpacity directly
import { API_BASE_URL } from '@env';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import AvatarUpload from '../components/media/AvatarUpload';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { clearError, createFamilyGroup, fetchFamilyGroups } from '../redux/slices/familySlice';
import { authService } from '../services/authService';

export default function CreateFamilyGroupScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.family);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear any previous errors when component mounts
  React.useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

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

    setIsSubmitting(true);
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
        } catch (avatarError) {
          console.warn('Avatar upload failed, but group was created:', avatarError);
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
              // Navigate back to home or to the new family group
              router.back();
            }
          }
        ]
      );
    } catch (err: any) {
      console.error('Error creating family group:', err);
      Alert.alert(
        'Error',
        err.message || 'Failed to create family group. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
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
      throw new Error(errorData.message || 'Failed to upload avatar');
    }

    const data = await response.json();
    return data;
  };

  // Removed getAuthToken helper - using authService directly like child upload

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (isSubmitting) {
    return <LoadingSpinner message="Creating family group..." />;
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
              <Text style={styles.title}>Create Family Group</Text>
              <Text style={styles.subtitle}>
                Start building your family network and sharing precious moments together.
              </Text>
            </View>

            {/* Avatar Upload */}
            <View style={styles.avatarSection}>
              <Text style={styles.sectionLabel}>Family Group Picture (Optional)</Text>
              <AvatarUpload
                onAvatarPicked={(url: string) => setAvatarUrl(url)}
                initialUri={avatarUrl}
                userId="family-group"
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

            {/* Create Button */}
            <View style={styles.buttonSection}>
              <TouchableOpacity
                style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text style={styles.primaryButtonText}>
                  {isSubmitting ? 'Creating...' : 'Create Family Group'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.back()}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
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
  buttonSection: {
    marginTop: 32,
    marginBottom: 20,
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  errorSection: {
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: '#4f8cff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#ccc',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 