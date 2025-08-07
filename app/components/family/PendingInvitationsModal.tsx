import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import * as familyService from '../../services/familyService';
import { formatDate } from '../../utils/dateUtils';
import LoadingSpinner from '../ui/LoadingSpinner';

interface PendingInvitation {
  _id: string;
  email: string;
  role: string;
  createdAt?: string;
  expiresAt?: string;
  sentAt?: string;
}

interface PendingInvitationsModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
}

export default function PendingInvitationsModal({
  visible,
  onClose,
  groupId,
  groupName,
}: PendingInvitationsModalProps) {
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPendingInvitations = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      // You'll need to add this API endpoint to your backend
      const response = await familyService.getPendingInvitations(groupId);
      setInvitations(response.invitations || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pending invitations');
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (visible) {
      fetchPendingInvitations();
    }
  }, [visible, groupId, fetchPendingInvitations]);

  const handleCancelInvitation = async (invitationId: string) => {
    Alert.alert(
      'Cancel Invitation',
      'Are you sure you want to cancel this invitation?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await familyService.cancelInvitation(groupId, invitationId);
              // Refresh the list
              fetchPendingInvitations();
              Alert.alert('Success', 'Invitation cancelled successfully');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to cancel invitation');
            }
          },
        },
      ]
    );
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      await familyService.resendInvitation(groupId, invitationId);
      Alert.alert('Success', 'Invitation resent successfully');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to resend invitation');
    }
  };

  const renderInvitationItem = ({ item }: { item: PendingInvitation }) => {
    return (
      <View style={styles.invitationItem}>
        <View style={styles.invitationInfo}>
          <View style={styles.emailContainer}>
            <MaterialIcons name="email" size={16} color="#666" />
            <Text style={styles.emailText}>{item.email}</Text>
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.roleText}>Role: {item.role}</Text>
            <Text style={styles.dateText}>
              Sent: {item.sentAt ? formatDate(item.sentAt) : item.createdAt ? formatDate(item.createdAt) : 'Date not available'}
            </Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleResendInvitation(item._id)}
          >
            <MaterialIcons name="refresh" size={16} color="#4f8cff" />
            <Text style={styles.actionButtonText}>Resend</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancelInvitation(item._id)}
          >
            <MaterialIcons name="cancel" size={16} color="#dc2626" />
            <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Pending Invitations</Text>
            <Text style={styles.subtitle}>
              Invitations sent for &quot;{groupName}&quot;
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <LoadingSpinner message="Loading invitations..." />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchPendingInvitations}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : invitations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="email" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No pending invitations</Text>
              <Text style={styles.emptySubtext}>
                All invitations have been accepted or expired
              </Text>
            </View>
          ) : (
            <FlatList
              data={invitations}
              renderItem={renderInvitationItem}
              keyExtractor={(item) => item._id}
              style={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}
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
    maxWidth: 500,
    maxHeight: '80%',
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4f8cff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  invitationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  invitationInfo: {
    marginBottom: 12,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  detailsContainer: {
    marginLeft: 24,
  },
  roleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f0f7ff',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#4f8cff',
    fontWeight: '600',
    marginLeft: 4,
  },
  cancelButton: {
    backgroundColor: '#fef2f2',
  },
  cancelButtonText: {
    color: '#dc2626',
  },
}); 