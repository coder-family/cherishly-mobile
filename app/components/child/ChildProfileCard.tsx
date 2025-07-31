import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface ChildProfileCardProps {
  avatarUrl?: string;
  name: string;
  birthdate: string;
}

const ChildProfileCard: React.FC<ChildProfileCardProps> = ({ avatarUrl, name, birthdate: _birthdate }) => {
  // Format birthdate to readable format
  const formatBirthdate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      // Fallback to original string if parsing fails
      return dateString;
    }
  };

  // Calculate age
  const calculateAge = (dateString: string) => {
    try {
      const birthDate = new Date(dateString);
      const today = new Date();
      
      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      
      if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
        years--;
        months += 12;
      }
      
      if (years > 0) {
        return `${years} year${years > 1 ? 's' : ''} old`;
      } else if (months > 0) {
        return `${months} month${months > 1 ? 's' : ''} old`;
      } else {
        const days = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
        return `${days} day${days > 1 ? 's' : ''} old`;
      }
    } catch (error) {
      return '';
    }
  };

  const formattedBirthdate = formatBirthdate(_birthdate);
  const age = calculateAge(_birthdate);

  return (
    <View style={styles.container}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <MaterialIcons name="person" size={24} color="#ccc" />
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.birthdate}>{formattedBirthdate}</Text>
        {age && <Text style={styles.age}>{age}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 2,
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
    marginRight: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  age: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
});

export default ChildProfileCard; 