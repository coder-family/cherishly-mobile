import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import authService from "../services/authService";

export default function ResetPassword() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const token = params.token;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Invalid or missing token.");
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      // console.error("Reset password error:", sanitizeError(err)); // Commented out - not related to health/growth

      // If err is a string (from authService.resetPassword), use it directly
      const backendMsg =
        typeof err === "string"
          ? err
          : err?.response?.data?.message ||
            err?.response?.message ||
            err?.message ||
            "";

      const msg = backendMsg.toLowerCase();

      if (msg.includes("expired") || msg.includes("invalid")) {
        setError(
          "The password reset link is invalid or has expired. Please request it again."
        );
      } else if (msg.includes("trùng") || msg.includes("same")) {
        setError("The new password cannot be the same as the old password.");
      } else {
        setError(backendMsg || "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    if (Platform.OS === "web") {
      return (
        <View style={styles.centeredContainer}>
          <Text style={styles.title}>Password Reset Successful!</Text>
          <Text style={styles.text}>
            Your password has been reset successfully. Please return to the app
            and log in with your new password.
          </Text>
        </View>
      );
    }
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.centeredContainer}
      >
        <Text style={styles.title}>Password Reset Successful!</Text>
        <Text style={styles.text}>
          You can now log in with your new password.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    );
  }

  const content = (
    <>
      <Text style={styles.title}>Reset Your Password</Text>
      <View style={styles.inputGroup}>
        <TextInput
          secureTextEntry={!showPassword && Platform.OS !== "web"}
          placeholder="New password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          blurOnSubmit={false}
          {...(Platform.OS === "web" && !showPassword
            ? { type: "password" }
            : {})}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword((v) => !v)}
          accessibilityLabel={showPassword ? "Hide password" : "Show password"}
        >
          <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁️"}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputGroup}>
        <TextInput
          secureTextEntry={!showConfirm && Platform.OS !== "web"}
          placeholder="Confirm new password"
          value={confirm}
          onChangeText={setConfirm}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          {...(Platform.OS === "web" && !showConfirm
            ? { type: "password" }
            : {})}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowConfirm((v) => !v)}
          accessibilityLabel={showConfirm ? "Hide password" : "Show password"}
        >
          <Text style={styles.eyeText}>{showConfirm ? "🙈" : "👁️"}</Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Reset Password</Text>
        )}
      </TouchableOpacity>
    </>
  );

  if (Platform.OS === "web") {
    return <View style={styles.outer}>{content}</View>;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.outer}
    >
      {content}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f2f2f2",
  },
  container: {
    maxWidth: 400,
    width: "100%",
    padding: 24,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  centeredContainer: {
    maxWidth: 400,
    width: "100%",
    alignItems: "center",
    padding: 24,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#fafafa",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  eyeButton: {
    padding: 8,
  },
  eyeText: {
    fontSize: 18,
  },
  button: {
    width: "100%",
    maxWidth: 220,
    alignSelf: "center",
    padding: 12,
    backgroundColor: "#007AFF",
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    marginBottom: 12,
    textAlign: "center",
  },
});
