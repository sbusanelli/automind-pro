import { logger } from '../utils/logger';

// Simple in-memory cache as Redis alternative
class MemoryCache {
  private cache: Map<string, { value: any; expiry?: number }> = new Map();

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const expiry = ttl ? Date.now() + ttl * 1000 : undefined;
    this.cache.set(key, { value, expiry });
  }

  async get(key: string): Promise<any> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  async flush(): Promise<void> {
    this.cache.clear();
  }
}

let cache: MemoryCache;

export const connectRedis = async (): Promise<void> => {
  try {
    cache = new MemoryCache();
    logger.info('In-memory cache initialized successfully');
  } catch (error) {
    logger.error('Cache initialization failed:', error);
    throw error;
  }
};

export const getCache = (): MemoryCache => {
  if (!cache) {
    throw new Error('Cache not initialized. Call connectRedis() first.');
  }
  return cache;
};

export const closeRedis = async (): Promise<void> => {
  if (cache) {
    await cache.flush();
    logger.info('Cache connection closed');
  }
};
