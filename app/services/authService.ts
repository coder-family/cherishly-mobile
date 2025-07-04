import AsyncStorage from "@react-native-async-storage/async-storage";
import apiService from "./apiService";

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER_DATA: "user_data",
  TOKEN_EXPIRY: "token_expiry",
} as const;

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
      console.error("Auth initialization error:", error);
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
      const response = (await apiService.post("/users/login", credentials)) as {
        user: User;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      };

      const { user, accessToken, refreshToken, expiresIn } = response;

      // Store tokens and user data
      await this.storeTokens({
        accessToken,
        refreshToken,
        expiresIn,
      });
      await this.storeUserData(user);

      this.currentUser = user;

      return { user, tokens: { accessToken, refreshToken, expiresIn } };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
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

      // Try to destructure from response.data if needed
      const { user, accessToken, refreshToken, expiresIn } = response.data;
      if (!user || !accessToken || !refreshToken || !expiresIn) {
        throw new Error(
          "Registration response missing required fields (user, accessToken, refreshToken, expiresIn)"
        );
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
      throw error;
    }
  }

  /**
   * Logout user and clear all stored data
   */
  async logout(): Promise<void> {
    try {
      // No API call needed if there's no logout endpoint
    } catch (error) {
      console.warn("Logout error:", error);
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
      console.error("Error getting access token:", error);
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
      console.error("Error getting refresh token:", error);
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
      console.error("Error storing tokens:", error);
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
      console.error("Error storing user data:", error);
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
      console.error("Error getting user data:", error);
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
      console.error("Error clearing tokens:", error);
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
      console.error("Token validation error:", error);
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
      console.error("Token refresh error:", error);
      await this.clearTokens();
      return false;
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
export default authService;
