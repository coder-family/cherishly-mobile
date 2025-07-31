import { MaterialIcons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ExpoImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import * as yup from 'yup';
import { Colors } from '../../constants/Colors';
import { useAppDispatch } from '../../redux/hooks';
import { updateHealthRecord, updateHealthRecordAttachments } from '../../redux/slices/healthSlice';
import { HealthRecord, UpdateHealthRecordData } from '../../types/health';
import ErrorText from '../form/ErrorText';
import FormWrapper from '../form/FormWrapper';
import InputField from '../form/InputField';
import PrimaryButton from '../form/PrimaryButton';

interface SelectedFile {
  uri: string;
  type: string;
  name: string;
  size: number;
  isNew?: boolean; // Track if this is a new file or existing
  publicId?: string; // For existing attachments
}

const schema = yup.object().shape({
  type: yup.string().required('Type is required'),
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup.string().optional(),
  doctorName: yup.string().optional(),
  location: yup.string().optional(),
});

interface EditHealthRecordModalProps {
  visible: boolean;
  onClose: () => void;
  record: HealthRecord | null;
  onSuccess: () => void;
}

const EditHealthRecordModal: React.FC<EditHealthRecordModalProps> = ({
  visible,
  onClose,
  record,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedType, setSelectedType] = useState<'vaccination' | 'illness' | 'medication'>('vaccination');
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [attachmentLoading, setAttachmentLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      type: 'vaccination',
      title: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      doctorName: '',
      location: '',
    },
  });

  // Pre-populate form when record changes
  useEffect(() => {
    if (record) {
      console.log('[EDIT-HEALTH] Record received:', {
        id: record.id,
        title: record.title,
        description: record.description,
        content: (record as any).content,
        startDate: record.startDate,
        date: (record as any).date,
        attachments: record.attachments,
        media: (record as any).media,
        hasAttachments: !!record.attachments,
        hasMedia: !!(record as any).media
      });
      
      setSelectedType(record.type);
      setValue('type', record.type);
      setValue('title', record.title);
      // Handle both original HealthRecord structure and timeline item structure
      setValue('description', record.description || (record as any).content || '');
      setValue('startDate', record.startDate || (record as any).date || '');
      setValue('endDate', record.endDate || '');
      setValue('doctorName', record.doctorName || '');
      setValue('location', record.location || '');
      
      console.log('[EDIT-HEALTH] Form values set:', {
        type: record.type,
        title: record.title,
        description: record.description || (record as any).content || '',
        startDate: record.startDate || (record as any).date || '',
        endDate: record.endDate || '',
        doctorName: record.doctorName || '',
        location: record.location || ''
      });
      
      // Convert existing attachments to selected files format
      // Handle both original HealthRecord structure and timeline item structure
      const attachments = record.attachments || (record as any).media || [];
      console.log('[EDIT-HEALTH] Attachments found:', attachments);
      
      if (attachments && attachments.length > 0) {
        const existingFiles = attachments.map((attachment: any) => {
          // Map attachment type to proper MIME type
          let mimeType = 'image/jpeg'; // default
          switch (attachment.type) {
            case 'image':
              mimeType = 'image/jpeg';
              break;
            case 'video':
              mimeType = 'video/mp4';
              break;
            case 'audio':
              mimeType = 'audio/mpeg';
              break;
            default:
              mimeType = 'image/jpeg';
          }
          
          return {
            uri: attachment.url,
            type: mimeType,
            name: attachment.filename || 'attachment',
            size: attachment.size,
            publicId: attachment.publicId, // Store the Cloudinary public ID for removal
            isNew: false, // Mark as existing file
          };
        });
        console.log('[EDIT-HEALTH] Converted files:', existingFiles);
        setSelectedFiles(existingFiles);
      } else {
        console.log('[EDIT-HEALTH] No attachments found, setting empty array');
        setSelectedFiles([]);
      }
    }
  }, [record, setValue]);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setSelectedFiles([]);
    }
  }, [visible]);

  const handleTypeChange = (type: 'vaccination' | 'illness' | 'medication') => {
    setSelectedType(type);
    setValue('type', type);
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (event.type === "set" && selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const formatted = `${year}-${month}-${day}`;
      setValue('startDate', formatted);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (event.type === "set" && selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const formatted = `${year}-${month}-${day}`;
      setValue('endDate', formatted);
    }
  };

  const pickImages = async () => {
    try {
      const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photo library.');
        return;
      }

      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets) {
        const newFiles = result.assets.map(asset => {
          // Determine proper MIME type based on file extension and asset type
          let mimeType = 'image/jpeg'; // default
          if (asset.type === 'video') {
            mimeType = 'video/mp4';
          } else if (asset.fileName) {
            const extension = asset.fileName.toLowerCase().split('.').pop();
            switch (extension) {
              case 'png':
                mimeType = 'image/png';
                break;
              case 'gif':
                mimeType = 'image/gif';
                break;
              case 'mp4':
                mimeType = 'video/mp4';
                break;
              case 'mov':
                mimeType = 'video/quicktime';
                break;
              case 'm4a':
                mimeType = 'audio/mpeg';
                break;
              case 'wav':
                mimeType = 'audio/wav';
                break;
              default:
                mimeType = 'image/jpeg';
            }
          }
          
          return {
            uri: asset.uri,
            type: mimeType,
            name: asset.fileName || `file_${Date.now()}.${asset.type === 'video' ? 'mp4' : 'jpg'}`,
            size: asset.fileSize || 0,
            isNew: true, // Mark as new file
          };
        });

        const totalFiles = selectedFiles.length + newFiles.length;
        if (totalFiles > 5) {
          Alert.alert('Too many files', 'You can only select up to 5 files total.');
          return;
        }

        setSelectedFiles(prev => [...prev, ...newFiles]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };



  const renderSelectedFiles = () => {
    console.log('[EDIT-HEALTH] renderSelectedFiles called, selectedFiles:', selectedFiles);
    if (selectedFiles.length === 0) {
      console.log('[EDIT-HEALTH] No files to render');
      return null;
    }

    console.log('[EDIT-HEALTH] Rendering', selectedFiles.length, 'files');
    return (
      <View style={styles.selectedFilesContainer}>
        <Text style={styles.sectionTitle}>Attachments ({selectedFiles.length}/5)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {selectedFiles.map((file, index) => (
            <View key={index} style={styles.filePreview}>
              <Image source={{ uri: file.uri }} style={styles.fileImage} />
              <TouchableOpacity
                style={styles.removeFileButton}
                onPress={() => removeFile(index)}
              >
                <MaterialIcons name="close" size={16} color="#fff" />
              </TouchableOpacity>
              <View style={styles.fileTypeIndicator}>
                <MaterialIcons 
                  name={file.type.startsWith('video/') ? 'videocam' : 'photo'} 
                  size={12} 
                  color="#fff" 
                />
              </View>
              {file.isNew && (
                <View style={styles.newFileIndicator}>
                  <Text style={styles.newFileText}>NEW</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
        <Text style={styles.helpText}>
          Tap the X to remove attachments. New attachments will be uploaded when you save.
        </Text>
      </View>
    );
  };

  const onSubmit = async (data: any) => {
    console.log('[HEALTH-EDIT] onSubmit called with data:', data);
    if (!record) {
      console.log('[HEALTH-EDIT] No record provided, returning');
      return;
    }

    try {
      // Format dates to YYYY-MM-DD format for API
      const formatDateForAPI = (dateString: string) => {
        if (!dateString) return undefined;
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const formattedData = {
        ...data,
        startDate: formatDateForAPI(data.startDate),
        endDate: data.endDate ? formatDateForAPI(data.endDate) : undefined,
      };

      console.log('[HEALTH-EDIT] Starting health record update:', {
        recordId: record.id,
        originalData: data,
        formattedData: formattedData,
        selectedFilesCount: selectedFiles.length,
        newFilesCount: selectedFiles.filter(f => f.isNew).length,
        existingFilesCount: selectedFiles.filter(f => !f.isNew).length
      });

      const updateData: UpdateHealthRecordData = {
        type: formattedData.type === 'health' ? 'vaccination' : formattedData.type, // Fix invalid type
        title: formattedData.title,
        description: formattedData.description,
        startDate: formattedData.startDate,
        endDate: formattedData.endDate,
        doctorName: formattedData.doctorName || undefined,
        location: formattedData.location || undefined,
        attachments: record.attachments || (record as any).media || [], // Handle both structures
      };
      
      // Update health record text content first
      console.log('[HEALTH-EDIT] Updating health record text content...');
      await dispatch(updateHealthRecord({ recordId: record.id, data: updateData })).unwrap();
      console.log('[HEALTH-EDIT] Health record text content updated successfully');

      // Handle attachment updates if there are changes
      const newFiles = selectedFiles.filter(file => file.isNew);
      
      // Find removed attachments: original attachments that are no longer in selectedFiles
      const currentAttachmentIds = selectedFiles
        .filter(file => !file.isNew && file.publicId)
        .map(file => file.publicId);
      
      // Handle both original HealthRecord structure and timeline item structure
      const originalAttachments = record.attachments || (record as any).media || [];
      const removedAttachmentIds = originalAttachments
        .filter((att: any) => !currentAttachmentIds.includes(att.publicId))
        .map((att: any) => att.publicId) || [];
      
      console.log('[HEALTH-EDIT] Attachment changes detected:', {
        newFiles: newFiles.length,
        removedAttachmentIds: removedAttachmentIds.length,
        currentAttachmentIds,
        originalAttachmentIds: originalAttachments.map((att: any) => att.publicId) || [],
        selectedFilesDetails: selectedFiles.map(f => ({ name: f.name, isNew: f.isNew, publicId: f.publicId })),
        originalAttachmentsDetails: originalAttachments.map((att: any) => ({ id: att.id, publicId: att.publicId, filename: att.filename })) || []
      });
      
      if (newFiles.length > 0 || removedAttachmentIds.length > 0) {
        setAttachmentLoading(true);
        try {
          console.log('[HEALTH-EDIT] Processing attachment changes...');
          
          // Handle removed attachments first
          if (removedAttachmentIds.length > 0) {
            console.log('[HEALTH-EDIT] Removing', removedAttachmentIds.length, 'attachments:', removedAttachmentIds);
            try {
              await dispatch(updateHealthRecordAttachments({
                recordId: record.id,
                attachments: [], // Empty array for remove action
                attachmentIds: removedAttachmentIds,
                action: 'remove'
              })).unwrap();
              console.log('[HEALTH-EDIT] Successfully removed attachments');
            } catch (removeError: any) {
              console.log('[HEALTH-EDIT] Remove attachments error:', removeError);
              if (!removeError.message?.includes('Please refresh to see changes')) {
                throw removeError; // Re-throw if it's not a refresh-needed error
              }
            }
          }
          
          // Handle new attachments
          if (newFiles.length > 0) {
            console.log('[HEALTH-EDIT] Adding', newFiles.length, 'new attachments');
            try {
              await dispatch(updateHealthRecordAttachments({
                recordId: record.id,
                attachments: newFiles.map(file => ({
                  uri: file.uri,
                  type: file.type,
                  name: file.name,
                  size: file.size
                })),
                action: 'add'
              })).unwrap();
              console.log('[HEALTH-EDIT] Successfully added new attachments');
            } catch (addError: any) {
              console.log('[HEALTH-EDIT] Add attachments error:', addError);
              if (!addError.message?.includes('Please refresh to see changes')) {
                throw addError; // Re-throw if it's not a refresh-needed error
              }
            }
          }
          
          console.log('[HEALTH-EDIT] Attachments updated successfully');
        } catch (attachmentError: any) {
          console.log('[HEALTH-EDIT] Attachment update error:', attachmentError);
          
          // Extract error message properly
          let errorMessage = 'Unknown attachment error';
          if (attachmentError?.message) {
            errorMessage = attachmentError.message;
          } else if (attachmentError?.error) {
            errorMessage = attachmentError.error;
          } else if (typeof attachmentError === 'string') {
            errorMessage = attachmentError;
          } else if (attachmentError?.data?.message) {
            errorMessage = attachmentError.data.message;
          }
          
          // Check if this is a "refresh needed" error vs a real failure
          if (errorMessage.includes('Please refresh to see changes')) {
            console.log('[HEALTH-EDIT] Attachment operation completed but needs refresh, continuing with success flow');
            // Don't show error, just refresh the data and continue with success
          } else {
            // Real error occurred, show warning but still continue
            Alert.alert('Warning', `Health record updated but some attachment changes may not have been applied: ${errorMessage}`);
          }
        } finally {
          setAttachmentLoading(false);
        }
      }
      
      reset();
      onSuccess();
      Alert.alert('Success', 'Health record updated successfully!');
    } catch (error: any) {
      console.log('[HEALTH-EDIT] Health record update error:', error);
      Alert.alert('Error', error.message || 'Failed to update health record. Please try again.');
    }
  };

  const handleClose = () => {
    reset();
    setSelectedFiles([]);
    onClose();
  };

  const typeOptions = [
    { value: 'vaccination', label: 'Vaccination', icon: 'vaccines' },
    { value: 'illness', label: 'Illness', icon: 'sick' },
    { value: 'medication', label: 'Medication', icon: 'medication' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Health Record</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <FormWrapper>
            {/* Type Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Record Type</Text>
              <View style={styles.typeContainer}>
                {typeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.typeButton,
                      selectedType === option.value && styles.activeTypeButton,
                    ]}
                    onPress={() => handleTypeChange(option.value as any)}
                  >
                    <MaterialIcons
                      name={option.icon as any}
                      size={20}
                      color={selectedType === option.value ? 'white' : Colors.light.text}
                    />
                    <Text
                      style={[
                        styles.typeButtonText,
                        selectedType === option.value && styles.activeTypeButtonText,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Title */}
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <InputField
                  label="Title"
                  value={value}
                  onChangeText={onChange}
                  placeholder="e.g., Flu vaccine, Fever, Antibiotics"
                />
              )}
            />
            {errors.title && <ErrorText>{errors.title.message}</ErrorText>}

            {/* Description */}
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <InputField
                  label="Description"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Provide details about the health record..."
                  multiline
                  numberOfLines={4}
                />
              )}
            />
            {errors.description && <ErrorText>{errors.description.message}</ErrorText>}

            {/* Date Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date Range</Text>
              
              <Controller
                control={control}
                name="startDate"
                render={({ field: { value } }) => (
                  <View>
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowStartDatePicker(true)}
                    >
                      <MaterialIcons name="schedule" size={20} color={Colors.light.text} />
                      <Text style={styles.dateButtonText}>
                        Start Date: {value ? new Date(value).toLocaleDateString() : 'Select Date'}
                      </Text>
                      <MaterialIcons name="arrow-drop-down" size={20} color={Colors.light.text} />
                    </TouchableOpacity>
                    {errors.startDate && <ErrorText>{errors.startDate.message}</ErrorText>}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="endDate"
                render={({ field: { value } }) => (
                  <View>
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowEndDatePicker(true)}
                    >
                      <MaterialIcons name="schedule" size={20} color={Colors.light.text} />
                      <Text style={styles.dateButtonText}>
                        End Date: {value ? new Date(value).toLocaleDateString() : 'Select Date (Optional)'}
                      </Text>
                      <MaterialIcons name="arrow-drop-down" size={20} color={Colors.light.text} />
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>

            {/* Doctor and Location */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Information</Text>
              
              <Controller
                control={control}
                name="doctorName"
                render={({ field: { onChange, value } }) => (
                  <InputField
                    label="Doctor Name (Optional)"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Dr. Smith"
                  />
                )}
              />

              <Controller
                control={control}
                name="location"
                render={({ field: { onChange, value } }) => (
                  <InputField
                    label="Location (Optional)"
                    value={value}
                    onChangeText={onChange}
                    placeholder="City General Hospital"
                  />
                )}
              />
            </View>

            {renderSelectedFiles()}

            <View style={styles.attachmentsSection}>
              <Text style={styles.sectionTitle}>Attachments</Text>
              <TouchableOpacity 
                style={styles.addAttachmentButton}
                onPress={pickImages}
                disabled={selectedFiles.length >= 5}
              >
                <MaterialIcons name="add-photo-alternate" size={24} color="#4f8cff" />
                <Text style={styles.addAttachmentText}>
                  {selectedFiles.length >= 5 ? 'Maximum 5 attachments' : 'Add Photos/Videos'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.helpText}>
                You can add up to 5 photos or videos to your health record
              </Text>

            </View>

            <PrimaryButton
              title="Update Health Record"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting || attachmentLoading}
              style={styles.submitButton}
            />
            
            {/* Debug form errors */}
            {Object.keys(errors).length > 0 && (
              <View style={{ marginTop: 10, padding: 10, backgroundColor: '#ffebee' }}>
                <Text style={{ color: 'red', fontSize: 12 }}>
                  Form errors: {JSON.stringify(errors)}
                </Text>
              </View>
            )}
          </FormWrapper>
        </ScrollView>

        {showStartDatePicker && (
          <Modal
            visible={showStartDatePicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowStartDatePicker(false)}
          >
            <TouchableWithoutFeedback onPress={() => setShowStartDatePicker(false)}>
              <View style={styles.datePickerOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.datePickerContainer}>
                    <DateTimePicker
                      value={new Date()}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      maximumDate={new Date()}
                      onChange={handleStartDateChange}
                    />
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}

        {showEndDatePicker && (
          <Modal
            visible={showEndDatePicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowEndDatePicker(false)}
          >
            <TouchableWithoutFeedback onPress={() => setShowEndDatePicker(false)}>
              <View style={styles.datePickerOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.datePickerContainer}>
                    <DateTimePicker
                      value={new Date()}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      maximumDate={new Date()}
                      onChange={handleEndDateChange}
                    />
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.card,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.card,
    backgroundColor: Colors.light.background,
  },
  activeTypeButton: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.text,
    marginLeft: 6,
  },
  activeTypeButtonText: {
    color: 'white',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.card,
    backgroundColor: Colors.light.background,
    marginBottom: 12,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 12,
  },
  submitButton: {
    marginTop: 24,
  },
  datePickerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  datePickerContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: 10,
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  selectedFilesContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  filePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  fileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeFileButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileTypeIndicator: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newFileIndicator: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  newFileText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  attachmentsSection: {
    marginTop: 20,
  },
  addAttachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4f8cff',
    borderRadius: 8,
    padding: 20,
    marginTop: 8,
    backgroundColor: '#f8fbff',
  },
  addAttachmentText: {
    fontSize: 16,
    color: '#4f8cff',
    marginLeft: 8,
  },
});

export default EditHealthRecordModal; 