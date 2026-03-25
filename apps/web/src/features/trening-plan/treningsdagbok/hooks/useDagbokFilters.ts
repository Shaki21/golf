/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * useDagbokFilters Hook
 *
 * Provides filter visibility rules and options based on current state.
 * Implements the conditional logic from AK_GOLF_KATEGORI_HIERARKI_v2.0.md
 */

import { useMemo } from 'react';

import type {
  Pyramid,
  Area,
  DagbokState,
  FilterVisibility,
  FilterOption,
  LPhase,
  Environment,
  Pressure,
  CSLevel,
  Position,
} from '../types';

import {
  PYRAMIDS,
  AREAS,
  L_PHASES,
  ENVIRONMENTS,
  PRESSURE_LEVELS,
  POSITIONS,
  POSITION_ORDER,
  CS_LEVELS,
  AREAS_BY_PYRAMID,
  isFullSwingArea,
  isPuttingArea,
} from '../constants';

// =============================================================================
// TYPES
// =============================================================================

export interface FilterOptions {
  pyramids: FilterOption<Pyramid>[];
  areas: FilterOption<Area>[];
  lPhases: FilterOption<LPhase>[];
  environments: FilterOption<Environment>[];
  pressures: FilterOption<Pressure>[];
  csLevels: FilterOption<CSLevel>[];
  positions: FilterOption<Position>[];
}

export interface UseDagbokFiltersResult {
  visibility: FilterVisibility;
  options: FilterOptions;
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

// =============================================================================
// HOOK
// =============================================================================

export function useDagbokFilters(state: DagbokState): UseDagbokFiltersResult {
  // Compute filter visibility based on current pyramid and area selection
  const visibility = useMemo<FilterVisibility>(() => {
    const { pyramid, area } = state;

    // Base visibility - everything starts false
    const vis: FilterVisibility = {
      showArea: false,
      showLPhase: false,
      showEnvironment: false,
      showPressure: false,
      showCS: false,
      showPosition: false,
      showTournamentType: false,
      showPhysicalFocus: false,
      showPlayFocus: false,
      showPuttingFocus: false,
    };

    if (!pyramid) {
      return vis;
    }

    // FYS: Only physical focus, M0 is fixed
    if (pyramid === 'FYS') {
      vis.showPhysicalFocus = true;
      // Environment is always M0 for FYS, no need to show
      return vis;
    }

    // TURN: Only tournament type, M5 + PR5 are fixed
    if (pyramid === 'TURN') {
      vis.showTournamentType = true;
      return vis;
    }

    // TEK, SLAG, SPILL: Show area selector
    vis.showArea = true;
    vis.showEnvironment = true;
    vis.showPressure = true;

    // SPILL: Show play focus
    if (pyramid === 'SPILL') {
      vis.showPlayFocus = true;
      vis.showCS = true; // SPILL uses CS for bane
      return vis;
    }

    // TEK/SLAG with area selected
    if (area) {
      // L-phase always available for TEK/SLAG
      vis.showLPhase = true;

      // CS only for full swing areas
      if (isFullSwingArea(area)) {
        vis.showCS = true;
        vis.showPosition = true;
      }

      // Short game: positions but no CS
      if (['CHIP', 'PITCH', 'LOB', 'BUNKER'].includes(area)) {
        vis.showPosition = true;
      }

      // Putting: putting focus instead of position/CS
      if (isPuttingArea(area)) {
        vis.showPuttingFocus = true;
        // No CS, no position for putting
      }
    }

    return vis;
  }, [state.pyramid, state.area]);

  // Compute available options based on current state
  const options = useMemo<FilterOptions>(() => {
    const { pyramid, lPhase } = state;

    // Pyramid options - always all available
    const pyramidOpts: FilterOption<Pyramid>[] = (Object.keys(PYRAMIDS) as Pyramid[]).map((p) => ({
      value: p,
      label: PYRAMIDS[p].label,
      description: PYRAMIDS[p].description,
      icon: PYRAMIDS[p].icon,
    }));

    // Area options - based on pyramid
    const areaOpts: FilterOption<Area>[] = pyramid
      ? AREAS_BY_PYRAMID[pyramid].map((a) => ({
          value: a,
          label: AREAS[a].label,
          description: AREAS[a].description,
        }))
      : [];

    // L-phase options - always all (contextual validation handled elsewhere)
    const lPhaseOpts: FilterOption<LPhase>[] = (Object.keys(L_PHASES) as LPhase[]).map((l) => ({
      value: l,
      label: L_PHASES[l].label,
      description: L_PHASES[l].description,
    }));

    // Environment options - based on pyramid
    let envOpts: FilterOption<Environment>[] = [];
    if (pyramid === 'FYS') {
      envOpts = [{ value: 'M0', label: ENVIRONMENTS.M0.label, description: ENVIRONMENTS.M0.description }];
    } else if (pyramid === 'TURN') {
      envOpts = [{ value: 'M5', label: ENVIRONMENTS.M5.label, description: ENVIRONMENTS.M5.description }];
    } else {
      envOpts = (Object.keys(ENVIRONMENTS) as Environment[]).map((e) => ({
        value: e,
        label: ENVIRONMENTS[e].label,
        description: ENVIRONMENTS[e].description,
      }));
    }

    // Pressure options - based on pyramid
    let pressureOpts: FilterOption<Pressure>[] = [];
    if (pyramid === 'TURN') {
      pressureOpts = [{ value: 'PR5', label: PRESSURE_LEVELS.PR5.label, description: PRESSURE_LEVELS.PR5.description }];
    } else {
      pressureOpts = (Object.keys(PRESSURE_LEVELS) as Pressure[]).map((p) => ({
        value: p,
        label: PRESSURE_LEVELS[p].label,
        description: PRESSURE_LEVELS[p].description,
      }));
    }

    // CS options - with L-phase recommendations
    const csOpts: FilterOption<CSLevel>[] = CS_LEVELS.map((cs) => {
      let description = `${cs}% hastighet`;
      let disabled = false;

      // Add L-phase recommendations
      if (lPhase) {
        const recommended = L_PHASES[lPhase].recommendedCS;
        if (recommended) {
          if (cs >= recommended.min && cs <= recommended.max) {
            description += ' (anbefalt)';
          }
        } else if (['L-BODY', 'L-ARM'].includes(lPhase) && cs > 0) {
          description += ' (not recommended for ' + lPhase + ')';
        }
      }

      return {
        value: cs,
        label: `CS${cs}`,
        description,
        disabled,
      };
    });

    // Position options
    const posOpts: FilterOption<Position>[] = POSITION_ORDER.map((p) => ({
      value: p,
      label: POSITIONS[p].label,
      description: POSITIONS[p].description,
    }));

    return {
      pyramids: pyramidOpts,
      areas: areaOpts,
      lPhases: lPhaseOpts,
      environments: envOpts,
      pressures: pressureOpts,
      csLevels: csOpts,
      positions: posOpts,
    };
  }, [state.pyramid, state.area, state.lPhase]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (state.pyramid) count++;
    if (state.area) count++;
    if (state.lPhase) count++;
    if (state.environment) count++;
    if (state.pressure) count++;
    if (state.csLevel !== null) count++;
    if (state.position) count++;
    if (state.tournamentType) count++;
    if (state.physicalFocus) count++;
    if (state.playFocus) count++;
    if (state.puttingFocus) count++;
    if (state.planType !== 'all') count++;
    if (state.searchQuery) count++;
    return count;
  }, [state]);

  return {
    visibility,
    options,
    hasActiveFilters: activeFilterCount > 0,
    activeFilterCount,
  };
}

export default useDagbokFilters;
