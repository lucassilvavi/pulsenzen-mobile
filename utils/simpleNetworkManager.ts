import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { router } from 'expo-router';
import { APP_CONSTANTS, ERROR_CODES } from '../constants/appConstants';
import AuthService from '../services/authService';
import { NetworkRequestConfig, NetworkResponse } from '../types/api';
import { cacheManager } from './cacheManager';
import { performanceMonitor } from './performanceMonitor';
import { logger } from './secureLogger';

class SimpleNetworkManager {
  private client: AxiosInstance;
  private pendingRequests: Map<string, Promise<any>> = new Map();

  constructor() {
    this.client = axios.create({
      timeout: APP_CONSTANTS.API.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Configure retry logic
    axiosRetry(this.client, {
      retries: APP_CONSTANTS.API.RETRY_ATTEMPTS,
      retryDelay: (retryCount) => {
        const delay = Math.min(
          APP_CONSTANTS.API.RETRY_DELAY_BASE * Math.pow(2, retryCount),
          APP_CONSTANTS.API.RETRY_DELAY_MAX
        );
        return delay + Math.random() * 1000; // Add jitter
      },
      retryCondition: (error) => {
        // Retry on network errors and 5xx responses, but not 4xx (except 429)
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
               (error.response?.status === 429);
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const startTime = Date.now();
        (config as any).startTime = startTime;
        // Adiciona o token globalmente
        try {
          const token = await AuthService.getToken();
          if (token) {
            if (config.headers && typeof config.headers.set === 'function') {
              // AxiosHeaders instance
              config.headers.set('Authorization', `Bearer ${token}`);
            } else if (!config.headers) {
              // undefined
              config.headers = { Authorization: `Bearer ${token}` } as any;
            } else {
              // plain object
              (config.headers as any)['Authorization'] = `Bearer ${token}`;
            }
          }
        } catch (e) {
          // Se falhar ao buscar token, segue sem header
        }
        logger.debug('NetworkManager', 'Request started', {
          method: config.method?.toUpperCase(),
          url: this.sanitizeUrl(config.url || ''),
        });
        return config;
      },
      (error) => {
        logger.error('NetworkManager', 'Request interceptor error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Apenas retorna a resposta original do Axios
        return response;
      },
      async (error) => {
        const duration = Date.now() - ((error.config as any)?.startTime || 0);
        const status = error.response?.status || 0;
        
        performanceMonitor.trackApiCall(
          this.getEndpointKey(error.config?.url || ''),
          error.config?.method?.toUpperCase() || 'GET',
          duration,
          status
        );

        // Capture error response data for better debugging
        let errorData = null;
        try {
          errorData = error.response?.data;
        } catch (e) {
          // Ignore parsing errors
        }

        // Log differently based on error type
        // 4xx client errors are expected behavior, 5xx server errors are critical
        if (status >= 400 && status < 500) {
          // Client errors (validation, authentication, etc.) - use debug level
          logger.debug('NetworkManager', 'Client error response', {
            method: error.config?.method?.toUpperCase(),
            url: this.sanitizeUrl(error.config?.url || ''),
            status,
            duration,
            responseData: errorData,
            error: error.message,
          });
        } else {
          // Server errors (5xx) or network errors - log as error
          logger.error('NetworkManager', 'Request failed', error, {
            method: error.config?.method?.toUpperCase(),
            url: this.sanitizeUrl(error.config?.url || ''),
            status,
            duration,
            responseData: errorData,
          });
        }        // --- REFRESH TOKEN LOGIC START ---
        if (status === 401 && !error.config?._retry) {
          error.config._retry = true;
          try {
            const refreshResult = await AuthService.refreshAuthToken();
            if (refreshResult.success) {
              // Pega novo token e atualiza header Authorization
              const newAuthHeader = await AuthService.getAuthHeader();
              error.config.headers = {
                ...error.config.headers,
                ...newAuthHeader,
              };
              // Refaz a requisição original com novo token
              return this.client.request(error.config);
            } else {
              logger.info('NetworkManager', 'Refresh token failed, logging out and redirecting to login');
              await AuthService.logout();
              logger.info('NetworkManager', 'Logout completed, redirecting to /onboarding/auth');
              router.replace('/onboarding/auth');
              return Promise.reject(error);
            }
          } catch (refreshError) {
            logger.info('NetworkManager', 'Exception during refresh, logging out and redirecting to login', refreshError);
            await AuthService.logout();
            logger.info('NetworkManager', 'Logout completed, redirecting to /onboarding/auth');
            router.replace('/onboarding/auth');
            return Promise.reject(error);
          }
        }
        // --- REFRESH TOKEN LOGIC END ---
        // For client errors (4xx) with response data, return the response instead of rejecting
        // This allows the calling code to handle the error response properly
        if (error.response && status >= 400 && status < 500 && errorData) {
          return Promise.resolve({
            ...error.response,
            success: false,
            error: errorData.error || errorData.message || 'Request failed',
            data: errorData
          });
        }

        return Promise.reject(error);
      }
    );
  }

  private sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    } catch {
      return '[INVALID_URL]';
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

  private getCacheKey(url: string, config: NetworkRequestConfig): string {
    const method = config.method || 'GET';
    const body = config.body ? JSON.stringify(config.body) : '';
    return `http_cache_${method}_${url}_${body}`;
  }

  public async request<T = any>(
    url: string, 
    config: NetworkRequestConfig = {}
  ): Promise<NetworkResponse<T>> {
    const startTime = Date.now();
    const method = config.method || 'GET';
    const cacheKey = this.getCacheKey(url, config);

    try {
      // Check cache for GET requests
      if (method === 'GET' && config.cache !== false) {
        const cachedResponse = await cacheManager.get<T>(cacheKey);
        if (cachedResponse) {
          logger.debug('NetworkManager', 'Cache hit', { url: this.sanitizeUrl(url) });
          return cachedResponse as unknown as NetworkResponse<T>; // já normalizado
        }
      }

      // Check for duplicate in-flight requests
      if (this.pendingRequests.has(cacheKey)) {
        logger.debug('NetworkManager', 'Duplicate request detected, waiting for existing', {
          url: this.sanitizeUrl(url)
        });
        return this.pendingRequests.get(cacheKey);
      }

      // Create axios config
      const axiosConfig: AxiosRequestConfig = {
        method: config.method as any || 'GET',
        url,
        headers: config.headers,
        data: config.body,
        timeout: config.timeout || APP_CONSTANTS.API.TIMEOUT,
      };

      // Create request promise
      const requestPromise = this.executeRequest<T>(axiosConfig, config, cacheKey, startTime);
      this.pendingRequests.set(cacheKey, requestPromise);

      try {
        const response = await requestPromise;
        this.pendingRequests.delete(cacheKey);
        // --- NORMALIZAÇÃO GLOBAL ---
        let normalized;
        if (response && response.data && typeof response.data === 'object') {
          const api: any = response.data;
          if (api.data && typeof api.data === 'object' && ('can_create' in api.data || 'user' in api.data || 'token' in api.data)) {
            normalized = {
              success: typeof api.success === 'boolean' ? api.success : true,
              data: api.data,
              message: api.message,
              error: api.error,
              status: response.status,
              headers: response.headers,
            };
          } else {
            normalized = {
              success: typeof api.success === 'boolean' ? api.success : true,
              data: api.data,
              message: api.message,
              error: api.error,
              status: response.status,
              headers: response.headers,
            };
          }
        } else {
          normalized = response;
        }
        // Salva resposta normalizada no cache
        if (method === 'GET' && config.cache !== false && normalized.data) {
          await cacheManager.set(cacheKey, normalized, {
            ttl: config.cacheTtl || APP_CONSTANTS.API.CACHE_TTL_DEFAULT,
            priority: config.priority || 'medium',
            tags: config.tags || ['api_response'],
          });
        }
        return normalized;
      } catch (error) {
        this.pendingRequests.delete(cacheKey);
        throw error;
      }

    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: this.getErrorMessage(error),
        status: error.response?.status || 0,
        duration,
      };
    }
  }

  private async executeRequest<T>(
    axiosConfig: AxiosRequestConfig,
    config: NetworkRequestConfig,
    cacheKey: string,
    startTime: number
  ): Promise<NetworkResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.request(axiosConfig);
      const duration = Date.now() - startTime;

      // Cache successful GET responses
      if (axiosConfig.method?.toUpperCase() === 'GET' && config.cache !== false && response.data) {
        await cacheManager.set(cacheKey, response.data, {
          ttl: config.cacheTtl || APP_CONSTANTS.API.CACHE_TTL_DEFAULT,
          priority: config.priority || 'medium',
          tags: config.tags || ['api_response'],
        });
      }

      return {
        success: true,
        data: response.data,
        status: response.status,
        duration,
        headers: response.headers as Record<string, string>,
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      const status = error.response?.status || 0;
      const errorData = error.response?.data;

      // Try to extract error message from API response
      let errorMessage = this.getErrorMessage(error);
      
      // If API returned error details, use them
      if (errorData && typeof errorData === 'object') {
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      }

      throw {
        success: false,
        error: errorMessage,
        status,
        duration,
        retryCount: error.config?.['axios-retry']?.retryCount || 0,
        data: errorData, // Include error response data
      };
    }
  }

  private getErrorMessage(error: any): string {
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
      return ERROR_CODES.NETWORK_ERROR;
    }
    
    if (error.code === 'ECONNREFUSED') {
      return ERROR_CODES.CONNECTION_ERROR;
    }
    
    if (error.response?.status === 401) {
      return ERROR_CODES.UNAUTHORIZED;
    }
    
    if (error.response?.status === 429) {
      return ERROR_CODES.RATE_LIMITED;
    }
    
    if (error.response?.status >= 500) {
      return ERROR_CODES.SERVICE_UNAVAILABLE;
    }
    
    return error.message || ERROR_CODES.UNKNOWN_ERROR;
  }

  // Convenience methods
  public async get<T = any>(url: string, config: Omit<NetworkRequestConfig, 'method'> = {}): Promise<NetworkResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  public async post<T = any>(url: string, data?: any, config: Omit<NetworkRequestConfig, 'method' | 'body'> = {}): Promise<NetworkResponse<T>> {
    return this.request<T>(url, { ...config, method: 'POST', body: data });
  }

  public async put<T = any>(url: string, data?: any, config: Omit<NetworkRequestConfig, 'method' | 'body'> = {}): Promise<NetworkResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PUT', body: data });
  }

  public async delete<T = any>(url: string, config: Omit<NetworkRequestConfig, 'method'> = {}): Promise<NetworkResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  // Utility methods
  public clearCache(tags?: string[]): void {
    if (tags) {
      tags.forEach(tag => cacheManager.invalidateByTag(tag));
    } else {
      cacheManager.invalidateByTag('api_response');
    }
    logger.info('NetworkManager', 'Cache cleared', { tags });
  }

  public getQueuedRequestsCount(): number {
    return this.pendingRequests.size;
  }
}

// Export singleton instance
export const simpleNetworkManager = new SimpleNetworkManager();
export default simpleNetworkManager;

// For backward compatibility, we'll alias it
export const networkManager = simpleNetworkManager;
