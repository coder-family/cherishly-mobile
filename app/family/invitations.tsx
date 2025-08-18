import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import InvitationQRModal from '../components/family/InvitationQRModal';
import InvitationStats from '../components/family/InvitationStats';
import PendingInvitationsModal from '../components/family/PendingInvitationsModal';
import ScreenWithFooter from '../components/layout/ScreenWithFooter';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import * as familyService from '../services/familyService';

export default function InvitationsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentGroup } = useAppSelector((state) => state.family);
  
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalInvitations: 0,
    pendingInvitations: 0,
    acceptedInvitations: 0,
    expiredInvitations: 0,
  });
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [invitationData, setInvitationData] = useState<{
    token: string;
    groupName: string;
    role: string;
    expiresAt: string;
  } | null>(null);

  useEffect(() => {
    if (currentGroup?.id) {
      fetchInvitationStats();
    }
  }, [currentGroup?.id]);

  const fetchInvitationStats = async () => {
    if (!currentGroup?.id) return;
    
    setLoading(true);
    try {
      const response = await familyService.getInvitationStats(currentGroup.id);
      setStats(response.stats || {
        totalInvitations: 0,
        pendingInvitations: 0,
        acceptedInvitations: 0,
        expiredInvitations: 0,
      });
    } catch (error) {
      console.error('Error fetching invitation stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvitation = () => {
    if (!currentGroup) {
      Alert.alert('Error', 'No family group selected');
      return;
    }
    router.push(`/family/${currentGroup.id}`);
  };

  const handleViewPending = () => {
    if (!currentGroup) {
      Alert.alert('Error', 'No family group selected');
      return;
    }
    setShowPendingModal(true);
  };

  const handleShowQR = () => {
    if (!currentGroup) {
      Alert.alert('Error', 'No family group selected');
      return;
    }
    
    // For demo purposes, create mock invitation data
    setInvitationData({
      token: 'demo123456789012345678901234567890',
      groupName: currentGroup.name,
      role: 'parent',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
    setShowQRModal(true);
  };

  if (loading) {
    return (
      <ScreenWithFooter>
        <LoadingSpinner message="Loading invitation statistics..." />
      </ScreenWithFooter>
    );
  }

  return (
    <ScreenWithFooter>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Invitation Management</Text>
          <Text style={styles.subtitle}>
            Manage invitations for your family groups
          </Text>
        </View>

        {currentGroup ? (
          <>
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{currentGroup.name}</Text>
              <Text style={styles.groupDescription}>
                Managing invitations for this family group
              </Text>
            </View>

            <InvitationStats
              totalInvitations={stats.totalInvitations}
              pendingInvitations={stats.pendingInvitations}
              acceptedInvitations={stats.acceptedInvitations}
              expiredInvitations={stats.expiredInvitations}
            />

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={handleCreateInvitation}
              >
                <MaterialIcons name="person-add" size={24} color="#4f8cff" />
                <Text style={styles.actionTitle}>Send New Invitation</Text>
                <Text style={styles.actionDescription}>
                  Invite someone to join your family group
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={handleViewPending}
              >
                <MaterialIcons name="email" size={24} color="#f59e0b" />
                <Text style={styles.actionTitle}>View Pending ({stats.pendingInvitations})</Text>
                <Text style={styles.actionDescription}>
                  Manage invitations that haven&apos;t been accepted yet
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={handleShowQR}
              >
                <MaterialIcons name="qr-code" size={24} color="#10b981" />
                <Text style={styles.actionTitle}>Generate QR Code</Text>
                <Text style={styles.actionDescription}>
                  Create a QR code for easy sharing
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.noGroupContainer}>
            <MaterialIcons name="group" size={48} color="#ccc" />
            <Text style={styles.noGroupText}>No Family Group Selected</Text>
            <Text style={styles.noGroupDescription}>
              Please select a family group to manage invitations
            </Text>
            <TouchableOpacity
              style={styles.selectGroupButton}
              onPress={() => router.push('/tabs/home')}
            >
              <Text style={styles.selectGroupButtonText}>Go to Home</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About Invitations</Text>
          <Text style={styles.infoText}>
            • Invitations expire after 24 hours
          </Text>
          <Text style={styles.infoText}>
            • You can resend expired invitations
          </Text>
          <Text style={styles.infoText}>
            • QR codes make sharing easier
          </Text>
          <Text style={styles.infoText}>
            • Track invitation status in real-time
          </Text>
        </View>
      </ScrollView>

      <PendingInvitationsModal
        visible={showPendingModal}
        onClose={() => setShowPendingModal(false)}
        groupId={currentGroup?.id || ''}
        groupName={currentGroup?.name || ''}
      />

      {invitationData && (
        <InvitationQRModal
          visible={showQRModal}
          onClose={() => setShowQRModal(false)}
          invitationData={invitationData}
        />
      )}
    </ScreenWithFooter>
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
  groupInfo: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionsContainer: {
    padding: 20,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 12,
    marginBottom: 8,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  noGroupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noGroupText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  noGroupDescription: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  selectGroupButton: {
    backgroundColor: '#4f8cff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  selectGroupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
}); 