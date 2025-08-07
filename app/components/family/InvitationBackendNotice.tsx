import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface InvitationBackendNoticeProps {
  onDismiss?: () => void;
}

export default function InvitationBackendNotice({ onDismiss }: InvitationBackendNoticeProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="info" size={20} color="#4f8cff" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Backend Update Required</Text>
        <Text style={styles.message}>
          The backend needs to be updated to remove invitation expiration. 
          Until then, expired invitations cannot be accepted.
        </Text>
        <Text style={styles.solution}>
          Please ask the group owner to send a new invitation.
        </Text>
      </View>
      {onDismiss && (
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <MaterialIcons name="close" size={20} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#4f8cff',
  },
  iconContainer: {
    marginRight: 8,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  message: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    lineHeight: 16,
  },
  solution: {
    fontSize: 12,
    color: '#4f8cff',
    fontWeight: '600',
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
}); 