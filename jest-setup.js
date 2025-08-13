import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage (must be before any imports that use it)
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock fetch for React Native
global.fetch = jest.fn();

// Mock expo modules
jest.mock('expo-font');
jest.mock('expo-asset');
jest.mock('expo-secure-store');
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

// Mock navigation
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  usePathname: () => '/',
}));

// Mock appConfig
jest.mock('./config/appConfig', () => ({
  appConfig: {
    getConfig: () => ({
      environment: {
        isDebug: true,
        isDevelopment: true,
      },
      security: {
        encryptionEnabled: false,
      },
    }),
    getApiUrl: (path = '') => `http://localhost:3333/api/v1${path}`,
  },
}));

// Global test timeout
jest.setTimeout(10000);

// Console error suppression for expected warnings
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string') {
      const msg = args[0];
      if (
        msg.includes('Warning: ReactDOM.render is no longer supported') ||
        msg.includes('not wrapped in act') ||
        msg.includes('useInsertionEffect must not schedule updates')
      ) {
        return; // suppress noisy expected warnings
      }
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock leve: apenas força animações timing a completarem imediatamente mantendo API original
jest.mock('react-native/Libraries/Animated/Animated', () => {
  const Real = jest.requireActual('react-native/Libraries/Animated/Animated');
  return {
    ...Real,
    timing: (value, config) => ({
      start: (cb) => {
        if (config && Object.prototype.hasOwnProperty.call(config, 'toValue')) {
          value.setValue(config.toValue);
        }
        cb && cb({ finished: true });
      },
      stop: () => {},
    }),
  };
});
