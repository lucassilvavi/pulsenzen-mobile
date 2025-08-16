/**
 * Environment Configuration
 * Configurações específicas para cada ambiente (dev, staging, production)
 */

const isDev = process.env.NODE_ENV === 'development';
const isStaging = process.env.EXPO_PUBLIC_ENVIRONMENT === 'staging';
const isProd = process.env.NODE_ENV === 'production';

const getApiUrl = () => {
  if (isProd) {
    return 'https://api.pulsezen.com';
  }
  if (isStaging) {
    return 'https://staging-api.pulsezen.com';
  }
  return 'http://localhost:3333'; // development
};

const getWebUrl = () => {
  if (isProd) {
    return 'https://app.pulsezen.com';
  }
  if (isStaging) {
    return 'https://staging.pulsezen.com';
  }
  return 'http://localhost:8081'; // development
};

export const Config = {
  // Environment flags
  isDev,
  isStaging,
  isProd,
  
  // API Configuration
  API_URL: getApiUrl(),
  API_TIMEOUT: isProd ? 30000 : 10000,
  
  // Web Configuration
  WEB_URL: getWebUrl(),
  
  // App Configuration
  APP_NAME: 'PulseZen',
  APP_VERSION: require('../package.json').version,
  
  // Feature Flags
  FEATURES: {
    BIOMETRIC_AUTH: true,
    ANALYTICS: isProd || isStaging,
    PERFORMANCE_MONITORING: isProd || isStaging,
    DEBUG_LOGGING: isDev,
    SENTRY_ENABLED: isProd || isStaging,
    AUTO_SYNC: true,
    OFFLINE_MODE: true,
  },
  
  // Performance Settings
  PERFORMANCE: {
    MAX_CACHE_SIZE: isProd ? 50 * 1024 * 1024 : 10 * 1024 * 1024, // 50MB prod, 10MB dev
    IMAGE_CACHE_DURATION: isProd ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000, // 7 days prod, 1 hour dev
    API_RETRY_COUNT: isProd ? 3 : 1,
    SYNC_INTERVAL: isProd ? 5 * 60 * 1000 : 30 * 1000, // 5 min prod, 30s dev
  },
  
  // Analytics Configuration
  ANALYTICS: {
    AMPLITUDE_API_KEY: isProd 
      ? process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY_PROD 
      : process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY_DEV,
    MIXPANEL_TOKEN: isProd 
      ? process.env.EXPO_PUBLIC_MIXPANEL_TOKEN_PROD 
      : process.env.EXPO_PUBLIC_MIXPANEL_TOKEN_DEV,
  },
  
  // Sentry Configuration
  SENTRY: {
    DSN: isProd 
      ? process.env.EXPO_PUBLIC_SENTRY_DSN_PROD 
      : process.env.EXPO_PUBLIC_SENTRY_DSN_DEV,
    SAMPLE_RATE: isProd ? 1.0 : 0.1,
    TRACES_SAMPLE_RATE: isProd ? 0.1 : 1.0,
  },
  
  // Storage Keys
  STORAGE_KEYS: {
    USER_DATA: '@PulseZen:userData',
    MOOD_ENTRIES: '@PulseZen:moodEntries',
    SETTINGS: '@PulseZen:settings',
    CACHE: '@PulseZen:cache',
    SYNC_QUEUE: '@PulseZen:syncQueue',
    BIOMETRIC_SETTINGS: '@PulseZen:biometricSettings',
  },
  
  // Network Configuration
  NETWORK: {
    TIMEOUT: isProd ? 30000 : 10000,
    RETRY_DELAY: 1000,
    MAX_CONCURRENT_REQUESTS: 5,
  },
  
  // Security Configuration
  SECURITY: {
    ENCRYPTION_ENABLED: isProd,
    SESSION_TIMEOUT: isProd ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000, // 24h prod, 7 days dev
    BIOMETRIC_TIMEOUT: 5 * 60 * 1000, // 5 minutes
  },
  
  // UI Configuration
  UI: {
    ANIMATION_DURATION: isDev ? 100 : 300, // Faster animations in dev
    DEBOUNCE_DELAY: 300,
    THEME_TRANSITION_DURATION: 200,
  },
  
  // Build Information
  BUILD: {
    TIMESTAMP: Date.now(),
    COMMIT_HASH: process.env.EXPO_PUBLIC_COMMIT_HASH || 'unknown',
    BUILD_NUMBER: process.env.EXPO_PUBLIC_BUILD_NUMBER || '1',
  },
};

// Validation
if (isProd && !Config.ANALYTICS.AMPLITUDE_API_KEY) {
  console.warn('⚠️  Production build missing Amplitude API key');
}

if (isProd && !Config.SENTRY.DSN) {
  console.warn('⚠️  Production build missing Sentry DSN');
}

// Debug logging
if (isDev) {
  console.log('🔧 App Configuration:', {
    environment: process.env.NODE_ENV,
    apiUrl: Config.API_URL,
    features: Config.FEATURES,
    build: Config.BUILD,
  });
}
