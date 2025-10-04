import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ErrorText from '../components/form/ErrorText';
import FormWrapper from '../components/form/FormWrapper';
import InputField from '../components/form/InputField';
import ScreenWithFooter from '../components/layout/ScreenWithFooter';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAppDispatch } from '../redux/hooks';
import { joinGroupFromInvitation } from '../redux/slices/familySlice';

export default function JoinFromInvitationScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const dispatch = useAppDispatch();
  
  // Get token from URL params
  const token = searchParams?.token as string;
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [invitationInfo, setInvitationInfo] = useState<{
    groupName: string;
    invitedBy: string;
    role: string;
  } | null>(null);

  // Validate token on component mount
  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setIsValidatingToken(false);
      setTokenValid(false);
    }
  }, [token, validateToken]);

  const validateToken = useCallback(async () => {
    if (!token || !/^[a-fA-F0-9]{32}$/.test(token)) {
      setIsValidatingToken(false);
      setTokenValid(false);
      return;
    }

    try {
      // You might want to add an API endpoint to validate token and get invitation info
      // For now, we'll assume the token is valid if it matches the format
      setTokenValid(true);
      setInvitationInfo({
        groupName: 'Family Group',
        invitedBy: 'A family member',
        role: 'parent',
      });
    } catch (error) {
      setTokenValid(false);
    } finally {
      setIsValidatingToken(false);
    }
  }, [token]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (birthDate >= today) {
        errors.dateOfBirth = 'Date of birth must be in the past';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(joinGroupFromInvitation({
        token,
        userData: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          password: formData.password,
          dateOfBirth: formData.dateOfBirth,
        },
      })).unwrap();

      Alert.alert(
        'Account Created!',
        'Your account has been created and you have successfully joined the family group.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/tabs/home'),
          },
        ]
      );
    } catch (err: any) {
      // Join group error handled silently
      Alert.alert(
        'Error',
        err.message || 'Failed to create account and join group. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (isValidatingToken) {
    return (
      <ScreenWithFooter>
        <View style={styles.loadingContainer}>
          <LoadingSpinner message="Validating invitation..." />
        </View>
      </ScreenWithFooter>
    );
  }

  if (!tokenValid) {
    return (
      <ScreenWithFooter>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Invalid Invitation</Text>
          <Text style={styles.errorMessage}>
            The invitation link is invalid or has expired. Please contact the person who sent you this invitation.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenWithFooter>
    );
  }

  return (
    <ScreenWithFooter>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView 
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FormWrapper>
            <View style={styles.header}>
              <Text style={styles.title}>Join Family Group</Text>
              <Text style={styles.subtitle}>
                Create your account to join the family group
              </Text>
            </View>

            {invitationInfo && (
              <View style={styles.invitationInfo}>
                <Text style={styles.invitationTitle}>Invitation Details</Text>
                <Text style={styles.invitationText}>
                  You&apos;ve been invited to join &quot;{invitationInfo.groupName}&quot; as {invitationInfo.role}
                </Text>
                <Text style={styles.invitationText}>
                  Invited by: {invitationInfo.invitedBy}
                </Text>
              </View>
            )}

            <View style={styles.formSection}>
              <Text style={styles.formTitle}>Create Your Account</Text>
              
              <View style={styles.inputSection}>
                <Text style={styles.sectionLabel}>First Name *</Text>
                <InputField
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  error={formErrors.firstName}
                  autoCapitalize="words"
                />
                {formErrors.firstName && <ErrorText>{formErrors.firstName}</ErrorText>}
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.sectionLabel}>Last Name *</Text>
                <InputField
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  error={formErrors.lastName}
                  autoCapitalize="words"
                />
                {formErrors.lastName && <ErrorText>{formErrors.lastName}</ErrorText>}
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.sectionLabel}>Password *</Text>
                <InputField
                  placeholder="Create a password"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  error={formErrors.password}
                  secureTextEntry
                />
                {formErrors.password && <ErrorText>{formErrors.password}</ErrorText>}
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.sectionLabel}>Confirm Password *</Text>
                <InputField
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  error={formErrors.confirmPassword}
                  secureTextEntry
                />
                {formErrors.confirmPassword && <ErrorText>{formErrors.confirmPassword}</ErrorText>}
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.sectionLabel}>Date of Birth *</Text>
                <InputField
                  placeholder="YYYY-MM-DD"
                  value={formData.dateOfBirth}
                  onChangeText={(value) => handleInputChange('dateOfBirth', value)}
                  error={formErrors.dateOfBirth}
                  keyboardType="numeric"
                />
                {formErrors.dateOfBirth && <ErrorText>{formErrors.dateOfBirth}</ErrorText>}
              </View>

              <View style={styles.buttonSection}>
                <TouchableOpacity
                  style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  <Text style={styles.primaryButtonText}>
                    {isSubmitting ? 'Creating Account...' : 'Create Account & Join Group'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </FormWrapper>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWithFooter>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: '#4f8cff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  invitationInfo: {
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  invitationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  invitationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  formSection: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputSection: {
    marginBottom: 20,
  },
  buttonSection: {
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: '#4f8cff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#ccc',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
}); 