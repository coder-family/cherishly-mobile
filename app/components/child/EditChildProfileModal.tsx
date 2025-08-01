import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
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
import { useAppDispatch } from '../../redux/hooks';
import { updateChild } from '../../redux/slices/childSlice';
import { Child, UpdateChildData } from '../../services/childService';
import ErrorText from '../form/ErrorText';
import FormWrapper from '../form/FormWrapper';
import GenderPicker from '../form/GenderPicker';
import InputField from '../form/InputField';
import LabelText from '../form/LabelText';
import PrimaryButton from '../form/PrimaryButton';
import AvatarUpload from '../media/AvatarUpload';

interface EditChildProfileModalProps {
  visible: boolean;
  child: Child | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditChildProfileModal({ 
  visible, 
  child, 
  onClose, 
  onSuccess 
}: EditChildProfileModalProps) {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<UpdateChildData>({
    firstName: '',
    lastName: '',
    nickname: '',
    dateOfBirth: '',
    gender: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | undefined>();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Initialize form data when child changes
  useEffect(() => {
    if (child) {
      setFormData({
        firstName: child.firstName || '',
        lastName: child.lastName || '',
        nickname: child.nickname || '',
        dateOfBirth: child.birthdate,
        gender: child.gender || ''
      });
      setAvatarUri(child.avatarUrl);
      setErrors({});
    }
  }, [child]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (birthDate > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }

    // Validate gender if provided
    if (formData.gender && !['male', 'female', 'other'].includes(formData.gender)) {
      newErrors.gender = 'Gender must be male, female, or other';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarPicked = (uri: string) => {
    setAvatarUri(uri);
  };

  const handleSubmit = async () => {
    if (!validateForm() || !child) return;

    setLoading(true);
    try {
      // Prepare update data - include all available fields
      const updateData: UpdateChildData = {};
      
      // Always include required fields
      updateData.firstName = formData.firstName?.trim() || child.firstName;
      updateData.lastName = formData.lastName?.trim() || child.lastName;
      
      // Include dateOfBirth
      if (formData.dateOfBirth) {
        // Try sending date in YYYY-MM-DD format instead of ISO string
        const date = new Date(formData.dateOfBirth);
        updateData.dateOfBirth = date.toISOString().split('T')[0];
      } else {
        updateData.dateOfBirth = child.birthdate;
      }
      
      // Include optional fields if they have values
      if (formData.nickname?.trim()) {
        updateData.nickname = formData.nickname.trim();
      }
      
      if (formData.gender) {
        updateData.gender = formData.gender;
      }

      // Add avatar to update data if changed
      if (avatarUri && avatarUri !== child.avatarUrl) {
        updateData.avatar = avatarUri;
      }

      // Call Redux action to update child
      await dispatch(updateChild({ childId: child.id, data: updateData })).unwrap();

      Alert.alert('Success', 'Child profile updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update child profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Format date as ISO string to match backend format
      const isoDate = selectedDate.toISOString();
      setFormData(prev => ({
        ...prev,
        dateOfBirth: isoDate
      }));
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!child) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <FormWrapper>
            {/* Avatar Upload */}
            <View style={styles.fieldContainer}>
              <LabelText>Profile Picture</LabelText>
              <AvatarUpload
                onAvatarPicked={handleAvatarPicked}
                initialUri={child.avatarUrl}
                userId={child.id}
              />
              {uploadingAvatar && (
                <Text style={styles.uploadingText}>Uploading avatar...</Text>
              )}
            </View>

            {/* First Name */}
            <View style={styles.fieldContainer}>
              <LabelText required>First Name</LabelText>
              <InputField
                value={formData.firstName || ''}
                onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                placeholder="Enter first name"
                error={errors.firstName}
              />
              {errors.firstName && <ErrorText>{errors.firstName}</ErrorText>}
            </View>

            {/* Last Name */}
            <View style={styles.fieldContainer}>
              <LabelText required>Last Name</LabelText>
              <InputField
                value={formData.lastName || ''}
                onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                placeholder="Enter last name"
                error={errors.lastName}
              />
              {errors.lastName && <ErrorText>{errors.lastName}</ErrorText>}
            </View>

            {/* Nickname */}
            <View style={styles.fieldContainer}>
              <LabelText>Nickname</LabelText>
              <InputField
                value={formData.nickname || ''}
                onChangeText={(text) => setFormData(prev => ({ ...prev, nickname: text }))}
                placeholder="Enter nickname (optional)"
              />
            </View>

            {/* Date of Birth */}
            <View style={styles.fieldContainer}>
              <LabelText required>Date of Birth</LabelText>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.datePickerText}>
                  {formData.dateOfBirth ? formatDateForDisplay(formData.dateOfBirth) : 'Select date of birth'}
                </Text>
                <MaterialIcons name="calendar-today" size={20} color="#666" />
              </TouchableOpacity>
              {errors.dateOfBirth && <ErrorText>{errors.dateOfBirth}</ErrorText>}
            </View>

            {/* Gender */}
            <View style={styles.fieldContainer}>
              <LabelText>Gender</LabelText>
              <GenderPicker
                value={formData.gender || ''}
                onSelect={(value: string) => setFormData(prev => ({ ...prev, gender: value }))}
              />
            </View>
          </FormWrapper>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <PrimaryButton
            title={loading ? 'Updating...' : 'Update Profile'}
            onPress={handleSubmit}
            disabled={loading}
            style={styles.submitButton}
          />
        </View>
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </Modal>
  );
}

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
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  bioInput: {
    height: 100,
    paddingTop: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    marginTop: 8,
  },
  uploadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
}); 