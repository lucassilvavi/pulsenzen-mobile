import { logger } from '../utils/logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  expiresAt?: number;
}

interface CacheOptions {
  maxAge?: number; // Time in milliseconds
  maxSize?: number; // Max number of entries
  onEviction?: (key: string, value: any) => void;
  persist?: boolean; // Whether to persist to storage
  version?: string; // Cache version for invalidation
}

/**
 * Sistema de cache inteligente com:
 * - LRU eviction
 * - TTL support
 * - Memory management
 * - Statistics tracking
 * - Persistent storage
 * - Cache warming
 */
export class IntelligentCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private maxAge: number;
  private onEviction?: (key: string, value: T) => void;
  private persist: boolean;
  private version: string;
  private name: string;
  
  // Statistics
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    evictions: 0,
    size: 0,
  };

  constructor(name: string, options: CacheOptions = {}) {
    this.name = name;
    this.maxSize = options.maxSize || 100;
    this.maxAge = options.maxAge || 30 * 60 * 1000; // 30 minutes default
    this.onEviction = options.onEviction;
    this.persist = options.persist || false;
    this.version = options.version || '1.0';

    // Load from persistent storage if enabled
    if (this.persist) {
      this.loadFromStorage();
    }

    // Cleanup expired entries periodically
    this.startCleanupTimer();
  }

  /**
   * Get value from cache
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      logger.debug('IntelligentCache', `Cache miss for key: ${key}`, { cache: this.name });
      return undefined;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      logger.debug('IntelligentCache', `Cache entry expired: ${key}`, { cache: this.name });
      return undefined;
    }

    // Update access info
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    this.stats.hits++;
    logger.debug('IntelligentCache', `Cache hit for key: ${key}`, { 
      cache: this.name,
      accessCount: entry.accessCount 
    });
    
    return entry.data;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, customTTL?: number): void {
    const now = Date.now();
    const expiresAt = customTTL ? now + customTTL : now + this.maxAge;
    const isUpdate = this.cache.has(key);

    // Check if we need to evict before adding NEW entries (not updates)
    if (this.cache.size >= this.maxSize && !isUpdate) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data: value,
      timestamp: now,
      accessCount: 0, // Start with 0, will be incremented on first access
      lastAccessed: now,
      expiresAt,
    };

    this.cache.set(key, entry);
    this.stats.sets++;
    this.stats.size = this.cache.size;

    logger.debug('IntelligentCache', `Cached value for key: ${key}`, { 
      cache: this.name,
      size: this.cache.size,
      maxSize: this.maxSize,
      isUpdate 
    });

    // Persist if enabled
    if (this.persist) {
      this.saveToStorage();
    }
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Delete specific key
   */
  delete(key: string): boolean {
    const had = this.cache.has(key);
    if (had) {
      const entry = this.cache.get(key);
      this.cache.delete(key);
      this.stats.size = this.cache.size;
      
      if (entry && this.onEviction) {
        this.onEviction(key, entry.data);
      }
    }
    return had;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.size = 0;
    this.stats.evictions += size;
    
    logger.info('IntelligentCache', `Cleared cache: ${this.name}`, { clearedItems: size });
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 
      : 0;

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
      efficiency: this.calculateEfficiency(),
    };
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Warm cache with predefined values
   */
  warm(entries: Array<{ key: string; value: T; ttl?: number }>): void {
    logger.info('IntelligentCache', `Warming cache: ${this.name}`, { entries: entries.length });
    
    entries.forEach(({ key, value, ttl }) => {
      this.set(key, value, ttl);
    });
  }

  /**
   * Get cache entries for debugging
   */
  debug(): Array<{ key: string; entry: CacheEntry<T> }> {
    return Array.from(this.cache.entries()).map(([key, entry]) => ({ key, entry }));
  }

  // Private methods

  private isExpired(entry: CacheEntry<T>): boolean {
    return entry.expiresAt ? Date.now() > entry.expiresAt : false;
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Number.MAX_SAFE_INTEGER; // Start with max value, not current time

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const entry = this.cache.get(oldestKey);
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      this.stats.size = this.cache.size; // Update size after eviction
      
      logger.debug('IntelligentCache', `Evicted LRU entry: ${oldestKey}`, { 
        cache: this.name,
        lastAccessed: new Date(oldestTime).toISOString(),
        newSize: this.cache.size
      });

      if (entry && this.onEviction) {
        try {
          this.onEviction(oldestKey, entry.data);
        } catch (error) {
          logger.error('IntelligentCache', 'Error in eviction callback', error instanceof Error ? error : undefined);
        }
      }
    }
  }

  private calculateEfficiency(): number {
    // Efficiency based on hit rate and memory usage
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses)) 
      : 0;
    
    const memoryEfficiency = this.cache.size / this.maxSize;
    
    return Math.round((hitRate * 0.7 + (1 - memoryEfficiency) * 0.3) * 100) / 100;
  }

  private cleanupExpired(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        cleaned++;
        
        if (this.onEviction) {
          this.onEviction(key, entry.data);
        }
      }
    }

    if (cleaned > 0) {
      this.stats.evictions += cleaned;
      this.stats.size = this.cache.size;
      
      logger.debug('IntelligentCache', `Cleaned expired entries: ${cleaned}`, { 
        cache: this.name,
        remaining: this.cache.size 
      });
    }
  }

  private startCleanupTimer(): void {
    // Cleanup every 5 minutes
    setInterval(() => {
      this.cleanupExpired();
    }, 5 * 60 * 1000);
  }

  private async loadFromStorage(): Promise<void> {
    if (!this.persist) return;

    try {
      // In a real implementation, you'd use AsyncStorage or similar
      // For now, we'll just log that we would load from storage
      logger.debug('IntelligentCache', `Would load ${this.name} from persistent storage`);
    } catch (error) {
      logger.error('IntelligentCache', 'Failed to load from storage', error instanceof Error ? error : undefined);
    }
  }

  private async saveToStorage(): Promise<void> {
    if (!this.persist) return;

    try {
      // In a real implementation, you'd use AsyncStorage or similar
      // For now, we'll just log that we would save to storage
      logger.debug('IntelligentCache', `Would save ${this.name} to persistent storage`, {
        size: this.cache.size
      });
    } catch (error) {
      logger.error('IntelligentCache', 'Failed to save to storage', error instanceof Error ? error : undefined);
    }
  }
}

/**
 * Cache manager singleton for managing multiple caches
 */
class CacheManager {
  private caches = new Map<string, IntelligentCache>();

  createCache<T>(name: string, options?: CacheOptions): IntelligentCache<T> {
    if (this.caches.has(name)) {
      return this.caches.get(name) as IntelligentCache<T>;
    }

    const cache = new IntelligentCache<T>(name, options);
    this.caches.set(name, cache);
    
    logger.info('CacheManager', `Created cache: ${name}`, options);
    
    return cache;
  }

  getCache<T>(name: string): IntelligentCache<T> | undefined {
    return this.caches.get(name) as IntelligentCache<T>;
  }

  getAllStats() {
    const stats: Record<string, any> = {};
    
    for (const [name, cache] of this.caches.entries()) {
      stats[name] = cache.getStats();
    }
    
    return stats;
  }

  clearAll(): void {
    for (const [name, cache] of this.caches.entries()) {
      cache.clear();
    }
    
    logger.info('CacheManager', 'Cleared all caches');
  }

  removeCache(name: string): boolean {
    const cache = this.caches.get(name);
    if (cache) {
      cache.clear();
      this.caches.delete(name);
      logger.info('CacheManager', `Removed cache: ${name}`);
      return true;
    }
    return false;
  }
}

export const cacheManager = new CacheManager();

// Pre-configured caches for common use cases
export const caches = {
  api: cacheManager.createCache('api-responses', {
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxSize: 50,
    persist: true,
  }),
  
  music: cacheManager.createCache('music-data', {
    maxAge: 30 * 60 * 1000, // 30 minutes
    maxSize: 100,
    persist: true,
  }),
  
  user: cacheManager.createCache('user-data', {
    maxAge: 60 * 60 * 1000, // 1 hour
    maxSize: 20,
    persist: true,
  }),
  
  images: cacheManager.createCache('image-cache', {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    maxSize: 200,
    persist: true,
  }),
};

export default IntelligentCache;
