import AsyncStorage from '@react-native-async-storage/async-storage';
import { isValidRecordingId } from '../../utils/validation';

export interface RecordingMetadata {
  id: string;
  uri: string;
  fileName: string;
  duration: number;
  fileSize: number;
  createdAt: number;
  isUploaded: boolean;
  uploadUrl?: string;
}

export class RecordingStorage {
  private static readonly STORAGE_KEY = 'audio_recordings';
  private static readonly MAX_RECORDINGS = 50; // Limit to prevent storage bloat

  /**
   * Save a new recording with metadata
   */
  static async saveRecording(
    uri: string,
    duration: number,
    fileSize: number
  ): Promise<RecordingMetadata> {
    try {
      const recordings = await this.getAllRecordings();
      
      // Create new recording metadata
      const newRecording: RecordingMetadata = {
        id: this.generateId(),
        uri,
        fileName: uri.split('/').pop() || `recording_${Date.now()}.m4a`,
        duration,
        fileSize,
        createdAt: Date.now(),
        isUploaded: false,
      };

      // Add to beginning of array (most recent first)
      recordings.unshift(newRecording);

      // Limit the number of stored recordings
      if (recordings.length > this.MAX_RECORDINGS) {
        recordings.splice(this.MAX_RECORDINGS);
      }

      // Save to storage
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(recordings));

      return newRecording;
    } catch (error) {
      console.error('Error saving recording:', error);
      throw new Error('Failed to save recording');
    }
  }

  /**
   * Get all recordings sorted by creation date (newest first)
   */
  static async getAllRecordings(): Promise<RecordingMetadata[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting recordings:', error);
      return [];
    }
  }

  /**
   * Get a specific recording by ID
   */
  static async getRecording(id: string): Promise<RecordingMetadata | null> {
    try {
      if (!isValidRecordingId(id)) {
        return null;
      }
      const recordings = await this.getAllRecordings();
      return recordings.find(recording => recording.id === id) || null;
    } catch (error) {
      console.error('Error getting recording:', error);
      return null;
    }
  }

  /**
   * Update recording metadata (e.g., mark as uploaded)
   */
  static async updateRecording(
    id: string,
    updates: Partial<RecordingMetadata>
  ): Promise<boolean> {
    try {
      const recordings = await this.getAllRecordings();
      const index = recordings.findIndex(recording => recording.id === id);
      
      if (index === -1) return false;

      recordings[index] = { ...recordings[index], ...updates };
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(recordings));
      
      return true;
    } catch (error) {
      console.error('Error updating recording:', error);
      return false;
    }
  }

  /**
   * Delete a recording by ID
   */
  static async deleteRecording(id: string): Promise<boolean> {
    try {
      const recordings = await this.getAllRecordings();
      const filteredRecordings = recordings.filter(recording => recording.id !== id);
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredRecordings));
      return true;
    } catch (error) {
      console.error('Error deleting recording:', error);
      return false;
    }
  }

  /**
   * Clear all recordings
   */
  static async clearAllRecordings(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing recordings:', error);
    }
  }

  /**
   * Get storage statistics
   */
  static async getStorageStats(): Promise<{
    totalRecordings: number;
    totalSize: number;
    oldestRecording?: number;
    newestRecording?: number;
  }> {
    try {
      const recordings = await this.getAllRecordings();
      const totalSize = recordings.reduce((sum, recording) => sum + recording.fileSize, 0);
      const timestamps = recordings.map(r => r.createdAt);
      
      return {
        totalRecordings: recordings.length,
        totalSize,
        oldestRecording: timestamps.length > 0 ? Math.min(...timestamps) : undefined,
        newestRecording: timestamps.length > 0 ? Math.max(...timestamps) : undefined,
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return { totalRecordings: 0, totalSize: 0 };
    }
  }

  /**
   * Clean up old recordings (older than specified days)
   */
  static async cleanupOldRecordings(daysOld: number = 30): Promise<number> {
    try {
      const recordings = await this.getAllRecordings();
      const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
      const oldRecordings = recordings.filter(recording => recording.createdAt < cutoffTime);
      
      if (oldRecordings.length > 0) {
        const remainingRecordings = recordings.filter(recording => recording.createdAt >= cutoffTime);
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(remainingRecordings));
      }
      
      return oldRecordings.length;
    } catch (error) {
      console.error('Error cleaning up old recordings:', error);
      return 0;
    }
  }

  /**
   * Generate unique ID for recordings
   */
  private static generateId(): string {
    return `recording_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format duration for display
   */
  static formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
} 