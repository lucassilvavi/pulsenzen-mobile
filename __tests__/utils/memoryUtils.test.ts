import { BundleAnalyzer, MemoryUtils } from '../../utils/memoryUtils';

// Mock timers
jest.useFakeTimers();

describe('MemoryUtils', () => {
  describe('Module exports', () => {
    it('should export useDebounce hook', () => {
      expect(typeof MemoryUtils.useDebounce).toBe('function');
    });

    it('should export useThrottle hook', () => {
      expect(typeof MemoryUtils.useThrottle).toBe('function');
    });

    it('should export useCleanup hook', () => {
      expect(typeof MemoryUtils.useCleanup).toBe('function');
    });

    it('should export useInterval hook', () => {
      expect(typeof MemoryUtils.useInterval).toBe('function');
    });

    it('should export useImagePreloader hook', () => {
      expect(typeof MemoryUtils.useImagePreloader).toBe('function');
    });

    it('should export usePerformanceMonitor hook', () => {
      expect(typeof MemoryUtils.usePerformanceMonitor).toBe('function');
    });

    it('should export useVirtualList hook', () => {
      expect(typeof MemoryUtils.useVirtualList).toBe('function');
    });

    it('should export BundleAnalyzer', () => {
      expect(typeof MemoryUtils.BundleAnalyzer).toBe('object');
    });
  });

  describe('useVirtualList (static function)', () => {
    it('should calculate visible items correctly', () => {
      const items = Array.from({ length: 100 }, (_, i) => `Item ${i}`);
      const itemHeight = 50;
      const containerHeight = 300;

      const result = MemoryUtils.useVirtualList(items, itemHeight, containerHeight);

      expect(result.visibleItems).toBeDefined();
      expect(Array.isArray(result.visibleItems)).toBe(true);
      expect(typeof result.startIndex).toBe('number');
      expect(typeof result.endIndex).toBe('number');
      expect(typeof result.scrollOffset).toBe('number');
    });

    it('should handle empty items array', () => {
      const items: string[] = [];
      const itemHeight = 50;
      const containerHeight = 300;

      const result = MemoryUtils.useVirtualList(items, itemHeight, containerHeight);

      expect(result.visibleItems).toEqual([]);
      expect(result.startIndex).toBe(0);
      expect(result.endIndex).toBe(-1);
    });
  });

  describe('BundleAnalyzer', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should have logComponentSize method', () => {
      expect(typeof BundleAnalyzer.logComponentSize).toBe('function');
    });

    it('should have logMemoryUsage method', () => {
      expect(typeof BundleAnalyzer.logMemoryUsage).toBe('function');
    });

    it('should call logComponentSize without errors', () => {
      const props = { name: 'test', value: 123 };
      expect(() => {
        BundleAnalyzer.logComponentSize('TestComponent', props);
      }).not.toThrow();
    });

    it('should call logMemoryUsage without errors', () => {
      expect(() => {
        BundleAnalyzer.logMemoryUsage('TestLocation');
      }).not.toThrow();
    });
  });
});

afterEach(() => {
  jest.clearAllTimers();
});
