import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import PrimaryButton from '../form/PrimaryButton';

interface AskChildModalProps {
  visible: boolean;
  onClose: () => void;
  onSystemQuestion: () => void;
  onCustomQuestion: () => void;
}

export default function AskChildModal({
  visible,
  onClose,
  onSystemQuestion,
  onCustomQuestion,
}: AskChildModalProps) {
  const [selectedOption, setSelectedOption] = useState<'system' | 'custom' | null>(null);

  const handleContinue = () => {
    if (selectedOption === 'system') {
      onSystemQuestion();
    } else if (selectedOption === 'custom') {
      onCustomQuestion();
    }
  };

  const handleClose = () => {
    setSelectedOption(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose How to Ask</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Select how you&apos;d like to ask your child a question
          </Text>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.option,
                selectedOption === 'system' && styles.selectedOption,
              ]}
              onPress={() => setSelectedOption('system')}
            >
              <View style={styles.optionContent}>
                <MaterialIcons
                  name="psychology"
                  size={24}
                  color={selectedOption === 'system' ? '#007AFF' : '#666'}
                />
                <View style={styles.optionText}>
                  <Text style={[
                    styles.optionTitle,
                    selectedOption === 'system' && styles.selectedOptionText,
                  ]}>
                    System Question
                  </Text>
                  <Text style={styles.optionDescription}>
                    Use a pre-written question from our system
                  </Text>
                </View>
              </View>
              {selectedOption === 'system' && (
                <MaterialIcons name="check-circle" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.option,
                selectedOption === 'custom' && styles.selectedOption,
              ]}
              onPress={() => setSelectedOption('custom')}
            >
              <View style={styles.optionContent}>
                <MaterialIcons
                  name="edit"
                  size={24}
                  color={selectedOption === 'custom' ? '#007AFF' : '#666'}
                />
                <View style={styles.optionText}>
                  <Text style={[
                    styles.optionTitle,
                    selectedOption === 'custom' && styles.selectedOptionText,
                  ]}>
                    Your Question
                  </Text>
                  <Text style={styles.optionDescription}>
                    Write your own custom question
                  </Text>
                </View>
              </View>
              {selectedOption === 'custom' && (
                <MaterialIcons name="check-circle" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <PrimaryButton
              title="Continue"
              onPress={handleContinue}
              disabled={!selectedOption}
              style={styles.continueButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  option: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
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
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedOptionText: {
    color: '#007AFF',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  continueButton: {
    flex: 1,
    marginLeft: 12,
  },
}); 