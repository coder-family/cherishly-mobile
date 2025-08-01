import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type VisibilityType = 'private' | 'public';

interface VisibilityBadgeProps {
  visibility: VisibilityType;
  size?: 'small' | 'medium';
}

const VisibilityBadge: React.FC<VisibilityBadgeProps> = ({ 
  visibility, 
  size = 'small' 
}) => {
  const getVisibilityConfig = (type: VisibilityType) => {
    switch (type) {
      case 'private':
        return {
          icon: 'lock',
          label: 'Private',
          color: '#666',
          backgroundColor: '#f0f0f0'
        };
      case 'public':
        return {
          icon: 'public',
          label: 'Public',
          color: '#28a745',
          backgroundColor: '#d4edda'
        };
      default:
        return {
          icon: 'visibility',
          label: 'Unknown',
          color: '#666',
          backgroundColor: '#f0f0f0'
        };
    }
  };

  const config = getVisibilityConfig(visibility);
  const isSmall = size === 'small';

  return (
    <View style={[
      styles.badge,
      { backgroundColor: config.backgroundColor },
      isSmall ? styles.smallBadge : styles.mediumBadge
    ]}>
      <MaterialIcons 
        name={config.icon as any} 
        size={isSmall ? 12 : 14} 
        color={config.color} 
      />
      {!isSmall && (
        <Text style={[styles.label, { color: config.color }]}>
          {config.label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  smallBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  mediumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default VisibilityBadge; 