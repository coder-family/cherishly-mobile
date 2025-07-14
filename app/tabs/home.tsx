import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-paper-dropdown";
import ChildProfileCard from "../components/child/ChildProfileCard";
import InputField from "../components/form/InputField";
import AvatarUpload from "../components/media/AvatarUpload";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchCurrentUser,
  updateUser,
  uploadUserAvatar,
} from "../redux/slices/userSlice";
import { fetchChildren } from "../redux/slices/childSlice";

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const {
    currentUser,
    loading: userLoading,
    error: userError,
  } = useAppSelector((state) => state.user);
  const { children, loading: childrenLoading, error: childrenError } = useAppSelector(
    (state) => state.children
  );
  const { familyGroups, error: familyError } = useAppSelector(
    (state) => state.family
  );

  const [name, setName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [gender, setGender] = useState(
    user && "gender" in user && (user as any).gender
      ? (user as any).gender
      : "other"
  );
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || "");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [pendingAvatar, setPendingAvatar] = useState<string | undefined>(
    undefined
  ); // for local preview
  const [error, setError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
  ];

  // Fetch current user data on component mount
  useEffect(() => {
    if (user) {
      dispatch(fetchCurrentUser(user.id));
      dispatch(fetchChildren());
      // Temporarily disabled to avoid API errors while testing family service
      // dispatch(fetchFamilyGroups());
    }
  }, [dispatch, user]);

  // Update form fields when currentUser is loaded
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.firstName || "");
      setLastName(currentUser.lastName || "");
      setDateOfBirth(currentUser.dateOfBirth || "");
      setAvatar(currentUser.avatar);
      setPendingAvatar(undefined); // reset pending avatar on load
    }
  }, [currentUser]);

  // Show error alerts
  useEffect(() => {
    if (childrenError) {
      Alert.alert('Error', childrenError);
    }
    // Temporarily disabled since we're not calling family API
    // if (familyError) {
    //   Alert.alert('Error', familyError);
    // }
    if (userError) {
      Alert.alert("Error", userError);
    }
  }, [childrenError, familyError, userError]);

  const handleSave = async () => {
    if (!user) return;
    setError(null);
    try {
      let avatarUrl = avatar;
      // If a new avatar is selected (pendingAvatar is set and is a local file)
      if (pendingAvatar && (!avatar || !pendingAvatar.startsWith("http"))) {
        const uploadResult = await dispatch(
          uploadUserAvatar({ userId: user.id, imageUri: pendingAvatar })
        ).unwrap();
        avatarUrl = uploadResult.avatar;
        setAvatar(avatarUrl);
        setPendingAvatar(undefined);
      }
      await dispatch(
        updateUser({
          userId: user.id,
          data: {
            firstName: name,
            lastName: lastName,
            dateOfBirth: dateOfBirth,
            avatar: avatarUrl,
          },
        })
      ).unwrap();
      Alert.alert("Success", "Profile updated successfully!");
      setShowEditModal(false); // Close modal on success
    } catch (err: any) {
      setError(err?.message || "Update failed");
    }
  };

  const handleAddChild = () => {
    // Navigate to add child screen (you'll need to create this)
    router.push("/children/add");
  };

  const handleChildPress = (childId: string) => {
    // Navigate to child profile screen
    router.push(`/children/${childId}/profile`);
  };

  const handleFamilyGroupPress = () => {
    if (familyGroups.length > 0) {
      // Navigate to family group detail
      router.push(`/family/${familyGroups[0].id}`);
    } else {
      // Navigate to create/join family group screen
      router.push("/family/create");
    }
  };

  // Check if user has children
  const hasChildren = children && children.length > 0;
  
  // Debug log for children data
  React.useEffect(() => {
    console.log('Children state debug:', {
      children,
      childrenCount: children?.length || 0,
      childrenLoading,
      childrenError,
      hasChildren: children && children.length > 0
    });
  }, [children, childrenLoading, childrenError]);

  // Show loading spinner while fetching user data
  if (userLoading && !currentUser) {
    return <LoadingSpinner message="Loading your profile..." />;
  }

  // UI for profile card
  const renderProfileCard = () => (
    <View style={styles.profileCard}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <AvatarUpload
          userId={user?.id ?? ''}
          initialUri={avatar}
          onAvatarPicked={() => {}}
        />
        <View style={{ marginLeft: 16 }}>
          <Text style={styles.profileName}>
            {currentUser?.firstName || user?.firstName || ''} {currentUser?.lastName || user?.lastName || ''}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.editButton} onPress={() => setShowEditModal(true)}>
        <MaterialIcons name="edit" size={20} color="#4f8cff" />
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  // UI for updating personal info (now in modal)
  const renderProfileUpdate = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowEditModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.sectionTitle}>Update Your Info</Text>
          <Text style={styles.inputLabel}>Avatar</Text>
          <AvatarUpload
            userId={user?.id ?? ''}
            initialUri={pendingAvatar ?? avatar}
            onAvatarPicked={(uri) => {
              setPendingAvatar(uri);
            }}
          />
          <Text style={styles.inputLabel}>First Name</Text>
          <InputField
            value={name}
            onChangeText={setName}
            placeholder="Enter your first name"
          />
          <Text style={styles.inputLabel}>Last Name</Text>
          <InputField
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name"
          />
          <Text style={styles.inputLabel}>Gender</Text>
          <Dropdown
            label={"Gender"}
            mode={"outlined"}
            value={gender}
            onSelect={setGender}
            options={genderOptions}
          />
          <Text style={styles.inputLabel}>Date of Birth</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={[styles.inputField, { justifyContent: "center" }]}
          >
            <Text>{dateOfBirth ? dateOfBirth.slice(0, 10) : "YYYY-MM-DD"}</Text>
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
            onPress={() => {
              setShowEditModal(false);
              router.push("/change-password");
            }}
          >
            <Text style={styles.saveButtonText}>Change Password</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
            <TouchableOpacity
              style={[styles.saveButton, { flex: 1, marginRight: 8 }]}
              onPress={handleSave}
              disabled={userLoading}
            >
              <Text style={styles.saveButtonText}>
                {userLoading ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cancelButton, { flex: 1, marginLeft: 8 }]}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          {(error || userError) && (
            <Text style={{ color: "red", marginTop: 8 }}>
              {error || userError}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );

  // UI for family group button
  const renderFamilyGroupButton = () => (
    <TouchableOpacity
      style={styles.groupButton}
      onPress={handleFamilyGroupPress}
    >
      <Text style={styles.groupButtonText}>
        {familyGroups.length > 0
          ? "Your Family Group"
          : "Create or Join Family Group"}
      </Text>
    </TouchableOpacity>
  );

  // Single UI that works for both cases - with and without children
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderProfileCard()}
        {renderProfileUpdate()}
        <Text style={styles.welcomeTitle}>
          Welcome
          {currentUser?.firstName || user?.firstName
            ? `, ${currentUser?.firstName || user?.firstName}`
            : ""}
          !
        </Text>
        
        {!hasChildren && (
          <Text style={styles.welcomeSubtitle}>
            Let&apos;s get started on your family&apos;s journey.
          </Text>
        )}

        {/* Show loading state for children */}
        {childrenLoading && (
          <Text style={styles.welcomeSubtitle}>Loading your children...</Text>
        )}

        {/* Show children if any exist */}
        {hasChildren && !childrenLoading && (
          <>
            <Text style={styles.sectionTitle}>Your Babies</Text>
            {children.filter(child => child && child.id).map((child, index) => (
              <TouchableOpacity
                key={`child-${child.id}-${index}`}
                style={styles.childCard}
                onPress={() => handleChildPress(child.id)}
              >
                <ChildProfileCard
                  avatarUrl={child.avatarUrl}
                  name={child.name}
                  birthdate={child.birthdate}
                  bio={child.bio}
                />
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Debug information (remove in production) */}
        {/* {__DEV__ && (
          <Text style={{fontSize: 12, color: 'gray', marginTop: 10}}>
            Debug: {children?.length || 0} children | Loading: {childrenLoading ? 'Yes' : 'No'} | Error: {childrenError || 'None'}
          </Text>
        )} */}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleAddChild}
        >
          <Text style={styles.primaryButtonText}>
            {hasChildren ? "Add Another Baby" : "Add Your Baby"}
          </Text>
        </TouchableOpacity>
        
        {renderFamilyGroupButton()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#fff",
    flexGrow: 1,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  section: {
    width: "100%",
    marginTop: 32,
    padding: 16,
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: "#4f8cff",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 18,
    marginBottom: 8,
    alignItems: "center",
    width: "100%",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  groupButton: {
    backgroundColor: "#e0e7ff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 8,
    alignItems: "center",
    width: "100%",
  },
  groupButtonText: {
    color: "#3b4cca",
    fontSize: 16,
    fontWeight: "bold",
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
  childCard: {
    width: "100%",
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
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  picker: {
    height: 44,
    width: "100%",
  },
  profileCard: {
    width: '100%',
    backgroundColor: '#eaf0fb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  editButtonText: {
    color: '#4f8cff',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 15,
  },
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
  cancelButton: {
    backgroundColor: '#eee',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
