import { BundleOptimizer, bundleOptimizer, analyzeBundleSize, generateOptimizationReport, applyOptimizations } from '../../utils/bundleOptimizer';
import { logger } from '../../utils/logger';

// Mock do logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}));

describe('BundleOptimizer', () => {
  let optimizer: BundleOptimizer;

  beforeEach(() => {
    jest.clearAllMocks();
    // Resetar singleton para testes
    (BundleOptimizer as any).instance = undefined;
    optimizer = BundleOptimizer.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = BundleOptimizer.getInstance();
      const instance2 = BundleOptimizer.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should use singleton from exported instance', () => {
      expect(bundleOptimizer).toBeInstanceOf(BundleOptimizer);
    });
  });

  describe('Bundle Analysis', () => {
    it('should analyze bundle size and return stats', async () => {
      const stats = await optimizer.analyzeBundleSize();

      expect(stats).toHaveProperty('totalSize');
      expect(stats).toHaveProperty('jsSize');
      expect(stats).toHaveProperty('assetsSize');
      expect(stats).toHaveProperty('imagesSize');
      expect(stats).toHaveProperty('dependencies');
      expect(stats).toHaveProperty('duplicates');
      expect(stats).toHaveProperty('recommendations');

      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.dependencies).toBeInstanceOf(Array);
      expect(stats.duplicates).toBeInstanceOf(Array);
      expect(stats.recommendations).toBeInstanceOf(Array);
    });

    it('should calculate size distribution correctly', async () => {
      const stats = await optimizer.analyzeBundleSize();

      // JS deve ser ~70% do total
      const jsPercentage = stats.jsSize / stats.totalSize;
      expect(jsPercentage).toBeGreaterThan(0.6);
      expect(jsPercentage).toBeLessThan(0.8);

      // Assets deve ser ~20% do total
      const assetsPercentage = stats.assetsSize / stats.totalSize;
      expect(assetsPercentage).toBeGreaterThan(0.15);
      expect(assetsPercentage).toBeLessThan(0.25);

      // Total deve somar corretamente
      expect(stats.jsSize + stats.assetsSize + stats.imagesSize).toBe(stats.totalSize);
    });

    it('should sort dependencies by size', async () => {
      const stats = await optimizer.analyzeBundleSize();

      for (let i = 0; i < stats.dependencies.length - 1; i++) {
        expect(stats.dependencies[i].size).toBeGreaterThanOrEqual(
          stats.dependencies[i + 1].size
        );
      }
    });

    it('should include known large dependencies', async () => {
      const stats = await optimizer.analyzeBundleSize();
      
      const dependencyNames = stats.dependencies.map(dep => dep.name);
      expect(dependencyNames).toContain('@expo/vector-icons');
      expect(dependencyNames).toContain('expo-av');
      expect(dependencyNames).toContain('@react-navigation/native');
    });

    it('should generate relevant recommendations', async () => {
      const stats = await optimizer.analyzeBundleSize();

      expect(stats.recommendations.length).toBeGreaterThan(0);
      
      // Deve incluir recomendação sobre lazy loading
      const hasLazyLoadingRecommendation = stats.recommendations.some(
        rec => rec.includes('lazy loading')
      );
      expect(hasLazyLoadingRecommendation).toBe(true);
    });

    it('should log analysis progress', async () => {
      await optimizer.analyzeBundleSize();

      expect(logger.info).toHaveBeenCalledWith(
        'BundleOptimizer', 
        'Starting bundle analysis...'
      );
      
      expect(logger.info).toHaveBeenCalledWith(
        'BundleOptimizer', 
        'Bundle analysis completed',
        expect.any(Object)
      );
    });
  });

  describe('Optimization Application', () => {
    beforeEach(async () => {
      // Executar análise primeiro
      await optimizer.analyzeBundleSize();
    });

    it('should apply high-priority optimizations', async () => {
      const result = await optimizer.applyOptimizations();

      expect(result).toHaveProperty('applied');
      expect(result).toHaveProperty('savings');
      expect(result.applied).toBeInstanceOf(Array);
      expect(result.savings).toBeGreaterThan(0);
    });

    it('should log optimization progress', async () => {
      await optimizer.applyOptimizations();

      expect(logger.info).toHaveBeenCalledWith(
        'BundleOptimizer', 
        'Starting automatic optimizations...'
      );
      
      expect(logger.info).toHaveBeenCalledWith(
        'BundleOptimizer', 
        'Optimizations applied',
        expect.any(Object)
      );
    });
  });

  describe('Report Generation', () => {
    it('should return message when no analysis available', () => {
      const report = optimizer.generateOptimizationReport();
      
      expect(report).toContain('No analysis results available');
      expect(report).toContain('Run analyzeBundleSize() first');
    });

    it('should generate comprehensive report after analysis', async () => {
      await optimizer.analyzeBundleSize();
      const report = optimizer.generateOptimizationReport();

      expect(report).toContain('Bundle Optimization Report');
      expect(report).toContain('Current Bundle Stats');
      expect(report).toContain('Total Size');
      expect(report).toContain('JavaScript');
      expect(report).toContain('Assets');
      expect(report).toContain('Images');
      expect(report).toContain('Optimization Opportunities');
      expect(report).toContain('Top Dependencies');
      expect(report).toContain('Recommendations');
      expect(report).toContain('Optimization Targets');
    });

    it('should include size calculations in MB', async () => {
      await optimizer.analyzeBundleSize();
      const report = optimizer.generateOptimizationReport();

      expect(report).toMatch(/\d+\.\d+MB/); // Should contain size in MB format
    });
  });

  describe('Configuration Management', () => {
    it('should provide development configuration', () => {
      const config = optimizer.getOptimizationConfig('development');

      expect(config).toHaveProperty('minify', false);
      expect(config).toHaveProperty('sourceMap', true);
      expect(config).toHaveProperty('bundleAnalyzer', true);
      expect(config).toHaveProperty('lazyLoading', false);
    });

    it('should provide production configuration', () => {
      const config = optimizer.getOptimizationConfig('production');

      expect(config).toHaveProperty('minify', true);
      expect(config).toHaveProperty('sourceMap', false);
      expect(config).toHaveProperty('bundleAnalyzer', false);
      expect(config).toHaveProperty('lazyLoading', true);
      expect(config).toHaveProperty('treeShaking', true);
      expect(config).toHaveProperty('compression', true);
    });
  });

  describe('Bundle Evolution Tracking', () => {
    it('should start evolution tracking', () => {
      optimizer.trackBundleEvolution();

      expect(logger.info).toHaveBeenCalledWith(
        'BundleOptimizer', 
        'Bundle evolution tracking started'
      );
    });
  });

  describe('Utility Functions', () => {
    it('should export analyzeBundleSize function', async () => {
      const stats = await analyzeBundleSize();
      
      expect(stats).toHaveProperty('totalSize');
      expect(stats).toHaveProperty('dependencies');
    });

    it('should export generateOptimizationReport function', async () => {
      await analyzeBundleSize(); // Precisa executar análise primeiro
      const report = generateOptimizationReport();
      
      expect(report).toContain('Bundle Optimization Report');
    });

    it('should export applyOptimizations function', async () => {
      await analyzeBundleSize(); // Precisa executar análise primeiro
      const result = await applyOptimizations();
      
      expect(result).toHaveProperty('applied');
      expect(result).toHaveProperty('savings');
    });
  });

  describe('Error Handling', () => {
    it('should handle analysis errors gracefully', async () => {
      // Mock error in dependencies analysis
      const originalMethod = (optimizer as any).analyzeDependencies;
      (optimizer as any).analyzeDependencies = jest.fn().mockRejectedValue(new Error('Analysis failed'));

      await expect(optimizer.analyzeBundleSize()).rejects.toThrow('Analysis failed');
      
      expect(logger.error).toHaveBeenCalledWith(
        'BundleOptimizer', 
        expect.stringContaining('Failed to analyze bundle')
      );

      // Restore original method
      (optimizer as any).analyzeDependencies = originalMethod;
    });

    it('should handle optimization errors gracefully', async () => {
      // Mock error in optimization application
      const originalTargets = (optimizer as any).optimizationTargets;
      (optimizer as any).optimizationTargets = null; // Force error

      await expect(optimizer.applyOptimizations()).rejects.toThrow();
      
      expect(logger.error).toHaveBeenCalledWith(
        'BundleOptimizer', 
        expect.stringContaining('Failed to apply optimizations')
      );

      // Restore
      (optimizer as any).optimizationTargets = originalTargets;
    });
  });
});
