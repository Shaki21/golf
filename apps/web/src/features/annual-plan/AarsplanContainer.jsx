import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import Aarsplan from './Aarsplan';

/**
 * AarsplanContainer
 *
 * @param {string} view - Optional view mode: 'overview' | 'periods' | 'focus'
 *   - overview: Full årsplan (default)
 *   - periods: Focus on period breakdown and periodization
 *   - focus: Focus on goals and focus areas per period
 */
const AarsplanContainer = ({ view = 'overview' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState('loading');
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    if (user) {
      fetchPlans();
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      setState('loading');
      setError(null);

      const response = await apiClient.get('/training-plan');
      setPlans(response.data);
      setState(response.data.length === 0 ? 'empty' : 'idle');
    } catch (err) {
      console.error('Error fetching annual plans:', err);
      setError(err);
      setState('error');
    }
  };

  if (state === 'loading') {
    return <LoadingState message="Loading annual plans..." />;
  }

  if (state === 'error') {
    return (
      <ErrorState
        errorType={error?.type}
        message={error?.message || 'Could not load annual plans'}
        onRetry={fetchPlans}
      />
    );
  }

  if (state === 'empty') {
    return (
      <EmptyState
        icon={Calendar}
        title="No annual plans"
        message="You don't have any training plans yet. Create a personal 12-month plan to get started."
        actionLabel="Create annual plan"
        onAction={() => navigate('/aarsplan/ny')}
      />
    );
  }

  return <Aarsplan plans={plans} onRefresh={fetchPlans} initialView={view} />;
};

export default AarsplanContainer;
