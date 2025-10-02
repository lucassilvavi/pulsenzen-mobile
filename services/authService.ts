import { appConfig } from '../config/appConfig';
import { APP_CONSTANTS } from '../constants/appConstants';
import { logger } from '../utils/secureLogger';
import { secureStorage } from '../utils/secureStorage';
import { networkManager } from '../utils/simpleNetworkManager';

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

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
  message: string;
  isInformational?: boolean; // True for expected messages like "email already exists"
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
        let isInformational = false;
        
        if (response.data) {
          // Try to get the most specific error message
          // Priority: error field first (more specific), then message field
          errorMessage = response.data.error || response.data.message || errorMessage;
          
          // Check if this is an informational message rather than a critical error
          // Status 409 (Conflict) or 422 (Unprocessable Entity) with specific messages are informational
          if ((response.status === 409 || response.status === 422) && 
              (errorMessage.toLowerCase().includes('already exists') || 
               errorMessage.toLowerCase().includes('já existe') ||
               errorMessage.toLowerCase().includes('email') ||
               errorMessage.toLowerCase().includes('validation'))) {
            isInformational = true;
          }
        } else if (response.error) {
          errorMessage = response.error;
        }
        
        logger.warn('AuthService', 'Registration failed - API error', { 
          status: response.status,
          error: errorMessage,
          errorData: response.data,
          rawError: response.error,
          isInformational
        });

        return {
          success: false,
          error: errorMessage,
          message: errorMessage,
          isInformational,
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
     

      if (response.success && response.data && response.data.user && response.data.token) {
        // Save token, refresh token, and user data for persistent login
        await this.saveAuthData(
          response.data.token, 
          response.data.refreshToken, 
          response.data.user
        );

        logger.info('AuthService', 'User login successful', { 
          userId: response.data.user.id 
        });

        return {
          success: true,
          data: response.data,
          message: response.message || 'Login successful',
        };
      } else {
        logger.warn('AuthService', 'Login failed', { 
          error: response.message || 'Invalid response structure',
          status: response.status 
        });

        return {
          success: false,
          error: response.message || 'Login failed',
          message: response.message || 'Invalid credentials',
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
      console.log('AuthService.isAuthenticated: início');
      const token = await this.getToken();
      const user = await this.getCurrentUser();
      if (!token || !user) {
        console.log('AuthService.isAuthenticated: missing credentials', { token, user });
        logger.debug('AuthService', 'Authentication check failed: missing credentials');
        return false;
      }
      if (token.split('.').length !== 3) {
        console.log('AuthService.isAuthenticated: invalid token format', token);
        logger.warn('AuthService', 'Invalid token format detected');
        return false;
      }
      // (Token validation com API está comentado)
      console.log('AuthService.isAuthenticated: sucesso, token e user válidos');
      return true;
    } catch (error) {
      console.error('AuthService.isAuthenticated: erro', error);
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
      
      // Save onboarding status - check multiple possible sources
      let onboardingComplete = false;
      
      if (user.onboardingComplete !== undefined) {
        onboardingComplete = user.onboardingComplete;
      } else if ((user as any).profile?.onboardingCompleted !== undefined) {
        onboardingComplete = (user as any).profile.onboardingCompleted;
        // Update user object to include onboardingComplete for consistency
        user.onboardingComplete = onboardingComplete;
        await secureStorage.setItem(this.USER_KEY, JSON.stringify(user));
      }
      
      await secureStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.ONBOARDING_DONE, onboardingComplete ? 'true' : 'false');
      logger.info('AuthService', 'Onboarding status saved', { 
        onboardingComplete,
        source: user.onboardingComplete !== undefined ? 'user.onboardingComplete' : 'user.profile.onboardingCompleted'
      });
    } catch (error) {
      logger.error('AuthService', 'Failed to save auth data', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Clear authentication data
   */
  private static async clearAuthData(): Promise<void> {
    try {
      const tokenBefore = await secureStorage.getItem(this.TOKEN_KEY);
      const refreshTokenBefore = await secureStorage.getItem(this.REFRESH_TOKEN_KEY);
      const userBefore = await secureStorage.getItem(this.USER_KEY);
      const onboardingBefore = await secureStorage.getItem('onboardingDone');
      logger.info('AuthService', 'Clearing auth data', {
        tokenBefore,
        refreshTokenBefore,
        userBefore,
        onboardingBefore,
      });
      await secureStorage.removeItem(this.TOKEN_KEY);
      logger.info('AuthService', 'Removed access token');
      await secureStorage.removeItem(this.REFRESH_TOKEN_KEY);
      logger.info('AuthService', 'Removed refresh token');
      await secureStorage.removeItem(this.USER_KEY);
      logger.info('AuthService', 'Removed user data');
      await secureStorage.removeItem('onboardingDone');
      logger.info('AuthService', 'Removed onboarding status');
      
      // Note: We don't clear biometric data on logout - users should keep their biometric setup
      // Biometric data is only cleared when explicitly disabled or on account deletion
      
      const tokenAfter = await secureStorage.getItem(this.TOKEN_KEY);
      const refreshTokenAfter = await secureStorage.getItem(this.REFRESH_TOKEN_KEY);
      const userAfter = await secureStorage.getItem(this.USER_KEY);
      const onboardingAfter = await secureStorage.getItem('onboardingDone');
      logger.info('AuthService', 'Auth data after clear', {
        tokenAfter,
        refreshTokenAfter,
        userAfter,
        onboardingAfter,
      });
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
        
        // Debug: Log the complete response structure
        logger.debug('AuthService', 'Complete API response structure', {
          responseSuccess: response.success,
          responseData: typeof response.data,
          apiResponseKeys: Object.keys(apiResponse || {}),
          apiResponseSuccess: apiResponse?.success,
          apiResponseData: apiResponse?.data ? Object.keys(apiResponse.data) : null,
          apiResponseProfile: !!apiResponse?.profile
        });
        
        // Secure logging - only log success/failure, not sensitive data
        logger.info('AuthService', 'Onboarding API response received', {
          success: apiResponse.success,
          hasData: !!apiResponse.data,
          hasProfile: !!(apiResponse.data?.profile || apiResponse.profile)
        });
        
        // Check if the API returned a successful response
        // The API might return just { profile: {...} } or { success: true, data/profile: {...} }
        const isSuccessful = apiResponse.success !== false && (apiResponse.profile || apiResponse.data?.profile);
        
        if (isSuccessful) {
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
            data: apiResponse.data?.profile || apiResponse.profile || apiResponse.data,
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
                  data: retryApiResponse.data?.profile || retryApiResponse.profile || retryApiResponse.data,
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
      
      // Save onboarding completion in AsyncStorage - use the constant key
      await secureStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.ONBOARDING_DONE, 'true');
      await secureStorage.setItem('onboarding_done', 'true'); // Keep for backward compatibility
      
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

  // ============================================================================
  // BIOMETRIC AUTHENTICATION METHODS
  // ============================================================================

  /**
   * Check if biometric authentication is available and enabled
   */
  static async isBiometricAvailable(): Promise<boolean> {
    try {
      const BiometricAuthService = (await import('./biometricAuthService')).default;
      const capabilities = await BiometricAuthService.checkBiometricCapabilities();
      return capabilities.hasBiometrics;
    } catch (error) {
      logger.error('AuthService', 'Error checking biometric availability', error as Error);
      return false;
    }
  }

  /**
   * Check if biometric authentication is enabled for current user
   */
  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const BiometricAuthService = (await import('./biometricAuthService')).default;
      return await BiometricAuthService.isBiometricEnabled();
    } catch (error) {
      logger.error('AuthService', 'Error checking biometric enabled status', error as Error);
      return false;
    }
  }

  /**
   * Setup biometric authentication for current user
   */
  static async setupBiometricAuth(): Promise<{ success: boolean; error?: string }> {
    try {
      logger.info('AuthService', 'Setting up biometric authentication');

      // Check if user is authenticated
      if (!(await this.isAuthenticated())) {
        return {
          success: false,
          error: 'User must be authenticated to setup biometric auth',
        };
      }

      const BiometricAuthService = (await import('./biometricAuthService')).default;

      // Verify device capabilities
      const capabilitiesResult = await BiometricAuthService.verifyDeviceCapabilities();
      if (!capabilitiesResult.success) {
        return {
          success: false,
          error: capabilitiesResult.error || 'Device does not support biometric authentication',
        };
      }

      // Register device
      const registerResult = await BiometricAuthService.registerDevice();
      if (!registerResult.success) {
        return {
          success: false,
          error: registerResult.error || 'Failed to register device',
        };
      }

      // Enable biometric authentication
      const enableResult = await BiometricAuthService.enableBiometricAuth();
      if (!enableResult.success) {
        return {
          success: false,
          error: enableResult.error || 'Failed to enable biometric authentication',
        };
      }

      logger.info('AuthService', 'Biometric authentication setup completed successfully');
      return { success: true };

    } catch (error) {
      logger.error('AuthService', 'Error setting up biometric authentication', error as Error);
      return {
        success: false,
        error: 'Failed to setup biometric authentication',
      };
    }
  }

  /**
   * Login with biometric authentication
   */
  static async loginWithBiometric(): Promise<AuthResponse> {
    try {
      logger.info('AuthService', 'Attempting biometric login');

      const BiometricAuthService = (await import('./biometricAuthService')).default;

      // Check if biometric is enabled
      const isEnabled = await BiometricAuthService.isBiometricEnabled();
      if (!isEnabled) {
        return {
          success: false,
          error: 'Biometric authentication not enabled',
          message: 'Please setup biometric authentication first',
        };
      }

      // Authenticate with biometrics
      const biometricResult = await BiometricAuthService.authenticateWithBiometrics();
      
      if (biometricResult.success && biometricResult.data) {
        const token = biometricResult.data.token;
        
        if (token) {
          // Log the new token for debugging
          logger.info('AuthService', 'Received new token from biometric auth', { 
            tokenLength: token.length,
            tokenStart: token.substring(0, 50) + '...',
            tokenEnd: '...' + token.substring(token.length - 20)
          });
          
          // Save the new token immediately
          await secureStorage.setItem(this.TOKEN_KEY, token);
          
          // Fetch user data using direct axios call to bypass interceptors
          try {
            logger.info('AuthService', 'Making profile request with new token');
            const axios = require('axios').default;
            const response = await axios.get(
              appConfig.getApiUrl('/auth/profile'),
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                timeout: 15000,
              }
            );
            
            logger.info('AuthService', 'Profile request successful', { status: response.status });
            
            if (response.data && response.data.success && response.data.data) {
              const userData = response.data.data;
              
              // Save complete auth data
              await this.saveAuthData(
                token,
                undefined, // No refresh token in biometric response
                userData
              );

              logger.info('AuthService', 'Biometric login successful');
              return {
                success: true,
                data: {
                  user: userData,
                  token: token,
                },
                message: 'Biometric login successful',
              };
            } else {
              logger.warn('AuthService', 'Failed to fetch user profile after biometric login');
              return {
                success: false,
                error: 'Failed to retrieve user profile',
                message: 'User profile fetch failed',
              };
            }
          } catch (profileError: any) {
            logger.error('AuthService', 'Error fetching user profile after biometric login', profileError);
            logger.info('AuthService', 'Profile error details', {
              status: profileError.response?.status,
              data: profileError.response?.data,
              tokenUsed: token.substring(0, 50) + '...'
            });
            return {
              success: false,
              error: 'Failed to retrieve user data',
              message: profileError?.response?.data?.message || 'Profile fetch error',
            };
          }
        } else {
          logger.warn('AuthService', 'Biometric login missing token');
          return {
            success: false,
            error: 'Invalid biometric response',
            message: 'Authentication token missing',
          };
        }
      } else {
        logger.warn('AuthService', 'Biometric login failed', { 
          error: biometricResult.error,
          fallbackMethods: biometricResult.fallbackMethods 
        });

        return {
          success: false,
          error: biometricResult.error || 'Biometric authentication failed',
          message: biometricResult.error || 'Biometric authentication failed',
        };
      }
    } catch (error) {
      logger.error('AuthService', 'Biometric login error', error as Error);
      return {
        success: false,
        error: 'Biometric login failed',
        message: 'Failed to authenticate with biometrics',
      };
    }
  }

  /**
   * Generate backup codes for biometric authentication
   */
  static async generateBiometricBackupCodes(): Promise<{ success: boolean; codes?: string[]; error?: string }> {
    try {
      logger.info('AuthService', 'Generating biometric backup codes');

      if (!(await this.isAuthenticated())) {
        return {
          success: false,
          error: 'Authentication required',
        };
      }

      const BiometricAuthService = (await import('./biometricAuthService')).default;
      const result = await BiometricAuthService.generateBackupCodes();

      if (result.success && result.data) {
        logger.info('AuthService', 'Backup codes generated successfully');
        return {
          success: true,
          codes: result.data.rawCodes || [],
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to generate backup codes',
        };
      }
    } catch (error) {
      logger.error('AuthService', 'Error generating backup codes', error as Error);
      return {
        success: false,
        error: 'Failed to generate backup codes',
      };
    }
  }

  /**
   * Get existing backup codes
   */
  static async getBiometricBackupCodes(): Promise<{ success: boolean; codes?: any[]; error?: string }> {
    try {
      logger.info('AuthService', 'Getting biometric backup codes');

      if (!(await this.isAuthenticated())) {
        return {
          success: false,
          error: 'Authentication required',
        };
      }

      const BiometricAuthService = (await import('./biometricAuthService')).default;
      const result = await BiometricAuthService.getBackupCodes();

      if (result.success && result.data) {
        logger.info('AuthService', 'Backup codes retrieved successfully');
        return {
          success: true,
          codes: result.data.codes || [],
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to get backup codes',
        };
      }
    } catch (error) {
      logger.error('AuthService', 'Error getting backup codes', error as Error);
      return {
        success: false,
        error: 'Failed to get backup codes',
      };
    }
  }

  /**
   * Disable biometric authentication
   */
  static async disableBiometricAuth(): Promise<{ success: boolean; error?: string }> {
    try {
      logger.info('AuthService', 'Disabling biometric authentication');

      const BiometricAuthService = (await import('./biometricAuthService')).default;
      const result = await BiometricAuthService.disableBiometricAuth();

      if (result.success) {
        logger.info('AuthService', 'Biometric authentication disabled successfully');
      }

      return result;
    } catch (error) {
      logger.error('AuthService', 'Error disabling biometric authentication', error as Error);
      return {
        success: false,
        error: 'Failed to disable biometric authentication',
      };
    }
  }
}

export default AuthService;
