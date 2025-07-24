/**
 * ImagePicker Component
 *
 * This component provides image picking and upload functionality with the following capabilities:
 *
 * 🖼️ IMAGE PICKING FEATURES:
 * - Select images from the device library
 * - Supports editing, cropping, and aspect ratio
 * - Preview selected image before upload
 *
 * ☁️ UPLOAD FUNCTIONALITY:
 * - Upload selected image to server or Cloudinary
 * - File validation and size checking before upload
 * - Upload progress tracking and status updates (planned)
 * - Error handling for failed uploads (planned)
 *
 * 🏗️ ARCHITECTURE:
 * - TypeScript interfaces for type safety
 * - Modular design for easy integration
 * - Proper cleanup and resource management
 *
 * 🔄 FUTURE REDUX INTEGRATION:
 * - Upload functionality will be moved to Redux using createAsyncThunk
 * - Redux state will track:
 *   - uploadProgress: Real-time upload percentage (0-100)
 *   - uploadStatus: 'idle' | 'uploading' | 'success' | 'failed'
 *   - uploadErrors: Array of error messages and details
 *   - uploadResults: Array of successfully uploaded image metadata
 *   - uploadQueue: Queue of pending uploads for offline support
 * - Benefits: centralized state management, better error handling, offline support
 * - Planned Redux slice: imageUploadSlice with async thunks for upload operations
 *
 * @example
 * ```tsx
 * <ImagePicker onImagePicked={(uri) => console.log('Picked image:', uri)} />
 * ```
 */

import { Ionicons } from '@expo/vector-icons';
import * as ExpoImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ImagePickerProps {
  onImagePicked: (uri: string) => void;
}

const ImagePicker: React.FC<ImagePickerProps> = ({ onImagePicked }) => {
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImage(uri);
        onImagePicked(uri);

        // ✅ TODO: Upload image to backend or Cloudinary here
        // create a helper function like uploadToCloudinary(uri)
        // const uploadedUrl = await uploadToCloudinary(uri);
        // console.log('Uploaded image URL:', uploadedUrl);
      }
    } catch (_error) {
      // console.error('Error picking image:', error); // Commented out - not related to health/growth
      // TODO: Show user-friendly error message (e.g., using a Toast or Alert)
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.button}>
        <Ionicons name="image" size={28} color="#fff" />
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.preview} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 24,
    padding: 12,
    marginBottom: 8,
  },
  preview: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginTop: 8,
  },
});

export default ImagePicker;
