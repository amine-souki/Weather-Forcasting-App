import Redis from 'ioredis';
import { WeatherData } from '@shared/schema';
import { log } from './vite';

// Create Redis client with environment variables or defaults
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const DEFAULT_TTL = 5 * 60; // 5 minutes in seconds

// Create Redis client with options
let redisClient: Redis | null = null;
let useRedis = false;

try {
  redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    connectTimeout: 1000,
    lazyConnect: true
  });
  
  // Test connection
  redisClient.connect().then(() => {
    useRedis = true;
    log('Redis connection established successfully', 'redis');
  }).catch(err => {
    log(`Redis connection failed: ${err.message}. Using in-memory cache fallback.`, 'redis');
    useRedis = false;
  });
} catch (err) {
  log(`Redis initialization error: ${(err as Error).message}. Using in-memory cache fallback.`, 'redis');
  useRedis = false;
}

// In-memory fallback cache Map
const memCache = new Map<string, { data: WeatherData; expiry: number }>();

/**
 * Redis Cache for weather data with in-memory fallback
 */
class RedisCache {
  /**
   * Get weather data from cache
   */
  async get(key: string): Promise<WeatherData | null> {
    try {
      if (useRedis && redisClient) {
        // Try to get from Redis
        const data = await redisClient.get(key);
        if (!data) return null;
        
        // Parse the data and add cache flag
        const parsedData = JSON.parse(data) as WeatherData;
        log(`Cache hit for "${key}" from Redis`, 'redis');
        return { ...parsedData, cached: true, cachedAt: new Date(parsedData.cachedAt || new Date()).toISOString() };
      } else {
        // Fallback to in-memory cache
        const cachedItem = memCache.get(key);
        
        // Return null if key doesn't exist or has expired
        if (!cachedItem || cachedItem.expiry < Date.now()) {
          if (cachedItem) {
            // Remove expired item
            memCache.delete(key);
          }
          return null;
        }
        
        log(`Cache hit for "${key}" from memory cache`, 'redis');
        return { ...cachedItem.data, cached: true, cachedAt: new Date(cachedItem.expiry - (DEFAULT_TTL * 1000)).toISOString() };
      }
    } catch (error) {
      log(`Cache get error: ${(error as Error).message}`, 'redis');
      return null;
    }
  }

  /**
   * Set weather data in cache
   */
  async set(key: string, value: WeatherData, ttl: number = DEFAULT_TTL): Promise<void> {
    try {
      const valueWithTimestamp = {
        ...value,
        cachedAt: new Date().toISOString()
      };
      
      if (useRedis && redisClient) {
        // Store in Redis with expiration
        await redisClient.set(key, JSON.stringify(valueWithTimestamp), 'EX', ttl);
        log(`Cached weather data for "${key}" in Redis (${ttl}s)`, 'redis');
      } else {
        // Fallback to in-memory cache
        const expiry = Date.now() + (ttl * 1000);
        memCache.set(key, { data: valueWithTimestamp, expiry });
        log(`Cached weather data for "${key}" in memory (${ttl}s)`, 'redis');
      }
    } catch (error) {
      log(`Cache set error: ${(error as Error).message}`, 'redis');
    }
  }

  /**
   * Delete an item from cache
   */
  async delete(key: string): Promise<void> {
    try {
      if (useRedis && redisClient) {
        await redisClient.del(key);
      }
      memCache.delete(key);
    } catch (error) {
      log(`Cache delete error: ${(error as Error).message}`, 'redis');
    }
  }

  /**
   * Clean expired items from memory cache
   */
  cleanMemoryCache(): void {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const [key, value] of memCache.entries()) {
      if (value.expiry < now) {
        memCache.delete(key);
        expiredCount++;
      }
    }
    
    if (expiredCount > 0) {
      log(`Cleaned ${expiredCount} expired memory cache items`, 'redis');
    }
  }
}

// Start cleaning expired items from memory cache periodically
setInterval(() => {
  weatherCache.cleanMemoryCache();
}, 60000); // Clean every minute

// Export the cache instance
export const weatherCache = new RedisCache();