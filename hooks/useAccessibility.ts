import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AccessibilityInfo, findNodeHandle, View, Text } from 'react-native';
import { accessibilityManager, ScreenReaderState } from '../utils/accessibilityManager';
import { structuredLogger } from '../utils/structuredLogger';

/**
 * React hooks for accessibility features
 * Provides easy-to-use hooks for screen reader support, focus management, and announcements
 */

/**
 * Hook to get current accessibility state
 */
export const useAccessibilityState = (): ScreenReaderState | null => {
  const [state, setState] = useState<ScreenReaderState | null>(null);

  useEffect(() => {
    // Get initial state
    const currentState = accessibilityManager.getAccessibilityState();
    setState(currentState);

    // Set up listeners for state changes
    let mounted = true;

    const checkAccessibilityState = async () => {
      try {
        const [
          boldTextEnabled,
          grayscaleEnabled,
          invertColorsEnabled,
          reduceMotionEnabled,
          reduceTransparencyEnabled,
          screenReaderEnabled,
        ] = await Promise.all([
          AccessibilityInfo.isBoldTextEnabled(),
          AccessibilityInfo.isGrayscaleEnabled(),
          AccessibilityInfo.isInvertColorsEnabled(),
          AccessibilityInfo.isReduceMotionEnabled(),
          AccessibilityInfo.isReduceTransparencyEnabled(),
          AccessibilityInfo.isScreenReaderEnabled(),
        ]);

        if (mounted) {
          setState({
            enabled: screenReaderEnabled,
            boldTextEnabled,
            grayscaleEnabled,
            invertColorsEnabled,
            reduceMotionEnabled,
            reduceTransparencyEnabled,
            screenReaderEnabled,
          });
        }
      } catch (error) {
        structuredLogger.error('Failed to check accessibility state', error instanceof Error ? error : new Error('Unknown error'));
      }
    };

    // Initial check
    checkAccessibilityState();

    // Set up event listeners
    const screenReaderListener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      checkAccessibilityState
    );

    const boldTextListener = AccessibilityInfo.addEventListener(
      'boldTextChanged',
      checkAccessibilityState
    );

    const reduceMotionListener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      checkAccessibilityState
    );

    return () => {
      mounted = false;
      screenReaderListener.remove();
      boldTextListener.remove();
      reduceMotionListener.remove();
    };
  }, []);

  return state;
};

/**
 * Hook for screen reader announcements
 */
export const useScreenReaderAnnouncement = () => {
  const announce = useCallback((
    message: string,
    priority: 'low' | 'normal' | 'high' = 'normal'
  ) => {
    accessibilityManager.announceForScreenReader(message, priority);
  }, []);

  const announceNavigation = useCallback((screenName: string, description?: string) => {
    accessibilityManager.announceNavigation(screenName, description);
  }, []);

  const announceActionComplete = useCallback((
    action: string,
    result: 'success' | 'error',
    details?: string
  ) => {
    accessibilityManager.announceActionComplete(action, result, details);
  }, []);

  return {
    announce,
    announceNavigation,
    announceActionComplete,
  };
};

/**
 * Hook for managing accessibility focus
 */
export const useAccessibilityFocus = () => {
  const focusRef = useRef<any>(null);

  const setFocus = useCallback(() => {
    if (focusRef.current) {
      const reactTag = findNodeHandle(focusRef.current);
      if (reactTag) {
        accessibilityManager.setAccessibilityFocus(reactTag);
      }
    }
  }, []);

  const setFocusWithDelay = useCallback((delay: number = 500) => {
    setTimeout(() => {
      setFocus();
    }, delay);
  }, [setFocus]);

  return {
    focusRef,
    setFocus,
    setFocusWithDelay,
  };
};

/**
 * Hook to check if animations should be reduced
 */
export const useReducedMotion = (): boolean => {
  const [shouldReduce, setShouldReduce] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkReduceMotion = async () => {
      try {
        const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
        if (mounted) {
          setShouldReduce(reduceMotion);
        }
      } catch (error) {
        structuredLogger.error('Failed to check reduce motion setting', error instanceof Error ? error : new Error('Unknown error'));
      }
    };

    checkReduceMotion();

    const listener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled: boolean) => {
        if (mounted) {
          setShouldReduce(enabled);
        }
      }
    );

    return () => {
      mounted = false;
      listener.remove();
    };
  }, []);

  return shouldReduce;
};

/**
 * Hook to check if screen reader is enabled
 */
export const useScreenReader = (): { enabled: boolean; loading: boolean } => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkScreenReader = async () => {
      try {
        const isEnabled = await AccessibilityInfo.isScreenReaderEnabled();
        if (mounted) {
          setEnabled(isEnabled);
          setLoading(false);
        }
      } catch (error) {
        structuredLogger.error('Failed to check screen reader status', error instanceof Error ? error : new Error('Unknown error'));
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkScreenReader();

    const listener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (isEnabled: boolean) => {
        if (mounted) {
          setEnabled(isEnabled);
        }
      }
    );

    return () => {
      mounted = false;
      listener.remove();
    };
  }, []);

  return { enabled, loading };
};

/**
 * Hook for enhanced accessibility props
 */
export const useAccessibilityProps = () => {
  const createButtonProps = useCallback((
    label: string,
    hint?: string,
    disabled?: boolean
  ) => {
    return accessibilityManager.generateAccessibilityProps({
      label,
      hint,
      role: 'button',
      state: { disabled },
    });
  }, []);

  const createTextProps = useCallback((
    content: string,
    role: 'text' | 'header' = 'text'
  ) => {
    return accessibilityManager.generateAccessibilityProps({
      label: content,
      role,
    });
  }, []);

  const createLinkProps = useCallback((
    label: string,
    hint?: string
  ) => {
    return accessibilityManager.generateAccessibilityProps({
      label,
      hint,
      role: 'link',
    });
  }, []);

  const createImageProps = useCallback((
    description: string,
    decorative = false
  ) => {
    if (decorative) {
      return {
        accessible: false,
        accessibilityElementsHidden: true,
      };
    }

    return accessibilityManager.generateAccessibilityProps({
      label: description,
      role: 'image',
    });
  }, []);

  const createListItemProps = useCallback((
    content: string,
    position: { current: number; total: number },
    actions?: Array<{ name: string; label?: string }>
  ) => {
    const description = accessibilityManager.createSemanticDescription(
      'List item',
      content,
      undefined,
      position
    );

    return accessibilityManager.generateAccessibilityProps({
      label: description,
      role: 'button',
      actions,
    });
  }, []);

  return {
    createButtonProps,
    createTextProps,
    createLinkProps,
    createImageProps,
    createListItemProps,
  };
};

/**
 * Hook for live region announcements (for dynamic content changes)
 */
export const useLiveRegion = () => {
  const [liveText, setLiveText] = useState('');

  const updateLiveRegion = useCallback((text: string) => {
    setLiveText(text);
    // Use accessibility manager for announcements instead of JSX component
    accessibilityManager.announceForScreenReader(text, 'normal');
    // Clear after a short delay to allow for repeated announcements
    setTimeout(() => setLiveText(''), 100);
  }, []);

  return {
    updateLiveRegion,
    liveText,
  };
};

/**
 * Hook for keyboard navigation support
 */
export const useKeyboardNavigation = () => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [items, setItems] = useState<Array<{ id: string; ref: React.RefObject<any> }>>([]);

  const addItem = useCallback((id: string, ref: React.RefObject<any>) => {
    setItems(prev => [...prev, { id, ref }]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const focusNext = useCallback(() => {
    setFocusedIndex(prev => {
      const nextIndex = (prev + 1) % items.length;
      const nextItem = items[nextIndex];
      if (nextItem?.ref.current) {
        const reactTag = findNodeHandle(nextItem.ref.current);
        if (reactTag) {
          accessibilityManager.setAccessibilityFocus(reactTag);
        }
      }
      return nextIndex;
    });
  }, [items]);

  const focusPrevious = useCallback(() => {
    setFocusedIndex(prev => {
      const prevIndex = prev === 0 ? items.length - 1 : prev - 1;
      const prevItem = items[prevIndex];
      if (prevItem?.ref.current) {
        const reactTag = findNodeHandle(prevItem.ref.current);
        if (reactTag) {
          accessibilityManager.setAccessibilityFocus(reactTag);
        }
      }
      return prevIndex;
    });
  }, [items]);

  const focusItem = useCallback((index: number) => {
    if (index >= 0 && index < items.length) {
      setFocusedIndex(index);
      const item = items[index];
      if (item?.ref.current) {
        const reactTag = findNodeHandle(item.ref.current);
        if (reactTag) {
          accessibilityManager.setAccessibilityFocus(reactTag);
        }
      }
    }
  }, [items]);

  return {
    focusedIndex,
    addItem,
    removeItem,
    focusNext,
    focusPrevious,
    focusItem,
  };
};

export default {
  useAccessibilityState,
  useScreenReaderAnnouncement,
  useAccessibilityFocus,
  useReducedMotion,
  useScreenReader,
  useAccessibilityProps,
  useLiveRegion,
  useKeyboardNavigation,
};
