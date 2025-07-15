import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ImageBackground,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { clearError, loginUser } from "./redux/slices/authSlice";
import authService from "./services/authService";
import { LoginForm, loginSchema } from "./utils/validation";

export default function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Navigate to main app if authenticated
  useEffect(() => {
    if (isAuthenticated && hasAttemptedLogin && !error) {
      setShowSuccessMessage(true);
      setTimeout(() => {
        router.replace("/tabs/home");
        setHasAttemptedLogin(false); // Reset after navigation
      }, 1500);
    }
  }, [isAuthenticated, hasAttemptedLogin, error, router]);

  // Reset hasAttemptedLogin and showSuccessMessage on error
  useEffect(() => {
    if (error) {
      setHasAttemptedLogin(false);
      setShowSuccessMessage(false); // Hide success on error
    }
  }, [error]);

  const onSubmit = (data: LoginForm) => {
    setShowSuccessMessage(false); // Always clear previous success
    setHasAttemptedLogin(true);
    dispatch(loginUser({
      email: data.email,
      password: data.password,
    }));
  };

  const navigateToRegister = () => {
    router.push("/register");
  };

  const handleForgotPassword = async () => {
    setForgotLoading(true);
    setForgotMessage(null);
    setForgotError(null);
    try {
      await authService.requestPasswordReset(forgotEmail);
      setForgotMessage("If this email is registered, a reset link has been sent.");
    } catch (err: any) {
      const { sanitizeError } = await import("./utils/logUtils");
      console.error('Forgot password error:', sanitizeError(err));
      // Show more detailed error if available
      setForgotError(err?.message || "Failed to send reset email.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("./assets/images/backgroundMb.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>

          {/* Success message */}
          {showSuccessMessage && (
            <View style={styles.messageContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.successText} accessibilityRole="alert">
                Login successful! Redirecting...
              </Text>
            </View>
          )}

          {/* Redux error display */}
          {error && (
            <View style={styles.messageContainer}>
              <Ionicons name="alert-circle" size={24} color="#ff6b6b" />
              <Text style={styles.errorText} accessibilityRole="alert">
                {error}
              </Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Ionicons
              name="mail-outline"
              size={22}
              color="#fff"
              style={styles.icon}
            />
            <Controller
              control={control}
              name="email"
              render={({
                field: { onChange, value },
              }: {
                field: { onChange: (value: string) => void; value: string };
              }) => (
                <TextInput
                  style={[styles.input, { paddingLeft: 36 }]}
                  placeholder="Email address"
                  placeholderTextColor="#fff"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={value}
                  onChangeText={onChange}
                  testID="login-email-input"
                />
              )}
            />
            {errors.email && (
              <Text style={styles.validationErrorText}>{errors.email.message}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Ionicons
              name="lock-closed-outline"
              size={22}
              color="#fff"
              style={styles.icon}
            />
            <Controller
              control={control}
              name="password"
              render={({
                field: { onChange, value },
              }: {
                field: { onChange: (value: string) => void; value: string };
              }) => (
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, { paddingLeft: 36, paddingRight: 50 }]}
                    placeholder="Password"
                    placeholderTextColor="#fff"
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    value={value}
                    onChangeText={onChange}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password && (
              <Text style={styles.validationErrorText}>{errors.password.message}</Text>
            )}
          </View>

          {/* Forgot Password link */}
          <TouchableOpacity onPress={() => setForgotModalVisible(true)} style={{ alignSelf: "flex-end", marginBottom: 8 }}>
            <Text style={{ color: "#4CAF50", fontWeight: "600" }}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="refresh" size={20} color="#fff" style={styles.loadingIcon} />
                <Text style={styles.buttonText}>Signing In...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <Modal
        visible={forgotModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setForgotModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <Text style={styles.modalSubtitle}>Enter your email to receive a reset link.</Text>
            <TextInput
              style={[styles.input, { color: '#222' }]}
              placeholder="Email address"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
              value={forgotEmail}
              onChangeText={setForgotEmail}
              editable={!forgotLoading}
              testID="forgot-email-input"
            />
            {forgotError && <Text style={styles.errorText}>{forgotError}</Text>}
            {forgotMessage && <Text style={styles.successText}>{forgotMessage}</Text>}
            <TouchableOpacity
              style={[styles.button, forgotLoading && styles.buttonDisabled]}
              onPress={handleForgotPassword}
              disabled={forgotLoading || !forgotEmail}
            >
              <Text style={styles.buttonText}>{forgotLoading ? "Sending..." : "Send Reset Link"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setForgotModalVisible(false)}>
              <Text style={styles.linkText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  card: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.9,
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  passwordContainer: {
    position: "relative",
  },
  icon: {
    position: "absolute",
    left: 12,
    top: 16,
    zIndex: 1,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 16,
    zIndex: 1,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  successText: {
    color: "#4CAF50",
    fontSize: 14,
    marginLeft: 8,
    fontWeight: "500",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    marginLeft: 8,
    fontWeight: "500",
  },
  validationErrorText: {
    color: "#ff6b6b",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: "rgba(76, 175, 80, 0.6)",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingIcon: {
    marginRight: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#fff",
    fontSize: 14,
  },
  linkText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#222",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#444",
    marginBottom: 16,
    textAlign: "center",
  },
}); 