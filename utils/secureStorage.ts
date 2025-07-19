import AsyncStorage from '@react-native-async-storage/async-storage';
import { appConfig } from '../config/appConfig';

// Mock implementations for now - replace with real ones in production
const MockSecureStore = {
  getItemAsync: async (key: string) => AsyncStorage.getItem(`secure_${key}`),
  setItemAsync: async (key: string, value: string) => AsyncStorage.setItem(`secure_${key}`, value),
  deleteItemAsync: async (key: string) => AsyncStorage.removeItem(`secure_${key}`),
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
          rawData = await this.decrypt(rawData);
        }
      }

      if (!rawData) return null;

      const wrappedData: StorageItem<T> = JSON.parse(rawData);
      return this.unwrapData(wrappedData);
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
}

// Export singleton instance
export const secureStorage = SecureStorageManager.getInstance();
export default secureStorage;
