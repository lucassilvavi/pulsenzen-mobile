/**
 * Tests for StructuredLogger
 */

import { StructuredLogger, structuredLogger, LogContext } from '../../utils/structuredLogger';
import { logger } from '../../utils/logger';

// Mock the logger module
jest.mock('../../utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock console methods
const mockConsole = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

Object.assign(console, mockConsole);

describe('StructuredLogger', () => {
  let structuredLog: StructuredLogger;

  beforeEach(() => {
    jest.clearAllMocks();
    structuredLog = StructuredLogger.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = StructuredLogger.getInstance();
      const instance2 = StructuredLogger.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should export structuredLogger instance', () => {
      expect(structuredLogger).toBeInstanceOf(StructuredLogger);
    });
  });

  describe('Context Creation', () => {
    it('should create context with correlation ID', () => {
      const context = structuredLog.createContext();
      
      expect(context).toHaveProperty('correlationId');
      expect(context).toHaveProperty('sessionId');
      expect(context).toHaveProperty('deviceInfo');
      expect(context.correlationId).toMatch(/^corr_\d+_\d+$/);
    });

    it('should merge provided context', () => {
      const customContext = {
        component: 'TestComponent',
        action: 'testAction',
      };
      
      const context = structuredLog.createContext(customContext);
      
      expect(context.component).toBe('TestComponent');
      expect(context.action).toBe('testAction');
      expect(context).toHaveProperty('correlationId');
    });
  });

  describe('User Context', () => {
    it('should set user context', () => {
      const userId = 'user_123';
      const additionalContext = {
        component: 'UserComponent',
      };
      
      structuredLog.setUserContext(userId, additionalContext);
      const context = structuredLog.createContext();
      
      expect(context.userId).toBe(userId);
      expect(context.component).toBe('UserComponent');
    });
  });

  describe('Basic Logging Methods', () => {
    it('should log debug messages', () => {
      const message = 'Debug message';
      const context = { component: 'TestComponent' };
      const metadata = { key: 'value' };
      
      structuredLog.debug(message, context, metadata);
      
      expect(logger.debug).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      const message = 'Info message';
      
      structuredLog.info(message);
      
      expect(logger.info).toHaveBeenCalled();
    });

    it('should log warning messages', () => {
      const message = 'Warning message';
      
      structuredLog.warn(message);
      
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      const message = 'Error message';
      const error = new Error('Test error');
      
      structuredLog.error(message, error);
      
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Specialized Logging Methods', () => {
    it('should log performance metrics', () => {
      const startTime = Date.now() - 1000;
      const message = 'Performance test';
      
      structuredLog.performance(message, startTime);
      
      expect(logger.info).toHaveBeenCalled();
      const call = (logger.info as jest.Mock).mock.calls[0];
      expect(call[0]).toContain(message);
    });

    it('should log user actions', () => {
      const action = 'button_click';
      const feature = 'login_form';
      
      structuredLog.userAction(action, feature);
      
      expect(logger.info).toHaveBeenCalled();
      const call = (logger.info as jest.Mock).mock.calls[0];
      expect(call[0]).toContain('User action: button_click');
    });

    it('should log API calls', () => {
      const method = 'GET';
      const url = '/api/users';
      const statusCode = 200;
      const duration = 150;
      
      structuredLog.apiCall(method, url, statusCode, duration);
      
      expect(logger.info).toHaveBeenCalled();
      const call = (logger.info as jest.Mock).mock.calls[0];
      expect(call[0]).toContain('API GET /api/users - 200');
    });

    it('should log API errors with error level', () => {
      const method = 'POST';
      const url = '/api/login';
      const statusCode = 401;
      
      structuredLog.apiCall(method, url, statusCode);
      
      expect(logger.error).toHaveBeenCalled();
    });

    it('should log component lifecycle', () => {
      const component = 'TestComponent';
      const lifecycle = 'mount';
      
      structuredLog.componentLifecycle(component, lifecycle);
      
      expect(logger.debug).toHaveBeenCalled();
      const call = (logger.debug as jest.Mock).mock.calls[0];
      expect(call[0]).toContain('Component TestComponent mount');
    });

    it('should log navigation events', () => {
      const from = 'HomeScreen';
      const to = 'ProfileScreen';
      
      structuredLog.navigation(from, to);
      
      expect(logger.info).toHaveBeenCalled();
      const call = (logger.info as jest.Mock).mock.calls[0];
      expect(call[0]).toContain('Navigation: HomeScreen -> ProfileScreen');
    });

    it('should log security events', () => {
      const event = 'unauthorized_access';
      const severity = 'high';
      
      structuredLog.security(event, severity);
      
      expect(logger.error).toHaveBeenCalled();
      const call = (logger.error as jest.Mock).mock.calls[0];
      expect(call[1]).toContain('Security event: unauthorized_access');
    });

    it('should log low severity security events as warnings', () => {
      const event = 'rate_limit_warning';
      const severity = 'low';
      
      structuredLog.security(event, severity);
      
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('Performance Timer', () => {
    it('should create and execute timer', () => {
      const timerName = 'test_timer';
      const endTimer = structuredLog.startTimer(timerName);
      
      expect(logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Timer started: test_timer'),
        expect.any(String),
        expect.any(Object)
      );
      
      jest.clearAllMocks();
      endTimer();
      
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Timer completed: test_timer'),
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe('Correlation Chain', () => {
    it('should maintain correlation ID across operations', () => {
      const correlationId = 'test_correlation_123';
      
      const result = structuredLog.withCorrelation(correlationId, (log: StructuredLogger) => {
        log.info('Test message');
        return 'test_result';
      });
      
      expect(result).toBe('test_result');
      expect(logger.info).toHaveBeenCalled();
    });

    it('should restore previous context after correlation', () => {
      const originalUserId = 'user_original';
      structuredLog.setUserContext(originalUserId);
      
      structuredLog.withCorrelation('test_corr', (log: StructuredLogger) => {
        log.info('Correlated message');
      });
      
      const context = structuredLog.createContext();
      expect(context.userId).toBe(originalUserId);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', () => {
      const error = new Error('Test error');
      
      expect(() => {
        structuredLog.error('Test error message', error);
      }).not.toThrow();
      
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle missing error object', () => {
      expect(() => {
        structuredLog.error('Test error message without error object');
      }).not.toThrow();
      
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Log Format Validation', () => {
    it('should include correlation ID in message', () => {
      structuredLog.info('Test message');
      
      const call = (logger.info as jest.Mock).mock.calls[0];
      expect(call[0]).toMatch(/\[corr_\d+_\d+\]$/);
    });

    it('should use component as category', () => {
      const context = { component: 'TestComponent' };
      
      structuredLog.info('Test message', context);
      
      const call = (logger.info as jest.Mock).mock.calls[0];
      expect(call[1]).toBe('TestComponent');
    });

    it('should fallback to "app" category', () => {
      // Create a fresh instance and clear all context
      const freshLogger = new (StructuredLogger as any)();
      
      freshLogger.info('Test message');
      
      const call = (logger.info as jest.Mock).mock.calls[0];
      expect(call[1]).toBe('app');
    });
  });
});
