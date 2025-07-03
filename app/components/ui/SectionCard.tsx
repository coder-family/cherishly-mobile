import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, children }) => (
  <View style={styles.card}>
    {title && <Text style={styles.title}>{title}</Text>}
    <View>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default SectionCard;
