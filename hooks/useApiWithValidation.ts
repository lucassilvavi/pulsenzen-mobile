/**
 * API Integration Hook with Schema Validation
 * Provides type-safe API calls with automatic validation
 */

import { useState, useCallback } from 'react';
import { schemaValidator, ValidationError } from '../utils/schemaValidator';
import { structuredLogger } from '../utils/structuredLogger';
import { z } from 'zod';

interface ApiHookState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  validationErrors: Record<string, string> | null;
}

interface ApiHookOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  validateResponse?: boolean;
  retries?: number;
}

/**
 * Generic API hook with schema validation
 */
export function useApiWithValidation<TRequest, TResponse>(
  endpoint: string,
  requestSchema?: z.ZodType<TRequest>,
  responseSchema?: z.ZodType<TResponse>,
  options: ApiHookOptions = {}
) {
  const [state, setState] = useState<ApiHookState<TResponse>>({
    data: null,
    loading: false,
    error: null,
    validationErrors: null,
  });

  const {
    onSuccess,
    onError,
    validateResponse = true,
    retries = 0
  } = options;

  const execute = useCallback(async (
    requestData?: TRequest,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'
  ): Promise<TResponse | null> => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      validationErrors: null,
    }));

    const correlationId = structuredLogger.createContext({
      component: 'useApiWithValidation',
      action: 'execute',
    });

    try {
      structuredLogger.apiCall(method, endpoint, undefined, undefined, {
        component: 'useApiWithValidation',
        action: 'request_start',
      });

      // Validate request data if schema provided
      let validatedRequestData = requestData;
      if (requestSchema && requestData !== undefined) {
        try {
          validatedRequestData = schemaValidator.validateRequestBody(
            requestSchema,
            requestData,
            endpoint
          );
        } catch (error) {
          if (error instanceof ValidationError) {
            const validationErrors = error.getFormattedErrors();
            setState(prev => ({
              ...prev,
              loading: false,
              error: 'Request validation failed',
              validationErrors,
            }));
            
            structuredLogger.error('Request validation failed', error, {
              component: 'useApiWithValidation',
              action: 'validate_request',
            }, { endpoint, validationErrors });

            onError?.(error);
            return null;
          }
          throw error;
        }
      }

      // Make API call with retries
      let lastError: Error | null = null;
      let attempt = 0;
      
      while (attempt <= retries) {
        try {
          const requestOptions: RequestInit = {
            method,
            headers: {
              'Content-Type': 'application/json',
              'X-Correlation-ID': String(correlationId),
            },
          };

          if (validatedRequestData && method !== 'GET') {
            requestOptions.body = JSON.stringify(validatedRequestData);
          }

          const response = await fetch(endpoint, requestOptions);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const responseData = await response.json();

          // Validate response if schema provided
          let validatedResponseData = responseData;
          if (validateResponse && responseSchema) {
            try {
              validatedResponseData = schemaValidator.validateResponseData(
                responseSchema,
                responseData,
                endpoint
              );
            } catch (error) {
              if (error instanceof ValidationError) {
                setState(prev => ({
                  ...prev,
                  loading: false,
                  error: 'Response validation failed',
                  validationErrors: null,
                }));

                structuredLogger.error('Response validation failed', error, {
                  component: 'useApiWithValidation',
                  action: 'validate_response',
                }, { 
                  endpoint,
                  responseData,
                  validationErrors: error.getFormattedErrors()
                });

                onError?.(error);
                return null;
              }
              throw error;
            }
          }

          setState(prev => ({
            ...prev,
            data: validatedResponseData,
            loading: false,
            error: null,
            validationErrors: null,
          }));

          structuredLogger.apiCall(method, endpoint, response.status, undefined, {
            component: 'useApiWithValidation',
            action: 'request_success',
          });

          onSuccess?.(validatedResponseData);
          return validatedResponseData;

        } catch (error) {
          lastError = error as Error;
          attempt++;

          if (attempt <= retries) {
            structuredLogger.warn('API call failed, retrying', {
              component: 'useApiWithValidation',
              action: 'retry',
            }, {
              endpoint,
              method,
              attempt,
              error: (error as Error).message,
            });

            // Exponential backoff
            await new Promise(resolve => 
              setTimeout(resolve, Math.pow(2, attempt) * 1000)
            );
          }
        }
      }

      // All retries failed
      const errorMessage = lastError?.message || 'API call failed';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        validationErrors: null,
      }));

      structuredLogger.error('API call failed after retries', lastError || undefined, {
        component: 'useApiWithValidation',
        action: 'execute',
      }, {
        endpoint,
        method,
        attempts: attempt,
      });

      onError?.(lastError!);
      return null;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        validationErrors: null,
      }));

      structuredLogger.error('Unexpected API error', error as Error, {
        component: 'useApiWithValidation',
        action: 'execute',
      });

      onError?.(error as Error);
      return null;
    }
  }, [endpoint, requestSchema, responseSchema, onSuccess, onError, validateResponse, retries]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      validationErrors: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Specific hooks for common API patterns
 */

// Authentication hook
export function useAuth() {
  const loginHook = useApiWithValidation(
    '/api/auth/login',
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
    }),
    z.object({
      user: z.object({
        id: z.string(),
        email: z.string(),
        username: z.string(),
      }),
      token: z.string(),
    })
  );

  const registerHook = useApiWithValidation(
    '/api/auth/register',
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
      username: z.string().min(3),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
    }),
    z.object({
      user: z.object({
        id: z.string(),
        email: z.string(),
        username: z.string(),
      }),
    })
  );

  const login = useCallback(async (email: string, password: string) => {
    return await loginHook.execute({ email, password }, 'POST');
  }, [loginHook]);

  const register = useCallback(async (userData: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
  }) => {
    return await registerHook.execute(userData, 'POST');
  }, [registerHook]);

  return {
    login: {
      ...loginHook,
      execute: login,
    },
    register: {
      ...registerHook,
      execute: register,
    },
  };
}

// Journal hook
export function useJournal() {
  const createEntryHook = useApiWithValidation(
    '/api/journal/entries',
    z.object({
      title: z.string().min(1).max(200),
      content: z.string().min(1).max(10000),
      mood: z.enum(['very_sad', 'sad', 'neutral', 'happy', 'very_happy']).optional(),
      tags: z.array(z.string()).max(20).optional(),
      isPrivate: z.boolean().default(true),
    }),
    z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
      createdAt: z.string(),
    })
  );

  const getEntriesHook = useApiWithValidation(
    '/api/journal/entries',
    undefined,
    z.object({
      data: z.array(z.object({
        id: z.string(),
        title: z.string(),
        content: z.string(),
        mood: z.string().optional(),
        tags: z.array(z.string()),
        createdAt: z.string(),
      })),
      pagination: z.object({
        page: z.number(),
        total: z.number(),
        hasNext: z.boolean(),
      }),
    })
  );

  return {
    createEntry: createEntryHook,
    getEntries: getEntriesHook,
  };
}

// Music hook
export function useMusic() {
  const getPlaylistsHook = useApiWithValidation(
    '/api/music/playlists',
    undefined,
    z.array(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      trackCount: z.number(),
    }))
  );

  const createPlaylistHook = useApiWithValidation(
    '/api/music/playlists',
    z.object({
      name: z.string().min(1).max(100),
      description: z.string().max(500).optional(),
      isPublic: z.boolean().default(false),
    }),
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
    })
  );

  return {
    getPlaylists: getPlaylistsHook,
    createPlaylist: createPlaylistHook,
  };
}

// SOS hook
export function useSOS() {
  const sendSOSHook = useApiWithValidation(
    '/api/sos/request',
    z.object({
      type: z.enum(['anxiety', 'panic', 'depression', 'crisis']),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      description: z.string().max(1000).optional(),
      location: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      }).optional(),
    }),
    z.object({
      id: z.string(),
      status: z.string(),
      estimatedResponseTime: z.number().optional(),
      resources: z.array(z.object({
        type: z.string(),
        name: z.string(),
        contact: z.string(),
      })),
    })
  );

  return {
    sendSOS: sendSOSHook,
  };
}
