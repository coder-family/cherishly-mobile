import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import * as yup from 'yup';

const schema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  dob: yup.string().required('Date of birth is required'),
  email: yup.string().email('Email is invalid').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Confirm password is required'),
});

type RegisterForm = {
  firstName: string;
  dob: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Register() {
  const router = useRouter();
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      dob: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: RegisterForm) => {
    // TODO: Implement form submission logic
    console.log('Form is valid. Submit the data.', data);
  };

  return (
    <ImageBackground
      source={require('../../assets/images/backgroundMb.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Sign Up</Text>
          <Text style={styles.subtitle}>Welcome to Growing Together</Text>

          <View style={styles.inputGroup}>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, value } }: { field: { onChange: (value: string) => void; value: string } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="First name"
                  placeholderTextColor="#fff"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName.message}</Text>}
          </View>
          <View style={styles.inputGroup}>
            <Controller
              control={control}
              name="dob"
              render={({ field: { onChange, value } }: { field: { onChange: (value: string) => void; value: string } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Date of birth"
                  placeholderTextColor="#fff"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.dob && <Text style={styles.errorText}>{errors.dob.message}</Text>}
          </View>
          <View style={styles.inputGroup}>
            <Ionicons name="mail-outline" size={22} color="#fff" style={styles.icon} />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }: { field: { onChange: (value: string) => void; value: string } }) => (
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
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          </View>
          <View style={styles.inputGroup}>
            <Ionicons name="lock-closed-outline" size={22} color="#fff" style={styles.icon} />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }: { field: { onChange: (value: string) => void; value: string } }) => (
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
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          </View>
          <View style={styles.inputGroup}>
            <Ionicons name="lock-closed-outline" size={22} color="#fff" style={styles.icon} />
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }: { field: { onChange: (value: string) => void; value: string } }) => (
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
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/')}>
            <Text style={styles.footerText}>
              Already have an account? <Text style={styles.loginLink}>Login</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  card: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'rgba(30, 30, 30, 0.35)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    marginVertical: 32,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: 18,
    paddingHorizontal: 16,
    paddingLeft: 16,
  },
  icon: {
    position: 'absolute',
    left: 10,
    top: 13,
    zIndex: 1,
  },
  button: {
    backgroundColor: '#2176FF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  footerText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.9,
  },
  loginLink: {
    textDecorationLine: 'underline',
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
    alignSelf: 'flex-start',
  },
}); 