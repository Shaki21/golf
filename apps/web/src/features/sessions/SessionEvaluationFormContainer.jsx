/**
 * SessionEvaluationFormContainer - Smart component for session evaluation
 *
 * Handles:
 * - Fetching session data
 * - Loading technical cues
 * - Saving evaluation progress
 * - Completing/abandoning session
 * - Navigation after completion
 *
 * Design Pattern: Container/Presentational
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionsAPI } from '../../services/api';
import SessionEvaluationForm from './SessionEvaluationForm';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';

export default function SessionEvaluationFormContainer() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  // State
  const [state, setState] = useState('loading'); // loading | idle | saving | error
  const [session, setSession] = useState(null);
  const [technicalCues, setTechnicalCues] = useState([]);
  const [error, setError] = useState(null);

  // Fetch session and technical cues on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setState('loading');
        setError(null);

        const [sessionResponse, cuesResponse] = await Promise.all([
          sessionsAPI.getById(sessionId),
          sessionsAPI.getTechnicalCues(),
        ]);

        setSession(sessionResponse.data);
        setTechnicalCues(cuesResponse.data);
        setState('idle');
      } catch (err) {
        console.error('Failed to fetch session data:', err);
        setError(err.response?.data?.message || 'Kunne ikke laste okt');
        setState('error');
      }
    };

    if (sessionId) {
      fetchData();
    }
  }, [sessionId]);

  // Handle save (auto-save)
  const handleSave = useCallback(async (evaluationData) => {
    if (!sessionId || state === 'saving') return;

    try {
      await sessionsAPI.updateEvaluation(sessionId, evaluationData);
    } catch (err) {
      console.error('Failed to save evaluation:', err);
      // Don't show error for auto-save failures - just log it
    }
  }, [sessionId, state]);

  // Handle complete/abandon
  const handleComplete = useCallback(async (evaluationData) => {
    if (!sessionId) return;

    try {
      setState('saving');
      setError(null);

      await sessionsAPI.complete(sessionId, evaluationData);

      // Navigate to session detail or dashboard
      navigate(`/sessions/${sessionId}`, {
        state: { message: 'Okt fullfort!' }
      });
    } catch (err) {
      console.error('Failed to complete session:', err);
      setError(err.response?.data?.message || 'Kunne ikke fullføre okt');
      setState('idle');
    }
  }, [sessionId, navigate]);

  // Handle cancel (go back without saving)
  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Handle retry on error
  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  // Render states
  if (state === 'loading') {
    return <LoadingState message="Laster økt..." />;
  }

  if (state === 'error' && !session) {
    return (
      <ErrorState
        message={error || 'Noe gikk galt'}
        onRetry={handleRetry}
      />
    );
  }

  // Check if session can be evaluated (must be in_progress)
  if (session && session.completionStatus !== 'in_progress') {
    return (
      <ErrorState
        message="Denne økten er allerede fullført eller avbrutt"
        onRetry={() => navigate(`/sessions/${sessionId}`)}
        retryLabel="Se øktdetaljer"
      />
    );
  }

  // Extract initial values from session
  const initialValues = session ? {
    evaluationFocus: session.evaluationFocus,
    evaluationTechnical: session.evaluationTechnical,
    evaluationEnergy: session.evaluationEnergy,
    evaluationMental: session.evaluationMental,
    preShotConsistency: session.preShotConsistency,
    preShotCount: session.preShotCount,
    totalShots: session.totalShots,
    technicalCues: session.technicalCues || [],
    customCue: session.customCue,
    whatWentWell: session.whatWentWell,
    nextSessionFocus: session.nextSessionFocus,
    notes: session.notes,
  } : {};

  return (
    <SessionEvaluationForm
      session={session}
      technicalCues={technicalCues}
      initialValues={initialValues}
      onSave={handleSave}
      onComplete={handleComplete}
      onCancel={handleCancel}
      isLoading={state === 'saving'}
      autoSaveEnabled={true}
    />
  );
}
