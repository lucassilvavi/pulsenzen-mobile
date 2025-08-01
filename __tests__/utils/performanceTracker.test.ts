import { 
  PerformanceTracker, 
  PerformanceTimer, 
  performanceTracker,
  startTiming,
  recordMetric,
  getMetricStats,
  getPerformanceReport
} from '../../utils/performanceTracker';
import { logger } from '../../utils/logger';

// Mock do logger
jest.mock('../../utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

// Mock do performance.now
global.performance = {
  now: jest.fn()
} as any;

describe('PerformanceTracker', () => {
  let tracker: PerformanceTracker;
  let mockPerformanceNow: jest.MockedFunction<() => number>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow = performance.now as jest.MockedFunction<() => number>;
    mockPerformanceNow.mockReturnValue(1000); // Base time
    
    // Reset singleton para testes
    (PerformanceTracker as any).instance = undefined;
    tracker = PerformanceTracker.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = PerformanceTracker.getInstance();
      const instance2 = PerformanceTracker.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should use singleton from exported instance', () => {
      expect(performanceTracker).toBeInstanceOf(PerformanceTracker);
    });
  });

  describe('Metric Recording', () => {
    it('should record basic metrics', () => {
      tracker.recordMetric('test-metric', 50.5, { test: 'data' });

      const stats = tracker.getMetricStats('test-metric');
      expect(stats).not.toBeNull();
      expect(stats!.count).toBe(1);
      expect(stats!.average).toBe(50.5);
      expect(stats!.min).toBe(50.5);
      expect(stats!.max).toBe(50.5);
    });

    it('should calculate statistics correctly for multiple metrics', () => {
      const values = [10, 20, 30, 40, 50];
      
      values.forEach(value => {
        tracker.recordMetric('multi-test', value);
      });

      const stats = tracker.getMetricStats('multi-test');
      expect(stats).not.toBeNull();
      expect(stats!.count).toBe(5);
      expect(stats!.average).toBe(30);
      expect(stats!.min).toBe(10);
      expect(stats!.max).toBe(50);
      expect(stats!.median).toBe(30);
    });

    it('should limit metrics to 100 entries per metric', () => {
      // Add 150 metrics
      for (let i = 0; i < 150; i++) {
        tracker.recordMetric('limit-test', i);
      }

      const stats = tracker.getMetricStats('limit-test');
      expect(stats!.count).toBe(100);
      // Should have the last 100 values (50-149)
      expect(stats!.min).toBe(50);
      expect(stats!.max).toBe(149);
    });

    it('should handle empty metrics gracefully', () => {
      const stats = tracker.getMetricStats('non-existent');
      expect(stats).toBeNull();
    });
  });

  describe('Timing Operations', () => {
    it('should measure timing correctly', () => {
      mockPerformanceNow
        .mockReturnValueOnce(1000) // Start time
        .mockReturnValueOnce(1050); // End time

      const timer = tracker.startTiming('timing-test');
      timer.end();

      const stats = tracker.getMetricStats('timing-test');
      expect(stats).not.toBeNull();
      expect(stats!.average).toBe(50);
    });

    it('should handle timing with metadata', () => {
      mockPerformanceNow
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1025);

      const timer = tracker.startTiming('metadata-test');
      timer.end({ component: 'TestComponent', props: 'test' });

      const stats = tracker.getMetricStats('metadata-test');
      expect(stats!.average).toBe(25);
    });

    it('should not record when disabled', () => {
      tracker.setEnabled(false);
      
      const timer = tracker.startTiming('disabled-test');
      timer.end();

      const stats = tracker.getMetricStats('disabled-test');
      expect(stats).toBeNull();

      tracker.setEnabled(true);
    });
  });

  describe('Component Metrics', () => {
    it('should track component render metrics', () => {
      tracker.recordMetric('component-render', 15);
      tracker.recordMetric('component-render', 25);
      tracker.recordMetric('component-render', 10);

      const componentMetrics = tracker.getComponentMetrics('component-render');
      expect(componentMetrics).not.toBeNull();
      expect(componentMetrics!.renderCount).toBe(3);
      expect(componentMetrics!.averageRenderTime).toBeCloseTo(16.67, 1);
      expect(componentMetrics!.slowRenders).toBe(1); // Only the 25ms render
    });

    it('should count slow renders correctly', () => {
      tracker.recordMetric('slow-component-render', 20); // Slow
      tracker.recordMetric('slow-component-render', 10); // Fast
      tracker.recordMetric('slow-component-render', 30); // Slow

      const componentMetrics = tracker.getComponentMetrics('slow-component-render');
      expect(componentMetrics!.slowRenders).toBe(2);
      expect(componentMetrics!.renderCount).toBe(3);
    });
  });

  describe('Threshold Monitoring', () => {
    it('should trigger warning for exceeded thresholds', () => {
      tracker.recordMetric('component-render', 20); // Above 16ms warning

      expect(logger.warn).toHaveBeenCalledWith(
        'PerformanceTracker',
        expect.stringContaining('Performance warning: component-render')
      );
    });

    it('should trigger critical alert for exceeded critical thresholds', () => {
      tracker.recordMetric('component-render', 40); // Above 33ms critical

      expect(logger.error).toHaveBeenCalledWith(
        'PerformanceTracker',
        expect.stringContaining('Critical performance issue: component-render')
      );
    });

    it('should allow custom thresholds', () => {
      tracker.setThreshold('custom-metric', { warning: 100, critical: 200 });
      
      tracker.recordMetric('custom-metric', 150); // Should trigger warning

      expect(logger.warn).toHaveBeenCalledWith(
        'PerformanceTracker',
        expect.stringContaining('Performance warning: custom-metric')
      );
    });

    it('should categorize unknown metrics correctly', () => {
      tracker.recordMetric('api-call-test', 3000); // Should use api-request category

      expect(logger.warn).toHaveBeenCalledWith(
        'PerformanceTracker',
        expect.stringContaining('Performance warning: api-call-test')
      );
    });
  });

  describe('Performance Reports', () => {
    it('should generate comprehensive report', () => {
      tracker.recordMetric('test-metric', 10);
      tracker.recordMetric('test-metric', 20);
      tracker.recordMetric('component-render', 15);

      const report = tracker.getPerformanceReport();
      
      expect(report).toContain('# Performance Report');
      expect(report).toContain('## General Metrics');
      expect(report).toContain('test-metric');
      expect(report).toContain('component-render');
      expect(report).toContain('## Component Metrics');
    });

    it('should handle empty metrics in report', () => {
      const report = tracker.getPerformanceReport();
      
      expect(report).toContain('# Performance Report');
      expect(report).toContain('## General Metrics');
    });
  });

  describe('Data Management', () => {
    it('should clear all metrics', () => {
      tracker.recordMetric('test1', 10);
      tracker.recordMetric('test2', 20);

      tracker.clear();

      expect(tracker.getMetricStats('test1')).toBeNull();
      expect(tracker.getMetricStats('test2')).toBeNull();
    });

    it('should export data correctly', () => {
      tracker.recordMetric('export-test', 15);
      tracker.recordMetric('component-render', 20);

      const data = tracker.exportData();

      expect(data).toHaveProperty('metrics');
      expect(data).toHaveProperty('componentMetrics');
      expect(data).toHaveProperty('timestamp');
      expect(data.metrics['export-test']).toHaveLength(1);
      expect(data.componentMetrics['component-render']).toBeDefined();
    });
  });

  describe('Enable/Disable Functionality', () => {
    it('should respect enabled state', () => {
      tracker.setEnabled(false);
      tracker.recordMetric('disabled-test', 10);

      expect(tracker.getMetricStats('disabled-test')).toBeNull();

      tracker.setEnabled(true);
      tracker.recordMetric('enabled-test', 10);

      expect(tracker.getMetricStats('enabled-test')).not.toBeNull();
    });

    it('should log state changes', () => {
      tracker.setEnabled(false);
      expect(logger.info).toHaveBeenCalledWith(
        'PerformanceTracker',
        'Performance tracking disabled'
      );

      tracker.setEnabled(true);
      expect(logger.info).toHaveBeenCalledWith(
        'PerformanceTracker',
        'Performance tracking enabled'
      );
    });
  });

  describe('Utility Functions', () => {
    it('should provide utility functions', () => {
      expect(typeof startTiming).toBe('function');
      expect(typeof recordMetric).toBe('function');
      expect(typeof getMetricStats).toBe('function');
      expect(typeof getPerformanceReport).toBe('function');
    });

    it('should work through utility functions', () => {
      recordMetric('utility-test', 25);
      
      const stats = getMetricStats('utility-test');
      expect(stats).not.toBeNull();
      expect(stats!.average).toBe(25);
    });

    it('should generate report through utility function', () => {
      recordMetric('utility-test', 25);
      
      const report = getPerformanceReport();
      expect(report).toContain('utility-test');
    });
  });
});

describe('PerformanceTimer', () => {
  it('should execute callback when enabled', () => {
    const mockCallback = jest.fn();
    const timer = new PerformanceTimer('test', mockCallback, true);
    
    timer.end({ test: 'metadata' });
    
    expect(mockCallback).toHaveBeenCalledWith({ test: 'metadata' });
  });

  it('should not execute callback when disabled', () => {
    const mockCallback = jest.fn();
    const timer = new PerformanceTimer('test', mockCallback, false);
    
    timer.end({ test: 'metadata' });
    
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should handle end without metadata', () => {
    const mockCallback = jest.fn();
    const timer = new PerformanceTimer('test', mockCallback, true);
    
    timer.end();
    
    expect(mockCallback).toHaveBeenCalledWith(undefined);
  });
});
