import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import SessionDetailView from './SessionDetailView';

const SessionDetailViewContainer = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const [state, setState] = useState('loading');
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);

  const fetchSession = useCallback(async () => {
    try {
      setState('loading');
      setError(null);
      const response = await apiClient.get(`/api/v1/sessions/${sessionId}`);
      setSession(response.data.data || response.data);
      setState('idle');
    } catch (err) {
      console.error('Error fetching session:', err);
      setError(err);
      setState('error');
    }
  }, [sessionId]);

  useEffect(() => {
    if (user && sessionId) {
      fetchSession();
    }
  }, [user, sessionId, fetchSession]);

  if (state === 'loading') {
    return <LoadingState message="Laster økt..." />;
  }

  if (state === 'error') {
    return (
      <ErrorState
        errorType={error?.type}
        message={error?.message || 'Kunne ikke laste økt'}
        onRetry={fetchSession}
      />
    );
  }

  return <SessionDetailView session={session} />;
};

export default SessionDetailViewContainer;
