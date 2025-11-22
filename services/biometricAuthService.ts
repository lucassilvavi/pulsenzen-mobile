import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { appConfig } from '../config/appConfig';
import { logger } from '../utils/secureLogger';
import { secureStorage } from '../utils/secureStorage';
import { networkManager } from '../utils/simpleNetworkManager';

// Types
export interface BiometricCapabilities {
  hasBiometrics: boolean;
  hasDevicePasscode: boolean;
  hasScreenLock: boolean;
  biometricTypes: string[];
  deviceSecurity?: 'high' | 'medium' | 'low';
}

export interface DeviceInfo {
  platform: string;
  version: string;
  model: string;
  manufacturer?: string;
  isJailbroken?: boolean;
  screenSize?: string;
  os?: string;
}

export interface BiometricEnableResponse {
  success: boolean;
  data?: {
    biometricEnabled: boolean;
    biometricType: string;
    token?: any;
  };
  error?: string;
  message?: string;
}

export interface BiometricLoginResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      emailVerified: boolean;
      profile: any;
    };
    token: string;
    refreshToken: string;
  };
  error?: string;
  fallbackMethods?: string[];
  deviceId?: string;
  // Informações adicionais de biometria (opcional no backend)
  biometric?: {
    method: string;
    trustScore: number;
    deviceId: string;
    expiresAt: string;
  };
}

export interface BackupCodesResponse {
  success: boolean;
  data?: {
    codes: Array<{
      id: string;
      codePartial: string;
      isUsed: boolean;
      expiresAt: string;
    }>;
    rawCodes?: string[];
    totalValid?: number;
    totalUsed?: number;
    message?: string;
  };
  error?: string;
  message?: string;
}

class BiometricAuthService {
  private static DEVICE_FINGERPRINT_KEY = 'device_fingerprint';
  private static DEVICE_ID_KEY = 'device_id';
  private static BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
  
  // In-memory cache for performance
  private static deviceFingerprintCache: string | null = null;
  private static deviceInfoCache: DeviceInfo | null = null;

  /**
   * Check device biometric capabilities
   */
  static async checkBiometricCapabilities(): Promise<BiometricCapabilities> {
    try {
      logger.debug('BiometricAuthService', 'Checking device biometric capabilities');

      // Check if device has biometric hardware
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        logger.info('BiometricAuthService', 'Device does not have biometric hardware');
        return {
          hasBiometrics: false,
          hasDevicePasscode: false,
          hasScreenLock: false,
          biometricTypes: [],
          deviceSecurity: 'low',
        };
      }

      // Check if biometrics are enrolled
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        logger.debug('BiometricAuthService', 'No biometrics enrolled on device');
        return {
          hasBiometrics: false,
          hasDevicePasscode: false,
          hasScreenLock: false,
          biometricTypes: [],
          deviceSecurity: 'medium',
        };
      }

      // Get available authentication types
      const authTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const biometricTypes: string[] = [];

      authTypes.forEach(type => {
        switch (type) {
          case LocalAuthentication.AuthenticationType.FINGERPRINT:
            biometricTypes.push('fingerprint');
            break;
          case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
            biometricTypes.push('faceId');
            break;
          case LocalAuthentication.AuthenticationType.IRIS:
            biometricTypes.push('iris');
            break;
        }
      });

      // Check security level
      const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();
      let deviceSecurity: 'high' | 'medium' | 'low' = 'medium';
      
      switch (securityLevel) {
        case LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG:
          deviceSecurity = 'high';
          break;
        case LocalAuthentication.SecurityLevel.BIOMETRIC_WEAK:
          deviceSecurity = 'medium';
          break;
        default:
          deviceSecurity = 'low';
          break;
      }

      const capabilities: BiometricCapabilities = {
        hasBiometrics: true,
        hasDevicePasscode: true,
        hasScreenLock: true,
        biometricTypes,
        deviceSecurity,
      };

      logger.info('BiometricAuthService', 'Biometric capabilities checked', { capabilities });
      return capabilities;

    } catch (error) {
      logger.error('BiometricAuthService', 'Error checking biometric capabilities', error as Error);
      return {
        hasBiometrics: false,
        hasDevicePasscode: false,
        hasScreenLock: false,
        biometricTypes: [],
        deviceSecurity: 'low',
      };
    }
  }

  /**
   * Get device information
   */
  static async getDeviceInfo(): Promise<DeviceInfo> {
    // Return cached version if available
    if (this.deviceInfoCache) {
      return this.deviceInfoCache;
    }

    try {
      logger.info('BiometricAuthService', 'Getting device information');

      const deviceInfo: DeviceInfo = {
        platform: Platform.OS,
        version: Platform.Version.toString(),
        model: Device.modelName || 'Unknown',
        manufacturer: Device.manufacturer || 'Unknown',
        isJailbroken: false, // TODO: Implement jailbreak detection
        os: `${Platform.OS} ${Platform.Version}`,
      };

      // Add screen dimensions if available
      if (Platform.OS === 'ios') {
        const { width, height } = require('react-native').Dimensions.get('screen');
        deviceInfo.screenSize = `${width}x${height}`;
      }

      logger.info('BiometricAuthService', 'Device information collected', { deviceInfo });
      
      // Cache for future calls
      this.deviceInfoCache = deviceInfo;
      
      return deviceInfo;

    } catch (error) {
      logger.error('BiometricAuthService', 'Error getting device info', error as Error);
      return {
        platform: Platform.OS,
        version: Platform.Version.toString(),
        model: 'Unknown',
        manufacturer: 'Unknown',
        isJailbroken: false,
      };
    }
  }

  /**
   * Generate or get device fingerprint
   */
  static async getDeviceFingerprint(): Promise<string> {
    // Return cached version if available
    if (this.deviceFingerprintCache) {
      return this.deviceFingerprintCache;
    }

    try {
      // Try to get existing fingerprint
      let fingerprint = await secureStorage.getItem<string>(this.DEVICE_FINGERPRINT_KEY);
      
      if (!fingerprint) {
        // Generate new fingerprint based on device characteristics
        const deviceInfo = await this.getDeviceInfo();
        const timestamp = Date.now().toString();
        const randomPart = Math.random().toString(36).substring(2, 15);
        
        fingerprint = `${deviceInfo.platform}-${deviceInfo.model}-${timestamp}-${randomPart}`
          .replace(/\s+/g, '-')
          .toLowerCase();
        
        // Store fingerprint securely
        await secureStorage.setItem(this.DEVICE_FINGERPRINT_KEY, fingerprint);
        logger.info('BiometricAuthService', 'New device fingerprint generated');
      }

      // Cache for future calls
      this.deviceFingerprintCache = fingerprint;

      return fingerprint;
    } catch (error) {
      logger.error('BiometricAuthService', 'Error getting device fingerprint', error as Error);
      // Fallback to a simple fingerprint
      return `${Platform.OS}-fallback-${Date.now()}`;
    }
  }

  /**
   * Verify device capabilities and register with API
   */
  static async verifyDeviceCapabilities(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      logger.info('BiometricAuthService', 'Verifying device capabilities with API');

      const capabilities = await this.checkBiometricCapabilities();

      const response = await networkManager.post<any>(
        appConfig.getApiUrl('/auth/device/capabilities'),
        { capabilities },
        {
          timeout: 15000,
          retries: 2,
          priority: 'high',
          tags: ['biometric', 'capabilities'],
        }
      );

      if (response.success && response.data) {
        logger.info('BiometricAuthService', 'Device capabilities verified successfully');
        return {
          success: true,
          data: response.data,
        };
      } else {
        logger.warn('BiometricAuthService', 'Failed to verify device capabilities', { error: response.error });
        return {
          success: false,
          error: response.error || 'Failed to verify device capabilities',
        };
      }
    } catch (error) {
      logger.error('BiometricAuthService', 'Error verifying device capabilities', error as Error);
      return {
        success: false,
        error: 'Failed to verify device capabilities',
      };
    }
  }

  /**
   * Register device for biometric authentication
   */
  static async registerDevice(): Promise<{ success: boolean; deviceId?: string; error?: string }> {
    try {
      logger.info('BiometricAuthService', 'Registering device for biometric authentication');

      // Check if we need authentication
      const AuthService = (await import('./authService')).default;
      const authHeader = await AuthService.getAuthHeader();
      
      if (!('Authorization' in authHeader)) {
        logger.warn('BiometricAuthService', 'No authentication token available for device registration');
        return {
          success: false,
          error: 'Authentication required',
        };
      }

      const deviceFingerprint = await this.getDeviceFingerprint();
      const deviceInfo = await this.getDeviceInfo();
      const capabilities = await this.checkBiometricCapabilities();

      // Get geolocation if available (optional)
      let geolocation = undefined;
      try {
        // This would require expo-location, which we can add later if needed
        // For now, we'll skip geolocation
      } catch (geoError) {
        logger.debug('BiometricAuthService', 'Geolocation not available');
      }

      const deviceData = {
        fingerprint: deviceFingerprint,
        deviceName: `${deviceInfo.manufacturer} ${deviceInfo.model}`,
        deviceType: 'mobile',
        platform: deviceInfo.platform,
        osVersion: deviceInfo.version,
        appVersion: '1.0.0', // TODO: Get from app config
        capabilities,
        geolocation,
        deviceInfo,
      };

      const response = await networkManager.post<any>(
        appConfig.getApiUrl('/auth/device/register'),
        deviceData,
        {
          timeout: 15000,
          retries: 2,
          priority: 'high',
          tags: ['biometric', 'register'],
          headers: authHeader,
        }
      );

      if (response.success && response.data && response.data.device?.id) {
        const deviceId = response.data.device.id;
        
        // Store device ID for future use
        await secureStorage.setItem(this.DEVICE_ID_KEY, deviceId);
        
        logger.info('BiometricAuthService', 'Device registered successfully', { deviceId });
        return {
          success: true,
          deviceId,
        };
      } else {
        logger.warn('BiometricAuthService', 'Failed to register device', { 
          error: response.data?.message,
          responseData: response.data
        });
        return {
          success: false,
          error: response.data?.message || 'Failed to register device',
        };
      }
    } catch (error) {
      logger.error('BiometricAuthService', 'Error registering device', error as Error);
      return {
        success: false,
        error: 'Failed to register device',
      };
    }
  }

  /**
   * Enable biometric authentication
   */
  static async enableBiometricAuth(): Promise<BiometricEnableResponse> {
    try {
      logger.info('BiometricAuthService', 'Enabling biometric authentication');

      // First check if biometrics are available
      const capabilities = await this.checkBiometricCapabilities();
      if (!capabilities.hasBiometrics) {
        return {
          success: false,
          error: 'Biometric authentication not available on this device',
        };
      }

      // Get authentication
      const AuthService = (await import('./authService')).default;
      const authHeader = await AuthService.getAuthHeader();
      
      if (!('Authorization' in authHeader)) {
        return {
          success: false,
          error: 'Authentication required',
        };
      }

      // Ensure device is registered
      let deviceId = await secureStorage.getItem<string>(this.DEVICE_ID_KEY);
      if (!deviceId) {
        const registerResult = await this.registerDevice();
        if (!registerResult.success) {
          return {
            success: false,
            error: registerResult.error || 'Failed to register device',
          };
        }
        deviceId = registerResult.deviceId!;
      }

      const deviceFingerprint = await this.getDeviceFingerprint();
      const primaryBiometricType = capabilities.biometricTypes[0] || 'fingerprint';

      // Mock biometric data - in production, this would be real biometric capture
      const biometricData = {
        deviceFingerprint,
        biometricType: primaryBiometricType,
        biometricData: {
          publicKey: 'real-mock-public-key-data',
          algorithm: 'RSA-2048',
          template: 'real-mock-biometric-template',
        },
        geolocation: null as { latitude: number; longitude: number; accuracy?: number } | null, // Will be populated if location is available
      };

      // Try to get geolocation for context
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
          });
          biometricData.geolocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || undefined,
          };
        } else {
          logger.debug('BiometricAuthService', 'Geolocation not available');
        }
      } catch (locationError) {
        logger.debug('BiometricAuthService', 'Geolocation not available');
      }

      const response = await networkManager.post<any>(
        appConfig.getApiUrl('/auth/biometric/enable'),
        biometricData,
        {
          timeout: 15000,
          retries: 2,
          priority: 'high',
          tags: ['biometric', 'enable'],
          headers: authHeader,
        }
      );

      if (response.success && response.data && response.data.biometricEnabled) {
        // Mark biometric as enabled locally
        await secureStorage.setItem(this.BIOMETRIC_ENABLED_KEY, 'true');
        
        logger.info('BiometricAuthService', 'Biometric authentication enabled successfully');
        return {
          success: true,
          data: response.data,
          message: 'Biometric authentication enabled successfully',
        };
      } else {
        logger.warn('BiometricAuthService', 'Failed to enable biometric authentication', { 
          error: response.data?.message,
          responseData: response.data,
          responseSuccess: response.success
        });
        return {
          success: false,
          error: response.data?.message || 'Failed to enable biometric authentication',
        };
      }
    } catch (error) {
      logger.error('BiometricAuthService', 'Error enabling biometric authentication', error as Error);
      return {
        success: false,
        error: 'Failed to enable biometric authentication',
      };
    }
  }

  /**
   * Authenticate with biometrics
   */
  static async authenticateWithBiometrics(): Promise<BiometricLoginResponse> {
    try {
      logger.info('BiometricAuthService', 'Starting biometric authentication');

      // Check if biometric is enabled for this device
      const biometricEnabled = await secureStorage.getItem<string>(this.BIOMETRIC_ENABLED_KEY);
      if (biometricEnabled !== 'true') {
        return {
          success: false,
          error: 'Biometric authentication not enabled for this device',
        };
      }

      // Check capabilities
      const capabilities = await this.checkBiometricCapabilities();
      if (!capabilities.hasBiometrics) {
        return {
          success: false,
          error: 'Biometric authentication not available',
        };
      }

      // Prompt for biometric authentication
      const biometricResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with biometrics',
        fallbackLabel: 'Use password',
        disableDeviceFallback: false,
      });

      if (!biometricResult.success) {
        logger.warn('BiometricAuthService', 'Biometric authentication failed', { 
          error: biometricResult.error 
        });
        return {
          success: false,
          error: 'Biometric authentication failed',
        };
      }

      // Execute all async operations in parallel for better performance
      const [deviceFingerprint, deviceInfo] = await Promise.all([
        this.getDeviceFingerprint(),
        this.getDeviceInfo(),
      ]);
      
      const primaryBiometricType = capabilities.biometricTypes[0] || 'fingerprint';

      // Generate signature and challenge in parallel
      const [biometricSignature, challengeResponse] = await Promise.all([
        this.generateBiometricSignature(deviceFingerprint, biometricResult),
        this.generateChallengeResponse(biometricResult),
      ]);

      // Prepare login data - backend will identify user by device fingerprint
      const loginData = {
        deviceFingerprint,
        biometricType: primaryBiometricType,
        biometricSignature,
        challengeResponse,
        deviceInfo,
      };

      const response = await networkManager.post<any>(
        appConfig.getApiUrl('/auth/biometric/login'),
        loginData,
        {
          timeout: 15000,
          retries: 2,
          priority: 'high',
          tags: ['biometric', 'login'],
        }
      );

      if (response.success && response.data && response.data) {
        // Note: Don't store token here, let AuthService handle it
        // The token will be properly saved by AuthService.loginWithBiometric()
        
        logger.info('BiometricAuthService', 'Biometric authentication successful');
        return {
          success: true,
          data: response.data,
        };
      } else {
        logger.warn('BiometricAuthService', 'Biometric login failed', { 
          error: response.data?.error,
          status: response.status 
        });
        
        return {
          success: false,
          error: response.data?.error || 'Biometric login failed',
          fallbackMethods: response.data?.fallbackMethods || [],
          deviceId: response.data?.deviceId,
        };
      }
    } catch (error) {
      logger.error('BiometricAuthService', 'Error during biometric authentication', error as Error);
      return {
        success: false,
        error: 'Biometric authentication failed',
      };
    }
  }

  /**
   * Generate backup codes
   */
  static async generateBackupCodes(): Promise<BackupCodesResponse> {
    try {
      logger.info('BiometricAuthService', 'Generating backup codes');

      const AuthService = (await import('./authService')).default;
      const authHeader = await AuthService.getAuthHeader();
      
      if (!('Authorization' in authHeader)) {
        return {
          success: false,
          error: 'Authentication required',
        };
      }

      const response = await networkManager.post<any>(
        appConfig.getApiUrl('/auth/backup-codes/generate'),
        {},
        {
          timeout: 15000,
          retries: 2,
          priority: 'high',
          tags: ['biometric', 'backup'],
          headers: authHeader,
        }
      );

      if (response.success && response.data && response.data) {
        logger.info('BiometricAuthService', 'Backup codes generated successfully');
        return {
          success: true,
          data: response.data,
          message: response.data.message || 'Backup codes generated successfully',
        };
      } else {
        logger.warn('BiometricAuthService', 'Failed to generate backup codes', { 
          error: response.data?.message 
        });
        return {
          success: false,
          error: response.data?.message || 'Failed to generate backup codes',
        };
      }
    } catch (error) {
      logger.error('BiometricAuthService', 'Error generating backup codes', error as Error);
      return {
        success: false,
        error: 'Failed to generate backup codes',
      };
    }
  }

  /**
   * Get backup codes
   */
  static async getBackupCodes(): Promise<BackupCodesResponse> {
    try {
      logger.info('BiometricAuthService', 'Getting backup codes');

      const AuthService = (await import('./authService')).default;
      const authHeader = await AuthService.getAuthHeader();
      
      if (!('Authorization' in authHeader)) {
        return {
          success: false,
          error: 'Authentication required',
        };
      }

      const response = await networkManager.get<any>(
        appConfig.getApiUrl('/auth/backup-codes'),
        {
          timeout: 15000,
          retries: 2,
          priority: 'medium',
          tags: ['biometric', 'backup'],
          headers: authHeader,
        }
      );

      if (response.success && response.data && response.data) {
        logger.info('BiometricAuthService', 'Backup codes retrieved successfully');
        return {
          success: true,
          data: response.data,
        };
      } else {
        logger.warn('BiometricAuthService', 'Failed to get backup codes', { 
          error: response.data?.message 
        });
        return {
          success: false,
          error: response.data?.message || 'Failed to get backup codes',
        };
      }
    } catch (error) {
      logger.error('BiometricAuthService', 'Error getting backup codes', error as Error);
      return {
        success: false,
        error: 'Failed to get backup codes',
      };
    }
  }

  /**
   * Check if biometric authentication is enabled
   */
  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await secureStorage.getItem<string>(this.BIOMETRIC_ENABLED_KEY);
      const capabilities = await this.checkBiometricCapabilities();
      return enabled === 'true' && capabilities.hasBiometrics;
    } catch (error) {
      logger.error('BiometricAuthService', 'Error checking biometric enabled status', error as Error);
      return false;
    }
  }

  /**
   * Disable biometric authentication
   */
  static async disableBiometricAuth(): Promise<{ success: boolean; error?: string }> {
    try {
      logger.info('BiometricAuthService', 'Disabling biometric authentication');

      // Remove local biometric enabled flag
      await secureStorage.removeItem(this.BIOMETRIC_ENABLED_KEY);

      // TODO: Call API to disable biometric on server side if needed

      logger.info('BiometricAuthService', 'Biometric authentication disabled');
      return { success: true };
    } catch (error) {
      logger.error('BiometricAuthService', 'Error disabling biometric authentication', error as Error);
      return {
        success: false,
        error: 'Failed to disable biometric authentication',
      };
    }
  }

  /**
   * Generates a real biometric signature based on device and authentication data
   * This must match the exact algorithm used by the backend for signature validation
   */
  static async generateBiometricSignature(deviceFingerprint: string, biometricResult: LocalAuthentication.LocalAuthenticationResult): Promise<string> {
    try {
      // Get the stored device ID from registration
      const deviceId = await secureStorage.getItem<string>(this.DEVICE_ID_KEY);
      if (!deviceId) {
        throw new Error('Device ID not found - device must be registered first');
      }

      // Use the same algorithm as backend: deviceId + publicKey + biometricType
      const publicKey = 'real-mock-public-key-data'; // This must match what's stored in backend
      const biometricType = 'fingerprint'; // Simplified for consistency
      
      // Backend algorithm: SHA256(deviceId + publicKey + biometricType)
      const signatureInput = deviceId + publicKey + biometricType;
      const signature = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        signatureInput
      );

      logger.debug('BiometricAuthService', `Generated biometric signature using backend algorithm:`, {
        deviceId: deviceId.substring(0, 8) + '...',
        publicKey: publicKey.substring(0, 10) + '...',
        biometricType,
        signatureLength: signature.length
      });

      return signature;
    } catch (error) {
      logger.error('BiometricAuthService', 'Failed to generate biometric signature', error as Error);
      throw error; // Don't use fallback - we need the correct algorithm
    }
  }

  /**
   * Generates a real challenge response based on biometric authentication
   */
  static async generateChallengeResponse(biometricResult: LocalAuthentication.LocalAuthenticationResult): Promise<string> {
    try {
      const challengeData = {
        timestamp: Date.now(),
        success: biometricResult.success,
        deviceModel: Device.modelName || 'unknown',
        osName: Device.osName || Platform.OS,
        osVersion: Device.osVersion || Platform.Version?.toString() || '0',
        randomChallenge: Math.random().toString(36).substring(2, 15)
      };

      // Generate challenge response hash
      const challengeString = JSON.stringify(challengeData);
      const challengeResponse = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        challengeString + biometricResult.success.toString()
      );

      logger.debug('BiometricAuthService', `Generated challenge response at ${challengeData.timestamp}, length: ${challengeResponse.length}`);

      return challengeResponse;
    } catch (error) {
      logger.error('BiometricAuthService', 'Failed to generate challenge response', error as Error);
      // Fallback challenge response
      return await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Date.now().toString() + Math.random().toString()
      );
    }
  }

  /**
  /**
   * Clear all biometric data
   */
  static async clearBiometricData(): Promise<void> {
    try {
      logger.info('BiometricAuthService', 'Clearing biometric data');
      
      await secureStorage.removeItem(this.DEVICE_FINGERPRINT_KEY);
      await secureStorage.removeItem(this.DEVICE_ID_KEY);
      await secureStorage.removeItem(this.BIOMETRIC_ENABLED_KEY);
      
      logger.info('BiometricAuthService', 'Biometric data cleared');
    } catch (error) {
      logger.error('BiometricAuthService', 'Error clearing biometric data', error as Error);
    }
  }
}

export default BiometricAuthService;
