// Logger levels configuration
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  OFF = 4
}

interface LogConfig {
  level: LogLevel;
  enableConsole: boolean;
  enablePersistence: boolean;
  maxLogSize: number;
  sensitiveDataKeys: string[];
}

class Logger {
  private config: LogConfig;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development' || __DEV__;
    
    this.config = {
      level: this.isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR, // Only errors in production
      enableConsole: this.isDevelopment, // Only enable console in development
      enablePersistence: false,
      maxLogSize: 1000,
      sensitiveDataKeys: [
        'password', 'token', 'refreshToken', 'email', 
        'authorization', 'cookie', 'session', 'apikey',
        'firstName', 'lastName', 'phone', 'address'
      ]
    };
  }

  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = this.config.sensitiveDataKeys.some(
        sensitiveKey => lowerKey.includes(sensitiveKey)
      );

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private formatMessage(level: string, context: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const sanitizedData = data ? this.sanitizeData(data) : undefined;
    
    return JSON.stringify({
      timestamp,
      level,
      context,
      message,
      data: sanitizedData,
      environment: this.isDevelopment ? 'development' : 'production'
    });
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private log(level: LogLevel, levelName: string, context: string, message: string, data?: any): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(levelName, context, message, data);

    if (this.config.enableConsole) {
      // Use appropriate console method
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage);
          break;
      }
    }

    // In production, you would send to monitoring service
    if (!this.isDevelopment && level >= LogLevel.ERROR) {
      // Example: Sentry, Bugsnag, etc.
      // this.sendToMonitoringService(formattedMessage);
    }
  }

  debug(context: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, 'DEBUG', context, message, data);
  }

  info(context: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, 'INFO', context, message, data);
  }

  warn(context: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, 'WARN', context, message, data);
  }

  error(context: string, message: string, error?: Error, data?: any): void {
    const errorData = error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...data
    } : data;

    this.log(LogLevel.ERROR, 'ERROR', context, message, errorData);
  }

  // Utility methods for common scenarios
  apiCall(context: string, method: string, url: string, duration?: number, status?: number): void {
    this.info(context, 'API Call', {
      method,
      url: this.sanitizeUrl(url),
      duration,
      status
    });
  }

  navigation(context: string, from: string, to: string, reason?: string): void {
    this.info(context, 'Navigation', {
      from,
      to,
      reason
    });
  }

  private sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove query parameters that might contain sensitive data
      return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    } catch {
      return '[INVALID_URL]';
    }
  }

  // For development debugging (will be stripped in production)
  devDebug(context: string, message: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(`🐛 [${context}] ${message}`, data);
    }
  }
}

// Export singleton instance
export const logger = new Logger();
export default logger;
