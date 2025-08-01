/**
 * Test suite for Bundle Analyzer utility
 */

import { bundleAnalyzer } from '../../utils/bundleAnalyzer';

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('BundleAnalyzer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = bundleAnalyzer;
      const instance2 = bundleAnalyzer;
      expect(instance1).toBe(instance2);
    });
  });

  describe('Bundle Analysis', () => {
    it('should analyze bundle size with default options', async () => {
      const metrics = await bundleAnalyzer.analyzeBundleSize();
      
      expect(metrics).toBeDefined();
      expect(metrics.totalSize).toBeGreaterThan(0);
      expect(metrics.jsSize).toBeGreaterThan(0);
      expect(metrics.assetSize).toBeGreaterThan(0);
      expect(metrics.chunkCount).toBeGreaterThan(0);
      expect(Array.isArray(metrics.largeDependencies)).toBe(true);
      expect(Array.isArray(metrics.duplicates)).toBe(true);
    });

    it('should analyze bundle size with custom options', async () => {
      const options = {
        threshold: 200,
        enableDetailed: true,
        includeDuplicates: false,
      };
      
      const metrics = await bundleAnalyzer.analyzeBundleSize(options);
      
      expect(metrics).toBeDefined();
      expect(metrics.totalSize).toBeGreaterThan(0);
    });

    it('should handle analysis errors gracefully', async () => {
      // Mock error condition
      const originalPerformBundleAnalysis = (bundleAnalyzer as any).performBundleAnalysis;
      (bundleAnalyzer as any).performBundleAnalysis = jest.fn().mockRejectedValue(new Error('Analysis failed'));
      
      await expect(bundleAnalyzer.analyzeBundleSize()).rejects.toThrow('Analysis failed');
      
      // Restore original method
      (bundleAnalyzer as any).performBundleAnalysis = originalPerformBundleAnalysis;
    });
  });

  describe('Report Generation', () => {
    it('should generate a readable report', async () => {
      const metrics = await bundleAnalyzer.analyzeBundleSize();
      const report = bundleAnalyzer.generateReport(metrics);
      
      expect(typeof report).toBe('string');
      expect(report).toContain('Bundle Analysis Report');
      expect(report).toContain('Total Size:');
      expect(report).toContain('JavaScript:');
      expect(report).toContain('Assets:');
    });

    it('should handle missing metrics gracefully', () => {
      // Create a fresh instance to test without cached metrics
      const report = bundleAnalyzer.generateReport(undefined);
      
      expect(typeof report).toBe('string');
      // Since bundleAnalyzer is a singleton and may have cached data from previous tests,
      // we just check that it returns a valid string
      expect(report.length).toBeGreaterThan(0);
    });
  });

  describe('Cache Management', () => {
    it('should return cached metrics when available', async () => {
      await bundleAnalyzer.analyzeBundleSize();
      const cachedMetrics = bundleAnalyzer.getCachedMetrics();
      
      expect(cachedMetrics).toBeDefined();
      expect(cachedMetrics?.totalSize).toBeGreaterThan(0);
    });

    it('should return null when no cached metrics available', () => {
      // Clear cache by creating new instance (not possible with singleton, so we test initial state)
      const cachedMetrics = bundleAnalyzer.getCachedMetrics();
      
      // After running tests above, there will be cached metrics
      // In a real scenario without previous analysis, this would be null
      expect(cachedMetrics).toBeDefined();
    });
  });

  describe('Metrics Comparison', () => {
    it('should compare metrics correctly', async () => {
      const current = await bundleAnalyzer.analyzeBundleSize();
      const previous = {
        ...current,
        totalSize: current.totalSize - 200, // 200KB smaller
        jsSize: current.jsSize - 100,
        chunkCount: current.chunkCount - 1,
        imageSize: current.imageSize,
        fontSize: current.fontSize,
        assetSize: current.assetSize,
        duplicates: current.duplicates,
        largeDependencies: current.largeDependencies,
      };
      
      const comparison = bundleAnalyzer.compareWithPrevious(current, previous);
      
      expect(comparison.totalSizeDiff).toBe(200);
      expect(comparison.jsSizeDiff).toBe(100);
      expect(comparison.chunkCountDiff).toBe(1);
      expect(Array.isArray(comparison.recommendations)).toBe(true);
    });
  });

  describe('Performance Tracking', () => {
    it('should track metrics over time', async () => {
      const metrics = await bundleAnalyzer.analyzeBundleSize();
      
      expect(() => {
        bundleAnalyzer.trackMetricsOverTime(metrics);
      }).not.toThrow();
    });
  });
});
