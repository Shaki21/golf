/**
 * FilterDrawer - Advanced Tournament Filters Panel
 * Design System v3.1 - Tailwind CSS
 *
 * Slide-in panel with comprehensive filter options:
 * - Tournament purpose (Resultat, Utvikling, Trening)
 * - Competition level
 * - Junior Tour Region
 * - Player category
 * - Tour series
 * - Status
 * - Date range
 * - Country
 */

import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import Button from '../../../ui/primitives/Button';
import { CardTitle, SubSectionTitle } from '../../../components/typography';
import {
  TournamentFilters,
  TourType,
  TournamentStatus,
  PlayerCategory,
  TournamentPurpose,
  CompetitionLevel,
  JuniorTourRegion,
  TOUR_LABELS,
  STATUS_LABELS,
  CATEGORY_LABELS,
  COUNTRY_LABELS,
  COUNTRY_GROUPS,
  PURPOSE_LABELS,
  PURPOSE_DESCRIPTIONS,
  LEVEL_LABELS,
  JUNIOR_TOUR_REGION_LABELS,
  JUNIOR_TOUR_REGION_DESCRIPTIONS,
} from '../types';

interface FilterDrawerProps {
  filters: TournamentFilters;
  onFiltersChange: (filters: TournamentFilters) => void;
  onClose: () => void;
  onClear: () => void;
}

export default function FilterDrawer({
  filters,
  onFiltersChange,
  onClose,
  onClear,
}: FilterDrawerProps) {
  const [localFilters, setLocalFilters] = useState<TournamentFilters>(filters);

  const toggleArrayFilter = <T extends string>(
    key: keyof TournamentFilters,
    value: T
  ) => {
    const current = (localFilters[key] as T[] | undefined) || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setLocalFilters({ ...localFilters, [key]: updated.length ? updated : undefined });
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClear = () => {
    setLocalFilters({});
    onClear();
    onClose();
  };

  const categories: PlayerCategory[] = ['A', 'B', 'C', 'D', 'E'];
  const purposes: TournamentPurpose[] = ['RESULTAT', 'UTVIKLING', 'TRENING'];
  const levels: CompetitionLevel[] = [
    'internasjonal',
    'nasjonal',
    'regional',
    'klubb',
    'junior',
    'trenings_turnering',
  ];
  const juniorRegions: JuniorTourRegion[] = [
    'østlandet-øst',
    'østlandet-vest',
    'sørlandet',
    'vestlandet',
    'midt-norge',
    'nord-norge',
  ];
  const tours: TourType[] = [
    'junior_tour_regional',
    'srixon_tour',
    'garmin_norges_cup',
    'global_junior_tour',
    'nordic_league',
    'ega_turnering',
    'wagr_turnering',
    'college_turneringer',
    'challenge_tour',
    'dp_world_tour',
    'pga_tour',
  ];
  const statuses: TournamentStatus[] = [
    'open',
    'upcoming',
    'full',
    'ongoing',
    'finished',
  ];
  const dateRanges: { value: TournamentFilters['dateRange']; label: string }[] = [
    { value: 'next_30_days', label: 'Next 30 days' },
    { value: 'next_90_days', label: 'Next 90 days' },
    { value: 'this_season', label: 'This season' },
  ];

  const chipBaseClass = "flex items-center gap-1.5 px-3 py-2 rounded-full border text-[13px] font-medium cursor-pointer transition-all duration-200";
  const chipDefaultClass = "border-tier-border-default bg-tier-surface-subtle text-tier-navy hover:bg-white";
  const chipSelectedClass = "bg-tier-gold border-tier-gold text-white";

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-end z-[1000]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] h-full bg-white flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.15)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-tier-border-subtle">
          <SubSectionTitle className="text-lg font-semibold text-tier-navy m-0">
            Filter tournaments
          </SubSectionTitle>
          <button
            onClick={onClose}
            className="p-2 border-none bg-transparent text-tier-text-secondary cursor-pointer rounded hover:bg-tier-surface-subtle"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Tournament Purpose Filter */}
          <div className="mb-6">
            <CardTitle className="text-sm font-semibold text-tier-navy m-0 mb-2">
              Tournament Purpose
            </CardTitle>
            <p className="text-xs text-tier-text-secondary m-0 mb-3">
              How you should approach the tournament
            </p>
            <div className="flex flex-wrap gap-2">
              {purposes.map(purpose => {
                const isSelected = localFilters.purposes?.includes(purpose);
                return (
                  <button
                    key={purpose}
                    onClick={() => toggleArrayFilter('purposes', purpose)}
                    className={`${chipBaseClass} ${isSelected ? chipSelectedClass : chipDefaultClass}`}
                    title={PURPOSE_DESCRIPTIONS[purpose]}
                  >
                    {PURPOSE_LABELS[purpose]}
                    {isSelected && <CheckCircle size={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Competition Level Filter */}
          <div className="mb-6">
            <CardTitle className="text-sm font-semibold text-tier-navy m-0 mb-2">
              Competition Level
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              {levels.map(level => {
                const isSelected = localFilters.levels?.includes(level);
                return (
                  <button
                    key={level}
                    onClick={() => toggleArrayFilter('levels', level)}
                    className={`${chipBaseClass} ${isSelected ? chipSelectedClass : chipDefaultClass}`}
                  >
                    {LEVEL_LABELS[level]}
                    {isSelected && <CheckCircle size={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Junior Tour Region Filter */}
          <div className="mb-6">
            <CardTitle className="text-sm font-semibold text-tier-navy m-0 mb-2">
              Junior Tour Region
            </CardTitle>
            <p className="text-xs text-tier-text-secondary m-0 mb-3">
              Filter junior tournaments by region (Junior Tour Regional only)
            </p>
            <div className="flex flex-wrap gap-2">
              {juniorRegions.map(region => {
                const isSelected = localFilters.juniorTourRegions?.includes(region);
                return (
                  <button
                    key={region}
                    onClick={() => toggleArrayFilter('juniorTourRegions', region)}
                    className={`${chipBaseClass} ${isSelected ? chipSelectedClass : chipDefaultClass}`}
                    title={JUNIOR_TOUR_REGION_DESCRIPTIONS[region]}
                  >
                    {JUNIOR_TOUR_REGION_LABELS[region]}
                    {isSelected && <CheckCircle size={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Player Category Filter */}
          <div className="mb-6">
            <CardTitle className="text-sm font-semibold text-tier-navy m-0 mb-2">
              Recommended Player Level
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => {
                const isSelected = localFilters.recommendedCategories?.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleArrayFilter('recommendedCategories', cat)}
                    className={`${chipBaseClass} ${isSelected ? chipSelectedClass : chipDefaultClass}`}
                  >
                    {CATEGORY_LABELS[cat]}
                    {isSelected && <CheckCircle size={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tour Filter */}
          <div className="mb-6">
            <CardTitle className="text-sm font-semibold text-tier-navy m-0 mb-2">
              Tournament Series
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              {tours.map(tour => {
                const isSelected = localFilters.tours?.includes(tour);
                return (
                  <button
                    key={tour}
                    onClick={() => toggleArrayFilter('tours', tour)}
                    className={`${chipBaseClass} ${isSelected ? chipSelectedClass : chipDefaultClass}`}
                  >
                    {TOUR_LABELS[tour]}
                    {isSelected && <CheckCircle size={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Filter */}
          <div className="mb-6">
            <CardTitle className="text-sm font-semibold text-tier-navy m-0 mb-2">
              Status
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              {statuses.map(status => {
                const isSelected = localFilters.statuses?.includes(status);
                return (
                  <button
                    key={status}
                    onClick={() => toggleArrayFilter('statuses', status)}
                    className={`${chipBaseClass} ${isSelected ? chipSelectedClass : chipDefaultClass}`}
                  >
                    {STATUS_LABELS[status]}
                    {isSelected && <CheckCircle size={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="mb-6">
            <CardTitle className="text-sm font-semibold text-tier-navy m-0 mb-2">
              Time Period
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              {dateRanges.map(({ value, label }) => {
                const isSelected = localFilters.dateRange === value;
                return (
                  <button
                    key={value}
                    onClick={() => setLocalFilters({
                      ...localFilters,
                      dateRange: isSelected ? undefined : value,
                    })}
                    className={`${chipBaseClass} ${isSelected ? chipSelectedClass : chipDefaultClass}`}
                  >
                    {label}
                    {isSelected && <CheckCircle size={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Country Filter */}
          <div className="mb-6">
            <CardTitle className="text-sm font-semibold text-tier-navy m-0 mb-2">
              Country
            </CardTitle>
            {/* Quick select groups */}
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => setLocalFilters({
                  ...localFilters,
                  countries: COUNTRY_GROUPS.nordic,
                })}
                className={`${chipBaseClass} ${chipDefaultClass} text-xs px-2.5 py-1.5`}
              >
                Nordic
              </button>
              <button
                onClick={() => setLocalFilters({
                  ...localFilters,
                  countries: COUNTRY_GROUPS.europe,
                })}
                className={`${chipBaseClass} ${chipDefaultClass} text-xs px-2.5 py-1.5`}
              >
                Europe
              </button>
              <button
                onClick={() => setLocalFilters({
                  ...localFilters,
                  countries: undefined,
                })}
                className={`${chipBaseClass} ${chipDefaultClass} text-xs px-2.5 py-1.5`}
              >
                All countries
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {['NO', 'SE', 'DK', 'FI', 'GB', 'US', 'ES', 'DE', 'IE', 'ZA'].map(code => {
                const isSelected = localFilters.countries?.includes(code);
                return (
                  <button
                    key={code}
                    onClick={() => toggleArrayFilter('countries', code)}
                    className={`${chipBaseClass} ${isSelected ? chipSelectedClass : chipDefaultClass}`}
                  >
                    {COUNTRY_LABELS[code] || code}
                    {isSelected && <CheckCircle size={14} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-between px-5 py-4 border-t border-tier-border-subtle">
          <Button variant="ghost" onClick={handleClear}>
            Reset
          </Button>
          <Button variant="primary" onClick={handleApply}>
            Apply filter
          </Button>
        </div>
      </div>
    </div>
  );
}
