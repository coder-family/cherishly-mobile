import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import ScreenWrapper from '../components/layout/ScreenWrapper';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { acceptInvitation } from '../redux/slices/familySlice';

export default function InviteJoinScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.family);

  // Form state
  const [activeTab, setActiveTab] = useState<'join' | 'invite'>('join');
  const [joinForm, setJoinForm] = useState({
    token: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation for join form
  const validateJoinForm = () => {
    const errors: Record<string, string> = {};
    
    if (!joinForm.token.trim()) {
      errors.token = 'Invitation token is required';
    } else if (!/^[a-fA-F0-9]{32}$/.test(joinForm.token.trim())) {
      errors.token = 'Invalid invitation token format';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle accepting an invitation
  const handleAcceptInvitation = async () => {
    if (!validateJoinForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(acceptInvitation(joinForm.token.trim())).unwrap();
      
      Alert.alert(
        'Success!',
        'You have successfully joined the family group.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      Alert.alert(
        'Error',
        err.message || 'Failed to accept invitation. Please check the token and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleJoinInputChange = (field: string, value: string) => {
    setJoinForm(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading && !isSubmitting) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <ScreenWrapper>
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
                Accept an invitation to join a family group, or learn how to invite others.
              </Text>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'join' && styles.activeTab]}
                onPress={() => setActiveTab('join')}
              >
                <Text style={[styles.tabText, activeTab === 'join' && styles.activeTabText]}>
                  Accept Invitation
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'invite' && styles.activeTab]}
                onPress={() => setActiveTab('invite')}
              >
                <Text style={[styles.tabText, activeTab === 'invite' && styles.activeTabText]}>
                  How to Invite
                </Text>
              </TouchableOpacity>
            </View>

            {/* Accept Invitation Form */}
            {activeTab === 'join' && (
              <View style={styles.formSection}>
                <Text style={styles.formTitle}>Accept Family Group Invitation</Text>
                <Text style={styles.formDescription}>
                  Enter the invitation token you received via email.
                </Text>

                <View style={styles.inputSection}>
                  <Text style={styles.sectionLabel}>Invitation Token *</Text>
                  <InputField
                    placeholder="Enter 32-character invitation token"
                    value={joinForm.token}
                    onChangeText={(value) => handleJoinInputChange('token', value)}
                    error={formErrors.token}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {formErrors.token && <ErrorText>{formErrors.token}</ErrorText>}
                </View>

                <View style={styles.buttonSection}>
                  <TouchableOpacity
                    style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
                    onPress={handleAcceptInvitation}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.primaryButtonText}>
                      {isSubmitting ? 'Accepting...' : 'Accept Invitation'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* How to Invite Form */}
            {activeTab === 'invite' && (
              <View style={styles.formSection}>
                <Text style={styles.formTitle}>How to Invite Members</Text>
                <Text style={styles.formDescription}>
                  To invite someone to your family group, follow these steps:
                </Text>

                <View style={styles.instructionsContainer}>
                  <View style={styles.instructionStep}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>1</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Go to your Family Group</Text>
                      <Text style={styles.stepDescription}>
                        Navigate to the family group you want to invite someone to.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.instructionStep}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>2</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Open the Members tab</Text>
                      <Text style={styles.stepDescription}>
                        Tap on the "Members" tab in the group details.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.instructionStep}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>3</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Click "Invite" button</Text>
                      <Text style={styles.stepDescription}>
                        Tap the "Invite" button to send an invitation.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.instructionStep}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>4</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Enter email and role</Text>
                      <Text style={styles.stepDescription}>
                        Enter the person's email and choose their role (Parent or Admin).
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoTitle}>💡 Tips:</Text>
                  <Text style={styles.infoText}>
                    • You can also generate a QR code for easy sharing
                  </Text>
                  <Text style={styles.infoText}>
                    • Check "Pending" to see invitations that haven't been accepted
                  </Text>
                  <Text style={styles.infoText}>
                    • Invitations expire after 24 hours
                  </Text>
                </View>

                <View style={styles.buttonSection}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => router.push("/tabs/home")}
                  >
                    <Text style={styles.secondaryButtonText}>Go to Home</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Back to Home</Text>
            </TouchableOpacity>

            {/* General Error Display */}
            {error && (
              <View style={styles.errorSection}>
                <ErrorText>{error}</ErrorText>
              </View>
            )}
          </FormWrapper>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#4f8cff',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  formSection: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
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
  errorSection: {
    marginTop: 16,
  },
  instructionsContainer: {
    marginBottom: 20,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4f8cff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  secondaryButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
}); 