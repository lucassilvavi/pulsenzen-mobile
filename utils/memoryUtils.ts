import { useEffect, useRef, useCallback } from 'react';

/**
 * Memory management utilities for React Native app optimization
 */

/**
 * Hook for debouncing expensive operations
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<number | null>(null);
  
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Hook for throttling expensive operations
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0);
  
  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  ) as T;

  return throttledCallback;
}

/**
 * Hook for cleanup on unmount
 */
export function useCleanup(cleanupFunction: () => void): void {
  useEffect(() => {
    return cleanupFunction;
  }, [cleanupFunction]);
}

/**
 * Hook for managing intervals with cleanup
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const interval = setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => clearInterval(interval);
  }, [delay]);
}

/**
 * Memory-efficient image loading hook
 */
export function useImagePreloader(imageUrls: string[]): {
  loadedImages: Set<string>;
  preloadImage: (url: string) => void;
  clearCache: () => void;
} {
  const loadedImages = useRef<Set<string>>(new Set());
  const imageCache = useRef<Map<string, any>>(new Map());

  const preloadImage = useCallback((url: string) => {
    if (loadedImages.current.has(url)) return;

    // Simulate image loading for React Native
    // In real implementation, use react-native-fast-image or similar
    const image = { uri: url };
    imageCache.current.set(url, image);
    loadedImages.current.add(url);
  }, []);

  const clearCache = useCallback(() => {
    imageCache.current.clear();
    loadedImages.current.clear();
  }, []);

  useCleanup(() => {
    clearCache();
  });

  return {
    loadedImages: loadedImages.current,
    preloadImage,
    clearCache,
  };
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor(
  componentName: string
): {
  markStart: (operation: string) => void;
  markEnd: (operation: string) => void;
  getMetrics: () => Record<string, number>;
} {
  const metrics = useRef<Record<string, number>>({});
  const startTimes = useRef<Record<string, number>>({});

  const markStart = useCallback((operation: string) => {
    startTimes.current[operation] = Date.now();
  }, []);

  const markEnd = useCallback((operation: string) => {
    const startTime = startTimes.current[operation];
    if (startTime) {
      const duration = Date.now() - startTime;
      metrics.current[`${componentName}.${operation}`] = duration;
      delete startTimes.current[operation];
    }
  }, [componentName]);

  const getMetrics = useCallback(() => {
    return { ...metrics.current };
  }, []);

  return { markStart, markEnd, getMetrics };
}

/**
 * Memory-efficient list rendering hook
 */
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
): {
  visibleItems: T[];
  startIndex: number;
  endIndex: number;
  scrollOffset: number;
} {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const buffer = 2; // Extra items for smooth scrolling
  
  const startIndex = Math.max(0, 0 - buffer);
  const endIndex = Math.min(items.length - 1, visibleCount + buffer);
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  const scrollOffset = startIndex * itemHeight;

  return {
    visibleItems,
    startIndex,
    endIndex,
    scrollOffset,
  };
}

/**
 * Bundle size analyzer helper
 */
export const BundleAnalyzer = {
  logComponentSize: (componentName: string, props: any) => {
    if (__DEV__) {
      const propsSize = JSON.stringify(props).length;
      console.log(`Component ${componentName} props size: ${propsSize} bytes`);
    }
  },

  logMemoryUsage: (location: string) => {
    if (__DEV__) {
      // In real implementation, use performance.memory if available
      console.log(`Memory check at ${location}`);
    }
  },
};

/**
 * Export all memory management utilities
 */
export const MemoryUtils = {
  useDebounce,
  useThrottle,
  useCleanup,
  useInterval,
  useImagePreloader,
  usePerformanceMonitor,
  useVirtualList,
  BundleAnalyzer,
} as const;

export default MemoryUtils;
