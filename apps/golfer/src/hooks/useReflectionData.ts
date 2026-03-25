/**
 * Hook for managing REFLECTION screen data
 *
 * Handles:
 * - Fetching session summary
 * - Saving reflection data
 */

import { useState, useCallback } from 'react';
import api from '../services/api';

interface SessionSummary {
  trainingArea: string;
  blockCount: number;
  durationMinutes: number;
}

interface ReflectionData {
  bodyState?: number;
  mindState?: number;
  sleepHours?: number;
  sleepQuality?: number;
  notes?: string;
  nextFocus?: string;
}

export function useReflectionData(sessionId: string) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [saved, setSaved] = useState(false);

  // Save reflection
  const saveReflection = useCallback(async (data: ReflectionData) => {
    try {
      setSaving(true);
      setError(null);

      // Transform to API format
      const payload = {
        sessionId,
        bodyState: data.bodyState,
        mindState: data.mindState,
        sleepHours: data.sleepHours,
        sleepQuality: data.sleepQuality,
        notes: data.notes,
        nextFocus: data.nextFocus,
        submittedAt: new Date().toISOString(),
      };

      await api.sessions.addReflection(sessionId, payload);
      setSaved(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save reflection'));
      return false;
    } finally {
      setSaving(false);
    }
  }, [sessionId]);

  // Skip reflection (just mark as skipped)
  const skipReflection = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);

      await api.sessions.addReflection(sessionId, {
        sessionId,
        skipped: true,
        submittedAt: new Date().toISOString(),
      });
      setSaved(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to skip reflection'));
      return false;
    } finally {
      setSaving(false);
    }
  }, [sessionId]);

  return {
    saving,
    error,
    saved,
    saveReflection,
    skipReflection,
  };
}

export default useReflectionData;
