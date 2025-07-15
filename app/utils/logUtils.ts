export function sanitizeLog(input: unknown): string {
    let stringInput: string;
    if (typeof input !== 'string') {
      stringInput = String(input); // convert undefined, null, number, etc.
    } else {
      stringInput = input;
    }
    return stringInput
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[\u001b]/g, ''); // remove ESC character (used in terminal control)
  }

// Enhanced sanitization for logging that removes sensitive data
export function sanitizeForLogging(data: any): string {
  if (data === null || data === undefined) {
    return "null/undefined";
  }

  if (typeof data === "string") {
    // Remove newlines and other potentially dangerous characters
    return data.replace(/[\r\n\t]/g, " ").substring(0, 200);
  }

  if (typeof data === "object") {
    try {
      // Remove sensitive fields before stringifying
      const sanitized = removeSensitiveFields(data);
      const stringified = JSON.stringify(sanitized);
      return stringified.replace(/[\r\n\t]/g, " ").substring(0, 500);
    } catch {
      return "[Object - cannot stringify]";
    }
  }

  return String(data)
    .replace(/[\r\n\t]/g, " ")
    .substring(0, 200);
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

// Specific function for sanitizing API requests
export function sanitizeApiRequest(config: any): any {
  if (!config) return config;

  const sanitized = {
    method: config.method?.toUpperCase(),
    url: (config.baseURL || '') + (config.url || ''),
    // Only include non-sensitive headers
    headers: sanitizeHeaders(config.headers),
    // Sanitize request data
    data: config.data ? removeSensitiveFields(config.data) : undefined,
    params: config.params ? removeSensitiveFields(config.params) : undefined
  };

  return sanitized;
}

// Function to sanitize headers, removing sensitive ones
function sanitizeHeaders(headers: any): any {
  if (!headers || typeof headers !== 'object') {
    return headers;
  }

  const sensitiveHeaders = [
    'authorization', 'cookie', 'set-cookie', 'x-api-key', 
    'x-auth-token', 'x-access-token', 'x-csrf-token'
  ];

  const sanitized: any = {};

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
  