import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, icon }) => (
  <View style={styles.container}>
    {icon && <View style={styles.icon}>{icon}</View>}
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  icon: {
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});

export default EmptyState;
