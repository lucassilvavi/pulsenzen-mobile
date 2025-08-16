import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect, useRef } from 'react';
import {
    AccessibilityRole,
    Dimensions,
    Modal,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    useAccessibilityProps,
    useReducedMotion,
    useScreenReaderAnnouncement,
} from '../../hooks/useAccessibility';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EnhancedModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  position?: 'center' | 'bottom' | 'top';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnSwipe?: boolean;
  animated?: boolean;
  blurBackground?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

/**
 * Enhanced modal with animations, gestures, and accessibility
 */
export const EnhancedModal: React.FC<EnhancedModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  size = 'medium',
  position = 'center',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnSwipe = true,
  animated = true,
  blurBackground = true,
  accessibilityLabel,
  testID,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  
  const announceToScreenReader = useScreenReaderAnnouncement();
  const isReducedMotion = useReducedMotion();
  const modalRef = useRef<View>(null);

  const accessibilityProps = useAccessibilityProps({
    label: accessibilityLabel || title || 'Modal',
    role: 'dialog' as AccessibilityRole,
    state: { expanded: visible },
  });

  useEffect(() => {
    if (visible) {
      announceToScreenReader(`${title || 'Modal'} opened`);
      showModal();
    } else {
      hideModal();
    }
  }, [visible]);

  const showModal = () => {
    if (isReducedMotion) {
      translateY.value = 0;
      backdropOpacity.value = 1;
      scale.value = 1;
    } else {
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 200,
      });
      backdropOpacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, {
        damping: 20,
        stiffness: 200,
      });
    }
  };

  const hideModal = () => {
    const hideAnimation = () => {
      if (isReducedMotion) {
        translateY.value = SCREEN_HEIGHT;
        backdropOpacity.value = 0;
        scale.value = 0.9;
      } else {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
        backdropOpacity.value = withTiming(0, { duration: 250 });
        scale.value = withTiming(0.9, { duration: 250 });
      }
    };

    hideAnimation();
  };

  const handleClose = () => {
    announceToScreenReader(`${title || 'Modal'} closed`);
    onClose();
  };

  // Swipe to dismiss gesture
  const swipeGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (closeOnSwipe && position === 'bottom') {
        const { translationY } = event;
        
        if (translationY > 0) {
          translateY.value = translationY;
          
          // Update backdrop opacity based on swipe progress
          const progress = Math.min(translationY / 200, 1);
          backdropOpacity.value = 1 - progress * 0.5;
        }
      }
    })
    .onEnd((event) => {
      if (closeOnSwipe && position === 'bottom') {
        const { translationY, velocityY } = event;
        
        if (translationY > 100 || velocityY > 500) {
          runOnJS(handleClose)();
        } else {
          translateY.value = withSpring(0);
          backdropOpacity.value = withTiming(1);
        }
      }
    });

  // Backdrop tap gesture
  const backdropGesture = Gesture.Tap()
    .onEnd(() => {
      if (closeOnBackdrop) {
        runOnJS(handleClose)();
      }
    });

  // Animated styles
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => {
    if (position === 'center') {
      return {
        transform: [{ scale: scale.value }],
        opacity: interpolate(
          scale.value,
          [0.9, 1],
          [0, 1],
          Extrapolate.CLAMP
        ),
      };
    } else {
      return {
        transform: [{ translateY: translateY.value }],
      };
    }
  });

  const getModalSize = () => {
    switch (size) {
      case 'small':
        return { maxWidth: 320, maxHeight: SCREEN_HEIGHT * 0.4 };
      case 'medium':
        return { maxWidth: 400, maxHeight: SCREEN_HEIGHT * 0.6 };
      case 'large':
        return { maxWidth: 500, maxHeight: SCREEN_HEIGHT * 0.8 };
      case 'fullscreen':
        return { width: '100%', height: '100%' };
      default:
        return { maxWidth: 400, maxHeight: SCREEN_HEIGHT * 0.6 };
    }
  };

  const getPositionStyle = (): any => {
    const baseStyle = getModalSize();
    
    switch (position) {
      case 'top':
        return {
          ...baseStyle,
          marginTop: insets.top + 20,
          alignSelf: 'center' as const,
        };
      case 'bottom':
        return {
          ...baseStyle,
          position: 'absolute' as const,
          bottom: 0,
          left: 0,
          right: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        };
      case 'center':
      default:
        return {
          ...baseStyle,
          alignSelf: 'center' as const,
        };
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={visible}
      statusBarTranslucent
      onRequestClose={handleClose}
      testID={testID}
    >
      <View style={styles.overlay}>
        {/* Status Bar */}
        <StatusBar
          backgroundColor="rgba(0,0,0,0.5)"
          barStyle="light-content"
          translucent
        />

        {/* Backdrop */}
        <GestureDetector gesture={backdropGesture}>
          <Animated.View style={[styles.backdrop, backdropStyle]}>
            {blurBackground ? (
              <BlurView intensity={20} style={StyleSheet.absoluteFill} />
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.solidBackdrop]} />
            )}
          </Animated.View>
        </GestureDetector>

        {/* Modal Content */}
        <View
          style={[
            styles.container,
            position === 'center' && styles.centerContainer,
            position === 'bottom' && styles.bottomContainer,
            position === 'top' && styles.topContainer,
          ]}
          pointerEvents="box-none"
        >
          <GestureDetector gesture={swipeGesture}>
            <Animated.View
              ref={modalRef}
              style={[
                styles.modal,
                getPositionStyle(),
                modalStyle,
              ]}
              {...accessibilityProps}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <View style={styles.header}>
                  <View style={styles.titleContainer}>
                    {title && (
                      <Text style={styles.title} numberOfLines={1}>
                        {title}
                      </Text>
                    )}
                    {subtitle && (
                      <Text style={styles.subtitle} numberOfLines={2}>
                        {subtitle}
                      </Text>
                    )}
                  </View>
                  
                  {showCloseButton && (
                    <Pressable
                      style={styles.closeButton}
                      onPress={handleClose}
                      accessible={true}
                      accessibilityLabel="Close modal"
                      accessibilityRole="button"
                    >
                      <Ionicons name="close" size={24} color="#8E8E93" />
                    </Pressable>
                  )}
                </View>
              )}

              {/* Swipe Indicator for bottom modals */}
              {position === 'bottom' && closeOnSwipe && (
                <View style={styles.swipeIndicator} />
              )}

              {/* Content */}
              <View style={styles.content}>
                {children}
              </View>
            </Animated.View>
          </GestureDetector>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  solidBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  centerContainer: {
    justifyContent: 'center',
  },
  bottomContainer: {
    justifyContent: 'flex-end',
    paddingHorizontal: 0,
  },
  topContainer: {
    justifyContent: 'flex-start',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
  },
  swipeIndicator: {
    width: 36,
    height: 4,
    backgroundColor: '#C7C7CC',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
