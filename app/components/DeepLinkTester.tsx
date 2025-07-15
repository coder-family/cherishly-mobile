import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { deepLinkPatterns, linkingUtils } from '../utils/linkingUtils';

interface DeepLinkTesterProps {
  visible?: boolean;
}

export default function DeepLinkTester({ visible = false }: DeepLinkTesterProps) {
  if (!visible) return null;

  const testLinks = [
    { name: 'Login', url: deepLinkPatterns.login() },
    { name: 'Register', url: deepLinkPatterns.register() },
    { name: 'Home', url: deepLinkPatterns.home() },
    { name: 'Profile', url: deepLinkPatterns.profile() },
    { name: 'Reset Password', url: deepLinkPatterns.resetPassword('test-token-123') },
    { name: 'Child Profile', url: deepLinkPatterns.childProfile('child-123') },
    { name: 'Memory', url: deepLinkPatterns.memory('memory-456') },
    { name: 'Health Record', url: deepLinkPatterns.healthRecord('health-789') },
  ];

  const handleTestLink = async (url: string, name: string) => {
    
    const canOpen = await linkingUtils.canOpenURL(url);
    if (canOpen) {
      await linkingUtils.openURL(url);
    } else {
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deep Link Tester</Text>
      <Text style={styles.subtitle}>Tap to test deep links</Text>
      
      <ScrollView style={styles.scrollView}>
        {testLinks.map((link, index) => (
          <TouchableOpacity
            key={index}
            style={styles.linkButton}
            onPress={() => handleTestLink(link.url, link.name)}
          >
            <Text style={styles.linkName}>{link.name}</Text>
            <Text style={styles.linkUrl}>{link.url}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 300,
    maxHeight: 400,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 10,
    padding: 15,
    zIndex: 1000,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    color: 'white',
    fontSize: 12,
    marginBottom: 15,
    opacity: 0.8,
  },
  scrollView: {
    maxHeight: 300,
  },
  linkButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  linkName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  linkUrl: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    marginTop: 2,
  },
}); 