/**
 * TIER Golf - Offline Store
 *
 * IndexedDB-basert lagring for offline-funksjonalitet.
 * Cacher API-data lokalt for offline tilgang.
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// =============================================================================
// Types & Interfaces
// =============================================================================

interface CachedData {
  key: string;
  data: unknown;
  timestamp: number;
  expiresAt: number;
}

interface SyncQueueItem {
  id: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  body?: unknown;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
}

interface TIERGolfDB extends DBSchema {
  // Cached API responses
  cache: {
    key: string;
    value: CachedData;
  };
  // Offline mutations queue
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: { 'by-status': string; 'by-timestamp': number };
  };
  // User preferences (always available offline)
  preferences: {
    key: string;
    value: { key: string; value: unknown };
  };
}

// =============================================================================
// Constants
// =============================================================================

const DB_NAME = 'tier-golf-offline';
const DB_VERSION = 1;

// Cache TTL (time to live) in milliseconds
const CACHE_TTL = {
  player: 24 * 60 * 60 * 1000,      // 24 hours
  dashboard: 5 * 60 * 1000,          // 5 minutes
  tests: 60 * 60 * 1000,             // 1 hour
  sessions: 15 * 60 * 1000,          // 15 minutes
  exercises: 24 * 60 * 60 * 1000,    // 24 hours
  default: 10 * 60 * 1000,           // 10 minutes
};

// =============================================================================
// Database Initialization
// =============================================================================

let dbPromise: Promise<IDBPDatabase<TIERGolfDB>> | null = null;

async function getDB(): Promise<IDBPDatabase<TIERGolfDB>> {
  if (!dbPromise) {
    dbPromise = openDB<TIERGolfDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Cache store
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('by-status', 'status');
          syncStore.createIndex('by-timestamp', 'timestamp');
        }

        // Preferences store
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

// =============================================================================
// Cache Operations
// =============================================================================

/**
 * Get TTL for a cache key based on the endpoint
 */
function getTTL(key: string): number {
  if (key.includes('/players/')) return CACHE_TTL.player;
  if (key.includes('/dashboard')) return CACHE_TTL.dashboard;
  if (key.includes('/tests/')) return CACHE_TTL.tests;
  if (key.includes('/sessions')) return CACHE_TTL.sessions;
  if (key.includes('/exercises')) return CACHE_TTL.exercises;
  return CACHE_TTL.default;
}

/**
 * Store data in cache
 */
export async function cacheSet(key: string, data: unknown): Promise<void> {
  try {
    const db = await getDB();
    const ttl = getTTL(key);
    const now = Date.now();

    await db.put('cache', {
      key,
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  } catch (error) {
    console.error('[OfflineStore] Cache set error:', error);
  }
}

/**
 * Get data from cache
 * Returns null if not found or expired
 */
export async function cacheGet<T = unknown>(key: string): Promise<T | null> {
  try {
    const db = await getDB();
    const cached = await db.get('cache', key);

    if (!cached) return null;

    // Check if expired
    if (Date.now() > cached.expiresAt) {
      // Delete expired entry
      await db.delete('cache', key);
      return null;
    }

    return cached.data as T;
  } catch (error) {
    console.error('[OfflineStore] Cache get error:', error);
    return null;
  }
}

/**
 * Delete from cache
 */
export async function cacheDelete(key: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('cache', key);
  } catch (error) {
    console.error('[OfflineStore] Cache delete error:', error);
  }
}

/**
 * Clear all cache entries
 */
export async function cacheClear(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear('cache');
  } catch (error) {
    console.error('[OfflineStore] Cache clear error:', error);
  }
}

/**
 * Clean up expired cache entries
 */
export async function cacheCleanup(): Promise<number> {
  try {
    const db = await getDB();
    const tx = db.transaction('cache', 'readwrite');
    const store = tx.objectStore('cache');
    const now = Date.now();
    let deleted = 0;

    let cursor = await store.openCursor();
    while (cursor) {
      if (cursor.value.expiresAt < now) {
        await cursor.delete();
        deleted++;
      }
      cursor = await cursor.continue();
    }

    await tx.done;
    return deleted;
  } catch (error) {
    console.error('[OfflineStore] Cache cleanup error:', error);
    return 0;
  }
}

// =============================================================================
// Sync Queue Operations
// =============================================================================

/**
 * Add a request to the sync queue (for offline mutations)
 */
export async function queueAdd(
  method: SyncQueueItem['method'],
  url: string,
  body?: unknown,
  headers?: Record<string, string>
): Promise<string> {
  try {
    const db = await getDB();
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await db.put('syncQueue', {
      id,
      method,
      url,
      body,
      headers,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    });

    console.log('[OfflineStore] Added to sync queue:', id);
    return id;
  } catch (error) {
    console.error('[OfflineStore] Queue add error:', error);
    throw error;
  }
}

/**
 * Get all pending items from sync queue
 */
export async function queueGetPending(): Promise<SyncQueueItem[]> {
  try {
    const db = await getDB();
    const index = db.transaction('syncQueue').store.index('by-status');
    return await index.getAll('pending');
  } catch (error) {
    console.error('[OfflineStore] Queue get pending error:', error);
    return [];
  }
}

/**
 * Update sync queue item status
 */
export async function queueUpdateStatus(
  id: string,
  status: SyncQueueItem['status'],
  retryCount?: number
): Promise<void> {
  try {
    const db = await getDB();
    const item = await db.get('syncQueue', id);

    if (item) {
      await db.put('syncQueue', {
        ...item,
        status,
        retryCount: retryCount ?? item.retryCount,
      });
    }
  } catch (error) {
    console.error('[OfflineStore] Queue update error:', error);
  }
}

/**
 * Remove item from sync queue
 */
export async function queueRemove(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('syncQueue', id);
  } catch (error) {
    console.error('[OfflineStore] Queue remove error:', error);
  }
}

/**
 * Get sync queue count
 */
export async function queueCount(): Promise<number> {
  try {
    const db = await getDB();
    return await db.count('syncQueue');
  } catch (error) {
    console.error('[OfflineStore] Queue count error:', error);
    return 0;
  }
}

/**
 * Process sync queue (call when online)
 */
export async function processQueue(
  fetchFn: (url: string, options: RequestInit) => Promise<Response>
): Promise<{ success: number; failed: number }> {
  const pending = await queueGetPending();
  let success = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      await queueUpdateStatus(item.id, 'syncing');

      const response = await fetchFn(item.url, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
          ...item.headers,
        },
        body: item.body ? JSON.stringify(item.body) : undefined,
      });

      if (response.ok) {
        await queueRemove(item.id);
        success++;
        console.log('[OfflineStore] Synced:', item.id);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('[OfflineStore] Sync failed:', item.id, error);

      // Retry up to 3 times
      if (item.retryCount < 3) {
        await queueUpdateStatus(item.id, 'pending', item.retryCount + 1);
      } else {
        await queueUpdateStatus(item.id, 'failed');
        failed++;
      }
    }
  }

  return { success, failed };
}

// =============================================================================
// Preferences Operations
// =============================================================================

/**
 * Set a preference value
 */
export async function prefSet(key: string, value: unknown): Promise<void> {
  try {
    const db = await getDB();
    await db.put('preferences', { key, value });
  } catch (error) {
    console.error('[OfflineStore] Pref set error:', error);
  }
}

/**
 * Get a preference value
 */
export async function prefGet<T = unknown>(key: string): Promise<T | null> {
  try {
    const db = await getDB();
    const pref = await db.get('preferences', key);
    return pref ? (pref.value as T) : null;
  } catch (error) {
    console.error('[OfflineStore] Pref get error:', error);
    return null;
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get database stats
 */
export async function getStats(): Promise<{
  cacheEntries: number;
  queueItems: number;
  preferences: number;
}> {
  try {
    const db = await getDB();
    return {
      cacheEntries: await db.count('cache'),
      queueItems: await db.count('syncQueue'),
      preferences: await db.count('preferences'),
    };
  } catch (error) {
    console.error('[OfflineStore] Get stats error:', error);
    return { cacheEntries: 0, queueItems: 0, preferences: 0 };
  }
}

/**
 * Clear all offline data
 */
export async function clearAll(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear('cache');
    await db.clear('syncQueue');
    // Keep preferences
    console.log('[OfflineStore] All data cleared');
  } catch (error) {
    console.error('[OfflineStore] Clear all error:', error);
  }
}

// Export all functions
export const offlineStore = {
  cache: {
    set: cacheSet,
    get: cacheGet,
    delete: cacheDelete,
    clear: cacheClear,
    cleanup: cacheCleanup,
  },
  queue: {
    add: queueAdd,
    getPending: queueGetPending,
    updateStatus: queueUpdateStatus,
    remove: queueRemove,
    count: queueCount,
    process: processQueue,
  },
  pref: {
    set: prefSet,
    get: prefGet,
  },
  getStats,
  clearAll,
};

export default offlineStore;
