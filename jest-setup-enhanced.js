import 'react-native-gesture-handler/jestSetup';

// Mock React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  
  // Extend the mock with additional functions we use
  Reanimated.default.call = () => {};
  Reanimated.useSharedValue = jest.fn((initialValue) => ({
    value: initialValue,
  }));
  Reanimated.useAnimatedStyle = jest.fn((fn) => fn());
  Reanimated.withTiming = jest.fn((value, config, callback) => {
    if (callback) callback();
    return value;
  });
  Reanimated.withSpring = jest.fn((value, config, callback) => {
    if (callback) callback();
    return value;
  });
  Reanimated.withSequence = jest.fn((...values) => values[values.length - 1]);
  Reanimated.withRepeat = jest.fn((value) => value);
  Reanimated.withDelay = jest.fn((delay, value) => value);
  Reanimated.interpolate = jest.fn((value, inputRange, outputRange) => outputRange[0]);
  Reanimated.interpolateColor = jest.fn((value, inputRange, outputRange) => outputRange[0]);
  Reanimated.runOnJS = jest.fn((fn) => fn);
  Reanimated.Easing = {
    ease: jest.fn(),
    quad: jest.fn(),
    out: jest.fn((fn) => fn),
    inOut: jest.fn((fn) => fn),
  };
  
  return Reanimated;
});

// Mock React Native Gesture Handler
jest.mock('react-native-gesture-handler', () => {
  const actual = jest.requireActual('react-native-gesture-handler');
  return {
    ...actual,
    PanGestureHandler: 'View',
    TapGestureHandler: 'View',
    PinchGestureHandler: 'View',
    RotationGestureHandler: 'View',
    FlingGestureHandler: 'View',
    LongPressGestureHandler: 'View',
    ForceTouchGestureHandler: 'View',
    Gesture: {
      Pan: () => ({
        onBegin: jest.fn().mockReturnThis(),
        onUpdate: jest.fn().mockReturnThis(),
        onEnd: jest.fn().mockReturnThis(),
        onFinalize: jest.fn().mockReturnThis(),
      }),
      Tap: () => ({
        onBegin: jest.fn().mockReturnThis(),
        onEnd: jest.fn().mockReturnThis(),
      }),
    },
    GestureDetector: 'View',
    GestureHandlerRootView: 'View',
    State: {
      UNDETERMINED: 0,
      FAILED: 1,
      BEGAN: 2,
      CANCELLED: 3,
      ACTIVE: 4,
      END: 5,
    },
  };
});

// Mock Expo modules
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'Light',
    Medium: 'Medium',
    Heavy: 'Heavy',
  },
  NotificationFeedbackType: {
    Success: 'Success',
    Warning: 'Warning',
    Error: 'Error',
  },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'View',
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Text',
  MaterialIcons: 'Text',
  FontAwesome: 'Text',
}));

// Mock React Native modules
jest.mock('react-native', () => {
  const actualRN = jest.requireActual('react-native');
  return {
    ...actualRN,
    AccessibilityInfo: {
      isScreenReaderEnabled: jest.fn().mockResolvedValue(false),
      isReduceMotionEnabled: jest.fn().mockResolvedValue(false),
      announceForAccessibility: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    Platform: {
      OS: 'ios',
      select: jest.fn((options) => options.ios || options.default),
    },
    Dimensions: {
      get: jest.fn().mockReturnValue({
        width: 375,
        height: 812,
        scale: 2,
        fontScale: 1,
      }),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    DeviceEventEmitter: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
    NativeModules: {
      ...actualRN.NativeModules,
      RNGestureHandlerModule: {
        State: {},
        Direction: {},
      },
    },
  };
});

// Mock Safe Area Context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: 'View',
  useSafeAreaInsets: jest.fn().mockReturnValue({
    top: 44,
    left: 0,
    right: 0,
    bottom: 34,
  }),
  useSafeAreaFrame: jest.fn().mockReturnValue({
    x: 0,
    y: 0,
    width: 375,
    height: 812,
  }),
}));

// Mock Async Storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

// Global test utilities
global.__TEST_UTILS__ = {
  mockComponent: (name) => {
    const Component = (props) => React.createElement(name, props);
    Component.displayName = name;
    return Component;
  },
  
  mockHook: (returnValue) => jest.fn().mockReturnValue(returnValue),
  
  createMockNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
    reset: jest.fn(),
    canGoBack: jest.fn().mockReturnValue(true),
    isFocused: jest.fn().mockReturnValue(true),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }),
};

// Setup performance mock if not available
if (!global.performance) {
  global.performance = {
    now: jest.fn(() => Date.now()),
  } as any;
}

// Increase timeout for tests that might involve animations
jest.setTimeout(10000);

// Suppress console warnings in tests unless explicitly testing them
const originalWarn = console.warn;
const originalError = console.error;

beforeEach(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  console.warn = originalWarn;
  console.error = originalError;
});
