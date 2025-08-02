import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface FamilyGroupPermissionsProps {
  currentGroup: any;
  currentUser: any;
}

export default function FamilyGroupPermissions({ 
  currentGroup, 
  currentUser 
}: FamilyGroupPermissionsProps) {
  const getUserRole = () => {
    if (!currentGroup?.members || !currentUser?.id) return 'Guest';
    
    const member = currentGroup.members.find((m: any) => 
      m.userId === currentUser.id || m.user?.id === currentUser.id
    );
    
    if (!member) return 'Guest';
    
    switch (member.role) {
      case 'owner':
        return 'Owner';
      case 'admin':
        return 'Admin';
      case 'member':
        return 'Member';
      default:
        return 'Member';
    }
  };

  const getUserPermissions = () => {
    const role = getUserRole();
    
    switch (role) {
      case 'Owner':
        return [
          'Edit group settings',
          'Add/remove members',
          'Manage invitations',
          'Delete group',
          'Add/remove children',
          'View all content'
        ];
      case 'Admin':
        return [
          'Edit group settings',
          'Add/remove members',
          'Manage invitations',
          'Add/remove children',
          'View all content'
        ];
      case 'Member':
        return [
          'View group content',
          'Add children (if owner)',
          'Participate in timeline'
        ];
      default:
        return ['View group content'];
    }
  };

  const role = getUserRole();
  const permissions = getUserPermissions();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Your Role & Permissions</Text>
      
      <View style={styles.roleCard}>
        <View style={styles.roleHeader}>
          <MaterialIcons 
            name={role === 'Owner' ? 'star' : role === 'Admin' ? 'security' : 'person'} 
            size={24} 
            color={role === 'Owner' ? '#ffd700' : role === 'Admin' ? '#4f8cff' : '#666'} 
          />
          <Text style={styles.roleText}>{role}</Text>
        </View>
        
        <Text style={styles.roleDescription}>
          {role === 'Owner' && 'You have full control over this family group'}
          {role === 'Admin' && 'You can manage group settings and members'}
          {role === 'Member' && 'You can view and participate in group activities'}
          {role === 'Guest' && 'You have limited access to this group'}
        </Text>
      </View>

      <View style={styles.permissionsCard}>
        <Text style={styles.permissionsTitle}>Your Permissions</Text>
        {permissions.map((permission, index) => (
          <View key={index} style={styles.permissionItem}>
            <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.permissionText}>{permission}</Text>
          </View>
        ))}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Group Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total Members:</Text>
          <Text style={styles.infoValue}>{currentGroup?.members?.length || 0}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Children:</Text>
          <Text style={styles.infoValue}>{currentGroup?.children?.length || 0}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Created:</Text>
          <Text style={styles.infoValue}>
            {currentGroup?.createdAt ? 
              new Date(currentGroup.createdAt).toLocaleDateString() : 
              'Unknown'
            }
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  roleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  permissionsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  permissionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
}); 