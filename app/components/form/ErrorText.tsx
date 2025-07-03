import React from 'react';
import { StyleSheet, Text } from 'react-native';

interface ErrorTextProps {
  children: React.ReactNode;
}

const ErrorText: React.FC<ErrorTextProps> = ({ children }) => (
  <Text style={styles.error}>{children}</Text>
);

const styles = StyleSheet.create({
  error: {
    color: '#e53935',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 6,
  },
});

export default ErrorText;
