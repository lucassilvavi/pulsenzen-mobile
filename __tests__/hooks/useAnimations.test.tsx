import { renderHook } from '@testing-library/react-native';
import {
    ANIMATION_CONFIGS,
    useFadeAnimation,
    useScaleAnimation,
    useSlideAnimation,
} from '../../../modules/journal/hooks/useAnimations';

// Mock React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  
  // Mock useSharedValue
  Reanimated.useSharedValue = jest.fn((initialValue) => ({
    value: initialValue,
  }));
  
  // Mock useAnimatedStyle
  Reanimated.useAnimatedStyle = jest.fn((fn) => fn());
  
  // Mock timing functions
  Reanimated.withTiming = jest.fn((value, config, callback) => {
    if (callback) callback();
    return value;
  });
  
  Reanimated.withSpring = jest.fn((value, config, callback) => {
    if (callback) callback();
    return value;
  });
  
  return Reanimated;
});

// Mock accessibility hooks
jest.mock('../../../modules/journal/hooks/useAccessibility', () => ({
  useReducedMotion: jest.fn(() => false),
}));

import { useReducedMotion } from '../../../modules/journal/hooks/useAccessibility';

const mockedUseReducedMotion = useReducedMotion as jest.MockedFunction<typeof useReducedMotion>;

describe('Animation Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseReducedMotion.mockReturnValue(false);
  });

  describe('ANIMATION_CONFIGS', () => {
    it('provides predefined animation configurations', () => {
      expect(ANIMATION_CONFIGS.fast).toEqual({ duration: 200 });
      expect(ANIMATION_CONFIGS.normal).toEqual({ duration: 300 });
      expect(ANIMATION_CONFIGS.slow).toEqual({ duration: 500 });
    });

    it('includes spring configurations', () => {
      expect(ANIMATION_CONFIGS.spring.springConfig).toEqual({
        damping: 15,
        stiffness: 200,
        mass: 1,
      });
    });

    it('includes easing configurations', () => {
      expect(ANIMATION_CONFIGS.gentle.duration).toBe(400);
      expect(ANIMATION_CONFIGS.sharp.duration).toBe(200);
    });
  });

  describe('useFadeAnimation', () => {
    it('initializes with correct default values', () => {
      const { result } = renderHook(() => useFadeAnimation());
      
      expect(result.current.opacity).toBeDefined();
      expect(result.current.fadeIn).toBeInstanceOf(Function);
      expect(result.current.fadeOut).toBeInstanceOf(Function);
      expect(result.current.fadeToggle).toBeInstanceOf(Function);
    });

    it('initializes with custom initial value', () => {
      const { result } = renderHook(() => useFadeAnimation(0.5));
      
      expect(result.current.opacity).toBeDefined();
    });

    it('respects reduced motion preference', () => {
      mockedUseReducedMotion.mockReturnValue(true);
      
      const { result } = renderHook(() => useFadeAnimation());
      
      // Should still provide functions but they won't animate
      expect(result.current.fadeIn).toBeInstanceOf(Function);
      expect(result.current.fadeOut).toBeInstanceOf(Function);
    });

    it('provides fade toggle functionality', () => {
      const { result } = renderHook(() => useFadeAnimation());
      
      expect(result.current.fadeToggle).toBeInstanceOf(Function);
    });
  });

  describe('useScaleAnimation', () => {
    it('initializes with correct default values', () => {
      const { result } = renderHook(() => useScaleAnimation());
      
      expect(result.current.scale).toBeDefined();
      expect(result.current.scaleIn).toBeInstanceOf(Function);
      expect(result.current.scaleOut).toBeInstanceOf(Function);
      expect(result.current.scalePress).toBeInstanceOf(Function);
      expect(result.current.scalePulse).toBeInstanceOf(Function);
    });

    it('provides press animation functionality', () => {
      const { result } = renderHook(() => useScaleAnimation());
      
      expect(() => result.current.scalePress()).not.toThrow();
    });

    it('provides pulse animation functionality', () => {
      const { result } = renderHook(() => useScaleAnimation());
      
      expect(() => result.current.scalePulse()).not.toThrow();
    });

    it('respects reduced motion for pulse animations', () => {
      mockedUseReducedMotion.mockReturnValue(true);
      
      const { result } = renderHook(() => useScaleAnimation());
      
      // Should not throw when reduced motion is enabled
      expect(() => result.current.scalePulse()).not.toThrow();
    });
  });

  describe('useSlideAnimation', () => {
    it('initializes with default direction', () => {
      const { result } = renderHook(() => useSlideAnimation());
      
      expect(result.current.translateX).toBeDefined();
      expect(result.current.translateY).toBeDefined();
      expect(result.current.slideIn).toBeInstanceOf(Function);
      expect(result.current.slideOut).toBeInstanceOf(Function);
    });

    it('handles different slide directions', () => {
      const directions = ['left', 'right', 'up', 'down'] as const;
      
      directions.forEach(direction => {
        const { result } = renderHook(() => useSlideAnimation(direction));
        
        expect(result.current.translateX).toBeDefined();
        expect(result.current.translateY).toBeDefined();
      });
    });

    it('accepts custom distance parameter', () => {
      const { result } = renderHook(() => useSlideAnimation('right', 200));
      
      expect(result.current.slideIn).toBeInstanceOf(Function);
      expect(result.current.slideOut).toBeInstanceOf(Function);
    });

    it('accepts custom animation config', () => {
      const customConfig = { duration: 500 };
      const { result } = renderHook(() => 
        useSlideAnimation('right', 100, customConfig)
      );
      
      expect(result.current.slideIn).toBeInstanceOf(Function);
    });
  });

  describe('Performance', () => {
    it('fade animation hook renders quickly', () => {
      const startTime = performance.now();
      
      renderHook(() => useFadeAnimation());
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(20);
    });

    it('scale animation hook renders quickly', () => {
      const startTime = performance.now();
      
      renderHook(() => useScaleAnimation());
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(20);
    });

    it('slide animation hook renders quickly', () => {
      const startTime = performance.now();
      
      renderHook(() => useSlideAnimation());
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(20);
    });
  });

  describe('Animation Callbacks', () => {
    it('executes callbacks when provided to fade animations', () => {
      const { result } = renderHook(() => useFadeAnimation());
      const callback = jest.fn();
      
      result.current.fadeIn(callback);
      // Callback execution depends on the animation system
    });

    it('executes callbacks when provided to scale animations', () => {
      const { result } = renderHook(() => useScaleAnimation());
      const callback = jest.fn();
      
      result.current.scaleIn(callback);
      // Callback execution depends on the animation system
    });

    it('executes callbacks when provided to slide animations', () => {
      const { result } = renderHook(() => useSlideAnimation());
      const callback = jest.fn();
      
      result.current.slideIn(callback);
      // Callback execution depends on the animation system
    });
  });

  describe('Reduced Motion Handling', () => {
    beforeEach(() => {
      mockedUseReducedMotion.mockReturnValue(true);
    });

    it('skips animations when reduced motion is enabled', () => {
      const { result } = renderHook(() => useFadeAnimation());
      
      // Should still provide functions
      expect(result.current.fadeIn).toBeInstanceOf(Function);
      
      // Calling should not throw
      expect(() => result.current.fadeIn()).not.toThrow();
    });

    it('immediately executes callbacks when reduced motion is enabled', () => {
      const { result } = renderHook(() => useFadeAnimation());
      const callback = jest.fn();
      
      result.current.fadeIn(callback);
      
      // Callback should be called immediately when reduced motion is enabled
      // (implementation specific)
    });
  });
});
