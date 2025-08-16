import { BlurView } from 'expo-blur';
import React, { useEffect } from 'react';
import { Dimensions, DimensionValue, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import {
    useLiveRegion,
    useReducedMotion,
    useScreenReaderAnnouncement,
} from '../../hooks/useAccessibility';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LoadingIndicatorProps {
  visible: boolean;
  type?: 'spinner' | 'dots' | 'pulse' | 'wave' | 'skeleton';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
  overlay?: boolean;
  blur?: boolean;
}

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  marginBottom?: number;
}

/**
 * Enhanced loading indicator with multiple animation types and accessibility
 */
export const EnhancedLoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  visible,
  type = 'spinner',
  size = 'medium',
  color = '#007AFF',
  message,
  overlay = false,
  blur = false,
}) => {
  const isReducedMotion = useReducedMotion();
  const announceToScreenReader = useScreenReaderAnnouncement();

  // Live region for loading announcements
  useLiveRegion(visible && message ? message : '', 'polite');

  useEffect(() => {
    if (visible) {
      announceToScreenReader(message || 'Loading');
    }
  }, [visible, message]);

  if (!visible) return null;

  const content = (
    <View style={[styles.container, overlay && styles.overlay]}>
      {renderLoadingAnimation(type, size, color, isReducedMotion)}
      {message && (
        <Text style={[styles.message, getSizeStyle(size).messageText]}>
          {message}
        </Text>
      )}
    </View>
  );

  if (overlay) {
    return (
      <View style={styles.overlayContainer}>
        {blur ? (
          <BlurView intensity={10} style={StyleSheet.absoluteFill}>
            {content}
          </BlurView>
        ) : (
          <View style={styles.backdrop}>
            {content}
          </View>
        )}
      </View>
    );
  }

  return content;
};

/**
 * Skeleton loading component for content placeholders
 */
export const SkeletonLoader: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  marginBottom = 8,
}) => {
  const shimmerAnimation = useSharedValue(0);
  const isReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isReducedMotion) {
      shimmerAnimation.value = withRepeat(
        withTiming(1, {
          duration: 1500,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    }
  }, [isReducedMotion]);

  const animatedStyle = useAnimatedStyle(() => {
    if (isReducedMotion) {
      return {
        backgroundColor: '#E5E5EA',
      };
    }

    const translateX = interpolate(
      shimmerAnimation.value,
      [0, 1],
      [-SCREEN_WIDTH, SCREEN_WIDTH]
    );

    return {
      backgroundColor: '#E5E5EA',
      transform: [{ translateX }],
    };
  });

  const shimmerStyle = useAnimatedStyle(() => {
    if (isReducedMotion) return { opacity: 0 };

    return {
      backgroundColor: interpolateColor(
        shimmerAnimation.value,
        [0, 0.5, 1],
        ['transparent', 'rgba(255, 255, 255, 0.8)', 'transparent']
      ),
    };
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          marginBottom,
        },
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]} />
      {!isReducedMotion && (
        <Animated.View
          style={[
            styles.shimmer,
            shimmerStyle,
            { borderRadius },
          ]}
        />
      )}
    </View>
  );
};

// Helper function to render different loading animations
function renderLoadingAnimation(
  type: LoadingIndicatorProps['type'],
  size: LoadingIndicatorProps['size'],
  color: string,
  isReducedMotion: boolean
) {
  const sizeConfig = getSizeStyle(size);

  switch (type) {
    case 'spinner':
      return <SpinnerLoader size={sizeConfig.size} color={color} reduced={isReducedMotion} />;
    case 'dots':
      return <DotsLoader size={sizeConfig.dotSize} color={color} reduced={isReducedMotion} />;
    case 'pulse':
      return <PulseLoader size={sizeConfig.size} color={color} reduced={isReducedMotion} />;
    case 'wave':
      return <WaveLoader size={sizeConfig.waveHeight} color={color} reduced={isReducedMotion} />;
    case 'skeleton':
      return <SkeletonContentLoader />;
    default:
      return <SpinnerLoader size={sizeConfig.size} color={color} reduced={isReducedMotion} />;
  }
}

// Individual loader components
const SpinnerLoader: React.FC<{ size: number; color: string; reduced: boolean }> = ({
  size,
  color,
  reduced,
}) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (!reduced) {
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 1000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    }
  }, [reduced]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        styles.spinner,
        {
          width: size,
          height: size,
          borderColor: `${color}20`,
          borderTopColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

const DotsLoader: React.FC<{ size: number; color: string; reduced: boolean }> = ({
  size,
  color,
  reduced,
}) => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    if (!reduced) {
      const animation = () => {
        dot1.value = withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0, { duration: 400 })
        );
        
        setTimeout(() => {
          dot2.value = withSequence(
            withTiming(1, { duration: 400 }),
            withTiming(0, { duration: 400 })
          );
        }, 150);
        
        setTimeout(() => {
          dot3.value = withSequence(
            withTiming(1, { duration: 400 }),
            withTiming(0, { duration: 400 })
          );
        }, 300);
      };

      animation();
      const interval = setInterval(animation, 1200);
      return () => clearInterval(interval);
    }
  }, [reduced]);

  const createDotStyle = (value: Animated.SharedValue<number>) =>
    useAnimatedStyle(() => ({
      transform: [{ scale: reduced ? 1 : interpolate(value.value, [0, 1], [0.8, 1.2]) }],
      opacity: reduced ? 0.7 : interpolate(value.value, [0, 1], [0.3, 1]),
    }));

  return (
    <View style={styles.dotsContainer}>
      <Animated.View
        style={[
          styles.dot,
          { width: size, height: size, backgroundColor: color },
          createDotStyle(dot1),
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { width: size, height: size, backgroundColor: color },
          createDotStyle(dot2),
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { width: size, height: size, backgroundColor: color },
          createDotStyle(dot3),
        ]}
      />
    </View>
  );
};

const PulseLoader: React.FC<{ size: number; color: string; reduced: boolean }> = ({
  size,
  color,
  reduced,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!reduced) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        false
      );
      
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        false
      );
    }
  }, [reduced]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.pulse,
        {
          width: size,
          height: size,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

const WaveLoader: React.FC<{ size: number; color: string; reduced: boolean }> = ({
  size,
  color,
  reduced,
}) => {
  const waves = [useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0)];

  useEffect(() => {
    if (!reduced) {
      waves.forEach((wave, index) => {
        wave.value = withRepeat(
          withSequence(
            withTiming(size * 0.8, { duration: 400 }),
            withTiming(size * 0.2, { duration: 400 })
          ),
          -1,
          false
        );
      });
    }
  }, [reduced]);

  return (
    <View style={styles.waveContainer}>
      {waves.map((wave, index) => (
        <Animated.View
          key={index}
          style={[
            styles.wave,
            {
              height: reduced ? size * 0.5 : wave.value,
              backgroundColor: color,
              marginHorizontal: 2,
            },
            useAnimatedStyle(() => ({
              height: wave.value,
            })),
          ]}
        />
      ))}
    </View>
  );
};

const SkeletonContentLoader: React.FC = () => (
  <View style={styles.skeletonContent}>
    <SkeletonLoader width="80%" height={16} marginBottom={12} />
    <SkeletonLoader width="60%" height={16} marginBottom={12} />
    <SkeletonLoader width="90%" height={16} marginBottom={12} />
    <SkeletonLoader width="70%" height={16} />
  </View>
);

function getSizeStyle(size: LoadingIndicatorProps['size']) {
  switch (size) {
    case 'small':
      return {
        size: 20,
        dotSize: 6,
        waveHeight: 16,
        messageText: { fontSize: 14 },
      };
    case 'medium':
      return {
        size: 32,
        dotSize: 8,
        waveHeight: 24,
        messageText: { fontSize: 16 },
      };
    case 'large':
      return {
        size: 48,
        dotSize: 12,
        waveHeight: 32,
        messageText: { fontSize: 18 },
      };
    default:
      return {
        size: 32,
        dotSize: 8,
        waveHeight: 24,
        messageText: { fontSize: 16 },
      };
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  overlay: {
    flex: 1,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: 16,
    textAlign: 'center',
    color: '#8E8E93',
    fontWeight: '500',
  },
  spinner: {
    borderWidth: 3,
    borderRadius: 50,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    borderRadius: 50,
    marginHorizontal: 4,
  },
  pulse: {
    borderRadius: 50,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 32,
  },
  wave: {
    width: 4,
    borderRadius: 2,
  },
  skeleton: {
    backgroundColor: '#E5E5EA',
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: 100,
  },
  skeletonContent: {
    width: 200,
  },
});
