import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ScreenOrientation from 'expo-screen-orientation';
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

// Generic attachment interface
interface BaseAttachment {
  id?: string;
  url: string;
  type: 'image' | 'video' | 'audio';
  fileName?: string;
  fileSize?: number;
}

interface MediaViewerBaseProps<T extends BaseAttachment> {
  attachments: T[];
  maxPreviewCount?: number;
  onAttachmentPress?: (attachment: T, index: number) => void;
  renderCustomContent?: (attachment: T, index: number) => React.ReactNode;
  enableOrientationControl?: boolean; // Optional flag to enable/disable orientation features
}

const { width: screenWidth } = Dimensions.get("window");
const PREVIEW_SIZE = 120;
const MAX_PREVIEW_COUNT = 2; // Show only 2 items initially

export default function MediaViewerBase<T extends BaseAttachment>({
  attachments,
  maxPreviewCount = MAX_PREVIEW_COUNT,
  onAttachmentPress,
  renderCustomContent,
  enableOrientationControl = false, // Default to false for safety
}: MediaViewerBaseProps<T>) {
  const [selectedAttachment, setSelectedAttachment] =
    useState<T | null>(null);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [currentScrollIndex, setCurrentScrollIndex] = useState<number>(0);
  const [showCounter, setShowCounter] = useState<boolean>(true);
  const [modalKey, setModalKey] = useState<number>(0);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [audioToggleKey, setAudioToggleKey] = useState<number>(0); // Add this for forcing re-render when audio changes
  const [mutedStates, setMutedStates] = useState<Record<string, boolean>>({}); // Track muted state per video
  const [modalOpeningKey, setModalOpeningKey] = useState<number>(0); // Track when modal is opening
  const [videoTimestamp, setVideoTimestamp] = useState<number>(Date.now()); // Track video timestamp
  const [isLandscape, setIsLandscape] = useState<boolean>(false); // Track orientation state
  const [originalOrientation, setOriginalOrientation] = useState<number | null>(null); // Store original orientation
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Ensure attachments are valid and have required fields
  const safeAttachments = useMemo(() => {
    if (!attachments || !Array.isArray(attachments)) {
      console.log('MediaViewerBase: attachments is null/undefined or not an array:', attachments);
      return [];
    }
    
    const filtered = attachments
      .filter((att) => att && att.url && att.type)
      .sort((a, b) => {
        // Sort images first, then videos, then audio
        const typeOrder = { image: 0, video: 1, audio: 2 };
        return typeOrder[a.type] - typeOrder[b.type];
      });
    
    console.log('MediaViewerBase: safeAttachments processed:', {
      originalCount: attachments.length,
      filteredCount: filtered.length,
      attachments: filtered.map(att => ({
        id: att.id,
        url: att.url,
        type: att.type,
        hasId: !!att.id
      }))
    });
    
    return filtered;
  }, [attachments]);

  // Create video players for all video attachments at the top level
  const videoAttachments = safeAttachments.filter(att => att.type === 'video');
  
  console.log('MediaViewerBase: videoAttachments found:', {
    count: videoAttachments.length,
    videos: videoAttachments.map(v => ({
      id: v.id,
      url: v.url,
      hasId: !!v.id
    }))
  });
  
  // Create individual video players at the top level with unique keys
  const player1 = videoAttachments[0] ? useVideoPlayer({ uri: videoAttachments[0].url }, (player) => {
    console.log('MediaViewerBase: player1 initialized for:', videoAttachments[0].url);
    player.loop = false;
    player.muted = false; // Enable audio
    player.volume = 1.0; // Set volume to maximum
  }) : null;
  
  const player2 = videoAttachments[1] ? useVideoPlayer({ uri: videoAttachments[1].url }, (player) => {
    console.log('MediaViewerBase: player2 initialized for:', videoAttachments[1].url);
    player.loop = false;
    player.muted = false; // Enable audio
    player.volume = 1.0; // Set volume to maximum
  }) : null;
  
  const player3 = videoAttachments[2] ? useVideoPlayer({ uri: videoAttachments[2].url }, (player) => {
    console.log('MediaViewerBase: player3 initialized for:', videoAttachments[2].url);
    player.loop = false;
    player.muted = false; // Enable audio
    player.volume = 1.0; // Set volume to maximum
  }) : null;
  
  const player4 = videoAttachments[3] ? useVideoPlayer({ uri: videoAttachments[3].url }, (player) => {
    console.log('MediaViewerBase: player4 initialized for:', videoAttachments[3].url);
    player.loop = false;
    player.muted = false; // Enable audio
    player.volume = 1.0; // Set volume to maximum
  }) : null;
  
  const player5 = videoAttachments[4] ? useVideoPlayer({ uri: videoAttachments[4].url }, (player) => {
    console.log('MediaViewerBase: player5 initialized for:', videoAttachments[4].url);
    player.loop = false;
    player.muted = false; // Enable audio
    player.volume = 1.0; // Set volume to maximum
  }) : null;

  const players = [player1, player2, player3, player4, player5];
  
  const videoPlayers = videoAttachments.map((attachment, index) => ({
    attachment: {
      ...attachment,
      // Use URL as fallback ID if attachment.id is undefined
      id: attachment.id || attachment.url
    },
    player: players[index]
  }));

  console.log('MediaViewerBase: videoPlayers created:', {
    count: videoPlayers.length,
    players: videoPlayers.map(vp => ({
      attachmentId: vp.attachment.id,
      attachmentUrl: vp.attachment.url,
      hasPlayer: !!vp.player,
      hasId: !!vp.attachment.id,
      fallbackId: vp.attachment.id === vp.attachment.url ? 'using URL as ID' : 'using original ID'
    }))
  });

  // Helper function to get video player
  const getVideoPlayer = useCallback((attachment: T) => {
    // If attachment has no ID, match by URL only
    if (!attachment.id) {
      const videoPlayer = videoPlayers.find(vp => vp.attachment.url === attachment.url);
      
      console.log('MediaViewerBase: getVideoPlayer called for (no ID):', {
        attachmentId: attachment.id,
        attachmentUrl: attachment.url,
        foundPlayer: !!videoPlayer,
        foundPlayerAttachmentId: videoPlayer?.attachment.id,
        foundPlayerAttachmentUrl: videoPlayer?.attachment.url
      });
      
      return videoPlayer?.player || null;
    }
    
    // If attachment has ID, try to match by ID first, then by URL
    const videoPlayer = videoPlayers.find(vp => 
      vp.attachment.id === attachment.id || vp.attachment.url === attachment.url
    );
    
    console.log('MediaViewerBase: getVideoPlayer called for (with ID):', {
      attachmentId: attachment.id,
      attachmentUrl: attachment.url,
      foundPlayer: !!videoPlayer,
      foundPlayerAttachmentId: videoPlayer?.attachment.id,
      foundPlayerAttachmentUrl: videoPlayer?.attachment.url
    });
    
    return videoPlayer?.player || null;
  }, [videoPlayers]);

  // Orientation handling functions
  const lockToLandscape = useCallback(async () => {
    try {
      // Check if ScreenOrientation is available
      if (!ScreenOrientation || !ScreenOrientation.getOrientationAsync) {
        console.warn('MediaViewerBase: ScreenOrientation not available');
        return;
      }
      
      // Store current orientation before changing
      const currentOrientation = await ScreenOrientation.getOrientationAsync();
      setOriginalOrientation(currentOrientation);
      
      // Lock to landscape
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      setIsLandscape(true);
      console.log('MediaViewerBase: Locked to landscape mode');
    } catch (error) {
      console.warn('MediaViewerBase: Failed to lock to landscape:', error);
      // Fallback - just set the state without actually changing orientation
      setIsLandscape(true);
    }
  }, []);

  const unlockOrientation = useCallback(async () => {
    try {
      // Check if ScreenOrientation is available
      if (!ScreenOrientation || !ScreenOrientation.unlockAsync) {
        console.warn('MediaViewerBase: ScreenOrientation not available');
        return;
      }
      
      // Unlock orientation to allow all orientations
      await ScreenOrientation.unlockAsync();
      setIsLandscape(false);
      console.log('MediaViewerBase: Unlocked orientation');
    } catch (error) {
      console.warn('MediaViewerBase: Failed to unlock orientation:', error);
      // Fallback - just set the state without actually changing orientation
      setIsLandscape(false);
    }
  }, []);

  // Control playing status - track which video is currently playing
  const handleVideoPlay = useCallback((videoId: string) => {
    console.log('MediaViewerBase: handleVideoPlay called with videoId:', videoId);
    setPlayingVideoId(videoId);
  }, []);

  // Stop all videos when modal closes
  const handleModalClose = useCallback(() => {
    console.log('MediaViewerBase: handleModalClose called, current modalKey:', modalKey);
    setShowFullScreen(false);
    setPlayingVideoId(null);
    
    // Unlock orientation when modal closes (only if enabled)
    if (enableOrientationControl) {
      unlockOrientation();
    }
    
    // Force remount of video components by updating modal key
    setModalKey(prev => {
      const newKey = prev + 1;
      console.log('MediaViewerBase: modalKey updated from', prev, 'to', newKey);
      return newKey;
    });
  }, [modalKey, unlockOrientation, enableOrientationControl]);

  // Reset video player when modal opens
  const handleModalOpen = useCallback((attachment: T) => {
    console.log('MediaViewerBase: handleModalOpen called for:', {
      attachmentId: attachment.id,
      attachmentUrl: attachment.url,
      currentModalKey: modalKey
    });
    
    // Force video player reset by incrementing modalOpeningKey and updating timestamp
    setModalOpeningKey(prev => {
      const newKey = prev + 1;
      console.log('MediaViewerBase: modalOpeningKey updated from', prev, 'to', newKey);
      return newKey;
    });
    
    // Update video timestamp to force remounting
    setVideoTimestamp(Date.now());
    console.log('MediaViewerBase: videoTimestamp updated to:', Date.now());
    
    const actualIndex = safeAttachments.findIndex(att => att.id === attachment.id);
    setSelectedAttachment(attachment);
    setSelectedIndex(actualIndex >= 0 ? actualIndex : 0);
    setCurrentScrollIndex(actualIndex >= 0 ? actualIndex : 0);
    setShowFullScreen(true);
    
    // Lock to landscape for video full-screen experience (only if enabled)
    if (attachment.type === 'video' && enableOrientationControl) {
      lockToLandscape();
    }
    
    // Track which video is playing
    handleVideoPlay(attachment.id || attachment.url);
    onAttachmentPress?.(attachment, actualIndex >= 0 ? actualIndex : 0);
  }, [safeAttachments, modalKey, handleVideoPlay, onAttachmentPress, lockToLandscape, enableOrientationControl]);

  // Cleanup video players when component unmounts or attachments change
  useEffect(() => {
    return () => {
      // Cleanup function - video players will be automatically cleaned up by expo-video
      // Also unlock orientation when component unmounts (only if enabled)
      if (enableOrientationControl) {
        unlockOrientation();
      }
    };
  }, [unlockOrientation, enableOrientationControl]);

  // Early return if no attachments
  if (!attachments || !Array.isArray(attachments) || safeAttachments.length === 0) {
    return null;
  }

  // Generate a unique key for this media's expanded state
  const getExpandedStateKey = useCallback(() => {
    if (!safeAttachments || safeAttachments.length === 0) return null;
    // Use the first attachment's ID or a combination of attachment IDs
    const attachmentIds = safeAttachments
      .map((att) => att.id)
      .sort()
      .join("-");
    return `media_expanded_${attachmentIds}`;
  }, [safeAttachments]);

  // Load expanded state from AsyncStorage
  useEffect(() => {
    const loadExpandedState = async () => {
      try {
        const key = getExpandedStateKey();
        if (key) {
          const savedState = await AsyncStorage.getItem(key);
          if (savedState) {
            setIsExpanded(JSON.parse(savedState));
          }
        }
      } catch (error) {
        console.warn('Error loading expanded state:', error);
      }
    };

    loadExpandedState();
  }, [getExpandedStateKey]);

  // Save expanded state to AsyncStorage
  const saveExpandedState = useCallback(async (expanded: boolean) => {
    try {
      const key = getExpandedStateKey();
      if (key) {
        await AsyncStorage.setItem(key, JSON.stringify(expanded));
      }
    } catch (error) {
      console.warn('Error saving expanded state:', error);
    }
  }, [getExpandedStateKey]);

  // Handle expand/collapse toggle
  const handleToggleExpanded = useCallback(async () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    await saveExpandedState(newExpandedState);
  }, [isExpanded, saveExpandedState]);

  const renderImagePreview = (attachment: T, index: number) => (
    <TouchableOpacity
      style={[styles.fullWidthMediaPreview, index > 0 && styles.mediaSpacing]}
      onPress={() => {
        const actualIndex = safeAttachments.findIndex(att => att.id === attachment.id);
        setSelectedAttachment(attachment);
        setSelectedIndex(actualIndex >= 0 ? actualIndex : 0);
        setCurrentScrollIndex(actualIndex >= 0 ? actualIndex : 0);
        setShowFullScreen(true);
        onAttachmentPress?.(attachment, actualIndex >= 0 ? actualIndex : 0);
      }}
      activeOpacity={0.7}
      key={`image-${attachment.id || index}`}
    >
      <Image
        source={{ uri: attachment.url }}
        style={styles.fullWidthPreviewImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const renderVideoPreview = (attachment: T, index: number) => {
    const videoId = attachment.id || attachment.url;
    const isMuted = mutedStates[videoId] ?? false; // Default to false (unmuted)
    
    console.log('MediaViewerBase: renderVideoPreview called for:', {
      attachmentId: attachment.id,
      attachmentUrl: attachment.url,
      videoId,
      index,
      isMuted,
      modalKey
    });
    
    // Get video player using the helper function
    const player = getVideoPlayer(attachment);

    const toggleAudio = () => {
      if (player) {
        const newMutedState = !isMuted;
        console.log('MediaViewerBase: toggleAudio called:', { 
          videoId, 
          oldMuted: isMuted, 
          newMuted: newMutedState 
        });
        player.muted = newMutedState;
        setMutedStates((prev: Record<string, boolean>) => ({
          ...prev,
          [videoId]: newMutedState
        }));
        setAudioToggleKey(prev => prev + 1); // Force re-render to update the icon
      }
    };

    return (
      <TouchableOpacity
        style={[styles.fullWidthMediaPreview, index > 0 && styles.mediaSpacing]}
        onPress={() => {
          handleModalOpen(attachment);
        }}
        activeOpacity={0.7}
        key={`video-${attachment.id || index}`}
      >
        <View style={styles.videoThumbnailContainer}>
          {player && (
            <VideoView
              key={`video-thumbnail-${modalKey}-${attachment.id || attachment.url}-${Date.now()}`}
              player={player}
              style={styles.videoThumbnail}
              contentFit="contain"
              nativeControls={true}
              allowsFullscreen={true}
            />
          )}
        </View>
        
        {/* Play button overlay */}
        <TouchableOpacity
          style={styles.videoOverlay}
          onPress={() => {
            handleModalOpen(attachment);
          }}
          activeOpacity={0.7}
        >
          <MaterialIcons name="play-circle-filled" size={48} color="#fff" />
        </TouchableOpacity>
        
        {/* Audio toggle button */}
        <TouchableOpacity
          style={[styles.audioButton, { position: 'absolute', top: 10, right: 10 }]}
          onPress={toggleAudio}
          activeOpacity={0.7}
        >
          <MaterialIcons
            key={`audio-icon-${audioToggleKey}-${isMuted ? 'muted' : 'unmuted'}`}
            name={isMuted ? "volume-off" : "volume-up"}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderAudioPreview = (attachment: T) => (
    <TouchableOpacity
      style={styles.audioPreview}
      onPress={() => {
        // Handle audio playback if needed
        console.log('Audio clicked:', attachment);
      }}
    >
      <MaterialIcons name="audiotrack" size={24} color="#4f8cff" />
      <View style={styles.audioInfo}>
        <Text style={styles.audioTitle} numberOfLines={1}>
          {attachment.fileName || 'Audio File'}
        </Text>
        <Text style={styles.audioSize}>
          {attachment.fileSize ? `${(attachment.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}
        </Text>
      </View>
      <MaterialIcons name="play-arrow" size={20} color="#666" />
    </TouchableOpacity>
  );

  const renderMediaGrid = (
    mediaItems: T[],
    showAll: boolean = false
  ) => {
    const images = mediaItems.filter((item) => item.type === "image");
    const videos = mediaItems.filter((item) => item.type === "video");
    const audios = mediaItems.filter((item) => item.type === "audio");

    const displayItems = showAll ? mediaItems : mediaItems.slice(0, maxPreviewCount);
    const hasMoreItems = mediaItems.length > maxPreviewCount;

    return (
      <View style={styles.fullWidthMediaContainer}>
        {displayItems.map((item, index) => {
          if (renderCustomContent) {
            return renderCustomContent(item, index);
          }

          switch (item.type) {
            case "image":
              return renderImagePreview(item, index);
            case "video":
              return renderVideoPreview(item, index);
            case "audio":
              return renderAudioPreview(item);
            default:
              return null;
          }
        })}

        {/* Show more button */}
        {!showAll && hasMoreItems && (
          <TouchableOpacity
            style={[styles.showMoreButton, { marginTop: 8 }]}
            onPress={handleToggleExpanded}
          >
            <Text style={styles.showMoreText}>
              Show {mediaItems.length - maxPreviewCount} more
            </Text>
          </TouchableOpacity>
        )}

        {/* Show less button */}
        {showAll && hasMoreItems && (
          <TouchableOpacity
            style={[styles.showMoreButton, { marginTop: 8 }]}
            onPress={handleToggleExpanded}
          >
            <Text style={styles.showMoreText}>Show less</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderFullScreenModal = () => (
    <Modal
      visible={showFullScreen}
      transparent={true}
      animationType="fade"
      onRequestClose={handleModalClose}
    >
      <View style={[
        styles.fullScreenContainer,
        isLandscape && styles.fullScreenContainerLandscape
      ]}>
        <TouchableOpacity
          style={[
            styles.closeButton,
            isLandscape && styles.closeButtonLandscape
          ]}
          onPress={handleModalClose}
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
            ref={scrollViewRef}
            style={styles.fullScreenContent}
            contentContainerStyle={styles.fullScreenContentContainer}
            showsVerticalScrollIndicator={false}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: (selectedIndex + 1) * screenWidth, y: 0 }}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              let actualIndex = newIndex - 1;
              
              // Handle infinite scroll
              if (actualIndex < 0) {
                actualIndex = safeAttachments.length - 1;
                // Jump to the last real item
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({ x: safeAttachments.length * screenWidth, animated: false });
                }, 0);
              } else if (actualIndex >= safeAttachments.length) {
                actualIndex = 0;
                // Jump to the first real item
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({ x: screenWidth, animated: false });
                }, 0);
              }
              
              setCurrentScrollIndex(actualIndex);
              
              // Show counter again after scrolling stops
              setTimeout(() => {
                setShowCounter(true);
              }, 1000); // Show after 1 second of no scrolling
            }}
            onScroll={(event) => {
              const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              let actualIndex = newIndex - 1;
              
              // Handle infinite scroll
              if (actualIndex < 0) {
                actualIndex = safeAttachments.length - 1;
              } else if (actualIndex >= safeAttachments.length) {
                actualIndex = 0;
              }
              
              setCurrentScrollIndex(actualIndex);
            }}
            onScrollBeginDrag={() => {
              // Hide counter when user starts scrolling
              setShowCounter(false);
            }}
            scrollEventThrottle={16}
          >
            {/* Clone last item at the beginning */}
            {safeAttachments.length > 1 && safeAttachments.slice(-1).map((attachment, _index) => (
              <View key={`clone-last-${attachment.id}`} style={styles.fullScreenItem}>
                {attachment.type === "image" && (
                  <Image
                    source={{ uri: attachment.url }}
                    style={styles.fullScreenImage}
                    resizeMode="cover"
                  />
                )}
                {attachment.type === "video" && (() => {
                  const player = getVideoPlayer(attachment);
                  const videoId = attachment.id || attachment.url;
                  const isMuted = mutedStates[videoId] ?? false;
                  
                  console.log('MediaViewerBase: Full screen video (clone last) rendering:', {
                    attachmentId: attachment.id,
                    attachmentUrl: attachment.url,
                    videoId,
                    hasPlayer: !!player,
                    modalKey,
                    isMuted
                  });
                  
                  const toggleAudio = () => {
                    if (player) {
                      const newMutedState = !isMuted;
                      player.muted = newMutedState;
                      setMutedStates((prev: Record<string, boolean>) => ({
                        ...prev,
                        [videoId]: newMutedState
                      }));
                    }
                  };
                  
                  return player ? (
                    <View style={[
                      styles.fullScreenVideo, 
                      { backgroundColor: '#000' },
                      isLandscape && styles.fullScreenVideoLandscape
                    ]}>
                      <VideoView
                        key={`video-fullscreen-${modalKey}-${modalOpeningKey}-${attachment.id || attachment.url}-${Date.now()}-${showFullScreen ? 'open' : 'closed'}`}
                        player={player}
                        style={[
                          styles.fullScreenVideo,
                          isLandscape && styles.fullScreenVideoLandscape
                        ]}
                        contentFit="contain"
                        nativeControls={true}
                        allowsFullscreen={true}
                      />
                      {/* Audio toggle button for full screen */}
                      <TouchableOpacity
                        style={[
                          styles.audioButton, 
                          { position: 'absolute', top: 10, right: 10 },
                          isLandscape && styles.audioButtonLandscape
                        ]}
                        onPress={toggleAudio}
                        activeOpacity={0.7}
                      >
                        <MaterialIcons 
                          name={isMuted ? "volume-off" : "volume-up"} 
                          size={24} 
                          color="#fff" 
                        />
                      </TouchableOpacity>
                      
                      {/* Full-screen toggle button (only show when orientation control is enabled) */}
                      {enableOrientationControl && (
                        <TouchableOpacity
                          style={[
                            styles.fullScreenToggleButton,
                            { position: 'absolute', top: 10, left: 10 },
                            isLandscape && styles.fullScreenToggleButtonLandscape
                          ]}
                          onPress={() => {
                            if (isLandscape) {
                              unlockOrientation();
                            } else {
                              lockToLandscape();
                            }
                          }}
                          activeOpacity={0.7}
                        >
                          <MaterialIcons 
                            name={isLandscape ? "fullscreen-exit" : "fullscreen"} 
                            size={24} 
                            color="#fff" 
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : null;
                })()}
              </View>
            ))}
            
            {/* Original items */}
            {safeAttachments.map((attachment, index) => (
              <View key={attachment.id || index} style={styles.fullScreenItem}>
                {attachment.type === "image" && (
                  <Image
                    source={{ uri: attachment.url }}
                    style={styles.fullScreenImage}
                    resizeMode="cover"
                  />
                )}
                {attachment.type === "video" && (() => {
                  const player = getVideoPlayer(attachment);
                  const videoId = attachment.id || attachment.url;
                  const isMuted = mutedStates[videoId] ?? false;
                  
                  console.log('MediaViewerBase: Full screen video (original) rendering:', {
                    attachmentId: attachment.id,
                    attachmentUrl: attachment.url,
                    videoId,
                    hasPlayer: !!player,
                    modalKey,
                    isMuted,
                    index
                  });
                  
                  const toggleAudio = () => {
                    if (player) {
                      const newMutedState = !isMuted;
                      player.muted = newMutedState;
                      setMutedStates((prev: Record<string, boolean>) => ({
                        ...prev,
                        [videoId]: newMutedState
                      }));
                    }
                  };
                  
                  return player ? (
                    <View style={[
                      styles.fullScreenVideo, 
                      { backgroundColor: '#000' },
                      isLandscape && styles.fullScreenVideoLandscape
                    ]}>
                      <VideoView
                        key={`video-fullscreen-${modalKey}-${modalOpeningKey}-${attachment.id || attachment.url}-${Date.now()}-${showFullScreen ? 'open' : 'closed'}`}
                        player={player}
                        style={[
                          styles.fullScreenVideo,
                          isLandscape && styles.fullScreenVideoLandscape
                        ]}
                        contentFit="contain"
                        nativeControls={true}
                        allowsFullscreen={true}
                      />
                      {/* Audio toggle button for full screen */}
                      <TouchableOpacity
                        style={[
                          styles.audioButton, 
                          { position: 'absolute', top: 10, right: 10 },
                          isLandscape && styles.audioButtonLandscape
                        ]}
                        onPress={toggleAudio}
                        activeOpacity={0.7}
                      >
                        <MaterialIcons 
                          name={isMuted ? "volume-off" : "volume-up"} 
                          size={24} 
                          color="#fff" 
                        />
                      </TouchableOpacity>
                      
                      {/* Full-screen toggle button (only show when orientation control is enabled) */}
                      {enableOrientationControl && (
                        <TouchableOpacity
                          style={[
                            styles.fullScreenToggleButton,
                            { position: 'absolute', top: 10, left: 10 },
                            isLandscape && styles.fullScreenToggleButtonLandscape
                          ]}
                          onPress={() => {
                            if (isLandscape) {
                              unlockOrientation();
                            } else {
                              lockToLandscape();
                            }
                          }}
                          activeOpacity={0.7}
                        >
                          <MaterialIcons 
                            name={isLandscape ? "fullscreen-exit" : "fullscreen"} 
                            size={24} 
                            color="#fff" 
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : null;
                })()}
              </View>
            ))}
            
            {/* Clone first item at the end */}
            {safeAttachments.length > 1 && safeAttachments.slice(0, 1).map((attachment, _index) => (
              <View key={`clone-first-${attachment.id}`} style={styles.fullScreenItem}>
                {attachment.type === "image" && (
                  <Image
                    source={{ uri: attachment.url }}
                    style={styles.fullScreenImage}
                    resizeMode="cover"
                  />
                )}
                {attachment.type === "video" && (() => {
                  const player = getVideoPlayer(attachment);
                  const videoId = attachment.id || attachment.url;
                  const isMuted = mutedStates[videoId] ?? false;
                  
                  console.log('MediaViewerBase: Full screen video (clone first) rendering:', {
                    attachmentId: attachment.id,
                    attachmentUrl: attachment.url,
                    videoId,
                    hasPlayer: !!player,
                    modalKey,
                    isMuted
                  });
                  
                  const toggleAudio = () => {
                    if (player) {
                      const newMutedState = !isMuted;
                      player.muted = newMutedState;
                      setMutedStates((prev: Record<string, boolean>) => ({
                        ...prev,
                        [videoId]: newMutedState
                      }));
                    }
                  };
                  
                  return player ? (
                    <View style={[
                      styles.fullScreenVideo, 
                      { backgroundColor: '#000' },
                      isLandscape && styles.fullScreenVideoLandscape
                    ]}>
                      <VideoView
                        key={`video-fullscreen-${modalKey}-${modalOpeningKey}-${attachment.id || attachment.url}-${Date.now()}-${showFullScreen ? 'open' : 'closed'}`}
                        player={player}
                        style={[
                          styles.fullScreenVideo,
                          isLandscape && styles.fullScreenVideoLandscape
                        ]}
                        contentFit="contain"
                        nativeControls={true}
                        allowsFullscreen={true}
                      />
                      {/* Audio toggle button for full screen */}
                      <TouchableOpacity
                        style={[
                          styles.audioButton, 
                          { position: 'absolute', top: 10, right: 10 },
                          isLandscape && styles.audioButtonLandscape
                        ]}
                        onPress={toggleAudio}
                        activeOpacity={0.7}
                      >
                        <MaterialIcons 
                          name={isMuted ? "volume-off" : "volume-up"} 
                          size={24} 
                          color="#fff" 
                        />
                      </TouchableOpacity>
                      
                      {/* Full-screen toggle button (only show when orientation control is enabled) */}
                      {enableOrientationControl && (
                        <TouchableOpacity
                          style={[
                            styles.fullScreenToggleButton,
                            { position: 'absolute', top: 10, left: 10 },
                            isLandscape && styles.fullScreenToggleButtonLandscape
                          ]}
                          onPress={() => {
                            if (isLandscape) {
                              unlockOrientation();
                            } else {
                              lockToLandscape();
                            }
                          }}
                          activeOpacity={0.7}
                        >
                          <MaterialIcons 
                            name={isLandscape ? "fullscreen-exit" : "fullscreen"} 
                            size={24} 
                            color="#fff" 
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : null;
                })()}
              </View>
            ))}
          </ScrollView>
        )}

        {/* Counter at bottom */}
        {selectedAttachment && safeAttachments.length > 1 && showCounter && (
          <View style={styles.fullScreenInfoContainer}>
            <Text style={styles.attachmentCounter}>
              {currentScrollIndex + 1} / {safeAttachments.length}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Images and Videos */}
      {(safeAttachments.filter(item => item.type === 'image').length > 0 || 
        safeAttachments.filter(item => item.type === 'video').length > 0) && (
        renderMediaGrid(safeAttachments, isExpanded) // Use full safeAttachments array to preserve indices
      )}

      {/* Audio Files */}
      {safeAttachments.filter(item => item.type === 'audio').length > 0 && (
        <View style={styles.audioContainer}>
          {safeAttachments.filter(item => item.type === 'audio').map((audio, index) => (
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
  fullWidthMediaContainer: {
    marginBottom: 8,
  },
  fullWidthMediaPreview: {
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  mediaSpacing: {
    marginTop: 12,
  },
  fullWidthPreviewImage: {
    width: "100%",
    height: 180, // Increased height to show more of the image
  },

  audioContainer: {
    marginTop: 8,
  },
  audioPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9ff",
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
    fontWeight: "500",
    color: "#333",
  },
  audioSize: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  videoThumbnailContainer: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#333",
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  audioButton: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
  },

  showMoreButton: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  showMoreText: {
    fontSize: 12,
    color: "#666",
  },

  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  fullScreenContainerLandscape: {
    backgroundColor: "#000",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
  },
  closeButtonLandscape: {
    top: 20,
    right: 20,
  },
  galleryIndicator: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1000,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  galleryIndicatorText: {
    color: "#fff",
    fontSize: 12,
  },
  fullScreenContent: {
    flex: 1,
  },
  fullScreenContentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenItem: {
    width: screenWidth,
    alignItems: "center",
  },
  fullScreenImage: {
    width: screenWidth,
    height: screenWidth,
  },
  fullScreenVideo: {
    width: screenWidth,
    aspectRatio: 16/9, // Use aspectRatio instead of hard-coded height
    backgroundColor: '#000', // Black background for any small borders
  },
  fullScreenVideoLandscape: {
    width: '100%',
    height: '100%',
    aspectRatio: undefined, // Remove aspect ratio constraint in landscape
  },
  audioButtonLandscape: {
    top: 20,
    right: 20,
  },
  fullScreenToggleButton: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
  },
  fullScreenToggleButtonLandscape: {
    top: 20,
    left: 20,
  },
  fullScreenInfoContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  attachmentCounter: {
    color: "#fff",
    fontSize: 14,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
}); 