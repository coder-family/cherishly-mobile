import React from 'react';
import { StyleSheet, Text } from 'react-native';

interface LabelTextProps {
  children: React.ReactNode;
  required?: boolean;
}

const LabelText: React.FC<LabelTextProps> = ({ children, required }) => (
  <Text style={styles.label}>
    {children}
    {required && <Text style={styles.required}> *</Text>}
  </Text>
);

const styles = StyleSheet.create({
  label: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  required: {
    color: '#e53935',
  },
});

export default LabelText;
