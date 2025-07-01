import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface RecordingDurationProps {
  duration: number;
  isRecording: boolean;
  pulseAnimation: Animated.Value;
  style?: any;
}

const RecordingDuration: React.FC<RecordingDurationProps> = ({ 
  duration, 
  isRecording, 
  pulseAnimation, 
  style 
}) => {
  if (!isRecording) return null;

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.recordingIndicator, { transform: [{ scale: pulseAnimation }] }]}>
        <View style={styles.recordingDot} />
      </Animated.View>
      <Text style={styles.durationText}>
        {formatDuration(duration)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordingIndicator: {
    marginRight: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e53935',
  },
  durationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e53935',
  },
});

export default RecordingDuration; 