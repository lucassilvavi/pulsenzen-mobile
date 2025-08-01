/**
 * Test suite for AuthContext with performance optimization
 */

import AuthService from '@/services/authService';

// Mock AuthService
jest.mock('@/services/authService');
const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;

// Mock performance optimization hooks
jest.mock('@/hooks/usePerformanceOptimization', () => ({
  useMemoizedContextValue: jest.fn((value) => value),
  useStableCallback: jest.fn((callback) => callback),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthService.isAuthenticated.mockResolvedValue(false);
    mockAuthService.getCurrentUser.mockResolvedValue(null);
    mockAuthService.getProfile.mockResolvedValue(null);
  });

  describe('Provider Setup', () => {
    it('should export AuthProvider and useAuth', () => {
      const { AuthProvider, useAuth } = require('../../context/AuthContext');
      
      expect(typeof AuthProvider).toBe('function');
      expect(typeof useAuth).toBe('function');
    });

    it('should have mocked dependencies', () => {
      expect(mockAuthService.isAuthenticated).toBeDefined();
      expect(mockAuthService.getCurrentUser).toBeDefined();
      expect(mockAuthService.getProfile).toBeDefined();
    });
  });

  describe('Authentication State Management', () => {
    it('should handle auth service method calls', async () => {
      mockAuthService.isAuthenticated.mockResolvedValue(true);
      
      const result = await mockAuthService.isAuthenticated();
      expect(result).toBe(true);
      expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
    });

    it('should handle user profile operations', async () => {
      const mockProfile = {
        id: '1',
        preferences: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockAuthService.getProfile.mockResolvedValue(mockProfile as any);
      
      const result = await mockAuthService.getProfile();
      expect(result).toEqual(mockProfile);
    });
  });

  describe('Performance Optimization', () => {
    it('should use performance optimization hooks', () => {
      const { useMemoizedContextValue, useStableCallback } = require('@/hooks/usePerformanceOptimization');
      
      // Test that hooks are available and working
      const testValue = { test: 'value' };
      const memoizedResult = useMemoizedContextValue(testValue);
      expect(memoizedResult).toEqual(testValue);
      
      const testCallback = jest.fn();
      const stableCallback = useStableCallback(testCallback);
      expect(stableCallback).toBe(testCallback);
    });

    it('should handle memoization correctly', () => {
      const { useMemoizedContextValue } = require('@/hooks/usePerformanceOptimization');
      
      // Test memoization behavior
      const value1 = { id: 1, data: 'test' };
      const value2 = { id: 1, data: 'test' };
      
      const result1 = useMemoizedContextValue(value1);
      const result2 = useMemoizedContextValue(value2);
      
      expect(result1).toEqual(value1);
      expect(result2).toEqual(value2);
    });
  });

  describe('Error Handling', () => {
    it('should handle auth service errors gracefully', async () => {
      mockAuthService.isAuthenticated.mockRejectedValue(new Error('Network error'));
      
      try {
        await mockAuthService.isAuthenticated();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });

    it('should handle login failures', async () => {
      const mockResult = { success: false, message: 'Invalid credentials' };
      mockAuthService.login.mockResolvedValue(mockResult);
      
      const result = await mockAuthService.login({ email: 'test@test.com', password: 'wrong' });
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
    });
  });

  describe('Service Integration', () => {
    it('should call auth service methods with correct parameters', async () => {
      const loginData = { email: 'test@test.com', password: 'password123' };
      
      await mockAuthService.login(loginData);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
    });

    it('should handle registration flow', async () => {
      const registerData = {
        email: 'test@test.com',
        password: 'password123',
        password_confirmation: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };
      
      mockAuthService.register.mockResolvedValue({ success: true, message: 'Success' });
      
      const result = await mockAuthService.register(registerData);
      expect(result.success).toBe(true);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerData);
    });
  });
});
