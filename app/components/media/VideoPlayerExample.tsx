import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MediaViewerBase from './MediaViewerBase';

// Example video attachments
const exampleVideos = [
  {
    id: 'video1',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'video' as const,
    fileName: 'Big Buck Bunny',
    fileSize: 1024000
  },
  {
    id: 'video2', 
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    type: 'video' as const,
    fileName: 'Elephants Dream',
    fileSize: 2048000
  }
];

export default function VideoPlayerExample() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>YouTube-like Video Player</Text>
      <Text style={styles.subtitle}>
        Tap on a video to open in full-screen mode. 
        Use the full-screen button to toggle landscape orientation.
      </Text>
      
      <MediaViewerBase
        attachments={exampleVideos}
        enableOrientationControl={true} // Enable orientation features for testing
        onAttachmentPress={(attachment, index) => {
          console.log('Video pressed:', attachment.fileName, 'at index:', index);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
}); 