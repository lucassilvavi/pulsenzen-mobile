// Configuration file for API endpoints and settings
// Update the IP address below to match your local machine's IP address
// To find your IP: ifconfig | grep -E "inet " | grep -v "127.0.0.1"

export const API_CONFIG = {
  // Use environment variables for configuration
  BASE_URL: `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/${process.env.EXPO_PUBLIC_API_VERSION}`,
  
  // Fallback to development configuration
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
  
  // Request timeout in milliseconds
  TIMEOUT: 10000,
  
  // Common headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

export default API_CONFIG;
