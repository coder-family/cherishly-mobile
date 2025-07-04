import axios from "axios";

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
    baseURL: "https://growing-together-app.onrender.com/api",
    timeout: 30000, 
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor for authentication
apiService.interceptors.request.use(
  async (config) => {
    // Add auth token if available
    try {
      const authService = (await import('./authService')).default;
      const token = await authService.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Error adding auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiService.interceptors.response.use(
    (res) => res.data,
    (error) => Promise.reject(error) 
  );

export default apiService;
export type { ApiError, ApiResponse };
