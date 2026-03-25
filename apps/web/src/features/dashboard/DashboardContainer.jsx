import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import TierDashboard from './TierDashboard';

const DashboardContainer = () => {
  const { user } = useAuth();
  const [state, setState] = useState('loading');
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setState('loading');
      setError(null);

      // Determine endpoint based on user role
      let response;
      if (user.role === 'coach') {
        // Coach uses coach-analytics dashboard endpoint
        // coachId is available from user context
        response = await apiClient.get(`/coach-analytics/dashboard/${user.coachId || user.id}`);
        setDashboardData(response.data.data); // API returns { success: true, data: {...} }
      } else {
        // Player uses the main dashboard endpoint
        response = await apiClient.get('/dashboard');
        setDashboardData(response.data);
      }
      setState('idle');
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err);
      setState('error');
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  if (state === 'loading') {
    return <LoadingState message="Laster dashboard..." />;
  }

  if (state === 'error') {
    return (
      <ErrorState
        errorType={error?.type}
        message={error?.message || 'Kunne ikke laste dashboard'}
        onRetry={fetchDashboardData}
      />
    );
  }

  return <TierDashboard dashboardData={dashboardData} />;
};

export default DashboardContainer;
