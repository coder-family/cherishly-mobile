import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAppDispatch } from '../../redux/hooks';
import { inviteToFamilyGroup } from '../../redux/slices/familySlice';
import ErrorText from '../form/ErrorText';
import InputField from '../form/InputField';
import LoadingSpinner from '../ui/LoadingSpinner';

interface InviteMemberModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
}

export default function InviteMemberModal({
  visible,
  onClose,
  groupId,
  groupName,
}: InviteMemberModalProps) {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'parent' | 'admin'>('parent');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInvite = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await dispatch(inviteToFamilyGroup({
        groupId,
        email: email.trim(),
        role,
      })).unwrap();

      Alert.alert(
        'Invitation Sent!',
        `An invitation has been sent to ${email.trim()} to join "${groupName}" as ${role}.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setEmail('');
              setRole('parent');
              onClose();
            },
          },
        ]
      );
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setEmail('');
      setRole('parent');
      setError('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Invite Member</Text>
              <Text style={styles.subtitle}>
                Send an invitation to join "{groupName}"
              </Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Email Address *</Text>
              <InputField
                placeholder="Enter email address"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  if (error) setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {error && <ErrorText>{error}</ErrorText>}
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Role *</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === 'parent' && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole('parent')}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      role === 'parent' && styles.roleButtonTextActive,
                    ]}
                  >
                    Parent
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === 'admin' && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole('admin')}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      role === 'admin' && styles.roleButtonTextActive,
                    ]}
                  >
                    Admin
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.roleDescription}>
                {role === 'admin'
                  ? 'Admins can manage the group, invite members, and have full access.'
                  : 'Parents can view and contribute to the family group content.'}
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.inviteButton,
                  isSubmitting && styles.disabledButton,
                ]}
                onPress={handleInvite}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <Text style={styles.inviteButtonText}>Send Invitation</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
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
  formSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: '#4f8cff',
    backgroundColor: '#4f8cff',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  inviteButton: {
    backgroundColor: '#4f8cff',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
}); 