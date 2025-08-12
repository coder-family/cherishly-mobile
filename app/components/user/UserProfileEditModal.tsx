import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { useAppDispatch } from '../../redux/hooks';
import { updateUser, uploadUserAvatar } from '../../redux/slices/userSlice';
import GenderPicker from '../form/GenderPicker';
import AvatarUpload from '../media/AvatarUpload';

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  avatar?: string;
}

interface UserProfileEditModalProps {
  visible: boolean;
  onClose: () => void;
  user?: User;
  currentUser?: User | null;
  loading?: boolean;
  error?: string | null;
}

const UserProfileEditModal: React.FC<UserProfileEditModalProps> = ({
  visible,
  onClose,
  user,
  currentUser,
  loading = false,
  error: userError = null,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Use currentUser or fallback to user for initial values
  const userData = currentUser || user;

  const [name, setName] = useState(userData?.firstName || "");
  const [lastName, setLastName] = useState(userData?.lastName || "");
  const [gender, setGender] = useState("other");
  const [dateOfBirth, setDateOfBirth] = useState(userData?.dateOfBirth || "");
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [pendingAvatar, setPendingAvatar] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Update form fields when currentUser is loaded or user changes
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.firstName || "");
      setLastName(currentUser.lastName || "");
      setDateOfBirth(currentUser.dateOfBirth || "");
      setAvatar(currentUser.avatar);
      setPendingAvatar(undefined);
    } else if (user) {
      setName(user.firstName || "");
      setLastName(user.lastName || "");
      setDateOfBirth(user.dateOfBirth || "");
      setAvatar(user.avatar);
      setPendingAvatar(undefined);
    }
  }, [currentUser, user]);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setError(null);
      setPendingAvatar(undefined);
    }
  }, [visible]);

  const handleSave = async () => {
    const userId = currentUser?.id || user?.id;
    if (!userId) return;
    
    setError(null);
    
    try {
      let avatarUrl = avatar;
      
      // If a new avatar is selected (pendingAvatar is set and is a local file)
      if (pendingAvatar && (!avatar || !pendingAvatar.startsWith("http"))) {
        const uploadResult = await dispatch(
          uploadUserAvatar({ userId, imageUri: pendingAvatar })
        ).unwrap();
        avatarUrl = uploadResult.avatar;
        setAvatar(avatarUrl);
      }

      // Update user data
      await dispatch(
        updateUser({
          userId,
          data: {
            firstName: name,
            lastName: lastName,
            dateOfBirth: dateOfBirth,
            avatar: avatarUrl,
          },
        })
      ).unwrap();

      Alert.alert("Success", "Profile updated successfully");
      onClose();
    } catch (error: any) {
      setError(error.message || "Failed to update profile");
    }
  };

  const handleChangePassword = () => {
    router.push("/change-password");
    onClose();
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "Select date of birth";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString.slice(0, 10) || "Select date of birth";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.sectionTitle}>Edit Profile</Text>
              
              <Text style={styles.inputLabel}>Avatar</Text>
              <AvatarUpload
                userId={userData?.id || ''}
                initialUri={pendingAvatar ?? avatar}
                onAvatarPicked={(uri) => {
                  setPendingAvatar(uri);
                }}
              />
              
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.inputField}
                value={name}
                onChangeText={setName}
                placeholder="Enter first name"
              />
              
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.inputField}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
              />
              
              <Text style={styles.inputLabel}>Gender</Text>
              <GenderPicker
                value={gender}
                onSelect={(value: string) => setGender(value)}
              />
              
              <Text style={styles.inputLabel}>Date of Birth</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={[styles.inputField, { justifyContent: "center" }]}
              >
                <Text>{formatDateForDisplay(dateOfBirth)}</Text>
              </TouchableOpacity>
          
              {showDatePicker && (
                <DateTimePicker
                  value={dateOfBirth ? new Date(dateOfBirth) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      const iso = selectedDate.toISOString();
                      setDateOfBirth(iso.slice(0, 10));
                    }
                  }}
                  maximumDate={new Date()}
                />
              )}
              
              {/* Change Password Button */}
              <TouchableOpacity
                style={[styles.saveButton, { marginTop: 8, marginBottom: 0 }]}
                onPress={handleChangePassword}
              >
                <Text style={styles.saveButtonText}>Change Password</Text>
              </TouchableOpacity>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.saveButton, { flex: 1, marginRight: 8 }]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cancelButton, { flex: 1, marginLeft: 8 }]}
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
              
              {(error || userError) && (
                <Text style={styles.errorText}>
                  {error || userError}
                </Text>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
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
  },
  saveButton: {
    backgroundColor: "#4f8cff",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: '#eee',
    paddingVertical: 12,
    marginTop: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  errorText: {
    color: "red",
    marginTop: 8,
    textAlign: 'center',
  },
});

export default UserProfileEditModal; 