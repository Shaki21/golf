/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { analyticsAPI, playersAPI } from '../../services/api';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import CoachAthleteDetail from './CoachAthleteDetail';

/**
 * CoachAthleteDetailContainer
 * Fetches athlete data and provides navigation context.
 * The detail component is a neutral navigation hub per the contract.
 */
const CoachAthleteDetailContainer: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState<'loading' | 'idle' | 'error'>('loading');
  const [error, setError] = useState<Error | null>(null);
  const [athleteData, setAthleteData] = useState<any>(null);

  const fetchAthleteDetail = useCallback(async () => {
    if (!playerId) return;

    try {
      setState('loading');
      setError(null);

      // Try coach analytics first, fallback to players API
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any = null;
      try {
        const response = await analyticsAPI.getPlayerOverview(playerId);
        data = response.data?.data || response.data;
      } catch {
        // Fallback to players API
        const response = await playersAPI.getById(playerId);
        data = response.data?.data || response.data;
      }

      setAthleteData(data);
      setState('idle');
    } catch (err: any) {
      console.error('Error fetching athlete detail:', err);
      setError(err);
      setState('error');
    }
  }, [playerId]);

  useEffect(() => {
    if (user && playerId) {
      fetchAthleteDetail();
    }
  }, [user, playerId, fetchAthleteDetail]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewProof = (athleteId: string) => {
    navigate(`/coach/athletes/${athleteId}/proof`);
  };

  const handleViewTrajectory = (athleteId: string) => {
    navigate(`/coach/athletes/${athleteId}/trajectory`);
  };

  const handleEditTrainingPlan = (athleteId: string) => {
    navigate(`/coach/athletes/${athleteId}/training-plan`);
  };

  const handleViewNotes = (athleteId: string) => {
    navigate(`/coach/athletes/${athleteId}/notes`);
  };

  if (state === 'loading') {
    return <LoadingState message="Laster spillerdetaljer..." />;
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
        message={error?.message || 'Kunne ikke laste spillerdetaljer'}
        onRetry={fetchAthleteDetail}
      />
    );
  }

  const athleteName = athleteData
    ? `${athleteData.firstName || ''} ${athleteData.lastName || ''}`.trim() || 'Spiller'
    : 'Spiller';

  return (
    <CoachAthleteDetail
      athleteId={playerId}
      athleteName={athleteName}
      onBack={handleBack}
      onViewProof={handleViewProof}
      onViewTrajectory={handleViewTrajectory}
      onEditTrainingPlan={handleEditTrainingPlan}
      onViewNotes={handleViewNotes}
    />
  );
};

export default CoachAthleteDetailContainer;
