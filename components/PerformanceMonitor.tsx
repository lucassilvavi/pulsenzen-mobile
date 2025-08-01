/**
 * Performance Monitoring Component
 * Tracks and reports component performance metrics
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { logger } from '../utils/logger';

interface PerformanceMetrics {
  renderTime: number;
  updateCount: number;
  lastRender: number;
  averageRenderTime: number;
}

interface PerformanceMonitorProps {
  children: React.ReactNode;
  componentName?: string;
  threshold?: number; // ms - warn if render takes longer
  enabled?: boolean;
  onPerformanceIssue?: (metrics: PerformanceMetrics) => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  children,
  componentName = 'Component',
  threshold = 100,
  enabled = __DEV__,
  onPerformanceIssue,
}) => {
  const renderStartTime = useRef<number>(0);
  const renderTimes = useRef<number[]>([]);
  const updateCount = useRef<number>(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    updateCount: 0,
    lastRender: 0,
    averageRenderTime: 0,
  });

  useEffect(() => {
    if (!enabled) return;

    renderStartTime.current = performance.now();
    
    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      renderTimes.current.push(renderTime);
      updateCount.current += 1;

      // Keep only last 10 render times for average calculation
      if (renderTimes.current.length > 10) {
        renderTimes.current = renderTimes.current.slice(-10);
      }

      const averageRenderTime = renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length;

      const newMetrics: PerformanceMetrics = {
        renderTime,
        updateCount: updateCount.current,
        lastRender: Date.now(),
        averageRenderTime,
      };

      setMetrics(newMetrics);

      // Log performance issues
      if (renderTime > threshold) {
        logger.warn('PerformanceMonitor', `Slow render detected in ${componentName}`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          threshold: `${threshold}ms`,
          updateCount: updateCount.current,
        });

        onPerformanceIssue?.(newMetrics);
      }

      // Log summary every 50 updates
      if (updateCount.current % 50 === 0) {
        logger.info('PerformanceMonitor', `Performance summary for ${componentName}`, {
          totalUpdates: updateCount.current,
          averageRenderTime: `${averageRenderTime.toFixed(2)}ms`,
          lastRenderTime: `${renderTime.toFixed(2)}ms`,
        });
      }
    };
  });

  // Development-only performance overlay
  if (enabled && __DEV__ && metrics.updateCount > 0) {
    return (
      <View style={styles.container}>
        {children}
        <View style={styles.performanceOverlay}>
          <Text style={styles.performanceText}>
            {componentName}: {metrics.renderTime.toFixed(1)}ms
          </Text>
          <Text style={styles.performanceSubText}>
            Avg: {metrics.averageRenderTime.toFixed(1)}ms | Updates: {metrics.updateCount}
          </Text>
        </View>
      </View>
    );
  }

  return <>{children}</>;
};

// Hook for component performance tracking
export const usePerformanceTracking = (componentName: string, enabled = __DEV__) => {
  const renderStart = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    renderStart.current = performance.now();
    renderCount.current += 1;

    return () => {
      const renderTime = performance.now() - renderStart.current;
      
      if (renderTime > 50) { // Warn for renders > 50ms
        logger.warn('PerformanceTracking', `Slow render in ${componentName}`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          renderCount: renderCount.current,
        });
      }
    };
  });

  return {
    renderCount: renderCount.current,
  };
};

// Higher-order component for performance monitoring
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    componentName?: string;
    threshold?: number;
    enabled?: boolean;
  } = {}
) => {
  const {
    componentName = WrappedComponent.displayName || WrappedComponent.name || 'Component',
    threshold = 100,
    enabled = __DEV__,
  } = options;

  const PerformanceWrappedComponent: React.FC<P> = (props) => (
    <PerformanceMonitor
      componentName={componentName}
      threshold={threshold}
      enabled={enabled}
    >
      <WrappedComponent {...props} />
    </PerformanceMonitor>
  );

  PerformanceWrappedComponent.displayName = `withPerformanceMonitoring(${componentName})`;

  return PerformanceWrappedComponent;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  performanceOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 4,
    borderRadius: 4,
    zIndex: 9999,
  },
  performanceText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  performanceSubText: {
    color: '#ccc',
    fontSize: 8,
    fontFamily: 'monospace',
  },
});

export default PerformanceMonitor;
