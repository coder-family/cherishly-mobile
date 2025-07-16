import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AvatarUpload from '../media/AvatarUpload';

interface UserProfileCardProps {
  userId: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  onEditPress: () => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  userId,
  firstName,
  lastName,
  avatar,
  onEditPress,
}) => {
  const displayName = `${firstName || ''} ${lastName || ''}`.trim() || 'User';

  return (
    <View style={styles.profileCard}>
      <View style={styles.profileInfo}>
        <AvatarUpload
          userId={userId}
          initialUri={avatar}
          onAvatarPicked={() => {}}
        />
        <View style={styles.nameContainer}>
          <Text style={styles.profileName}>{displayName}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
        <MaterialIcons name="edit" size={20} color="#4f8cff" />
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    width: '100%',
    backgroundColor: '#eaf0fb',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nameContainer: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  editButtonText: {
    color: '#4f8cff',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 15,
  },
});

export default UserProfileCard; 