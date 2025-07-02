import { Ionicons } from '@expo/vector-icons';
import * as ExpoImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface AvatarUploadProps {
  onAvatarPicked: (uri: string) => void;
  initialUri?: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ onAvatarPicked, initialUri }) => {
  const [avatar, setAvatar] = useState<string | null>(initialUri || null);

  const pickAvatar = async () => {
    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;
      setAvatar(uri);
      onAvatarPicked(uri);

      // ✅ TODO: Gửi ảnh lên backend (Cloudinary) tại đây nếu muốn upload ngay
      // const uploadedUrl = await uploadToCloudinary(uri);
      // console.log('Avatar uploaded to:', uploadedUrl);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickAvatar} style={styles.avatarButton}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <Ionicons name="person-circle" size={64} color="#bbb" />
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
});

export default AvatarUpload;
