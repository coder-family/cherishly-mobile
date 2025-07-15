import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface FamilyGroupCardProps {
  name: string;
  avatarUrl?: string;
  description?: string;
  memberCount?: number;
  subtitle?: string;
}

const FamilyGroupCard: React.FC<FamilyGroupCardProps> = ({ 
  name, 
  avatarUrl, 
  description, 
  memberCount, 
  subtitle = "Family Group" 
}) => (
  <View style={styles.card}>
    {avatarUrl ? (
      <Image source={{ uri: avatarUrl }} style={styles.avatar} />
    ) : (
      <View style={styles.avatarPlaceholder}>
        <MaterialIcons name="family-restroom" size={32} color="#4f8cff" />
      </View>
    )}
    <View style={styles.info}>
      <Text style={styles.name}>{name}</Text>
      {/* <Text style={styles.subtitle}>{subtitle}</Text> */}
      {description && <Text style={styles.description}>{description}</Text>}
      {memberCount && memberCount > 0 && (
        <Text style={styles.memberCount}>
          {memberCount} {memberCount === 1 ? 'member' : 'members'}
        </Text>
      )}
    </View>
    <View style={styles.chevron}>
      <MaterialIcons name="chevron-right" size={24} color="#666" />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e7ff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  chevron: {
    marginLeft: 8,
  },
});

export default FamilyGroupCard; 