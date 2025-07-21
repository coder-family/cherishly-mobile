import { API_BASE_URL } from '@env';
import axios from "axios";
import { conditionalLog, sanitizeApiRequest } from '../utils/logUtils';
// Type definitions
interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
  url?: string;
}

interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

const apiService = axios.create({
    // baseURL: "https://growing-together-app.onrender.com/api",
    baseURL: API_BASE_URL || "https://growing-together-app.onrender.com/api",
    timeout: 30000, 
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
});

// Export the base URL for use in other parts of the app
export const API_BASE_URL_EXPORT = API_BASE_URL;

// Request interceptor for authentication
apiService.interceptors.request.use(
  async (config) => {
    // Log the request for debugging (sanitized to remove sensitive data)
    conditionalLog.api("API Request:", sanitizeApiRequest(config));
    
    // Add auth token if available
    try {
      const authService = (await import('./authService')).default;
      const token = await authService.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      conditionalLog.auth('Error adding auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiService.interceptors.response.use(
    (res) => res.data,
    (error) => {
      let formattedError: ApiError = {
        message: 'An unknown error occurred.',
      };
      if (error.response) {
        formattedError = {
          message: error.response.data?.error || error.response.data?.message || error.response.statusText || 'API Error',
          status: error.response.status,
          statusText: error.response.statusText,
          url: error.response.config?.url,
        };
      } else if (error.request) {
        // Request was made but no response received
        formattedError = {
          message: 'No response received from server.',
        };
      } else if (error.message) {
        // Something happened in setting up the request
        formattedError = {
          message: error.message,
        };
      }
      return Promise.reject(formattedError);
    }
  );

export default apiService;
export type { ApiError, ApiResponse };
