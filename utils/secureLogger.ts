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
    
    try {
      const sanitizedData = data ? this.sanitizeData(data) : undefined;
      
      const logObject = {
        timestamp,
        level,
        context,
        message,
        data: sanitizedData,
        environment: this.isDevelopment ? 'development' : 'production'
      };
      
      const result = JSON.stringify(logObject);
      
      // Debug: Check if JSON.stringify returned null or undefined
      if (!result) {
        console.warn(`[SecureLogger] JSON.stringify returned falsy value for level=${level}, context=${context}, message=${message}`);
        return `[LOG] ${level} - ${context}: ${message} [STRINGIFY_FALSY]`;
      }
      
      return result;
    } catch (error) {
      // Fallback to simple string format if JSON.stringify fails
      console.warn(`[SecureLogger] JSON.stringify failed:`, error);
      return `[LOG] ${level} - ${context}: ${message} [JSON_ERROR]`;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private log(level: LogLevel, levelName: string, context: string, message: string, data?: any): void {
    if (!this.shouldLog(level)) {
      return;
    }

    try {
      // Validate inputs to prevent null/undefined errors
      const safeContext = context || 'Unknown';
      const safeMessage = message || 'No message provided';
      const safeLevelName = levelName || 'UNKNOWN';
      
      const formattedMessage = this.formatMessage(safeLevelName, safeContext, safeMessage, data);
      
      // Ensure we never pass null or undefined to console methods
      const logMessage = formattedMessage || `[LOG] ${safeLevelName} - ${safeContext}: ${safeMessage} [FALLBACK]`;
      
      // Additional safety check
      if (typeof logMessage !== 'string') {
        console.warn(`[SecureLogger] logMessage is not a string:`, typeof logMessage, logMessage);
        const emergencyMessage = `[LOG] ${safeLevelName} - ${safeContext}: ${safeMessage} [TYPE_ERROR]`;
        
        if (this.isDevelopment) {
          console.error(emergencyMessage);
        }
        return;
      }

      if (this.isDevelopment) {
        switch (level) {
          case LogLevel.DEBUG:
            console.debug(logMessage);
            break;
          case LogLevel.INFO:
            console.info(logMessage);
            break;
          case LogLevel.WARN:
            console.warn(logMessage);
            break;
          case LogLevel.ERROR:
            console.error(logMessage);
            break;
        }
      }
    } catch (logError) {
      // Emergency fallback to prevent infinite loops
      console.error(`[SecureLogger] Critical error in log method:`, logError);
      console.error(`[LOG] ${levelName} - ${context}: ${message} [CRITICAL_ERROR]`);
    }

    // In production, you would send to monitoring service
    if (!this.isDevelopment && level >= LogLevel.ERROR) {
      // Send to monitoring service here
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
