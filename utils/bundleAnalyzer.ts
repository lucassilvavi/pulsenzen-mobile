/**
 * Bundle Analyzer - Analyze app bundle size and performance
 */

import { logger } from './logger';

export interface BundleMetrics {
  totalSize: number;
  jsSize: number;
  assetSize: number;
  imageSize: number;
  fontSize: number;
  chunkCount: number;
  duplicates: string[];
  largeDependencies: Array<{
    name: string;
    size: number;
    percentage: number;
  }>;
}

export interface BundleAnalysisOptions {
  threshold?: number; // Size threshold in KB
  enableDetailed?: boolean;
  includeDuplicates?: boolean;
  outputPath?: string;
}

class BundleAnalyzer {
  private static instance: BundleAnalyzer;
  private metrics: BundleMetrics | null = null;
  private isAnalyzing = false;

  private constructor() {}

  static getInstance(): BundleAnalyzer {
    if (!BundleAnalyzer.instance) {
      BundleAnalyzer.instance = new BundleAnalyzer();
    }
    return BundleAnalyzer.instance;
  }

  /**
   * Analyze current bundle metrics
   */
  async analyzeBundleSize(options: BundleAnalysisOptions = {}): Promise<BundleMetrics> {
    if (this.isAnalyzing) {
      throw new Error('Bundle analysis already in progress');
    }

    this.isAnalyzing = true;

    try {
      const { threshold = 100, enableDetailed = true, includeDuplicates = true } = options;

      logger.info('BundleAnalyzer', 'Starting bundle analysis...', { threshold, enableDetailed });

      // Simulate bundle analysis (in real app, this would use Metro bundler APIs)
      const metrics: BundleMetrics = await this.performBundleAnalysis({
        threshold,
        enableDetailed,
        includeDuplicates,
      });

      this.metrics = metrics;

      // Log warnings for large bundles
      if (metrics.totalSize > 5000) { // 5MB threshold
        logger.warn('BundleAnalyzer', 'Large bundle size detected', {
          totalSize: metrics.totalSize,
          recommendation: 'Consider code splitting and lazy loading',
        });
      }

      // Identify optimization opportunities
      const optimizations = this.identifyOptimizations(metrics);
      if (optimizations.length > 0) {
        logger.info('BundleAnalyzer', 'Bundle optimization opportunities found', {
          count: optimizations.length,
          optimizations,
        });
      }

      return metrics;
    } catch (error) {
      logger.error('BundleAnalyzer', 'Bundle analysis failed', error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      this.isAnalyzing = false;
    }
  }

  /**
   * Get cached bundle metrics
   */
  getCachedMetrics(): BundleMetrics | null {
    return this.metrics;
  }

  /**
   * Generate bundle report
   */
  generateReport(metrics?: BundleMetrics): string {
    const data = metrics || this.metrics;
    if (!data) {
      return 'No bundle metrics available. Run analyzeBundleSize() first.';
    }

    const report = [
      '📊 Bundle Analysis Report',
      '========================',
      `Total Size: ${this.formatSize(data.totalSize)}`,
      `JavaScript: ${this.formatSize(data.jsSize)} (${this.getPercentage(data.jsSize, data.totalSize)}%)`,
      `Assets: ${this.formatSize(data.assetSize)} (${this.getPercentage(data.assetSize, data.totalSize)}%)`,
      `Images: ${this.formatSize(data.imageSize)} (${this.getPercentage(data.imageSize, data.totalSize)}%)`,
      `Fonts: ${this.formatSize(data.fontSize)} (${this.getPercentage(data.fontSize, data.totalSize)}%)`,
      `Chunks: ${data.chunkCount}`,
      '',
      '🔍 Large Dependencies:',
      ...data.largeDependencies.map(
        dep => `  - ${dep.name}: ${this.formatSize(dep.size)} (${dep.percentage}%)`
      ),
    ];

    if (data.duplicates.length > 0) {
      report.push('');
      report.push('⚠️  Duplicate Dependencies:');
      report.push(...data.duplicates.map(dup => `  - ${dup}`));
    }

    return report.join('\n');
  }

  /**
   * Identify optimization opportunities
   */
  private identifyOptimizations(metrics: BundleMetrics): string[] {
    const optimizations: string[] = [];

    // Check for large dependencies
    const largeDeps = metrics.largeDependencies.filter(dep => dep.size > 500); // 500KB
    if (largeDeps.length > 0) {
      optimizations.push(`Consider tree-shaking or alternatives for large dependencies: ${largeDeps.map(d => d.name).join(', ')}`);
    }

    // Check for duplicates
    if (metrics.duplicates.length > 0) {
      optimizations.push('Remove duplicate dependencies to reduce bundle size');
    }

    // Check for large asset sizes
    if (metrics.imageSize > 2000) { // 2MB
      optimizations.push('Optimize images (compression, WebP format, lazy loading)');
    }

    // Check for excessive chunks
    if (metrics.chunkCount > 20) {
      optimizations.push('Consider consolidating chunks to reduce network overhead');
    } else if (metrics.chunkCount < 3) {
      optimizations.push('Consider code splitting for better caching and loading');
    }

    return optimizations;
  }

  /**
   * Perform actual bundle analysis
   */
  private async performBundleAnalysis(options: {
    threshold: number;
    enableDetailed: boolean;
    includeDuplicates: boolean;
  }): Promise<BundleMetrics> {
    // In a real implementation, this would:
    // 1. Read Metro bundle output
    // 2. Parse source maps
    // 3. Analyze dependency tree
    // 4. Calculate actual sizes

    // For now, simulate realistic metrics
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockMetrics: BundleMetrics = {
          totalSize: 3200, // 3.2MB
          jsSize: 2400,    // 2.4MB
          assetSize: 600,  // 600KB
          imageSize: 400,  // 400KB
          fontSize: 200,   // 200KB
          chunkCount: 8,
          duplicates: options.includeDuplicates ? ['lodash', 'moment'] : [],
          largeDependencies: [
            { name: 'react-native', size: 800, percentage: 25 },
            { name: '@expo/vector-icons', size: 400, percentage: 12.5 },
            { name: 'react-navigation', size: 300, percentage: 9.4 },
            { name: 'lodash', size: 200, percentage: 6.3 },
            { name: 'moment', size: 150, percentage: 4.7 },
          ],
        };

        resolve(mockMetrics);
      }, 1000);
    });
  }

  /**
   * Format size in human-readable format
   */
  private formatSize(sizeInKB: number): string {
    if (sizeInKB < 1024) {
      return `${sizeInKB.toFixed(1)} KB`;
    }
    return `${(sizeInKB / 1024).toFixed(1)} MB`;
  }

  /**
   * Calculate percentage
   */
  private getPercentage(part: number, total: number): string {
    return ((part / total) * 100).toFixed(1);
  }

  /**
   * Track bundle metrics over time
   */
  trackMetricsOverTime(metrics: BundleMetrics): void {
    const timestamp = new Date().toISOString();
    
    logger.info('BundleAnalyzer', 'Bundle metrics tracked', {
      timestamp,
      totalSize: metrics.totalSize,
      jsSize: metrics.jsSize,
      chunkCount: metrics.chunkCount,
    });

    // In a real implementation, store in analytics or local storage
  }

  /**
   * Compare with previous metrics
   */
  compareWithPrevious(current: BundleMetrics, previous: BundleMetrics): {
    totalSizeDiff: number;
    jsSizeDiff: number;
    chunkCountDiff: number;
    recommendations: string[];
  } {
    const totalSizeDiff = current.totalSize - previous.totalSize;
    const jsSizeDiff = current.jsSize - previous.jsSize;
    const chunkCountDiff = current.chunkCount - previous.chunkCount;

    const recommendations: string[] = [];

    if (totalSizeDiff > 100) { // 100KB increase
      recommendations.push('Bundle size increased significantly. Review recent changes.');
    }

    if (jsSizeDiff > 50) { // 50KB increase
      recommendations.push('JavaScript bundle size increased. Check for new dependencies.');
    }

    if (chunkCountDiff > 2) {
      recommendations.push('Number of chunks increased. Verify code splitting strategy.');
    }

    return {
      totalSizeDiff,
      jsSizeDiff,
      chunkCountDiff,
      recommendations,
    };
  }
}

// Export singleton instance
export const bundleAnalyzer = BundleAnalyzer.getInstance();
