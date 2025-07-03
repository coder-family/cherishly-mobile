import React from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';

interface ScreenWrapperProps {
  children: React.ReactNode;
  backgroundColor?: string;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, backgroundColor = '#f5f6fa' }) => (
  <SafeAreaView style={[styles.safe, { backgroundColor }]}> 
    <View style={styles.statusBar} />
    <View style={styles.container}>{children}</View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  statusBar: {
    height: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    padding: 16,
  },
});

export default ScreenWrapper;
