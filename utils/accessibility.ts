import React from 'react';
import { StyleSheet } from 'react-native';
import { AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Utility functions for enhancing accessibility in React Native
 */

/**
 * Check if screen reader is enabled
 * @returns Promise resolving to boolean indicating if screen reader is enabled
 */
export const isScreenReaderEnabled = async (): Promise<boolean> => {
  return await AccessibilityInfo.isScreenReaderEnabled();
};

/**
 * Add a screen reader change listener
 * @param onChange - Callback function when screen reader status changes
 * @returns Object with remove method to clean up listener
 */
export const addScreenReaderChangeListener = (
  onChange: (isEnabled: boolean) => void
): { remove: () => void } => {
  return AccessibilityInfo.addEventListener('screenReaderChanged', onChange);
};

/**
 * Announce a message to screen readers
 * @param message - Message to announce
 */
export const announceForAccessibility = (message: string): void => {
  AccessibilityInfo.announceForAccessibility(message);
};

/**
 * Check if reduce motion is enabled
 * @returns Promise resolving to boolean indicating if reduce motion is enabled
 */
export const isReduceMotionEnabled = async (): Promise<boolean> => {
  return await AccessibilityInfo.isReduceMotionEnabled();
};

/**
 * Add a reduce motion change listener
 * @param onChange - Callback function when reduce motion status changes
 * @returns Object with remove method to clean up listener
 */
export const addReduceMotionChangeListener = (
  onChange: (isEnabled: boolean) => void
): { remove: () => void } => {
  return AccessibilityInfo.addEventListener('reduceMotionChanged', onChange);
};

/**
 * Custom hook for screen reader status
 * @returns Boolean indicating if screen reader is enabled
 */
export const useScreenReader = (): boolean => {
  const [isEnabled, setIsEnabled] = React.useState<boolean>(false);
  
  React.useEffect(() => {
    let isMounted = true;
    
    const checkScreenReader = async () => {
      const enabled = await isScreenReaderEnabled();
      if (isMounted) {
        setIsEnabled(enabled);
      }
    };
    
    checkScreenReader();
    
    const listener = addScreenReaderChangeListener((enabled) => {
      if (isMounted) {
        setIsEnabled(enabled);
      }
    });
    
    return () => {
      isMounted = false;
      listener.remove();
    };
  }, []);
  
  return isEnabled;
};

/**
 * Custom hook for reduce motion status
 * @returns Boolean indicating if reduce motion is enabled
 */
export const useReduceMotion = (): boolean => {
  const [isEnabled, setIsEnabled] = React.useState<boolean>(false);
  
  React.useEffect(() => {
    let isMounted = true;
    
    const checkReduceMotion = async () => {
      const enabled = await isReduceMotionEnabled();
      if (isMounted) {
        setIsEnabled(enabled);
      }
    };
    
    checkReduceMotion();
    
    const listener = addReduceMotionChangeListener((enabled) => {
      if (isMounted) {
        setIsEnabled(enabled);
      }
    });
    
    return () => {
      isMounted = false;
      listener.remove();
    };
  }, []);
  
  return isEnabled;
};

/**
 * Provide haptic feedback based on accessibility settings
 * @param type - Type of haptic feedback
 */
export const provideFeedback = async (
  type: 'success' | 'warning' | 'error' | 'light' | 'medium' | 'heavy' = 'light'
): Promise<void> => {
  // Check if haptics should be disabled based on accessibility settings
  const reduceMotion = await isReduceMotionEnabled();
  
  if (reduceMotion) {
    // Skip haptic feedback if reduce motion is enabled
    return;
  }
  
  try {
    switch (type) {
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (error) {
    // Silently fail if haptics are not available
    console.log('Haptic feedback not available:', error);
  }
};

/**
 * Generate accessibility props for components
 * @param label - Accessibility label
 * @param hint - Accessibility hint
 * @param role - Accessibility role
 * @returns Object with accessibility props
 */
export const getAccessibilityProps = (
  label?: string,
  hint?: string,
  role?: 'none' | 'button' | 'link' | 'search' | 'image' | 'text' | 'adjustable' | 'header' | 'summary' | 'imagebutton'
): object => {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: role,
  };
};

export default {
  isScreenReaderEnabled,
  addScreenReaderChangeListener,
  announceForAccessibility,
  isReduceMotionEnabled,
  addReduceMotionChangeListener,
  useScreenReader,
  useReduceMotion,
  provideFeedback,
  getAccessibilityProps,
};
