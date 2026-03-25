import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import ActiveSessionView from './ActiveSessionView';

const ActiveSessionViewContainer = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState('loading');
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchActiveSession = useCallback(async () => {
    try {
      setState('loading');
      setError(null);
      const response = await apiClient.get(`/api/v1/bookings/${sessionId}`);
      // Filter for active session or check status
      setSession(response.data);
      setState('idle');
    } catch (err) {
      console.error('Error fetching active session:', err);
      setError(err);
      setState('error');
    }
  }, [sessionId]);

  useEffect(() => {
    if (user && sessionId) {
      fetchActiveSession();
    }
  }, [user, sessionId, fetchActiveSession]);

  // Save block completion data
  const saveBlockData = useCallback(async (blockData) => {
    try {
      await apiClient.post(`/api/v1/bookings/${sessionId}/blocks/${blockData.blockIndex}`, {
        actualDuration: blockData.actualDuration,
        actualReps: blockData.actualReps,
        qualityRating: blockData.qualityRating,
        focusRating: blockData.focusRating,
        intensityRating: blockData.intensityRating,
        note: blockData.note,
        completedAt: blockData.completedAt,
      });
    } catch (err) {
      console.error('Error saving block data:', err);
      // Don't throw - allow session to continue even if save fails
    }
  }, [sessionId]);

  // Handle session end
  const handleEndSession = useCallback(async (totalSeconds, completedBlocks) => {
    try {
      setIsSaving(true);

      // Save session completion data
      await apiClient.patch(`/api/v1/bookings/${sessionId}`, {
        status: 'completed',
        actualDuration: totalSeconds,
        completedBlocksCount: completedBlocks.length,
        completedAt: new Date().toISOString(),
      });

      // Navigate to session reflection or summary
      navigate(`/session/${sessionId}/reflection`);
    } catch (err) {
      console.error('Error completing session:', err);
      // Navigate anyway - data can be synced later
      navigate('/treningsprotokoll');
    } finally {
      setIsSaving(false);
    }
  }, [sessionId, navigate]);

  // Handle pause
  const handlePause = useCallback(async () => {
    try {
      await apiClient.patch(`/api/v1/bookings/${sessionId}`, {
        status: 'paused',
        lastPausedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error pausing session:', err);
    }
  }, [sessionId]);

  if (state === 'loading' || isSaving) {
    return <LoadingState message={isSaving ? "Lagrer øktdata..." : "Laster aktiv økt..."} />;
  }

  if (state === 'error') {
    return (
      <ErrorState
        errorType={error?.type}
        message={error?.message || 'Kunne ikke laste aktiv økt'}
        onRetry={fetchActiveSession}
      />
    );
  }

  return (
    <ActiveSessionView
      session={session}
      onEndSession={handleEndSession}
      onPause={handlePause}
      onBlockComplete={saveBlockData}
    />
  );
};

export default ActiveSessionViewContainer;
