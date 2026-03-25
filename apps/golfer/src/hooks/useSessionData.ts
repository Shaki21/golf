/**
 * Hook for fetching and managing SESSION screen data
 *
 * Handles:
 * - Fetching session details
 * - Tracking progress through blocks
 * - Updating session state
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface SessionBlock {
  id: string;
  title: string;
  description?: string;
  durationSeconds?: number;
  reps?: number;
  completed?: boolean;
}

interface SessionData {
  id: string;
  title: string;
  trainingArea: string;
  blocks: SessionBlock[];
  currentBlockIndex: number;
  status: 'pending' | 'in_progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
}

export function useSessionData(sessionId: string) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch session details
  const fetchSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.sessions.getById(sessionId);

      const sessionData: SessionData = {
        id: response.id,
        title: response.name || response.title,
        trainingArea: response.category || response.trainingArea,
        blocks: (response.blocks || []).map((block: any) => ({
          id: block.id,
          title: block.name || block.title,
          description: block.description,
          durationSeconds: block.durationSeconds || block.duration * 60,
          reps: block.reps || block.repetitions,
          completed: block.completed || false,
        })),
        currentBlockIndex: response.currentBlockIndex || 0,
        status: response.status || 'pending',
        startedAt: response.startedAt ? new Date(response.startedAt) : undefined,
        completedAt: response.completedAt ? new Date(response.completedAt) : undefined,
      };

      setSession(sessionData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch session'));
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Start session
  const startSession = useCallback(async () => {
    if (!session) return;

    try {
      setSaving(true);
      await api.sessions.update(session.id, {
        status: 'in_progress',
        startedAt: new Date().toISOString(),
      });
      setSession(prev => prev ? { ...prev, status: 'in_progress', startedAt: new Date() } : null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to start session'));
    } finally {
      setSaving(false);
    }
  }, [session]);

  // Complete current block and move to next
  const completeBlock = useCallback(async () => {
    if (!session) return;

    const nextIndex = session.currentBlockIndex + 1;
    const isLastBlock = nextIndex >= session.blocks.length;

    try {
      setSaving(true);

      // Update block as completed
      const updatedBlocks = session.blocks.map((block, idx) =>
        idx === session.currentBlockIndex ? { ...block, completed: true } : block
      );

      await api.sessions.update(session.id, {
        currentBlockIndex: nextIndex,
        blocks: updatedBlocks,
      });

      setSession(prev => prev ? {
        ...prev,
        blocks: updatedBlocks,
        currentBlockIndex: nextIndex,
      } : null);

      return isLastBlock;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to complete block'));
      return false;
    } finally {
      setSaving(false);
    }
  }, [session]);

  // Complete entire session
  const completeSession = useCallback(async (data?: any) => {
    if (!session) return;

    try {
      setSaving(true);
      await api.sessions.complete(session.id, {
        ...data,
        completedAt: new Date().toISOString(),
      });
      setSession(prev => prev ? {
        ...prev,
        status: 'completed',
        completedAt: new Date()
      } : null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to complete session'));
    } finally {
      setSaving(false);
    }
  }, [session]);

  // Pause session
  const pauseSession = useCallback(async () => {
    if (!session) return;

    try {
      setSaving(true);
      await api.sessions.update(session.id, {
        status: 'paused',
      });
      setSession(prev => prev ? { ...prev, status: 'pending' } : null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to pause session'));
    } finally {
      setSaving(false);
    }
  }, [session]);

  return {
    session,
    loading,
    error,
    saving,
    startSession,
    completeBlock,
    completeSession,
    pauseSession,
    refresh: fetchSession,
  };
}

export default useSessionData;
