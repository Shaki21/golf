/**
 * Archive Management Hooks
 * API integration for archiving and restoring data
 */

import { useState, useCallback, useEffect } from 'react';
import apiClient from '../services/apiClient';

// ============================================================================
// TYPES
// ============================================================================

export interface ArchiveItem {
  id: string;
  entityType: string;
  entityId: string;
  entityData: any;
  archivedBy?: string;
  archivedAt: string;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface ArchiveCount {
  total: number;
  byType?: Record<string, number>;
}

interface HookOptions {
  autoLoad?: boolean;
}

// ============================================================================
// HOOKS
// ============================================================================

export function useArchive(entityType: string | null = null, options: HookOptions = {}) {
  const [data, setData] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArchive = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = entityType ? { entityType } : {};
      const response = await apiClient.get('/archive', { params });
      setData(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load archive');
    } finally {
      setLoading(false);
    }
  }, [entityType]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchArchive();
    }
  }, [fetchArchive, options.autoLoad]);

  return { items: data, loading, error, refetch: fetchArchive };
}

export function useArchiveCount() {
  const [count, setCount] = useState<ArchiveCount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/archive/count');
      setCount(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load archive count');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  return { count, loading, error, refetch: fetchCount };
}

export function useArchiveItem(itemId: string, options: HookOptions = {}) {
  const [data, setData] = useState<ArchiveItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItem = useCallback(async () => {
    if (!itemId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/archive/${itemId}`);
      setData(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load archived item');
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchItem();
    }
  }, [fetchItem, options.autoLoad]);

  return { item: data, loading, error, refetch: fetchItem };
}

export function useCreateArchiveItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const archiveItem = useCallback(async (itemData: Partial<ArchiveItem>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post('/archive', itemData);
      return response.data as ArchiveItem;
    } catch (err: any) {
      setError(err.message || 'Failed to archive item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { archiveItem, loading, error };
}

export function useRestoreArchiveItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const restoreItem = useCallback(async (itemId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post(`/archive/${itemId}/restore`);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to restore item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { restoreItem, loading, error };
}

export function useBulkDeleteArchive() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bulkDelete = useCallback(async (archiveIds: string[]) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post('/archive/bulk-delete', { archiveIds });
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to bulk delete items');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { bulkDelete, loading, error };
}

export function useDeleteArchiveItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteItem = useCallback(async (itemId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.delete(`/archive/${itemId}`);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to delete item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteItem, loading, error };
}
