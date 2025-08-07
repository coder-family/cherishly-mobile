import { MaterialIcons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
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
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import * as yup from 'yup';
import { Colors } from '../../constants/Colors';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { createGrowthRecord } from '../../redux/slices/healthSlice';
import { CreateGrowthRecordData } from '../../types/health';
import ErrorText from '../form/ErrorText';
import FormWrapper from '../form/FormWrapper';
import InputField from '../form/InputField';
import PrimaryButton from '../form/PrimaryButton';
import VisibilityToggle, { VisibilityType } from '../ui/VisibilityToggle';

const schema = yup.object().shape({
  type: yup.string().required('Type is required'),
  value: yup.string().required('Value is required').test('is-number', 'Value must be a valid number', (value) => {
    if (!value) return false;
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  }),
  unit: yup.string().required('Unit is required'),
  date: yup.string().required('Date is required'),
  source: yup.string().required('Source is required'),
  notes: yup.string().optional(),
});

interface AddGrowthRecordModalProps {
  visible: boolean;
  onClose: () => void;
  childId: string;
  onSuccess: () => void;
}

const AddGrowthRecordModal: React.FC<AddGrowthRecordModalProps> = ({
  visible,
  onClose,
  childId,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const { children } = useAppSelector((state) => state.children);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedType, setSelectedType] = useState<'height' | 'weight'>('height');
  const [visibility, setVisibility] = useState<VisibilityType>('private');
  
  // Check if current user is the creator (owner of the child)
  const isCreator = currentUser && childId && 
    children && children.some(child => child.id === childId);

  // Load default visibility when modal opens
  useEffect(() => {
    if (visible) {
      const loadDefaultVisibility = async () => {
        try {
          const savedVisibility = await AsyncStorage.getItem('defaultVisibility');
          if (savedVisibility && (savedVisibility === 'private' || savedVisibility === 'public')) {
            setVisibility(savedVisibility as VisibilityType);
          }
        } catch (error) {
          console.error('Failed to load default visibility:', error);
        }
      };
      
      loadDefaultVisibility();
    }
  }, [visible]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      type: 'height',
      value: '',
      unit: 'cm',
      date: new Date().toISOString().split('T')[0],
      source: 'home',
      notes: '',
    },
  });

  // const watchedType = watch('type');

  const handleTypeChange = (type: 'height' | 'weight') => {
    setSelectedType(type);
    setValue('type', type);
    setValue('unit', type === 'height' ? 'cm' : 'kg');
  };

  const onSubmit = async (data: any) => {
    try {
      const growthData: CreateGrowthRecordData = {
        child: childId,
        type: data.type,
        value: parseFloat(data.value),
        unit: data.unit,
        date: data.date,
        source: data.source,
        notes: data.notes,
        visibility: visibility, // Add visibility to the data
      };
      await dispatch(createGrowthRecord(growthData)).unwrap();
      reset();
      onSuccess();
      Alert.alert('Success', 'Growth record added successfully!');
    } catch (_error) {
      Alert.alert('Error', 'Failed to add growth record. Please try again.');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const sourceOptions = [
    { value: 'home', label: 'Home' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'clinic', label: 'Clinic' },
    { value: 'hospital', label: 'Hospital' },
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
          <Text style={styles.title}>Add Growth Record</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <FormWrapper>
            {/* Type Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Measurement Type</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    selectedType === 'height' && styles.activeTypeButton,
                  ]}
                  onPress={() => handleTypeChange('height')}
                >
                  <MaterialIcons
                    name="straighten"
                    size={20}
                    color={selectedType === 'height' ? 'white' : Colors.light.text}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedType === 'height' && styles.activeTypeButtonText,
                    ]}
                  >
                    Height
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    selectedType === 'weight' && styles.activeTypeButton,
                  ]}
                  onPress={() => handleTypeChange('weight')}
                >
                  <MaterialIcons
                    name="fitness-center"
                    size={20}
                    color={selectedType === 'weight' ? 'white' : Colors.light.text}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedType === 'weight' && styles.activeTypeButtonText,
                    ]}
                  >
                    Weight
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Value and Unit */}
            <View style={styles.row}>
              <View style={styles.valueContainer}>
                <Controller
                  control={control}
                  name="value"
                  render={({ field: { onChange, value } }) => (
                    <InputField
                      label="Value"
                      value={value}
                      onChangeText={(text) => {
                        // Allow any text input, validation will handle the number check
                        onChange(text);
                      }}
                      keyboardType="numeric"
                      placeholder="0.0"
                    />
                  )}
                />
                {errors.value && <ErrorText>{errors.value.message}</ErrorText>}
              </View>
              <View style={styles.unitContainer}>
                <Text style={styles.unitLabel}>Unit</Text>
                <View style={styles.unitDisplay}>
                  <Text style={styles.unitText}>
                    {selectedType === 'height' ? 'cm' : 'kg'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Date */}
            <Controller
              control={control}
              name="date"
              render={({ field: { value, onChange } }) => (
                <View>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <MaterialIcons name="calendar-today" size={20} color={Colors.light.text} />
                    <Text style={styles.dateButtonText}>
                      {value ? new Date(value).toLocaleDateString() : 'Select Date'}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={20} color={Colors.light.text} />
                  </TouchableOpacity>
                  {errors.date && <ErrorText>{errors.date.message}</ErrorText>}
                  
                  <Modal
                    visible={showDatePicker}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowDatePicker(false)}
                  >
                    <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
                      <View style={styles.datePickerOverlay}>
                        <TouchableWithoutFeedback>
                          <View style={styles.datePickerContainer}>
                            <DateTimePicker
                              value={value ? new Date(value) : new Date()}
                              mode="date"
                              display={Platform.OS === "ios" ? "spinner" : "default"}
                              maximumDate={new Date()}
                              onChange={(event, date) => {
                                if (event.type === "set" && date) {
                                  // Format date in local time (YYYY-MM-DD)
                                  const year = date.getFullYear();
                                  const month = String(date.getMonth() + 1).padStart(2, "0");
                                  const day = String(date.getDate()).padStart(2, "0");
                                  const formatted = `${year}-${month}-${day}`;
                                  onChange(formatted);
                                  setShowDatePicker(false);
                                }
                              }}
                            />
                          </View>
                        </TouchableWithoutFeedback>
                      </View>
                    </TouchableWithoutFeedback>
                  </Modal>
                </View>
              )}
            />

            {/* Source */}
            <Controller
              control={control}
              name="source"
              render={({ field: { onChange, value } }) => (
                <View>
                  <Text style={styles.label}>Source</Text>
                  <View style={styles.sourceContainer}>
                    {sourceOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.sourceButton,
                          value === option.value && styles.activeSourceButton,
                        ]}
                        onPress={() => onChange(option.value)}
                      >
                        <Text
                          style={[
                            styles.sourceButtonText,
                            value === option.value && styles.activeSourceButtonText,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {errors.source && <ErrorText>{errors.source.message}</ErrorText>}
                </View>
              )}
            />

            {/* Notes */}
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <InputField
                  label="Notes (Optional)"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Add any additional notes..."
                  multiline
                  numberOfLines={3}
                />
              )}
            />

            {/* Visibility Toggle - Only show for creator */}
            {isCreator && (
              <VisibilityToggle
                visibility={visibility}
                onUpdate={async (newVisibility) => {
                  setVisibility(newVisibility);
                  // Optionally save to AsyncStorage
                  await AsyncStorage.setItem('defaultVisibility', newVisibility);
                }}
                size="small"
              />
            )}

            <PrimaryButton
              title="Add Record"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              style={styles.submitButton}
            />
          </FormWrapper>
        </ScrollView>
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
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginLeft: 8,
  },
  activeTypeButtonText: {
    color: 'white',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  valueContainer: {
    flex: 2,
  },
  unitContainer: {
    flex: 1,
  },
  unitLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
  },
  unitDisplay: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.card,
    backgroundColor: Colors.light.card,
    alignItems: 'center',
  },
  unitText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
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
    marginBottom: 16,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
  },
  sourceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  sourceButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.card,
    backgroundColor: Colors.light.background,
  },
  activeSourceButton: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  sourceButtonText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  activeSourceButtonText: {
    color: 'white',
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
});

export default AddGrowthRecordModal; 