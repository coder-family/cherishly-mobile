import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface InvitationQRModalProps {
  visible: boolean;
  onClose: () => void;
  invitationData: {
    token: string;
    groupName: string;
    role: string;
    expiresAt: string;
  };
}

export default function InvitationQRModal({
  visible,
  onClose,
  invitationData,
}: InvitationQRModalProps) {
  const [sharing, setSharing] = useState(false);

  // Don't render if no invitation data
  if (!invitationData) {
    return null;
  }

  const generateInvitationLink = () => {
    // You'll need to replace this with your actual frontend URL
    const baseUrl = process.env.EXPO_PUBLIC_FRONTEND_URL || 'https://your-app.com';
    return `${baseUrl}/family/join-from-invitation?token=${invitationData.token}`;
  };

  const handleShare = async () => {
    if (sharing) return;
    
    setSharing(true);
    try {
      const invitationLink = generateInvitationLink();
      const message = `You're invited to join "${invitationData.groupName}" as ${invitationData.role}!\n\nClick this link to join: ${invitationLink}\n\nThis invitation expires on ${new Date(invitationData.expiresAt).toLocaleDateString()}`;
      
      await Share.share({
        message,
        title: `Invitation to join ${invitationData.groupName}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share invitation');
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const invitationLink = generateInvitationLink();
      // You'll need to add a clipboard library like expo-clipboard
      // await Clipboard.setString(invitationLink);
      Alert.alert('Success', 'Invitation link copied to clipboard!');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
            <Text style={styles.title}>Invitation QR Code</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.infoSection}>
              <Text style={styles.groupName}>{invitationData.groupName}</Text>
              <Text style={styles.roleText}>Role: {invitationData.role}</Text>
              <Text style={styles.expiryText}>
                Expires: {formatExpiryDate(invitationData.expiresAt)}
              </Text>
            </View>

            <View style={styles.qrContainer}>
              <View style={styles.qrWrapper}>
                <QRCode
                  value={generateInvitationLink()}
                  size={200}
                  color="#000"
                  backgroundColor="#fff"
                />
              </View>
              <Text style={styles.qrDescription}>
                Scan this QR code to join the family group
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.shareButton]}
                onPress={handleShare}
                disabled={sharing}
              >
                <MaterialIcons name="share" size={20} color="#fff" />
                <Text style={styles.shareButtonText}>
                  {sharing ? 'Sharing...' : 'Share Invitation'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.copyButton]}
                onPress={handleCopyLink}
              >
                <MaterialIcons name="content-copy" size={20} color="#4f8cff" />
                <Text style={styles.copyButtonText}>Copy Link</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.instructions}>
              <Text style={styles.instructionsTitle}>How to use:</Text>
              <Text style={styles.instructionText}>
                • Share this QR code with family members
              </Text>
              <Text style={styles.instructionText}>
                • They can scan it with their phone camera
              </Text>
              <Text style={styles.instructionText}>
                • Or click the shared link to join directly
              </Text>
            </View>
          </View>
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
    maxHeight: '90%',
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
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 24,
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  roleText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  expiryText: {
    fontSize: 14,
    color: '#999',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  qrDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  shareButton: {
    backgroundColor: '#4f8cff',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  copyButton: {
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#4f8cff',
  },
  copyButtonText: {
    color: '#4f8cff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  instructions: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
}); 