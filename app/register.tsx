import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
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
import { clearError, registerUser } from "./redux/slices/authSlice";
import { RegisterForm, registerSchema } from "./utils/validation";

export default function Register() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "parent"
    },
  });

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Navigate to main app if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/home");
    }
  }, [isAuthenticated, router]);

  const onSubmit = (data: RegisterForm) => {
    console.log('onSubmit called with data:', data);
    dispatch(registerUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      dateOfBirth: data.dateOfBirth,
      role: data.role,
    }));
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
          <Text style={styles.title}>Sign Up</Text>
          <Text style={styles.subtitle}>Welcome to Growing Together</Text>

          {/* Redux error display */}
          {error && (
            <Text style={{ color: 'red', marginBottom: 8 }} accessibilityRole="alert">
              {error}
            </Text>
          )}

          <View style={styles.inputGroup}>
            <Controller
              control={control}
              name="firstName"
              render={({
                field: { onChange, value },
              }: {
                field: { onChange: (value: string) => void; value: string };
              }) => (
                <TextInput
                  style={styles.input}
                  placeholder="First name"
                  placeholderTextColor="#fff"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.firstName && (
              <Text style={styles.errorText}>{errors.firstName.message}</Text>
            )}
          </View>
          <View style={styles.inputGroup}>
            <Controller
              control={control}
              name="lastName"
              render={({
                field: { onChange, value },
              }: {
                field: { onChange: (value: string) => void; value: string };
              }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Last name"
                  placeholderTextColor="#fff"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.lastName && (
              <Text style={styles.errorText}>{errors.lastName.message}</Text>
            )}
          </View>
          <View style={styles.inputGroup}>
            <Controller
              control={control}
              name="dateOfBirth"
              render={({
                field: { onChange, value },
              }: {
                field: { onChange: (value: string) => void; value: string };
              }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Date of birth"
                  placeholderTextColor="#fff"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.dateOfBirth && (
              <Text style={styles.errorText}>{errors.dateOfBirth.message}</Text>
            )}
          </View>
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
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
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
                <TextInput
                  style={[styles.input, { paddingLeft: 36 }]}
                  placeholder="Password"
                  placeholderTextColor="#fff"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
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
              name="confirmPassword"
              render={({
                field: { onChange, value },
              }: {
                field: { onChange: (value: string) => void; value: string };
              }) => (
                <TextInput
                  style={[styles.input, { paddingLeft: 36 }]}
                  placeholder="Confirm password"
                  placeholderTextColor="#fff"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>
                {errors.confirmPassword.message}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace("/")}>
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Text style={styles.loginLink}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  card: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 24,
    padding: 24,
    margin: 30,
    marginTop: 100,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 24,
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 16,
    position: "relative",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 12,
    color: "#fff",
    fontSize: 16,
    width: "100%",
  },
  icon: {
    position: "absolute",
    left: 8,
    top: 12,
    zIndex: 1,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    marginTop: 4,
  },
  button: {
    backgroundColor: "#2176FF",
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 48,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  footerText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },
  loginLink: {
    color: "#2176FF",
    fontWeight: "bold",
  },
}); 