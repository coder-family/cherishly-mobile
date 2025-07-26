import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import PrimaryButton from '../form/PrimaryButton';

interface CustomQuestionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (question: string) => void;
}

export default function CustomQuestionModal({
  visible,
  onClose,
  onSubmit,
}: CustomQuestionModalProps) {
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = () => {
    if (question.trim()) {
      onSubmit(question.trim());
      setQuestion('');
      setCategory('');
    }
  };

  const handleClose = () => {
    setQuestion('');
    setCategory('');
    onClose();
  };

  const isSubmitDisabled = !question.trim();

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
            <Text style={styles.title}>Ask Your Child</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Write a question to ask your child about their development, feelings, or experiences.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Question *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., What was your favorite part of today?"
              value={question}
              onChangeText={setQuestion}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Emotions, Learning, Activities"
              value={category}
              onChangeText={setCategory}
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <PrimaryButton
              title="Ask Question"
              onPress={handleSubmit}
              disabled={isSubmitDisabled}
              style={styles.submitButton}
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
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
  submitButton: {
    flex: 1,
    marginLeft: 12,
  },
}); 