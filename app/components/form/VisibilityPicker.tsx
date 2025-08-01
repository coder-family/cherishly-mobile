import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type VisibilityType = 'private' | 'public';

interface VisibilityPickerProps {
  value: VisibilityType;
  onChange: (visibility: VisibilityType) => void;
  label?: string;
}

const VisibilityPicker: React.FC<VisibilityPickerProps> = ({ 
  value, 
  onChange, 
  label = "Visibility" 
}) => {
  const options: { value: VisibilityType; label: string; icon: string; description: string }[] = [
    {
      value: 'private',
      label: 'Private',
      icon: 'lock',
      description: 'Only you can see this'
    },
    {
      value: 'public',
      label: 'Public',
      icon: 'public',
      description: 'Everyone can see this'
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              value === option.value && styles.selectedOption
            ]}
            onPress={() => onChange(option.value)}
          >
            <View style={styles.optionContent}>
              <MaterialIcons 
                name={option.icon as any} 
                size={20} 
                color={value === option.value ? '#4f8cff' : '#666'} 
              />
              <View style={styles.optionText}>
                <Text style={[
                  styles.optionLabel,
                  value === option.value && styles.selectedOptionLabel
                ]}>
                  {option.label}
                </Text>
                <Text style={styles.optionDescription}>
                  {option.description}
                </Text>
              </View>
            </View>
            {value === option.value && (
              <MaterialIcons name="check" size={20} color="#4f8cff" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#e0e7ff',
    borderColor: '#4f8cff',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    marginLeft: 12,
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  selectedOptionLabel: {
    color: '#4f8cff',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default VisibilityPicker; 