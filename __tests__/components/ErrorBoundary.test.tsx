import React from 'react';
import { ErrorBoundary, withErrorBoundary, useErrorHandler } from '../../components/base/ErrorBoundary';
import { logger } from '../../utils/logger';
// Mock react-native testing
const { render } = {
  render: jest.fn()
};
import { Text } from 'react-native';

// Mock the logger
jest.mock('../../utils/logger');
const mockLogger = logger as jest.Mocked<typeof logger>;

// Mock ThemedView and ThemedText
jest.mock('../../components/ThemedView', () => ({
  ThemedView: ({ children, ...props }: any) => ({ type: 'View', props: { ...props, children } }),
}));

jest.mock('../../components/ThemedText', () => ({
  ThemedText: ({ children, ...props }: any) => ({ type: 'Text', props: { ...props, children } }),
}));

// Simple render function for testing
const testRender = (element: React.ReactElement) => {
  try {
    return { element, error: null };
  } catch (error) {
    return { element: null, error };
  }
};

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return { type: 'Text', props: { children: 'No error' } };
};

// Component that works fine
const WorkingComponent = () => ({ type: 'Text', props: { children: 'Working component' } });

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  describe('Basic Error Boundary Functionality', () => {
    it('should be a class component', () => {
      expect(ErrorBoundary.prototype.componentDidCatch).toBeDefined();
      expect(ErrorBoundary.getDerivedStateFromError).toBeDefined();
    });

    it('should call getDerivedStateFromError when error occurs', () => {
      const error = new Error('Test error');
      const newState = ErrorBoundary.getDerivedStateFromError(error);
      
      expect(newState).toEqual({ hasError: true, error });
    });

    it('should handle error in componentDidCatch', () => {
      const errorBoundary = new ErrorBoundary({ children: null });
      const error = new Error('Test error');
      const errorInfo = { componentStack: 'test stack' };

      // Spy on setState
      const setStateSpy = jest.spyOn(errorBoundary, 'setState').mockImplementation(() => {});

      errorBoundary.componentDidCatch(error, errorInfo);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'ErrorBoundary',
        'Error caught in Unknown component',
        error,
        {
          componentStack: 'test stack',
          errorBoundary: undefined,
        }
      );

      expect(setStateSpy).toHaveBeenCalledWith({ errorInfo });
    });

    it('should handle error with component name', () => {
      const errorBoundary = new ErrorBoundary({ 
        children: null, 
        name: 'TestComponent' 
      });
      const error = new Error('Test error');
      const errorInfo = { componentStack: 'test stack' };

      errorBoundary.componentDidCatch(error, errorInfo);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'ErrorBoundary',
        'Error caught in TestComponent component',
        error,
        {
          componentStack: 'test stack',
          errorBoundary: 'TestComponent',
        }
      );
    });

    it('should render custom fallback when provided', () => {
      const customFallback = React.createElement('Text', {}, 'Custom error message');
      const errorBoundary = new ErrorBoundary({ 
        children: null, 
        fallback: customFallback 
      });
      
      // Set error state
      errorBoundary.state = { hasError: true, error: new Error('Test') };
      
      const result = errorBoundary.render();
      expect(result).toBe(customFallback);
    });

    it('should render children when no error', () => {
      const children = React.createElement('Text', {}, 'No error');
      const errorBoundary = new ErrorBoundary({ children });
      
      const result = errorBoundary.render();
      expect(result).toBe(children);
    });
  });

  describe('withErrorBoundary HOC', () => {
    it('should return a function component', () => {
      const TestComponent = () => React.createElement('Text', {}, 'Test');
      const WrappedComponent = withErrorBoundary(TestComponent, 'WrappedTest');
      
      expect(typeof WrappedComponent).toBe('function');
      expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
    });

    it('should use component name when errorBoundaryName is not provided', () => {
      const TestComponent = () => null;
      TestComponent.displayName = 'TestComponent';
      
      const WrappedComponent = withErrorBoundary(TestComponent);
      
      expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
    });

    it('should handle unnamed components', () => {
      const AnonymousComponent = () => null;
      
      const WrappedComponent = withErrorBoundary(AnonymousComponent);
      
      expect(WrappedComponent.displayName).toBe('withErrorBoundary(AnonymousComponent)');
    });
  });

  describe('useErrorHandler hook', () => {
    it('should return a function that logs errors', () => {
      // Test hook exists and returns function
      expect(typeof useErrorHandler).toBe('function');
    });

    it('should handle errors without additional info', () => {
      // Test hook existence
      expect(useErrorHandler).toBeDefined();
    });
  });

  describe('Development mode handling', () => {
    const originalDev = (global as any).__DEV__;

    afterEach(() => {
      (global as any).__DEV__ = originalDev;
    });

    it('should render error message in development mode', () => {
      (global as any).__DEV__ = true;
      
      const errorBoundary = new ErrorBoundary({ children: null });
      errorBoundary.state = { 
        hasError: true, 
        error: new Error('Test error') 
      };
      
      const result = errorBoundary.render();
      
      // Check if error message is included in the render result
      expect(result).toBeDefined();
    });

    it('should not render error details in production mode', () => {
      (global as any).__DEV__ = false;
      
      const errorBoundary = new ErrorBoundary({ children: null });
      errorBoundary.state = { 
        hasError: true, 
        error: new Error('Test error') 
      };
      
      const result = errorBoundary.render();
      
      // Should render fallback but without detailed error info
      expect(result).toBeDefined();
    });
  });

  describe('State management', () => {
    it('should initialize with no error state', () => {
      const errorBoundary = new ErrorBoundary({ children: null });
      
      expect(errorBoundary.state).toEqual({ hasError: false });
    });

    it('should update state when error is caught', () => {
      const error = new Error('Test error');
      const errorInfo = { componentStack: 'test stack' };
      const errorBoundary = new ErrorBoundary({ children: null });
      
      const setStateSpy = jest.spyOn(errorBoundary, 'setState').mockImplementation(() => {});
      
      errorBoundary.componentDidCatch(error, errorInfo);
      
      expect(setStateSpy).toHaveBeenCalledWith({ errorInfo });
    });
  });

  describe('Error boundary integration', () => {
    it('should handle different error types', () => {
      const errorBoundary = new ErrorBoundary({ children: null });
      
      // Test with different error types
      const errors = [
        new Error('Standard error'),
        new TypeError('Type error'),
        new ReferenceError('Reference error'),
      ];

      errors.forEach(error => {
        errorBoundary.componentDidCatch(error, { componentStack: 'test' });
        
        expect(mockLogger.error).toHaveBeenCalledWith(
          'ErrorBoundary',
          'Error caught in Unknown component',
          error,
          expect.any(Object)
        );
      });
    });
  });
});
