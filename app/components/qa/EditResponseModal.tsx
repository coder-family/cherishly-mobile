import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
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
import { addAttachments, removeAttachments, updateResponse } from '../../redux/slices/promptResponseSlice';
import { PromptResponse } from '../../services/promptService';
import ImagePicker from '../media/ImagePicker';
import LoadingSpinner from '../ui/LoadingSpinner';

interface EditResponseModalProps {
  visible: boolean;
  response: PromptResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditResponseModal({ 
  visible, 
  response, 
  onClose, 
  onSuccess 
}: EditResponseModalProps) {
  const dispatch = useAppDispatch();
  const [content, setContent] = useState(response?.content || '');
  const [attachments, setAttachments] = useState<any[]>(response?.attachments || []);
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens/closes or when response changes
  useEffect(() => {
    if (visible && response) {
      setContent(response.content || '');
      setAttachments(response.attachments || []);
    }
  }, [visible, response]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter your response');
      return;
    }

    setLoading(true);
    try {
      // First, update the content using PUT route
      await dispatch(updateResponse({
        responseId: response.id,
        data: {
          content: content.trim(),
          attachments: [], // Don't send attachments with content update
        }
      })).unwrap();

      // Then handle attachments separately using PATCH route
      const originalAttachments = response.attachments || [];
      const newAttachments = attachments.filter(att => !att.id); // Files without IDs are new
      const removedAttachments = originalAttachments.filter(orig => 
        !attachments.some(att => att.id === orig.id)
      );

      console.log('EditResponseModal: Attachment analysis:', {
        totalAttachments: attachments.length,
        originalAttachments: originalAttachments.length,
        newAttachments: newAttachments.length,
        removedAttachments: removedAttachments.length,
        newAttachmentsDetails: newAttachments
      });

      // Handle attachment changes using PATCH route with appropriate actions
      if (newAttachments.length > 0 || removedAttachments.length > 0) {
        if (newAttachments.length > 0 && removedAttachments.length === 0) {
          // Only adding new attachments - use 'add' action
          console.log('EditResponseModal: Adding new attachments:', newAttachments);
          await dispatch(addAttachments({
            responseId: response.id,
            files: newAttachments
          })).unwrap();
        } else if (removedAttachments.length > 0 && newAttachments.length === 0) {
          // Only removing attachments - use 'remove' action
          const attachmentIdsToRemove = removedAttachments.map(att => att.publicId || att.id);
          
          if (attachmentIdsToRemove.length > 0) {
            console.log('EditResponseModal: Removing attachments:', attachmentIdsToRemove);
            await dispatch(removeAttachments({
              responseId: response.id,
              attachmentIds: attachmentIdsToRemove
            })).unwrap();
          }
        } else if (newAttachments.length > 0 && removedAttachments.length > 0) {
          // Both adding and removing - handle in sequence
          // First remove old attachments
          const attachmentIdsToRemove = removedAttachments.map(att => att.publicId || att.id);
          
          if (attachmentIdsToRemove.length > 0) {
            console.log('EditResponseModal: Removing attachments:', attachmentIdsToRemove);
            await dispatch(removeAttachments({
              responseId: response.id,
              attachmentIds: attachmentIdsToRemove
            })).unwrap();
          }
          
          // Then add new attachments
          if (newAttachments.length > 0) {
            console.log('EditResponseModal: Adding new attachments after removal:', newAttachments);
            await dispatch(addAttachments({
              responseId: response.id,
              files: newAttachments
            })).unwrap();
          }
        }
      }

      // Reset form and close modal immediately
      setContent('');
      setAttachments([]);
      onSuccess();
      onClose(); // Close modal immediately after success
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update response');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    
    if (content.trim() !== response.content || attachments.length !== response.attachments?.length) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to close?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => {
              setContent(response.content || '');
              setAttachments(response.attachments || []);
              onClose();
            }
          }
        ]
      );
    } else {
      onClose();
    }
  };

  const handleAddAttachment = async (uri: string) => {
    // Create a proper file object from the URI
    const fileObject = {
      uri: uri,
      type: 'image/jpeg', // Default type, could be enhanced to detect actual type
      name: `attachment_${Date.now()}.jpg`, // Generate unique name
    };
    
    console.log('EditResponseModal: Adding attachment:', {
      uri: fileObject.uri,
      type: fileObject.type,
      name: fileObject.name
    });
    
    // Check file size before adding
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileSize = blob.size;
      const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
      
      console.log('EditResponseModal: File size:', fileSize, 'bytes,', fileSizeMB, 'MB');
      
      if (fileSize > 10 * 1024 * 1024) { // 10MB limit
        Alert.alert(
          'File Too Large',
          `File size (${fileSizeMB}MB) exceeds the maximum allowed size (10MB). Please choose a smaller file.`
        );
        return;
      }
    } catch (error) {
      console.error('EditResponseModal: Error checking file size:', error);
    }
    
    setAttachments(prev => [...prev, fileObject]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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
          <Text style={styles.headerTitle}>Edit Response</Text>
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
                Update
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Response</Text>
            <TextInput
              style={styles.textInput}
              value={content}
              onChangeText={setContent}
              placeholder="Enter your response..."
              multiline
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.characterCount}>
              {content.length}/1000 characters
            </Text>
          </View>

          {/* Attachments */}
          <View style={styles.attachmentsContainer}>
            <Text style={styles.label}>Attachments</Text>
            <ImagePicker onImagePicked={handleAddAttachment} />
            
            {attachments.length > 0 && (
              <View style={styles.attachmentsList}>
                {attachments.map((attachment, index) => (
                  <View key={index} style={styles.attachmentItem}>
                    <Text style={styles.attachmentName}>
                      {attachment.name || attachment.filename || `Attachment ${index + 1}`}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveAttachment(index)}
                      style={styles.removeButton}
                    >
                      <MaterialIcons name="close" size={16} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007AFF',
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
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  attachmentsContainer: {
    marginBottom: 24,
  },
  attachmentsList: {
    marginTop: 12,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  attachmentName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
}); 