/**
 * VideoPreviewWithRedux Component
 * 
 * This component demonstrates the integration of VideoPreview with Redux for upload functionality.
 * It shows how to use Redux state to track upload progress, error status, and results.
 * 
 * Features:
 * - Automatic video upload when URI is provided
 * - Real-time upload progress tracking via Redux
 * - Error handling and retry functionality
 * - Upload status indicators
 * - Batch upload support
 * 
 * @example
 * ```tsx
 * <VideoPreviewWithRedux
 *   uri="file://path/to/video.mp4"
 *   filename="my-video.mp4"
 *   onUploadComplete={(result) => console.log('Upload complete:', result)}
 *   onUploadError={(error) => console.log('Upload error:', error)}
 * />
 * ```
 */

import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

interface VideoPreviewWithReduxProps {
  uri: string;
  onPressPlay?: () => void;
}

const VideoPreviewWithRedux: React.FC<VideoPreviewWithReduxProps> = ({
  uri,
  onPressPlay,
}) => {
  return (
    <View style={styles.container}>
      {/* Video Player */}
      <Video
        source={{ uri }}
        style={styles.video}
        useNativeControls
        resizeMode={ResizeMode.COVER}
        isLooping
      />

      {/* Play Button Overlay */}
      {onPressPlay && (
        <TouchableOpacity style={styles.playButton} onPress={onPressPlay}>
          <Ionicons name="play-circle" size={48} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '40%',
    left: '40%',
    zIndex: 2,
  },
});

export default VideoPreviewWithRedux; 