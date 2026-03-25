import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import Kalender from './Kalender';

const KalenderContainer = () => {
  const { user } = useAuth();
  const [state, setState] = useState('loading');
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (user) {
      fetchCalendarEvents();
    }
  }, [user]);

  const fetchCalendarEvents = async () => {
    try {
      setState('loading');
      setError(null);
      const response = await apiClient.get('/calendar/events');
      setEvents(response.data);
      setState('idle');
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setError(err);
      setState('error');
    }
  };

  if (state === 'loading') {
    return <LoadingState message="Loading calendar..." />;
  }

  if (state === 'error') {
    return (
      <ErrorState
        errorType={error?.type}
        message={error?.message || 'Could not load calendar'}
        onRetry={fetchCalendarEvents}
      />
    );
  }

  return <Kalender events={events} />;
};

export default KalenderContainer;
