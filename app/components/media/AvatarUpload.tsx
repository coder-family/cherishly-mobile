import { Ionicons } from '@expo/vector-icons';
import * as ExpoImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface AvatarUploadProps {
  onAvatarPicked: (uri: string) => void;
  initialUri?: string;
  userId: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ onAvatarPicked, initialUri, userId }) => {
  const [isPicking, setIsPicking] = useState(false);
  const [previewUri, setPreviewUri] = useState(initialUri);

  useEffect(() => {
    setPreviewUri(initialUri);
  }, [initialUri]);

  const pickAvatar = async () => {
    setIsPicking(true);
    try {
      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length > 0) {
        const uri = result.assets[0].uri;
        setPreviewUri(uri); 
        onAvatarPicked(uri); // Pass local URI to parent
      }
    } catch (error) {
      console.error('Image picker error:', error);
    } finally {
      setIsPicking(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={pickAvatar} 
        style={styles.avatarButton}
        disabled={isPicking}
      >
        {previewUri ? (
          <View style={styles.avatarContainer}>
            <Image source={{ uri: previewUri }} style={styles.avatar} />
            {isPicking && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
          </View>
        ) : (
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={64} color="#bbb" />
            {isPicking && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  avatarButton: {
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2196F3',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AvatarUpload;
