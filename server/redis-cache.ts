import { WeatherData } from '@shared/schema';
import { log } from './vite';

// In-memory cache implementation (since Redis may not be available in all environments)
class MemoryCache {
  private cache: Map<string, { data: WeatherData; expiry: number }>;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor() {
    this.cache = new Map();
    log('In-memory weather cache initialized', 'redis-cache');
    
    // Clean expired items periodically
    setInterval(() => this.cleanExpiredItems(), 60000); // Clean every minute
  }

  async get(key: string): Promise<WeatherData | null> {
    const cachedItem = this.cache.get(key);
    
    // Return null if key doesn't exist or has expired
    if (!cachedItem || cachedItem.expiry < Date.now()) {
      if (cachedItem) {
        // Remove expired item
        this.cache.delete(key);
      }
      return null;
    }
    
    log(`Cache hit for "${key}"`, 'redis-cache');
    return { ...cachedItem.data, cached: true, cachedAt: new Date(cachedItem.expiry - this.DEFAULT_TTL).toISOString() };
  }

  async set(key: string, value: WeatherData, ttl: number = this.DEFAULT_TTL): Promise<void> {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data: value, expiry });
    log(`Cached weather data for "${key}" (${ttl/1000}s)`, 'redis-cache');
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  private cleanExpiredItems(): void {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const [key, value] of this.cache.entries()) {
      if (value.expiry < now) {
        this.cache.delete(key);
        expiredCount++;
      }
    }
    
    if (expiredCount > 0) {
      log(`Cleaned ${expiredCount} expired cache items`, 'redis-cache');
    }
  }
}

// Export the cache instance
export const weatherCache = new MemoryCache();
