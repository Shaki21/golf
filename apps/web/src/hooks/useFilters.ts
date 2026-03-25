/**
 * useFilters Hook
 * Manages saved filters for coach dashboard - list, create, apply, suggestions
 */

import { useState, useCallback } from 'react';
import { filtersAPI, SavedFilter, FilterCriteria } from '../services/api';

interface UseFiltersReturn {
  filters: SavedFilter[];
  loading: boolean;
  error: string | null;
  fetchFilters: (coachId: string) => Promise<void>;
  getFilter: (id: string) => Promise<SavedFilter | null>;
  createFilter: (data: { coachId: string; name: string; description?: string; filters: FilterCriteria }) => Promise<SavedFilter | null>;
  updateFilter: (id: string, data: { name?: string; description?: string; filters?: FilterCriteria }) => Promise<SavedFilter | null>;
  deleteFilter: (id: string) => Promise<boolean>;
  applyFilter: (filters: FilterCriteria, limit?: number, offset?: number) => Promise<{ players: unknown[]; total: number } | null>;
  getSuggestions: () => Promise<{ categories: string[]; genders: string[]; handicapRange: { min: number; max: number } } | null>;
}

export function useFilters(): UseFiltersReturn {
  const [filters, setFilters] = useState<SavedFilter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFilters = useCallback(async (coachId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await filtersAPI.list(coachId);
      if (response.data?.data) {
        setFilters(response.data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke hente filtre');
    } finally {
      setLoading(false);
    }
  }, []);

  const getFilter = useCallback(async (id: string): Promise<SavedFilter | null> => {
    try {
      const response = await filtersAPI.getById(id);
      if (response.data?.data) {
        return response.data.data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke hente filter');
      return null;
    }
  }, []);

  const createFilter = useCallback(async (data: {
    coachId: string;
    name: string;
    description?: string;
    filters: FilterCriteria;
  }): Promise<SavedFilter | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await filtersAPI.create(data);
      if (response.data?.data) {
        const newFilter = response.data.data;
        setFilters(prev => [newFilter, ...prev]);
        return newFilter;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke opprette filter');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFilter = useCallback(async (
    id: string,
    data: { name?: string; description?: string; filters?: FilterCriteria }
  ): Promise<SavedFilter | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await filtersAPI.update(id, data);
      if (response.data?.data) {
        const updatedFilter = response.data.data;
        setFilters(prev => prev.map(f => f.id === id ? updatedFilter : f));
        return updatedFilter;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke oppdatere filter');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFilter = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await filtersAPI.delete(id);
      if (response.data?.data) {
        setFilters(prev => prev.filter(f => f.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke slette filter');
      return false;
    }
  }, []);

  const applyFilter = useCallback(async (
    filterCriteria: FilterCriteria,
    limit?: number,
    offset?: number
  ): Promise<{ players: unknown[]; total: number } | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await filtersAPI.apply({ filters: filterCriteria, limit, offset });
      if (response.data?.data) {
        return response.data.data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke anvende filter');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSuggestions = useCallback(async (): Promise<{ categories: string[]; genders: string[]; handicapRange: { min: number; max: number } } | null> => {
    try {
      const response = await filtersAPI.getSuggestions();
      if (response.data?.data) {
        return response.data.data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke hente filterforslag');
      return null;
    }
  }, []);

  return {
    filters,
    loading,
    error,
    fetchFilters,
    getFilter,
    createFilter,
    updateFilter,
    deleteFilter,
    applyFilter,
    getSuggestions,
  };
}

export default useFilters;
