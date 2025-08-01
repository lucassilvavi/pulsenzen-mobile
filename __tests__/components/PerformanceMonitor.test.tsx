import { PerformanceMonitor, withPerformanceMonitoring } from '../../components/PerformanceMonitor';

describe('PerformanceMonitor Components', () => {
  describe('PerformanceMonitor', () => {
    it('should export PerformanceMonitor component', () => {
      expect(typeof PerformanceMonitor).toBe('function');
    });
  });

  describe('withPerformanceMonitoring', () => {
    it('should export withPerformanceMonitoring HOC', () => {
      expect(typeof withPerformanceMonitoring).toBe('function');
    });

    it('should return a function when called', () => {
      const TestComponent = () => null;
      const WrappedComponent = withPerformanceMonitoring(TestComponent, { componentName: 'Test' });
      expect(typeof WrappedComponent).toBe('function');
    });

    it('should accept options object', () => {
      const TestComponent = () => null;
      const WrappedComponent = withPerformanceMonitoring(TestComponent, { 
        componentName: 'Test',
        threshold: 50,
        enabled: true 
      });
      expect(typeof WrappedComponent).toBe('function');
    });
  });
});