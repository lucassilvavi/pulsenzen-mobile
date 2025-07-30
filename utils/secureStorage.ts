import AsyncStorage from '@react-native-async-storage/async-storage';
import { appConfig } from '../config/appConfig';

// Fallback storage for when AsyncStorage is not available
const fallbackStorage = new Map<string, string>();

// Mock implementations for now - replace with real ones in production
const MockSecureStore = {
  getItemAsync: async (key: string) => {
    try {
      if (AsyncStorage && AsyncStorage.getItem) {
        return await AsyncStorage.getItem(`secure_${key}`);
      } else {
        return fallbackStorage.get(`secure_${key}`) || null;
      }
    } catch (error) {
      console.warn('AsyncStorage not available, using fallback:', error);
      return fallbackStorage.get(`secure_${key}`) || null;
    }
  },
  
  setItemAsync: async (key: string, value: string) => {
    try {
      if (AsyncStorage && AsyncStorage.setItem) {
        return await AsyncStorage.setItem(`secure_${key}`, value);
      } else {
        fallbackStorage.set(`secure_${key}`, value);
      }
    } catch (error) {
      console.warn('AsyncStorage not available, using fallback:', error);
      fallbackStorage.set(`secure_${key}`, value);
    }
  },
  
  deleteItemAsync: async (key: string) => {
    try {
      if (AsyncStorage && AsyncStorage.removeItem) {
        return await AsyncStorage.removeItem(`secure_${key}`);
      } else {
        fallbackStorage.delete(`secure_${key}`);
      }
    } catch (error) {
      console.warn('AsyncStorage not available, using fallback:', error);
      fallbackStorage.delete(`secure_${key}`);
    }
  },
};

const MockCrypto = {
  getRandomBytesAsync: async (length: number): Promise<Uint8Array> => {
    const array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  },
};

export interface StorageOptions {
  encrypt?: boolean;
  useSecureStore?: boolean;
  expiry?: number; // milliseconds
}

export interface StorageItem<T = any> {
  data: T;
  timestamp: number;
  expiry?: number;
  version: string;
}

class SecureStorageManager {
  private static instance: SecureStorageManager;
  private encryptionKey: string | null = null;

  private constructor() {
    this.initializeEncryption();
  }

  public static getInstance(): SecureStorageManager {
    if (!SecureStorageManager.instance) {
      SecureStorageManager.instance = new SecureStorageManager();
    }
    return SecureStorageManager.instance;
  }

  private async initializeEncryption(): Promise<void> {
    try {
      // Try to get existing key
      this.encryptionKey = await MockSecureStore.getItemAsync('encryption_key');
      
      if (!this.encryptionKey) {
        // Generate new key
        this.encryptionKey = await this.generateEncryptionKey();
        await MockSecureStore.setItemAsync('encryption_key', this.encryptionKey);
      }
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      // Fallback to non-encrypted mode
      this.encryptionKey = null;
    }
  }

  private async generateEncryptionKey(): Promise<string> {
    const randomBytes = await MockCrypto.getRandomBytesAsync(32);
    return Array.from(randomBytes, (byte: number) => byte.toString(16).padStart(2, '0')).join('');
  }

  private isValidBase64(str: string): boolean {
    try {
      // Check if string has valid base64 format
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(str)) {
        return false;
      }
      
      // Check if length is valid (must be multiple of 4)
      if (str.length % 4 !== 0) {
        return false;
      }
      
      // Try to decode - if it fails, it's not valid base64
      atob(str);
      return true;
    } catch {
      return false;
    }
  }

  private async encrypt(data: string): Promise<string> {
    if (!this.encryptionKey || !appConfig.getConfig().security.encryptionEnabled) {
      return data;
    }

    try {
      // Simple XOR encryption for demo - use proper encryption in production
      const key = this.encryptionKey;
      let encrypted = '';
      for (let i = 0; i < data.length; i++) {
        encrypted += String.fromCharCode(
          data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      return btoa(encrypted);
    } catch (error) {
      console.error('Encryption failed:', error);
      return data;
    }
  }

  private async decrypt(encryptedData: string): Promise<string> {
    if (!this.encryptionKey || !appConfig.getConfig().security.encryptionEnabled) {
      return encryptedData;
    }

    // Validate if data is actually base64 encoded
    if (!this.isValidBase64(encryptedData)) {
      console.warn('Data is not valid base64, returning as-is');
      return encryptedData;
    }

    try {
      const data = atob(encryptedData);
      const key = this.encryptionKey;
      let decrypted = '';
      for (let i = 0; i < data.length; i++) {
        decrypted += String.fromCharCode(
          data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedData;
    }
  }

  private wrapData<T>(data: T, expiry?: number): StorageItem<T> {
    return {
      data,
      timestamp: Date.now(),
      expiry: expiry ? Date.now() + expiry : undefined,
      version: appConfig.getConfig().environment.version,
    };
  }

  private unwrapData<T>(item: StorageItem<T>): T | null {
    // Check expiry
    if (item.expiry && Date.now() > item.expiry) {
      return null;
    }

    // Check version compatibility
    const currentVersion = appConfig.getConfig().environment.version;
    if (item.version !== currentVersion) {
      console.warn(`Storage version mismatch: ${item.version} vs ${currentVersion}`);
      // Could implement migration logic here
    }

    return item.data;
  }

  public async setItem<T>(
    key: string, 
    value: T, 
    options: StorageOptions = {}
  ): Promise<boolean> {
    try {
      const wrappedData = this.wrapData(value, options.expiry);
      const jsonData = JSON.stringify(wrappedData);
      
      if (options.useSecureStore) {
        await MockSecureStore.setItemAsync(key, jsonData);
      } else {
        const dataToStore = options.encrypt !== false 
          ? await this.encrypt(jsonData)
          : jsonData;
        await AsyncStorage.setItem(key, dataToStore);
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to store item ${key}:`, error);
      return false;
    }
  }

  public async getItem<T>(
    key: string, 
    options: StorageOptions = {}
  ): Promise<T | null> {
    try {
      let rawData: string | null;
      
      if (options.useSecureStore) {
        rawData = await MockSecureStore.getItemAsync(key);
      } else {
        rawData = await AsyncStorage.getItem(key);
        if (rawData && options.encrypt !== false) {
          // Only try to decrypt if the data looks like it might be encrypted
          if (this.isValidBase64(rawData)) {
            rawData = await this.decrypt(rawData);
          } else {
            console.warn(`Data for key ${key} is not valid base64, skipping decryption`);
          }
        }
      }

      if (!rawData) return null;

      // Try to parse as new format first
      try {
        const wrappedData: StorageItem<T> = JSON.parse(rawData);
        
        // Validate that it has the expected structure
        if (wrappedData && typeof wrappedData === 'object' && 'data' in wrappedData && 'timestamp' in wrappedData) {
          return this.unwrapData(wrappedData);
        } else {
          // If it doesn't have the expected structure, treat as legacy data
          console.warn(`Data for key ${key} doesn't match expected format, treating as legacy`);
          return rawData as unknown as T;
        }
      } catch (parseError) {
        // If parsing fails, try to handle legacy data
        console.warn(`Legacy data format detected for key ${key}, attempting migration`);
        
        // If it's a simple string value (like old token format)
        if (typeof rawData === 'string' && !rawData.startsWith('{')) {
          // Return as-is for simple strings
          return rawData as unknown as T;
        }
        
        // If it looks like old JSON but corrupted, clear it
        console.warn(`Corrupted data detected for key ${key}, clearing...`);
        await this.removeItem(key, options.useSecureStore);
        return null;
      }
    } catch (error) {
      console.error(`Failed to retrieve item ${key}:`, error);
      return null;
    }
  }

  public async removeItem(key: string, useSecureStore = false): Promise<boolean> {
    try {
      if (useSecureStore) {
        await MockSecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
      return true;
    } catch (error) {
      console.error(`Failed to remove item ${key}:`, error);
      return false;
    }
  }

  public async clear(includeSecureStore = false): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      
      if (includeSecureStore) {
        // Note: SecureStore doesn't have a clear all method
        // You'd need to track keys and delete individually
        console.warn('SecureStore clear not implemented - delete keys individually');
      }
      
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }

  public async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return Array.from(keys);
    } catch (error) {
      console.error('Failed to get all keys:', error);
      return [];
    }
  }

  public async getStorageSize(): Promise<number> {
    try {
      const keys = await this.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
      return 0;
    }
  }

  public async cleanupExpired(): Promise<number> {
    try {
      const keys = await this.getAllKeys();
      let cleanedCount = 0;
      
      for (const key of keys) {
        const item = await this.getItem(key);
        if (item === null) {
          await this.removeItem(key);
          cleanedCount++;
        }
      }
      
      return cleanedCount;
    } catch (error) {
      console.error('Failed to cleanup expired items:', error);
      return 0;
    }
  }

  /**
   * Clean corrupted or incompatible data on app startup
   */
  public async cleanupCorruptedData(): Promise<number> {
    try {
      const keys = await this.getAllKeys();
      let cleanedCount = 0;
      
      for (const key of keys) {
        try {
          const rawData = await AsyncStorage.getItem(key);
          if (rawData) {
            // If the data looks like it should be encrypted but isn't valid base64
            const config = appConfig.getConfig();
            if (config.security.encryptionEnabled && this.encryptionKey && !key.startsWith('secure_')) {
              if (!this.isValidBase64(rawData) && rawData.startsWith('{')) {
                // This might be unencrypted JSON that should be encrypted
                console.warn(`Found unencrypted data for key: ${key}, re-encrypting...`);
                const encrypted = await this.encrypt(rawData);
                await AsyncStorage.setItem(key, encrypted);
                continue;
              }
            }
            
            // Try to parse the data to see if it's valid
            if (rawData.startsWith('{')) {
              JSON.parse(rawData);
            } else if (this.isValidBase64(rawData)) {
              // Try to decrypt if it looks encrypted
              await this.decrypt(rawData);
            }
          }
        } catch (parseError) {
          console.warn(`Removing corrupted data for key: ${key}`, parseError);
          await this.removeItem(key);
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} corrupted storage items`);
      }
      
      return cleanedCount;
    } catch (error) {
      console.error('Failed to cleanup corrupted data:', error);
      return 0;
    }
  }

  /**
   * Force clear all storage data - use with caution
   */
  public async forceClearAllData(): Promise<boolean> {
    try {
      console.warn('Force clearing all storage data...');
      
      // Clear AsyncStorage
      await AsyncStorage.clear();
      
      // Clear fallback storage
      fallbackStorage.clear();
      
      // Reset encryption key
      this.encryptionKey = null;
      await this.initializeEncryption();
      
      console.log('All storage data cleared successfully');
      return true;
    } catch (error) {
      console.error('Failed to force clear storage:', error);
      return false;
    }
  }

  /**
   * Check storage health and return stats
   */
  public async getStorageHealth(): Promise<{
    totalKeys: number;
    corruptedKeys: number;
    encryptedKeys: number;
    totalSize: number;
    isHealthy: boolean;
  }> {
    try {
      const keys = await this.getAllKeys();
      let corruptedKeys = 0;
      let encryptedKeys = 0;
      
      for (const key of keys) {
        try {
          const rawData = await AsyncStorage.getItem(key);
          if (rawData) {
            // Check if data is base64 (potentially encrypted)
            if (this.isValidBase64(rawData)) {
              encryptedKeys++;
            }
            
            // Try to parse/decrypt
            if (rawData.startsWith('{')) {
              JSON.parse(rawData);
            } else if (this.isValidBase64(rawData)) {
              await this.decrypt(rawData);
            }
          }
        } catch {
          corruptedKeys++;
        }
      }
      
      const totalSize = await this.getStorageSize();
      
      return {
        totalKeys: keys.length,
        corruptedKeys,
        encryptedKeys,
        totalSize,
        isHealthy: corruptedKeys === 0,
      };
    } catch (error) {
      console.error('Failed to check storage health:', error);
      return {
        totalKeys: 0,
        corruptedKeys: 0,
        encryptedKeys: 0,
        totalSize: 0,
        isHealthy: false,
      };
    }
  }
}

// Export singleton instance
export const secureStorage = SecureStorageManager.getInstance();
export default secureStorage;
