import React, { useState } from 'react';
import { Alert, StyleSheet, Switch, View } from 'react-native';
import VisibilityBadge from './VisibilityBadge';

export type VisibilityType = 'private' | 'public';

interface VisibilityToggleProps {
  visibility: VisibilityType;
  onUpdate: (newVisibility: VisibilityType) => Promise<void>;
  size?: 'small' | 'medium';
  disabled?: boolean;
}

const VisibilityToggle: React.FC<VisibilityToggleProps> = ({ 
  visibility, 
  onUpdate, 
  size = 'small',
  disabled = false 
}) => {
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);

  const handleVisibilityToggle = async (newVisibility: VisibilityType) => {
    if (isUpdatingVisibility || disabled) return;
    
    setIsUpdatingVisibility(true);
    try {
      await onUpdate(newVisibility);
      // Success - no alert needed, toggle switch provides visual feedback
    } catch (error) {
      Alert.alert('Error', 'Failed to update visibility. Please try again.');
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  return (
    <View style={styles.container}>
      <VisibilityBadge visibility={visibility} size={size} />
      <Switch
        value={visibility === 'public'}
        onValueChange={(value) => handleVisibilityToggle(value ? 'public' : 'private')}
        disabled={isUpdatingVisibility || disabled}
        trackColor={{ false: '#e0e0e0', true: '#28a745' }}
        thumbColor={visibility === 'public' ? '#fff' : '#fff'}
        ios_backgroundColor="#e0e0e0"
        style={styles.switch}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
    gap: 8,
  },
  switch: {
    transform: [{ scaleX: 0.55 }, { scaleY: 0.55 }],
  },
});

export default VisibilityToggle; 