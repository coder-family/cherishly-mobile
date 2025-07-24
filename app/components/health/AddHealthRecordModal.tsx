import { MaterialIcons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as yup from 'yup';
import { Colors } from '../../constants/Colors';
import { useAppDispatch } from '../../redux/hooks';
import { createHealthRecord } from '../../redux/slices/healthSlice';
import { CreateHealthRecordData } from '../../types/health';
import ErrorText from '../form/ErrorText';
import FormWrapper from '../form/FormWrapper';
import InputField from '../form/InputField';
import PrimaryButton from '../form/PrimaryButton';

const schema = yup.object().shape({
  type: yup.string().required('Type is required'),
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup.string().optional(),
  doctorName: yup.string().optional(),
  location: yup.string().optional(),
});

interface AddHealthRecordModalProps {
  visible: boolean;
  onClose: () => void;
  childId: string;
  onSuccess: () => void;
}

const AddHealthRecordModal: React.FC<AddHealthRecordModalProps> = ({
  visible,
  onClose,
  childId,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedType, setSelectedType] = useState<'vaccination' | 'illness' | 'medication'>('vaccination');

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    // watch,
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

  const handleTypeChange = (type: 'vaccination' | 'illness' | 'medication') => {
    setSelectedType(type);
    setValue('type', type);
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setValue('startDate', selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setValue('endDate', selectedDate.toISOString().split('T')[0]);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const healthData: CreateHealthRecordData = {
        childId,
        type: data.type,
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate || undefined,
        doctorName: data.doctorName || undefined,
        location: data.location || undefined,
        attachments: [],
      };
      await dispatch(createHealthRecord(healthData)).unwrap();
      reset();
      onSuccess();
      Alert.alert('Success', 'Health record added successfully!');
    } catch (_error) {
      Alert.alert('Error', 'Failed to add health record. Please try again.');
    }
  };

  const handleClose = () => {
    reset();
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
          <Text style={styles.title}>Add Health Record</Text>
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

            <PrimaryButton
              title="Add Health Record"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              style={styles.submitButton}
            />
          </FormWrapper>
        </ScrollView>

        {showStartDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
            maximumDate={new Date()}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
            maximumDate={new Date()}
          />
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
});

export default AddHealthRecordModal; 