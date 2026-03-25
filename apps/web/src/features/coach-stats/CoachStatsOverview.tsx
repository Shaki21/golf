/**
 * TIER Golf - Coach Stats Overview
 * Design System v3.0 - Premium Light
 *
 * Main overview of player statistics for coaches.
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 * Phase 4 Extended Sprint 4.6: Collapsible filters with tier branding
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Search,
  Minus,
} from 'lucide-react';
import Card from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import StateCard from '../../ui/composites/StateCard';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';
import { CollapsibleFilterDrawer, FilterControl } from '../../components/filters/CollapsibleFilterDrawer';
import { useUrlFilters } from '../../hooks/useUrlFilters';

interface PlayerStat {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  category: string;
  handicap: number;
  handicapChange: number;
  sessionsThisMonth: number;
  avgSessionsPerWeek: number;
  tournamentScore: number;
  trend: 'up' | 'down' | 'stable';
  lastActive: string;
  highlights: string[];
}

interface CategorySummary {
  category: string;
  playerCount: number;
  avgHandicap: number;
  avgSessions: number;
  improving: number;
  declining: number;
}

export default function CoachStatsOverview() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // URL-persisted filters (Sprint 4.6)
  const { filters, setFilter, clearFilters } = useUrlFilters({
    category: 'all',
    sortBy: 'trend'
  });
  const categoryFilter = filters.category as string;
  const sortBy = filters.sortBy as 'name' | 'handicap' | 'trend' | 'sessions';

  // Count active filters for badge
  const activeFilterCount = (categoryFilter !== 'all' ? 1 : 0) + (sortBy !== 'trend' ? 1 : 0);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/v1/coach/stats/overview');
      if (!response.ok) {
        throw new Error(`Failed to load stats: ${response.statusText}`);
      }
      const data = await response.json();
      setPlayers(data.players || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load player statistics';
      console.error('Failed to fetch stats:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Category summary
  const categorySummary = useMemo((): CategorySummary[] => {
    const categories = ['A', 'B', 'C'];
    return categories.map((cat) => {
      const catPlayers = players.filter((p) => p.category === cat);
      return {
        category: cat,
        playerCount: catPlayers.length,
        avgHandicap: catPlayers.length > 0
          ? Math.round((catPlayers.reduce((sum, p) => sum + p.handicap, 0) / catPlayers.length) * 10) / 10
          : 0,
        avgSessions: catPlayers.length > 0
          ? Math.round((catPlayers.reduce((sum, p) => sum + p.avgSessionsPerWeek, 0) / catPlayers.length) * 10) / 10
          : 0,
        improving: catPlayers.filter((p) => p.trend === 'up').length,
        declining: catPlayers.filter((p) => p.trend === 'down').length,
      };
    });
  }, [players]);

  // Overall stats
  const overallStats = useMemo(() => {
    const improving = players.filter((p) => p.trend === 'up').length;
    const declining = players.filter((p) => p.trend === 'down').length;
    const avgHandicapChange = players.length > 0
      ? Math.round((players.reduce((sum, p) => sum + p.handicapChange, 0) / players.length) * 10) / 10
      : 0;
    const totalSessions = players.reduce((sum, p) => sum + p.sessionsThisMonth, 0);

    return { improving, declining, avgHandicapChange, totalSessions };
  }, [players]);

  // Filter and sort players
  const filteredPlayers = useMemo(() => {
    let result = players;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(query));
    }

    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.category === categoryFilter);
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'handicap':
          return a.handicap - b.handicap;
        case 'trend':
          const trendOrder = { up: 0, stable: 1, down: 2 };
          return trendOrder[a.trend] - trendOrder[b.trend];
        case 'sessions':
          return b.sessionsThisMonth - a.sessionsThisMonth;
        default:
          return 0;
      }
    });

    return result;
  }, [players, searchQuery, categoryFilter, sortBy]);

  const getTrendConfig = (trend: string) => {
    switch (trend) {
      case 'up':
        return { icon: TrendingUp, colorClass: 'bg-tier-success text-white' };
      case 'down':
        return { icon: TrendingDown, colorClass: 'bg-tier-error text-white' };
      default:
        return { icon: Minus, colorClass: 'bg-tier-text-secondary text-white' };
    }
  };

  const getCategoryColors = (category: string) => {
    switch (category) {
      case 'A':
        return {
          bg: 'bg-category-a/10',
          border: 'border-category-a',
          text: 'text-category-a',
          bgActive: 'bg-category-a/15',
        };
      case 'B':
        return {
          bg: 'bg-category-b/10',
          border: 'border-category-b',
          text: 'text-category-b',
          bgActive: 'bg-category-b/15',
        };
      case 'C':
        return {
          bg: 'bg-category-c/10',
          border: 'border-category-c',
          text: 'text-category-c',
          bgActive: 'bg-category-c/15',
        };
      default:
        return {
          bg: 'bg-tier-surface-base',
          border: 'border-transparent',
          text: 'text-tier-navy',
          bgActive: 'bg-tier-navy/5',
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tier-surface-base flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-tier-border-default border-t-tier-navy rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-tier-surface-base flex items-center justify-center p-6">
        <StateCard
          variant="error"
          title={error}
          action={
            <Button variant="outline" onClick={fetchStats}>
              Try Again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-surface-base font-[Inter,-apple-system,BlinkMacSystemFont,system-ui,sans-serif]">
      {/* Header - using PageHeader from design system */}
      <PageHeader
        title="Player Statistics"
        subtitle="Overview of progress and development"
        helpText="Alphabetical overview of player statistics and development. View handicap, training frequency, trends and highlights for each player. Filter and sort to identify players who need attention."
        actions={
          <div className="flex gap-2.5">
            <Button variant="ghost" size="sm" onClick={() => navigate('/coach/stats/progress')} leftIcon={<TrendingUp size={18} />}>
              Progress
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/coach/stats/regression')} leftIcon={<TrendingDown size={18} />}>
              Regression
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/coach/stats/datagolf')} leftIcon={<BarChart3 size={18} />}>
              Data Golf
            </Button>
          </div>
        }
        divider={false}
      />
      <div className="bg-tier-white border-b border-tier-border-default px-6 pb-5">

        {/* Quick stats */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
          <div className="p-4 bg-tier-success/10 rounded-lg text-center">
            <div className="text-[28px] font-bold text-tier-success">{overallStats.improving}</div>
            <div className="text-[13px] text-tier-navy">Players improving</div>
          </div>
          <div className="p-4 bg-tier-error/10 rounded-lg text-center">
            <div className="text-[28px] font-bold text-tier-error">{overallStats.declining}</div>
            <div className="text-[13px] text-tier-navy">Need attention</div>
          </div>
          <div className="p-4 bg-tier-navy/10 rounded-lg text-center">
            <div className="text-[28px] font-bold text-tier-navy">
              {overallStats.avgHandicapChange > 0 ? '+' : ''}{overallStats.avgHandicapChange}
            </div>
            <div className="text-[13px] text-tier-navy">Avg HCP change</div>
          </div>
          <div className="p-4 bg-tier-surface-base rounded-lg text-center">
            <div className="text-[28px] font-bold text-tier-navy">{overallStats.totalSessions}</div>
            <div className="text-[13px] text-tier-navy">Sessions this month</div>
          </div>
        </div>
      </div>

      {/* Category summary */}
      <div className="p-6 border-b border-tier-border-default bg-tier-white">
        <SectionTitle className="m-0 mb-4">Category Overview</SectionTitle>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          {categorySummary.map((cat) => {
            const colors = getCategoryColors(cat.category);
            return (
              <div
                key={cat.category}
                onClick={() => setFilter('category', cat.category)}
                className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${
                  categoryFilter === cat.category
                    ? `${colors.bgActive} ${colors.border}`
                    : `${colors.bg} border-transparent`
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-lg font-bold ${colors.text}`}>Category {cat.category}</span>
                  <span className="text-sm text-tier-text-secondary">{cat.playerCount} players</span>
                </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-tier-text-secondary">Avg HCP</div>
                  <div className="text-base font-semibold text-tier-navy">{cat.avgHandicap}</div>
                </div>
                <div>
                  <div className="text-xs text-tier-text-secondary">Sessions/wk</div>
                  <div className="text-base font-semibold text-tier-navy">{cat.avgSessions}</div>
                </div>
                <div>
                  <div className="text-xs text-tier-text-secondary">Improving</div>
                  <div className="text-base font-semibold text-tier-success">{cat.improving}</div>
                </div>
                <div>
                  <div className="text-xs text-tier-text-secondary">Declining</div>
                  <div className="text-base font-semibold text-tier-error">{cat.declining}</div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="py-4 px-6 bg-tier-white border-b border-tier-border-default flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 py-2 px-3 bg-tier-surface-base rounded-lg flex-1 max-w-[250px]">
          <Search size={18} className="text-tier-text-secondary" />
          <input
            type="text"
            placeholder="Search player..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-none bg-transparent text-sm text-tier-navy outline-none"
          />
        </div>

        <div className="flex gap-2">
          {['all', 'A', 'B', 'C'].map((cat) => {
            const colors = cat !== 'all' ? getCategoryColors(cat) : null;
            const isActive = categoryFilter === cat;

            return (
              <button
                key={cat}
                onClick={() => setFilter('category', cat)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? colors
                      ? `${colors.bgActive} ${colors.border} border-2 ${colors.text}`
                      : 'bg-tier-navy text-white border-2 border-tier-navy'
                    : colors
                    ? `${colors.bg} ${colors.text} border-2 border-transparent hover:${colors.border}`
                    : 'bg-tier-surface-base text-tier-navy border-2 border-transparent hover:border-tier-border-default'
                }`}
              >
                {cat === 'all' ? 'All' : `Cat. ${cat}`}
              </button>
            );
          })}
        </div>

      </div>

      {/* Collapsible Filters */}
      <CollapsibleFilterDrawer
        activeFilterCount={activeFilterCount}
        onClearAll={clearFilters}
      >
        <FilterControl label="Sort By">
          <select
            value={sortBy}
            onChange={(e) => setFilter('sortBy', e.target.value)}
            className="w-full py-2 px-3 bg-tier-white border border-tier-border-default rounded-lg text-sm text-tier-navy"
          >
            <option value="trend">Trend (improving first)</option>
            <option value="name">Name (A-Z)</option>
            <option value="handicap">Handicap (lowest first)</option>
            <option value="sessions">Activity (most first)</option>
          </select>
        </FilterControl>
      </CollapsibleFilterDrawer>

      {/* Player list */}
      <div className="p-6">
        <div className="flex flex-col gap-3">
          {filteredPlayers.map((player) => {
            const trendConfig = getTrendConfig(player.trend);
            const TrendIcon = trendConfig.icon;

            return (
              <div
                key={player.id}
                onClick={() => navigate(`/coach/athletes/${player.id}`)}
                className={`bg-tier-white rounded-xl shadow-sm p-4 px-5 cursor-pointer border ${
                  player.trend === 'down'
                    ? 'border-2 border-tier-error'
                    : 'border-tier-border-default'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold text-tier-white"
                        style={{ backgroundColor: player.avatarColor }}
                      >
                        {player.initials}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${trendConfig.colorClass}`}>
                        <TrendIcon size={12} />
                      </div>
                    </div>
                    <div>
                      <SubSectionTitle className="m-0">{player.name}</SubSectionTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-tier-navy bg-tier-navy/15 py-0.5 px-2 rounded">
                          Category {player.category}
                        </span>
                        {player.highlights.map((h, i) => (
                          <span key={i} className="text-[11px] text-amber-600 bg-amber-500/15 py-0.5 px-1.5 rounded">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-xs text-tier-text-secondary">Handicap</div>
                      <div className="text-lg font-bold text-tier-navy">{player.handicap}</div>
                      <div className={`text-xs font-medium ${
                        player.handicapChange < 0
                          ? 'text-tier-success'
                          : player.handicapChange > 0
                            ? 'text-tier-error'
                            : 'text-tier-text-secondary'
                      }`}>
                        {player.handicapChange > 0 ? '+' : ''}{player.handicapChange}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-tier-text-secondary">Sessions/mo</div>
                      <div className="text-lg font-bold text-tier-navy">{player.sessionsThisMonth}</div>
                      <div className="text-xs text-tier-text-secondary">{player.avgSessionsPerWeek}/wk</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-tier-text-secondary">Avg score</div>
                      <div className="text-lg font-bold text-tier-navy">{player.tournamentScore}</div>
                    </div>
                    <ChevronRight size={20} className="text-tier-text-secondary" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
