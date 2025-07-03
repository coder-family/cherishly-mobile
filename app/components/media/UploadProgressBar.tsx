import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface UploadProgressBarProps {
  progress: number;
  isUploading: boolean;
  style?: any;
}

const UploadProgressBar: React.FC<UploadProgressBarProps> = ({ 
  progress, 
  isUploading, 
  style 
}) => {
  if (!isUploading) return null;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.uploadText}>Uploading... {progress}%</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
  },
});

export default UploadProgressBar; 