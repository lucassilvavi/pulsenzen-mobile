import { secureStorage } from './secureStorage';
import { logger } from './logger';
import { performanceMonitor } from './performanceMonitor';

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
  compress?: boolean;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[]; // For batch invalidation
}

export interface CacheItem<T = any> {
  key: string;
  data: T;
  timestamp: number;
  ttl?: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  compressed: boolean;
}

export interface CacheStats {
  totalItems: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  avgAccessTime: number;
  oldestItem: number;
  newestItem: number;
}

class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheItem> = new Map();
  private accessTimes: number[] = [];
  private hits = 0;
  private misses = 0;
  private maxCacheSize = 100; // Default max items
  private maxMemorySize = 50 * 1024 * 1024; // 50MB
  private cleanupInterval: number | null = null;

  private constructor() {
    this.initializeCache();
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private async initializeCache(): Promise<void> {
    try {
      // Load persistent cache from storage
      await this.loadPersistentCache();
      
      // Start cleanup routine
      this.startCleanupRoutine();
      
      logger.info('CacheManager', 'Cache system initialized', {
        maxItems: this.maxCacheSize,
        maxMemory: this.maxMemorySize,
      });
    } catch (error) {
      logger.error('CacheManager', 'Failed to initialize cache', error as Error);
    }
  }

  private async loadPersistentCache(): Promise<void> {
    try {
      const persistentData = await secureStorage.getItem<CacheItem[]>('cache_persistent');
      if (persistentData && Array.isArray(persistentData)) {
        for (const item of persistentData) {
          // Check if item is still valid
          if (!this.isExpired(item)) {
            this.cache.set(item.key, item);
          }
        }
        logger.info('CacheManager', `Loaded ${this.cache.size} items from persistent cache`);
      }
    } catch (error) {
      logger.warn('CacheManager', 'Failed to load persistent cache', { error });
    }
  }

  private async savePersistentCache(): Promise<void> {
    try {
      // Save only high priority items to persistent storage
      const persistentItems = Array.from(this.cache.values())
        .filter(item => item.priority === 'high' && !this.isExpired(item));
      
      await secureStorage.setItem('cache_persistent', persistentItems, {
        expiry: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    } catch (error) {
      logger.warn('CacheManager', 'Failed to save persistent cache', { error });
    }
  }

  private startCleanupRoutine(): void {
    // Cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private calculateSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  private compress(data: any): string {
    // Simple compression simulation - use a real compression library in production
    try {
      const jsonString = JSON.stringify(data);
      // In production, use libraries like lz-string or pako
      return btoa(jsonString);
    } catch (error) {
      logger.warn('CacheManager', 'Compression failed', { error });
      return JSON.stringify(data);
    }
  }

  private decompress(compressedData: string): any {
    try {
      // Simple decompression simulation
      const jsonString = atob(compressedData);
      return JSON.parse(jsonString);
    } catch (error) {
      logger.warn('CacheManager', 'Decompression failed', { error });
      return JSON.parse(compressedData);
    }
  }

  private isExpired(item: CacheItem): boolean {
    if (!item.ttl) return false;
    return Date.now() > item.timestamp + item.ttl;
  }

  private evictLRU(): void {
    if (this.cache.size <= this.maxCacheSize) return;

    // Find least recently used item with lowest priority
    let oldestItem: CacheItem | null = null;
    let oldestKey = '';

    for (const [key, item] of this.cache.entries()) {
      if (item.priority === 'high') continue; // Never evict high priority items
      
      if (!oldestItem || item.lastAccessed < oldestItem.lastAccessed) {
        oldestItem = item;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      logger.debug('CacheManager', 'Evicted LRU item', { key: oldestKey });
    }
  }

  private cleanup(): void {
    const initialSize = this.cache.size;
    const expiredKeys: string[] = [];

    // Remove expired items
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));

    // Check memory usage
    const totalSize = this.getTotalSize();
    if (totalSize > this.maxMemorySize) {
      this.evictBySize();
    }

    // Save persistent items
    this.savePersistentCache();

    const cleanedCount = initialSize - this.cache.size;
    if (cleanedCount > 0) {
      logger.info('CacheManager', 'Cache cleanup completed', {
        itemsRemoved: cleanedCount,
        currentSize: this.cache.size,
        memoryUsage: totalSize,
      });
    }
  }

  private evictBySize(): void {
    const items = Array.from(this.cache.entries())
      .map(([key, item]) => ({ key, item }))
      .sort((a, b) => {
        // Sort by priority (low first) then by last accessed
        if (a.item.priority !== b.item.priority) {
          const priorityOrder = { low: 0, medium: 1, high: 2 };
          return priorityOrder[a.item.priority] - priorityOrder[b.item.priority];
        }
        return a.item.lastAccessed - b.item.lastAccessed;
      });

    let currentSize = this.getTotalSize();
    let removedCount = 0;

    for (const { key, item } of items) {
      if (currentSize <= this.maxMemorySize * 0.8) break; // Target 80% of max
      if (item.priority === 'high') continue;

      this.cache.delete(key);
      currentSize -= item.size;
      removedCount++;
    }

    logger.info('CacheManager', 'Size-based eviction completed', {
      itemsRemoved: removedCount,
      newSize: currentSize,
    });
  }

  private getTotalSize(): number {
    return Array.from(this.cache.values()).reduce((total, item) => total + item.size, 0);
  }

  public async set<T>(
    key: string,
    data: T,
    options: CacheOptions = {}
  ): Promise<boolean> {
    const startTime = Date.now();

    try {
      const {
        ttl,
        compress = false,
        priority = 'medium',
        tags = [],
      } = options;

      // Compress data if requested
      const processedData = compress ? this.compress(data) : data;
      const size = this.calculateSize(processedData);

      const item: CacheItem = {
        key,
        data: processedData,
        timestamp: Date.now(),
        ttl,
        accessCount: 0,
        lastAccessed: Date.now(),
        size,
        priority,
        tags,
        compressed: compress,
      };

      // Check if we need to evict items
      this.evictLRU();

      this.cache.set(key, item);

      const duration = Date.now() - startTime;
      performanceMonitor.trackStorageOperation('write', key, duration, size);

      logger.debug('CacheManager', 'Item cached', {
        key,
        size,
        compressed: compress,
        priority,
        ttl,
      });

      return true;
    } catch (error) {
      logger.error('CacheManager', 'Failed to cache item', error as Error, { key });
      return false;
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();

    try {
      const item = this.cache.get(key);

      if (!item) {
        this.misses++;
        performanceMonitor.trackStorageOperation('read', key, Date.now() - startTime);
        return null;
      }

      if (this.isExpired(item)) {
        this.cache.delete(key);
        this.misses++;
        logger.debug('CacheManager', 'Cache item expired', { key });
        return null;
      }

      // Update access statistics
      item.accessCount++;
      item.lastAccessed = Date.now();
      this.hits++;

      // Decompress if needed
      const data = item.compressed ? this.decompress(item.data as string) : item.data;

      const duration = Date.now() - startTime;
      this.accessTimes.push(duration);
      
      // Keep only last 100 access times for average calculation
      if (this.accessTimes.length > 100) {
        this.accessTimes = this.accessTimes.slice(-100);
      }

      performanceMonitor.trackStorageOperation('read', key, duration, item.size);

      logger.debug('CacheManager', 'Cache hit', {
        key,
        accessCount: item.accessCount,
        age: Date.now() - item.timestamp,
      });

      return data;
    } catch (error) {
      logger.error('CacheManager', 'Failed to retrieve cached item', error as Error, { key });
      this.misses++;
      return null;
    }
  }

  public has(key: string): boolean {
    const item = this.cache.get(key);
    return item !== undefined && !this.isExpired(item);
  }

  public delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug('CacheManager', 'Item deleted from cache', { key });
    }
    return deleted;
  }

  public invalidateByTag(tag: string): number {
    let deletedCount = 0;
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (item.tags.includes(tag)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      deletedCount++;
    });

    logger.info('CacheManager', 'Cache invalidated by tag', {
      tag,
      itemsDeleted: deletedCount,
    });

    return deletedCount;
  }

  public clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.accessTimes = [];
    logger.info('CacheManager', 'Cache cleared');
  }

  public getStats(): CacheStats {
    const items = Array.from(this.cache.values());
    const totalAccesses = this.hits + this.misses;
    
    return {
      totalItems: this.cache.size,
      totalSize: this.getTotalSize(),
      hitRate: totalAccesses > 0 ? (this.hits / totalAccesses) * 100 : 0,
      missRate: totalAccesses > 0 ? (this.misses / totalAccesses) * 100 : 0,
      avgAccessTime: this.accessTimes.length > 0 
        ? this.accessTimes.reduce((a, b) => a + b, 0) / this.accessTimes.length 
        : 0,
      oldestItem: items.length > 0 ? Math.min(...items.map(i => i.timestamp)) : 0,
      newestItem: items.length > 0 ? Math.max(...items.map(i => i.timestamp)) : 0,
    };
  }

  public getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  public getSize(): number {
    return this.cache.size;
  }

  public setMaxSize(maxItems: number): void {
    this.maxCacheSize = maxItems;
    this.evictLRU();
  }

  public setMaxMemorySize(maxBytes: number): void {
    this.maxMemorySize = maxBytes;
    this.evictBySize();
  }

  public warmup(items: { key: string; data: any; options?: CacheOptions }[]): Promise<void> {
    return Promise.all(
      items.map(({ key, data, options }) => this.set(key, data, options))
    ).then(() => {
      logger.info('CacheManager', 'Cache warmup completed', {
        itemsWarmed: items.length,
      });
    });
  }

  public exportCache(): string {
    const cacheData = {
      stats: this.getStats(),
      items: Array.from(this.cache.entries()).map(([key, item]) => ({
        key,
        size: item.size,
        priority: item.priority,
        accessCount: item.accessCount,
        age: Date.now() - item.timestamp,
        tags: item.tags,
      })),
    };

    return JSON.stringify(cacheData, null, 2);
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
    this.savePersistentCache();
    logger.info('CacheManager', 'Cache manager destroyed');
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();
export default cacheManager;
