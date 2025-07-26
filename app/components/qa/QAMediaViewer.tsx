import { MaterialIcons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import React, { useState } from "react";
import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { PromptResponseAttachment } from "../../services/promptService";

interface QAMediaViewerProps {
  attachments: PromptResponseAttachment[];
  maxPreviewCount?: number;
}

const { width: screenWidth } = Dimensions.get("window");
const MAX_PREVIEW_COUNT = 2; // Show only 2 items initially

export default function QAMediaViewer({
  attachments,
  maxPreviewCount = MAX_PREVIEW_COUNT,
}: QAMediaViewerProps) {
  const [selectedAttachment, setSelectedAttachment] =
    useState<PromptResponseAttachment | null>(null);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [currentScrollIndex, setCurrentScrollIndex] = useState<number>(0);
  const [showCounter, setShowCounter] = useState<boolean>(true);
  const [modalKey, setModalKey] = useState<number>(0); // Add this for forcing re-render
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Ensure attachments are valid and have required fields
  const safeAttachments = React.useMemo(() => {
    return attachments
      .filter((att) => att && att.url && att.type)
      .sort((a, b) => {
        // Sort images first, then videos, then audio
        const typeOrder = { image: 0, video: 1, audio: 2 };
        return typeOrder[a.type] - typeOrder[b.type];
      });
  }, [attachments]);

  if (!safeAttachments || safeAttachments.length === 0) {
    return null;
  }

  const images = safeAttachments.filter((att) => att.type === "image");
  const videos = safeAttachments.filter((att) => att.type === "video");
  const audios = safeAttachments.filter((att) => att.type === "audio");

  const renderImagePreview = (attachment: PromptResponseAttachment, index: number) => (
    <TouchableOpacity
      style={[styles.fullWidthMediaPreview, index > 0 && styles.mediaSpacing]}
      onPress={() => {
        // Find the actual index in the full safeAttachments array
        const actualIndex = safeAttachments.findIndex(att => att.id === attachment.id);
        setSelectedAttachment(attachment);
        setSelectedIndex(actualIndex >= 0 ? actualIndex : 0);
        setCurrentScrollIndex(actualIndex >= 0 ? actualIndex : 0);
        setShowFullScreen(true);
      }}
      key={`image-${attachment.id || index}`}
    >
      <Image
        source={{ uri: attachment.url }}
        style={styles.fullWidthPreviewImage}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );

  const renderVideoPreview = (attachment: PromptResponseAttachment, index: number) => {
    return (
      <TouchableOpacity
        style={[styles.fullWidthMediaPreview, index > 0 && styles.mediaSpacing]}
        onPress={() => {
          // Find the actual index in the full safeAttachments array
          const actualIndex = safeAttachments.findIndex(att => att.id === attachment.id);
          console.log('Video clicked:', { attachment, actualIndex, url: attachment.url });
          setSelectedAttachment(attachment);
          setSelectedIndex(actualIndex >= 0 ? actualIndex : 0);
          setCurrentScrollIndex(actualIndex >= 0 ? actualIndex : 0);
          setModalKey(prev => prev + 1); // Force re-render
          setShowFullScreen(true);
        }}
        activeOpacity={0.7}
        key={`video-${attachment.id || index}`}
      >
        <View style={styles.videoThumbnailContainer}>
          <Video
            source={{ uri: attachment.url }}
            style={styles.videoThumbnail}
            shouldPlay={false}
            isLooping={false}
            isMuted={true}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls={false}
          />
          
          {/* Visual play button indicator (non-interactive) */}
          <View style={styles.videoPlayIndicator}>
            <MaterialIcons name="play-circle-filled" size={48} color="#fff" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAudioPreview = (attachment: PromptResponseAttachment) => (
    <TouchableOpacity
      style={styles.audioPreview}
      onPress={() => {
        // TODO: Implement audio playback
        console.log('Audio playback not implemented yet');
      }}
    >
      <MaterialIcons name="audiotrack" size={24} color="#4f8cff" />
      <View style={styles.audioInfo}>
        <Text style={styles.audioTitle} numberOfLines={1}>
          {attachment.filename || 'Audio File'}
        </Text>
        <Text style={styles.audioSize}>
          {(attachment.size / 1024 / 1024).toFixed(1)} MB
        </Text>
      </View>
      <MaterialIcons name="play-arrow" size={20} color="#666" />
    </TouchableOpacity>
  );

  const renderMediaGrid = (
    mediaItems: PromptResponseAttachment[],
    showAll: boolean = false
  ) => {
    const itemsToShow = showAll
      ? mediaItems
      : mediaItems.slice(0, maxPreviewCount);

    return (
      <View style={styles.fullWidthMediaContainer}>
        {itemsToShow.map((attachment, index) => {
          if (attachment.type === "image") {
            return renderImagePreview(attachment, index);
          } else if (attachment.type === "video") {
            return renderVideoPreview(attachment, index);
          }
          return null;
        })}
      </View>
    );
  };

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
                {attachment.type === "video" && (
                  <View style={[styles.fullScreenVideo, { backgroundColor: '#333' }]}>
                    <Video
                      key={`video-${modalKey}-${attachment.id}`}
                      source={{ uri: attachment.url }}
                      style={styles.fullScreenVideo}
                      shouldPlay={true}
                      useNativeControls={false}
                      resizeMode={ResizeMode.CONTAIN}
                      isLooping={false}
                    />
                  </View>
                )}
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
                {attachment.type === "video" && (
                  <View style={[styles.fullScreenVideo, { backgroundColor: '#333' }]}>
                    <Video
                      key={`video-${modalKey}-${attachment.id}`}
                      source={{ uri: attachment.url }}
                      style={styles.fullScreenVideo}
                      shouldPlay={true}
                      useNativeControls={false}
                      resizeMode={ResizeMode.CONTAIN}
                      isLooping={false}
                    />
                  </View>
                )}
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
                {attachment.type === "video" && (
                  <View style={[styles.fullScreenVideo, { backgroundColor: '#333' }]}>
                    <Video
                      key={`video-${modalKey}-${attachment.id}`}
                      source={{ uri: attachment.url }}
                      style={styles.fullScreenVideo}
                      shouldPlay={true}
                      useNativeControls={false}
                      resizeMode={ResizeMode.CONTAIN}
                      isLooping={false}
                    />
                  </View>
                )}
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
      {(images.length > 0 || videos.length > 0) && (
        renderMediaGrid(safeAttachments, true) // Use full safeAttachments array to preserve indices
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
    color: "#333",
    fontWeight: "500",
  },
  audioSize: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  fullScreenContainer: {
    flex: 1,
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
  fullScreenContent: {
    flex: 1,
  },
  fullScreenContentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: screenWidth,
    height: screenWidth, // Square aspect ratio for better mobile viewing
  },
  fullScreenVideo: {
    width: screenWidth,
    height: screenWidth, // Square aspect ratio for better mobile viewing
  },
  fullScreenInfoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 20,
    alignItems: "center",
  },
  attachmentCounter: {
    fontSize: 12,
    color: "#ccc",
    marginTop: 8,
    textAlign: "center",
  },
  fullScreenItem: {
    width: screenWidth,
    alignItems: "center",
  },
  videoThumbnailContainer: {
    position: "relative",
    width: "100%",
    height: 180, // Increased height to show more of the video
    backgroundColor: "#333",
    borderRadius: 8,
    overflow: "hidden",
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
  },
  videoPlayIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  galleryIndicator: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
    alignItems: "center",
  },
  galleryIndicatorText: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
  },
}); 