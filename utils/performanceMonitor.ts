import { logger } from './logger';

export interface PerformanceThreshold {
  name: string;
  warning: number;
  critical: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
}

export interface PerformanceReport {
  timestamp: string;
  category: string;
  metrics: {
    name: string;
    value: number;
    unit: string;
    status: 'good' | 'warning' | 'critical';
    threshold?: PerformanceThreshold;
  }[];
  recommendations?: string[];
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private measurements: Map<string, number> = new Map();
  private timers: Map<string, number> = new Map();
  private memoryBaseline: number = 0;
  private renderTimings: number[] = [];

  // Performance thresholds
  private thresholds: PerformanceThreshold[] = [
    { name: 'api_request', warning: 2000, critical: 5000, unit: 'ms' },
    { name: 'component_render', warning: 16, critical: 33, unit: 'ms' },
    { name: 'storage_operation', warning: 100, critical: 500, unit: 'ms' },
    { name: 'image_load', warning: 1000, critical: 3000, unit: 'ms' },
    { name: 'memory_usage', warning: 100, critical: 200, unit: 'bytes' },
    { name: 'fps', warning: 55, critical: 30, unit: 'count' },
  ];

  private constructor() {
    this.initializeMonitoring();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeMonitoring(): void {
    // Set baseline memory usage (Note: performance.memory is Chrome-specific)
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      this.memoryBaseline = memory.usedJSHeapSize || 0;
    }

    // Start periodic monitoring
    this.startPeriodicChecks();

    // Monitor React Native bridge events
    this.monitorBridgeEvents();

    logger.info('PerformanceMonitor', 'Performance monitoring initialized');
  }

  private startPeriodicChecks(): void {
    // Check every 30 seconds
    setInterval(() => {
      this.checkMemoryUsage();
      this.checkRenderPerformance();
      this.generateReport();
    }, 30000);
  }

  private monitorBridgeEvents(): void {
    // In production, you would hook into React Native's performance monitoring
    // For now, we'll simulate this
    logger.debug('PerformanceMonitor', 'Bridge monitoring setup complete');
  }

  private checkMemoryUsage(): void {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      const currentMemory = memory.usedJSHeapSize || 0;
      const memoryDelta = currentMemory - this.memoryBaseline;
      
      this.trackMetric('memory_usage', memoryDelta, 'bytes', 'memory');
      
      const threshold = this.getThreshold('memory_usage');
      if (threshold && memoryDelta > threshold.warning) {
        logger.warn('PerformanceMonitor', 'High memory usage detected', {
          current: currentMemory,
          baseline: this.memoryBaseline,
          delta: memoryDelta,
        });
      }
    }
  }

  private checkRenderPerformance(): void {
    if (this.renderTimings.length > 0) {
      const avgRenderTime = this.renderTimings.reduce((a, b) => a + b, 0) / this.renderTimings.length;
      this.trackMetric('average_render_time', avgRenderTime, 'ms', 'rendering');
      
      // Clear render timings after analysis
      this.renderTimings = [];
    }
  }

  private getThreshold(name: string): PerformanceThreshold | undefined {
    return this.thresholds.find(t => t.name === name);
  }

  private getStatus(value: number, threshold?: PerformanceThreshold): 'good' | 'warning' | 'critical' {
    if (!threshold) return 'good';
    
    if (value >= threshold.critical) return 'critical';
    if (value >= threshold.warning) return 'warning';
    return 'good';
  }

  public trackMetric(
    name: string,
    value: number,
    unit: 'ms' | 'bytes' | 'count' | 'percentage',
    category: string
  ): void {
    // Store locally
    this.measurements.set(`${category}_${name}`, value);
    
    // Send to logger
    logger.trackPerformance(name, value, unit, category);
    
    // Check thresholds
    const threshold = this.getThreshold(name);
    const status = this.getStatus(value, threshold);
    
    if (status === 'critical') {
      logger.error('PerformanceMonitor', `Critical performance issue: ${name}`, undefined, {
        value,
        unit,
        category,
        threshold,
      });
    } else if (status === 'warning') {
      logger.warn('PerformanceMonitor', `Performance warning: ${name}`, {
        value,
        unit,
        category,
        threshold,
      });
    }
  }

  public startTimer(name: string): void {
    this.timers.set(name, Date.now());
  }

  public endTimer(name: string, category: string = 'general'): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      logger.warn('PerformanceMonitor', `Timer '${name}' not found`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(name);
    this.trackMetric(name, duration, 'ms', category);
    
    return duration;
  }

  public measureAsync<T>(
    name: string,
    asyncFn: () => Promise<T>,
    category: string = 'async'
  ): Promise<T> {
    return new Promise(async (resolve, reject) => {
      this.startTimer(name);
      try {
        const result = await asyncFn();
        this.endTimer(name, category);
        resolve(result);
      } catch (error) {
        this.endTimer(name, category);
        logger.error('PerformanceMonitor', `Async operation '${name}' failed`, error as Error);
        reject(error);
      }
    });
  }

  public measureSync<T>(
    name: string,
    syncFn: () => T,
    category: string = 'sync'
  ): T {
    this.startTimer(name);
    try {
      const result = syncFn();
      this.endTimer(name, category);
      return result;
    } catch (error) {
      this.endTimer(name, category);
      logger.error('PerformanceMonitor', `Sync operation '${name}' failed`, error as Error);
      throw error;
    }
  }

  public trackRenderTime(componentName: string, renderTime: number): void {
    this.renderTimings.push(renderTime);
    this.trackMetric(`${componentName}_render`, renderTime, 'ms', 'rendering');
  }

  public trackApiCall(
    endpoint: string,
    method: string,
    duration: number,
    status: number
  ): void {
    const metricName = `api_${method.toLowerCase()}_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
    this.trackMetric(metricName, duration, 'ms', 'api');
    
    // Track API success rate
    const successMetric = `${metricName}_success`;
    this.trackMetric(successMetric, status < 400 ? 1 : 0, 'count', 'api');
  }

  public trackStorageOperation(
    operation: 'read' | 'write' | 'delete',
    key: string,
    duration: number,
    size?: number
  ): void {
    this.trackMetric(`storage_${operation}`, duration, 'ms', 'storage');
    
    if (size) {
      this.trackMetric(`storage_${operation}_size`, size, 'bytes', 'storage');
    }
  }

  public trackScreenTransition(fromScreen: string, toScreen: string, duration: number): void {
    const metricName = `navigation_${fromScreen}_to_${toScreen}`;
    this.trackMetric(metricName, duration, 'ms', 'navigation');
  }

  public generateReport(): PerformanceReport {
    const metrics = Array.from(this.measurements.entries()).map(([key, value]) => {
      const [category, ...nameParts] = key.split('_');
      const name = nameParts.join('_');
      const threshold = this.getThreshold(name);
      const unit = threshold?.unit || 'count';
      
      return {
        name,
        value,
        unit,
        status: this.getStatus(value, threshold),
        threshold,
      };
    });

    const report: PerformanceReport = {
      timestamp: new Date().toISOString(),
      category: 'overall',
      metrics,
      recommendations: this.generateRecommendations(metrics),
    };

    // Send critical reports immediately
    const criticalIssues = metrics.filter(m => m.status === 'critical');
    if (criticalIssues.length > 0) {
      logger.error('PerformanceMonitor', 'Critical performance issues detected', undefined, {
        report,
        criticalIssues,
      });
    }

    return report;
  }

  private generateRecommendations(metrics: PerformanceReport['metrics']): string[] {
    const recommendations: string[] = [];
    
    const slowApiCalls = metrics.filter(m => 
      m.name.includes('api_') && m.status !== 'good'
    );
    if (slowApiCalls.length > 0) {
      recommendations.push('Consider implementing request caching and optimizing API endpoints');
    }

    const memoryIssues = metrics.filter(m => 
      m.name.includes('memory') && m.status !== 'good'
    );
    if (memoryIssues.length > 0) {
      recommendations.push('Review memory usage patterns and implement proper cleanup');
    }

    const renderIssues = metrics.filter(m => 
      m.name.includes('render') && m.status !== 'good'
    );
    if (renderIssues.length > 0) {
      recommendations.push('Optimize component rendering with React.memo and useMemo');
    }

    const storageIssues = metrics.filter(m => 
      m.name.includes('storage') && m.status !== 'good'
    );
    if (storageIssues.length > 0) {
      recommendations.push('Consider batching storage operations and using compression');
    }

    return recommendations;
  }

  public getMetrics(): Map<string, number> {
    return new Map(this.measurements);
  }

  public clearMetrics(): void {
    this.measurements.clear();
    logger.info('PerformanceMonitor', 'Performance metrics cleared');
  }

  public addCustomThreshold(threshold: PerformanceThreshold): void {
    const existingIndex = this.thresholds.findIndex(t => t.name === threshold.name);
    if (existingIndex >= 0) {
      this.thresholds[existingIndex] = threshold;
    } else {
      this.thresholds.push(threshold);
    }
    
    logger.info('PerformanceMonitor', 'Custom threshold added', { threshold });
  }

  public exportReport(): string {
    const report = this.generateReport();
    return JSON.stringify(report, null, 2);
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();
export default performanceMonitor;
