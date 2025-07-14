import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { createChild, uploadChildAvatar } from '../../redux/slices/childSlice';
import { CreateChildData } from '../../services/childService';
import GenderPicker from '../form/GenderPicker';
import InputField from '../form/InputField';
import AvatarUpload from '../media/AvatarUpload';

interface AddChildModalProps {
  visible: boolean;
  onClose: () => void;
}

const AddChildModal: React.FC<AddChildModalProps> = ({
  visible,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.children);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('other');
  const [avatar, setAvatar] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    if (dateOfBirth && new Date(dateOfBirth) > new Date()) {
      newErrors.dateOfBirth = 'Date of birth cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset form
  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setNickname('');
    setDateOfBirth('');
    setGender('other');
    setAvatar('');
    setErrors({});
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // First create the child without avatar
      const childData: CreateChildData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nickname: nickname.trim() || undefined,
        dateOfBirth: dateOfBirth,
        gender,
        // Don't include avatar in initial creation
      };

      const newChild = await dispatch(createChild(childData)).unwrap();
      
      // If an avatar was selected, upload it
      if (avatar && !avatar.startsWith("http")) {
        try {
          await dispatch(uploadChildAvatar({ 
            childId: newChild.id, 
            imageUri: avatar 
          })).unwrap();
        } catch (avatarError: any) {
          // Child was created but avatar upload failed
          console.warn('Avatar upload failed:', avatarError);
          Alert.alert(
            'Partial Success', 
            `${firstName} has been added but avatar upload failed. You can add the photo later.`
          );
          resetForm();
          onClose();
          return;
        }
      }
      
      Alert.alert(
        'Success!', 
        `${firstName} has been added to your baby!`,
        [{ text: 'OK', onPress: () => {
          resetForm();
          onClose();
        }}]
      );
    } catch (error: any) {
      Alert.alert(
        'Error', 
        error?.message || 'Failed to add baby. Please try again.'
      );
    }
  };

  // Handle date change
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const iso = selectedDate.toISOString();
      setDateOfBirth(iso.slice(0, 10));
      setErrors(prev => ({ ...prev, dateOfBirth: '' }));
    }
  };

  // Handle close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add Your Baby</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            <Text style={[styles.saveButton, loading && styles.disabledButton]}>
              {loading ? 'Adding...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          {/* Avatar Upload */}
          <View style={styles.avatarSection}>
            <Text style={styles.sectionTitle}>Baby Photo</Text>
            <AvatarUpload
              initialUri={avatar}
              onAvatarPicked={setAvatar}
              userId="child-avatar"
            />
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <Text style={styles.inputLabel}>First Name *</Text>
            <InputField
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                setErrors(prev => ({ ...prev, firstName: '' }));
              }}
              placeholder="Enter first name"
              error={errors.firstName}
            />

            <Text style={styles.inputLabel}>Last Name *</Text>
            <InputField
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                setErrors(prev => ({ ...prev, lastName: '' }));
              }}
              placeholder="Enter last name"
              error={errors.lastName}
            />

            <Text style={styles.inputLabel}>Nickname (Optional)</Text>
            <InputField
              value={nickname}
              onChangeText={setNickname}
              placeholder="Enter nickname"
            />
          </View>

          {/* Date of Birth */}
          <View style={styles.section}>
            <Text style={styles.inputLabel}>Date of Birth *</Text>
            <TouchableOpacity 
              style={[styles.inputField, errors.dateOfBirth && styles.errorBorder]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {dateOfBirth ? dateOfBirth : "YYYY-MM-DD"}
              </Text>
            </TouchableOpacity>
            {errors.dateOfBirth && (
              <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
            )}

            {showDatePicker && (
              <DateTimePicker
                value={dateOfBirth ? new Date(dateOfBirth) : new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Gender */}
          <View style={[styles.section, { borderBottomWidth: 0, paddingBottom: 40 }]}>
            <Text style={styles.inputLabel}>Gender</Text>
            <GenderPicker
              value={gender}
              onSelect={setGender}
            />
          </View>
        </ScrollView>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    fontSize: 16,
    color: '#4f8cff',
    fontWeight: '600',
  },
  disabledButton: {
    color: '#ccc',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  section: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
    marginTop: 12,
    color: "#333",
  },
  inputField: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  errorBorder: {
    borderColor: '#e53935',
  },
  errorText: {
    fontSize: 13,
    color: '#e53935',
    marginTop: 4,
  },
});

export default AddChildModal; 