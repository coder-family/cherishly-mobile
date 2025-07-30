import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppDispatch } from '../../redux/hooks';
import { createResponse } from '../../redux/slices/promptResponseSlice';
import { Prompt } from '../../services/promptService';
import MultiMediaPicker, { MediaFile } from '../media/MultiMediaPicker';
import LoadingSpinner from '../ui/LoadingSpinner';

interface AddResponseModalProps {
  visible: boolean;
  prompt: Prompt;
  childId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddResponseModal({ 
  visible, 
  prompt, 
  childId, 
  onClose, 
  onSuccess 
}: AddResponseModalProps) {
  const dispatch = useAppDispatch();
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter your response');
      return;
    }

    setLoading(true);
    try {
      // Convert MediaFile objects to the format expected by the service
      const convertedAttachments = attachments.map(file => ({
        uri: file.uri,
        type: file.type === 'image' ? 'image/jpeg' : 
              file.type === 'video' ? 'video/mp4' : 
              'audio/mpeg',
        name: file.filename,
      }));

      await dispatch(createResponse({
        promptId: prompt.id,
        childId,
        content: content.trim(),
        attachments: convertedAttachments as any,
      })).unwrap();

      // Reset form
      setContent('');
      setAttachments([]);
      onSuccess();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create response');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    
    if (content.trim() || attachments.length > 0) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to close?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => {
              setContent('');
              setAttachments([]);
              onClose();
            }
          }
        ]
      );
    } else {
      onClose();
    }
  };

  const handleMediaPicked = (files: MediaFile[]) => {
    setAttachments(files);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} disabled={loading}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Answer Question</Text>
          <TouchableOpacity 
            onPress={handleSubmit} 
            disabled={loading || !content.trim()}
            style={[
              styles.submitButton,
              (!content.trim() || loading) && styles.submitButtonDisabled
            ]}
          >
            {loading ? (
              <LoadingSpinner size="small" />
            ) : (
              <Text style={[
                styles.submitButtonText,
                (!content.trim() || loading) && styles.submitButtonTextDisabled
              ]}>
                Submit
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Prompt Display */}
          <View style={styles.promptContainer}>
            <Text style={styles.promptTitle}>{prompt.title}</Text>
            <Text style={styles.promptContent}>{prompt.content}</Text>
            {prompt.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{prompt.category}</Text>
              </View>
            )}
          </View>

          {/* Response Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Your Response</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Share your thoughts, experiences, or observations..."
              placeholderTextColor="#999"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              maxLength={2000}
            />
            <Text style={styles.characterCount}>
              {content.length}/2000 characters
            </Text>
          </View>

          {/* Attachments */}
          <View style={styles.attachmentsContainer}>
            <Text style={styles.inputLabel}>Attachments (Optional)</Text>
            <Text style={styles.attachmentsSubtext}>
              Add photos, videos, or audio to support your response
            </Text>
            
            <MultiMediaPicker
              onMediaPicked={handleMediaPicked}
              maxFiles={5}
              allowedTypes={['image', 'video', 'audio']}
              maxFileSize={50}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#4f8cff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#999',
  },
  content: {
    flex: 1,
  },
  promptContainer: {
    backgroundColor: '#f8f9ff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4f8cff',
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  promptContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  inputContainer: {
    margin: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  attachmentsContainer: {
    margin: 16,
  },
  attachmentsSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
}); 