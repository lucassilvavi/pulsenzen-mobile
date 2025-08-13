/**
 * Tests for Schema Validation with API Integration
 */

import { z } from 'zod';

// Mock structured logger
jest.mock('../../utils/structuredLogger', () => ({
  structuredLogger: {
    createContext: jest.fn(() => 'test-correlation-id'),
    apiCall: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('API Schema Validation Tests', () => {
  describe('Schema Type Safety', () => {
    it('should validate request data type safety', () => {
      const requestSchema = z.object({ 
        email: z.string().email(),
        password: z.string().min(8),
      });
      
      const validData = {
        email: 'user@example.com',
        password: 'password123'
      };
      
      // Type should be inferred correctly
      const result = requestSchema.safeParse(validData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
        expect(result.data.password).toBe('password123');
      }
    });

    it('should validate response data type safety', () => {
      const responseSchema = z.object({
        user: z.object({
          id: z.string(),
          email: z.string(),
        }),
        token: z.string(),
      });
      
      const validResponse = {
        user: {
          id: '123',
          email: 'user@example.com',
        },
        token: 'jwt-token'
      };
      
      const result = responseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.user.id).toBe('123');
        expect(result.data.token).toBe('jwt-token');
      }
    });
  });

  describe('Validation Error Handling', () => {
    it('should handle invalid request data', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
      });
      
      const invalidData = {
        email: 'invalid-email',
        age: 15
      };
      
      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
        expect(result.error.issues[0].path).toContain('email');
        expect(result.error.issues[1].path).toContain('age');
      }
    });

    it('should handle missing required fields', () => {
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
      });
      
      const incompleteData = {
        name: 'John'
        // email is missing
      };
      
      const result = schema.safeParse(incompleteData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const emailError = result.error.issues.find(
          issue => issue.path.includes('email')
        );
        expect(emailError).toBeDefined();
        expect(emailError?.code).toBe('invalid_type');
      }
    });
  });

  describe('Complex Schema Validation', () => {
    it('should validate nested objects', () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string(),
            settings: z.object({
              notifications: z.boolean(),
              theme: z.enum(['light', 'dark']),
            }),
          }),
        }),
      });
      
      const validData = {
        user: {
          profile: {
            name: 'John',
            settings: {
              notifications: true,
              theme: 'dark' as const,
            },
          },
        },
      };
      
      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate arrays with constraints', () => {
      const schema = z.object({
        tags: z.array(z.string().min(1)).min(1).max(5),
        scores: z.array(z.number().min(0).max(100)),
      });
      
      const validData = {
        tags: ['tag1', 'tag2'],
        scores: [85, 92, 78],
      };
      
      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
      
      // Test invalid data
      const invalidData = {
        tags: [], // too few
        scores: [150], // out of range
      };
      
      const invalidResult = schema.safeParse(invalidData);
      expect(invalidResult.success).toBe(false);
    });

    it('should validate conditional fields', () => {
      const schema = z.object({
        type: z.enum(['user', 'admin']),
        permissions: z.array(z.string()).optional(),
      }).refine(data => {
        if (data.type === 'admin') {
          return data.permissions && data.permissions.length > 0;
        }
        return true;
      }, {
        message: 'Admin users must have permissions',
        path: ['permissions'],
      });
      
      // Valid admin
      const validAdmin = {
        type: 'admin' as const,
        permissions: ['read', 'write'],
      };
      expect(schema.safeParse(validAdmin).success).toBe(true);
      
      // Valid user
      const validUser = { type: 'user' as const };
      expect(schema.safeParse(validUser).success).toBe(true);
      
      // Invalid admin
      const invalidAdmin = {
        type: 'admin' as const,
        permissions: [],
      };
      expect(schema.safeParse(invalidAdmin).success).toBe(false);
    });
  });

  describe('API Response Schemas', () => {
    it('should validate paginated responses', () => {
      const itemSchema = z.object({
        id: z.string(),
        name: z.string(),
      });
      
      const paginatedSchema = z.object({
        data: z.array(itemSchema),
        pagination: z.object({
          page: z.number(),
          limit: z.number(),
          total: z.number(),
          hasNext: z.boolean(),
        }),
      });
      
      const response = {
        data: [
          { id: '1', name: 'Item 1' },
          { id: '2', name: 'Item 2' },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 50,
          hasNext: true,
        },
      };
      
      const result = paginatedSchema.safeParse(response);
      expect(result.success).toBe(true);
    });

    it('should validate error responses', () => {
      const errorSchema = z.object({
        error: z.object({
          code: z.string(),
          message: z.string(),
          details: z.record(z.string(), z.any()).optional(),
        }),
        meta: z.object({
          timestamp: z.string(),
          requestId: z.string().optional(),
        }),
      });
      
      const errorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: {
            field: 'email',
            reason: 'Invalid format',
          },
        },
        meta: {
          timestamp: '2023-12-07T10:00:00Z',
          requestId: 'req-123',
        },
      };
      
      const result = errorSchema.safeParse(errorResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('Form Validation Scenarios', () => {
    it('should validate login form', () => {
      const loginSchema = z.object({
        email: z.string().email('Invalid email format'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        rememberMe: z.boolean().optional(),
      });
      
      const validLogin = {
        email: 'user@example.com',
        password: 'password123',
        rememberMe: true,
      };
      
      expect(loginSchema.safeParse(validLogin).success).toBe(true);
      
      const invalidLogin = {
        email: 'invalid-email',
        password: '123', // too short
      };
      
      const result = loginSchema.safeParse(invalidLogin);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.issues;
        expect(errors.some(e => e.path.includes('email'))).toBe(true);
        expect(errors.some(e => e.path.includes('password'))).toBe(true);
      }
    });

    it('should validate registration form with password confirmation', () => {
      const registerSchema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
        confirmPassword: z.string(),
        username: z.string().min(3),
        acceptTerms: z.boolean().refine(val => val === true, 'Must accept terms'),
      }).refine(data => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      });
      
      const validRegistration = {
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        username: 'testuser',
        acceptTerms: true,
      };
      
      expect(registerSchema.safeParse(validRegistration).success).toBe(true);
      
      const invalidRegistration = {
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'different123',
        username: 'testuser',
        acceptTerms: false,
      };
      
      const result = registerSchema.safeParse(invalidRegistration);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.issues;
        expect(errors.some(e => e.path.includes('confirmPassword'))).toBe(true);
        expect(errors.some(e => e.path.includes('acceptTerms'))).toBe(true);
      }
    });
  });

  describe('Application-specific Schemas', () => {
    it('should validate journal entry data', () => {
      const journalSchema = z.object({
        title: z.string().min(1).max(200),
        content: z.string().min(1).max(10000),
        mood: z.enum(['very_sad', 'sad', 'neutral', 'happy', 'very_happy']).optional(),
        tags: z.array(z.string()).max(20).optional(),
        isPrivate: z.boolean().default(true),
      });
      
      const validEntry = {
        title: 'My Day',
        content: 'Today was a good day with many positive experiences.',
        mood: 'happy' as const,
        tags: ['gratitude', 'work'],
        isPrivate: true,
      };
      
      expect(journalSchema.safeParse(validEntry).success).toBe(true);
    });

    it('should validate SOS request data', () => {
      const sosSchema = z.object({
        type: z.enum(['anxiety', 'panic', 'depression', 'crisis']),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        description: z.string().max(1000).optional(),
        location: z.object({
          latitude: z.number().min(-90).max(90),
          longitude: z.number().min(-180).max(180),
        }).optional(),
        contactEmergencyServices: z.boolean().default(false),
      });
      
      const validSOS = {
        type: 'anxiety' as const,
        severity: 'high' as const,
        description: 'Having severe anxiety symptoms',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
        contactEmergencyServices: false,
      };
      
      expect(sosSchema.safeParse(validSOS).success).toBe(true);
    });

    it('should validate breathing pattern data', () => {
      const breathingSchema = z.object({
        name: z.string().min(1),
        inhale: z.number().min(1).max(20),
        hold: z.number().min(0).max(20),
        exhale: z.number().min(1).max(20),
        cycles: z.number().min(1).max(50),
        difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
      });
      
      const validPattern = {
        name: '4-7-8 Breathing',
        inhale: 4,
        hold: 7,
        exhale: 8,
        cycles: 10,
        difficulty: 'intermediate' as const,
      };
      
      expect(breathingSchema.safeParse(validPattern).success).toBe(true);
    });
  });

  describe('Edge Cases and Error Messages', () => {
    it('should provide meaningful error messages', () => {
      const schema = z.object({
        email: z.string().email('Please provide a valid email address'),
        age: z.number().min(18, 'Must be at least 18 years old'),
        terms: z.boolean().refine(val => val === true, 'You must accept the terms'),
      });
      
      const invalidData = {
        email: 'invalid-email',
        age: 16,
        terms: false,
      };
      
      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.issues;
        const emailError = errors.find(e => e.path.includes('email'));
        const ageError = errors.find(e => e.path.includes('age'));
        const termsError = errors.find(e => e.path.includes('terms'));
        
        expect(emailError?.message).toContain('valid email');
        expect(ageError?.message).toContain('18 years old');
        expect(termsError?.message).toContain('accept the terms');
      }
    });

    it('should handle empty and null values', () => {
      const schema = z.object({
        required: z.string().min(1),
        optional: z.string().optional(),
        nullable: z.string().nullable(),
      });
      
      // Valid with optional fields
      expect(schema.safeParse({
        required: 'value',
        optional: undefined,
        nullable: null,
      }).success).toBe(true);
      
      // Invalid missing required
      expect(schema.safeParse({
        optional: 'value',
        nullable: null,
      }).success).toBe(false);
      
      // Invalid empty string for required
      expect(schema.safeParse({
        required: '',
        optional: 'value',
        nullable: null,
      }).success).toBe(false);
    });

    it('should handle deep object validation', () => {
      const schema = z.object({
        metadata: z.object({
          user: z.object({
            preferences: z.object({
              theme: z.enum(['light', 'dark']),
              notifications: z.object({
                email: z.boolean(),
                push: z.boolean(),
                sms: z.boolean(),
              }),
            }),
          }),
        }),
      });
      
      const validDeepObject = {
        metadata: {
          user: {
            preferences: {
              theme: 'dark' as const,
              notifications: {
                email: true,
                push: false,
                sms: true,
              },
            },
          },
        },
      };
      
      expect(schema.safeParse(validDeepObject).success).toBe(true);
      
      // Test with invalid nested value
      const invalidDeepObject = {
        metadata: {
          user: {
            preferences: {
              theme: 'blue', // invalid enum value
              notifications: {
                email: true,
                push: false,
                sms: true,
              },
            },
          },
        },
      };
      
      const result = schema.safeParse(invalidDeepObject);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const themeError = result.error.issues.find(e => 
          e.path.join('.').includes('theme')
        );
        expect(themeError).toBeDefined();
      }
    });
  });
});
