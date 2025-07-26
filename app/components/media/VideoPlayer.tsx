import { MaterialIcons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface VideoPlayerProps {
  uri: string;
  style?: any;
  onPlaybackStatusUpdate?: (status: any) => void;
  shouldPlay?: boolean; // NEW PROP
}



export default function VideoPlayer({ uri, style, onPlaybackStatusUpdate, shouldPlay = false }: VideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<any>({});
  const [isPlaying, setIsPlaying] = useState(false);

  console.log('VideoPlayer render:', { uri, shouldPlay, style });

  const handlePlaybackStatusUpdate = (playbackStatus: any) => {
    console.log('VideoPlayer status update:', playbackStatus);
    setStatus(playbackStatus);
    setIsPlaying(playbackStatus.isPlaying);
    onPlaybackStatusUpdate?.(playbackStatus);
  };

  const togglePlayPause = async () => {
    if (isPlaying) {
      await videoRef.current?.pauseAsync();
    } else {
      await videoRef.current?.playAsync();
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container]}>
      <Video
        ref={videoRef}
        style={[styles.video, style]}
        source={{ uri }}
        useNativeControls={false}
        resizeMode={ResizeMode.CONTAIN}
        isLooping={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        shouldPlay={shouldPlay} // NEW PROP PASSED
      />
      
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={togglePlayPause}
        >
          <MaterialIcons
            name={isPlaying ? 'pause' : 'play-arrow'}
            size={32}
            color="#fff"
          />
        </TouchableOpacity>
        
        {status.durationMillis && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${(status.positionMillis / status.durationMillis) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.timeText}>
              {formatTime(status.positionMillis || 0)} / {formatTime(status.durationMillis)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  video: {
    width: '100%',
    height: 200,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    marginRight: 16,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4f8cff',
    borderRadius: 2,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
  },
}); 