import AsyncStorage from "@react-native-async-storage/async-storage";
import apiService from "./apiService";

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER_DATA: "user_data",
  TOKEN_EXPIRY: "token_expiry",
} as const;

// Utility function to safely sanitize logs
function sanitizeForLogging(data: any): string {
  if (data === null || data === undefined) {
    return "null/undefined";
  }
  
  if (typeof data === "string") {
    // Remove newlines and other potentially dangerous characters
    return data.replace(/[\r\n\t]/g, " ").substring(0, 200);
  }
  
  if (typeof data === "object") {
    try {
      // Convert to string and sanitize
      const stringified = JSON.stringify(data);
      return stringified.replace(/[\r\n\t]/g, " ").substring(0, 500);
    } catch {
      return "[Object - cannot stringify]";
    }
  }
  
  return String(data).replace(/[\r\n\t]/g, " ").substring(0, 200);
}

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  // Add other user fields as needed
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  role: string;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Initialize auth service - load stored tokens and user data
   */
  async initialize(): Promise<boolean> {
    try {
      const [accessToken, userData] = await Promise.all([
        this.getAccessToken(),
        this.getUserData(),
      ]);

      if (accessToken && userData) {
        // Verify token is still valid
        const isValid = await this.isTokenValid(accessToken);
        if (isValid) {
          this.currentUser = userData;
          this.isInitialized = true;
          return true;
        } else {
          // Token expired, try to refresh
          const refreshed = await this.refreshToken();
          if (refreshed) {
            this.isInitialized = true;
            return true;
          }
        }
      }

      // Clear invalid data
      await this.clearTokens();
      this.isInitialized = true;
      return false;
    } catch (error) {
      console.error("Auth initialization error:", sanitizeForLogging(error));
      await this.clearTokens();
      this.isInitialized = true;
      return false;
    }
  }

  /**
   * Login user with email and password
   */
  async login(
    credentials: LoginCredentials
  ): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const response = await apiService.post("/users/login", credentials);
      
      console.log("Login response:", sanitizeForLogging(response)); // Debug log

      // Handle different possible response structures
      let user: User;
      let accessToken: string;
      let refreshToken: string;
      let expiresIn: number;

      // Check if response has data property (common API pattern)
      if (response.data) {
        user = response.data.user;
        accessToken = response.data.accessToken || response.data.token;
        refreshToken = response.data.refreshToken;
        expiresIn = response.data.expiresIn || response.data.expires_in || 3600; // Default to 1 hour
      } else {
        // Direct response structure
        user = (response as any).user;
        accessToken = (response as any).accessToken || (response as any).token;
        refreshToken = (response as any).refreshToken;
        expiresIn = (response as any).expiresIn || (response as any).expires_in || 3600;
      }

      // Validate required fields
      if (!user || !accessToken || !refreshToken) {
        console.error("Invalid login response structure:", sanitizeForLogging(response));
        throw new Error("Invalid response from server: missing required authentication data");
      }

      // Validate token values
      if (typeof accessToken !== 'string' || accessToken.trim() === '') {
        throw new Error("Invalid access token received from server");
      }

      if (typeof refreshToken !== 'string' || refreshToken.trim() === '') {
        throw new Error("Invalid refresh token received from server");
      }

      if (typeof expiresIn !== 'number' || expiresIn <= 0) {
        expiresIn = 3600; // Default to 1 hour if invalid
      }

      // Store tokens and user data
      await this.storeTokens({
        accessToken,
        refreshToken,
        expiresIn,
      });
      await this.storeUserData(user);

      this.currentUser = user;

      return { user, tokens: { accessToken, refreshToken, expiresIn } };
    } catch (error: any) {
      console.error("Login error details:", sanitizeForLogging(error));
      
      if (error.response) {
        // The request was made and the server responded with a status code
        if (error.response.status === 401) {
          console.error("Authentication failed: Invalid email or password.", sanitizeForLogging(error.response.data));
          throw new Error("Authentication failed: Invalid email or password.");
        } else {
          console.error(`Server error (${error.response.status}):`, sanitizeForLogging(error.response.data));
          throw new Error(`Server error (${error.response.status}): ${sanitizeForLogging(error.response.data?.message) || "Unknown error"}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Network error: No response received from server.", sanitizeForLogging(error.request));
        throw new Error("Network error: No response received from server.");
      } else {
        // Something else happened
        console.error("Unexpected login error:", sanitizeForLogging(error.message));
        throw new Error(`Unexpected login error: ${error.message}`);
      }
    }
  }

  /**
   * Register new user
   */
  async register(
    data: RegisterData
  ): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const response = await apiService.post("/users/", data);
      
      console.log("Register response:", sanitizeForLogging(response)); // Debug log

      // Handle different possible response structures
      let user: User;
      let accessToken: string;
      let refreshToken: string;
      let expiresIn: number;

      // Check if response has data property (common API pattern)
      if (response.data) {
        user = response.data.user;
        accessToken = response.data.accessToken || response.data.token;
        refreshToken = response.data.refreshToken;
        expiresIn = response.data.expiresIn || response.data.expires_in || 3600; // Default to 1 hour
      } else {
        // Direct response structure
        user = (response as any).user;
        accessToken = (response as any).accessToken || (response as any).token;
        refreshToken = (response as any).refreshToken;
        expiresIn = (response as any).expiresIn || (response as any).expires_in || 3600;
      }

      // Validate required fields
      if (!user || !accessToken || !refreshToken) {
        console.error("Invalid register response structure:", sanitizeForLogging(response));
        throw new Error("Invalid response from server: missing required authentication data");
      }

      // Validate token values
      if (typeof accessToken !== 'string' || accessToken.trim() === '') {
        throw new Error("Invalid access token received from server");
      }

      if (typeof refreshToken !== 'string' || refreshToken.trim() === '') {
        throw new Error("Invalid refresh token received from server");
      }

      if (typeof expiresIn !== 'number' || expiresIn <= 0) {
        expiresIn = 3600; // Default to 1 hour if invalid
      }

      // Store tokens and user data
      await this.storeTokens({
        accessToken,
        refreshToken,
        expiresIn,
      });
      await this.storeUserData(user);

      this.currentUser = user;

      return { user, tokens: { accessToken, refreshToken, expiresIn } };
    } catch (error: any) {
      console.error("Register error details:", sanitizeForLogging(error));
      
      if (error.response) {
        // The request was made and the server responded with a status code
        if (error.response.status === 400) {
          console.error("Registration failed: Invalid data provided.", sanitizeForLogging(error.response.data));
          throw new Error("Registration failed: Invalid data provided.");
        } else if (error.response.status === 409) {
          console.error("Registration failed: User already exists.", sanitizeForLogging(error.response.data));
          throw new Error("Registration failed: User already exists.");
        } else {
          console.error(`Server error (${error.response.status}):`, sanitizeForLogging(error.response.data));
          throw new Error(`Server error (${error.response.status}): ${sanitizeForLogging(error.response.data?.message) || "Unknown error"}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Network error: No response received from server.", sanitizeForLogging(error.request));
        throw new Error("Network error: No response received from server.");
      } else {
        // Something else happened
        console.error("Unexpected registration error:", sanitizeForLogging(error.message));
        throw new Error(`Unexpected registration error: ${error.message}`);
      }
    }
  }

  /**
   * Logout user and clear all stored data
   */
  async logout(): Promise<void> {
    try {
      // No API call needed if there's no logout endpoint
    } catch (error) {
      console.warn("Logout error:", sanitizeForLogging(error));
    } finally {
      await this.clearTokens();
      this.currentUser = null;
    }
  }

  /**
   * Get current user data
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const token = await this.getAccessToken();
    if (!token) return false;

    return await this.isTokenValid(token);
  }

  /**
   * Get access token for API requests
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error("Error getting access token:", sanitizeForLogging(error));
      return null;
    }
  }

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error("Error getting refresh token:", sanitizeForLogging(error));
      return null;
    }
  }

  /**
   * Store authentication tokens
   */
  private async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      const expiryTime = Date.now() + tokens.expiresIn * 1000;

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString()),
      ]);
    } catch (error) {
      console.error("Error storing tokens:", sanitizeForLogging(error));
      throw new Error("Failed to store authentication tokens");
    }
  }

  /**
   * Store user data
   */
  private async storeUserData(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
      console.error("Error storing user data:", sanitizeForLogging(error));
      throw new Error("Failed to store user data");
    }
  }

  /**
   * Get stored user data
   */
  private async getUserData(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error getting user data:", sanitizeForLogging(error));
      throw new Error("Failed to retrieve user data");
    }
  }

  /**
   * Clear all stored authentication data
   */
  private async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY),
      ]);
    } catch (error) {
      console.error("Error clearing tokens:", sanitizeForLogging(error));
      throw error;
    }
  }

  /**
   * Check if token is still valid
   */
  private async isTokenValid(token: string): Promise<boolean> {
    try {
      // Check if token has expired
      const expiryTime = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
      if (expiryTime && Date.now() > parseInt(expiryTime)) {
        return false;
      }

      // Optionally verify token with backend
      // await apiService.get('/auth/verify');
      return true;
    } catch (error) {
      console.error("Token validation error:", sanitizeForLogging(error));
      return false;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) return false;

      const response = (await apiService.post("/auth/refresh", {
        refreshToken,
      })) as {
        accessToken: string;
        expiresIn: number;
      };

      const { accessToken, expiresIn } = response;

      // Update stored tokens
      const currentRefreshToken = await this.getRefreshToken();
      await this.storeTokens({
        accessToken,
        refreshToken: currentRefreshToken!,
        expiresIn,
      });

      return true;
    } catch (error) {
      console.error("Token refresh error:", sanitizeForLogging(error));
      await this.clearTokens();
      return false;
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
export default authService;
