import { secureStorage } from '../utils/secureStorage';
import { logger } from '../utils/logger';
import { networkManager } from '../utils/networkManager';
import { appConfig } from '../config/appConfig';

const API_BASE_URL = appConfig.getApiUrl();

export interface RegisterData {
  email: string;
  password: string;
  password_confirmation: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  onboardingComplete?: boolean;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
  message: string;
}

export interface UserProfile {
  id: string;
  email: string;
  profile?: {
    firstName: string;
    lastName: string;
    onboardingCompleted: boolean;
  };
}

class AuthService {
  private static TOKEN_KEY = '@pulsezen_auth_token';
  private static USER_KEY = '@pulsezen_user_data';

  /**
   * Register a new user
   */
  static async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      logger.info('AuthService', 'Attempting user registration', { email: userData.email });

      const response = await networkManager.post<{ user: User; token: string }>(
        '/auth/register',
        userData,
        {
          timeout: 15000,
          retries: 2,
          priority: 'high',
          tags: ['auth'],
        }
      );

      if (response.success && response.data) {
        // Save token and user data for persistent login
        await this.saveAuthData(response.data.token, response.data.user);
        
        // Clear onboarding status for new users (they need to complete onboarding)
        await secureStorage.removeItem('onboarding_done');

        logger.info('AuthService', 'User registration successful', { 
          userId: response.data.user.id 
        });

        return {
          success: true,
          data: response.data,
          message: 'Registration successful',
        };
      } else {
        logger.warn('AuthService', 'Registration failed', { 
          error: response.error,
          status: response.status 
        });

        return {
          success: false,
          error: response.error || 'Registration failed',
          message: response.error || 'Failed to register. Please try again.',
        };
      }
    } catch (error) {
      logger.error('AuthService', 'Registration error', error as Error, { email: userData.email });
      return {
        success: false,
        error: 'Network error',
        message: 'Failed to register. Please check your connection.',
      };
    }
  }

  /**
   * Login user
   */
  static async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      logger.info('AuthService', 'Attempting user login', { email: credentials.email });

      const response = await networkManager.post<{ user: User; token: string }>(
        '/auth/login',
        credentials,
        {
          timeout: 15000,
          retries: 2,
          priority: 'high',
          tags: ['auth'],
        }
      );

      if (response.success && response.data) {
        // Save token and user data for persistent login
        await this.saveAuthData(response.data.token, response.data.user);

        logger.info('AuthService', 'User login successful', { 
          userId: response.data.user.id 
        });

        return {
          success: true,
          data: response.data,
          message: 'Login successful',
        };
      } else {
        logger.warn('AuthService', 'Login failed', { 
          error: response.error,
          status: response.status 
        });

        return {
          success: false,
          error: response.error || 'Login failed',
          message: response.error || 'Invalid credentials',
        };
      }
    } catch (error) {
      logger.error('AuthService', 'Login error', error as Error, { email: credentials.email });
      return {
        success: false,
        error: 'Network error',
        message: 'Failed to login. Please check your connection.',
      };
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<UserProfile | null> {
    try {
      const token = await this.getToken();
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        return result.data;
      }

      return null;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      // Try to call logout endpoint
      const token = await this.getToken();
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local data
      await this.clearAuthData();
    }
  }

  /**
   * Validate password strength
   */
  static async validatePassword(password: string): Promise<{ valid: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (result.success) {
        return result.data;
      }

      return { valid: false, message: 'Password validation failed' };
    } catch (error) {
      console.error('Validate password error:', error);
      return { valid: false, message: 'Unable to validate password' };
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getToken();
      const user = await this.getCurrentUser();
      return !!(token && user);
    } catch (error) {
      console.error('Check auth error:', error);
      return false;
    }
  }

  /**
   * Get stored auth token
   */
  static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }

  /**
   * Get current user data
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  /**
   * Save authentication data
   */
  private static async saveAuthData(token: string, user: User): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [this.TOKEN_KEY, token],
        [this.USER_KEY, JSON.stringify(user)],
      ]);
    } catch (error) {
      console.error('Save auth data error:', error);
    }
  }

  /**
   * Clear authentication data
   */
  private static async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.TOKEN_KEY, 
        this.USER_KEY,
        'onboardingDone' // Also clear onboarding status on logout
      ]);
    } catch (error) {
      console.error('Clear auth data error:', error);
    }
  }

  /**
   * Get authorization header for API requests
   */
  static async getAuthHeader(): Promise<{ Authorization: string } | {}> {
    const token = await this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Mark onboarding as complete for current user
   */
  static async markOnboardingComplete(userId: string): Promise<void> {
    try {
      // Update user data locally to mark onboarding as complete
      const currentUser = await this.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, onboardingComplete: true };
        await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
      }
      
      // Save onboarding completion in AsyncStorage
      await AsyncStorage.setItem('onboardingDone', 'true');
    } catch (error) {
      console.error('Mark onboarding complete error:', error);
    }
  }
}

export default AuthService;
