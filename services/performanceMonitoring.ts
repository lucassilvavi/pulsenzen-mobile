import React from 'react';

/**
 * Performance monitoring service for React Native app
 * Tracks app performance metrics and user experience
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  context?: Record<string, any>;
}

export interface ScreenTransition {
  from: string;
  to: string;
  duration: number;
  timestamp: number;
}

export interface AppPerformanceData {
  screenTransitions: ScreenTransition[];
  apiCalls: PerformanceMetric[];
  renderTimes: PerformanceMetric[];
  memoryUsage: PerformanceMetric[];
  crashes: any[];
}

class PerformanceMonitoringService {
  private metrics: PerformanceMetric[] = [];
  private screenTransitions: ScreenTransition[] = [];
  private apiCalls: PerformanceMetric[] = [];
  private renderTimes: PerformanceMetric[] = [];
  private memoryUsage: PerformanceMetric[] = [];
  private crashes: any[] = [];
  
  private currentScreen: string = '';
  private screenStartTime: number = 0;
  private isMonitoring: boolean = true;

  constructor() {
    this.startMemoryMonitoring();
  }

  /**
   * Enable or disable performance monitoring
   */
  setMonitoring(enabled: boolean): void {
    this.isMonitoring = enabled;
  }

  /**
   * Track screen navigation
   */
  trackScreenTransition(fromScreen: string, toScreen: string): void {
    if (!this.isMonitoring) return;

    const now = Date.now();
    if (this.currentScreen && this.screenStartTime) {
      const duration = now - this.screenStartTime;
      
      const transition: ScreenTransition = {
        from: fromScreen,
        to: toScreen,
        duration,
        timestamp: now,
      };

      this.screenTransitions.push(transition);
      this.addMetric('screen_transition', duration, { fromScreen, toScreen });
    }

    this.currentScreen = toScreen;
    this.screenStartTime = now;
  }

  /**
   * Track API call performance
   */
  trackApiCall(
    endpoint: string, 
    duration: number, 
    status: 'success' | 'error',
    context?: Record<string, any>
  ): void {
    if (!this.isMonitoring) return;

    const metric: PerformanceMetric = {
      name: `api_call_${endpoint}`,
      value: duration,
      timestamp: Date.now(),
      context: { status, endpoint, ...context },
    };

    this.apiCalls.push(metric);
    this.addMetric('api_call', duration, { endpoint, status });
  }

  /**
   * Track component render time
   */
  trackRenderTime(componentName: string, renderTime: number): void {
    if (!this.isMonitoring) return;

    const metric: PerformanceMetric = {
      name: `render_${componentName}`,
      value: renderTime,
      timestamp: Date.now(),
      context: { componentName },
    };

    this.renderTimes.push(metric);
    this.addMetric('render_time', renderTime, { componentName });
  }

  /**
   * Track memory usage
   */
  private trackMemoryUsage(): void {
    if (!this.isMonitoring) return;

    // In real implementation, use performance.memory or native modules
    const mockMemoryUsage = Math.random() * 100; // MB
    
    const metric: PerformanceMetric = {
      name: 'memory_usage',
      value: mockMemoryUsage,
      timestamp: Date.now(),
      context: { unit: 'MB' },
    };

    this.memoryUsage.push(metric);
    this.addMetric('memory_usage', mockMemoryUsage);
  }

  /**
   * Start automatic memory monitoring
   */
  private startMemoryMonitoring(): void {
    setInterval(() => {
      this.trackMemoryUsage();
    }, 30000); // Every 30 seconds
  }

  /**
   * Track app crash or error
   */
  trackCrash(error: Error, context?: Record<string, any>): void {
    const crashData = {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      context,
    };

    this.crashes.push(crashData);
  }

  /**
   * Add generic performance metric
   */
  private addMetric(name: string, value: number, context?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      context,
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics to avoid memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    avgScreenTransition: number;
    avgApiCall: number;
    avgRenderTime: number;
    avgMemoryUsage: number;
    totalCrashes: number;
    totalMetrics: number;
  } {
    const avgScreenTransition = this.screenTransitions.length > 0
      ? this.screenTransitions.reduce((sum, t) => sum + t.duration, 0) / this.screenTransitions.length
      : 0;

    const avgApiCall = this.apiCalls.length > 0
      ? this.apiCalls.reduce((sum, a) => sum + a.value, 0) / this.apiCalls.length
      : 0;

    const avgRenderTime = this.renderTimes.length > 0
      ? this.renderTimes.reduce((sum, r) => sum + r.value, 0) / this.renderTimes.length
      : 0;

    const avgMemoryUsage = this.memoryUsage.length > 0
      ? this.memoryUsage.reduce((sum, m) => sum + m.value, 0) / this.memoryUsage.length
      : 0;

    return {
      avgScreenTransition,
      avgApiCall,
      avgRenderTime,
      avgMemoryUsage,
      totalCrashes: this.crashes.length,
      totalMetrics: this.metrics.length,
    };
  }

  /**
   * Get all performance data
   */
  getAllPerformanceData(): AppPerformanceData {
    return {
      screenTransitions: [...this.screenTransitions],
      apiCalls: [...this.apiCalls],
      renderTimes: [...this.renderTimes],
      memoryUsage: [...this.memoryUsage],
      crashes: [...this.crashes],
    };
  }

  /**
   * Clear all performance data
   */
  clearData(): void {
    this.metrics = [];
    this.screenTransitions = [];
    this.apiCalls = [];
    this.renderTimes = [];
    this.memoryUsage = [];
    this.crashes = [];
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const summary = this.getPerformanceSummary();
    
    return `
Performance Report (Generated: ${new Date().toISOString()})
============================================

🚀 Screen Transitions:
   Average: ${summary.avgScreenTransition.toFixed(2)}ms
   Total: ${this.screenTransitions.length}

⚡ API Calls:
   Average: ${summary.avgApiCall.toFixed(2)}ms
   Total: ${this.apiCalls.length}

🎨 Render Performance:
   Average: ${summary.avgRenderTime.toFixed(2)}ms
   Total: ${this.renderTimes.length}

💾 Memory Usage:
   Average: ${summary.avgMemoryUsage.toFixed(2)}MB
   Samples: ${this.memoryUsage.length}

💥 Crashes:
   Total: ${summary.totalCrashes}

📊 Total Metrics Collected: ${summary.totalMetrics}
    `;
  }
}

// Singleton instance
const performanceMonitoring = new PerformanceMonitoringService();

/**
 * React hook for performance monitoring
 */
export function usePerformanceTracking(componentName: string) {
  const trackRender = (renderTime: number) => {
    performanceMonitoring.trackRenderTime(componentName, renderTime);
  };

  return { trackRender };
}

/**
 * Higher-order component for automatic render tracking
 */
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: P) {
    const startTime = Date.now();
    
    React.useEffect(() => {
      const renderTime = Date.now() - startTime;
      performanceMonitoring.trackRenderTime(componentName, renderTime);
    });

    return React.createElement(WrappedComponent, props);
  };
}

export default performanceMonitoring;
