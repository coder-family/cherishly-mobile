import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { declineInvitation, fetchFamilyGroups, getMyPendingInvitations } from '../../redux/slices/familySlice';
import * as familyService from '../../services/familyService';
import { formatDate } from '../../utils/dateUtils';
import LoadingSpinner from '../ui/LoadingSpinner';
import InvitationBackendNotice from './InvitationBackendNotice';

export default function MyInvitationsSection() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { myInvitations, loading } = useAppSelector((state) => state.family);
  const [showBackendNotice, setShowBackendNotice] = useState(false);

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

  const handleAccept = async (invitation: any) => {
    Alert.alert(
      'Accept Invitation',
      `Accept invitation to join "${invitation.groupName}" as ${invitation.role}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              if (invitation.token) {
                // Accept invitation directly using the token
                await familyService.acceptInvitation(invitation.token);
                
                // Refresh both invitations and family groups
                await Promise.all([
                  fetchMyInvitations(),
                  dispatch(fetchFamilyGroups()).unwrap()
                ]);
                
                Alert.alert(
                  'Success',
                  `You have successfully joined "${invitation.groupName}"!`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Navigate to the family group
                        router.push(`/family/${invitation.groupId}`);
                      },
                    },
                  ]
                );
              } else {
                Alert.alert(
                  'Accept Invitation',
                  'Please use the invitation link from your email to accept this invitation.',
                  [{ text: 'OK' }]
                );
              }
            } catch (error: any) {
              console.error('Error accepting invitation:', error);
              
              // Check if this is a backend expiration error
              if (error.message && error.message.includes('expired')) {
                setShowBackendNotice(true);
              }
              
              // Handle specific error cases
              let errorMessage = 'Failed to accept invitation';
              if (error.message) {
                if (error.message.includes('expired')) {
                  errorMessage = 'This invitation has expired. Please ask the group owner to send a new invitation.';
                } else if (error.message.includes('invalid')) {
                  errorMessage = 'This invitation is invalid. Please ask the group owner to send a new invitation.';
                } else if (error.message.includes('already')) {
                  errorMessage = 'You have already joined this family group.';
                } else {
                  errorMessage = error.message;
                }
              }
              
              Alert.alert(
                'Error',
                errorMessage,
                [
                  { text: 'OK' },
                  {
                    text: 'Retry',
                    onPress: () => handleAccept(invitation)
                  }
                ]
              );
            }
          },
        },
      ]
    );
  };

  const handleDecline = async (invitation: any) => {
    Alert.alert(
      'Decline Invitation',
      `Are you sure you want to decline the invitation to join "${invitation.groupName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(declineInvitation(invitation.token)).unwrap();
              // Refresh the list after declining
              fetchMyInvitations();
              Alert.alert('Success', 'Invitation declined successfully');
            } catch (error: any) {
              console.error('Error declining invitation:', error);
              
              // Handle specific error cases
              let errorMessage = 'Failed to decline invitation';
              if (error.message) {
                if (error.message.includes('not found')) {
                  errorMessage = 'This invitation no longer exists.';
                } else if (error.message.includes('permission')) {
                  errorMessage = 'You do not have permission to decline this invitation.';
                } else {
                  errorMessage = error.message;
                }
              }
              
              Alert.alert(
                'Error',
                errorMessage,
                [
                  { text: 'OK' },
                  {
                    text: 'Retry',
                    onPress: () => handleDecline(invitation)
                  }
                ]
              );
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading invitations..." />;
  }

  if (!myInvitations || myInvitations.length === 0) {
    return null; // Don't show anything if no invitations
  }

  // Filter only pending invitations
  const pendingInvitations = myInvitations.filter(inv => inv.status === 'pending');

  if (pendingInvitations.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {showBackendNotice && (
        <InvitationBackendNotice 
          onDismiss={() => setShowBackendNotice(false)}
        />
      )}
      <View style={styles.header}>
        <MaterialIcons name="email" size={20} color="#4f8cff" />
        <Text style={styles.title}>Pending Invitations</Text>
        <Text style={styles.count}>({pendingInvitations.length})</Text>
      </View>

      {pendingInvitations.map((invitation) => (
        <View key={invitation._id} style={styles.invitationCard}>
          <View style={styles.invitationHeader}>
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{invitation.groupName}</Text>
              <Text style={styles.invitedBy}>Invited by: {invitation.invitedBy}</Text>
              <Text style={styles.role}>Role: {invitation.role}</Text>
              <Text style={styles.sentDate}>
                Sent: {invitation.sentAt ? formatDate(invitation.sentAt) : (invitation.createdAt || invitation.expiresAt) ? formatDate(invitation.createdAt || invitation.expiresAt || '') : 'Date not available'}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAccept(invitation)}
            >
              <MaterialIcons name="check" size={16} color="#fff" />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => handleDecline(invitation)}
            >
              <MaterialIcons name="close" size={16} color="#dc2626" />
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  count: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  invitationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  invitationHeader: {
    marginBottom: 12,
  },
  groupInfo: {
    marginBottom: 8,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  invitedBy: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  role: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  sentDate: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  declineButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  declineButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
}); 