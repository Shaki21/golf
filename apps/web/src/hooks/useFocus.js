/**
 * useFocus - Hook for fetching player focus recommendation
 * Connects to /api/v1/focus-engine/me/focus endpoint
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const COMPONENT_LABELS = {
  OTT: 'Utslag',
  APP: 'Innspill',
  ARG: 'Kortspill',
  PUTT: 'Putting',
};

const COMPONENT_LABELS_LONG = {
  OTT: 'Off the Tee',
  APP: 'Approach',
  ARG: 'Around the Green',
  PUTT: 'Putting',
};

export function useFocus() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFocus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/focus-engine/me/focus?includeApproachDetail=true');
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError('Could not load focus data');
      }
    } catch (err) {
      // Don't set error for 404 - just means no focus data yet
      if (err.response?.status !== 404) {
        setError(err.message || 'Failed to load focus');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFocus();
  }, [fetchFocus]);

  return {
    data,
    loading,
    error,
    refetch: fetchFocus,
    getLabel: (component) => COMPONENT_LABELS[component] || component,
    getLongLabel: (component) => COMPONENT_LABELS_LONG[component] || component,
  };
}

export default useFocus;
