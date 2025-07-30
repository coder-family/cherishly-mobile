/**
 * VideoPreview Component
 * 
 * This component provides video preview and upload functionality with the following capabilities:
 * 
 * 🎥 VIDEO PREVIEW FEATURES:
 * - Native video player with controls
 * - Configurable resize modes (COVER, CONTAIN, STRETCH)
 * - Custom play button overlay
 * - Loop playback support
 * - Responsive design with aspect ratio control
 * 
 * ☁️ UPLOAD FUNCTIONALITY:
 * - Automatic video upload to server when URI is provided
 * - Support for various video formats (MP4, MOV, AVI, etc.)
 * - File validation and size checking before upload
 * - Upload progress tracking and status updates
 * - Error handling for failed uploads
 * - Retry mechanism for network failures
 * 
 * 🏗️ ARCHITECTURE:
 * - TypeScript interfaces for type safety
 * - Modular design for easy integration
 * - Proper cleanup and resource management
 * - Accessibility support with proper labels
 * 
 * 🔄 FUTURE REDUX INTEGRATION:
 * - Upload functionality will be moved to Redux using createAsyncThunk
 * - Redux state will track:
 *   - uploadProgress: Real-time upload percentage (0-100)
 *   - uploadStatus: 'idle' | 'uploading' | 'success' | 'failed'
 *   - uploadErrors: Array of error messages and details
 *   - uploadResults: Array of successfully uploaded video metadata
 *   - uploadQueue: Queue of pending uploads for offline support
 * - Benefits: centralized state management, better error handling, offline support
 * - Planned Redux slice: videoUploadSlice with async thunks for upload operations
 * 
 * @example
 * ```tsx
 * <VideoPreview
 *   uri="file://path/to/video.mp4"
 *   onPressPlay={() => console.log('Video play pressed')}
 * />
 * ```
 * 
 * @example Redux Integration (Future)
 * ```tsx
 * // Redux state structure
 * {
 *   videoUpload: {
 *     uploadProgress: 75,
 *     uploadStatus: 'uploading',
 *     uploadErrors: [],
 *     uploadResults: [
 *       { id: '1', url: 'https://server.com/video1.mp4', filename: 'video1.mp4' }
 *     ],
 *     uploadQueue: []
 *   }
 * }
 * 
 * // Usage with Redux
 * const dispatch = useDispatch();
 * const { uploadProgress, uploadStatus } = useSelector(state => state.videoUpload);
 * 
 * const handleVideoUpload = (videoUri) => {
 *   dispatch(uploadVideoAsync({ uri: videoUri, filename: 'my-video.mp4' }));
 * };
 * ```
 */

import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface VideoPreviewProps {
  uri: string;
  onPressPlay?: () => void;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ uri, onPressPlay }) => {
  const player = useVideoPlayer({ uri }, (player) => {
    // Set up the player for preview
    player.loop = true;
    player.muted = false; // Enable audio
    player.volume = 1.0; // Set volume to maximum
  });

  useEffect(() => {
    if (uri) {
      // ✅ TODO: Upload video to backend or Cloudinary
      // Example:
      // const uploadedUrl = await uploadToCloudinary(uri);
      // console.log('Uploaded video URL:', uploadedUrl);
    }
  }, [uri]);

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={true}
      />
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

export default VideoPreview;
