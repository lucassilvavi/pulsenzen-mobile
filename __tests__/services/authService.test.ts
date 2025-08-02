import { jest } from '@jest/globals';
import authService from '../../services/authService';
import { secureStorage } from '../../utils/secureStorage';
import { networkManager } from '../../utils/simpleNetworkManager';

// Mock dependencies
jest.mock('../../utils/simpleNetworkManager');
jest.mock('../../utils/secureStorage');
jest.mock('../../utils/secureLogger');

const mockNetworkManager = networkManager as jest.Mocked<typeof networkManager>;
const mockSecureStorage = secureStorage as jest.Mocked<typeof secureStorage>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const mockResponse = {
        success: true,
        data: {
          success: true,
          data: {
            user: {
              id: '1',
              email: 'test@example.com',
              emailVerified: true
            },
            token: 'mock-jwt-token',
            refreshToken: 'mock-refresh-token'
          },
          message: 'Login successful'
        },
        status: 200
      };

      mockNetworkManager.post.mockResolvedValue(mockResponse);
      mockSecureStorage.setItem.mockResolvedValue(true);

      // Act
      const result = await authService.login(loginData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Login successful');
      expect(mockNetworkManager.post).toHaveBeenCalledWith(
        'http://localhost:3333/api/v1/auth/login', 
        loginData,
        { timeout: 15000, retries: 2, priority: 'high', tags: ['auth'] }
      );
      expect(mockSecureStorage.setItem).toHaveBeenCalledWith('@pulsezen_auth_token', 'mock-jwt-token');
    });

    it('should handle login failure with invalid credentials', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      const mockResponse = {
        success: false,
        data: {
          success: false,
          message: 'Invalid credentials'
        },
        status: 401
      };

      mockNetworkManager.post.mockResolvedValue(mockResponse);

      // Act
      const result = await authService.login(loginData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
      expect(mockSecureStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle network errors during login', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      mockNetworkManager.post.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await authService.login(loginData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to login. Please check your connection.');
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      // Arrange
      const registerData = {
        email: 'newuser@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };
      
      const mockResponse = {
        success: true,
        data: {
          success: true,
          data: {
            user: {
              id: '2',
              email: 'newuser@example.com',
              emailVerified: false
            },
            token: 'mock-jwt-token',
            refreshToken: 'mock-refresh-token'
          },
          message: 'Registration successful'
        },
        status: 201
      };

      mockNetworkManager.post.mockResolvedValue(mockResponse);

      // Act
      const result = await authService.register(registerData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Registration successful');
      expect(mockNetworkManager.post).toHaveBeenCalledWith(
        'http://localhost:3333/api/v1/auth/register', 
        registerData,
        { timeout: 15000, retries: 2, priority: 'high', tags: ['auth'] }
      );
    });

    it('should handle registration failure with existing email', async () => {
      // Arrange
      const registerData = {
        email: 'existing@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };
      
      const mockResponse = {
        success: false,
        data: {
          success: false,
          message: 'Email already exists'
        },
        status: 409
      };

      mockNetworkManager.post.mockResolvedValue(mockResponse);

      // Act
      const result = await authService.register(registerData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Email already exists'); // Now returns specific API error message
    });
  });

  describe('logout', () => {
    it('should successfully logout and clear stored data', async () => {
      // Arrange
      mockSecureStorage.removeItem.mockResolvedValue(true);

      // Act
      await authService.logout();

      // Assert
      expect(mockSecureStorage.removeItem).toHaveBeenCalledWith('@pulsezen_auth_token');
      expect(mockSecureStorage.removeItem).toHaveBeenCalledWith('@pulsezen_user_data');
      expect(mockSecureStorage.removeItem).toHaveBeenCalledTimes(4);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when valid token exists', async () => {
      // Arrange
      mockSecureStorage.getItem
        .mockResolvedValueOnce('valid.jwt.token') // for getToken()
        .mockResolvedValueOnce(JSON.stringify({ id: '1', email: 'test@example.com' })); // for getCurrentUser()

      // Act
      const result = await authService.isAuthenticated();

      // Assert
      expect(result).toBe(true);
      expect(mockSecureStorage.getItem).toHaveBeenCalledWith('@pulsezen_auth_token');
    });

    it('should return false when no token exists', async () => {
      // Arrange
      mockSecureStorage.getItem.mockResolvedValue(null);

      // Act
      const result = await authService.isAuthenticated();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data when authenticated', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        emailVerified: true
      };

      mockSecureStorage.getItem.mockResolvedValue(JSON.stringify(mockUser));

      // Act
      const result = await authService.getCurrentUser();

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockSecureStorage.getItem).toHaveBeenCalledWith('@pulsezen_user_data');
    });

    it('should return null when not authenticated', async () => {
      // Arrange
      mockSecureStorage.getItem.mockResolvedValue(null);

      // Act
      const result = await authService.getCurrentUser();

      // Assert
      expect(result).toBeNull();
    });
  });
});
