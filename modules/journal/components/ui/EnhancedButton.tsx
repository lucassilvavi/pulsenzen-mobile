import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    interpolateColor,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useAccessibilityProps, useScreenReaderAnnouncement } from '../../hooks/useAccessibility';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface EnhancedButtonProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

/**
 * Enhanced button component with animations, haptic feedback, and accessibility
 */
export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  title,
  icon,
  variant = 'primary',
  size = 'medium',
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(disabled ? 0.5 : 1);
  const loadingRotation = useSharedValue(0);
  const announceToScreenReader = useScreenReaderAnnouncement();

  const accessibilityProps = useAccessibilityProps({
    label: accessibilityLabel || title,
    hint: accessibilityHint || `Tap to ${title.toLowerCase()}`,
    role: 'button',
    state: disabled ? 'disabled' : undefined,
  });

  // Animation for loading state
  React.useEffect(() => {
    if (loading) {
      loadingRotation.value = withTiming(360, { duration: 1000 }, (finished) => {
        if (finished && loading) {
          loadingRotation.value = 0;
          loadingRotation.value = withTiming(360, { duration: 1000 });
        }
      });
    }
  }, [loading]);

  // Press animations
  const pressGesture = Gesture.Tap()
    .onBegin(() => {
      if (!disabled && !loading) {
        scale.value = withSpring(0.95, {
          stiffness: 300,
          damping: 10,
        });
      }
    })
    .onFinalize(() => {
      scale.value = withSpring(1, {
        stiffness: 300,
        damping: 10,
      });
    })
    .onEnd(() => {
      if (!disabled && !loading) {
        runOnJS(handlePress)();
      }
    });

  const handlePress = () => {
    announceToScreenReader(`${title} pressed`);
    onPress();
  };

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const loadingAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${loadingRotation.value}deg` }],
    };
  });

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    const colors = getVariantColors(variant);
    return {
      backgroundColor: interpolateColor(
        disabled ? 0.5 : 1,
        [0.5, 1],
        [colors.disabledBackground, colors.background]
      ),
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    const colors = getVariantColors(variant);
    return {
      color: interpolateColor(
        disabled ? 0.5 : 1,
        [0.5, 1],
        [colors.disabledText, colors.text]
      ),
    };
  });

  const containerStyle = [
    styles.container,
    styles[size],
    fullWidth && styles.fullWidth,
    backgroundAnimatedStyle,
  ];

  return (
    <GestureDetector gesture={pressGesture}>
      <AnimatedPressable
        style={[containerStyle, animatedStyle]}
        disabled={disabled || loading}
        testID={testID}
        {...accessibilityProps}
      >
        <View style={styles.content}>
          {loading ? (
            <Animated.View style={loadingAnimatedStyle}>
              <Ionicons
                name="refresh"
                size={getSizeConfig(size).iconSize}
                color={getVariantColors(variant).text}
              />
            </Animated.View>
          ) : icon ? (
            <Ionicons
              name={icon}
              size={getSizeConfig(size).iconSize}
              color={getVariantColors(variant).text}
              style={styles.icon}
            />
          ) : null}
          <Animated.Text style={[styles.text, styles[`${size}Text`], textAnimatedStyle]}>
            {title}
          </Animated.Text>
        </View>
      </AnimatedPressable>
    </GestureDetector>
  );
};

// Helper functions
function getVariantColors(variant: EnhancedButtonProps['variant']) {
  switch (variant) {
    case 'primary':
      return {
        background: '#007AFF',
        text: '#FFFFFF',
        disabledBackground: '#B0B0B0',
        disabledText: '#FFFFFF',
      };
    case 'secondary':
      return {
        background: '#F2F2F7',
        text: '#007AFF',
        disabledBackground: '#E5E5EA',
        disabledText: '#8E8E93',
      };
    case 'ghost':
      return {
        background: 'transparent',
        text: '#007AFF',
        disabledBackground: 'transparent',
        disabledText: '#8E8E93',
      };
    case 'danger':
      return {
        background: '#FF3B30',
        text: '#FFFFFF',
        disabledBackground: '#B0B0B0',
        disabledText: '#FFFFFF',
      };
    default:
      return {
        background: '#007AFF',
        text: '#FFFFFF',
        disabledBackground: '#B0B0B0',
        disabledText: '#FFFFFF',
      };
  }
}

function getSizeConfig(size: EnhancedButtonProps['size']) {
  switch (size) {
    case 'small':
      return { iconSize: 16, height: 32, paddingHorizontal: 12 };
    case 'medium':
      return { iconSize: 20, height: 44, paddingHorizontal: 16 };
    case 'large':
      return { iconSize: 24, height: 56, paddingHorizontal: 24 };
    default:
      return { iconSize: 20, height: 44, paddingHorizontal: 16 };
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  small: {
    height: 32,
    paddingHorizontal: 12,
  },
  medium: {
    height: 44,
    paddingHorizontal: 16,
  },
  large: {
    height: 56,
    paddingHorizontal: 24,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});
