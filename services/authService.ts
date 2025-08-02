import { appConfig } from '../config/appConfig';
import { APP_CONSTANTS } from '../constants/appConstants';
import { networkManager } from '../utils/simpleNetworkManager';
import { logger } from '../utils/secureLogger';
import { secureStorage } from '../utils/secureStorage';

const API_BASE_URL = appConfig.getApiUrl();

// Legacy types for backward compatibility - will be removed
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
    dateOfBirth?: string;
    goals?: string[];
    mentalHealthConcerns?: string[];
    preferredActivities?: string[];
    currentStressLevel?: number;
    sleepHours?: number;
    exerciseFrequency?: string;
    preferredContactMethod?: string;
    notificationPreferences?: {
      reminders: boolean;
      progress: boolean;
      tips: boolean;
    };
  };
}

export interface OnboardingData {
  dateOfBirth: string;
  goals: string[];
  mentalHealthConcerns: string[];
  preferredActivities: string[];
  currentStressLevel: number;
  sleepHours: number;
  exerciseFrequency: string;
  preferredContactMethod: string;
  notificationPreferences: {
    reminders: boolean;
    progress: boolean;
    tips: boolean;
  };
}

class AuthService {
  private static TOKEN_KEY = APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN;
  private static REFRESH_TOKEN_KEY = APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN;
  private static USER_KEY = APP_CONSTANTS.STORAGE_KEYS.USER_DATA;

  /**
   * Register a new user
   */
  static async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      logger.info('AuthService', 'Attempting user registration', { email: userData.email });

      const response = await networkManager.post<any>(
        appConfig.getApiUrl('/auth/register'),
        userData,
        {
          timeout: 15000,
          retries: 2,
          priority: 'high',
          tags: ['auth'],
        }
      );

      if (response.success && response.data) {
        // The API response is nested: response.data contains the actual API response
        const apiResponse = response.data;
        
        if (apiResponse.success && apiResponse.data && apiResponse.data.user && apiResponse.data.token) {
          // Save token, refresh token, and user data for persistent login
          await this.saveAuthData(
            apiResponse.data.token, 
            apiResponse.data.refreshToken, 
            apiResponse.data.user
          );
          
          // Clear onboarding status for new users (they need to complete onboarding)
          await secureStorage.removeItem('onboarding_done');

          logger.info('AuthService', 'User registration successful', { 
            userId: apiResponse.data.user.id 
          });

          return {
            success: true,
            data: apiResponse.data,
            message: apiResponse.message || 'Registration successful',
          };
        } else {
          logger.warn('AuthService', 'Registration failed', { 
            error: apiResponse.message || 'Invalid response structure',
            status: response.status 
          });

          return {
            success: false,
            error: apiResponse.message || 'Registration failed',
            message: apiResponse.message || 'Failed to register. Please try again.',
          };
        }
      } else {
        // Handle error responses (400, 422, etc.) - now properly handled by simpleNetworkManager
        let errorMessage = 'Registration failed';
        
        if (response.data) {
          // Try to get the most specific error message
          // Priority: error field first (more specific), then message field
          errorMessage = response.data.error || response.data.message || errorMessage;
        } else if (response.error) {
          errorMessage = response.error;
        }
        
        logger.warn('AuthService', 'Registration failed - API error', { 
          status: response.status,
          error: errorMessage,
          errorData: response.data,
          rawError: response.error
        });

        return {
          success: false,
          error: errorMessage,
          message: errorMessage,
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

      const response = await networkManager.post<any>(
        appConfig.getApiUrl('/auth/login'),
        credentials,
        {
          timeout: 15000,
          retries: 2,
          priority: 'high',
          tags: ['auth'],
        }
      );

      if (response.success && response.data) {
        // The API response is nested: response.data contains the actual API response
        const apiResponse = response.data;
        
        if (apiResponse.success && apiResponse.data && apiResponse.data.user && apiResponse.data.token) {
          // Save token, refresh token, and user data for persistent login
          await this.saveAuthData(
            apiResponse.data.token, 
            apiResponse.data.refreshToken, 
            apiResponse.data.user
          );

          logger.info('AuthService', 'User login successful', { 
            userId: apiResponse.data.user.id 
          });

          return {
            success: true,
            data: apiResponse.data,
            message: apiResponse.message || 'Login successful',
          };
        } else {
          logger.warn('AuthService', 'Login failed', { 
            error: apiResponse.message || 'Invalid response structure',
            status: response.status 
          });

          return {
            success: false,
            error: apiResponse.message || 'Login failed',
            message: apiResponse.message || 'Invalid credentials',
          };
        }
      } else {
        // Handle error responses (400, 401, 422, etc.)
        const errorMessage = response.error || response.data?.message || response.data?.error || 'Login failed';
        
        logger.warn('AuthService', 'Login failed - API error', { 
          status: response.status,
          error: errorMessage,
          errorData: response.data
        });

        return {
          success: false,
          error: errorMessage,
          message: errorMessage,
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
      logger.info('AuthService', 'Getting user profile');

      // Get auth header for authenticated request
      const authHeader = await this.getAuthHeader();

      const response = await networkManager.get<UserProfile>(
        appConfig.getApiUrl('/auth/profile'),
        {
          timeout: 15000,
          retries: 2,
          priority: 'medium',
          tags: ['auth', 'profile'],
          headers: authHeader,
        }
      );

      if (response.success && response.data) {
        logger.info('AuthService', 'Profile retrieved successfully');
        return response.data;
      } else {
        logger.warn('AuthService', 'Failed to get profile', { 
          error: response.error,
          status: response.status 
        });
        
        // If it's a 401 error, try to refresh token and retry
        if (response.status === 401 || response.error?.includes('401')) {
          logger.info('AuthService', 'Attempting token refresh due to 401 error');
          
          const refreshResult = await this.refreshAuthToken();
          if (refreshResult.success) {
            // Retry the request with new token
            logger.info('AuthService', 'Retrying profile request with refreshed token');
            const newAuthHeader = await this.getAuthHeader();
            
            const retryResponse = await networkManager.get<UserProfile>(
              appConfig.getApiUrl('/auth/profile'),
              {
                timeout: 15000,
                retries: 1,
                priority: 'medium',
                tags: ['auth', 'profile', 'retry'],
                headers: newAuthHeader,
              }
            );
            
            if (retryResponse.success && retryResponse.data) {
              logger.info('AuthService', 'Profile retrieved successfully after token refresh');
              return retryResponse.data;
            }
          }
          
          // If refresh failed or retry failed, throw error to trigger logout
          throw new Error('HTTP 401: Authentication failed');
        }
        
        return null;
      }
    } catch (error) {
      logger.error('AuthService', 'Get profile error', error as Error);
      
      // Re-throw 401 errors to be handled by calling code
      const errorMessage = (error as any)?.message || String(error);
      if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
        throw error;
      }
      
      return null;
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      logger.info('AuthService', 'Logging out user');

      // Try to call logout endpoint
      try {
        // Get auth header for authenticated request
        const authHeader = await this.getAuthHeader();

        await networkManager.post(
          appConfig.getApiUrl('/auth/logout'),
          {},
          {
            timeout: 10000,
            retries: 1,
            priority: 'medium',
            tags: ['auth'],
            headers: authHeader,
          }
        );
        logger.info('AuthService', 'Logout API call successful');
      } catch (apiError) {
        logger.warn('AuthService', 'Logout API call failed, continuing with local cleanup', apiError as Error);
      }
    } catch (error) {
      logger.error('AuthService', 'Logout error', error as Error);
    } finally {
      // Always clear local data
      await this.clearAuthData();
      logger.info('AuthService', 'Local auth data cleared');
    }
  }

  /**
   * Validate password strength
   */
  static async validatePassword(password: string): Promise<{ valid: boolean; message?: string }> {
    try {
      logger.info('AuthService', 'Validating password');

      const response = await networkManager.post<any>(
        appConfig.getApiUrl('/auth/validate-password'),
        { password },
        {
          timeout: 10000,
          retries: 1,
          priority: 'low',
          tags: ['auth'],
        }
      );

      if (response.success && response.data) {
        // The API response is nested: response.data contains the actual API response
        const apiResponse = response.data;
        if (apiResponse.success && apiResponse.data) {
          return apiResponse.data;
        }
        return { valid: false, message: apiResponse.message || 'Password validation failed' };
      }

      return { valid: false, message: 'Password validation failed' };
    } catch (error) {
      logger.error('AuthService', 'Validate password error', error as Error);
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
      
      // Basic check: both token and user data exist
      if (!token || !user) {
        logger.debug('AuthService', 'Authentication check failed: missing credentials');
        return false;
      }

      // Basic token format validation
      if (token.split('.').length !== 3) {
        logger.warn('AuthService', 'Invalid token format detected');
        return false;
      }
      
      // Optional: Validate token with server (commented out to avoid extra API calls)
      // try {
      //   const authHeader = await this.getAuthHeader();
      //   const response = await networkManager.get(
      //     appConfig.getApiUrl('/auth/validate'),
      //     { headers: authHeader, timeout: 5000, retries: 1 }
      //   );
      //   return response.success;
      // } catch (error) {
      //   logger.debug("AuthService", 'Token validation failed:', error);
      //   return false;
      // }
      
      return true;
    } catch (error) {
      logger.error('AuthService', 'Check auth error', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Refresh the authentication token
   */
  static async refreshAuthToken(): Promise<{ success: boolean; message: string }> {
    try {
      logger.info('AuthService', 'Attempting to refresh authentication token');

      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        logger.warn('AuthService', 'No refresh token available');
        return { success: false, message: 'No refresh token available' };
      }

      const response = await networkManager.post<any>(
        appConfig.getApiUrl('/auth/refresh-token'),
        { refreshToken },
        {
          timeout: 15000,
          retries: 2,
          priority: 'high',
          tags: ['auth', 'refresh'],
        }
      );

      if (response.success && response.data) {
        const apiResponse = response.data;
        
        if (apiResponse.success && apiResponse.data) {
          // Update stored tokens
          await secureStorage.setItem(this.TOKEN_KEY, apiResponse.data.token);
          if (apiResponse.data.refreshToken) {
            await secureStorage.setItem(this.REFRESH_TOKEN_KEY, apiResponse.data.refreshToken);
          }

          logger.info('AuthService', 'Token refresh successful');
          return { success: true, message: 'Token refreshed successfully' };
        } else {
          logger.warn('AuthService', 'Token refresh failed', { 
            error: apiResponse.message 
          });
          return { success: false, message: apiResponse.message || 'Token refresh failed' };
        }
      } else {
        logger.warn('AuthService', 'Token refresh failed - no data in response');
        return { success: false, message: 'Token refresh failed' };
      }
    } catch (error) {
      logger.error('AuthService', 'Token refresh error', error as Error);
      return { success: false, message: 'Failed to refresh token. Please login again.' };
    }
  }
  static async validateToken(): Promise<boolean> {
    try {
      logger.info('AuthService', 'Validating authentication token');

      const authHeader = await this.getAuthHeader();
      if (!('Authorization' in authHeader)) {
        logger.warn('AuthService', 'No authorization header available for validation');
        return false;
      }

      const response = await networkManager.get<any>(
        appConfig.getApiUrl('/auth/validate'),
        {
          timeout: 10000,
          retries: 1,
          priority: 'medium',
          tags: ['auth'],
          headers: authHeader,
        }
      );

      if (response.success) {
        logger.info('AuthService', 'Token validation successful');
        return true;
      } else {
        logger.warn('AuthService', 'Token validation failed', { 
          error: response.error,
          status: response.status 
        });
        return false;
      }
    } catch (error) {
      logger.error('AuthService', 'Token validation error', error as Error);
      return false;
    }
  }

  /**
   * Get stored auth token
   */
  static async getToken(): Promise<string | null> {
    try {
      const token = await secureStorage.getItem<string>(this.TOKEN_KEY);
      logger.debug("AuthService", 'Token retrieval attempt:', token ? `Token found (length: ${token.length})` : 'No token found');
      return token;
    } catch (error) {
      logger.error('AuthService', 'Failed to retrieve token', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  /**
   * Get stored refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      const refreshToken = await secureStorage.getItem<string>(this.REFRESH_TOKEN_KEY);
      logger.debug("AuthService", 'Refresh token retrieval attempt:', refreshToken ? `Refresh token found (length: ${refreshToken.length})` : 'No refresh token found');
      return refreshToken;
    } catch (error) {
      logger.error('AuthService', 'Failed to retrieve refresh token', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  /**
   * Get current user data
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await secureStorage.getItem<string>(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      logger.error('AuthService', 'Failed to retrieve user data', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  /**
   * Save authentication data
   */
  private static async saveAuthData(token: string, refreshToken: string | undefined, user: User): Promise<void> {
    try {
      await secureStorage.setItem(this.TOKEN_KEY, token);
      if (refreshToken) {
        await secureStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      }
      await secureStorage.setItem(this.USER_KEY, JSON.stringify(user));
      
      // Save onboarding status if available in user data
      if (user.onboardingComplete !== undefined) {
        await secureStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.ONBOARDING_DONE, user.onboardingComplete ? 'true' : 'false');
        logger.info('AuthService', 'Onboarding status saved from user data', { onboardingComplete: user.onboardingComplete });
      }
    } catch (error) {
      logger.error('AuthService', 'Failed to save auth data', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Clear authentication data
   */
  private static async clearAuthData(): Promise<void> {
    try {
      await secureStorage.removeItem(this.TOKEN_KEY);
      await secureStorage.removeItem(this.REFRESH_TOKEN_KEY);
      await secureStorage.removeItem(this.USER_KEY);
      await secureStorage.removeItem('onboardingDone'); // Also clear onboarding status on logout
    } catch (error) {
      logger.error('AuthService', 'Failed to clear auth data', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Get authorization header for API requests
   */
  static async getAuthHeader(): Promise<{ Authorization: string } | {}> {
    try {
      const token = await this.getToken();
      logger.debug("AuthService", 'Token retrieved for auth header:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        logger.warn('AuthService', 'No authentication token found');
        return {};
      }
      
      return { Authorization: `Bearer ${token}` };
    } catch (error) {
      logger.error('AuthService', 'Error getting auth header', error as Error);
      return {};
    }
  }

  /**
   * Complete user onboarding with secure logging
   */
  static async completeOnboarding(onboardingData: OnboardingData): Promise<{ success: boolean; message: string; data?: UserProfile }> {
    try {
      logger.info('AuthService', 'Starting onboarding completion process');

      // Get auth header for authenticated request
      const authHeader = await this.getAuthHeader();

      const response = await networkManager.post<any>(
        appConfig.getApiUrl('/auth/complete-onboarding'),
        onboardingData,
        {
          timeout: APP_CONSTANTS.API.TIMEOUT,
          retries: APP_CONSTANTS.API.RETRY_ATTEMPTS,
          priority: 'high',
          tags: ['auth', 'onboarding'],
          headers: authHeader,
        }
      );

      if (response.success && response.data) {
        const apiResponse = response.data;
        
        // Secure logging - only log success/failure, not sensitive data
        logger.info('AuthService', 'Onboarding API response received', {
          success: apiResponse.success,
          hasData: !!apiResponse.data,
          hasProfile: !!apiResponse.profile
        });
        
        if (apiResponse.success) {
          // Update local user data with onboarding completion
          const currentUser = await this.getCurrentUser();
          if (currentUser) {
            const updatedUser = { ...currentUser, onboardingComplete: true };
            await secureStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
          }
          
          // Mark onboarding as done locally using constants
          await secureStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.ONBOARDING_DONE, 'true');

          logger.info('AuthService', 'Onboarding completed successfully');

          return {
            success: true,
            message: apiResponse.message || 'Onboarding completed successfully',
            data: apiResponse.profile || apiResponse.data,
          };
        } else {
          logger.warn('AuthService', 'Onboarding completion failed', { 
            error: apiResponse.message 
          });

          return {
            success: false,
            message: apiResponse.message || 'Failed to complete onboarding',
          };
        }
      } else {
        logger.warn('AuthService', 'Onboarding completion failed - invalid response', {
          status: response.status,
          hasError: !!response.error
        });

        // If it's a 401 error, try to refresh token and retry
        if (response.status === 401 || response.error?.includes('401')) {
          logger.info('AuthService', 'Attempting token refresh for onboarding due to 401 error');
          
          const refreshResult = await this.refreshAuthToken();
          if (refreshResult.success) {
            // Retry the request with new token
            logger.info('AuthService', 'Retrying onboarding completion with refreshed token');
            const newAuthHeader = await this.getAuthHeader();
            
            const retryResponse = await networkManager.post<any>(
              appConfig.getApiUrl('/auth/complete-onboarding'),
              onboardingData,
              {
                timeout: 15000,
                retries: 1,
                priority: 'high',
                tags: ['auth', 'onboarding', 'retry'],
                headers: newAuthHeader,
              }
            );
            
            if (retryResponse.success && retryResponse.data) {
              const retryApiResponse = retryResponse.data;
              
              if (retryApiResponse.success) {
                // Update local user data with onboarding completion
                const currentUser = await this.getCurrentUser();
                if (currentUser) {
                  const updatedUser = { ...currentUser, onboardingComplete: true };
                  await secureStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
                }
                
                // Mark onboarding as done locally
                await secureStorage.setItem('onboardingDone', 'true');

                logger.info('AuthService', 'Onboarding completed successfully after token refresh');

                return {
                  success: true,
                  message: retryApiResponse.message || 'Onboarding completed successfully',
                  data: retryApiResponse.profile || retryApiResponse.data,
                };
              }
            }
          }
          
          // If refresh failed or retry failed, return authentication error
          return {
            success: false,
            message: 'Authentication failed. Please login again.',
          };
        }

        return {
          success: false,
          message: 'Failed to complete onboarding',
        };
      }
    } catch (error) {
      logger.error('AuthService', 'Onboarding completion error', error as Error);
      
      // Check if it's an authentication error
      const errorMessage = (error as any)?.message || String(error);
      if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
        return {
          success: false,
          message: 'Authentication failed. Please login again.',
        };
      }
      
      return {
        success: false,
        message: 'Failed to complete onboarding. Please check your connection.',
      };
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(profileData: Partial<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    goals: string[];
    mentalHealthConcerns: string[];
    preferredActivities: string[];
    currentStressLevel: number;
    sleepHours: number;
    exerciseFrequency: string;
    preferredContactMethod: string;
    notificationPreferences: {
      reminders: boolean;
      progress: boolean;
      tips: boolean;
    };
  }>): Promise<{ success: boolean; message: string; data?: UserProfile }> {
    try {
      logger.info('AuthService', 'Updating user profile');

      // Get auth header for authenticated request
      const authHeader = await this.getAuthHeader();

      const response = await networkManager.put<UserProfile>(
        appConfig.getApiUrl('/auth/profile'),
        profileData,
        {
          timeout: 15000,
          retries: 2,
          priority: 'high',
          tags: ['auth', 'profile'],
          headers: authHeader,
        }
      );

      if (response.success && response.data) {
        logger.info('AuthService', 'Profile updated successfully');

        return {
          success: true,
          message: 'Profile updated successfully',
          data: response.data,
        };
      } else {
        logger.warn('AuthService', 'Profile update failed', { 
          error: response.error 
        });

        return {
          success: false,
          message: response.error || 'Failed to update profile',
        };
      }
    } catch (error) {
      logger.error('AuthService', 'Profile update error', error as Error);
      return {
        success: false,
        message: 'Failed to update profile. Please check your connection.',
      };
    }
  }

  /**
   * Mark onboarding as complete for current user
   */
  static async markOnboardingComplete(userId: string): Promise<void> {
    try {
      logger.debug("AuthService", 'Marking onboarding as complete for user:', userId);
      
      // Update user data locally to mark onboarding as complete
      const currentUser = await this.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, onboardingComplete: true };
        await secureStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
        logger.debug("AuthService", 'Updated user data with onboarding complete');
      }
      
      // Save onboarding completion in AsyncStorage - use both keys for compatibility
      await secureStorage.setItem('onboardingDone', 'true');
      await secureStorage.setItem('onboarding_done', 'true');
      
      logger.debug("AuthService", 'Onboarding marked as complete successfully');
    } catch (error) {
      logger.error('AuthService', 'Mark onboarding complete error', error instanceof Error ? error : new Error(String(error)));
      
      // Fallback: try to save directly to AsyncStorage without encryption
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('onboardingDone', 'true');
        await AsyncStorage.setItem('onboarding_done', 'true');
        logger.debug("AuthService", 'Fallback: Onboarding marked as complete in AsyncStorage');
      } catch (fallbackError) {
        logger.error('AuthService', 'Fallback storage also failed', fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError)));
      }
    }
  }
}

export default AuthService;
