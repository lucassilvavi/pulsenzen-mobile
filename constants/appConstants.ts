// Application constants
export const APP_CONSTANTS = {
  // Storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: '@pulsezen_auth_token',
    REFRESH_TOKEN: '@pulsezen_refresh_token',
    USER_DATA: '@pulsezen_user_data',
    ONBOARDING_DONE: 'onboardingDone',
    ONBOARDING_STEP: 'onboardingStep',
  },

  // API Configuration
  API: {
    TIMEOUT: 15000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY_BASE: 1000,
    RETRY_DELAY_MAX: 30000,
    CACHE_TTL_DEFAULT: 5 * 60 * 1000, // 5 minutes
    CACHE_TTL_AUTH: 15 * 60 * 1000, // 15 minutes
  },

  // Navigation
  NAVIGATION: {
    ROUTES: {
      HOME: '/',
      ONBOARDING_WELCOME: '/onboarding/welcome',
      ONBOARDING_AUTH: '/onboarding/auth',
      ONBOARDING_BENEFITS: '/onboarding/benefits',
      ONBOARDING_FEATURES: '/onboarding/features',
      ONBOARDING_SETUP: '/onboarding/setup',
    },
    TRANSITIONS: {
      SLIDE_DURATION: 300,
      FADE_DURATION: 200,
    },
  },

  // Validation
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    NAME_MIN_LENGTH: 2,
  },

  // Circuit Breaker
  CIRCUIT_BREAKER: {
    FAILURE_THRESHOLD: 5,
    TIMEOUT: 60000, // 1 minute
    HALF_OPEN_SUCCESS_THRESHOLD: 3,
  },

  // Polling intervals (try to avoid these)
  POLLING: {
    ONBOARDING_CHECK: 5000, // Increased from 1s to 5s
    NETWORK_STATUS: 10000,
  },

  // UI Constants
  UI: {
    LOADING_DELAY: 500, // Minimum loading time for UX
    TOAST_DURATION: 3000,
    ANIMATION_DURATION: 300,
  },

  // Environment
  ENV: {
    DEVELOPMENT: process.env.NODE_ENV === 'development',
    PRODUCTION: process.env.NODE_ENV === 'production',
    TEST: process.env.NODE_ENV === 'test',
  },
} as const;

// Type-safe route constants
export type AppRoute = typeof APP_CONSTANTS.NAVIGATION.ROUTES[keyof typeof APP_CONSTANTS.NAVIGATION.ROUTES];

// Error codes
export const ERROR_CODES = {
  // Network
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  
  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Application
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// Feature flags (for gradual rollout of changes)
export const FEATURE_FLAGS = {
  USE_NEW_AUTH_FLOW: true,
  ENABLE_OFFLINE_MODE: false,
  USE_PERFORMANCE_MONITORING: true,
  ENABLE_DEBUG_LOGGING: APP_CONSTANTS.ENV.DEVELOPMENT,
  USE_CIRCUIT_BREAKER: true,
} as const;
