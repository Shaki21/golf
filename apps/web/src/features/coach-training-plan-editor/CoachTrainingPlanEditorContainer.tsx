// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: Add proper types for training plan data structures
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { trainingPlanAPI, playersAPI } from '../../services/api';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import CoachTrainingPlanEditor from './CoachTrainingPlanEditor';

/**
 * CoachTrainingPlanEditorContainer
 * Fetches training plan data and provides mutation handlers for the editor.
 */
const CoachTrainingPlanEditorContainer: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState<'loading' | 'idle' | 'error'>('loading');
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>({
    athleteName: 'Spiller',
    blocks: [],
    planId: null,
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
      let planId = planData?.id || null;

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
        planId,
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

  const handleAddBlock = async (
    athleteId: string,
    block: { name: string; description?: string; date: string; durationMinutes?: number }
  ) => {
    try {
      // If no plan exists, create one first
      let planId = data.planId;

      if (!planId) {
        const createRes = await trainingPlanAPI.createPlan({
          playerId: athleteId,
          name: `Treningsplan for ${data.athleteName}`,
          startDate: block.date,
        });
        planId = createRes.data?.data?.id || createRes.data?.id;
        setData((prev: any) => ({ ...prev, planId }));
      }

      // Add the block via daily update
      await trainingPlanAPI.updateDaily(planId, block.date, {
        sessionType: block.name,
        coachNotes: block.description,
        estimatedDuration: block.durationMinutes,
      });

      // Refresh data
      await fetchTrainingPlan();
    } catch (err: any) {
      console.error('Error adding block:', err);
      // Optimistic update - add to local state anyway
      const newBlock = {
        id: `temp-${Date.now()}`,
        name: block.name,
        description: block.description,
        date: block.date,
        durationMinutes: block.durationMinutes,
        completed: false,
      };
      setData((prev: any) => ({
        ...prev,
        blocks: [...prev.blocks, newBlock],
      }));
    }
  };

  const handleUpdateBlock = async (
    athleteId: string,
    blockId: string,
    updates: Partial<{ name: string; description?: string; date: string; durationMinutes?: number }>
  ) => {
    if (!data.planId) return;

    try {
      // Find the block to get its date
      const block = data.blocks.find((b: any) => b.id === blockId);
      if (!block) return;

      await trainingPlanAPI.updateDaily(data.planId, block.date, {
        sessionType: updates.name,
        coachNotes: updates.description,
        estimatedDuration: updates.durationMinutes,
      });

      // Refresh data
      await fetchTrainingPlan();
    } catch (err: any) {
      console.error('Error updating block:', err);
      // Optimistic update
      setData((prev: any) => ({
        ...prev,
        blocks: prev.blocks.map((b: any) =>
          b.id === blockId ? { ...b, ...updates } : b
        ),
      }));
    }
  };

  const handleRemoveBlock = async (athleteId: string, blockId: string) => {
    if (!data.planId) return;

    try {
      // Find the block to get its date
      const block = data.blocks.find((b: any) => b.id === blockId);
      if (!block) return;

      // Clear the daily assignment
      await trainingPlanAPI.updateDaily(data.planId, block.date, {
        sessionType: null,
        coachNotes: null,
        estimatedDuration: null,
        status: 'cancelled',
      });

      // Refresh data
      await fetchTrainingPlan();
    } catch (err: any) {
      console.error('Error removing block:', err);
      // Optimistic update
      setData((prev: any) => ({
        ...prev,
        blocks: prev.blocks.filter((b: any) => b.id !== blockId),
      }));
    }
  };

  // Guard: playerId must exist
  if (!playerId) {
    return (
      <ErrorState
        message="Spiller-ID mangler"
        onRetry={() => navigate('/coach/athletes')}
      />
    );
  }

  if (state === 'loading') {
    return <LoadingState message="Laster treningsplan..." />;
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
    <CoachTrainingPlanEditor
      athleteId={playerId}
      athleteName={data.athleteName}
      blocks={data.blocks.length > 0 ? data.blocks : undefined}
      onAddBlock={handleAddBlock}
      onUpdateBlock={handleUpdateBlock}
      onRemoveBlock={handleRemoveBlock}
      onBack={handleBack}
    />
  );
};

export default CoachTrainingPlanEditorContainer;
