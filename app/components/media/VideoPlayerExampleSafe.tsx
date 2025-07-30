import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MediaViewerBaseSafe from './MediaViewerBaseSafe';

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

export default function VideoPlayerExampleSafe() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Safe Video Player (No Orientation)</Text>
      <Text style={styles.subtitle}>
        This version doesn&apos;t use screen orientation features to prevent crashes.
        Tap on a video to open in full-screen mode.
      </Text>
      
      <MediaViewerBaseSafe
        attachments={exampleVideos}
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