/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * useSessionPlanner Hook
 *
 * Manages wizard state for the session planner:
 * - Current step navigation
 * - Form state across all steps
 * - Step validation
 * - Smart step flow based on selections
 */

import { useState, useCallback, useMemo } from 'react';
import {
  useAKFormula,
  type Pyramid,
  type Area,
  type LPhase,
  type CSLevel,
  type Environment,
  type Pressure,
  type Position,
  type PuttingFocus,
  type TournamentType,
  type PhysicalFocus,
  type PlayFocus,
  type ParsedFormula,
} from './useAKFormula';

// =============================================================================
// TYPES
// =============================================================================

export type WizardStep = 'pyramid' | 'area' | 'lphase' | 'context' | 'focus' | 'summary';

export interface SessionFormState {
  // Step 1: Pyramide
  pyramid: Pyramid | null;

  // Step 2: Område
  area: Area | null;

  // Step 3: L-fase
  lPhase: LPhase | null;

  // Step 4: Kontekst
  csLevel: CSLevel;
  environment: Environment | null;
  pressure: Pressure | null;

  // Step 5: Fokus
  positionStart: Position | null;
  positionEnd: Position | null;
  puttingFocus: PuttingFocus | null;
  puttingPhases: string | null;

  // Spesialtilfeller
  tournamentType: TournamentType | null;
  physicalFocus: PhysicalFocus | null;
  playFocus: PlayFocus | null;

  // Metadata
  date: string;
  startTime: string;
  duration: number;
}

export interface UseSessionPlannerResult {
  // State
  currentStep: WizardStep;
  formState: SessionFormState;
  parsedFormula: ParsedFormula | null;

  // Navigation
  steps: WizardStep[];
  currentStepIndex: number;
  canGoNext: boolean;
  canGoBack: boolean;
  goNext: () => void;
  goBack: () => void;
  goToStep: (step: WizardStep) => void;

  // Form updates
  setPyramid: (pyramid: Pyramid) => void;
  setArea: (area: Area) => void;
  setLPhase: (lPhase: LPhase) => void;
  setCSLevel: (level: CSLevel) => void;
  setEnvironment: (env: Environment) => void;
  setPressure: (pressure: Pressure) => void;
  setPositionStart: (pos: Position | null) => void;
  setPositionEnd: (pos: Position | null) => void;
  setPuttingFocus: (focus: PuttingFocus) => void;
  setPuttingPhases: (phases: string) => void;
  setTournamentType: (type: TournamentType) => void;
  setPhysicalFocus: (focus: PhysicalFocus) => void;
  setPlayFocus: (focus: PlayFocus) => void;
  setDate: (date: string) => void;
  setStartTime: (time: string) => void;
  setDuration: (duration: number) => void;

  // Helpers
  reset: () => void;
  isStepComplete: (step: WizardStep) => boolean;
  getStepErrors: (step: WizardStep) => string[];
}

// =============================================================================
// INITIAL STATE
// =============================================================================

function getInitialFormState(initialDate?: Date): SessionFormState {
  const now = new Date();
  const dateStr = initialDate
    ? initialDate.toISOString().split('T')[0]
    : now.toISOString().split('T')[0];

  return {
    pyramid: null,
    area: null,
    lPhase: null,
    csLevel: 50,
    environment: null,
    pressure: null,
    positionStart: null,
    positionEnd: null,
    puttingFocus: null,
    puttingPhases: null,
    tournamentType: null,
    physicalFocus: null,
    playFocus: null,
    date: dateStr,
    startTime: '09:00',
    duration: 45,
  };
}

// =============================================================================
// HOOK
// =============================================================================

export function useSessionPlanner(initialDate?: Date): UseSessionPlannerResult {
  const akFormula = useAKFormula();

  const [currentStep, setCurrentStep] = useState<WizardStep>('pyramid');
  const [formState, setFormState] = useState<SessionFormState>(() =>
    getInitialFormState(initialDate)
  );

  // ---------------------------------------------------------------------------
  // Determine which steps are needed based on pyramid selection
  // ---------------------------------------------------------------------------
  const steps = useMemo((): WizardStep[] => {
    const { pyramid } = formState;

    if (!pyramid) {
      return ['pyramid'];
    }

    // FYS: Pyramid → Summary (no area, L-phase, etc.)
    if (pyramid === 'FYS') {
      return ['pyramid', 'summary'];
    }

    // TURN: Pyramid → Summary
    if (pyramid === 'TURN') {
      return ['pyramid', 'summary'];
    }

    // TEK, SLAG, SPILL: Full wizard
    return ['pyramid', 'area', 'lphase', 'context', 'focus', 'summary'];
  }, [formState.pyramid]);

  const currentStepIndex = useMemo(() => {
    return steps.indexOf(currentStep);
  }, [steps, currentStep]);

  // ---------------------------------------------------------------------------
  // Step validation
  // ---------------------------------------------------------------------------
  const isStepComplete = useCallback(
    (step: WizardStep): boolean => {
      switch (step) {
        case 'pyramid':
          if (!formState.pyramid) return false;
          // FYS needs physicalFocus
          if (formState.pyramid === 'FYS' && !formState.physicalFocus) return false;
          // TURN needs tournamentType
          if (formState.pyramid === 'TURN' && !formState.tournamentType) return false;
          return true;

        case 'area':
          return formState.area !== null;

        case 'lphase':
          return formState.lPhase !== null;

        case 'context':
          return formState.environment !== null && formState.pressure !== null;

        case 'focus':
          // For putting: need focus and phases
          if (formState.area && akFormula.isPutting(formState.area)) {
            return formState.puttingFocus !== null && formState.puttingPhases !== null;
          }
          // For other areas: position is optional
          return true;

        case 'summary':
          return true;

        default:
          return false;
      }
    },
    [formState, akFormula]
  );

  const getStepErrors = useCallback(
    (step: WizardStep): string[] => {
      const errors: string[] = [];

      switch (step) {
        case 'pyramid':
          if (!formState.pyramid) {
            errors.push('Velg et treningsnivå');
          }
          if (formState.pyramid === 'FYS' && !formState.physicalFocus) {
            errors.push('Velg et fokusområde for fysisk trening');
          }
          if (formState.pyramid === 'TURN' && !formState.tournamentType) {
            errors.push('Velg turneringstype');
          }
          break;

        case 'area':
          if (!formState.area) {
            errors.push('Velg et treningsområde');
          }
          break;

        case 'lphase':
          if (!formState.lPhase) {
            errors.push('Velg en læringsfase');
          }
          break;

        case 'context':
          if (!formState.environment) {
            errors.push('Velg treningsmiljø');
          }
          if (!formState.pressure) {
            errors.push('Velg pressnivå');
          }
          break;

        case 'focus':
          if (formState.area && akFormula.isPutting(formState.area)) {
            if (!formState.puttingFocus) {
              errors.push('Velg putting-fokus');
            }
            if (!formState.puttingPhases) {
              errors.push('Velg putting-faser');
            }
          }
          break;
      }

      return errors;
    },
    [formState, akFormula]
  );

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------
  const canGoNext = useMemo(() => {
    return isStepComplete(currentStep) && currentStepIndex < steps.length - 1;
  }, [isStepComplete, currentStep, currentStepIndex, steps.length]);

  const canGoBack = useMemo(() => {
    return currentStepIndex > 0;
  }, [currentStepIndex]);

  const goNext = useCallback(() => {
    if (canGoNext) {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  }, [canGoNext, steps, currentStepIndex]);

  const goBack = useCallback(() => {
    if (canGoBack) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  }, [canGoBack, steps, currentStepIndex]);

  const goToStep = useCallback(
    (step: WizardStep) => {
      const targetIndex = steps.indexOf(step);
      if (targetIndex >= 0 && targetIndex <= currentStepIndex) {
        setCurrentStep(step);
      }
    },
    [steps, currentStepIndex]
  );

  // ---------------------------------------------------------------------------
  // Form setters
  // ---------------------------------------------------------------------------
  const setPyramid = useCallback((pyramid: Pyramid) => {
    setFormState((prev) => {
      const newState = { ...prev, pyramid };

      // Auto-set environment and pressure for special cases
      if (pyramid === 'FYS') {
        newState.environment = 'M0';
        newState.pressure = 'PR1';
      } else if (pyramid === 'TURN') {
        newState.environment = 'M5';
        newState.pressure = 'PR5';
      }

      // Reset area-specific fields when changing pyramid
      newState.area = null;
      newState.lPhase = null;
      newState.positionStart = null;
      newState.positionEnd = null;
      newState.puttingFocus = null;
      newState.puttingPhases = null;

      return newState;
    });
  }, []);

  const setArea = useCallback(
    (area: Area) => {
      setFormState((prev) => {
        const newState = { ...prev, area };

        // Reset position/putting fields
        newState.positionStart = null;
        newState.positionEnd = null;
        newState.puttingFocus = null;
        newState.puttingPhases = null;

        // Set default putting phases
        if (akFormula.isPutting(area)) {
          newState.puttingPhases = 'S-F';
        }

        return newState;
      });
    },
    [akFormula]
  );

  const setLPhase = useCallback(
    (lPhase: LPhase) => {
      setFormState((prev) => {
        const newState = { ...prev, lPhase };

        // Suggest CS level based on L-phase
        const recommended = akFormula.getRecommendedCS(lPhase);
        if (recommended) {
          // Set to middle of recommended range
          newState.csLevel = Math.round((recommended.min + recommended.max) / 2 / 10) * 10 as CSLevel;
        } else {
          newState.csLevel = 0;
        }

        return newState;
      });
    },
    [akFormula]
  );

  const setCSLevel = useCallback((level: CSLevel) => {
    setFormState((prev) => ({ ...prev, csLevel: level }));
  }, []);

  const setEnvironment = useCallback((environment: Environment) => {
    setFormState((prev) => ({ ...prev, environment }));
  }, []);

  const setPressure = useCallback((pressure: Pressure) => {
    setFormState((prev) => ({ ...prev, pressure }));
  }, []);

  const setPositionStart = useCallback((positionStart: Position | null) => {
    setFormState((prev) => ({ ...prev, positionStart }));
  }, []);

  const setPositionEnd = useCallback((positionEnd: Position | null) => {
    setFormState((prev) => ({ ...prev, positionEnd }));
  }, []);

  const setPuttingFocus = useCallback((puttingFocus: PuttingFocus) => {
    setFormState((prev) => ({ ...prev, puttingFocus }));
  }, []);

  const setPuttingPhases = useCallback((puttingPhases: string) => {
    setFormState((prev) => ({ ...prev, puttingPhases }));
  }, []);

  const setTournamentType = useCallback((tournamentType: TournamentType) => {
    setFormState((prev) => ({ ...prev, tournamentType }));
  }, []);

  const setPhysicalFocus = useCallback((physicalFocus: PhysicalFocus) => {
    setFormState((prev) => ({ ...prev, physicalFocus }));
  }, []);

  const setPlayFocus = useCallback((playFocus: PlayFocus) => {
    setFormState((prev) => ({ ...prev, playFocus }));
  }, []);

  const setDate = useCallback((date: string) => {
    setFormState((prev) => ({ ...prev, date }));
  }, []);

  const setStartTime = useCallback((startTime: string) => {
    setFormState((prev) => ({ ...prev, startTime }));
  }, []);

  const setDuration = useCallback((duration: number) => {
    setFormState((prev) => ({ ...prev, duration }));
  }, []);

  // ---------------------------------------------------------------------------
  // Reset
  // ---------------------------------------------------------------------------
  const reset = useCallback(() => {
    setFormState(getInitialFormState(initialDate));
    setCurrentStep('pyramid');
  }, [initialDate]);

  // ---------------------------------------------------------------------------
  // Generate parsed formula
  // ---------------------------------------------------------------------------
  const parsedFormula = useMemo((): ParsedFormula | null => {
    if (!formState.pyramid) return null;

    // Build input based on what's available
    const input = {
      pyramid: formState.pyramid,
      area: formState.area || undefined,
      lPhase: formState.lPhase || undefined,
      csLevel: formState.area && akFormula.areaUsesCS(formState.area) ? formState.csLevel : undefined,
      environment: formState.environment || 'M2',
      pressure: formState.pressure || 'PR1',
      positionStart: formState.positionStart || undefined,
      positionEnd: formState.positionEnd || undefined,
      puttingFocus: formState.puttingFocus || undefined,
      puttingPhases: formState.puttingPhases || undefined,
      tournamentType: formState.tournamentType || undefined,
      physicalFocus: formState.physicalFocus || undefined,
      playFocus: formState.playFocus || undefined,
    };

    return akFormula.createFormula(input as any);
  }, [formState, akFormula]);

  return {
    // State
    currentStep,
    formState,
    parsedFormula,

    // Navigation
    steps,
    currentStepIndex,
    canGoNext,
    canGoBack,
    goNext,
    goBack,
    goToStep,

    // Form updates
    setPyramid,
    setArea,
    setLPhase,
    setCSLevel,
    setEnvironment,
    setPressure,
    setPositionStart,
    setPositionEnd,
    setPuttingFocus,
    setPuttingPhases,
    setTournamentType,
    setPhysicalFocus,
    setPlayFocus,
    setDate,
    setStartTime,
    setDuration,

    // Helpers
    reset,
    isStepComplete,
    getStepErrors,
  };
}

export default useSessionPlanner;
