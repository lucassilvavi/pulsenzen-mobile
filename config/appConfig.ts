import Constants from 'expo-constants';

export interface AppConfig {
  api: {
    baseUrl: string;
    version: string;
    timeout: number;
    retryAttempts: number;
  };
  environment: {
    nodeEnv: 'development' | 'staging' | 'production';
    isDebug: boolean;
    version: string;
  };
  features: {
    analytics: boolean;
    crashReporting: boolean;
    offlineMode: boolean;
    biometricAuth: boolean;
  };
  security: {
    encryptionEnabled: boolean;
    jwtSecret: string;
    biometricRequired: boolean;
  };
  thirdParty: {
    sentryDsn?: string;
    amplitudeApiKey?: string;
    firebaseConfig?: any;
  };
  limits: {
    apiRateLimit: number;
    requestTimeout: number;
    maxStorageSize: string;
  };
}

class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): AppConfig {
    const extra = Constants.expoConfig?.extra;
    
    return {
      api: {
        baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3333/api',
        version: process.env.EXPO_PUBLIC_API_VERSION || 'v1',
        timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000'),
        retryAttempts: parseInt(process.env.EXPO_PUBLIC_API_RETRY_ATTEMPTS || '3'),
      },
      environment: {
        nodeEnv: (process.env.EXPO_PUBLIC_NODE_ENV as any) || 'development',
        isDebug: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true',
        version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
      },
      features: {
        analytics: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
        crashReporting: process.env.EXPO_PUBLIC_ENABLE_CRASH_REPORTING === 'true',
        offlineMode: process.env.EXPO_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
        biometricAuth: process.env.EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH === 'true',
      },
      security: {
        encryptionEnabled: process.env.EXPO_PUBLIC_STORAGE_ENCRYPTION === 'true',
        jwtSecret: process.env.EXPO_PUBLIC_JWT_SECRET || '',
        biometricRequired: process.env.EXPO_PUBLIC_BIOMETRIC_REQUIRED === 'true',
      },
      thirdParty: {
        sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
        amplitudeApiKey: process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY,
        firebaseConfig: this.parseFirebaseConfig(),
      },
      limits: {
        apiRateLimit: parseInt(process.env.EXPO_PUBLIC_API_RATE_LIMIT || '100'),
        requestTimeout: parseInt(process.env.EXPO_PUBLIC_REQUEST_TIMEOUT || '10000'),
        maxStorageSize: process.env.EXPO_PUBLIC_MAX_STORAGE_SIZE || '50MB',
      },
    };
  }

  private parseFirebaseConfig(): any {
    try {
      const configString = process.env.EXPO_PUBLIC_FIREBASE_CONFIG;
      
      // 🔧 Validação melhorada: Verifica se é um valor válido antes de fazer parse
      if (!configString || 
          configString.trim() === '' || 
          configString === 'your-firebase-config' ||
          configString === 'disabled' ||
          configString.startsWith('your-')) {
        console.log('Firebase config not configured or using placeholder value, skipping');
        return null;
      }
      
      return JSON.parse(configString);
    } catch (error) {
      console.warn('Failed to parse Firebase config:', error);
      return null;
    }
  }

  private validateConfig(): void {
    const required = [
      'api.baseUrl',
      'environment.nodeEnv',
      'environment.version',
    ];

    for (const path of required) {
      const value = this.getNestedValue(this.config, path);
      if (!value) {
        throw new Error(`Missing required configuration: ${path}`);
      }
    }

    // Production-specific validations
    if (this.config.environment.nodeEnv === 'production') {
      if (!this.config.security.jwtSecret) {
        throw new Error('JWT secret is required in production');
      }
      if (this.config.features.crashReporting && !this.config.thirdParty.sentryDsn) {
        console.warn('Crash reporting enabled but Sentry DSN not configured');
      }
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  public getConfig(): AppConfig {
    return { ...this.config };
  }

  public getApiUrl(endpoint: string = ''): string {
    const { baseUrl, version } = this.config.api;
    return `${baseUrl}/${version}${endpoint}`;
  }

  public isProduction(): boolean {
    return this.config.environment.nodeEnv === 'production';
  }

  public isDevelopment(): boolean {
    return this.config.environment.nodeEnv === 'development';
  }

  public isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.config.features[feature];
  }
}

// Export singleton instance
export const appConfig = ConfigManager.getInstance();
export default appConfig;
