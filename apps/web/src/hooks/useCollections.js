/**
 * Collections Hooks
 * API integration for content collections (videos, exercises, plans)
 */

import { useState, useCallback, useEffect } from 'react';
import apiClient from '../services/apiClient';

// ============================================================================
// COLLECTIONS
// ============================================================================

export function useCollections(options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/collections');
      setData(response.data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchCollections();
    }
  }, [fetchCollections, options.autoLoad]);

  return { collections: data, loading, error, refetch: fetchCollections };
}

export function useCollection(collectionId, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCollection = useCallback(async () => {
    if (!collectionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/collections/${collectionId}`);
      setData(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load collection');
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchCollection();
    }
  }, [fetchCollection, options.autoLoad]);

  return { collection: data, loading, error, refetch: fetchCollection };
}

export function useCreateCollection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCollection = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post('/collections', data);
      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to create collection');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createCollection, loading, error };
}

export function useUpdateCollection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateCollection = useCallback(async (collectionId, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.put(`/collections/${collectionId}`, data);
      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to update collection');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateCollection, loading, error };
}

export function useDeleteCollection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteCollection = useCallback(async (collectionId) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.delete(`/collections/${collectionId}`);
    } catch (err) {
      setError(err.message || 'Failed to delete collection');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteCollection, loading, error };
}

export function useAddCollectionItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addItem = useCallback(async (collectionId, item) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post(`/collections/${collectionId}/items`, item);
      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to add item to collection');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { addItem, loading, error };
}

export function useRemoveCollectionItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const removeItem = useCallback(async (collectionId, itemId) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.delete(`/collections/${collectionId}/items/${itemId}`);
    } catch (err) {
      setError(err.message || 'Failed to remove item from collection');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { removeItem, loading, error };
}

export function useReorderCollectionItems() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reorderItems = useCallback(async (collectionId, itemIds) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.put(`/collections/${collectionId}/reorder`, { itemIds });
      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to reorder collection items');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { reorderItems, loading, error };
}
