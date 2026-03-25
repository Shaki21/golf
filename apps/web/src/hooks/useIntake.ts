/**
 * useIntake Hook
 * Manages player intake forms for onboarding and plan generation
 */

import { useState, useCallback } from 'react';
import { intakeAPI, PlayerIntake } from '../services/api';

interface IntakeFormData {
  background?: {
    yearsPlaying: number;
    currentHandicap: number;
    averageScore: number;
    roundsPerYear: number;
    trainingHistory: 'none' | 'sporadic' | 'regular' | 'systematic';
  };
  availability?: {
    hoursPerWeek: number;
    preferredDays: number[];
    canTravelToFacility: boolean;
    hasHomeEquipment: boolean;
  };
  goals?: {
    primaryGoal: 'lower_handicap' | 'compete_tournaments' | 'consistency' | 'enjoy_more' | 'specific_skill';
    targetHandicap?: number;
    targetScore?: number;
    timeframe: '3_months' | '6_months' | '12_months';
    tournaments?: Array<{ name: string; date: Date; importance: 'major' | 'important' | 'minor' }>;
  };
  weaknesses?: {
    biggestFrustration: string;
    problemAreas: string[];
    mentalChallenges?: string[];
  };
  health?: {
    currentInjuries: Array<{ type: string; resolved: boolean; requiresModification: boolean; affectedAreas: string[] }>;
    injuryHistory: Array<{ type: string; resolved: boolean }>;
    ageGroup: '<25' | '25-35' | '35-45' | '45-55' | '55-65' | '65+';
  };
  lifestyle?: {
    workSchedule: 'flexible' | 'regular_hours' | 'irregular' | 'shift_work';
    stressLevel: number;
    sleepQuality: number;
    nutritionFocus: boolean;
    physicalActivity: 'sedentary' | 'light' | 'moderate' | 'active';
  };
  equipment?: {
    hasDriverSpeedMeasurement: boolean;
    driverSpeed?: number;
    recentClubFitting: boolean;
    accessToTrackMan: boolean;
    accessToGym: boolean;
    willingToInvest: 'minimal' | 'moderate' | 'significant';
  };
  learning?: {
    preferredStyle: 'visual' | 'verbal' | 'kinesthetic' | 'mixed';
    wantsDetailedExplanations: boolean;
    prefersStructure: boolean;
    motivationType: 'competition' | 'personal_growth' | 'social' | 'achievement';
  };
}

interface UseIntakeReturn {
  intake: PlayerIntake | null;
  loading: boolean;
  error: string | null;
  submitting: boolean;
  fetchIntake: (playerId: string) => Promise<PlayerIntake | null>;
  submitIntake: (playerId: string, data: Partial<IntakeFormData>) => Promise<{ id: string; completionPercentage: number; isComplete: boolean } | null>;
  generatePlan: (intakeId: string) => Promise<boolean>;
}

export function useIntake(): UseIntakeReturn {
  const [intake, setIntake] = useState<PlayerIntake | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIntake = useCallback(async (playerId: string): Promise<PlayerIntake | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await intakeAPI.getForPlayer(playerId);
      if (response.data?.data) {
        setIntake(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (err: unknown) {
      // 404 is expected if no intake exists yet
      if ((err as { response?: { status?: number } })?.response?.status !== 404) {
        setError(err instanceof Error ? err.message : 'Kunne ikke hente intake-skjema');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitIntake = useCallback(async (
    playerId: string,
    data: Partial<IntakeFormData>
  ): Promise<{ id: string; completionPercentage: number; isComplete: boolean } | null> => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await intakeAPI.submit({ playerId, ...data });
      if (response.data?.data) {
        // Refetch to get updated intake
        await fetchIntake(playerId);
        return response.data.data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke lagre intake-skjema');
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [fetchIntake]);

  const generatePlan = useCallback(async (intakeId: string): Promise<boolean> => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await intakeAPI.generatePlan(intakeId);
      if (response.data?.data) {
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke generere treningsplan');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    intake,
    loading,
    error,
    submitting,
    fetchIntake,
    submitIntake,
    generatePlan,
  };
}

export default useIntake;
