import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ResizeMode, Video } from 'expo-av';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MemoryAttachment } from '../../services/memoryService';
import VideoPlayer from '../media/VideoPlayer';

interface MemoryMediaViewerProps {
  attachments: MemoryAttachment[];
  maxPreviewCount?: number;
}

const { width: screenWidth } = Dimensions.get('window');
const PREVIEW_SIZE = 120;
const MAX_PREVIEW_COUNT = 2;

export default function MemoryMediaViewer({ 
  attachments, 
  maxPreviewCount = MAX_PREVIEW_COUNT 
}: MemoryMediaViewerProps) {
  const [selectedAttachment, setSelectedAttachment] = useState<MemoryAttachment | null>(null);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Ensure attachments are valid and have required fields
  const safeAttachments = useMemo(() => {
    return attachments
      .filter(att => att && att.url && att.type)
      .slice(0, maxPreviewCount);
  }, [attachments, maxPreviewCount]);
  
  // Debug log to help identify issues
  if (!attachments) {
    console.warn('MemoryMediaViewer: attachments prop is undefined or null');
  }

  // Generate a unique key for this memory's expanded state
  const getExpandedStateKey = useCallback(() => {
    if (!safeAttachments || safeAttachments.length === 0) return null;
    // Use the first attachment's ID or a combination of attachment IDs
    const attachmentIds = safeAttachments.map(att => att.id).sort().join('-');
    return `memory_expanded_${attachmentIds}`;
  }, [safeAttachments]);

  // Load expanded state from AsyncStorage
  useEffect(() => {
    const loadExpandedState = async () => {
      try {
        const key = getExpandedStateKey();
        if (key) {
          const expanded = await AsyncStorage.getItem(key);
          if (expanded === 'true') {
            setIsExpanded(true);
          }
        }
      } catch (error) {
        console.error('Error loading expanded state:', error);
      }
    };

    loadExpandedState();
  }, [safeAttachments, getExpandedStateKey]);



  // Auto-clear playing video after timeout to prevent stuck states
  useEffect(() => {
    if (playingVideoId) {
      const timeout = setTimeout(() => {
        setPlayingVideoId(null);
      }, 30000); // 30 second timeout as fallback

      return () => clearTimeout(timeout);
    }
  }, [playingVideoId]);

  if (!safeAttachments || safeAttachments.length === 0) {
    return null;
  }

  const images = safeAttachments.filter(att => att.type === 'image');
  const videos = safeAttachments.filter(att => att.type === 'video');
  const audios = safeAttachments.filter(att => att.type === 'audio');

  const renderImagePreview = (attachment: MemoryAttachment, index: number) => (
    <TouchableOpacity
      style={[
        styles.fullWidthMediaPreview,
        index > 0 && styles.mediaSpacing
      ]}
      onPress={() => {
        setSelectedAttachment(attachment);
        setShowFullScreen(true);
      }}
      key={`image-${attachment.id || index}`}
    >
      <Image
        source={{ uri: attachment.url }}
        style={styles.fullWidthPreviewImage}
        resizeMode="cover"
      />

    </TouchableOpacity>
  );

  const renderVideoPreview = (attachment: MemoryAttachment, index: number) => {
    const videoId = attachment.id || `video-${index}`;
    const isPlaying = playingVideoId === videoId;
    
    // console.log('Rendering video:', {
    //   videoId,
    //   playingVideoId,
    //   isPlaying,
    //   attachmentId: attachment.id,
    //   index
    // });
    
    return (
      <View
        style={[
          styles.fullWidthMediaPreview,
          index > 0 && styles.mediaSpacing
        ]}
        key={videoId}
      >
        {isPlaying ? (
          // Show video player when playing
          (() => {
            // console.log('Rendering VideoPlayer with URL:', attachment.url);
            return (
              <View style={styles.inlineVideoContainer}>
                <Video
                  source={{ uri: attachment.url }}
                  style={styles.inlineVideo}
                  shouldPlay={true}
                  isLooping={false}
                  isMuted={false}
                  useNativeControls={true}
                  resizeMode={ResizeMode.CONTAIN}
                  onPlaybackStatusUpdate={(status) => {
                    // console.log('Video playback status:', status);
                    // Only stop playing when video actually ends or has a real error
                    if ('didJustFinish' in status && status.didJustFinish) {
                      // console.log('Video finished, clearing playingVideoId');
                      setPlayingVideoId(null);
                    } else if ('error' in status && status.error) {
                      // console.log('Video error:', status.error, 'clearing playingVideoId');
                      setPlayingVideoId(null);
                    }
                  }}
                />
                <TouchableOpacity
                  style={styles.closeVideoButton}
                  onPress={() => {
                    // console.log('Close button pressed, clearing playingVideoId');
                    setPlayingVideoId(null);
                  }}
                >
                  <MaterialIcons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            );
          })()
        ) : (
          // Show thumbnail when not playing
          <View
            style={[
              styles.fullWidthMediaPreview,
              index > 0 && styles.mediaSpacing
            ]}
          >
            <TouchableOpacity
              style={styles.videoThumbnailContainer}
              onPress={() => {
                // console.log('Video thumbnail pressed, starting video:', videoId);
                setPlayingVideoId(videoId);
              }}
              activeOpacity={0.7}
            >
              {/* Use Video component to show first frame as thumbnail */}
              <Video
                source={{ uri: attachment.url }}
                style={styles.videoThumbnail}
                shouldPlay={false}
                isLooping={false}
                isMuted={true}
                resizeMode={ResizeMode.COVER}
                useNativeControls={false}
              />
            </TouchableOpacity>
            
            {/* Play button overlay - also clickable */}
            <TouchableOpacity
              style={styles.videoOverlay}
              onPress={() => {
                // console.log('Play button pressed, starting video:', videoId);
                setPlayingVideoId(videoId);
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="play-circle-filled" size={48} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

      </View>
    );
  };

  const renderAudioPreview = (attachment: MemoryAttachment) => (
    <TouchableOpacity
      style={styles.audioPreview}
      onPress={() => {
        Alert.alert('Audio Player', 'Audio playback feature coming soon!');
      }}
    >
      <MaterialIcons name="audiotrack" size={24} color="#4f8cff" />
      <View style={styles.audioInfo}>
        <Text style={styles.audioTitle} numberOfLines={1}>
          {attachment.filename}
        </Text>
        <Text style={styles.audioSize}>
          {(attachment.size / 1024 / 1024).toFixed(1)} MB
        </Text>
      </View>
      <MaterialIcons name="play-arrow" size={20} color="#666" />
    </TouchableOpacity>
  );

  const renderFullScreenModal = () => (
    <Modal
      visible={showFullScreen}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowFullScreen(false)}
    >
      <View style={styles.fullScreenContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setShowFullScreen(false)}
        >
          <MaterialIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        
        {/* Gallery indicator */}
        {safeAttachments.length > 1 && (
          <View style={styles.galleryIndicator}>
            <Text style={styles.galleryIndicatorText}>
              Swipe to view all {safeAttachments.length} items
            </Text>
          </View>
        )}
        
        {selectedAttachment && (
          <ScrollView 
            style={styles.fullScreenContent}
            contentContainerStyle={styles.fullScreenContentContainer}
            showsVerticalScrollIndicator={false}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {safeAttachments.map((attachment, index) => (
              <View key={attachment.id || index} style={styles.fullScreenItem}>
                {attachment.type === 'image' && (
                  <Image
                    source={{ uri: attachment.url }}
                    style={styles.fullScreenImage}
                    resizeMode="contain"
                  />
                )}
                {attachment.type === 'video' && (
                  <VideoPlayer
                    uri={attachment.url}
                    style={styles.fullScreenVideo}
                  />
                )}
                
                <View style={styles.attachmentInfo}>
                  <Text style={styles.attachmentName}>{attachment.filename}</Text>
                  <Text style={styles.attachmentSize}>
                    {(attachment.size / 1024 / 1024).toFixed(1)} MB
                  </Text>
                  <Text style={styles.attachmentCounter}>
                    {index + 1} / {safeAttachments.length}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Images and Videos - Initial Preview */}
      {(images.length > 0 || videos.length > 0) && (
        <View style={styles.fullWidthMediaContainer}>
          {images.slice(0, maxPreviewCount).map((image, index) => 
            renderImagePreview(image, index)
          )}
          {videos.slice(0, maxPreviewCount - images.length).map((video, index) => 
            renderVideoPreview(video, images.length + index)
          )}
        </View>
      )}

      {/* Expanded Media - Show when expanded */}
      {isExpanded && safeAttachments.length > maxPreviewCount && (
        <View style={styles.expandedMediaContainer}>
          
          <View style={styles.expandedList}>
            {safeAttachments.slice(maxPreviewCount).map((attachment, index) => (
              <View key={attachment.id || `expanded-${index}`} style={styles.expandedListItem}>
                {attachment.type === 'image' && (
                  <TouchableOpacity
                    style={styles.expandedImageContainer}
                    onPress={() => {
                      setSelectedAttachment(attachment);
                      setShowFullScreen(true);
                    }}
                  >
                    <Image
                      source={{ uri: attachment.url }}
                      style={styles.expandedImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}
                {attachment.type === 'video' && (
                  <TouchableOpacity
                    style={styles.expandedVideoContainer}
                    onPress={() => {
                      setSelectedAttachment(attachment);
                      setShowFullScreen(true);
                    }}
                  >
                    <Video
                      source={{ uri: attachment.url }}
                      style={styles.expandedVideo}
                      shouldPlay={false}
                      isLooping={false}
                      isMuted={true}
                      resizeMode={ResizeMode.COVER}
                      useNativeControls={false}
                    />
                    <View style={styles.videoPlayOverlay}>
                      <MaterialIcons name="play-circle-filled" size={24} color="#fff" />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Audio Files */}
      {audios.length > 0 && (
        <View style={styles.audioContainer}>
          {audios.map((audio, index) => (
            <View key={`audio-${audio.id || index}`}>
              {renderAudioPreview(audio)}
            </View>
          ))}
        </View>
      )}

      {renderFullScreenModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  mediaContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  fullWidthMediaContainer: {
    marginBottom: 8,
  },
  mediaPreview: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  fullWidthMediaPreview: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  mediaSpacing: {
    marginTop: 12,
  },
  firstPreview: {
    marginLeft: 0,
  },
  lastPreview: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  fullWidthPreviewImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  countOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  overlayText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioContainer: {
    marginTop: 8,
  },
  audioPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  audioInfo: {
    flex: 1,
    marginLeft: 12,
  },
  audioTitle: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  audioSize: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  fullScreenContent: {
    flex: 1,
  },
  fullScreenContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: screenWidth,
    height: screenWidth * 0.75,
  },
  fullScreenVideo: {
    width: screenWidth,
    height: screenWidth * 0.75,
  },
  attachmentInfo: {
    padding: 20,
    alignItems: 'center',
  },
  attachmentName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
  },
  attachmentSize: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  fullScreenItem: {
    width: screenWidth,
    alignItems: 'center',
  },
  inlineVideoContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9, // Match image aspect ratio
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  inlineVideo: {
    width: '100%',
    height: '100%', // Fill container height
  },
  closeVideoButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    padding: 5,
  },
  videoThumbnailContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9, // Match video aspect ratio
    backgroundColor: '#333', // Dark background for video placeholder
    borderRadius: 8,
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  attachmentCounter: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
  galleryIndicator: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
  },
  galleryIndicatorText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  expandedMediaContainer: {
    marginTop: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  expandedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  collapseButton: {
    padding: 4,
  },
  expandedList: {
    gap: 12,
  },
  expandedListItem: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expandedImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4 / 3,
  },
  expandedImage: {
    width: '100%',
    height: '100%',
  },
  expandedVideoContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#000',
  },
  expandedVideo: {
    width: '100%',
    height: '100%',
  },
  videoPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  expandedItemInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
  },
  expandedItemName: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  expandIcon: {
    marginBottom: 4,
  },
}); 