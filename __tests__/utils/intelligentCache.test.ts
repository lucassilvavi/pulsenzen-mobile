import IntelligentCache, { cacheManager, caches } from '../../utils/intelligentCache';
import { logger } from '../../utils/logger';

// Mock do logger
jest.mock('../../utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('IntelligentCache', () => {
  let cache: IntelligentCache<string>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    cache = new IntelligentCache<string>('test-cache', {
      maxSize: 3,
      maxAge: 1000,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    cache.clear();
  });

  describe('Basic Operations', () => {
    it('should store and retrieve values', () => {
      cache.set('key1', 'value1');
      
      expect(cache.get('key1')).toBe('value1');
      expect(cache.has('key1')).toBe(true);
      expect(cache.size()).toBe(1);
    });

    it('should return undefined for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should delete specific keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe('value2');
      expect(cache.size()).toBe(1);
    });

    it('should clear all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      cache.clear();
      
      expect(cache.size()).toBe(0);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
    });

    it('should return all keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      const keys = cache.keys();
      
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys.length).toBe(2);
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should expire entries after maxAge', () => {
      cache.set('key1', 'value1');
      
      // Should be available immediately
      expect(cache.get('key1')).toBe('value1');
      
      // Advance time past maxAge
      jest.advanceTimersByTime(1001);
      
      // Should be expired now
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.has('key1')).toBe(false);
    });

    it('should support custom TTL per entry', () => {
      cache.set('key1', 'value1', 500); // Custom TTL of 500ms
      cache.set('key2', 'value2'); // Default TTL of 1000ms
      
      // Advance time to 600ms
      jest.advanceTimersByTime(600);
      
      expect(cache.get('key1')).toBeUndefined(); // Should be expired
      expect(cache.get('key2')).toBe('value2'); // Should still be valid
    });

    it('should handle entries without expiration', () => {
      const cacheNoTTL = new IntelligentCache('no-ttl', { maxAge: 0 });
      
      cacheNoTTL.set('key1', 'value1');
      
      // Advance time significantly
      jest.advanceTimersByTime(10000);
      
      // Should still be available
      expect(cacheNoTTL.get('key1')).toBe('value1');
      
      cacheNoTTL.clear();
    });
  });

  describe('LRU Eviction', () => {
    it('should evict least recently used entries when maxSize is reached', () => {
      jest.useFakeTimers();
      
      // Fill cache to capacity
      cache.set('key1', 'value1');
      jest.advanceTimersByTime(1);
      
      cache.set('key2', 'value2');
      jest.advanceTimersByTime(1);
      
      cache.set('key3', 'value3');
      jest.advanceTimersByTime(1);
      
      expect(cache.size()).toBe(3);
      
      // Access key1 to make it recently used
      cache.get('key1');
      jest.advanceTimersByTime(1);
      
      // Add new entry, should evict the oldest entry (key2 or key3, not key1)
      cache.set('key4', 'value4');
      
      expect(cache.size()).toBe(3);
      
      // key1 should still exist because it was accessed most recently
      expect(cache.get('key1')).toBe('value1');
      
      // key4 should exist because it was just added
      expect(cache.get('key4')).toBe('value4');
      
      // Two of the non-accessed keys should still exist, one should be evicted
      const key2Exists = cache.get('key2') !== undefined;
      const key3Exists = cache.get('key3') !== undefined;
      
      // Exactly one of key2 or key3 should be evicted
      expect(key2Exists !== key3Exists).toBe(true);
      
      jest.useRealTimers();
    });

    it('should not evict when updating existing entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      // Update existing entry
      cache.set('key2', 'new_value2');
      
      expect(cache.size()).toBe(3);
      expect(cache.get('key2')).toBe('new_value2');
    });
  });

  describe('Statistics Tracking', () => {
    it('should track hits and misses', () => {
      cache.set('key1', 'value1');
      
      // Hit
      cache.get('key1');
      
      // Miss
      cache.get('key2');
      
      const stats = cache.getStats();
      
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(50);
    });

    it('should track access count', () => {
      cache.set('key1', 'value1');
      
      // Access multiple times
      cache.get('key1');
      cache.get('key1');
      cache.get('key1');
      
      const debugInfo = cache.debug();
      const entry = debugInfo.find(item => item.key === 'key1');
      
      expect(entry?.entry.accessCount).toBe(3);
    });

    it('should track sets and evictions', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.set('key4', 'value4'); // Should trigger eviction
      
      const stats = cache.getStats();
      
      expect(stats.sets).toBe(4);
      expect(stats.evictions).toBe(1);
    });

    it('should calculate efficiency correctly', () => {
      cache.set('key1', 'value1');
      
      // Create some hits and misses
      cache.get('key1'); // hit
      cache.get('key1'); // hit
      cache.get('key2'); // miss
      
      const stats = cache.getStats();
      
      expect(stats.hitRate).toBe(66.67);
      expect(stats.efficiency).toBeDefined();
      expect(typeof stats.efficiency).toBe('number');
    });
  });

  describe('Cache Warming', () => {
    it('should warm cache with multiple entries', () => {
      const entries = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2', ttl: 500 },
        { key: 'key3', value: 'value3' },
      ];
      
      cache.warm(entries);
      
      expect(cache.size()).toBe(3);
      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
    });

    it('should respect custom TTL in warming', () => {
      cache.warm([
        { key: 'key1', value: 'value1', ttl: 500 }
      ]);
      
      jest.advanceTimersByTime(600);
      
      expect(cache.get('key1')).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle eviction callback errors gracefully', () => {
      const errorCallback = jest.fn().mockImplementation((key, value) => {
        throw new Error('Callback error');
      });
      
      const cache = new IntelligentCache<string>('test-cache-error', {
        maxSize: 2,
        onEviction: errorCallback
      });
      
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      // This should trigger eviction with error callback, but shouldn't throw
      expect(() => cache.set('key3', 'value3')).not.toThrow();
      
      expect(errorCallback).toHaveBeenCalled();
    });
  });

  describe('Memory Management', () => {
    it('should cleanup expired entries automatically', () => {
      cache.set('key1', 'value1', 100); // Short TTL
      cache.set('key2', 'value2', 2000); // Long TTL
      
      expect(cache.size()).toBe(2);
      
      // Advance time to expire first entry
      jest.advanceTimersByTime(150);
      
      // Trigger cleanup by accessing cache
      cache.get('key2');
      
      // First entry should be cleaned up when accessed
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.size()).toBe(1);
    });
  });

  describe('Debug Capabilities', () => {
    it('should provide debug information', () => {
      cache.set('key1', 'value1');
      cache.get('key1'); // Increase access count
      
      const debugInfo = cache.debug();
      
      expect(debugInfo).toHaveLength(1);
      expect(debugInfo[0].key).toBe('key1');
      expect(debugInfo[0].entry.data).toBe('value1');
      expect(debugInfo[0].entry.accessCount).toBe(1);
      expect(debugInfo[0].entry.timestamp).toBeDefined();
      expect(debugInfo[0].entry.lastAccessed).toBeDefined();
    });
  });
});

describe('CacheManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cacheManager.clearAll();
  });

  describe('Cache Creation and Management', () => {
    it('should create and retrieve caches', () => {
      const cache1 = cacheManager.createCache('test1');
      const cache2 = cacheManager.getCache('test1');
      
      expect(cache1).toBeDefined();
      expect(cache2).toBe(cache1);
    });

    it('should return same instance for existing cache', () => {
      const cache1 = cacheManager.createCache('test1');
      const cache2 = cacheManager.createCache('test1');
      
      expect(cache1).toBe(cache2);
    });

    it('should return undefined for non-existent cache', () => {
      const cache = cacheManager.getCache('nonexistent');
      
      expect(cache).toBeUndefined();
    });

    it('should remove caches', () => {
      const cache = cacheManager.createCache('test1');
      cache.set('key1', 'value1');
      
      expect(cacheManager.removeCache('test1')).toBe(true);
      expect(cacheManager.getCache('test1')).toBeUndefined();
    });

    it('should return false when removing non-existent cache', () => {
      expect(cacheManager.removeCache('nonexistent')).toBe(false);
    });
  });

  describe('Statistics Aggregation', () => {
    it('should aggregate stats from all caches', () => {
      const cache1 = cacheManager.createCache('test1');
      const cache2 = cacheManager.createCache('test2');
      
      cache1.set('key1', 'value1');
      cache2.set('key2', 'value2');
      
      cache1.get('key1'); // hit
      cache1.get('key3'); // miss
      cache2.get('key2'); // hit
      
      const allStats = cacheManager.getAllStats();
      
      expect(allStats.test1).toBeDefined();
      expect(allStats.test2).toBeDefined();
      expect(allStats.test1.hits).toBe(1);
      expect(allStats.test1.misses).toBe(1);
      expect(allStats.test2.hits).toBe(1);
      expect(allStats.test2.misses).toBe(0);
    });
  });

  describe('Clear All Caches', () => {
    it('should clear all managed caches', () => {
      const cache1 = cacheManager.createCache('test1');
      const cache2 = cacheManager.createCache('test2');
      
      cache1.set('key1', 'value1');
      cache2.set('key2', 'value2');
      
      cacheManager.clearAll();
      
      expect(cache1.size()).toBe(0);
      expect(cache2.size()).toBe(0);
    });
  });
});

describe('Pre-configured Caches', () => {
  afterEach(() => {
    cacheManager.clearAll();
  });

  it('should provide pre-configured cache instances', () => {
    expect(caches.api).toBeDefined();
    expect(caches.music).toBeDefined();
    expect(caches.user).toBeDefined();
    expect(caches.images).toBeDefined();
  });

  it('should allow operations on pre-configured caches', () => {
    caches.api.set('test-endpoint', { data: 'test' });
    
    expect(caches.api.get('test-endpoint')).toEqual({ data: 'test' });
    expect(caches.api.size()).toBe(1);
  });

  it('should have different configurations for different cache types', () => {
    caches.api.set('key1', 'value1');
    caches.music.set('key2', 'value2');
    
    // They should be separate caches
    expect(caches.api.get('key2')).toBeUndefined();
    expect(caches.music.get('key1')).toBeUndefined();
  });
});
