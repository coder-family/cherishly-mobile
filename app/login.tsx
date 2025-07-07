import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { clearError, loginUser } from "./redux/slices/authSlice";
import { LoginForm, loginSchema } from "./utils/validation";

export default function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);

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
    if (isAuthenticated && hasAttemptedLogin) {
      // User just completed a login action, show success message
      setShowSuccessMessage(true);
      setTimeout(() => {
        router.replace("/tabs/home");
      }, 1500);
    }
  }, [isAuthenticated, hasAttemptedLogin, router]);

  const onSubmit = (data: LoginForm) => {
    // Clear any previous success message and mark that user is attempting login
    setShowSuccessMessage(false);
    setHasAttemptedLogin(true);
    dispatch(loginUser({
      email: data.email,
      password: data.password,
    }));
  };

  const navigateToRegister = () => {
    router.push("/register");
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
}); 