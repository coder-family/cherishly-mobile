// Logging Configuration - Set to false to disable specific types of logs
export const LOG_CONFIG = {
  // Memory-related logs (disable these for health/growth focus)
  MEMORY: false,
  MEMORY_API: false,
  MEMORY_REDUX: false,
  MEMORY_UI: false, // Disable memory UI logs
  
  // Turn these OFF to reduce noise (not related to health/growth)
  API_REQUESTS: false,        // API service requests
  AUTH: false,               // Authentication operations  
  SEARCH: false,             // Search operations
  FAMILY: false,             // Family service operations
  CHILD: false,              // Child service operations
  HEALTH: true,              // Health service operations - ENABLE for health/growth work
  MEDIA: false,              // Audio/Video/Image operations
  NAVIGATION: false,         // Router navigation
  GENERAL: false,            // General app logs
};

// Conditional logging functions with sanitization
export const conditionalLog = {
  memory: (message: string, ...args: any[]) => {
    if (LOG_CONFIG.MEMORY) {
      const sanitizedMessage = sanitizeLog(message);
      const sanitizedArgs = args.map(arg => sanitizeForLogging(arg));
      console.log(`[MEMORY] ${sanitizedMessage}`, ...sanitizedArgs);
    }
  },
  memoryApi: (message: string, ...args: any[]) => {
    if (LOG_CONFIG.MEMORY_API) {
      const sanitizedMessage = sanitizeLog(message);
      const sanitizedArgs = args.map(arg => sanitizeForLogging(arg));
      console.log(`[MEMORY-API] ${sanitizedMessage}`, ...sanitizedArgs);
    }
  },
  memoryRedux: (message: string, ...args: any[]) => {
    if (LOG_CONFIG.MEMORY_REDUX) {
      const sanitizedMessage = sanitizeLog(message);
      const sanitizedArgs = args.map(arg => sanitizeForLogging(arg));
      console.log(`[MEMORY-REDUX] ${sanitizedMessage}`, ...sanitizedArgs);
    }
  },
  memoryUI: (message: string, ...args: any[]) => {
    if (LOG_CONFIG.MEMORY_UI) {
      const sanitizedMessage = sanitizeLog(message);
      const sanitizedArgs = args.map(arg => sanitizeForLogging(arg));
      console.log(`[MEMORY-UI] ${sanitizedMessage}`, ...sanitizedArgs);
    }
  },
  api: (message: string, ...args: any[]) => {
    if (LOG_CONFIG.API_REQUESTS) {
      const sanitizedMessage = sanitizeLog(message);
      const sanitizedArgs = args.map(arg => sanitizeForLogging(arg));
      console.log(`[API] ${sanitizedMessage}`, ...sanitizedArgs);
    }
  },
  auth: (message: string, ...args: any[]) => {
    if (LOG_CONFIG.AUTH) {
      const sanitizedMessage = sanitizeLog(message);
      const sanitizedArgs = args.map(arg => sanitizeForLogging(arg));
      console.log(`[AUTH] ${sanitizedMessage}`, ...sanitizedArgs);
    }
  },
  authError: (message: string, ...args: any[]) => {
    if (LOG_CONFIG.AUTH) {
      const sanitizedMessage = sanitizeLog(message);
      const sanitizedArgs = args.map(arg => sanitizeForLogging(arg));
      console.error(`[AUTH-ERROR] ${sanitizedMessage}`, ...sanitizedArgs);
    }
  },
  search: (message: string, ...args: any[]) => {
    if (LOG_CONFIG.SEARCH) {
      const sanitizedMessage = sanitizeLog(message);
      const sanitizedArgs = args.map(arg => sanitizeForLogging(arg));
      console.log(`[SEARCH] ${sanitizedMessage}`, ...sanitizedArgs);
    }
  },
  family: (message: string, ...args: any[]) => {
    if (LOG_CONFIG.FAMILY) {
      const sanitizedMessage = sanitizeLog(message);
      const sanitizedArgs = args.map(arg => sanitizeForLogging(arg));
      console.log(`[FAMILY] ${sanitizedMessage}`, ...sanitizedArgs);
    }
  },
  child: (message: string, ...args: any[]) => {
    if (LOG_CONFIG.CHILD) {
      const sanitizedMessage = sanitizeLog(message);
      const sanitizedArgs = args.map(arg => sanitizeForLogging(arg));
      console.log(`[CHILD] ${sanitizedMessage}`, ...sanitizedArgs);
    }
  },
  health: (message: string, ...args: any[]) => {
    if (LOG_CONFIG.HEALTH) {
      const sanitizedMessage = sanitizeLog(message);
      const sanitizedArgs = args.map(arg => sanitizeForLogging(arg));
      console.log(`[HEALTH] ${sanitizedMessage}`, ...sanitizedArgs);
    }
  },
  media: (message: string, ...args: any[]) => {
    if (LOG_CONFIG.MEDIA) {
      const sanitizedMessage = sanitizeLog(message);
      const sanitizedArgs = args.map(arg => sanitizeForLogging(arg));
      console.log(`[MEDIA] ${sanitizedMessage}`, ...sanitizedArgs);
    }
  },
  navigation: (message: string, ...args: any[]) => {
    if (LOG_CONFIG.NAVIGATION) {
      const sanitizedMessage = sanitizeLog(message);
      const sanitizedArgs = args.map(arg => sanitizeForLogging(arg));
      console.log(`[NAV] ${sanitizedMessage}`, ...sanitizedArgs);
    }
  },
  general: (message: string, ...args: any[]) => {
    if (LOG_CONFIG.GENERAL) {
      const sanitizedMessage = sanitizeLog(message);
      const sanitizedArgs = args.map(arg => sanitizeForLogging(arg));
      console.log(`[APP] ${sanitizedMessage}`, ...sanitizedArgs);
    }
  },
};

// Helper function for string sanitization
function sanitizeString(input: string, options: { removeEsc?: boolean; maxLength?: number } = {}): string {
  const { removeEsc = false, maxLength } = options;
  
  let result = input.replace(/[\r\n\t]+/g, ' ');
  
  if (removeEsc) {
    result = result.replace(/[\u001b]/g, ''); // remove ESC character (used in terminal control)
  }
  
  if (maxLength) {
    result = result.substring(0, maxLength);
  }
  
  return result;
}

export function sanitizeLog(input: unknown): string {
  let stringInput: string;
  if (typeof input !== 'string') {
    stringInput = String(input); // convert undefined, null, number, etc.
  } else {
    stringInput = input;
  }
  return sanitizeString(stringInput, { removeEsc: true });
}

// Enhanced sanitization for logging that removes sensitive data
export function sanitizeForLogging(data: any): string {
  if (data === null || data === undefined) {
    return "null/undefined";
  }

  if (typeof data === "string") {
    // Remove newlines, ESC characters, and other potentially dangerous characters
    return sanitizeString(data, { removeEsc: true, maxLength: 200 });
  }

  if (typeof data === "object") {
    try {
      // Remove sensitive fields before stringifying
      const sanitized = removeSensitiveFields(data);
      const stringified = JSON.stringify(sanitized);
      return sanitizeString(stringified, { removeEsc: true, maxLength: 500 });
    } catch {
      return "[Object - cannot stringify]";
    }
  }

  return sanitizeString(String(data), { removeEsc: true, maxLength: 200 });
}

// Function to remove sensitive fields from objects before logging
function removeSensitiveFields(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => removeSensitiveFields(item));
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  const sensitiveFields = [
    'password', 'currentPassword', 'newPassword', 'confirmPassword',
    'token', 'accessToken', 'refreshToken', 'access_token', 'refresh_token',
    'authorization', 'auth', 'secret', 'key', 'apiKey', 'api_key',
    'credentials', 'credential', 'session', 'sessionId', 'csrf',
    'cookie', 'cookies', 'x-api-key', 'x-auth-token',
    // Personal information
    'ssn', 'socialSecurityNumber', 'creditCard', 'cardNumber',
    'cvv', 'securityCode', 'pin', 'otp', 'verificationCode'
  ];

  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    const keyLower = key.toLowerCase();
    
    // Check if this is a sensitive field
    if (sensitiveFields.some(field => keyLower.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      // Recursively sanitize nested objects
      sanitized[key] = removeSensitiveFields(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// Define an interface for the API request config
interface ApiRequestConfig {
  method?: string;
  baseURL?: string;
  url?: string;
  headers?: Record<string, string>;
  data?: any;
  params?: any;
}

// Specific function for sanitizing API requests
export function sanitizeApiRequest(config: ApiRequestConfig): ApiRequestConfig {
  if (!config) return config;

  const sanitized: ApiRequestConfig = {
    method: config.method?.toUpperCase(),
    url: `${config.baseURL ?? ''}${config.url ?? ''}`,
    // Only include non-sensitive headers
    headers: sanitizeHeaders(config.headers),
    // Sanitize request data
    data: config.data ? removeSensitiveFields(config.data) : undefined,
    params: config.params ? removeSensitiveFields(config.params) : undefined
  };

  return sanitized;
}

// Function to sanitize headers, removing sensitive ones
function sanitizeHeaders(headers: Record<string, string> | undefined): Record<string, string> | undefined {
  if (!headers || typeof headers !== 'object') {
    return headers;
  }

  const sensitiveHeaders = [
    'authorization', 'cookie', 'set-cookie', 'x-api-key', 
    'x-auth-token', 'x-access-token', 'x-csrf-token'
  ];

  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    const keyLower = key.toLowerCase();
    
    if (sensitiveHeaders.includes(keyLower)) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// Function to sanitize error objects for logging
export function sanitizeError(error: any): string {
  if (!error) {
    return 'Unknown error';
  }

  const errorInfo: any = {
    message: error.message || error.toString(),
    status: error.status || error.response?.status,
    statusText: error.statusText || error.response?.statusText,
    // Don't log the full error response as it might contain sensitive data
    hasResponse: !!error.response,
    hasRequest: !!error.request
  };

  // If there's response data, sanitize it
  if (error.response?.data) {
    errorInfo.responseData = removeSensitiveFields(error.response.data);
  }

  return sanitizeForLogging(errorInfo);
}
  