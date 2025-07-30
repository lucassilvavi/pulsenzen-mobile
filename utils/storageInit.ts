import { logger } from '../utils/logger';
import { secureStorage } from '../utils/secureStorage';

/**
 * Initialize storage and clean up any corrupted data
 * This should be called early in the app startup process
 */
export async function initializeStorage(): Promise<boolean> {
  try {
    logger.info('Storage', 'Initializing storage...');
    
    // Check storage health
    const health = await secureStorage.getStorageHealth();
    logger.info('Storage', 'Storage health check completed', health);
    
    // If there are corrupted keys, clean them up
    if (health.corruptedKeys > 0) {
      logger.warn('Storage', `Found ${health.corruptedKeys} corrupted storage items, cleaning up...`);
      const cleaned = await secureStorage.cleanupCorruptedData();
      logger.info('Storage', `Cleaned up ${cleaned} corrupted storage items`);
    }
    
    // Clean up expired items
    const expiredCleaned = await secureStorage.cleanupExpired();
    if (expiredCleaned > 0) {
      logger.info('Storage', `Cleaned up ${expiredCleaned} expired storage items`);
    }
    
    logger.info('Storage', 'Storage initialization completed successfully');
    return true;
  } catch (error) {
    logger.error('Storage', 'Storage initialization failed', error instanceof Error ? error : new Error(String(error)));
    
    // If initialization fails completely, we might need to clear all data
    try {
      logger.warn('Storage', 'Attempting to force clear all storage data...');
      await secureStorage.forceClearAllData();
      logger.info('Storage', 'Storage force cleared successfully');
      return true;
    } catch (clearError) {
      logger.error('Storage', 'Failed to force clear storage', clearError instanceof Error ? clearError : new Error(String(clearError)));
      return false;
    }
  }
}

/**
 * Emergency storage reset - use only when storage is completely corrupted
 */
export async function emergencyStorageReset(): Promise<boolean> {
  try {
    logger.warn('Storage', 'Performing emergency storage reset...');
    const success = await secureStorage.forceClearAllData();
    
    if (success) {
      logger.info('Storage', 'Emergency storage reset completed');
    } else {
      logger.error('Storage', 'Emergency storage reset failed');
    }
    
    return success;
  } catch (error) {
    logger.error('Storage', 'Emergency storage reset error', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}

/**
 * Get storage diagnostics for debugging
 */
export async function getStorageDiagnostics(): Promise<{
  health: any;
  keys: string[];
  size: number;
}> {
  try {
    const health = await secureStorage.getStorageHealth();
    const keys = await secureStorage.getAllKeys();
    const size = await secureStorage.getStorageSize();
    
    return {
      health,
      keys,
      size,
    };
  } catch (error) {
    logger.error('Storage', 'Failed to get storage diagnostics', error instanceof Error ? error : new Error(String(error)));
    return {
      health: { isHealthy: false, error: error instanceof Error ? error.message : String(error) },
      keys: [],
      size: 0,
    };
  }
}
