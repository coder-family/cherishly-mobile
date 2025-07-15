import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface ChildProfileCardProps {
  avatarUrl?: string;
  name: string;
  birthdate: string;
  bio?: string;
}

const ChildProfileCard: React.FC<ChildProfileCardProps> = ({ avatarUrl, name, birthdate, bio }) => (
  <View style={styles.card}>
    {avatarUrl && <Image source={{ uri: avatarUrl }} style={styles.avatar} />}
    <View style={styles.info}>
      <Text style={styles.name}>{name}</Text>
      {/* <Text style={styles.birthdate}>Born: {birthdate}</Text> */}
      {bio && <Text style={styles.bio}>{bio}</Text>}
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  birthdate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#444',
  },
});

export default ChildProfileCard; 