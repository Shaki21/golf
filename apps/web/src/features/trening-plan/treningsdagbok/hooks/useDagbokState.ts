/**
 * useDagbokState Hook
 *
 * URL-based state management for the Training Ledger.
 * URL is the single source of truth:
 *   /trening/dagbok?pyramid=TEK&area=TEE&period=week&date=YYYY-MM-DD&planType=all&q=search
 */

import { useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import type {
  Pyramid,
  Area,
  LPhase,
  CSLevel,
  Environment,
  Pressure,
  Position,
  TournamentType,
  PhysicalFocus,
  PlayFocus,
  PuttingFocus,
  DagbokPeriod,
  DagbokPlanType,
  DagbokState,
  DagbokActions,
} from '../types';

import { MONTH_NAMES, CS_LEVELS } from '../constants';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatDateParam(date: Date): string {
  return date.toISOString().split('T')[0];
}

function parseDateParam(dateStr: string | null): Date {
  if (!dateStr) return new Date();
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

function parsePeriodParam(period: string | null): DagbokPeriod {
  if (period && ['week', 'month', 'custom'].includes(period)) {
    return period as DagbokPeriod;
  }
  return 'week';
}

function parsePlanTypeParam(planType: string | null): DagbokPlanType {
  if (planType && ['all', 'planned', 'free'].includes(planType)) {
    return planType as DagbokPlanType;
  }
  return 'all';
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday is first day
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

// Validators for typed params
const VALID_PYRAMIDS = ['FYS', 'TEK', 'SLAG', 'SPILL', 'TURN'];
const VALID_ENVIRONMENTS = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5'];
const VALID_PRESSURES = ['PR1', 'PR2', 'PR3', 'PR4', 'PR5'];
const VALID_L_PHASES = ['L-BODY', 'L-ARM', 'L-CLUB', 'L-BALL', 'L-AUTO'];
const VALID_TOURNAMENT_TYPES = ['RES', 'UTV', 'TRE'];
const VALID_PHYSICAL_FOCUS = ['STYRKE', 'MOBILITET', 'POWER', 'KONDISJON', 'STABILITET'];
const VALID_PLAY_FOCUS = ['STRATEGI', 'SCORING', 'RISIKO'];
const VALID_PUTTING_FOCUS = ['GREEN', 'SIKTE', 'TEKN', 'BALL', 'SPEED'];

// =============================================================================
// HOOK
// =============================================================================

export interface UseDagbokStateResult extends DagbokState, DagbokActions {}

export function useDagbokState(): UseDagbokStateResult {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Parse URL params
  const pyramidStr = searchParams.get('pyramid');
  const pyramid = pyramidStr && VALID_PYRAMIDS.includes(pyramidStr)
    ? (pyramidStr as Pyramid)
    : null;

  const areaStr = searchParams.get('area');
  const area = areaStr ? (areaStr as Area) : null;

  const lPhaseStr = searchParams.get('lPhase');
  const lPhase = lPhaseStr && VALID_L_PHASES.includes(lPhaseStr)
    ? (lPhaseStr as LPhase)
    : null;

  const environmentStr = searchParams.get('m');
  const environment = environmentStr && VALID_ENVIRONMENTS.includes(environmentStr)
    ? (environmentStr as Environment)
    : null;

  const pressureStr = searchParams.get('pr');
  const pressure = pressureStr && VALID_PRESSURES.includes(pressureStr)
    ? (pressureStr as Pressure)
    : null;

  const csStr = searchParams.get('cs');
  const csLevel = csStr
    ? (parseInt(csStr, 10) as CSLevel)
    : null;

  const positionStr = searchParams.get('p');
  const position = positionStr ? (positionStr as Position) : null;

  const tournamentTypeStr = searchParams.get('tournamentType');
  const tournamentType = tournamentTypeStr && VALID_TOURNAMENT_TYPES.includes(tournamentTypeStr)
    ? (tournamentTypeStr as TournamentType)
    : null;

  const physicalFocusStr = searchParams.get('physicalFocus');
  const physicalFocus = physicalFocusStr && VALID_PHYSICAL_FOCUS.includes(physicalFocusStr)
    ? (physicalFocusStr as PhysicalFocus)
    : null;

  const playFocusStr = searchParams.get('playFocus');
  const playFocus = playFocusStr && VALID_PLAY_FOCUS.includes(playFocusStr)
    ? (playFocusStr as PlayFocus)
    : null;

  const puttingFocusStr = searchParams.get('puttingFocus');
  const puttingFocus = puttingFocusStr && VALID_PUTTING_FOCUS.includes(puttingFocusStr)
    ? (puttingFocusStr as PuttingFocus)
    : null;

  const period = parsePeriodParam(searchParams.get('period'));
  const planType = parsePlanTypeParam(searchParams.get('planType'));
  const searchQuery = searchParams.get('q') || '';

  // Memoize date parsing to avoid unnecessary re-renders
  const dateStr = searchParams.get('date');
  const endDateStr = searchParams.get('endDate');

  const anchorDate = useMemo(() => parseDateParam(dateStr), [dateStr]);
  const customEndDate = useMemo(() => endDateStr ? parseDateParam(endDateStr) : null, [endDateStr]);

  // Computed date ranges based on period
  const state = useMemo<DagbokState>(() => {
    let rangeStart: Date;
    let rangeEnd: Date;

    switch (period) {
      case 'week':
        rangeStart = getWeekStart(anchorDate);
        rangeEnd = getWeekEnd(anchorDate);
        break;
      case 'month':
        rangeStart = getMonthStart(anchorDate);
        rangeEnd = getMonthEnd(anchorDate);
        break;
      case 'custom':
        rangeStart = new Date(anchorDate);
        rangeStart.setHours(0, 0, 0, 0);
        rangeEnd = customEndDate || new Date(anchorDate);
        rangeEnd.setHours(23, 59, 59, 999);
        break;
      default:
        rangeStart = getWeekStart(anchorDate);
        rangeEnd = getWeekEnd(anchorDate);
    }

    return {
      pyramid,
      area,
      lPhase,
      environment,
      pressure,
      csLevel,
      position,
      tournamentType,
      physicalFocus,
      playFocus,
      puttingFocus,
      period,
      anchorDate,
      rangeStart,
      rangeEnd,
      weekNumber: getWeekNumber(anchorDate),
      monthName: MONTH_NAMES[anchorDate.getMonth()],
      year: anchorDate.getFullYear(),
      planType,
      searchQuery,
    };
  }, [
    pyramid,
    area,
    lPhase,
    environment,
    pressure,
    csLevel,
    position,
    tournamentType,
    physicalFocus,
    playFocus,
    puttingFocus,
    period,
    anchorDate,
    customEndDate,
    planType,
    searchQuery,
  ]);

  // URL update helper
  const updateUrl = useCallback(
    (updates: Partial<Record<string, string | null>>) => {
      // Get current params from window location to avoid searchParams dependency
      const params = new URLSearchParams(window.location.search);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      navigate(`/trening/dagbok?${params.toString()}`, { replace: true });
    },
    [navigate]
  );

  // Actions
  const setPyramid = useCallback(
    (newPyramid: Pyramid | null) => {
      // When pyramid changes, reset dependent filters
      updateUrl({
        pyramid: newPyramid,
        area: null, // Reset area
        lPhase: null,
        m: null,
        pr: null,
        cs: null,
        p: null,
        tournamentType: null,
        physicalFocus: null,
        playFocus: null,
        puttingFocus: null,
      });
    },
    [updateUrl]
  );

  const setArea = useCallback(
    (newArea: Area | null) => {
      // When area changes, reset position-related filters
      updateUrl({
        area: newArea,
        p: null,
        cs: null,
        puttingFocus: null,
      });
    },
    [updateUrl]
  );

  const setLPhase = useCallback(
    (newLPhase: LPhase | null) => {
      updateUrl({ lPhase: newLPhase });
    },
    [updateUrl]
  );

  const setEnvironment = useCallback(
    (newEnvironment: Environment | null) => {
      updateUrl({ m: newEnvironment });
    },
    [updateUrl]
  );

  const setPressure = useCallback(
    (newPressure: Pressure | null) => {
      updateUrl({ pr: newPressure });
    },
    [updateUrl]
  );

  const setCSLevel = useCallback(
    (newCSLevel: CSLevel | null) => {
      updateUrl({ cs: newCSLevel !== null ? String(newCSLevel) : null });
    },
    [updateUrl]
  );

  const setPosition = useCallback(
    (newPosition: Position | null) => {
      updateUrl({ p: newPosition });
    },
    [updateUrl]
  );

  const setTournamentType = useCallback(
    (newType: TournamentType | null) => {
      updateUrl({ tournamentType: newType });
    },
    [updateUrl]
  );

  const setPhysicalFocus = useCallback(
    (newFocus: PhysicalFocus | null) => {
      updateUrl({ physicalFocus: newFocus });
    },
    [updateUrl]
  );

  const setPlayFocus = useCallback(
    (newFocus: PlayFocus | null) => {
      updateUrl({ playFocus: newFocus });
    },
    [updateUrl]
  );

  const setPuttingFocus = useCallback(
    (newFocus: PuttingFocus | null) => {
      updateUrl({ puttingFocus: newFocus });
    },
    [updateUrl]
  );

  const setPeriod = useCallback(
    (newPeriod: DagbokPeriod) => {
      updateUrl({
        period: newPeriod,
        endDate: null, // Clear custom end date when changing period
      });
    },
    [updateUrl]
  );

  const setDate = useCallback(
    (newDate: Date) => {
      updateUrl({ date: formatDateParam(newDate) });
    },
    [updateUrl]
  );

  const setDateRange = useCallback(
    (start: Date, end: Date) => {
      updateUrl({
        period: 'custom',
        date: formatDateParam(start),
        endDate: formatDateParam(end),
      });
    },
    [updateUrl]
  );

  const goToToday = useCallback(() => {
    updateUrl({ date: formatDateParam(new Date()) });
  }, [updateUrl]);

  const goToNext = useCallback(() => {
    const newDate = new Date(anchorDate);
    switch (period) {
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'custom':
        // For custom, move forward by the range length
        const rangeLength = state.rangeEnd.getTime() - state.rangeStart.getTime();
        newDate.setTime(newDate.getTime() + rangeLength);
        break;
    }
    updateUrl({ date: formatDateParam(newDate) });
  }, [anchorDate, period, state.rangeEnd, state.rangeStart, updateUrl]);

  const goToPrev = useCallback(() => {
    const newDate = new Date(anchorDate);
    switch (period) {
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'custom':
        // For custom, move backward by the range length
        const rangeLength = state.rangeEnd.getTime() - state.rangeStart.getTime();
        newDate.setTime(newDate.getTime() - rangeLength);
        break;
    }
    updateUrl({ date: formatDateParam(newDate) });
  }, [anchorDate, period, state.rangeEnd, state.rangeStart, updateUrl]);

  const setPlanType = useCallback(
    (newPlanType: DagbokPlanType) => {
      updateUrl({ planType: newPlanType === 'all' ? null : newPlanType });
    },
    [updateUrl]
  );

  const setSearchQuery = useCallback(
    (query: string) => {
      updateUrl({ q: query || null });
    },
    [updateUrl]
  );

  const resetFilters = useCallback(() => {
    updateUrl({
      pyramid: null,
      area: null,
      lPhase: null,
      m: null,
      pr: null,
      cs: null,
      p: null,
      tournamentType: null,
      physicalFocus: null,
      playFocus: null,
      puttingFocus: null,
      planType: null,
      q: null,
    });
  }, [updateUrl]);

  const resetAll = useCallback(() => {
    navigate('/trening/dagbok', { replace: true });
  }, [navigate]);

  return {
    ...state,
    setPyramid,
    setArea,
    setLPhase,
    setEnvironment,
    setPressure,
    setCSLevel,
    setPosition,
    setTournamentType,
    setPhysicalFocus,
    setPlayFocus,
    setPuttingFocus,
    setPeriod,
    setDate,
    setDateRange,
    goToToday,
    goToNext,
    goToPrev,
    setPlanType,
    setSearchQuery,
    resetFilters,
    resetAll,
  };
}

export default useDagbokState;
