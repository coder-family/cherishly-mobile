import React from 'react';
import { StyleSheet, View } from 'react-native';
import FooterBar from './FooterBar';

interface ScreenWithFooterProps {
  children: React.ReactNode;
  onSettingsPress?: () => void;
  showFooter?: boolean;
}

export default function ScreenWithFooter({ 
  children, 
  onSettingsPress, 
  showFooter = true 
}: ScreenWithFooterProps) {
  return (
    <View style={styles.container}>
      {/* Main content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Footer bar */}
      {showFooter && (
        <FooterBar onSettingsPress={onSettingsPress} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
