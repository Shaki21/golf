import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import PlanPreview from './PlanPreview';

const PlanPreviewContainer = () => {
  const { planId } = useParams();
  const { user } = useAuth();
  const [state, setState] = useState('loading');
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState(null);

  const fetchPlan = useCallback(async () => {
    try {
      setState('loading');
      setError(null);
      const response = await apiClient.get(`/training-plan/${planId}/full`);
      setPlan(response.data);
      setState('idle');
    } catch (err) {
      console.error('Error fetching plan:', err);
      setError(err);
      setState('error');
    }
  }, [planId]);

  useEffect(() => {
    if (user && planId) {
      fetchPlan();
    }
  }, [user, planId, fetchPlan]);

  if (state === 'loading') {
    return <LoadingState message="Laster planforhåndsvisning..." />;
  }

  if (state === 'error') {
    return (
      <ErrorState
        errorType={error?.type}
        message={error?.message || 'Kunne ikke laste plan'}
        onRetry={fetchPlan}
      />
    );
  }

  return <PlanPreview plan={plan} />;
};

export default PlanPreviewContainer;
