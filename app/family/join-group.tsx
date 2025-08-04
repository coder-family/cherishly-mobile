import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MyInvitationsSection from '../components/family/MyInvitationsSection';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { getMyPendingInvitations } from '../redux/slices/familySlice';

export default function JoinGroupScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { myInvitations, loading } = useAppSelector((state) => state.family);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [token, setToken] = useState('');

  const fetchMyInvitations = useCallback(async () => {
    try {
      await dispatch(getMyPendingInvitations()).unwrap();
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchMyInvitations();
  }, [fetchMyInvitations]);

  const handleJoinWithToken = () => {
    if (!token.trim()) {
      Alert.alert('Error', 'Please enter an invitation token');
      return;
    }

    if (!/^[a-fA-F0-9]{32}$/.test(token.trim())) {
      Alert.alert('Error', 'Invalid invitation token format');
      return;
    }

    // Navigate to join from invitation screen
    router.push(`/family/join-from-invitation?token=${token.trim()}`);
  };

  const handleLearnHowToInvite = () => {
    Alert.alert(
      'How to Invite Others',
      'To invite someone to your family group:\n\n1. Go to your family group\n2. Tap "Invite Members"\n3. Enter their email address\n4. Choose their role (parent/admin)\n5. Send the invitation\n\nThey will receive an email with a link to join.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Join Family Group</Text>
          <Text style={styles.subtitle}>
            Accept an invitation to join a family group, or learn how to invite others.
          </Text>
        </View>

        {/* Pending Invitations Section */}
        <MyInvitationsSection />

        {/* Join with Token Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Join with Invitation Token</Text>
          <Text style={styles.sectionDescription}>
            If you have an invitation token, enter it below to join a family group.
          </Text>

          <View style={styles.tokenInputContainer}>
            <Text style={styles.inputLabel}>Invitation Token *</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.tokenInput}
                placeholder="Enter 32-character invitation token"
                value={token}
                onChangeText={setToken}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={32}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, !token.trim() && styles.disabledButton]}
            onPress={handleJoinWithToken}
            disabled={!token.trim()}
          >
            <Text style={styles.primaryButtonText}>Accept Invitation</Text>
          </TouchableOpacity>
        </View>

        {/* Learn How to Invite Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Create New Group</Text>
          <Text style={styles.sectionDescription}>
            Create a new family group to start sharing memories with your family.
          </Text>

          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/family/create')}
          >
            <MaterialIcons name="add-circle" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Create Family Group</Text>
          </TouchableOpacity>
        </View>

        {/* Learn How to Invite Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invite Others</Text>
          <Text style={styles.sectionDescription}>
            Learn how to invite family members to your group.
          </Text>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleLearnHowToInvite}
          >
            <MaterialIcons name="help-outline" size={20} color="#4f8cff" />
            <Text style={styles.secondaryButtonText}>How to Invite</Text>
          </TouchableOpacity>
        </View>

        {/* Back to Home */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  tokenInputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  tokenInput: {
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  primaryButton: {
    backgroundColor: '#4f8cff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f7ff',
  },
  secondaryButtonText: {
    color: '#4f8cff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  backButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#10b981',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 