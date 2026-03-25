// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { trainingPlanAPI, playersAPI } from '../../services/api';
import { TrainingPlanSkeleton } from '../../ui/skeletons';
import ErrorState from '../../components/ui/ErrorState';
import CoachTrainingPlan from './CoachTrainingPlan';

/**
 * CoachTrainingPlanContainer
 * Fetches training plan data for a specific athlete.
 */
const CoachTrainingPlanContainer: React.FC = () => {
  const { athleteId, playerId: legacyPlayerId } = useParams<{ athleteId?: string; playerId?: string }>();
  const playerId = athleteId || legacyPlayerId; // Support both param names
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState<'loading' | 'idle' | 'error'>('loading');
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>({
    athleteName: 'Player',
    blocks: [],
  });

  const fetchTrainingPlan = useCallback(async () => {
    if (!playerId) return;

    try {
      setState('loading');
      setError(null);

      // Fetch player info and training plan in parallel
      const [playerRes, planRes] = await Promise.all([
        playersAPI.getById(playerId).catch(() => ({ data: null })),
        trainingPlanAPI.getForPlayer(playerId).catch(() => ({ data: null })),
      ]);

      // Extract player name
      const playerData = playerRes.data?.data || playerRes.data;
      const athleteName = playerData
        ? `${playerData.firstName || ''} ${playerData.lastName || ''}`.trim() || 'Spiller'
        : 'Spiller';

      // Transform plan data to blocks format expected by component
      const planData = planRes.data?.data || planRes.data;
      let blocks: any[] = [];

      if (planData?.dailyAssignments) {
        blocks = planData.dailyAssignments.map((assignment: any) => ({
          id: assignment.id,
          name: assignment.sessionTemplate?.name || assignment.sessionType || 'Treningsøkt',
          description: assignment.coachNotes || assignment.sessionTemplate?.description || '',
          date: assignment.assignedDate?.split('T')[0] || assignment.assignedDate,
          durationMinutes: assignment.estimatedDuration || assignment.sessionTemplate?.duration,
          completed: assignment.status === 'completed',
        }));
      }

      setData({
        athleteName,
        blocks,
        planId: planData?.id,
      });
      setState('idle');
    } catch (err: any) {
      console.error('Error fetching training plan:', err);
      setError(err);
      setState('error');
    }
  }, [playerId]);

  useEffect(() => {
    if (user && playerId) {
      fetchTrainingPlan();
    }
  }, [user, playerId, fetchTrainingPlan]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    navigate(`/coach/athletes/${playerId}/training-plan/edit`);
  };

  // Use TrainingPlanSkeleton to prevent layout shift/flickering during loading
  if (state === 'loading') {
    return <TrainingPlanSkeleton />;
  }

  // Guard: playerId must exist
  if (!playerId) {
    return (
      <ErrorState
        message="Spiller-ID mangler"
        onRetry={() => navigate('/coach/athletes')}
      />
    );
  }

  if (state === 'error') {
    const errorType = error && typeof error === 'object' && 'type' in error
      ? (error as { type?: string }).type
      : undefined;
    return (
      <ErrorState
        errorType={errorType}
        message={error?.message || 'Kunne ikke laste treningsplan'}
        onRetry={fetchTrainingPlan}
      />
    );
  }

  return (
    <CoachTrainingPlan
      athleteId={playerId}
      athleteName={data.athleteName}
      blocks={data.blocks.length > 0 ? data.blocks : undefined}
      onBack={handleBack}
      onEdit={handleEdit}
    />
  );
};

export default CoachTrainingPlanContainer;
