import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ErrorBoxProps {
  error: string;
  onDismiss: () => void;
  style?: any;
}

const ErrorBox: React.FC<ErrorBoxProps> = ({ error, onDismiss, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.errorText}>⚠️ {error}</Text>
      <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
        <Ionicons name="close" size={16} color="#e53935" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e53935',
  },
  errorText: {
    flex: 1,
    color: '#e53935',
    fontSize: 14,
  },
  closeButton: {
    padding: 4,
  },
});

export default ErrorBox; 