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
import { joinFamilyGroup } from '../redux/slices/familySlice';
import * as familyService from '../services/familyService';

export default function InviteJoinScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.family);

  // Form state
  const [activeTab, setActiveTab] = useState<'join' | 'invite'>('join');
  const [joinForm, setJoinForm] = useState({
    groupId: '',
    inviteCode: '',
  });
  const [inviteForm, setInviteForm] = useState({
    groupId: '',
    email: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation for join form
  const validateJoinForm = () => {
    const errors: Record<string, string> = {};
    
    if (!joinForm.groupId.trim()) {
      errors.groupId = 'Family Group ID is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validation for invite form
  const validateInviteForm = () => {
    const errors: Record<string, string> = {};
    
    if (!inviteForm.groupId.trim()) {
      errors.groupId = 'Family Group ID is required';
    }

    if (!inviteForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(inviteForm.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle joining a family group
  const handleJoinGroup = async () => {
    if (!validateJoinForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await dispatch(joinFamilyGroup({
        groupId: joinForm.groupId.trim(),
        inviteCode: joinForm.inviteCode.trim() || undefined,
      })).unwrap();
      
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
      console.error('Error joining family group:', err);
      Alert.alert(
        'Error',
        err.message || 'Failed to join family group. Please check the Group ID and invite code.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle inviting someone to a family group
  const handleInviteToGroup = async () => {
    if (!validateInviteForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await familyService.inviteToFamilyGroup(
        inviteForm.groupId.trim(),
        inviteForm.email.trim()
      );
      
      Alert.alert(
        'Invitation Sent!',
        `An invitation has been sent to ${inviteForm.email}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setInviteForm({ groupId: '', email: '' });
            }
          }
        ]
      );
    } catch (err: any) {
      console.error('Error sending invitation:', err);
      Alert.alert(
        'Error',
        err.message || 'Failed to send invitation. Please try again.'
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

  const handleInviteInputChange = (field: string, value: string) => {
    setInviteForm(prev => ({ ...prev, [field]: value }));
    
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
              <Text style={styles.title}>Family Groups</Text>
              <Text style={styles.subtitle}>
                Join an existing family group or invite someone to yours.
              </Text>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'join' && styles.activeTab]}
                onPress={() => setActiveTab('join')}
              >
                <Text style={[styles.tabText, activeTab === 'join' && styles.activeTabText]}>
                  Join Group
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'invite' && styles.activeTab]}
                onPress={() => setActiveTab('invite')}
              >
                <Text style={[styles.tabText, activeTab === 'invite' && styles.activeTabText]}>
                  Invite Others
                </Text>
              </TouchableOpacity>
            </View>

            {/* Join Group Form */}
            {activeTab === 'join' && (
              <View style={styles.formSection}>
                <Text style={styles.formTitle}>Join a Family Group</Text>
                <Text style={styles.formDescription}>
                  Enter the Group ID you received from a family member.
                </Text>

                <View style={styles.inputSection}>
                  <Text style={styles.sectionLabel}>Group ID *</Text>
                  <InputField
                    placeholder="Enter Family Group ID"
                    value={joinForm.groupId}
                    onChangeText={(value) => handleJoinInputChange('groupId', value)}
                    error={formErrors.groupId}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {formErrors.groupId && <ErrorText>{formErrors.groupId}</ErrorText>}
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.sectionLabel}>Invite Code (Optional)</Text>
                  <InputField
                    placeholder="Enter invite code if provided"
                    value={joinForm.inviteCode}
                    onChangeText={(value) => handleJoinInputChange('inviteCode', value)}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.buttonSection}>
                  <TouchableOpacity
                    style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
                    onPress={handleJoinGroup}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.primaryButtonText}>
                      {isSubmitting ? 'Joining...' : 'Join Group'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Invite Form */}
            {activeTab === 'invite' && (
              <View style={styles.formSection}>
                <Text style={styles.formTitle}>Invite Someone</Text>
                <Text style={styles.formDescription}>
                  Send an invitation to join one of your family groups.
                </Text>

                <View style={styles.inputSection}>
                  <Text style={styles.sectionLabel}>Group ID *</Text>
                  <InputField
                    placeholder="Enter your Family Group ID"
                    value={inviteForm.groupId}
                    onChangeText={(value) => handleInviteInputChange('groupId', value)}
                    error={formErrors.groupId}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {formErrors.groupId && <ErrorText>{formErrors.groupId}</ErrorText>}
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.sectionLabel}>Email Address *</Text>
                  <InputField
                    placeholder="Enter email address"
                    value={inviteForm.email}
                    onChangeText={(value) => handleInviteInputChange('email', value)}
                    error={formErrors.email}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                  />
                  {formErrors.email && <ErrorText>{formErrors.email}</ErrorText>}
                </View>

                <View style={styles.buttonSection}>
                  <TouchableOpacity
                    style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
                    onPress={handleInviteToGroup}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.primaryButtonText}>
                      {isSubmitting ? 'Sending...' : 'Send Invitation'}
                    </Text>
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
}); 