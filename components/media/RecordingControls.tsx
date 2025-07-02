import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

interface RecordingControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  isPlaying: boolean;
  hasRecording: boolean;
  isLoading: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPlayPause: () => void;
  onDelete: () => void;
  onUpload: () => void;
  style?: ViewStyle;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  isPaused,
  isPlaying,
  hasRecording,
  isLoading,
  onStartRecording,
  onStopRecording,
  onPlayPause,
  onDelete,
  onUpload,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Record/Pause/Stop Button */}
      {!isRecording ? (
        <TouchableOpacity
          onPress={onStartRecording}
          style={[styles.button, styles.recordButton]}
          disabled={isLoading}
          accessibilityLabel="Start recording"
          accessibilityRole="button"
          accessibilityHint="Double tap to start recording audio"
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="mic" size={28} color="#fff" />
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.recordingButtons}>
          {isPaused ? (
            <TouchableOpacity
              onPress={onStartRecording}
              style={[styles.button, styles.resumeButton]}
              disabled={isLoading}
              accessibilityLabel="Resume recording"
              accessibilityRole="button"
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="play" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={onStartRecording}
              style={[styles.button, styles.pauseButton]}
              disabled={isLoading}
              accessibilityLabel="Pause recording"
              accessibilityRole="button"
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="pause" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            onPress={onStopRecording}
            style={[styles.button, styles.stopButton]}
            disabled={isLoading}
            accessibilityLabel="Stop recording"
            accessibilityRole="button"
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="stop" size={28} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Play/Pause Button */}
      {hasRecording && (
        <TouchableOpacity
          onPress={onPlayPause}
          style={[styles.button, styles.playButton]}
          disabled={isLoading}
          accessibilityLabel={isPlaying ? "Pause playback" : "Play recording"}
          accessibilityRole="button"
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={28}
              color="#fff"
            />
          )}
        </TouchableOpacity>
      )}

      {/* Delete Button */}
      {hasRecording && !isRecording && (
        <TouchableOpacity
          onPress={onDelete}
          style={[styles.button, styles.deleteButton]}
          accessibilityLabel="Delete recording"
          accessibilityRole="button"
          accessibilityHint="Double tap to delete the current recording"
        >
          <Ionicons name="trash" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Upload Button */}
      {hasRecording && !isRecording && (
        <TouchableOpacity
          onPress={onUpload}
          style={[styles.button, styles.uploadButton]}
          accessibilityLabel="Upload recording"
          accessibilityRole="button"
        >
          <Ionicons name="cloud-upload" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  button: {
    borderRadius: 28,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
    minHeight: 56,
  },
  recordButton: {
    backgroundColor: '#2196F3',
  },
  recordingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  pauseButton: {
    backgroundColor: '#ff9800',
  },
  resumeButton: {
    backgroundColor: '#4caf50',
  },
  stopButton: {
    backgroundColor: '#e53935',
  },
  playButton: {
    backgroundColor: '#4caf50',
  },
  deleteButton: {
    backgroundColor: '#ff5722',
  },
  uploadButton: {
    backgroundColor: '#9c27b0',
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
});

export default RecordingControls; 