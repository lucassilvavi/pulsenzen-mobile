import { AccessibilityWrapper } from '@/components/accessibility/AccessibilityComponents';
import React, { ReactElement } from 'react';

/**
 * Utility functions for performance optimization in React Native
 */

/**
 * Memoizes a component to prevent unnecessary re-renders
 * @param Component - The component to memoize
 * @param propsAreEqual - Optional custom comparison function
 * @returns Memoized component
 */
export function memoizeComponent<T>(
  Component: React.ComponentType<T>,
  propsAreEqual?: (prevProps: Readonly<T>, nextProps: Readonly<T>) => boolean
): React.MemoExoticComponent<React.ComponentType<T>> {
  return React.memo(Component, propsAreEqual);
}

/**
 * Creates a memoized callback that only changes if dependencies change
 * @param callback - The callback function to memoize
 * @param dependencies - Array of dependencies
 * @returns Memoized callback
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList
): T {
  return React.useCallback(callback, dependencies);
}

/**
 * Creates a memoized value that only changes if dependencies change
 * @param valueCreator - Function that creates the value
 * @param dependencies - Array of dependencies
 * @returns Memoized value
 */
export function useMemoizedValue<T>(
  valueCreator: () => T,
  dependencies: React.DependencyList
): T {
  return React.useMemo(valueCreator, dependencies);
}

type AccessibilityProps = {
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'none' | 'button' | 'link' | 'search' | 'image' | 'text' | 'adjustable' | 'header' | 'summary' | 'imagebutton';
};

/**
 * Wraps a component with accessibility features
 * @param Component - The component to wrap
 * @returns Wrapped component with accessibility props
 */
export function withAccessibility<T extends object>(
  Component: React.ComponentType<T>
): React.FC<T & AccessibilityProps> {
  const AccessibleComponent: React.FC<T & AccessibilityProps> = (props): ReactElement => {
    const { accessibilityLabel, accessibilityHint, accessibilityRole, ...rest } = props;
    return React.createElement(
      AccessibilityWrapper,
      {
        label: accessibilityLabel,
        hint: accessibilityHint,
        role: accessibilityRole,
        children: React.createElement(Component, rest as T)
      }
    );
  };
  return AccessibleComponent;
}

/**
 * Custom hook for lazy loading components
 * @param importFunc - Function that imports the component
 * @returns Lazy loaded component and loading state
 */
export function useLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): [React.LazyExoticComponent<T>, boolean] {
  const [isLoaded, setIsLoaded] = React.useState(false);
  
  const LazyComponent = React.useMemo(
    () => 
      React.lazy(async () => {
        const component = await importFunc();
        setIsLoaded(true);
        return component;
      }),
    [importFunc]
  );
  
  return [LazyComponent, isLoaded];
}

/**
 * Custom hook for tracking component render performance
 * @param componentName - Name of the component to track
 */
export function useRenderPerformance(componentName: string): void {
  const renderCount = React.useRef(0);
  const lastRenderTime = React.useRef(Date.now());
  
  React.useEffect(() => {
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    renderCount.current += 1;
    
    console.log(
      `[Performance] ${componentName} rendered ${renderCount.current} times. ` +
      `Time since last render: ${timeSinceLastRender}ms`
    );
    
    lastRenderTime.current = now;
  });
}

/**
 * Custom hook for debouncing values
 * @param value - Value to debounce
 * @param delay - Debounce delay in milliseconds
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * Custom hook for throttling values
 * @param value - Value to throttle
 * @param limit - Throttle limit in milliseconds
 * @returns Throttled value
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);
  const lastRan = React.useRef(Date.now());
  
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);
  
  return throttledValue;
}

export default {
  memoizeComponent,
  useMemoizedCallback,
  useMemoizedValue,
  withAccessibility,
  useLazyComponent,
  useRenderPerformance,
  useDebounce,
  useThrottle,
};
