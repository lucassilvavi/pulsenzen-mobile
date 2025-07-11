// Configuration file for API endpoints and settings
// Update the IP address below to match your local machine's IP address
// To find your IP: ifconfig | grep -E "inet " | grep -v "127.0.0.1"

export const API_CONFIG = {
  // Development configuration (local network)
  BASE_URL: 'http://192.168.3.75:3333/api/v1',
  
  // Production configuration (to be updated when deployed)
  // BASE_URL: 'https://your-production-domain.com/api/v1',
  
  // API endpoints
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      PROFILE: '/auth/profile',
      VALIDATE_PASSWORD: '/auth/validate-password'
    },
    JOURNAL: {
      BASE: '/journal',
      ENTRIES: '/journal/entries'
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
