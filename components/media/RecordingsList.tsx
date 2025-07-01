import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { RecordingMetadata, RecordingStorage } from './RecordingStorage';

interface RecordingsListProps {
  recordings: RecordingMetadata[];
  currentPlayingId?: string;
  onPlayRecording: (recording: RecordingMetadata) => void;
  onDeleteRecording: (id: string) => void;
  onUploadRecording: (recording: RecordingMetadata) => void;
  style?: any;
}

const RecordingsList: React.FC<RecordingsListProps> = ({
  recordings,
  currentPlayingId,
  onPlayRecording,
  onDeleteRecording,
  onUploadRecording,
  style,
}) => {
  const renderRecordingItem = ({ item }: { item: RecordingMetadata }) => {
    const isPlaying = currentPlayingId === item.id;
    const isUploaded = item.isUploaded;

    return (
      <View style={styles.recordingItem}>
        <View style={styles.recordingInfo}>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>
              {item.fileName}
            </Text>
            <View style={styles.metadata}>
              <Text style={styles.metadataText}>
                {RecordingStorage.formatDuration(item.duration)}
              </Text>
              <Text style={styles.metadataText}>
                {RecordingStorage.formatFileSize(item.fileSize)}
              </Text>
              <Text style={styles.metadataText}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
          
          <View style={styles.statusIndicator}>
            {isUploaded && (
              <Ionicons name="cloud-done" size={16} color="#4caf50" />
            )}
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => onPlayRecording(item)}
            style={[styles.actionButton, styles.playButton]}
            accessibilityLabel={isPlaying ? "Pause recording" : "Play recording"}
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={20} 
              color="#fff" 
            />
          </TouchableOpacity>

          {!isUploaded && (
            <TouchableOpacity
              onPress={() => onUploadRecording(item)}
              style={[styles.actionButton, styles.uploadButton]}
              accessibilityLabel="Upload recording"
            >
              <Ionicons name="cloud-upload" size={18} color="#fff" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => onDeleteRecording(item.id)}
            style={[styles.actionButton, styles.deleteButton]}
            accessibilityLabel="Delete recording"
          >
            <Ionicons name="trash" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (recordings.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <Ionicons name="mic-off" size={48} color="#ccc" />
        <Text style={styles.emptyText}>No recordings yet</Text>
        <Text style={styles.emptySubtext}>
          Start recording to see your audio files here
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={recordings}
      renderItem={renderRecordingItem}
      keyExtractor={(item) => item.id}
      style={[styles.container, style]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  recordingItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  fileInfo: {
    flex: 1,
    marginRight: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  metadata: {
    flexDirection: 'row',
    gap: 12,
  },
  metadataText: {
    fontSize: 12,
    color: '#666',
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  actionButton: {
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
    minHeight: 36,
  },
  playButton: {
    backgroundColor: '#4caf50',
  },
  uploadButton: {
    backgroundColor: '#9c27b0',
  },
  deleteButton: {
    backgroundColor: '#ff5722',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default RecordingsList; 