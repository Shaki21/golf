/**
 * DagbokHierarchyFilters
 *
 * Advanced filter panel with conditional dropdowns based on
 * selected pyramid and area. Follows AK hierarchy rules.
 *
 * Migrated to Tailwind CSS
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';

import type {
  DagbokState,
  DagbokActions,
  FilterVisibility,
  Area,
  LPhase,
  Environment,
  Pressure,
  CSLevel,
  Position,
  TournamentType,
  PhysicalFocus,
  PlayFocus,
  PuttingFocus,
} from '../types';

import type { FilterOptions } from '../hooks/useDagbokFilters';

import {
  TOURNAMENT_TYPES,
  PHYSICAL_FOCUS,
  PLAY_FOCUS,
  PUTTING_FOCUS,
} from '../constants';

// =============================================================================
// FILTER SELECT COMPONENT
// =============================================================================

interface FilterSelectProps<T> {
  label: string;
  value: T | null;
  onChange: (value: T | null) => void;
  options: { value: T; label: string; description?: string }[];
  placeholder?: string;
  disabled?: boolean;
}

function FilterSelect<T extends string | number>({
  label,
  value,
  onChange,
  options,
  placeholder = 'All',
  disabled = false,
}: FilterSelectProps<T>) {
  return (
    <div className="flex flex-col gap-1 min-w-[140px]">
      <span className="text-[10px] font-semibold text-tier-text-tertiary uppercase tracking-wider">
        {label}
      </span>
      <div className="relative">
        <select
          value={value ?? ''}
          onChange={(e) => {
            const val = e.target.value;
            onChange(val === '' ? null : (val as T));
          }}
          className={`w-full py-1.5 pl-2.5 pr-7 text-[13px] font-medium text-tier-navy bg-white border border-tier-border-default rounded cursor-pointer appearance-none outline-none transition-all ${
            disabled ? 'opacity-50' : ''
          }`}
          disabled={disabled}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-tier-text-tertiary"
        />
      </div>
    </div>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export interface DagbokHierarchyFiltersProps {
  state: DagbokState;
  actions: DagbokActions;
  visibility: FilterVisibility;
  options: FilterOptions;
  className?: string;
}

export const DagbokHierarchyFilters: React.FC<DagbokHierarchyFiltersProps> = ({
  state,
  actions,
  visibility,
  options,
  className = '',
}) => {
  // If no filters visible, don't render
  const hasVisibleFilters = Object.values(visibility).some(Boolean);

  if (!hasVisibleFilters) {
    return (
      <div className={`px-4 py-3 bg-tier-surface-subtle border-b border-tier-border-default ${className}`}>
        <p className="text-[13px] text-tier-text-tertiary italic py-2">
          Select a pyramid category to show advanced filters
        </p>
      </div>
    );
  }

  return (
    <div className={`px-4 py-3 bg-tier-surface-subtle border-b border-tier-border-default ${className}`}>
      <div className="flex flex-wrap gap-2.5">
        {/* Area */}
        {visibility.showArea && (
          <FilterSelect<Area>
            label="Area"
            value={state.area}
            onChange={actions.setArea}
            options={options.areas}
            placeholder="All areas"
          />
        )}

        {/* L-Phase */}
        {visibility.showLPhase && (
          <FilterSelect<LPhase>
            label="Learning Phase"
            value={state.lPhase}
            onChange={actions.setLPhase}
            options={options.lPhases}
            placeholder="All phases"
          />
        )}

        {/* Environment */}
        {visibility.showEnvironment && (
          <FilterSelect<Environment>
            label="Environment"
            value={state.environment}
            onChange={actions.setEnvironment}
            options={options.environments}
            placeholder="All environments"
          />
        )}

        {/* Pressure */}
        {visibility.showPressure && (
          <FilterSelect<Pressure>
            label="Pressure"
            value={state.pressure}
            onChange={actions.setPressure}
            options={options.pressures}
            placeholder="All levels"
          />
        )}

        {/* CS Level */}
        {visibility.showCS && (
          <FilterSelect<CSLevel>
            label="Club Speed"
            value={state.csLevel}
            onChange={actions.setCSLevel}
            options={options.csLevels}
            placeholder="All speeds"
          />
        )}

        {/* Position */}
        {visibility.showPosition && (
          <FilterSelect<Position>
            label="Position"
            value={state.position}
            onChange={actions.setPosition}
            options={options.positions}
            placeholder="All positions"
          />
        )}

        {/* Physical Focus (FYS) */}
        {visibility.showPhysicalFocus && (
          <FilterSelect<PhysicalFocus>
            label="Focus"
            value={state.physicalFocus}
            onChange={actions.setPhysicalFocus}
            options={(Object.keys(PHYSICAL_FOCUS) as PhysicalFocus[]).map((f) => ({
              value: f,
              label: PHYSICAL_FOCUS[f].label,
              description: PHYSICAL_FOCUS[f].description,
            }))}
            placeholder="All focus areas"
          />
        )}

        {/* Tournament Type (TURN) */}
        {visibility.showTournamentType && (
          <FilterSelect<TournamentType>
            label="Tournament Type"
            value={state.tournamentType}
            onChange={actions.setTournamentType}
            options={(Object.keys(TOURNAMENT_TYPES) as TournamentType[]).map((t) => ({
              value: t,
              label: TOURNAMENT_TYPES[t].label,
              description: TOURNAMENT_TYPES[t].description,
            }))}
            placeholder="All types"
          />
        )}

        {/* Play Focus (SPILL) */}
        {visibility.showPlayFocus && (
          <FilterSelect<PlayFocus>
            label="Play Focus"
            value={state.playFocus}
            onChange={actions.setPlayFocus}
            options={(Object.keys(PLAY_FOCUS) as PlayFocus[]).map((f) => ({
              value: f,
              label: PLAY_FOCUS[f].label,
              description: PLAY_FOCUS[f].description,
            }))}
            placeholder="All focus areas"
          />
        )}

        {/* Putting Focus */}
        {visibility.showPuttingFocus && (
          <FilterSelect<PuttingFocus>
            label="Putting Focus"
            value={state.puttingFocus}
            onChange={actions.setPuttingFocus}
            options={(Object.keys(PUTTING_FOCUS) as PuttingFocus[]).map((f) => ({
              value: f,
              label: PUTTING_FOCUS[f].label,
              description: PUTTING_FOCUS[f].description,
            }))}
            placeholder="All focus areas"
          />
        )}
      </div>
    </div>
  );
};

export default DagbokHierarchyFilters;
