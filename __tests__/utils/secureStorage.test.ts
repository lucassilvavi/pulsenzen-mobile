import { jest } from '@jest/globals';
import { secureStorage } from '../../utils/secureStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('SecureStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setItem', () => {
    it('should store item securely', async () => {
      // Arrange
      const key = 'test-key';
      const value = 'test-value';
      mockAsyncStorage.setItem.mockResolvedValue();

      // Act
      const result = await secureStorage.setItem(key, value);

      // Assert
      expect(result).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        key, 
        expect.any(String) // The value will be wrapped and possibly encrypted
      );
    });

    it('should handle storage errors gracefully', async () => {
      // Arrange
      const key = 'test-key';
      const value = 'test-value';
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      // Act
      const result = await secureStorage.setItem(key, value);

      // Assert
      expect(result).toBe(false);
    });

    it('should store objects correctly', async () => {
      // Arrange
      const key = 'test-key';
      const value = { id: 1, name: 'test' };
      mockAsyncStorage.setItem.mockResolvedValue();

      // Act
      const result = await secureStorage.setItem(key, value);

      // Assert
      expect(result).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        key, 
        expect.any(String)
      );
    });
  });

  describe('getItem', () => {
    it('should retrieve stored string item', async () => {
      // Arrange
      const key = 'test-key';
      const value = 'test-value';
      const wrappedData = JSON.stringify({
        data: value,
        timestamp: Date.now(),
        expiry: null
      });
      mockAsyncStorage.getItem.mockResolvedValue(wrappedData);

      // Act
      const result = await secureStorage.getItem<string>(key);

      // Assert
      expect(result).toBe(value);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(key);
    });

    it('should return null for non-existent items', async () => {
      // Arrange
      const key = 'non-existent';
      mockAsyncStorage.getItem.mockResolvedValue(null);

      // Act
      const result = await secureStorage.getItem(key);

      // Assert
      expect(result).toBeNull();
    });

    it('should parse objects correctly', async () => {
      // Arrange
      const key = 'test-key';
      const originalObject = { id: 1, name: 'test' };
      const wrappedData = JSON.stringify({
        data: originalObject,
        timestamp: Date.now(),
        expiry: null
      });
      mockAsyncStorage.getItem.mockResolvedValue(wrappedData);

      // Act
      const result = await secureStorage.getItem<typeof originalObject>(key);

      // Assert
      expect(result).toEqual(originalObject);
    });

    it('should handle storage errors gracefully', async () => {
      // Arrange
      const key = 'test-key';
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      // Act
      const result = await secureStorage.getItem(key);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('should remove stored item', async () => {
      // Arrange
      const key = 'test-key';
      mockAsyncStorage.removeItem.mockResolvedValue();

      // Act
      const result = await secureStorage.removeItem(key);

      // Assert
      expect(result).toBe(true);
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(key);
    });

    it('should handle removal errors gracefully', async () => {
      // Arrange
      const key = 'test-key';
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));

      // Act
      const result = await secureStorage.removeItem(key);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all stored items', async () => {
      // Arrange
      mockAsyncStorage.clear.mockResolvedValue();

      // Act
      const result = await secureStorage.clear();

      // Assert
      expect(result).toBe(true);
      expect(mockAsyncStorage.clear).toHaveBeenCalled();
    });

    it('should handle clear errors gracefully', async () => {
      // Arrange
      mockAsyncStorage.clear.mockRejectedValue(new Error('Clear error'));

      // Act
      const result = await secureStorage.clear();

      // Assert
      expect(result).toBe(false);
    });
  });
});
