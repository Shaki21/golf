/**
 * useTrackMan Hook
 * Hook for managing TrackMan/launch monitor data
 *
 * Features:
 * - Fetch launch monitor sessions
 * - Create new session
 * - Get session details with shots
 * - Import TrackMan data
 * - Get club gapping analysis
 * - Filter shots by club, shot type, etc.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../services/apiClient';

/**
 * Hook for managing TrackMan/launch monitor data
 *
 * @param {Object} options - Configuration options
 * @param {string} options.playerId - Filter by player ID
 * @param {string} options.sessionId - Specific session ID
 * @returns {Object} TrackMan state and controls
 */
export function useTrackMan(options = {}) {
  const { playerId, sessionId } = options;

  // State
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [shots, setShots] = useState([]);
  const [clubGapping, setClubGapping] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Refs
  const isMountedRef = useRef(true);

  /**
   * Fetch launch monitor sessions from API
   */
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (playerId) params.playerId = playerId;

      const response = await apiClient.get('/trackman/sessions', { params });

      if (!isMountedRef.current) return;

      setSessions(response.data.data || []);
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke hente økter');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [playerId]);

  /**
   * Fetch a single session with all shots
   */
  const fetchSession = useCallback(async (sessionIdToFetch) => {
    if (!sessionIdToFetch) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/trackman/sessions/${sessionIdToFetch}`);

      if (!isMountedRef.current) return null;

      const session = response.data.data;
      setSelectedSession(session);
      setShots(session.shots || []);
      return session;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke hente økt');
      }
      return null;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Create a new launch monitor session
   */
  const createSession = useCallback(async (sessionData) => {
    setSaving(true);
    setError(null);

    try {
      const response = await apiClient.post('/trackman/sessions', sessionData);

      if (isMountedRef.current) {
        const newSession = response.data.data;
        setSessions((prev) => [newSession, ...prev]);
        setSelectedSession(newSession);
        return newSession;
      }

      return response.data.data;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke opprette økt');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  /**
   * Add shot data to session
   */
  const addShot = useCallback(async (sessionIdForShot, shotData) => {
    if (!sessionIdForShot) return null;

    setSaving(true);
    setError(null);

    try {
      const response = await apiClient.post('/trackman/shots', {
        sessionId: sessionIdForShot,
        ...shotData,
      });

      if (isMountedRef.current) {
        const newShot = response.data.data;

        // Add to shots list if viewing this session
        if (selectedSession?.id === sessionIdForShot) {
          setShots((prev) => [...prev, newShot]);
        }

        return newShot;
      }

      return response.data.data;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke legge til slag');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, [selectedSession]);

  /**
   * Import TrackMan data file
   */
  const importTrackManData = useCallback(async (sessionIdForImport, fileData) => {
    if (!sessionIdForImport) return null;

    setSaving(true);
    setError(null);

    try {
      const response = await apiClient.post(
        `/trackman/sessions/${sessionIdForImport}/import`,
        fileData
      );

      if (isMountedRef.current) {
        const importedSession = response.data.data;

        // Update selected session if it's the one we imported to
        if (selectedSession?.id === sessionIdForImport) {
          setSelectedSession(importedSession);
          setShots(importedSession.shots || []);
        }

        return importedSession;
      }

      return response.data.data;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke importere TrackMan data');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, [selectedSession]);

  /**
   * Get club gapping analysis for player
   */
  const fetchClubGapping = useCallback(async (playerIdForGapping) => {
    if (!playerIdForGapping) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/trackman/club-gapping/${playerIdForGapping}`);

      if (!isMountedRef.current) return null;

      const gapping = response.data.data;
      setClubGapping(gapping);
      return gapping;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke hente club gapping');
      }
      return null;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Calculate club gapping for player
   */
  const calculateClubGapping = useCallback(async (playerIdForCalc) => {
    if (!playerIdForCalc) return null;

    setSaving(true);
    setError(null);

    try {
      const response = await apiClient.post(`/trackman/club-gapping/${playerIdForCalc}/calculate`);

      if (isMountedRef.current) {
        const gapping = response.data.data;
        setClubGapping(gapping);
        return gapping;
      }

      return response.data.data;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke beregne club gapping');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  /**
   * Refresh sessions from API
   */
  const refresh = useCallback(() => {
    return fetchSessions();
  }, [fetchSessions]);

  /**
   * Clear selected session
   */
  const clearSelected = useCallback(() => {
    setSelectedSession(null);
    setShots([]);
  }, []);

  // Auto-fetch sessions on mount or when playerId changes
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Auto-fetch specific session if sessionId is provided
  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId);
    }
  }, [sessionId, fetchSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    sessions,
    selectedSession,
    shots,
    clubGapping,
    loading,
    error,
    saving,
    fetchSessions,
    fetchSession,
    createSession,
    addShot,
    importTrackManData,
    fetchClubGapping,
    calculateClubGapping,
    refresh,
    clearSelected,
  };
}

export default useTrackMan;
