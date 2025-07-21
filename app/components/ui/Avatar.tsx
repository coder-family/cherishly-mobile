import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface AvatarProps {
  uri?: string;
  size?: number;
  style?: StyleProp<ImageStyle | ViewStyle>;
}

const Avatar: React.FC<AvatarProps> = ({ uri, size = 36, style }) => {
  const avatarSize = size;
  const borderRadius = size / 2;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          styles.avatar,
          { width: avatarSize, height: avatarSize, borderRadius },
          style as StyleProp<ImageStyle>,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        { width: avatarSize, height: avatarSize, borderRadius },
        style,
      ]}
    >
      <MaterialIcons name="person" size={avatarSize * 0.6} color="#ccc" />
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#f0f0f0',
  },
  placeholder: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Avatar; 