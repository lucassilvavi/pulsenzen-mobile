import { 
  useMemoizedContextValue, 
  useStableCallback, 
  usePerformanceMonitor,
  useDebouncedValue,
  useThrottledValue 
} from '../../hooks/usePerformanceOptimization';

// Mock React hooks for testing
const mockUseCallback = jest.fn();
const mockUseMemo = jest.fn();
const mockUseRef = jest.fn(() => ({ current: null }));

jest.mock('react', () => ({
  useCallback: (...args: any[]) => mockUseCallback(...args),
  useMemo: (...args: any[]) => mockUseMemo(...args),
  useRef: () => mockUseRef(),
  useEffect: jest.fn(),
}));

describe('Performance Optimization Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCallback.mockImplementation((fn) => fn);
    mockUseMemo.mockImplementation((fn) => fn());
  });

  describe('Hook Exports', () => {
    it('should export all performance optimization hooks', () => {
      expect(typeof useMemoizedContextValue).toBe('function');
      expect(typeof useStableCallback).toBe('function');
      expect(typeof usePerformanceMonitor).toBe('function');
      expect(typeof useDebouncedValue).toBe('function');
      expect(typeof useThrottledValue).toBe('function');
    });
  });

  describe('useMemoizedContextValue', () => {
    it('should call useMemo with correct dependencies', () => {
      const testValue = { test: 'value' };
      useMemoizedContextValue(testValue);
      
      expect(mockUseMemo).toHaveBeenCalledWith(
        expect.any(Function),
        [testValue]
      );
    });
  });

  describe('useStableCallback', () => {
    it('should call useCallback with empty dependencies', () => {
      const testCallback = jest.fn();
      useStableCallback(testCallback);
      
      expect(mockUseCallback).toHaveBeenCalledWith(
        expect.any(Function),
        []
      );
    });
  });

  describe('usePerformanceMonitor', () => {
    it('should return performance monitoring interface', () => {
      const monitor = usePerformanceMonitor('TestComponent');
      
      expect(monitor).toHaveProperty('renderStart');
      expect(monitor).toHaveProperty('renderEnd');
      expect(monitor).toHaveProperty('getRenderTime');
      expect(typeof monitor.renderStart).toBe('function');
      expect(typeof monitor.renderEnd).toBe('function');
      expect(typeof monitor.getRenderTime).toBe('function');
    });
  });
});