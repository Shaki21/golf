/**
 * Player Annual Plan Hook
 * API interactions for player annual plans
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import apiClient from '../../../services/apiClient';
import { toast } from 'sonner';

export interface Period {
  id: string;
  type: 'E' | 'G' | 'S' | 'T';
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  weeklyFrequency: number;
  weeklyHours?: number;  // Training hours per week
  goals: string[];
  color: string;
  textColor: string;
}

export interface AnnualPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  periods: Period[];
  status: string;
}

export function usePlayerAnnualPlan() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<AnnualPlan | null>(null);
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playerId = user?.playerId || user?.id;

  const fetchPlan = useCallback(async () => {
    if (!playerId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(
        `/players/${playerId}/annual-plan`
      );

      if (response.data.success) {
        setPlan(response.data.data.plan);
        setHasActivePlan(response.data.data.hasActivePlan);
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Failed to fetch annual plan';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [playerId]);

  const createPlan = useCallback(
    async (data: {
      name: string;
      startDate: string;
      endDate: string;
      periods: Period[];
    }) => {
      if (!playerId) {
        toast.error('Player ID not found');
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.post(
          `/players/${playerId}/annual-plan`,
          data
        );

        if (response.data.success) {
          setPlan(response.data.data.plan);
          setHasActivePlan(true);
          toast.success('Årsplan opprettet!');
          return response.data.data.plan;
        }
      } catch (err: any) {
        const message =
          err.response?.data?.message || 'Failed to create annual plan';
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [playerId]
  );

  const updatePlan = useCallback(
    async (data: Partial<AnnualPlan>) => {
      if (!playerId) {
        toast.error('Player ID not found');
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.put(
          `/players/${playerId}/annual-plan`,
          data
        );

        if (response.data.success) {
          setPlan(response.data.data.plan);
          toast.success('Årsplan oppdatert!');
          return response.data.data.plan;
        }
      } catch (err: any) {
        const message =
          err.response?.data?.message || 'Failed to update annual plan';
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [playerId]
  );

  const cancelPlan = useCallback(async () => {
    if (!playerId) {
      toast.error('Player ID not found');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.delete(
        `/players/${playerId}/annual-plan`
      );

      if (response.data.success) {
        setPlan(null);
        setHasActivePlan(false);
        toast.success('Årsplan kansellert');
        return true;
      }
      return false;
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Failed to cancel annual plan';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [playerId]);

  return {
    plan,
    hasActivePlan,
    isLoading,
    error,
    fetchPlan,
    createPlan,
    updatePlan,
    cancelPlan,
  };
}
