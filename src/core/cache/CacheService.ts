/**
 * Simple Cache Service using LocalStorage
 * Supports TTL (Time To Live) and stale-while-revalidate pattern
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export const CacheService = {
  set: <T>(key: string, data: T, ttlMinutes: number = 60): void => {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMinutes * 60 * 1000,
    };
    localStorage.setItem(`ff_cache_${key}`, JSON.stringify(item));
  },

  get: <T>(key: string): T | null => {
    const raw = localStorage.getItem(`ff_cache_${key}`);
    if (!raw) return null;

    try {
      const item: CacheItem<T> = JSON.parse(raw);
      return item.data;
    } catch (e) {
      console.error(`Cache parse error for key: ${key}`, e);
      return null;
    }
  },

  isStale: (key: string): boolean => {
    const raw = localStorage.getItem(`ff_cache_${key}`);
    if (!raw) return true;

    try {
      const item: CacheItem<any> = JSON.parse(raw);
      return Date.now() > item.expiresAt;
    } catch {
      return true;
    }
  },

  remove: (key: string): void => {
    localStorage.removeItem(`ff_cache_${key}`);
  },

  clear: (): void => {
    Object.keys(localStorage)
      .filter(key => key.startsWith('ff_cache_'))
      .forEach(key => localStorage.removeItem(key));
  }
};
