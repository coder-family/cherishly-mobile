/**
 * File Validation Utilities
 * 
 * This module provides file validation functions for uploads, including:
 * - File size validation
 * - File type validation
 * - Image compression utilities
 */

import { Alert } from 'react-native';

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  VIDEO: 50 * 1024 * 1024, // 50MB
  AUDIO: 25 * 1024 * 1024, // 25MB
  DEFAULT: 10 * 1024 * 1024, // 10MB default
} as const;

// Allowed file types
export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  VIDEO: ['video/mp4', 'video/quicktime', 'video/avi', 'video/mov'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/aac'],
} as const;

// React Native file interface
export interface ReactNativeFile {
  uri: string;
  type?: string;
  name?: string;
  size?: number;
}

/**
 * Get file size from URI (for React Native files)
 */
export async function getFileSize(uri: string): Promise<number> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob.size;
  } catch (error) {
    // File size error handled silently
    return 0;
  }
}

/**
 * Validate file size
 */
export function validateFileSize(fileSize: number, maxSize: number = FILE_SIZE_LIMITS.DEFAULT): {
  isValid: boolean;
  error?: string;
} {
  if (fileSize === 0) {
    return {
      isValid: false,
      error: 'File is empty'
    };
  }

  if (fileSize > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `File size too large (${fileSizeMB}MB). Maximum allowed: ${maxSizeMB}MB`
    };
  }

  return { isValid: true };
}

/**
 * Validate file type
 */
export function validateFileType(fileType: string): {
  isValid: boolean;
  error?: string;
} {
  const allAllowedTypes = [
    ...ALLOWED_FILE_TYPES.IMAGE,
    ...ALLOWED_FILE_TYPES.VIDEO,
    ...ALLOWED_FILE_TYPES.AUDIO
  ];

  if (!allAllowedTypes.includes(fileType as any)) {
    return {
      isValid: false,
      error: `File type not supported: ${fileType}. Supported types: ${allAllowedTypes.join(', ')}`
    };
  }

  return { isValid: true };
}

/**
 * Get appropriate file size limit based on file type
 */
export function getFileSizeLimit(fileType: string): number {
  if (ALLOWED_FILE_TYPES.IMAGE.includes(fileType as any)) {
    return FILE_SIZE_LIMITS.IMAGE;
  }
  if (ALLOWED_FILE_TYPES.VIDEO.includes(fileType as any)) {
    return FILE_SIZE_LIMITS.VIDEO;
  }
  if (ALLOWED_FILE_TYPES.AUDIO.includes(fileType as any)) {
    return FILE_SIZE_LIMITS.AUDIO;
  }
  return FILE_SIZE_LIMITS.DEFAULT;
}

/**
 * Comprehensive file validation for React Native files
 */
export async function validateReactNativeFile(file: ReactNativeFile): Promise<{
  isValid: boolean;
  error?: string;
  fileSize?: number;
}> {
  try {
    // Check if file has required properties
    if (!file.uri || file.uri.trim() === '') {
      return {
        isValid: false,
        error: 'File URI is missing or empty'
      };
    }

    // Get file size
    const fileSize = await getFileSize(file.uri);
    
    // Validate file size
    const fileType = file.type || 'image/jpeg';
    const sizeLimit = getFileSizeLimit(fileType);
    const sizeValidation = validateFileSize(fileSize, sizeLimit);
    
    if (!sizeValidation.isValid) {
      return {
        isValid: false,
        error: sizeValidation.error,
        fileSize
      };
    }

    // Validate file type
    const typeValidation = validateFileType(fileType);
    if (!typeValidation.isValid) {
      return {
        isValid: false,
        error: typeValidation.error,
        fileSize
      };
    }

    return {
      isValid: true,
      fileSize
    };

  } catch (error) {
    return {
      isValid: false,
      error: `Error validating file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Show file validation error to user
 */
export function showFileValidationError(error: string): void {
  Alert.alert(
    'File Upload Error',
    error,
    [{ text: 'OK' }]
  );
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 