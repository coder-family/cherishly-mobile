import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface RecordingInfoProps {
  uri: string;
  duration: number;
  style?: any;
}

const RecordingInfo: React.FC<RecordingInfoProps> = ({ uri, duration, style }) => {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.fileName}>
        🎧 {uri.split('/').pop()}
      </Text>
      <Text style={styles.duration}>
        Duration: {formatDuration(duration)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    alignItems: 'center',
  },
  fileName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  duration: {
    fontSize: 12,
    color: '#999',
  },
});

export default RecordingInfo; 