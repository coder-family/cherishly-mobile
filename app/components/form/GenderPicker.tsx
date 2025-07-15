import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface GenderOption {
  label: string;
  value: string;
}

interface GenderPickerProps {
  value: string;
  onSelect: (value: string) => void;
  options?: GenderOption[];
  label?: string;
  placeholder?: string;
}

const GenderPicker: React.FC<GenderPickerProps> = ({
  value,
  onSelect,
  options = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
  ],
  label = "Gender",
  placeholder = "Select gender",
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find(option => option.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.pickerText, !selectedOption && styles.placeholderText]}>
          {displayText}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label}</Text>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  value === option.value && styles.selectedOption,
                ]}
                onPress={() => handleSelect(option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    value === option.value && styles.selectedText,
                  ]}
                >
                  {option.label}
                </Text>
                {value === option.value && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  pickerButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  chevron: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    minWidth: 250,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: 'bold',
  },
});

export default GenderPicker; 