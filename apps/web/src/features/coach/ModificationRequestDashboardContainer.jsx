import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import ModificationRequestDashboard from './ModificationRequestDashboard';
import { PageHeader } from '../../ui/raw-blocks';

const ModificationRequestDashboardContainer = () => {
  const { user } = useAuth();
  const [state, setState] = useState('loading');
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (user) {
      fetchModificationRequests();
    }
  }, [user]);

  const fetchModificationRequests = async () => {
    try {
      setState('loading');
      setError(null);
      const response = await apiClient.get('/api/v1/coaches/modification-requests');
      setRequests(response.data);
      setState(response.data.length === 0 ? 'empty' : 'idle');
    } catch (err) {
      console.error('Error fetching modification requests:', err);
      // If 404, show empty state (endpoint not implemented yet)
      if (err.response?.status === 404) {
        setRequests([]);
        setState('empty');
      } else {
        setError(err);
        setState('error');
      }
    }
  };

  return (
    <>
      <PageHeader
        title="Endringsforespørsler"
        subtitle="Gjennomgå og svar på spillernes endringsforespørsler"
        helpText="Oversikt over endringsforespørsler fra spillere angående treningsplaner. Filtrer på status (venter, under behandling, løst, avvist). Se spillerdetaljer, bekymringer, hastegrad og behandlingstidspunkter. Svar på forespørsler direkte fra dashboardet."
      />
      {state === 'loading' && <LoadingState message="Laster endringsforespørsler..." />}
      {state === 'error' && (
        <ErrorState
          errorType={error?.type}
          message={error?.message || 'Kunne ikke laste endringsforespørsler'}
          onRetry={fetchModificationRequests}
        />
      )}
      {state === 'empty' && (
        <EmptyState
          title="Ingen forespørsler"
          message="Det er ingen endringsforespørsler å behandle"
        />
      )}
      {state === 'idle' && <ModificationRequestDashboard requests={requests} />}
    </>
  );
};

export default ModificationRequestDashboardContainer;
