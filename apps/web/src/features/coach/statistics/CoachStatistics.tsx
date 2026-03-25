/**
 * CoachStatistics - Statistics Hub Page
 *
 * Purpose: Team-level overview.
 *
 * Features:
 * - Quick stats: improving count, regressing count, avg HCP change, total sessions
 * - Athlete list with trend indicator (up/down/stable)
 * - Sorting/filtering
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, Users, Clock, BarChart3, ChevronRight, Search } from 'lucide-react';
import { PageTitle, SectionTitle } from '../../../components/typography';
import { statsOverview, athleteList, type Athlete } from '../../../lib/coachMockData';

type TrendType = 'up' | 'down' | 'stable';
type FilterType = 'all' | TrendType;

// Mock trend data for athletes (would come from API)
function getAthleteTrend(athleteId: string): TrendType {
  const hash = athleteId.charCodeAt(0) % 3;
  return ['up', 'down', 'stable'][hash] as TrendType;
}

// Trend icon
function TrendIcon({ trend }: { trend: TrendType }) {
  switch (trend) {
    case 'up':
      return <TrendingUp size={16} className="text-green-600" />;
    case 'down':
      return <TrendingDown size={16} className="text-red-600" />;
    default:
      return <Minus size={16} className="text-gray-500" />;
  }
}

// Stat card
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  suffix,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  suffix?: string;
}) {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-tier-white rounded-xl border border-tier-border-default p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center`}>
          <Icon size={20} />
        </div>
        <span className="text-sm font-medium text-tier-text-secondary">{label}</span>
      </div>
      <div className="text-3xl font-bold text-tier-navy">
        {value}
        {suffix && <span className="text-lg font-normal text-tier-text-secondary ml-1">{suffix}</span>}
      </div>
    </div>
  );
}

// Athlete row
function AthleteRow({
  athlete,
  trend,
  onClick,
}: {
  athlete: Athlete;
  trend: TrendType;
  onClick: () => void;
}) {
  const trendLabels = {
    up: 'Forbedring',
    down: 'Tilbakegang',
    stable: 'Stabil',
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-500',
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-4 bg-tier-white rounded-xl border border-tier-border-default cursor-pointer hover:border-tier-navy transition-colors"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Trend indicator */}
      <div className="w-10 h-10 rounded-lg bg-tier-surface-base flex items-center justify-center">
        <TrendIcon trend={trend} />
      </div>

      {/* Athlete info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-tier-navy truncate">
          {athlete.displayName}
        </div>
        <div className="text-sm text-tier-text-secondary">
          HCP {athlete.hcp.toFixed(1)} • Kat. {athlete.category}
        </div>
      </div>

      {/* Trend label */}
      <span className={`text-sm font-medium ${trendColors[trend]}`}>
        {trendLabels[trend]}
      </span>

      <ChevronRight size={18} className="text-tier-text-tertiary" />
    </div>
  );
}

// Filter chip
function FilterChip({
  active,
  onClick,
  children,
  icon: Icon,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ElementType;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
        active
          ? 'bg-tier-navy text-white'
          : 'bg-tier-surface-base text-tier-text-secondary hover:bg-tier-border-default'
      }`}
    >
      {Icon && <Icon size={16} />}
      {children}
      {count !== undefined && (
        <span className={`text-xs ${active ? 'opacity-80' : 'text-tier-text-tertiary'}`}>
          ({count})
        </span>
      )}
    </button>
  );
}

export default function CoachStatistics() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [trendFilter, setTrendFilter] = useState<FilterType>('all');

  // Get athletes with trends
  const athletesWithTrends = useMemo(() => {
    return athleteList.map(athlete => ({
      athlete,
      trend: getAthleteTrend(athlete.id),
    }));
  }, []);

  // Filter athletes
  const filteredAthletes = useMemo(() => {
    let result = [...athletesWithTrends];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        ({ athlete }) =>
          athlete.displayName.toLowerCase().includes(search) ||
          athlete.firstName.toLowerCase().includes(search) ||
          athlete.lastName.toLowerCase().includes(search)
      );
    }

    // Trend filter
    if (trendFilter !== 'all') {
      result = result.filter(({ trend }) => trend === trendFilter);
    }

    // Sort alphabetically by athlete name
    return result.sort((a, b) =>
      a.athlete.displayName.localeCompare(b.athlete.displayName, 'nb-NO')
    );
  }, [athletesWithTrends, searchTerm, trendFilter]);

  // Count by trend
  const trendCounts = useMemo(() => {
    return {
      up: athletesWithTrends.filter(a => a.trend === 'up').length,
      down: athletesWithTrends.filter(a => a.trend === 'down').length,
      stable: athletesWithTrends.filter(a => a.trend === 'stable').length,
    };
  }, [athletesWithTrends]);

  const handleAthleteClick = (athleteId: string) => {
    navigate(`/coach/athletes/${athleteId}/trajectory`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <PageTitle>Statistikk</PageTitle>
        <p className="text-tier-text-secondary mt-1">
          Oversikt over lagets utvikling
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Forbedring"
          value={statsOverview.improvingCount}
          icon={TrendingUp}
          color="green"
          suffix="spillere"
        />
        <StatCard
          label="Tilbakegang"
          value={statsOverview.regressingCount}
          icon={TrendingDown}
          color="red"
          suffix="spillere"
        />
        <StatCard
          label="Snitt HCP endring"
          value={statsOverview.avgHcpChange.toFixed(1)}
          icon={BarChart3}
          color="blue"
        />
        <StatCard
          label="Økter totalt"
          value={statsOverview.totalSessions}
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Athlete list header */}
      <SectionTitle className="mb-4">Spilleroversikt</SectionTitle>

      {/* Search and filters */}
      <div className="mb-4 space-y-3">
        {/* Search */}
        <div className="flex items-center gap-3 px-4 py-3 bg-tier-white rounded-xl border border-tier-border-default">
          <Search size={20} className="text-tier-text-secondary" />
          <input
            type="text"
            placeholder="Søk etter spiller..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-tier-navy placeholder:text-tier-text-tertiary"
          />
        </div>

        {/* Trend filters */}
        <div className="flex gap-2 flex-wrap">
          <FilterChip
            active={trendFilter === 'all'}
            onClick={() => setTrendFilter('all')}
            count={athleteList.length}
          >
            Alle
          </FilterChip>
          <FilterChip
            active={trendFilter === 'up'}
            onClick={() => setTrendFilter('up')}
            icon={TrendingUp}
            count={trendCounts.up}
          >
            Forbedring
          </FilterChip>
          <FilterChip
            active={trendFilter === 'down'}
            onClick={() => setTrendFilter('down')}
            icon={TrendingDown}
            count={trendCounts.down}
          >
            Tilbakegang
          </FilterChip>
          <FilterChip
            active={trendFilter === 'stable'}
            onClick={() => setTrendFilter('stable')}
            icon={Minus}
            count={trendCounts.stable}
          >
            Stabil
          </FilterChip>
        </div>
      </div>

      {/* Athlete list */}
      {filteredAthletes.length === 0 ? (
        <div className="text-center py-12 bg-tier-white rounded-xl border border-tier-border-default">
          <Users size={48} className="mx-auto text-tier-text-tertiary mb-3" />
          <p className="text-tier-text-secondary">Ingen spillere funnet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAthletes.map(({ athlete, trend }) => (
            <AthleteRow
              key={athlete.id}
              athlete={athlete}
              trend={trend}
              onClick={() => handleAthleteClick(athlete.id)}
            />
          ))}
        </div>
      )}

      {/* Note */}
      <p className="text-center text-xs text-tier-text-tertiary mt-4">
        Sortert alfabetisk (A-Å)
      </p>
    </div>
  );
}
