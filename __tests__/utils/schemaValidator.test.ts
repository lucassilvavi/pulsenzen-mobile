/**
 * Comprehensive test suite for Schema Validation System
 * Tests all schemas, validation logic, and error handling
 */

import { 
  schemaValidator,
  ValidationError,
  AuthSchemas,
  JournalSchemas,
  MusicSchemas,
  BreathingSchemas,
  SOSSchemas,
  APISchemas,
  BaseSchemas,
  SchemaValidator
} from '../../utils/schemaValidator';
import { z } from 'zod';

// Mock structured logger
jest.mock('../../utils/structuredLogger', () => ({
  structuredLogger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

describe('SchemaValidator', () => {
  
  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = SchemaValidator.getInstance();
      const instance2 = SchemaValidator.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBe(schemaValidator);
    });
  });

  describe('Base Schemas', () => {
    describe('userId', () => {
      it('should validate valid UUID', () => {
        const validId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
        const result = schemaValidator.validate(BaseSchemas.userId, validId);
        expect(result).toBe(validId);
      });

      it('should reject invalid UUID format', () => {
        expect(() => {
          schemaValidator.validate(BaseSchemas.userId, 'invalid-id');
        }).toThrow(ValidationError);
      });

      it('should reject empty string', () => {
        expect(() => {
          schemaValidator.validate(BaseSchemas.userId, '');
        }).toThrow(ValidationError);
      });
    });

    describe('email', () => {
      it('should validate proper email format', () => {
        const validEmails = [
          'user@example.com',
          'test.email+tag@domain.co.uk',
          'user123@domain-name.org'
        ];

        validEmails.forEach(email => {
          const result = schemaValidator.validate(BaseSchemas.email, email);
          expect(result).toBe(email);
        });
      });

      it('should reject invalid email formats', () => {
        const invalidEmails = [
          'invalid-email',
          '@domain.com',
          'user@',
          'user..double.dot@domain.com'
        ];

        invalidEmails.forEach(email => {
          expect(() => {
            schemaValidator.validate(BaseSchemas.email, email);
          }).toThrow(ValidationError);
        });
      });
    });

    describe('password', () => {
      it('should validate password with minimum length', () => {
        const validPassword = 'password123';
        const result = schemaValidator.validate(BaseSchemas.password, validPassword);
        expect(result).toBe(validPassword);
      });

      it('should reject short passwords', () => {
        expect(() => {
          schemaValidator.validate(BaseSchemas.password, '1234567');
        }).toThrow(ValidationError);
      });
    });

    describe('phoneNumber', () => {
      it('should validate international phone numbers', () => {
        const validNumbers = [
          '+12345678901',
          '+5511987654321',
          '12345678901'
        ];

        validNumbers.forEach(number => {
          const result = schemaValidator.validate(BaseSchemas.phoneNumber, number);
          expect(result).toBe(number);
        });
      });

      it('should reject invalid phone formats', () => {
        const invalidNumbers = [
          'abc123',
          '+',
          '123',
          '12345678', // too short
          '+123456789012345678' // too long
        ];

        invalidNumbers.forEach(number => {
          expect(() => {
            schemaValidator.validate(BaseSchemas.phoneNumber, number);
          }).toThrow(ValidationError);
        });
      });
    });
  });

  describe('Authentication Schemas', () => {
    describe('login', () => {
      it('should validate valid login data', () => {
        const loginData = {
          email: 'user@example.com',
          password: 'password123',
          rememberMe: true
        };

        const result = schemaValidator.validate(AuthSchemas.login, loginData);
        expect(result).toEqual(loginData);
      });

      it('should work without optional fields', () => {
        const loginData = {
          email: 'user@example.com',
          password: 'password123'
        };

        const result = schemaValidator.validate(AuthSchemas.login, loginData);
        expect(result).toEqual(loginData);
      });

      it('should reject invalid email in login', () => {
        expect(() => {
          schemaValidator.validate(AuthSchemas.login, {
            email: 'invalid-email',
            password: 'password123'
          });
        }).toThrow(ValidationError);
      });
    });

    describe('register', () => {
      it('should validate complete registration data', () => {
        const registerData = {
          email: 'user@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          username: 'testuser',
          firstName: 'John',
          lastName: 'Doe',
          acceptTerms: true
        };

        const result = schemaValidator.validate(AuthSchemas.register, registerData);
        expect(result).toEqual(registerData);
      });

      it('should reject password mismatch', () => {
        expect(() => {
          schemaValidator.validate(AuthSchemas.register, {
            email: 'user@example.com',
            password: 'password123',
            confirmPassword: 'different123',
            username: 'testuser',
            firstName: 'John',
            lastName: 'Doe',
            acceptTerms: true
          });
        }).toThrow(ValidationError);
      });

      it('should reject without accepting terms', () => {
        expect(() => {
          schemaValidator.validate(AuthSchemas.register, {
            email: 'user@example.com',
            password: 'password123',
            confirmPassword: 'password123',
            username: 'testuser',
            firstName: 'John',
            lastName: 'Doe',
            acceptTerms: false
          });
        }).toThrow(ValidationError);
      });
    });
  });

  describe('Journal Schemas', () => {
    describe('moodEntry', () => {
      it('should validate valid mood entry', () => {
        const moodData = {
          mood: 'happy' as const,
          intensity: 7,
          notes: 'Feeling great today!',
          tags: ['work', 'exercise']
        };

        const result = schemaValidator.validate(JournalSchemas.moodEntry, moodData);
        expect(result).toEqual(moodData);
      });

      it('should reject invalid mood values', () => {
        expect(() => {
          schemaValidator.validate(JournalSchemas.moodEntry, {
            mood: 'invalid_mood',
            intensity: 5
          });
        }).toThrow(ValidationError);
      });

      it('should reject intensity out of range', () => {
        expect(() => {
          schemaValidator.validate(JournalSchemas.moodEntry, {
            mood: 'happy',
            intensity: 11
          });
        }).toThrow(ValidationError);
      });
    });

    describe('journalEntry', () => {
      it('should validate complete journal entry', () => {
        const entryData = {
          title: 'My Great Day',
          content: 'Today was an amazing day with lots of positive experiences.',
          mood: 'happy' as const,
          tags: ['gratitude', 'achievement'],
          isPrivate: true,
          category: 'personal'
        };

        const result = schemaValidator.validate(JournalSchemas.journalEntry, entryData);
        expect(result).toEqual(entryData);
      });

      it('should apply defaults for optional fields', () => {
        const entryData = {
          title: 'Simple Entry',
          content: 'Basic content'
        };

        const result = schemaValidator.validate(JournalSchemas.journalEntry, entryData);
        expect(result.isPrivate).toBe(true);
      });

      it('should reject empty title', () => {
        expect(() => {
          schemaValidator.validate(JournalSchemas.journalEntry, {
            title: '',
            content: 'Content here'
          });
        }).toThrow(ValidationError);
      });
    });
  });

  describe('Music Schemas', () => {
    describe('track', () => {
      it('should validate complete track data', () => {
        const trackData = {
          id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          title: 'Amazing Song',
          artist: 'Great Artist',
          album: 'Best Album',
          duration: 240,
          url: 'https://example.com/track.mp3',
          coverArt: 'https://example.com/cover.jpg',
          genre: 'Pop',
          year: 2023
        };

        const result = schemaValidator.validate(MusicSchemas.track, trackData);
        expect(result).toEqual(trackData);
      });

      it('should reject invalid duration', () => {
        expect(() => {
          schemaValidator.validate(MusicSchemas.track, {
            id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            title: 'Song',
            artist: 'Artist',
            duration: -10,
            url: 'https://example.com/track.mp3'
          });
        }).toThrow(ValidationError);
      });
    });

    describe('playlist', () => {
      it('should validate playlist with tracks', () => {
        const playlistData = {
          name: 'My Playlist',
          description: 'Collection of favorite songs',
          isPublic: false,
          tags: ['chill', 'favorites'],
          trackIds: [
            'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            'a47ac10b-58cc-4372-a567-0e02b2c3d479'
          ]
        };

        const result = schemaValidator.validate(MusicSchemas.playlist, playlistData);
        expect(result).toEqual(playlistData);
      });

      it('should reject too many tracks', () => {
        const tooManyTracks = Array(501).fill('f47ac10b-58cc-4372-a567-0e02b2c3d479');
        
        expect(() => {
          schemaValidator.validate(MusicSchemas.playlist, {
            name: 'Big Playlist',
            trackIds: tooManyTracks
          });
        }).toThrow(ValidationError);
      });
    });
  });

  describe('Breathing Schemas', () => {
    describe('breathingPattern', () => {
      it('should validate breathing pattern', () => {
        const patternData = {
          name: '4-7-8 Breathing',
          inhale: 4,
          hold: 7,
          exhale: 8,
          cycles: 10,
          difficulty: 'intermediate' as const,
          description: 'Relaxing breathing technique'
        };

        const result = schemaValidator.validate(BreathingSchemas.breathingPattern, patternData);
        expect(result).toEqual(patternData);
      });

      it('should reject extreme durations', () => {
        expect(() => {
          schemaValidator.validate(BreathingSchemas.breathingPattern, {
            name: 'Extreme Pattern',
            inhale: 25, // too long
            hold: 5,
            exhale: 5,
            cycles: 5,
            difficulty: 'advanced'
          });
        }).toThrow(ValidationError);
      });
    });

    describe('breathingSession', () => {
      it('should validate breathing session', () => {
        const sessionData = {
          patternId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          duration: 300,
          completedCycles: 8,
          completionRate: 0.8,
          startedAt: '2023-12-07T10:00:00Z',
          completedAt: '2023-12-07T10:05:00Z',
          mood: {
            before: 6,
            after: 8
          }
        };

        const result = schemaValidator.validate(BreathingSchemas.breathingSession, sessionData);
        expect(result).toEqual(sessionData);
      });
    });
  });

  describe('SOS Schemas', () => {
    describe('sosRequest', () => {
      it('should validate SOS request', () => {
        const sosData = {
          type: 'anxiety' as const,
          severity: 'high' as const,
          description: 'Experiencing severe anxiety',
          location: {
            latitude: 40.7128,
            longitude: -74.0060,
            accuracy: 10
          },
          contactEmergencyServices: false
        };

        const result = schemaValidator.validate(SOSSchemas.sosRequest, sosData);
        expect(result).toEqual(sosData);
      });

      it('should reject invalid coordinates', () => {
        expect(() => {
          schemaValidator.validate(SOSSchemas.sosRequest, {
            type: 'anxiety',
            severity: 'high',
            location: {
              latitude: 100, // invalid
              longitude: -74.0060
            }
          });
        }).toThrow(ValidationError);
      });
    });
  });

  describe('API Schemas', () => {
    describe('apiResponse', () => {
      it('should validate wrapped API response', () => {
        const userSchema = z.object({
          id: z.string(),
          name: z.string()
        });

        const responseData = {
          data: { id: '123', name: 'John' },
          meta: {
            success: true,
            message: 'Success',
            timestamp: '2023-12-07T10:00:00Z',
            requestId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
          }
        };

        const schema = APISchemas.apiResponse(userSchema);
        const result = schemaValidator.validate(schema, responseData);
        expect(result).toEqual(responseData);
      });
    });

    describe('paginatedResponse', () => {
      it('should validate paginated response', () => {
        const itemSchema = z.object({ id: z.string() });
        
        const paginatedData = {
          data: [{ id: '1' }, { id: '2' }],
          pagination: {
            page: 1,
            limit: 20,
            total: 50,
            pages: 3,
            hasNext: true,
            hasPrev: false
          },
          meta: {
            success: true,
            timestamp: '2023-12-07T10:00:00Z'
          }
        };

        const schema = APISchemas.paginatedResponse(itemSchema);
        const result = schemaValidator.validate(schema, paginatedData);
        expect(result).toEqual(paginatedData);
      });
    });
  });

  describe('Validation Methods', () => {
    describe('safeParse', () => {
      it('should return success result for valid data', () => {
        const result = schemaValidator.safeParse(BaseSchemas.email, 'test@example.com');
        
        expect(result.success).toBe(true);
        expect(result.data).toBe('test@example.com');
        expect(result.errors).toBeUndefined();
      });

      it('should return error result for invalid data', () => {
        const result = schemaValidator.safeParse(BaseSchemas.email, 'invalid-email');
        
        expect(result.success).toBe(false);
        expect(result.data).toBeUndefined();
        expect(result.errors).toBeDefined();
        expect(result.errors).toHaveLength(1);
      });
    });

    describe('validateRequestBody', () => {
      it('should validate request body with context', () => {
        const schema = z.object({ name: z.string() });
        const body = { name: 'test' };
        
        const result = schemaValidator.validateRequestBody(schema, body, '/api/users');
        expect(result).toEqual(body);
      });
    });

    describe('validateResponseData', () => {
      it('should validate response data with context', () => {
        const schema = z.object({ id: z.string() });
        const data = { id: '123' };
        
        const result = schemaValidator.validateResponseData(schema, data, '/api/users');
        expect(result).toEqual(data);
      });
    });

    describe('validateFormData', () => {
      it('should validate form data with context', () => {
        const schema = z.object({ email: BaseSchemas.email });
        const formData = { email: 'test@example.com' };
        
        const result = schemaValidator.validateFormData(schema, formData, 'login-form');
        expect(result).toEqual(formData);
      });
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with formatted errors', () => {
      const errors = [
        { path: 'email', message: 'Invalid email', code: 'invalid_string' },
        { path: 'password', message: 'Too short', code: 'too_small' }
      ];
      
      const error = new ValidationError('Validation failed', errors);
      
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Validation failed');
      expect(error.errors).toEqual(errors);
    });

    it('should format errors as record', () => {
      const errors = [
        { path: 'email', message: 'Invalid email', code: 'invalid_string' },
        { path: 'password', message: 'Too short', code: 'too_small' }
      ];
      
      const error = new ValidationError('Validation failed', errors);
      const formatted = error.getFormattedErrors();
      
      expect(formatted).toEqual({
        email: 'Invalid email',
        password: 'Too short'
      });
    });

    it('should return first error message', () => {
      const errors = [
        { path: 'email', message: 'Invalid email', code: 'invalid_string' },
        { path: 'password', message: 'Too short', code: 'too_small' }
      ];
      
      const error = new ValidationError('Validation failed', errors);
      expect(error.getFirstError()).toBe('Invalid email');
    });
  });

  describe('Complex Validation Scenarios', () => {
    it('should handle nested object validation', () => {
      const complexSchema = z.object({
        user: z.object({
          profile: z.object({
            email: BaseSchemas.email,
            preferences: z.object({
              notifications: z.boolean(),
              theme: z.enum(['light', 'dark'])
            })
          })
        })
      });

      const validData = {
        user: {
          profile: {
            email: 'user@example.com',
            preferences: {
              notifications: true,
              theme: 'dark' as const
            }
          }
        }
      };

      const result = schemaValidator.validate(complexSchema, validData);
      expect(result).toEqual(validData);
    });

    it('should handle array validation with constraints', () => {
      const schema = z.object({
        tags: z.array(z.string().min(1)).max(5).min(1)
      });

      const validData = { tags: ['tag1', 'tag2', 'tag3'] };
      const result = schemaValidator.validate(schema, validData);
      expect(result).toEqual(validData);

      // Test too many tags
      expect(() => {
        schemaValidator.validate(schema, {
          tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6']
        });
      }).toThrow(ValidationError);
    });

    it('should handle conditional validation', () => {
      const schema = z.object({
        type: z.enum(['user', 'admin']),
        permissions: z.array(z.string()).optional()
      }).refine(data => {
        if (data.type === 'admin') {
          return data.permissions && data.permissions.length > 0;
        }
        return true;
      }, {
        message: 'Admin users must have permissions',
        path: ['permissions']
      });

      // Valid admin
      const validAdmin = {
        type: 'admin' as const,
        permissions: ['read', 'write']
      };
      expect(schemaValidator.validate(schema, validAdmin)).toEqual(validAdmin);

      // Valid user
      const validUser = { type: 'user' as const };
      expect(schemaValidator.validate(schema, validUser)).toEqual(validUser);

      // Invalid admin without permissions
      expect(() => {
        schemaValidator.validate(schema, {
          type: 'admin',
          permissions: []
        });
      }).toThrow(ValidationError);
    });
  });
});
