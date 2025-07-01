import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import AudioRecorder from './AudioRecorder';
import { RecordingMetadata, RecordingStorage } from './RecordingStorage';

const AudioRecorderExample: React.FC = () => {
  const [lastRecording, setLastRecording] = useState<RecordingMetadata | null>(null);
  const [storageStats, setStorageStats] = useState<{
    totalRecordings: number;
    totalSize: number;
  }>({ totalRecordings: 0, totalSize: 0 });

  const handleRecordingComplete = (recording: RecordingMetadata) => {
    console.log('Recording completed:', recording);
    setLastRecording(recording);
    updateStorageStats();
    Alert.alert('Success', `Recording saved: ${recording.fileName}`);
  };

  const handleRecordingDelete = (id: string) => {
    console.log('Recording deleted:', id);
    setLastRecording(null);
    updateStorageStats();
    Alert.alert('Deleted', 'Recording has been deleted');
  };

  const handleRecordingUpload = (recording: RecordingMetadata) => {
    console.log('Recording uploaded:', recording);
    Alert.alert('Uploaded', `Recording uploaded: ${recording.fileName}`);
  };

  const updateStorageStats = async () => {
    try {
      const stats = await RecordingStorage.getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Error getting storage stats:', error);
    }
  };

  const clearAllRecordings = async () => {
    Alert.alert(
      'Clear All Recordings',
      'Are you sure you want to delete all recordings? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await RecordingStorage.clearAllRecordings();
            setLastRecording(null);
            updateStorageStats();
            Alert.alert('Cleared', 'All recordings have been deleted');
          },
        },
      ]
    );
  };

  const cleanupOldRecordings = async () => {
    const deletedCount = await RecordingStorage.cleanupOldRecordings(7); // 7 days
    if (deletedCount > 0) {
      updateStorageStats();
      Alert.alert('Cleanup Complete', `${deletedCount} old recordings have been removed`);
    } else {
      Alert.alert('No Cleanup Needed', 'No old recordings found to remove');
    }
  };

  React.useEffect(() => {
    updateStorageStats();
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Enhanced Audio Recorder</Text>
        <Text style={styles.subtitle}>
          Features: Multiple recordings, pause/resume, optimized storage, sub-components
        </Text>
      </View>

      {/* Storage Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Storage Statistics</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>
            Total Recordings: {storageStats.totalRecordings}
          </Text>
          <Text style={styles.statsText}>
            Total Size: {RecordingStorage.formatFileSize(storageStats.totalSize)}
          </Text>
        </View>
        <View style={styles.statsActions}>
          <Text style={styles.actionButton} onPress={cleanupOldRecordings}>
            🗑️ Cleanup Old (7 days)
          </Text>
          <Text style={styles.actionButton} onPress={clearAllRecordings}>
            🗑️ Clear All
          </Text>
        </View>
      </View>

      {/* Audio Recorder */}
      <View style={styles.recorderContainer}>
        <Text style={styles.sectionTitle}>Record New Audio</Text>
        <AudioRecorder
          onRecordingComplete={handleRecordingComplete}
          onRecordingDelete={handleRecordingDelete}
          onRecordingUpload={handleRecordingUpload}
          maxDuration={180} // 3 minutes
          maxFileSize={25} // 25MB
          showRecordingsList={true}
        />
      </View>

      {/* Last Recording Info */}
      {lastRecording && (
        <View style={styles.lastRecordingContainer}>
          <Text style={styles.sectionTitle}>Last Recording</Text>
          <View style={styles.recordingCard}>
            <Text style={styles.recordingName}>{lastRecording.fileName}</Text>
            <View style={styles.recordingDetails}>
              <Text style={styles.detailText}>
                Duration: {RecordingStorage.formatDuration(lastRecording.duration)}
              </Text>
              <Text style={styles.detailText}>
                Size: {RecordingStorage.formatFileSize(lastRecording.fileSize)}
              </Text>
              <Text style={styles.detailText}>
                Created: {new Date(lastRecording.createdAt).toLocaleString()}
              </Text>
            </View>
            {lastRecording.isUploaded && (
              <View style={styles.uploadedBadge}>
                <Text style={styles.uploadedText}>✓ Uploaded</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Feature List */}
      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>🎤 Record audio with high quality</Text>
          <Text style={styles.featureItem}>⏸️ Pause and resume recording</Text>
          <Text style={styles.featureItem}>📱 Multiple recordings storage</Text>
          <Text style={styles.featureItem}>🎵 Play/pause audio playback</Text>
          <Text style={styles.featureItem}>☁️ Upload to cloud storage</Text>
          <Text style={styles.featureItem}>🗑️ Delete individual recordings</Text>
          <Text style={styles.featureItem}>📊 File size and duration limits</Text>
          <Text style={styles.featureItem}>⚡ Optimized performance</Text>
          <Text style={styles.featureItem}>♿ Full accessibility support</Text>
          <Text style={styles.featureItem}>📱 Haptic feedback</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
  },
  statsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
  },
  statsActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  actionButton: {
    fontSize: 14,
    color: '#2196f3',
    fontWeight: '500',
  },
  recorderContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  lastRecordingContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordingCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  recordingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  recordingDetails: {
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  uploadedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4caf50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  uploadedText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  featuresContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 32,
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default AudioRecorderExample; 