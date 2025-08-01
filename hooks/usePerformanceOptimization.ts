import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { logger } from '../utils/logger';

/**
 * Optimized context value memoization
 * Prevents unnecessary re-renders by memoizing context values
 */
export function useMemoizedContextValue<T>(value: T): T {
  return useMemo(() => value, [value]);
}

/**
 * Stable callback reference
 * Provides a stable callback reference that doesn't change between renders
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);
  
  // Update the ref with the latest callback
  useEffect(() => {
    callbackRef.current = callback;
  });

  // Return a stable callback that calls the latest version
  return useCallback((...args: any[]) => {
    return callbackRef.current(...args);
  }, []) as T;
}

/**
 * Performance monitoring hook
 * Tracks render times and performance metrics
 */
export function usePerformanceMonitor(componentName: string) {
  const startTimeRef = useRef<number | null>(null);
  const renderTimesRef = useRef<number[]>([]);

  const renderStart = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  const renderEnd = useCallback(() => {
    if (startTimeRef.current !== null) {
      const renderTime = performance.now() - startTimeRef.current;
      renderTimesRef.current.push(renderTime);
      
      // Log slow renders
      if (renderTime > 16) { // More than one frame (60fps)
        logger.warn('PERFORMANCE', `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
      
      startTimeRef.current = null;
    }
  }, [componentName]);

  const getRenderTime = useCallback(() => {
    const times = renderTimesRef.current;
    return times.length > 0 ? times[times.length - 1] : 0;
  }, []);

  const getAverageRenderTime = useCallback(() => {
    const times = renderTimesRef.current;
    if (times.length === 0) return 0;
    
    const sum = times.reduce((acc, time) => acc + time, 0);
    return sum / times.length;
  }, []);

  return {
    renderStart,
    renderEnd,
    getRenderTime,
    getAverageRenderTime,
  };
}

/**
 * Debounced value hook
 * Returns a debounced version of the input value
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
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
 * Throttled value hook
 * Returns a throttled version of the input value
 */
export function useThrottledValue<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdated = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();
    
    if (now - lastUpdated.current >= delay) {
      setThrottledValue(value);
      lastUpdated.current = now;
    } else {
      const timeoutId = setTimeout(() => {
        setThrottledValue(value);
        lastUpdated.current = Date.now();
      }, delay - (now - lastUpdated.current));
      
      return () => clearTimeout(timeoutId);
    }
  }, [value, delay]);

  return throttledValue;
}

/**
 * Enhanced memo with tracking
 * Provides React.memo with performance tracking
 */
export function enhancedMemo<T extends React.ComponentType<any>>(
  Component: T,
  componentName?: string
): React.MemoExoticComponent<T> {
  const MemoizedComponent = React.memo(Component, (prevProps, nextProps) => {
    const name = componentName || Component.displayName || Component.name;
    
    // Track memo hits/misses for optimization insights
    const propsChanged = Object.keys(prevProps).some(key => 
      prevProps[key] !== nextProps[key]
    );
    
    if (propsChanged) {
      logger.debug('MEMO', `Memo miss for ${name}: props changed`);
    } else {
      logger.debug('MEMO', `Memo hit for ${name}: props unchanged`);
    }
    
    return !propsChanged;
  });

  return MemoizedComponent;
}