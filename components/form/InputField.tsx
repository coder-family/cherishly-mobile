import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, error, style, ...props }) => {
  const labelColor = useThemeColor({}, 'text');
  const inputBg = useThemeColor({}, 'background');
  const inputText = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');
  const errorColor = '#e53935';

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: labelColor }]}>{label}</Text>}
      <TextInput
        style={[styles.input, { backgroundColor: inputBg, color: inputText, borderColor }, style]}
        {...props}
      />
      {error && <Text style={[styles.error, { color: errorColor }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontSize: 15,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 16,
  },
  error: {
    fontSize: 13,
    marginTop: 2,
  },
});

export default InputField;
