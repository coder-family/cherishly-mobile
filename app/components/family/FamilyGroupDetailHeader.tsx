import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FamilyGroup {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  ownerId: string;
  members: any[];
  children?: any[];
  createdAt: string;
  updatedAt: string;
}

interface FamilyGroupDetailHeaderProps {
  currentGroup: FamilyGroup;
  onBackPress: () => void;
}

export default function FamilyGroupDetailHeader({ currentGroup, onBackPress }: FamilyGroupDetailHeaderProps) {
  return (
    <>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={onBackPress}
      >
        <MaterialIcons name="arrow-back" size={24} color="#4f8cff" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {currentGroup.avatarUrl ? (
            <Image
              source={{ uri: currentGroup.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialIcons
                name="family-restroom"
                size={48}
                color="#4f8cff"
              />
            </View>
          )}
        </View>
        
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>
            {currentGroup.name || "Unnamed Group"}
          </Text>
          {currentGroup.description && (
            <Text style={styles.description}>{currentGroup.description}</Text>
          )}
          
          <View style={styles.creatorInfo}>
            <MaterialIcons name="person" size={16} color="#666" />
            <Text style={styles.creatorText}>
              Created by: {currentGroup.ownerId ? currentGroup.ownerId.slice(-6) : 'Unknown'}
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4f8cff',
    marginLeft: 8,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupInfo: {
    alignItems: 'center',
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
}); 