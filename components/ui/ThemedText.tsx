import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

interface ThemedTextProps extends TextProps {
  variant?: 'title' | 'subtitle' | 'body' | 'caption';
  children: React.ReactNode;
}

const ThemedText: React.FC<ThemedTextProps> = ({ variant = 'body', style, children, ...props }) => {
  return (
    <Text style={[styles[variant], style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#444',
  },
  body: {
    fontSize: 15,
    color: '#333',
  },
  caption: {
    fontSize: 12,
    color: '#888',
  },
});

export default ThemedText;
