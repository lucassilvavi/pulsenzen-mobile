import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, AccessibilityRole, Platform } from 'react-native';

/**
 * Accessibility state interface
 */
interface AccessibilityState {
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isReduceTransparencyEnabled: boolean;
  isBoldTextEnabled: boolean;
  isGrayscaleEnabled: boolean;
  isInvertColorsEnabled: boolean;
}

/**
 * Accessibility props interface
 */
interface AccessibilityProps {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    busy?: boolean;
    expanded?: boolean;
  };
  accessibilityActions?: Array<{
    name: string;
    label?: string;
  }>;
  onAccessibilityAction?: (event: any) => void;
}

/**
 * Main accessibility state hook
 */
export const useAccessibilityState = (): AccessibilityState => {
  const [accessibilityState, setAccessibilityState] = useState<AccessibilityState>({
    isScreenReaderEnabled: false,
    isReduceMotionEnabled: false,
    isReduceTransparencyEnabled: false,
    isBoldTextEnabled: false,
    isGrayscaleEnabled: false,
    isInvertColorsEnabled: false,
  });

  useEffect(() => {
    // Check initial screen reader state
    AccessibilityInfo.isScreenReaderEnabled().then((enabled) => {
      setAccessibilityState(prev => ({ ...prev, isScreenReaderEnabled: enabled }));
    });

    // Check reduce motion (iOS only)
    if (Platform.OS === 'ios') {
      AccessibilityInfo.isReduceMotionEnabled?.().then((enabled) => {
        setAccessibilityState(prev => ({ ...prev, isReduceMotionEnabled: enabled }));
      });

      AccessibilityInfo.isReduceTransparencyEnabled?.().then((enabled) => {
        setAccessibilityState(prev => ({ ...prev, isReduceTransparencyEnabled: enabled }));
      });

      AccessibilityInfo.isBoldTextEnabled?.().then((enabled) => {
        setAccessibilityState(prev => ({ ...prev, isBoldTextEnabled: enabled }));
      });

      AccessibilityInfo.isGrayscaleEnabled?.().then((enabled) => {
        setAccessibilityState(prev => ({ ...prev, isGrayscaleEnabled: enabled }));
      });

      AccessibilityInfo.isInvertColorsEnabled?.().then((enabled) => {
        setAccessibilityState(prev => ({ ...prev, isInvertColorsEnabled: enabled }));
      });
    }

    // Listen for changes
    const screenReaderChangedListener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled) => {
        setAccessibilityState(prev => ({ ...prev, isScreenReaderEnabled: enabled }));
      }
    );

    const reduceMotionChangedListener = Platform.OS === 'ios' 
      ? AccessibilityInfo.addEventListener(
          'reduceMotionChanged',
          (enabled) => {
            setAccessibilityState(prev => ({ ...prev, isReduceMotionEnabled: enabled }));
          }
        )
      : null;

    const boldTextChangedListener = Platform.OS === 'ios'
      ? AccessibilityInfo.addEventListener(
          'boldTextChanged',
          (enabled) => {
            setAccessibilityState(prev => ({ ...prev, isBoldTextEnabled: enabled }));
          }
        )
      : null;

    return () => {
      screenReaderChangedListener?.remove();
      reduceMotionChangedListener?.remove();
      boldTextChangedListener?.remove();
    };
  }, []);

  return accessibilityState;
};

/**
 * Screen reader announcement hook
 */
export const useScreenReaderAnnouncement = () => {
  const announceToScreenReader = useCallback((message: string, priority?: 'polite' | 'assertive') => {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(message);
    } else {
      // Android TalkBack
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, []);

  return announceToScreenReader;
};

/**
 * Accessibility focus management hook
 */
export const useAccessibilityFocus = () => {
  const setAccessibilityFocus = useCallback((reactTag: number) => {
    AccessibilityInfo.setAccessibilityFocus(reactTag);
  }, []);

  return { setAccessibilityFocus };
};

/**
 * Reduced motion preference hook
 */
export const useReducedMotion = () => {
  const { isReduceMotionEnabled } = useAccessibilityState();
  return isReduceMotionEnabled;
};

/**
 * Screen reader state hook
 */
export const useScreenReader = () => {
  const { isScreenReaderEnabled } = useAccessibilityState();
  return isScreenReaderEnabled;
};

/**
 * Accessibility props generator hook
 */
export const useAccessibilityProps = ({
  label,
  hint,
  role,
  state,
  actions,
  onAction,
}: {
  label?: string;
  hint?: string;
  role?: AccessibilityRole;
  state?: AccessibilityProps['accessibilityState'];
  actions?: AccessibilityProps['accessibilityActions'];
  onAction?: AccessibilityProps['onAccessibilityAction'];
}): AccessibilityProps => {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: role,
    accessibilityState: state,
    accessibilityActions: actions,
    onAccessibilityAction: onAction,
  };
};

/**
 * Live region hook for dynamic content announcements
 */
export const useLiveRegion = (content: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announceToScreenReader = useScreenReaderAnnouncement();

  useEffect(() => {
    if (content) {
      // Delay announcement to ensure it's not interrupted
      const timer = setTimeout(() => {
        announceToScreenReader(content, priority);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [content, priority, announceToScreenReader]);
};

/**
 * Keyboard navigation hook
 */
export const useKeyboardNavigation = () => {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyPress = useCallback((event: any, itemCount: number) => {
    const { key } = event.nativeEvent;
    
    switch (key) {
      case 'ArrowDown':
        setFocusedIndex(prev => Math.min(prev + 1, itemCount - 1));
        break;
      case 'ArrowUp':
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Home':
        setFocusedIndex(0);
        break;
      case 'End':
        setFocusedIndex(itemCount - 1);
        break;
    }
  }, []);

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyPress,
  };
};
