import {
    Easing,
    EasingFunction,
    interpolateColor,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useReducedMotion } from '../hooks/useAccessibility';

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: EasingFunction;
  springConfig?: {
    damping?: number;
    stiffness?: number;
    mass?: number;
  };
}

/**
 * Default animation configurations
 */
export const ANIMATION_CONFIGS = {
  fast: { duration: 200 },
  normal: { duration: 300 },
  slow: { duration: 500 },
  spring: {
    springConfig: {
      damping: 15,
      stiffness: 200,
      mass: 1,
    },
  },
  bounce: {
    springConfig: {
      damping: 8,
      stiffness: 100,
      mass: 0.8,
    },
  },
  gentle: {
    duration: 400,
    easing: Easing.out(Easing.quad),
  },
  sharp: {
    duration: 200,
    easing: Easing.inOut(Easing.quad),
  },
};

/**
 * Hook for fade in/out animations
 */
export const useFadeAnimation = (
  initialValue = 0,
  config: AnimationConfig = ANIMATION_CONFIGS.normal
) => {
  const opacity = useSharedValue(initialValue);
  const reducedMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const fadeIn = (callback?: () => void) => {
    if (reducedMotion) {
      opacity.value = 1;
      callback?.();
      return;
    }

    opacity.value = withTiming(
      1,
      {
        duration: config.duration || 300,
        easing: config.easing || Easing.out(Easing.quad),
      },
      callback ? () => runOnJS(callback)() : undefined
    );
  };

  const fadeOut = (callback?: () => void) => {
    if (reducedMotion) {
      opacity.value = 0;
      callback?.();
      return;
    }

    opacity.value = withTiming(
      0,
      {
        duration: config.duration || 300,
        easing: config.easing || Easing.out(Easing.quad),
      },
      callback ? () => runOnJS(callback)() : undefined
    );
  };

  const fadeToggle = (callback?: () => void) => {
    if (opacity.value === 0) {
      fadeIn(callback);
    } else {
      fadeOut(callback);
    }
  };

  return { animatedStyle, fadeIn, fadeOut, fadeToggle, opacity };
};

/**
 * Hook for scale animations
 */
export const useScaleAnimation = (
  initialValue = 1,
  config: AnimationConfig = ANIMATION_CONFIGS.spring
) => {
  const scale = useSharedValue(initialValue);
  const reducedMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const scaleIn = (callback?: () => void) => {
    if (reducedMotion) {
      scale.value = 1;
      callback?.();
      return;
    }

    scale.value = withSpring(
      1,
      config.springConfig || ANIMATION_CONFIGS.spring.springConfig,
      callback ? () => runOnJS(callback)() : undefined
    );
  };

  const scaleOut = (callback?: () => void) => {
    if (reducedMotion) {
      scale.value = 0;
      callback?.();
      return;
    }

    scale.value = withSpring(
      0,
      config.springConfig || ANIMATION_CONFIGS.spring.springConfig,
      callback ? () => runOnJS(callback)() : undefined
    );
  };

  const scalePress = () => {
    if (reducedMotion) return;

    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  };

  const scalePulse = () => {
    if (reducedMotion) return;

    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 600 }),
        withTiming(1, { duration: 600 })
      ),
      -1,
      true
    );
  };

  return { animatedStyle, scaleIn, scaleOut, scalePress, scalePulse, scale };
};

/**
 * Hook for slide animations
 */
export const useSlideAnimation = (
  direction: 'left' | 'right' | 'up' | 'down' = 'right',
  distance = 100,
  config: AnimationConfig = ANIMATION_CONFIGS.normal
) => {
  const translateX = useSharedValue(direction === 'left' ? -distance : direction === 'right' ? distance : 0);
  const translateY = useSharedValue(direction === 'up' ? -distance : direction === 'down' ? distance : 0);
  const reducedMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const slideIn = (callback?: () => void) => {
    if (reducedMotion) {
      translateX.value = 0;
      translateY.value = 0;
      callback?.();
      return;
    }

    translateX.value = withTiming(
      0,
      {
        duration: config.duration || 300,
        easing: config.easing || Easing.out(Easing.quad),
      }
    );

    translateY.value = withTiming(
      0,
      {
        duration: config.duration || 300,
        easing: config.easing || Easing.out(Easing.quad),
      },
      callback ? () => runOnJS(callback)() : undefined
    );
  };

  const slideOut = (callback?: () => void) => {
    if (reducedMotion) {
      translateX.value = direction === 'left' ? -distance : direction === 'right' ? distance : 0;
      translateY.value = direction === 'up' ? -distance : direction === 'down' ? distance : 0;
      callback?.();
      return;
    }

    const targetX = direction === 'left' ? -distance : direction === 'right' ? distance : 0;
    const targetY = direction === 'up' ? -distance : direction === 'down' ? distance : 0;

    translateX.value = withTiming(targetX, {
      duration: config.duration || 300,
      easing: config.easing || Easing.out(Easing.quad),
    });

    translateY.value = withTiming(
      targetY,
      {
        duration: config.duration || 300,
        easing: config.easing || Easing.out(Easing.quad),
      },
      callback ? () => runOnJS(callback)() : undefined
    );
  };

  return { animatedStyle, slideIn, slideOut, translateX, translateY };
};

/**
 * Hook for rotation animations
 */
export const useRotationAnimation = (
  initialValue = 0,
  config: AnimationConfig = ANIMATION_CONFIGS.normal
) => {
  const rotation = useSharedValue(initialValue);
  const reducedMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const rotateTo = (degrees: number, callback?: () => void) => {
    if (reducedMotion) {
      rotation.value = degrees;
      callback?.();
      return;
    }

    rotation.value = withTiming(
      degrees,
      {
        duration: config.duration || 300,
        easing: config.easing || Easing.out(Easing.quad),
      },
      callback ? () => runOnJS(callback)() : undefined
    );
  };

  const rotateBy = (degrees: number, callback?: () => void) => {
    if (reducedMotion) {
      rotation.value += degrees;
      callback?.();
      return;
    }

    rotation.value = withTiming(
      rotation.value + degrees,
      {
        duration: config.duration || 300,
        easing: config.easing || Easing.out(Easing.quad),
      },
      callback ? () => runOnJS(callback)() : undefined
    );
  };

  const spin = (clockwise = true) => {
    if (reducedMotion) return;

    rotation.value = withRepeat(
      withTiming(clockwise ? 360 : -360, { duration: 2000 }),
      -1
    );
  };

  return { animatedStyle, rotateTo, rotateBy, spin, rotation };
};

/**
 * Hook for color animations
 */
export const useColorAnimation = (
  fromColor: string,
  toColor: string,
  config: AnimationConfig = ANIMATION_CONFIGS.normal
) => {
  const progress = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [fromColor, toColor]
    ),
  }));

  const animateToColor = (callback?: () => void) => {
    if (reducedMotion) {
      progress.value = 1;
      callback?.();
      return;
    }

    progress.value = withTiming(
      1,
      {
        duration: config.duration || 300,
        easing: config.easing || Easing.out(Easing.quad),
      },
      callback ? () => runOnJS(callback)() : undefined
    );
  };

  const animateFromColor = (callback?: () => void) => {
    if (reducedMotion) {
      progress.value = 0;
      callback?.();
      return;
    }

    progress.value = withTiming(
      0,
      {
        duration: config.duration || 300,
        easing: config.easing || Easing.out(Easing.quad),
      },
      callback ? () => runOnJS(callback)() : undefined
    );
  };

  return { animatedStyle, animateToColor, animateFromColor, progress };
};

/**
 * Hook for complex sequence animations
 */
export const useSequenceAnimation = () => {
  const reducedMotion = useReducedMotion();

  const createSequence = (animations: Array<() => void>, delays: number[] = []) => {
    if (reducedMotion) {
      animations.forEach(animation => animation());
      return;
    }

    animations.forEach((animation, index) => {
      const delay = delays[index] || index * 100;
      setTimeout(animation, delay);
    });
  };

  return { createSequence };
};

/**
 * Hook for gesture-based animations
 */
export const useGestureAnimation = () => {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const resetGesture = (callback?: () => void) => {
    if (reducedMotion) {
      scale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      callback?.();
      return;
    }

    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(
      0,
      {},
      callback ? () => runOnJS(callback)() : undefined
    );
  };

  return {
    animatedStyle,
    resetGesture,
    scale,
    translateX,
    translateY,
  };
};

/**
 * Utility function to create staggered animations
 */
export const createStaggeredAnimation = (
  items: any[],
  animationFn: (index: number) => void,
  staggerDelay = 100
) => {
  items.forEach((_, index) => {
    setTimeout(() => animationFn(index), index * staggerDelay);
  });
};
