/**
 * Schema Validation System with Zod
 * Provides type-safe validation for API requests/responses and form data
 */

import { z } from 'zod';
import { structuredLogger } from './structuredLogger';

// Base schemas for common data types
export const BaseSchemas = {
  // User schemas
  userId: z.string().min(1, 'User ID is required').uuid('Invalid user ID format'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username too long'),
  
  // Common field types
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{8,14}$/, 'Invalid phone number'),
  url: z.string().url('Invalid URL format'),
  
  // Pagination
  pagination: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),
  
  // API Response metadata
  apiMeta: z.object({
    success: z.boolean(),
    message: z.string().optional(),
    timestamp: z.string().datetime(),
    requestId: z.string().uuid().optional(),
  }),
};

// Authentication schemas
export const AuthSchemas = {
  login: z.object({
    email: BaseSchemas.email,
    password: BaseSchemas.password,
    rememberMe: z.boolean().optional(),
  }),
  
  register: z.object({
    email: BaseSchemas.email,
    password: BaseSchemas.password,
    confirmPassword: z.string(),
    username: BaseSchemas.username,
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    acceptTerms: z.boolean().refine(val => val === true, 'Must accept terms'),
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
  
  forgotPassword: z.object({
    email: BaseSchemas.email,
  }),
  
  resetPassword: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: BaseSchemas.password,
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
  
  // Auth response
  authResponse: z.object({
    user: z.object({
      id: BaseSchemas.userId,
      email: BaseSchemas.email,
      username: BaseSchemas.username,
      firstName: z.string(),
      lastName: z.string(),
      avatar: BaseSchemas.url.optional(),
      emailVerified: z.boolean(),
      createdAt: BaseSchemas.timestamp,
      updatedAt: BaseSchemas.timestamp,
    }),
    token: z.string(),
    refreshToken: z.string(),
    expiresAt: BaseSchemas.timestamp,
  }),
};

// Journal schemas
export const JournalSchemas = {
  moodEntry: z.object({
    mood: z.enum(['very_sad', 'sad', 'neutral', 'happy', 'very_happy']),
    intensity: z.number().min(1).max(10),
    notes: z.string().max(1000, 'Notes too long').optional(),
    tags: z.array(z.string()).max(10, 'Too many tags').optional(),
    date: BaseSchemas.timestamp.optional(),
  }),
  
  journalEntry: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    content: z.string().min(1, 'Content is required').max(10000, 'Content too long'),
    mood: z.enum(['very_sad', 'sad', 'neutral', 'happy', 'very_happy']).optional(),
    tags: z.array(z.string()).max(20, 'Too many tags').optional(),
    isPrivate: z.boolean().default(true),
    category: z.string().optional(),
  }),
  
  journalResponse: z.object({
    id: BaseSchemas.id,
    title: z.string(),
    content: z.string(),
    mood: z.string().optional(),
    tags: z.array(z.string()),
    isPrivate: z.boolean(),
    category: z.string().optional(),
    userId: BaseSchemas.userId,
    createdAt: BaseSchemas.timestamp,
    updatedAt: BaseSchemas.timestamp,
  }),
};

// Music schemas  
export const MusicSchemas = {
  track: z.object({
    id: BaseSchemas.id,
    title: z.string().min(1, 'Track title is required'),
    artist: z.string().min(1, 'Artist name is required'),
    album: z.string().optional(),
    duration: z.number().min(1, 'Duration must be positive'),
    url: BaseSchemas.url,
    coverArt: BaseSchemas.url.optional(),
    genre: z.string().optional(),
    year: z.number().min(1900).max(new Date().getFullYear()).optional(),
  }),
  
  playlist: z.object({
    id: BaseSchemas.id.optional(),
    name: z.string().min(1, 'Playlist name is required').max(100, 'Name too long'),
    description: z.string().max(500, 'Description too long').optional(),
    isPublic: z.boolean().default(false),
    tags: z.array(z.string()).max(10, 'Too many tags').optional(),
    trackIds: z.array(BaseSchemas.id).max(500, 'Too many tracks'),
  }),
  
  playbackState: z.object({
    trackId: BaseSchemas.id,
    position: z.number().min(0),
    duration: z.number().min(1),
    isPlaying: z.boolean(),
    volume: z.number().min(0).max(1),
    playlistId: BaseSchemas.id.optional(),
  }),
};

// Breathing exercise schemas
export const BreathingSchemas = {
  breathingPattern: z.object({
    id: BaseSchemas.id.optional(),
    name: z.string().min(1, 'Pattern name is required'),
    inhale: z.number().min(1).max(20, 'Inhale duration too long'),
    hold: z.number().min(0).max(20, 'Hold duration too long'),
    exhale: z.number().min(1).max(20, 'Exhale duration too long'),
    cycles: z.number().min(1).max(50, 'Too many cycles'),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    description: z.string().max(500, 'Description too long').optional(),
  }),
  
  breathingSession: z.object({
    patternId: BaseSchemas.id,
    duration: z.number().min(30, 'Session too short'), // in seconds
    completedCycles: z.number().min(0),
    completionRate: z.number().min(0).max(1),
    startedAt: BaseSchemas.timestamp,
    completedAt: BaseSchemas.timestamp.optional(),
    mood: z.object({
      before: z.number().min(1).max(10).optional(),
      after: z.number().min(1).max(10).optional(),
    }).optional(),
  }),
};

// SOS/Emergency schemas
export const SOSSchemas = {
  sosRequest: z.object({
    type: z.enum(['anxiety', 'panic', 'depression', 'crisis']),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    description: z.string().max(1000, 'Description too long').optional(),
    location: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      accuracy: z.number().min(0).optional(),
    }).optional(),
    contactEmergencyServices: z.boolean().default(false),
  }),
  
  copingStrategy: z.object({
    id: BaseSchemas.id.optional(),
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    category: z.enum(['breathing', 'grounding', 'distraction', 'movement', 'mindfulness']),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    duration: z.number().min(30), // in seconds
    instructions: z.array(z.string()).min(1, 'Instructions required'),
    isPersonalized: z.boolean().default(false),
  }),
};

// API schemas
export const APISchemas = {
  // Generic API response wrapper
  apiResponse: <T extends z.ZodType>(dataSchema: T) => z.object({
    data: dataSchema,
    meta: BaseSchemas.apiMeta,
  }),
  
  // Error response
  errorResponse: z.object({
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.record(z.string(), z.any()).optional(),
    }),
    meta: BaseSchemas.apiMeta,
  }),
  
  // Paginated response
  paginatedResponse: <T extends z.ZodType>(itemSchema: T) => z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      pages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
    meta: BaseSchemas.apiMeta,
  }),
};

// Validation utility class
export class SchemaValidator {
  private static instance: SchemaValidator;
  
  static getInstance(): SchemaValidator {
    if (!SchemaValidator.instance) {
      SchemaValidator.instance = new SchemaValidator();
    }
    return SchemaValidator.instance;
  }
  
  /**
   * Validates data against a schema with detailed error logging
   */
  validate<T>(schema: z.ZodType<T>, data: unknown, context?: string): T {
    try {
      const result = schema.parse(data);
      
      structuredLogger.debug('Schema validation successful', {
        component: 'SchemaValidator',
        action: 'validate',
      }, {
        context,
        schemaType: schema.constructor.name,
      });
      
      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.issues.map((err: z.ZodIssue) => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));
        
        structuredLogger.error('Schema validation failed', error, {
          component: 'SchemaValidator',
          action: 'validate',
        }, {
          context,
          validationErrors,
          invalidData: data,
        });
        
        throw new ValidationError('Validation failed', validationErrors);
      }
      
      structuredLogger.error('Unexpected validation error', error as Error, {
        component: 'SchemaValidator',
        action: 'validate',
      });
      
      throw error;
    }
  }
  
  /**
   * Safe validation that returns success/error result
   */
  safeParse<T>(schema: z.ZodType<T>, data: unknown): {
    success: boolean;
    data?: T;
    errors?: Array<{ path: string; message: string; code: string }>;
  } {
    try {
      const result = this.validate(schema, data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, errors: error.errors };
      }
      return { 
        success: false, 
        errors: [{ path: 'root', message: 'Unexpected validation error', code: 'unknown' }]
      };
    }
  }
  
  /**
   * Validates API request body
   */
  validateRequestBody<T>(schema: z.ZodType<T>, body: unknown, endpoint?: string): T {
    return this.validate(schema, body, `API Request: ${endpoint || 'unknown'}`);
  }
  
  /**
   * Validates API response data
   */
  validateResponseData<T>(schema: z.ZodType<T>, data: unknown, endpoint?: string): T {
    return this.validate(schema, data, `API Response: ${endpoint || 'unknown'}`);
  }
  
  /**
   * Validates form data
   */
  validateFormData<T>(schema: z.ZodType<T>, formData: unknown, formName?: string): T {
    return this.validate(schema, formData, `Form: ${formName || 'unknown'}`);
  }
}

// Custom validation error class
export class ValidationError extends Error {
  public errors: Array<{ path: string; message: string; code: string }>;
  
  constructor(message: string, errors: Array<{ path: string; message: string; code: string }>) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
  
  /**
   * Get formatted error messages
   */
  getFormattedErrors(): Record<string, string> {
    const formatted: Record<string, string> = {};
    
    this.errors.forEach(error => {
      formatted[error.path] = error.message;
    });
    
    return formatted;
  }
  
  /**
   * Get first error message
   */
  getFirstError(): string {
    return this.errors[0]?.message || this.message;
  }
}

// Singleton instance
export const schemaValidator = SchemaValidator.getInstance();

// Type exports for use in components
export type LoginData = z.infer<typeof AuthSchemas.login>;
export type RegisterData = z.infer<typeof AuthSchemas.register>;
export type JournalEntryData = z.infer<typeof JournalSchemas.journalEntry>;
export type MoodEntryData = z.infer<typeof JournalSchemas.moodEntry>;
export type TrackData = z.infer<typeof MusicSchemas.track>;
export type PlaylistData = z.infer<typeof MusicSchemas.playlist>;
export type BreathingPatternData = z.infer<typeof BreathingSchemas.breathingPattern>;
export type SOSRequestData = z.infer<typeof SOSSchemas.sosRequest>;

// Export everything
export * from 'zod';
export default schemaValidator;
