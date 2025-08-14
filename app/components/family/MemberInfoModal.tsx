import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Avatar from '../ui/Avatar';

interface MemberInfo {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  avatar?: string;
  role?: string;
  joinedAt?: string;
}

interface MemberInfoModalProps {
  visible: boolean;
  onClose: () => void;
  member: MemberInfo | null;
  onViewProfile?: () => void;
  onSendMessage?: () => void;
}

export default function MemberInfoModal({
  visible,
  onClose,
  member,
  onViewProfile,
  onSendMessage,
}: MemberInfoModalProps) {
  if (!member) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'parent':
        return 'Phụ huynh';
      case 'admin':
        return 'Quản trị viên';
      case 'member':
        return 'Thành viên';
      default:
        return role;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Thông tin thành viên</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Member Info */}
          <View style={styles.content}>
            {/* Avatar and Name */}
            <View style={styles.avatarSection}>
              <Avatar 
                uri={member.avatar}
                size={80}
                style={styles.avatar}
              />
              <Text style={styles.fullName}>
                {member.firstName} {member.lastName}
              </Text>
            </View>

            {/* Member Details */}
            <View style={styles.detailsSection}>
              {member.role && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="badge" size={20} color="#4f8cff" />
                  <Text style={styles.detailLabel}>Vai trò:</Text>
                  <Text style={styles.detailValue}>
                    {getRoleDisplayName(member.role)}
                  </Text>
                </View>
              )}

              {member.email && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="email" size={20} color="#4f8cff" />
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{member.email}</Text>
                </View>
              )}

              {member.joinedAt && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="event" size={20} color="#4f8cff" />
                  <Text style={styles.detailLabel}>Tham gia:</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(member.joinedAt)}
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {onViewProfile && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.primaryButton]}
                  onPress={onViewProfile}
                >
                  <MaterialIcons name="person" size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>Xem hồ sơ</Text>
                </TouchableOpacity>
              )}

              {onSendMessage && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.secondaryButton]}
                  onPress={onSendMessage}
                >
                  <MaterialIcons name="message" size={20} color="#4f8cff" />
                  <Text style={styles.secondaryButtonText}>Nhắn tin</Text>
                </TouchableOpacity>
              )}
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
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 20,
    maxWidth: 400,
    width: '100%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    marginBottom: 12,
  },
  fullName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 60,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#4f8cff',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#4f8cff',
  },
  secondaryButtonText: {
    color: '#4f8cff',
    fontSize: 14,
    fontWeight: '500',
  },
});
