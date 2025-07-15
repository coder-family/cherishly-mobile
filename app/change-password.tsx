import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native";
import PasswordInput from "./components/form/PasswordInput";
import { changePassword } from "./services/authService";
import { sanitizeError } from "./utils/logUtils";

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      Alert.alert("Success", "Password changed successfully");
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to change password");
      console.error("Change password error:", sanitizeError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>
      <Text style={styles.label}>Current Password</Text>
      <PasswordInput
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Enter current password"
      />
      <Text style={styles.label}>New Password</Text>
      <PasswordInput
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Enter new password"
      />
      <Text style={styles.label}>Confirm New Password</Text>
      <PasswordInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm new password"
      />
      <Button
        title={loading ? "Changing..." : "Change Password"}
        onPress={handleSubmit}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
}); 