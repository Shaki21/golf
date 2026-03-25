/**
 * Annual Plan Wizard Hook
 * State management for the wizard flow
 */

import { useState, useCallback } from 'react';
import type { Period } from './usePlayerAnnualPlan';

interface WizardState {
  currentStep: number;
  totalSteps: number;
  basicInfo: {
    name: string;
    startDate: string;
    endDate: string;
    playerLevel: string;
  };
  selectedPeriodTypes: Array<'E' | 'G' | 'S' | 'T'>;
  periods: Period[];
  shortTermGoals: string[];   // 6-12 months
  longTermGoals: string[];    // 1-3 years
}

const initialState: WizardState = {
  currentStep: 0,
  totalSteps: 5,
  basicInfo: {
    name: '',
    startDate: '',
    endDate: '',
    playerLevel: 'talent',
  },
  selectedPeriodTypes: [],
  periods: [],
  shortTermGoals: [],
  longTermGoals: [],
};

export function useAnnualPlanWizard() {
  const [state, setState] = useState<WizardState>(initialState);

  const goToNext = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.totalSteps - 1),
    }));
  }, []);

  const goToPrevious = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
    }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, Math.min(step, prev.totalSteps - 1)),
    }));
  }, []);

  const updateBasicInfo = useCallback(
    (info: Partial<WizardState['basicInfo']>) => {
      setState((prev) => ({
        ...prev,
        basicInfo: { ...prev.basicInfo, ...info },
      }));
    },
    []
  );

  const updatePeriodTypes = useCallback(
    (types: Array<'E' | 'G' | 'S' | 'T'>) => {
      setState((prev) => ({ ...prev, selectedPeriodTypes: types }));
    },
    []
  );

  const updatePeriods = useCallback((periods: Period[]) => {
    setState((prev) => ({ ...prev, periods }));
  }, []);

  const updateShortTermGoals = useCallback((goals: string[]) => {
    setState((prev) => ({ ...prev, shortTermGoals: goals }));
  }, []);

  const updateLongTermGoals = useCallback((goals: string[]) => {
    setState((prev) => ({ ...prev, longTermGoals: goals }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    state,
    goToNext,
    goToPrevious,
    goToStep,
    updateBasicInfo,
    updatePeriodTypes,
    updatePeriods,
    updateShortTermGoals,
    updateLongTermGoals,
    reset,
    isFirstStep: state.currentStep === 0,
    isLastStep: state.currentStep === state.totalSteps - 1,
    canGoNext: true, // Add validation logic here
  };
}
