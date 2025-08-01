/**
 * Enhanced Structured Logging System
 * Provides advanced logging capabilities with correlation IDs, structured formats, and context
 */

import { appConfig } from '../config/appConfig';
import { logger } from './logger';

export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  correlationId?: string;
  component?: string;
  action?: string;
  feature?: string;
  deviceInfo?: {
    platform: string;
    version: string;
    model?: string;
  };
  performance?: {
    startTime: number;
    duration?: number;
    memoryUsage?: number;
  };
}

export interface StructuredLogData {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  context: LogContext;
  metadata?: Record<string, any>;
  error?: Error;
  tags?: string[];
  timestamp?: string;
}

export class StructuredLogger {
  private static instance: StructuredLogger;
  private defaultContext: Partial<LogContext> = {};
  private correlationIdCounter = 0;

  private constructor() {
    this.initializeDefaultContext();
  }

  static getInstance(): StructuredLogger {
    if (!StructuredLogger.instance) {
      StructuredLogger.instance = new StructuredLogger();
    }
    return StructuredLogger.instance;
  }

  private initializeDefaultContext(): void {
    this.defaultContext = {
      sessionId: this.generateSessionId(),
      deviceInfo: {
        platform: 'react-native',
        version: '1.0.0', // Fixed: removed appConfig.version reference
      },
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCorrelationId(): string {
    this.correlationIdCounter++;
    return `corr_${Date.now()}_${this.correlationIdCounter}`;
  }

  /**
   * Creates a new logging context with correlation ID
   */
  createContext(partialContext: Partial<LogContext> = {}): LogContext {
    return {
      ...this.defaultContext,
      correlationId: this.generateCorrelationId(),
      ...partialContext,
    };
  }

  /**
   * Sets user context for all subsequent logs
   */
  setUserContext(userId: string, additionalContext?: Partial<LogContext>): void {
    this.defaultContext = {
      ...this.defaultContext,
      userId,
      ...additionalContext,
    };
  }

  /**
   * Structured debug logging
   */
  debug(message: string, context: Partial<LogContext> = {}, metadata?: Record<string, any>): void {
    this.log({
      level: 'debug',
      message,
      context: this.createContext(context),
      metadata,
    });
  }

  /**
   * Structured info logging
   */
  info(message: string, context: Partial<LogContext> = {}, metadata?: Record<string, any>): void {
    this.log({
      level: 'info',
      message,
      context: this.createContext(context),
      metadata,
    });
  }

  /**
   * Structured warning logging
   */
  warn(message: string, context: Partial<LogContext> = {}, metadata?: Record<string, any>): void {
    this.log({
      level: 'warn',
      message,
      context: this.createContext(context),
      metadata,
    });
  }

  /**
   * Structured error logging
   */
  error(message: string, error?: Error, context: Partial<LogContext> = {}, metadata?: Record<string, any>): void {
    this.log({
      level: 'error',
      message,
      context: this.createContext(context),
      metadata,
      error,
      tags: ['error'],
    });
  }

  /**
   * Performance logging with timing
   */
  performance(message: string, startTime: number, context: Partial<LogContext> = {}): void {
    const duration = Date.now() - startTime;
    const performanceContext = {
      ...context,
      performance: {
        startTime,
        duration,
        memoryUsage: this.getMemoryUsage(),
      },
    };

    this.info(message, performanceContext, {
      performanceMetric: true,
      duration,
    });
  }

  /**
   * User action logging
   */
  userAction(action: string, feature: string, context: Partial<LogContext> = {}, metadata?: Record<string, any>): void {
    this.info(`User action: ${action}`, {
      ...context,
      action,
      feature,
    }, {
      ...metadata,
      userAction: true,
    });
  }

  /**
   * API call logging
   */
  apiCall(method: string, url: string, statusCode?: number, duration?: number, context: Partial<LogContext> = {}): void {
    const level = statusCode && statusCode >= 400 ? 'error' : 'info';
    const message = `API ${method} ${url} - ${statusCode || 'pending'}`;
    
    this.log({
      level,
      message,
      context: this.createContext(context),
      metadata: {
        apiCall: true,
        method,
        url,
        statusCode,
        duration,
      },
      tags: ['api'],
    });
  }

  /**
   * Component lifecycle logging
   */
  componentLifecycle(component: string, lifecycle: string, context: Partial<LogContext> = {}): void {
    this.debug(`Component ${component} ${lifecycle}`, {
      ...context,
      component,
      action: lifecycle,
    }, {
      componentLifecycle: true,
    });
  }

  /**
   * Navigation logging
   */
  navigation(from: string, to: string, context: Partial<LogContext> = {}): void {
    this.info(`Navigation: ${from} -> ${to}`, {
      ...context,
      action: 'navigation',
    }, {
      navigation: true,
      from,
      to,
    });
  }

  /**
   * Security event logging
   */
  security(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context: Partial<LogContext> = {}): void {
    const level = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
    
    this.log({
      level,
      message: `Security event: ${event}`,
      context: this.createContext(context),
      metadata: {
        securityEvent: true,
        severity,
      },
      tags: ['security', severity],
    });
  }

  /**
   * Main logging method
   */
  private log(data: StructuredLogData): void {
    const formattedLog = this.formatLog(data);
    
    // Send to underlying logger
    switch (data.level) {
      case 'debug':
        logger.debug(formattedLog.message, formattedLog.category, formattedLog.data);
        break;
      case 'info':
        logger.info(formattedLog.message, formattedLog.category, formattedLog.data);
        break;
      case 'warn':
        logger.warn(formattedLog.message, formattedLog.category, formattedLog.data);
        break;
      case 'error':
      case 'fatal':
        logger.error(formattedLog.category, formattedLog.message, data.error, formattedLog.data);
        break;
    }

    // In development, also log to console with better formatting
    if (__DEV__) {
      this.logToConsole(data);
    }
  }

  /**
   * Formats log data for the underlying logger
   */
  private formatLog(data: StructuredLogData) {
    const category = data.context.component || data.context.feature || 'app';
    const correlationInfo = data.context.correlationId ? ` [${data.context.correlationId}]` : '';
    const message = `${data.message}${correlationInfo}`;
    
    return {
      message,
      category,
      data: {
        context: data.context,
        metadata: data.metadata,
        error: data.error,
        tags: data.tags,
        timestamp: data.timestamp || new Date().toISOString(),
      },
    };
  }

  /**
   * Enhanced console logging for development
   */
  private logToConsole(data: StructuredLogData): void {
    const timestamp = new Date().toISOString();
    const correlationId = data.context.correlationId || 'no-corr';
    const component = data.context.component || 'unknown';
    
    const prefix = `[${timestamp}] [${data.level.toUpperCase()}] [${component}] [${correlationId}]`;
    const message = `${prefix} ${data.message}`;
    
    const consoleData = {
      context: data.context,
      metadata: data.metadata,
      ...(data.error && { error: data.error }),
    };

    switch (data.level) {
      case 'debug':
        console.debug(message, consoleData);
        break;
      case 'info':
        console.info(message, consoleData);
        break;
      case 'warn':
        console.warn(message, consoleData);
        break;
      case 'error':
      case 'fatal':
        console.error(message, consoleData);
        break;
    }
  }

  /**
   * Gets current memory usage (simplified)
   */
  private getMemoryUsage(): number {
    // In React Native, this would be more complex
    // For now, return a placeholder
    return 0;
  }

  /**
   * Creates a performance timer
   */
  startTimer(name: string, context: Partial<LogContext> = {}): () => void {
    const startTime = Date.now();
    const timerContext = this.createContext(context);
    
    this.debug(`Timer started: ${name}`, timerContext);
    
    return () => {
      this.performance(`Timer completed: ${name}`, startTime, timerContext);
    };
  }

  /**
   * Logs with automatic correlation ID chain
   */
  withCorrelation<T>(correlationId: string, fn: (log: StructuredLogger) => T): T {
    const previousDefault = { ...this.defaultContext };
    this.defaultContext = {
      ...this.defaultContext,
      correlationId,
    };
    
    try {
      return fn(this);
    } finally {
      this.defaultContext = previousDefault;
    }
  }
}

// Singleton instance
export const structuredLogger = StructuredLogger.getInstance();

// Convenience exports
export const log = structuredLogger;
export default structuredLogger;
