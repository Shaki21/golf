/**
 * useTournamentPrep Hook
 * Hook for managing tournament preparation
 *
 * Features:
 * - Fetch tournament preparations
 * - Create new preparation
 * - Update existing preparation
 * - Manage course strategy
 * - Manage hole-by-hole strategy
 * - Track pre-tournament checklist
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../services/apiClient';

/**
 * Hook for managing tournament preparation
 *
 * @param {Object} options - Configuration options
 * @param {string} options.tournamentId - Filter by tournament ID
 * @param {string} options.playerId - Filter by player ID
 * @returns {Object} Tournament prep state and controls
 */
export function useTournamentPrep(options = {}) {
  const { tournamentId, playerId } = options;

  // State
  const [preparations, setPreparations] = useState([]);
  const [selectedPrep, setSelectedPrep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Refs
  const isMountedRef = useRef(true);

  /**
   * Fetch tournament preparations from API
   */
  const fetchPreparations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (tournamentId) params.tournamentId = tournamentId;
      if (playerId) params.playerId = playerId;

      const response = await apiClient.get('/tournament-prep', { params });

      if (!isMountedRef.current) return;

      setPreparations(response.data.data || []);
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke hente forberedelser');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [tournamentId, playerId]);

  /**
   * Fetch a single preparation by ID (with full details)
   */
  const fetchPreparation = useCallback(async (prepId) => {
    if (!prepId) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/tournament-prep/${prepId}`);

      if (!isMountedRef.current) return null;

      const prep = response.data.data;
      setSelectedPrep(prep);
      return prep;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke hente forberedelse');
      }
      return null;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Create a new tournament preparation
   */
  const createPreparation = useCallback(async (prepData) => {
    setSaving(true);
    setError(null);

    try {
      const response = await apiClient.post('/tournament-prep', prepData);

      if (isMountedRef.current) {
        const newPrep = response.data.data;
        setPreparations((prev) => [newPrep, ...prev]);
        setSelectedPrep(newPrep);
        return newPrep;
      }

      return response.data.data;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke opprette forberedelse');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  /**
   * Update an existing tournament preparation
   */
  const updatePreparation = useCallback(async (prepId, updates) => {
    if (!prepId) return null;

    setSaving(true);
    setError(null);

    try {
      const response = await apiClient.patch(`/tournament-prep/${prepId}`, updates);

      if (isMountedRef.current) {
        const updatedPrep = response.data.data;

        // Update in list
        setPreparations((prev) =>
          prev.map((prep) => (prep.id === prepId ? updatedPrep : prep))
        );

        // Update selected if it's the one being updated
        if (selectedPrep?.id === prepId) {
          setSelectedPrep(updatedPrep);
        }

        return updatedPrep;
      }

      return response.data.data;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke oppdatere forberedelse');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, [selectedPrep]);

  /**
   * Create or update course strategy
   */
  const saveCourseStrategy = useCallback(async (prepId, strategyData) => {
    if (!prepId) return null;

    setSaving(true);
    setError(null);

    try {
      const response = await apiClient.post('/tournament-prep/course-strategy', {
        tournamentPrepId: prepId,
        ...strategyData,
      });

      if (isMountedRef.current) {
        const strategy = response.data.data;

        // Update selected prep with new strategy
        if (selectedPrep?.id === prepId) {
          setSelectedPrep((prev) => ({
            ...prev,
            courseStrategy: strategy,
          }));
        }

        return strategy;
      }

      return response.data.data;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke lagre banestrategi');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, [selectedPrep]);

  /**
   * Create or update hole strategy
   */
  const saveHoleStrategy = useCallback(async (courseStrategyId, holeNumber, strategyData) => {
    if (!courseStrategyId) return null;

    setSaving(true);
    setError(null);

    try {
      const response = await apiClient.post('/tournament-prep/hole-strategy', {
        courseStrategyId,
        holeNumber,
        ...strategyData,
      });

      if (isMountedRef.current) {
        const holeStrategy = response.data.data;

        // Update selected prep with new hole strategy
        if (selectedPrep?.courseStrategy?.id === courseStrategyId) {
          setSelectedPrep((prev) => ({
            ...prev,
            courseStrategy: {
              ...prev.courseStrategy,
              holes: [
                ...(prev.courseStrategy.holes || []).filter(h => h.holeNumber !== holeNumber),
                holeStrategy,
              ].sort((a, b) => a.holeNumber - b.holeNumber),
            },
          }));
        }

        return holeStrategy;
      }

      return response.data.data;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke lagre hullstrategi');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, [selectedPrep]);

  /**
   * Update checklist item status
   */
  const updateChecklistItem = useCallback(async (prepId, checklistUpdates) => {
    if (!prepId) return null;

    setSaving(true);
    setError(null);

    try {
      const response = await apiClient.patch(`/tournament-prep/${prepId}/checklist`, checklistUpdates);

      if (isMountedRef.current) {
        const updatedPrep = response.data.data;

        // Update selected prep
        if (selectedPrep?.id === prepId) {
          setSelectedPrep(updatedPrep);
        }

        return updatedPrep;
      }

      return response.data.data;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke oppdatere sjekkliste');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, [selectedPrep]);

  /**
   * Refresh preparations from API
   */
  const refresh = useCallback(() => {
    return fetchPreparations();
  }, [fetchPreparations]);

  /**
   * Clear selected preparation
   */
  const clearSelected = useCallback(() => {
    setSelectedPrep(null);
  }, []);

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    fetchPreparations();
  }, [fetchPreparations]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    preparations,
    selectedPrep,
    loading,
    error,
    saving,
    fetchPreparations,
    fetchPreparation,
    createPreparation,
    updatePreparation,
    saveCourseStrategy,
    saveHoleStrategy,
    updateChecklistItem,
    refresh,
    clearSelected,
  };
}

export default useTournamentPrep;
