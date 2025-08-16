// Task 1.4: Component Enhancement - UI improvements, animations, and accessibility

// Core UI Components
export { EnhancedButton } from './EnhancedButton';
export { EnhancedLoadingIndicator, SkeletonLoader } from './EnhancedLoadingIndicator';
export { EnhancedModal } from './EnhancedModal';
export { EnhancedTextInput } from './EnhancedTextInput';

// Journal-Specific Components
export { EnhancedJournalCard } from './EnhancedJournalCard';

// Charts and Progress Components
export { EnhancedProgressBar, EnhancedStatsCard, MoodChart } from './EnhancedCharts';

// Accessibility Hooks
export {
    useAccessibilityFocus, useAccessibilityProps, useAccessibilityState, useKeyboardNavigation, useLiveRegion, useReducedMotion,
    useScreenReader, useScreenReaderAnnouncement
} from '../../hooks/useAccessibility';

// Animation Hooks and Utilities
export {
    ANIMATION_CONFIGS, createStaggeredAnimation, useColorAnimation, useFadeAnimation, useGestureAnimation, useRotationAnimation, useScaleAnimation, useSequenceAnimation, useSlideAnimation
} from '../../hooks/useAnimations';

// Haptic Feedback
export { HapticManager, useHaptics } from '../../utils/hapticManager';

// Types
export type { AnimationConfig } from '../../hooks/useAnimations';

export interface UIComponentProps {
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  disabled?: boolean;
}

export interface AnimatedComponentProps extends UIComponentProps {
  animated?: boolean;
  reducedMotion?: boolean;
}

// Theme types (for future expansion)
export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

export interface ComponentSizes {
  small: {
    height: number;
    padding: number;
    fontSize: number;
  };
  medium: {
    height: number;
    padding: number;
    fontSize: number;
  };
  large: {
    height: number;
    padding: number;
    fontSize: number;
  };
}
