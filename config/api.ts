// Configuration file for API endpoints and settings
// Secure configuration with environment variable validation

// Environment variable validation
const validateEnvironment = () => {
  const requiredVars = {
    EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
    EXPO_PUBLIC_API_VERSION: process.env.EXPO_PUBLIC_API_VERSION,
  };

  const missing = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
    console.warn('📝 Using fallback development configuration');
  }

  return {
    baseUrl: requiredVars.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.3.75:3333',
    version: requiredVars.EXPO_PUBLIC_API_VERSION || 'v1',
  };
};

const env = validateEnvironment();

export const API_CONFIG = {
  // Secure environment-based configuration with validation
  BASE_URL: `${env.baseUrl}/api/${env.version}`,
  
  // Development fallback (commented for security)
  // BASE_URL: 'http://192.168.3.75:3333/api/v1',
  
  // API endpoints
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      PROFILE: '/auth/profile',
      UPDATE_PROFILE: '/auth/profile',
      COMPLETE_ONBOARDING: '/auth/complete-onboarding',
      REFRESH_TOKEN: '/auth/refresh-token',
      VALIDATE_PASSWORD: '/auth/validate-password'
    },
    JOURNAL: {
      BASE: '/journal',
      ENTRIES: '/journal/entries',
      PROMPTS: '/journal/prompts',
      SEARCH: '/journal/search',
      STATS: '/journal/stats'
    },
    MUSIC: {
      BASE: '/music',
      CATEGORIES: '/music/categories',
      TRACKS: '/music/tracks',
      PLAYLISTS: '/music/playlists',
      FAVORITES: '/music/favorites'
    },
    HEALTH: '/health'
  },
  
  // Security and performance configuration
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Secure headers configuration
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'X-Requested-With': 'XMLHttpRequest',
  },

  // Environment info
  IS_DEVELOPMENT: __DEV__,
  API_TIMEOUT_MESSAGE: 'Request timeout. Please check your connection.',
  
  // Rate limiting
  MAX_REQUESTS_PER_MINUTE: 60,
};

export default API_CONFIG;
