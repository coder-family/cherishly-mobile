import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

export type IconActionButtonProps = {
  onPress: () => void;
  accessibilityLabel?: string;
  style?: ViewStyle | ViewStyle[];
  size?: number;
  color?: string;
  hitSlopSize?: number;
  testID?: string;
};

export const IconActionButton: React.FC<IconActionButtonProps & { iconName: keyof typeof MaterialIcons.glyphMap }> = ({
  iconName,
  onPress,
  accessibilityLabel,
  style,
  size = 16,
  color = '#666',
  hitSlopSize = 5,
  testID,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={[styles.iconButton, style]}
      hitSlop={{ top: hitSlopSize, bottom: hitSlopSize, left: hitSlopSize, right: hitSlopSize }}
      testID={testID}
    >
      <MaterialIcons name={iconName} size={size} color={color} />
    </TouchableOpacity>
  );
};

export const EditButton: React.FC<IconActionButtonProps> = (props) => (
  <IconActionButton
    iconName="edit"
    color="#4f8cff"
    accessibilityLabel={props.accessibilityLabel || 'Edit'}
    {...props}
  />
);

export const DeleteButton: React.FC<IconActionButtonProps> = (props) => (
  <IconActionButton
    iconName="delete"
    color="#ff4757"
    accessibilityLabel={props.accessibilityLabel || 'Delete'}
    {...props}
  />
);

const styles = StyleSheet.create({
  iconButton: {
    padding: 8,
  },
}); 