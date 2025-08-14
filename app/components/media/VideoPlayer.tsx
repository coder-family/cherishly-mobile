import { MaterialIcons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface VideoPlayerProps {
  uri: string;
  onPress?: () => void;
  style?: any;
  showControls?: boolean;
  autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = React.memo(({
  uri,
  onPress,
  style,
  showControls = true,
  autoPlay = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Always call useVideoPlayer to follow React Hooks rules
  const player = useVideoPlayer({ uri }, (player) => {
    // Initialize player with default settings
    player.loop = false;
    player.muted = false;
    player.volume = 1.0;
    setIsLoaded(true);
  });

  // Use useEffect to manage player state based on visibility
  useEffect(() => {
    if (player && isVisible) {
      // Player is now visible, ensure it's properly configured
      player.loop = false;
      player.muted = false;
      player.volume = 1.0;
    }
  }, [player, isVisible]);

  const handlePress = useCallback(() => {
    if (!isVisible) {
      setIsVisible(true);
    }
    onPress?.();
  }, [isVisible, onPress]);

  if (!isVisible) {
    return (
      <TouchableOpacity onPress={handlePress} style={[styles.placeholder, style]} activeOpacity={0.8}>
        <MaterialIcons name="play-circle-filled" size={48} color="#fff" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} style={style} activeOpacity={0.8}>
      <VideoView
        player={player}
        style={style}
        contentFit="cover"
        nativeControls={showControls}
        allowsFullscreen={true}
      />
    </TouchableOpacity>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
});

export default VideoPlayer;
