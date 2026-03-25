/**
 * API Caching Utility
 *
 * Provides client-side caching for API requests with:
 * - Configurable TTL (time-to-live)
 * - Smart cache invalidation
 * - Memory-efficient storage
 * - Cache size limits
 * - Request deduplication
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheConfig {
  /** Default time-to-live in milliseconds (default: 5 minutes) */
  defaultTTL?: number;
  /** Maximum number of cached entries (default: 100) */
  maxEntries?: number;
  /** Whether to use sessionStorage for persistence (default: false) */
  persistent?: boolean;
  /** Namespace for storage keys (default: 'api-cache') */
  namespace?: string;
}

interface CacheOptions {
  /** Time-to-live for this entry in milliseconds */
  ttl?: number;
  /** Force bypass cache (default: false) */
  bypassCache?: boolean;
  /** Cache key (auto-generated if not provided) */
  cacheKey?: string;
}

class APICache {
  private cache: Map<string, CacheEntry<any>>;
  private config: Required<CacheConfig>;
  private pendingRequests: Map<string, Promise<any>>;

  constructor(config: CacheConfig = {}) {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.config = {
      defaultTTL: config.defaultTTL || 5 * 60 * 1000, // 5 minutes
      maxEntries: config.maxEntries || 100,
      persistent: config.persistent || false,
      namespace: config.namespace || 'api-cache',
    };

    // Load persistent cache if enabled
    if (this.config.persistent) {
      this.loadFromStorage();
    }

    // Clean up expired entries periodically
    setInterval(() => this.cleanup(), 60 * 1000); // Every minute
  }

  /**
   * Generate cache key from URL and params
   */
  private generateKey(url: string, params?: any): string {
    if (params) {
      const sortedParams = Object.keys(params)
        .sort()
        .reduce((acc, key) => {
          acc[key] = params[key];
          return acc;
        }, {} as any);
      return `${url}?${JSON.stringify(sortedParams)}`;
    }
    return url;
  }

  /**
   * Get cached data if valid
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cached data
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Enforce max entries limit
    if (this.cache.size >= this.config.maxEntries) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
    };

    this.cache.set(key, entry);

    // Persist if enabled
    if (this.config.persistent) {
      this.saveToStorage();
    }
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);

    if (this.config.persistent) {
      this.saveToStorage();
    }
  }

  /**
   * Invalidate cache entries matching pattern
   */
  invalidatePattern(pattern: RegExp): void {
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));

    if (this.config.persistent) {
      this.saveToStorage();
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();

    if (this.config.persistent) {
      this.saveToStorage();
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxEntries: this.config.maxEntries,
      entries: Array.from(this.cache.keys()),
    };
  }

  /**
   * Wrap an async function with caching
   */
  async cached<T>(
    key: string,
    fn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const { ttl, bypassCache = false, cacheKey } = options;
    const finalKey = cacheKey || key;

    // Check if bypassing cache
    if (bypassCache) {
      const result = await fn();
      this.set(finalKey, result, ttl);
      return result;
    }

    // Check cache first
    const cached = this.get<T>(finalKey);
    if (cached !== null) {
      return cached;
    }

    // Check if request is already in flight (deduplication)
    if (this.pendingRequests.has(finalKey)) {
      return this.pendingRequests.get(finalKey)!;
    }

    // Execute request
    const promise = fn().then((result) => {
      this.set(finalKey, result, ttl);
      this.pendingRequests.delete(finalKey);
      return result;
    }).catch((error) => {
      this.pendingRequests.delete(finalKey);
      throw error;
    });

    this.pendingRequests.set(finalKey, promise);
    return promise;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));

    if (keysToDelete.length > 0 && this.config.persistent) {
      this.saveToStorage();
    }
  }

  /**
   * Save cache to sessionStorage
   */
  private saveToStorage(): void {
    try {
      const data = Array.from(this.cache.entries());
      sessionStorage.setItem(
        `${this.config.namespace}-data`,
        JSON.stringify(data)
      );
    } catch (error) {
      console.warn('[APICache] Failed to save to storage:', error);
    }
  }

  /**
   * Load cache from sessionStorage
   */
  private loadFromStorage(): void {
    try {
      const data = sessionStorage.getItem(`${this.config.namespace}-data`);
      if (data) {
        const entries: [string, CacheEntry<any>][] = JSON.parse(data);
        this.cache = new Map(entries);

        // Clean up expired entries
        this.cleanup();
      }
    } catch (error) {
      console.warn('[APICache] Failed to load from storage:', error);
    }
  }
}

// =============================================================================
// Export Singleton Instance
// =============================================================================

export const apiCache = new APICache({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxEntries: 100,
  persistent: true, // Persist across page refreshes
  namespace: 'tier-golf-api-cache',
});

// =============================================================================
// Axios Interceptor Integration
// =============================================================================

import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface CacheableRequestConfig extends AxiosRequestConfig {
  cache?: {
    /** Enable caching for this request */
    enabled?: boolean;
    /** Time-to-live in milliseconds */
    ttl?: number;
    /** Custom cache key */
    key?: string;
    /** Bypass cache and fetch fresh data */
    bypass?: boolean;
  };
}

/**
 * Add caching interceptor to axios instance
 */
export function addCacheInterceptor(axiosInstance: AxiosInstance): void {
  // Request interceptor - check cache before making request
  axiosInstance.interceptors.request.use(
    async (config) => {
      const cacheConfig = config as CacheableRequestConfig;
      // Only cache GET requests by default
      if (config.method?.toLowerCase() !== 'get') {
        return config;
      }

      // Check if caching is enabled for this request
      if (cacheConfig.cache?.enabled === false) {
        return config;
      }

      // Generate cache key
      const cacheKey =
        cacheConfig.cache?.key ||
        apiCache['generateKey'](config.url || '', config.params);

      // Check for bypass
      if (cacheConfig.cache?.bypass) {
        return config;
      }

      // Try to get from cache
      const cached = apiCache.get(cacheKey);
      if (cached !== null) {
        // Return cached response (Axios will skip the actual request)
        throw {
          config,
          response: {
            data: cached,
            status: 200,
            statusText: 'OK (from cache)',
            headers: {},
            config,
          },
          isFromCache: true,
        };
      }

      // Store cache key in config for response interceptor
      (config as any)._cacheKey = cacheKey;
      (config as any)._cacheTTL = cacheConfig.cache?.ttl;

      return config;
    }
  );

  // Response interceptor - cache successful responses
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      const config = response.config as any;

      // Cache successful GET responses
      if (config.method?.toLowerCase() === 'get' && config._cacheKey) {
        apiCache.set(config._cacheKey, response.data, config._cacheTTL);
      }

      return response;
    },
    (error) => {
      // Handle cached responses (thrown from request interceptor)
      if (error.isFromCache) {
        return Promise.resolve(error.response);
      }

      return Promise.reject(error);
    }
  );
}

// =============================================================================
// Cache Invalidation Helpers
// =============================================================================

/**
 * Invalidate cache after mutations
 * Use in useMutation onSuccess callbacks
 */
export const cacheInvalidation = {
  /** Invalidate all player data */
  invalidatePlayer: (playerId?: string) => {
    if (playerId) {
      apiCache.invalidatePattern(new RegExp(`/players/${playerId}`));
    } else {
      apiCache.invalidatePattern(/\/players/);
    }
  },

  /** Invalidate all goals */
  invalidateGoals: () => {
    apiCache.invalidatePattern(/\/goals/);
  },

  /** Invalidate all sessions */
  invalidateSessions: () => {
    apiCache.invalidatePattern(/\/sessions/);
  },

  /** Invalidate all tests */
  invalidateTests: () => {
    apiCache.invalidatePattern(/\/tests/);
  },

  /** Invalidate all achievements */
  invalidateAchievements: () => {
    apiCache.invalidatePattern(/\/achievements/);
    apiCache.invalidatePattern(/\/badges/);
  },

  /** Invalidate all coach data */
  invalidateCoach: (coachId?: string) => {
    if (coachId) {
      apiCache.invalidatePattern(new RegExp(`/coaches/${coachId}`));
    } else {
      apiCache.invalidatePattern(/\/coaches/);
    }
  },

  /** Invalidate all calendar/bookings */
  invalidateCalendar: () => {
    apiCache.invalidatePattern(/\/calendar/);
    apiCache.invalidatePattern(/\/bookings/);
  },

  /** Clear all cache */
  clearAll: () => {
    apiCache.clear();
  },
};

// =============================================================================
// React Hooks
// =============================================================================

import { useEffect } from 'react';

/**
 * Hook to invalidate cache on unmount
 * Useful for pages with frequently changing data
 */
export function useInvalidateOnUnmount(pattern: RegExp): void {
  useEffect(() => {
    return () => {
      apiCache.invalidatePattern(pattern);
    };
  }, [pattern]);
}

/**
 * Hook to get cache stats
 * Useful for debugging
 */
export function useCacheStats() {
  return apiCache.getStats();
}

// =============================================================================
// Export Main Cache Instance
// =============================================================================

export default apiCache;
