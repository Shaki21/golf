/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * DagbokFilterBar
 *
 * Single-line filter row with pyramid segmented control,
 * period selector, plan type, and search.
 *
 * Migrated to Tailwind CSS
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  X,
  RotateCcw,
} from 'lucide-react';

import type {
  DagbokState,
  DagbokActions,
  FilterVisibility,
  Pyramid,
  DagbokPeriod,
  DagbokPlanType,
} from '../types';

import {
  PYRAMID_OPTIONS,
  PERIOD_OPTIONS,
  PLAN_TYPE_OPTIONS,
  PYRAMIDS,
  SEARCH_DEBOUNCE_MS,
  PYRAMID_ICONS,
} from '../constants';

import cssStyles from './DagbokFilterBar.module.css';

// =============================================================================
// COMPONENT
// =============================================================================

export interface DagbokFilterBarProps {
  state: DagbokState;
  actions: DagbokActions;
  visibility: FilterVisibility;
  activeFilterCount: number;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
  className?: string;
}

export const DagbokFilterBar: React.FC<DagbokFilterBarProps> = ({
  state,
  actions,
  visibility,
  activeFilterCount,
  showAdvancedFilters,
  onToggleAdvancedFilters,
  className = '',
}) => {
  const [localSearch, setLocalSearch] = useState(state.searchQuery);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Sync local search with state
  useEffect(() => {
    setLocalSearch(state.searchQuery);
  }, [state.searchQuery]);

  // Debounced search
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      actions.setSearchQuery(value);
    }, SEARCH_DEBOUNCE_MS);
  }, [actions]);

  const handleClearSearch = useCallback(() => {
    setLocalSearch('');
    actions.setSearchQuery('');
  }, [actions]);

  // Period label
  const getPeriodLabel = () => {
    if (state.period === 'week') {
      return `Week ${state.weekNumber}, ${state.year}`;
    }
    if (state.period === 'month') {
      return `${state.monthName} ${state.year}`;
    }
    return 'Custom';
  };

  return (
    <div className={`flex flex-col gap-2 px-3 py-2 bg-white border-b border-tier-border-default ${className}`}>
      {/* Top row: Pyramid segment + Period navigation */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Pyramid segmented control */}
        <div className="flex gap-1 bg-tier-surface-subtle p-0.5 rounded">
          {PYRAMID_OPTIONS.map((opt) => {
            const PyramidIcon = opt.value !== 'all' ? PYRAMID_ICONS[opt.value as keyof typeof PYRAMID_ICONS] : null;
            const isActive = opt.value === 'all' ? state.pyramid === null : state.pyramid === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => actions.setPyramid(opt.value === 'all' ? null : opt.value as Pyramid)}
                className={`py-1 px-2.5 rounded-sm text-[11px] font-medium border-none cursor-pointer transition-all duration-150 whitespace-nowrap flex items-center justify-center gap-0.5 min-w-[50px] ${
                  isActive
                    ? 'bg-tier-gold text-white'
                    : 'bg-transparent text-tier-text-secondary hover:bg-white/50'
                }`}
              >
                {PyramidIcon && <PyramidIcon size={13} />}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Period navigation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={actions.goToPrev}
            className="p-1 bg-transparent border-none rounded cursor-pointer text-tier-text-secondary flex items-center justify-center hover:bg-tier-surface-subtle"
            aria-label="Previous"
          >
            <ChevronLeft size={14} />
          </button>

          <span className="text-xs font-semibold text-tier-navy min-w-[120px] text-center">
            {getPeriodLabel()}
          </span>

          <button
            onClick={actions.goToNext}
            className="p-1 bg-transparent border-none rounded cursor-pointer text-tier-text-secondary flex items-center justify-center hover:bg-tier-surface-subtle"
            aria-label="Next"
          >
            <ChevronRight size={14} />
          </button>

          <button
            onClick={actions.goToToday}
            className="py-1 px-2 text-[11px] font-medium text-tier-navy bg-tier-surface-subtle border border-tier-border-default rounded cursor-pointer flex items-center gap-1 hover:bg-white"
          >
            Today
          </button>
        </div>
      </div>

      {/* Bottom row: Period select, Plan type, Search, Filter toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* Period type select */}
          <div className="relative">
            <select
              value={state.period}
              onChange={(e) => actions.setPeriod(e.target.value as DagbokPeriod)}
              className={cssStyles.select}
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Plan type select */}
          <div className="relative">
            <select
              value={state.planType}
              onChange={(e) => actions.setPlanType(e.target.value as DagbokPlanType)}
              className={cssStyles.select}
            >
              {PLAN_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Advanced filters toggle */}
          <button
            onClick={onToggleAdvancedFilters}
            className={`py-1 px-2 text-[11px] font-medium rounded cursor-pointer flex items-center gap-1 transition-colors ${
              showAdvancedFilters
                ? 'bg-tier-gold text-white border border-tier-gold'
                : 'bg-tier-surface-subtle text-tier-text-secondary border border-tier-border-default hover:bg-white'
            }`}
          >
            <Filter size={12} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-tier-gold text-white text-[9px] font-semibold py-0.5 px-1.5 rounded-full min-w-[14px] text-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={actions.resetFilters}
              className="py-1 px-2 text-[11px] font-medium text-tier-text-tertiary bg-transparent border-none cursor-pointer flex items-center gap-0.5 hover:text-tier-text-secondary"
            >
              <RotateCcw size={10} />
              Reset
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Search */}
          <div className="flex items-center gap-1.5 py-1 px-2 bg-tier-surface-subtle border border-tier-border-default rounded min-w-[160px]">
            <Search size={12} className="text-tier-text-tertiary" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={localSearch}
              onChange={handleSearchChange}
              className="flex-1 border-none outline-none bg-transparent text-[11px] text-tier-navy placeholder:text-tier-text-tertiary"
            />
            {localSearch && (
              <button
                onClick={handleClearSearch}
                className="p-0.5 bg-transparent border-none cursor-pointer text-tier-text-tertiary flex items-center justify-center rounded-full hover:text-tier-text-secondary"
              >
                <X size={10} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DagbokFilterBar;
