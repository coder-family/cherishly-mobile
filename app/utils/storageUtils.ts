import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Cross-platform storage utility
 * Handles storage differences between web and mobile platforms
 */
export class StorageUtils {
  /**
   * Set item in storage
   */
  static async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
      
      // On web, also try to clear from localStorage to ensure consistency
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.warn('Failed to set localStorage item:', error);
        }
      }
    } catch (error) {
      console.error('Failed to set AsyncStorage item:', error);
      throw error;
    }
  }

  /**
   * Get item from storage
   */
  static async getItem(key: string): Promise<string | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      
      // On web, also check localStorage as fallback
      if (Platform.OS === 'web' && typeof window !== 'undefined' && !value) {
        try {
          const localValue = localStorage.getItem(key);
          if (localValue) {
            // Sync back to AsyncStorage
            await AsyncStorage.setItem(key, localValue);
            return localValue;
          }
        } catch (error) {
          console.warn('Failed to get localStorage item:', error);
        }
      }
      
      return value;
    } catch (error) {
      console.error('Failed to get AsyncStorage item:', error);
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      
      // On web, also clear from localStorage
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn('Failed to remove localStorage item:', error);
        }
      }
    } catch (error) {
      console.error('Failed to remove AsyncStorage item:', error);
      throw error;
    }
  }

  /**
   * Clear all storage
   */
  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
      
      // On web, also clear localStorage
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        try {
          localStorage.clear();
        } catch (error) {
          console.warn('Failed to clear localStorage:', error);
        }
      }
    } catch (error) {
      console.error('Failed to clear AsyncStorage:', error);
      throw error;
    }
  }

  /**
   * Get all keys from storage
   */
  static async getAllKeys(): Promise<string[]> {
    try {
      return [...await AsyncStorage.getAllKeys()];
    } catch (error) {
      console.error('Failed to get AsyncStorage keys:', error);
      return [];
    }
  }

  /**
   * Check if storage is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const testKey = '__storage_test__';
      await AsyncStorage.setItem(testKey, 'test');
      await AsyncStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.error('Storage is not available:', error);
      return false;
    }
  }

  /**
   * Debug: Log all storage items
   */
  static async debugStorage(): Promise<void> {
    try {
      const keys = await this.getAllKeys();
      console.log('🔍 Storage Debug - All keys:', keys);
      
      for (const key of keys) {
        const value = await this.getItem(key);
        console.log(`  ${key}:`, value);
      }
    } catch (error) {
      console.error('Failed to debug storage:', error);
    }
  }
}
