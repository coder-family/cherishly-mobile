import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';

interface FooterBarProps {
  onSettingsPress?: () => void;
}

export default function FooterBar({ onSettingsPress }: FooterBarProps) {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'card');
  const iconColor = useThemeColor({}, 'text');

  const handleSettingsPress = () => {
    if (onSettingsPress) {
      onSettingsPress();
    } else {
      // Default navigation to settings screen
      router.push('/settings');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor, borderTopColor: borderColor }]}>
      <View style={styles.content}>
        {/* Left side - can be used for other actions in the future */}
        <View style={styles.leftSection}>
          {/* Placeholder for future left-side content */}
        </View>

        {/* Right side - Settings button */}
        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleSettingsPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons 
              name="settings" 
              size={20} 
              color={iconColor} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    padding: 8,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});
