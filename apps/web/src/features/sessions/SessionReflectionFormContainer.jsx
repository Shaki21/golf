import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import SessionReflectionForm from './SessionReflectionForm';

const SessionReflectionFormContainer = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const [state, setState] = useState('loading');
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);

  const fetchSessionForReflection = useCallback(async () => {
    try {
      setState('loading');
      setError(null);
      const response = await apiClient.get(`/api/v1/bookings/${sessionId}`);
      setSession(response.data);
      setState('idle');
    } catch (err) {
      console.error('Error fetching session for reflection:', err);
      setError(err);
      setState('error');
    }
  }, [sessionId]);

  useEffect(() => {
    if (user && sessionId) {
      fetchSessionForReflection();
    }
  }, [user, sessionId, fetchSessionForReflection]);

  if (state === 'loading') {
    return <LoadingState message="Laster refleksjonsform..." />;
  }

  if (state === 'error') {
    return (
      <ErrorState
        errorType={error?.type}
        message={error?.message || 'Kunne ikke laste refleksjonsform'}
        onRetry={fetchSessionForReflection}
      />
    );
  }

  return <SessionReflectionForm session={session} />;
};

export default SessionReflectionFormContainer;
