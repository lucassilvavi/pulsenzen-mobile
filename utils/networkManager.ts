import { appConfig } from '../config/appConfig';
import { logger } from './logger';
import { performanceMonitor } from './performanceMonitor';
import { cacheManager } from './cacheManager';

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTtl?: number;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  offline?: boolean; // Allow offline mode
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
  cached?: boolean;
  retryCount?: number;
  duration?: number;
}

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
  successCount: number;
}

class NetworkManager {
  private static instance: NetworkManager;
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private requestQueue: Array<{ url: string; config: RequestConfig; resolve: any; reject: any }> = [];
  private isOnline = true;
  private baseRetryDelay = 1000; // 1 second
  private maxRetryDelay = 30000; // 30 seconds
  private circuitBreakerThreshold = 5;
  private circuitBreakerTimeout = 60000; // 1 minute

  private constructor() {
    this.initializeNetworkMonitoring();
  }

  public static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  private initializeNetworkMonitoring(): void {
    // In React Native, you would use NetInfo
    // import NetInfo from '@react-native-community/netinfo';
    // NetInfo.addEventListener(this.handleNetworkChange.bind(this));
    
    // For now, simulate network monitoring
    this.isOnline = true;
    logger.info('NetworkManager', 'Network monitoring initialized');
  }

  private handleNetworkChange(isConnected: boolean): void {
    const wasOnline = this.isOnline;
    this.isOnline = isConnected;

    if (!wasOnline && isConnected) {
      logger.info('NetworkManager', 'Network connection restored, processing queued requests');
      this.processRequestQueue();
    } else if (wasOnline && !isConnected) {
      logger.warn('NetworkManager', 'Network connection lost');
    }
  }

  private getEndpointKey(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.host}${urlObj.pathname}`;
    } catch {
      return url;
    }
  }

  private getCircuitBreaker(endpoint: string): CircuitBreakerState {
    if (!this.circuitBreakers.has(endpoint)) {
      this.circuitBreakers.set(endpoint, {
        state: 'CLOSED',
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0,
        successCount: 0,
      });
    }
    return this.circuitBreakers.get(endpoint)!;
  }

  private updateCircuitBreaker(endpoint: string, success: boolean): void {
    const breaker = this.getCircuitBreaker(endpoint);

    if (success) {
      breaker.successCount++;
      
      if (breaker.state === 'HALF_OPEN' && breaker.successCount >= 3) {
        breaker.state = 'CLOSED';
        breaker.failureCount = 0;
        logger.info('NetworkManager', 'Circuit breaker closed', { endpoint });
      } else if (breaker.state === 'CLOSED') {
        breaker.failureCount = Math.max(0, breaker.failureCount - 1);
      }
    } else {
      breaker.failureCount++;
      breaker.lastFailureTime = Date.now();
      breaker.successCount = 0;

      if (breaker.failureCount >= this.circuitBreakerThreshold) {
        breaker.state = 'OPEN';
        breaker.nextAttemptTime = Date.now() + this.circuitBreakerTimeout;
        logger.warn('NetworkManager', 'Circuit breaker opened', {
          endpoint,
          failureCount: breaker.failureCount,
        });
      }
    }
  }

  private canMakeRequest(endpoint: string): boolean {
    const breaker = this.getCircuitBreaker(endpoint);

    if (breaker.state === 'CLOSED') {
      return true;
    }

    if (breaker.state === 'OPEN') {
      if (Date.now() >= breaker.nextAttemptTime) {
        breaker.state = 'HALF_OPEN';
        breaker.successCount = 0;
        logger.info('NetworkManager', 'Circuit breaker half-open', { endpoint });
        return true;
      }
      return false;
    }

    // HALF_OPEN state
    return true;
  }

  private getCacheKey(url: string, config: RequestConfig): string {
    const method = config.method || 'GET';
    const body = config.body ? JSON.stringify(config.body) : '';
    return `http_cache_${method}_${url}_${body}`;
  }

  private calculateRetryDelay(attempt: number): number {
    // Exponential backoff with jitter
    const baseDelay = Math.min(
      this.baseRetryDelay * Math.pow(2, attempt),
      this.maxRetryDelay
    );
    
    // Add jitter (±25%)
    const jitter = baseDelay * 0.25 * (Math.random() - 0.5);
    return Math.floor(baseDelay + jitter);
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeHttpRequest(url: string, config: RequestConfig): Promise<Response> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = appConfig.getConfig().api.timeout,
    } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const requestHeaders = {
        'Content-Type': 'application/json',
        ...headers,
      };

      const requestConfig: RequestInit = {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      };

      const response = await fetch(url, requestConfig);
      clearTimeout(timeoutId);
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async handleOfflineRequest(url: string, config: RequestConfig): Promise<ApiResponse> {
    const cacheKey = this.getCacheKey(url, config);
    const cachedData = await cacheManager.get(cacheKey);

    if (cachedData) {
      logger.info('NetworkManager', 'Serving cached data in offline mode', { url });
      return {
        success: true,
        data: cachedData,
        status: 200,
        cached: true,
      };
    }

    // Queue request for when online
    if (config.method === 'GET') {
      return new Promise((resolve, reject) => {
        this.requestQueue.push({ url, config, resolve, reject });
        logger.info('NetworkManager', 'Request queued for when online', { url });
        
        // Return cached error response for now
        resolve({
          success: false,
          error: 'Offline - request queued',
          status: 0,
        });
      });
    }

    return {
      success: false,
      error: 'Network unavailable and no cached data',
      status: 0,
    };
  }

  private async processRequestQueue(): Promise<void> {
    const queue = [...this.requestQueue];
    this.requestQueue = [];

    for (const { url, config, resolve } of queue) {
      try {
        const response = await this.request(url, config);
        resolve(response);
      } catch (error) {
        logger.error('NetworkManager', 'Failed to process queued request', error as Error, { url });
      }
    }
  }

  public async request<T = any>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const endpoint = this.getEndpointKey(url);
    const cacheKey = this.getCacheKey(url, config);
    const retries = config.retries ?? appConfig.getConfig().api.retryAttempts;

    // Check if we can make the request (circuit breaker)
    if (!this.canMakeRequest(endpoint)) {
      return {
        success: false,
        error: 'Circuit breaker is open',
        status: 503,
      };
    }

    // Handle offline mode
    if (!this.isOnline && config.offline !== false) {
      return this.handleOfflineRequest(url, config);
    }

    // Check cache for GET requests
    if ((config.method || 'GET') === 'GET' && config.cache !== false) {
      const cachedResponse = await cacheManager.get<T>(cacheKey);
      if (cachedResponse) {
        logger.debug('NetworkManager', 'Cache hit for request', { url });
        performanceMonitor.trackApiCall(endpoint, config.method || 'GET', Date.now() - startTime, 200);
        return {
          success: true,
          data: cachedResponse,
          status: 200,
          cached: true,
        };
      }
    }

    // Check for duplicate in-flight requests
    if (this.pendingRequests.has(cacheKey)) {
      logger.debug('NetworkManager', 'Returning existing request promise', { url });
      return this.pendingRequests.get(cacheKey);
    }

    // Create and execute request
    const requestPromise = this.executeRequestWithRetry<T>(url, config, retries, startTime);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const response = await requestPromise;
      this.pendingRequests.delete(cacheKey);
      return response;
    } catch (error) {
      this.pendingRequests.delete(cacheKey);
      throw error;
    }
  }

  private async executeRequestWithRetry<T>(
    url: string,
    config: RequestConfig,
    maxRetries: number,
    startTime: number
  ): Promise<ApiResponse<T>> {
    const endpoint = this.getEndpointKey(url);
    const method = config.method || 'GET';
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = this.calculateRetryDelay(attempt - 1);
          logger.info('NetworkManager', `Retrying request (${attempt}/${maxRetries})`, {
            url,
            delay,
          });
          await this.sleep(delay);
        }

        const response = await this.makeHttpRequest(url, config);
        const duration = Date.now() - startTime;

        // Track performance
        performanceMonitor.trackApiCall(endpoint, method, duration, response.status);

        // Parse response
        let data: T | null = null;
        try {
          const text = await response.text();
          data = text ? JSON.parse(text) : null;
        } catch (parseError) {
          logger.warn('NetworkManager', 'Failed to parse response as JSON', { url, parseError });
        }

        if (response.ok) {
          // Update circuit breaker
          this.updateCircuitBreaker(endpoint, true);

          // Cache successful GET responses
          if (method === 'GET' && config.cache !== false && data) {
            const cacheKey = this.getCacheKey(url, config);
            await cacheManager.set(cacheKey, data, {
              ttl: config.cacheTtl || 5 * 60 * 1000, // 5 minutes default
              priority: config.priority || 'medium',
              tags: config.tags || ['api_response'],
            });
          }

          logger.info('NetworkManager', 'Request successful', {
            url,
            status: response.status,
            duration,
            attempt,
          });

          return {
            success: true,
            data: data || undefined,
            status: response.status,
            retryCount: attempt,
            duration,
          };
        } else {
          // HTTP error
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
          lastError = error;

          // Don't retry client errors (4xx) except 429 (rate limit)
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            break;
          }
        }
      } catch (error) {
        lastError = error as Error;
        logger.warn('NetworkManager', 'Request attempt failed', {
          url,
          attempt,
          error: lastError.message,
        });
      }
    }

    // All attempts failed
    this.updateCircuitBreaker(endpoint, false);
    
    const duration = Date.now() - startTime;
    performanceMonitor.trackApiCall(endpoint, method, duration, 0);

    logger.error('NetworkManager', 'Request failed after all retries', lastError || undefined, {
      url,
      maxRetries,
      finalAttempt: maxRetries,
    });

    return {
      success: false,
      error: lastError?.message || 'Request failed',
      status: 0,
      retryCount: maxRetries,
      duration,
    };
  }

  // Convenience methods
  public async get<T = any>(url: string, config: Omit<RequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  public async post<T = any>(url: string, data?: any, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'POST', body: data });
  }

  public async put<T = any>(url: string, data?: any, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PUT', body: data });
  }

  public async delete<T = any>(url: string, config: Omit<RequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  // Utility methods
  public getCircuitBreakerStats(): { endpoint: string; state: CircuitBreakerState }[] {
    return Array.from(this.circuitBreakers.entries()).map(([endpoint, state]) => ({
      endpoint,
      state,
    }));
  }

  public resetCircuitBreaker(endpoint: string): void {
    this.circuitBreakers.delete(endpoint);
    logger.info('NetworkManager', 'Circuit breaker reset', { endpoint });
  }

  public clearCache(tags?: string[]): void {
    if (tags) {
      tags.forEach(tag => cacheManager.invalidateByTag(tag));
    } else {
      cacheManager.invalidateByTag('api_response');
    }
    logger.info('NetworkManager', 'API cache cleared', { tags });
  }

  public isNetworkAvailable(): boolean {
    return this.isOnline;
  }

  public getQueuedRequestsCount(): number {
    return this.requestQueue.length;
  }

  public setNetworkAvailable(available: boolean): void {
    this.handleNetworkChange(available);
  }
}

// Export singleton instance
export const networkManager = NetworkManager.getInstance();
export default networkManager;
