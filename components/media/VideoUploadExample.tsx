import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import VideoPreview from './VideoPreview';

const VideoUploadExample: React.FC = () => {
  const [selectedVideo] = useState<string | null>(null);

  const handleSingleUpload = async () => {
    if (!selectedVideo) {
      Alert.alert('No Video Selected', 'Please select a video first');
      return;
    }

    try {
      // Future video upload logic
    } catch (error) {
      Alert.alert('Upload Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleBatchUpload = async () => {
    // const videos = [
    //   { uri: 'file://video1.mp4', filename: 'video1.mp4' },
    //   { uri: 'file://video2.mp4', filename: 'video2.mp4' },
    //   { uri: 'file://video3.mp4', filename: 'video3.mp4' },
    // ];

    try {
      // Future batch upload logic
    } catch (error) {
      Alert.alert('Batch Upload Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleClearErrors = () => {
    // Future clear errors logic
  };

  const handleClearResults = () => {
    // Future clear results logic
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Video Upload with Redux</Text>
        <Text style={styles.subtitle}>
          Demonstrates Redux integration for video upload functionality
        </Text>
      </View>

      {/* Upload Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Upload Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{0}</Text>
            <Text style={styles.statLabel}>Uploaded</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{0}</Text>
            <Text style={styles.statLabel}>Failed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{0}</Text>
            <Text style={styles.statLabel}>In Queue</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>No</Text>
            <Text style={styles.statLabel}>Uploading</Text>
          </View>
        </View>
      </View>

      {/* Upload Controls */}
      <View style={styles.controlsContainer}>
        <Text style={styles.sectionTitle}>Upload Controls</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={handleSingleUpload}
          >
            <Text style={styles.buttonText}>Upload Single Video</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={handleBatchUpload}
          >
            <Text style={styles.buttonText}>Batch Upload</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.dangerButton]} 
            onPress={handleClearErrors}
          >
            <Text style={styles.buttonText}>Clear Errors</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.dangerButton]} 
            onPress={handleClearResults}
          >
            <Text style={styles.buttonText}>Clear Results</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upload Queue */}
      {/* Future upload queue logic */}

      {/* Upload Results */}
      {/* Future upload results logic */}

      {/* Upload Errors */}
      {/* Future upload errors logic */}

      {/* Video Preview */}
      {selectedVideo && (
        <View style={styles.previewContainer}>
          <Text style={styles.sectionTitle}>Selected Video</Text>
          <VideoPreview uri={selectedVideo} />
        </View>
      )}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  controlsContainer: {
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2196f3',
  },
  secondaryButton: {
    backgroundColor: '#4caf50',
  },
  dangerButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  previewContainer: {
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
});

export default VideoUploadExample; 