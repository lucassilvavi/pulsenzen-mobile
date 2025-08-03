import { appConfig } from '../config/appConfig';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  category: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  buildVersion?: string;
  platform?: string;
  stackTrace?: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp: string;
  category: string;
  additionalData?: any;
}

export interface UserEvent {
  eventName: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  properties?: Record<string, any>;
  revenue?: number;
}

class LoggingManager {
  private static instance: LoggingManager;
  private sessionId: string;
  private userId?: string;
  private logBuffer: LogEntry[] = [];
  private metricsBuffer: PerformanceMetric[] = [];
  private eventsBuffer: UserEvent[] = [];
  private flushInterval?: number;
  private isInitialized = false;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  public static getInstance(): LoggingManager {
    if (!LoggingManager.instance) {
      LoggingManager.instance = new LoggingManager();
    }
    return LoggingManager.instance;
  }

  // Helper to control console logging based on environment
  private devConsoleError(message: string, error?: any): void {
    if (__DEV__ || process.env.NODE_ENV === 'development') {
      console.error(message, error);
    }
  }

  private async initialize(): Promise<void> {
    try {
      // Initialize third-party services
      await this.initializeSentry();
      await this.initializeAmplitude();
      
      // Start periodic flush
      this.startPeriodicFlush();
      
      this.isInitialized = true;
      this.info('LoggingManager', 'Logging system initialized', { sessionId: this.sessionId });
    } catch (error) {
      // Only log to console in development to avoid console pollution
      this.devConsoleError('Failed to initialize logging:', error);
    }
  }

  private async initializeSentry(): Promise<void> {
    try {
      const config = appConfig.getConfig();
      if (config?.features?.crashReporting && config?.thirdParty?.sentryDsn) {
        try {
          // Note: Install @sentry/react-native for production
          // await Sentry.init({ dsn: config.thirdParty.sentryDsn });
          console.log('Sentry would be initialized here in production');
        } catch (error) {
          this.devConsoleError('Failed to initialize Sentry:', error);
        }
      }
    } catch (error) {
      // Config not available, skip Sentry initialization
      this.devConsoleError('Config not available for Sentry initialization:', error);
    }
  }

  private async initializeAmplitude(): Promise<void> {
    try {
      const config = appConfig.getConfig();
      if (config?.features?.analytics && config?.thirdParty?.amplitudeApiKey) {
        try {
          // Note: Install @amplitude/analytics-react-native for production
          // await Amplitude.init(config.thirdParty.amplitudeApiKey);
          console.log('Amplitude would be initialized here in production');
        } catch (error) {
          this.devConsoleError('Failed to initialize Amplitude:', error);
        }
      }
    } catch (error) {
      // Config not available, skip Amplitude initialization
      this.devConsoleError('Config not available for Amplitude initialization:', error);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getLevelName(level: LogLevel): string {
    return LogLevel[level];
  }

  private shouldLog(level: LogLevel): boolean {
    const config = appConfig.getConfig();
    const minLevel = config.environment.isDebug ? LogLevel.DEBUG : LogLevel.INFO;
    return level >= minLevel;
  }

  private createLogEntry(
    level: LogLevel,
    category: string,
    message: string,
    data?: any,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      category,
      data,
      userId: this.userId,
      sessionId: this.sessionId,
      buildVersion: appConfig.getConfig().environment.version,
      platform: 'mobile',
      stackTrace: error?.stack,
    };
  }

  private async flushLogs(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    try {
      const logs = [...this.logBuffer];
      this.logBuffer = [];

      // Send to remote logging service
      await this.sendLogsToRemote(logs);
    } catch (error) {
      console.error('Failed to flush logs:', error);
      // Re-add logs to buffer for retry
      this.logBuffer.unshift(...this.logBuffer);
    }
  }

  private async sendLogsToRemote(logs: LogEntry[]): Promise<void> {
    const config = appConfig.getConfig();
    if (!config.features.crashReporting) return;

    try {
      // In production, send to your logging service
      const response = await fetch(`${config.api.baseUrl}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({ logs }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send logs: ${response.status}`);
      }
    } catch (error) {
      // Fallback to console in development
      if (config.environment.isDebug) {
        console.group('📝 Log Buffer');
        logs.forEach(log => {
          const levelName = this.getLevelName(log.level);
          console.log(`[${log.timestamp}] ${levelName}: ${log.category} - ${log.message}`, log.data);
        });
        console.groupEnd();
      }
    }
  }

  private async getAuthToken(): Promise<string> {
    // Get auth token from your auth service
    return 'mock-token';
  }

  private startPeriodicFlush(): void {
    // Flush every 30 seconds
    const flushInterval = setInterval(() => {
      this.flushLogs();
      this.flushMetrics();
      this.flushEvents();
    }, 30000);

    // Store interval for cleanup
    this.flushInterval = flushInterval;

    // Flush on app state changes
    // AppState.addEventListener('change', (nextAppState) => {
    //   if (nextAppState === 'background') {
    //     this.flushLogs();
    //     this.flushMetrics();
    //     this.flushEvents();
    //   }
    // });
  }

  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    try {
      const metrics = [...this.metricsBuffer];
      this.metricsBuffer = [];

      // Send to analytics service
      await this.sendMetricsToRemote(metrics);
    } catch (error) {
      console.error('Failed to flush metrics:', error);
    }
  }

  private async sendMetricsToRemote(metrics: PerformanceMetric[]): Promise<void> {
    // In production, send to your analytics service
    if (appConfig.getConfig().environment.isDebug) {
      console.group('📊 Performance Metrics');
      metrics.forEach(metric => {
        console.log(`${metric.name}: ${metric.value}${metric.unit} (${metric.category})`);
      });
      console.groupEnd();
    }
  }

  private async flushEvents(): Promise<void> {
    if (this.eventsBuffer.length === 0) return;

    try {
      const events = [...this.eventsBuffer];
      this.eventsBuffer = [];

      // Send to analytics service
      await this.sendEventsToRemote(events);
    } catch (error) {
      console.error('Failed to flush events:', error);
    }
  }

  private async sendEventsToRemote(events: UserEvent[]): Promise<void> {
    // In production, send to Amplitude or similar
    if (appConfig.getConfig().environment.isDebug) {
      console.group('📈 User Events');
      events.forEach(event => {
        console.log(`${event.eventName}:`, event.properties);
      });
      console.groupEnd();
    }
  }

  // Public logging methods
  public debug(category: string, message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry = this.createLogEntry(LogLevel.DEBUG, category, message, data);
      this.logBuffer.push(entry);
      console.debug(`[${category}] ${message}`, data);
    }
  }

  public info(category: string, message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry = this.createLogEntry(LogLevel.INFO, category, message, data);
      this.logBuffer.push(entry);
      console.info(`[${category}] ${message}`, data);
    }
  }

  public warn(category: string, message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry = this.createLogEntry(LogLevel.WARN, category, message, data);
      this.logBuffer.push(entry);
      console.warn(`[${category}] ${message}`, data);
    }
  }

  public error(category: string, message: string, error?: Error, data?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry = this.createLogEntry(LogLevel.ERROR, category, message, data, error);
      this.logBuffer.push(entry);
      console.error(`[${category}] ${message}`, error, data);

      // Send critical errors immediately to Sentry
      if (appConfig.getConfig().features.crashReporting) {
        // Sentry.captureException(error || new Error(message));
      }
    }
  }

  public fatal(category: string, message: string, error?: Error, data?: any): void {
    const entry = this.createLogEntry(LogLevel.FATAL, category, message, data, error);
    this.logBuffer.push(entry);
    console.error(`[FATAL][${category}] ${message}`, error, data);

    // Immediately flush fatal errors
    this.flushLogs();

    // Send to crash reporting immediately
    if (appConfig.getConfig().features.crashReporting) {
      // Sentry.captureException(error || new Error(message), { level: 'fatal' });
    }
  }

  // Performance tracking
  public trackPerformance(
    name: string,
    value: number,
    unit: PerformanceMetric['unit'],
    category: string,
    additionalData?: any
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      category,
      timestamp: new Date().toISOString(),
      additionalData,
    };

    this.metricsBuffer.push(metric);

    if (appConfig.getConfig().environment.isDebug) {
      console.log(`⚡ Performance: ${name} = ${value}${unit} (${category})`);
    }
  }

  // User event tracking
  public trackEvent(
    eventName: string,
    properties?: Record<string, any>,
    revenue?: number
  ): void {
    if (!appConfig.getConfig().features.analytics) return;

    const event: UserEvent = {
      eventName,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      properties,
      revenue,
    };

    this.eventsBuffer.push(event);

    if (appConfig.getConfig().environment.isDebug) {
      console.log(`📊 Event: ${eventName}`, properties);
    }
  }

  // User management
  public setUserId(userId: string): void {
    this.userId = userId;
    this.info('LoggingManager', 'User ID set', { userId });
  }

  public clearUserId(): void {
    this.userId = undefined;
    this.info('LoggingManager', 'User ID cleared');
  }

  // Utility methods
  public async getLogHistory(hours: number = 24): Promise<LogEntry[]> {
    // In production, query from remote service
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.logBuffer.filter(log => new Date(log.timestamp) > cutoff);
  }

  public async exportLogs(): Promise<string> {
    const logs = await this.getLogHistory();
    return JSON.stringify(logs, null, 2);
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public async flushAll(): Promise<void> {
    await Promise.all([
      this.flushLogs(),
      this.flushMetrics(),
      this.flushEvents(),
    ]);
  }
}

// Export singleton instance
export const logger = LoggingManager.getInstance();
export default logger;
