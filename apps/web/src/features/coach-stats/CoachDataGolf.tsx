/**
 * CoachDataGolfStats - Data Golf Statistics Integration
 * Design System v3.0 - Premium Light
 *
 * Displays professional tour statistics and comparisons
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  RefreshCw,
  Target,
  Award,
  Info,
  Search,
  Loader2,
  Globe,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import Button from '../../ui/primitives/Button';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';
import StateCard from '../../ui/composites/StateCard';
import { getCoachDashboard, getTourAverages, searchProPlayers, getProPlayers } from '../../services/dataGolfService';

// All Norwegian golf categories
type PlayerCategory = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

interface PlayerDataGolfStat {
  playerId: string;
  playerName: string;
  category: PlayerCategory;
  handicap: number;
  stats: {
    sgTotal: number | null;
    sgTee: number | null;
    sgApproach: number | null;
    sgAround: number | null;
    sgPutting: number | null;
  };
  percentiles: {
    sgTotal: number;
    sgTee: number;
    sgApproach: number;
    sgAround: number;
    sgPutting: number;
  };
  lastUpdated?: string;
}

interface TourAverages {
  tour: string;
  season: number;
  stats: {
    avgSgTotal: number;
    avgSgOtt: number;
    avgSgApp: number;
    avgSgArg: number;
    avgSgPutt: number;
    avgDrivingDistance: number | null;
    avgDrivingAccuracy: number | null;
  };
}

interface DashboardData {
  players: PlayerDataGolfStat[];
  tourAverages: TourAverages;
  totalPlayers: number;
  playersWithData: number;
  lastSyncedAt?: string;
}

// Pro player from DataGolf API
interface ProPlayer {
  id: string;
  dataGolfId?: string;
  name: string;
  country: string;
  sgTotal: number | null;
  sgTee?: number | null;
  sgApproach?: number | null;
  sgAround?: number | null;
  sgPutting?: number | null;
  tour?: string;
}

export const CoachDataGolfStats: React.FC = () => {
  const [tour, setTour] = useState<'pga' | 'euro' | 'kft'>('pga');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | PlayerCategory>('all');
  const [proSearchQuery, setProSearchQuery] = useState('');
  const [selectedProPlayer, setSelectedProPlayer] = useState<ProPlayer | null>(null);
  const [proPlayers, setProPlayers] = useState<ProPlayer[]>([]);
  const [proPlayersLoading, setProPlayersLoading] = useState(false);
  const [topProPlayers, setTopProPlayers] = useState<ProPlayer[]>([]);
  const [showProComparison, setShowProComparison] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCoachDashboard(tour);
        setDashboardData(data);
      } catch (err: any) {
        console.error('Error fetching Data Golf stats:', err);
        setError(err.message || 'Failed to load Data Golf statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tour]);

  // Filter and search players
  const filteredPlayers = useMemo(() => {
    if (!dashboardData?.players) return [];

    let players = [...dashboardData.players];

    // Apply search filter
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      players = players.filter(p =>
        p.playerName.toLowerCase().includes(search)
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      players = players.filter(p => p.category === categoryFilter);
    }

    // Sort by total SG (descending)
    return players.sort((a, b) => {
      const aTotal = a.stats?.sgTotal || 0;
      const bTotal = b.stats?.sgTotal || 0;
      return bTotal - aTotal;
    });
  }, [dashboardData, searchQuery, categoryFilter]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!filteredPlayers.length) return [];

    return filteredPlayers.slice(0, 10).map(player => ({
      name: player.playerName?.split(' ')[0] || 'Spiller', // First name only for readability
      'SG Total': player.stats?.sgTotal || 0,
      'SG Tee': player.stats?.sgTee || 0,
      'SG Approach': player.stats?.sgApproach || 0,
      'SG Around': player.stats?.sgAround || 0,
      'SG Putting': player.stats?.sgPutting || 0,
    }));
  }, [filteredPlayers]);

  // Get tour display name
  const getTourDisplayName = (tourCode: string) => {
    switch (tourCode) {
      case 'pga': return 'PGA Tour';
      case 'euro': return 'DP World Tour';
      case 'kft': return 'Korn Ferry Tour';
      default: return tourCode.toUpperCase();
    }
  };

  // Format SG value with color
  const formatSgValue = (value: number | null) => {
    if (value === null || value === undefined) return { text: 'N/A', color: 'text-tier-text-tertiary' };

    const formatted = value.toFixed(2);
    const sign = value > 0 ? '+' : '';
    const color = value > 0.5
      ? 'text-tier-success'
      : value < -0.5
      ? 'text-tier-error'
      : 'text-tier-text-secondary';

    return { text: `${sign}${formatted}`, color };
  };

  // Get category badge classes
  const getCategoryClasses = (category: string) => {
    switch (category) {
      case 'A': return { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500' };
      case 'B': return { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500' };
      case 'C': return { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500' };
      case 'D': return { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500' };
      case 'E': return { bg: 'bg-pink-500/10', text: 'text-pink-600', border: 'border-pink-500' };
      case 'F': return { bg: 'bg-gray-500/10', text: 'text-gray-600', border: 'border-gray-500' };
      default: return { bg: 'bg-tier-surface-base', text: 'text-tier-text-secondary', border: 'border-tier-border-default' };
    }
  };

  // All category options for filtering
  const categoryOptions: Array<{ value: 'all' | PlayerCategory; label: string; hcpRange: string }> = [
    { value: 'all', label: 'All', hcpRange: '' },
    { value: 'A', label: 'Category A', hcpRange: '0.0 - 4.4' },
    { value: 'B', label: 'Category B', hcpRange: '4.5 - 11.4' },
    { value: 'C', label: 'Category C', hcpRange: '11.5 - 18.4' },
    { value: 'D', label: 'Category D', hcpRange: '18.5 - 26.4' },
    { value: 'E', label: 'Category E', hcpRange: '26.5 - 36.0' },
    { value: 'F', label: 'Category F', hcpRange: '36.1 - 54.0' },
  ];

  // Fetch top pro players on mount
  useEffect(() => {
    const fetchTopProPlayers = async () => {
      try {
        const data = await getProPlayers({ tour, limit: 20 });
        const mappedPlayers: ProPlayer[] = (data || []).map((p: any) => ({
          id: p.dataGolfId || p.id || p.playerName,
          dataGolfId: p.dataGolfId,
          name: p.playerName || p.name,
          country: p.country || 'N/A',
          sgTotal: p.sgTotal ?? p.stats?.sgTotal ?? null,
          sgTee: p.sgOtt ?? p.stats?.sgTee ?? null,
          sgApproach: p.sgApp ?? p.stats?.sgApproach ?? null,
          sgAround: p.sgArg ?? p.stats?.sgAround ?? null,
          sgPutting: p.sgPutt ?? p.stats?.sgPutting ?? null,
          tour: p.tour,
        }));
        setTopProPlayers(mappedPlayers);
      } catch (err) {
        console.error('Error fetching top pro players:', err);
        // Fallback to some well-known players if API fails
        setTopProPlayers([
          { id: 'viktor-hovland', name: 'Viktor Hovland', country: 'NOR', sgTotal: 1.85 },
          { id: 'rory-mcilroy', name: 'Rory McIlroy', country: 'NIR', sgTotal: 1.92 },
          { id: 'scottie-scheffler', name: 'Scottie Scheffler', country: 'USA', sgTotal: 2.15 },
          { id: 'jon-rahm', name: 'Jon Rahm', country: 'ESP', sgTotal: 1.78 },
          { id: 'collin-morikawa', name: 'Collin Morikawa', country: 'USA', sgTotal: 1.45 },
        ]);
      }
    };
    fetchTopProPlayers();
  }, [tour]);

  // Debounced search for pro players
  useEffect(() => {
    if (!proSearchQuery || proSearchQuery.length < 2) {
      setProPlayers([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setProPlayersLoading(true);
      try {
        const data = await searchProPlayers(proSearchQuery, { tour, limit: 20 });
        const mappedPlayers: ProPlayer[] = (data || []).map((p: any) => ({
          id: p.dataGolfId || p.id || p.playerName,
          dataGolfId: p.dataGolfId,
          name: p.playerName || p.name,
          country: p.country || 'N/A',
          sgTotal: p.sgTotal ?? p.stats?.sgTotal ?? null,
          sgTee: p.sgOtt ?? p.stats?.sgTee ?? null,
          sgApproach: p.sgApp ?? p.stats?.sgApproach ?? null,
          sgAround: p.sgArg ?? p.stats?.sgAround ?? null,
          sgPutting: p.sgPutt ?? p.stats?.sgPutting ?? null,
          tour: p.tour,
        }));
        setProPlayers(mappedPlayers);
      } catch (err) {
        console.error('Error searching pro players:', err);
        setProPlayers([]);
      } finally {
        setProPlayersLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(searchTimeout);
  }, [proSearchQuery, tour]);

  // Display either search results or top players
  const displayedProPlayers = useMemo(() => {
    if (proSearchQuery.length >= 2) {
      return proPlayers;
    }
    return topProPlayers.slice(0, 10);
  }, [proSearchQuery, proPlayers, topProPlayers]);

  if (loading) {
    return (
      <div className="p-6">
        <StateCard
          variant="loading"
          title="Loading Data Golf statistics..."
          description="Fetching data from professional tour"
        />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="p-6">
        <StateCard
          variant="error"
          title="Could not load Data Golf statistics"
          description={error || 'An error occurred'}
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-tier-white min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center flex-shrink-0">
          <BarChart3 size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <PageHeader
            title="Data Golf Statistics"
            subtitle={`Professional tour comparisons - ${getTourDisplayName(tour)}`}
            helpText="Compare players' Strokes Gained statistics with professional tours (PGA, DP World, Korn Ferry). View percentiles and identify strengths and weaknesses compared to top players."
            divider={false}
          />
        </div>
      </div>

      {/* Tour Selector */}
      <div className="bg-tier-white rounded-2xl p-5 mb-6 border border-tier-border-default">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle className="m-0">Select Tour</SectionTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={16} />
            Refresh
          </Button>
        </div>
        <div className="flex gap-2">
          {['pga', 'euro', 'kft'].map((t) => (
            <Button
              key={t}
              variant={tour === t ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTour(t as typeof tour)}
            >
              {getTourDisplayName(t)}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-tier-white rounded-xl p-4 border border-tier-border-default">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-tier-navy" />
            <span className="text-sm text-tier-text-secondary">Total players</span>
          </div>
          <p className="text-2xl font-bold text-tier-navy">{dashboardData.totalPlayers ?? 0}</p>
        </div>
        <div className="bg-tier-white rounded-xl p-4 border border-tier-border-default">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={16} className="text-green-600" />
            <span className="text-sm text-tier-text-secondary">With Data Golf data</span>
          </div>
          <p className="text-2xl font-bold text-tier-navy">{dashboardData.playersWithData ?? 0}</p>
        </div>
        <div className="bg-tier-white rounded-xl p-4 border border-tier-border-default">
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-orange-600" />
            <span className="text-sm text-tier-text-secondary">Avg SG Total</span>
          </div>
          <p className={`text-2xl font-bold ${formatSgValue(dashboardData.tourAverages?.stats?.avgSgTotal ?? null).color}`}>
            {formatSgValue(dashboardData.tourAverages?.stats?.avgSgTotal ?? null).text}
          </p>
        </div>
        <div className="bg-tier-white rounded-xl p-4 border border-tier-border-default">
          <div className="flex items-center gap-2 mb-2">
            <Award size={16} className="text-purple-600" />
            <span className="text-sm text-tier-text-secondary">Tour</span>
          </div>
          <p className="text-xl font-bold text-tier-navy">{getTourDisplayName(tour)}</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-tier-white rounded-2xl p-5 mb-6 border border-tier-border-default">
        <SectionTitle className="m-0 mb-4">Filter and Comparison</SectionTitle>

        {/* Player Search */}
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-text-tertiary"
            />
            <input
              type="text"
              placeholder="Search for club player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 pr-3 pl-10 rounded-[10px] border border-tier-border-default bg-tier-surface-base text-sm text-tier-navy outline-none focus:border-tier-navy focus:ring-1 focus:ring-tier-navy"
            />
          </div>
        </div>

        {/* Category Filter Buttons - Fixed styling */}
        <div className="mb-4">
          <p className="text-sm text-tier-text-secondary mb-2">Filter by category:</p>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map(cat => {
              const isSelected = categoryFilter === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${isSelected
                      ? 'bg-tier-navy text-white border-2 border-tier-navy shadow-sm'
                      : 'bg-tier-surface-base text-tier-navy border border-tier-border-default hover:bg-tier-surface-base'
                    }
                  `}
                  title={cat.hcpRange ? `HCP: ${cat.hcpRange}` : ''}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pro Player Comparison Toggle */}
        <div className="border-t border-tier-border-default pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-tier-navy flex items-center gap-2">
                <Globe size={16} className="text-purple-600" />
                Pro Tour Comparison
              </p>
              <p className="text-xs text-tier-text-tertiary mt-1">
                Compare with pro players from PGA Tour, DP World Tour and Korn Ferry Tour
              </p>
            </div>
            <Button
              variant={showProComparison ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowProComparison(!showProComparison)}
            >
              {showProComparison ? 'Hide' : 'Show'} Pro Comparison
            </Button>
          </div>

        {showProComparison && (
          <div>
          <p className="text-xs text-tier-text-tertiary mb-3">
            Search for pro players from PGA Tour, DP World Tour and Korn Ferry Tour
          </p>
          <div className="relative max-w-md mb-3">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-text-tertiary"
            />
            <input
              type="text"
              placeholder="Search for pro player (e.g. Viktor Hovland, Rory McIlroy)..."
              value={proSearchQuery}
              onChange={(e) => setProSearchQuery(e.target.value)}
              className="w-full py-3 pr-10 pl-10 rounded-[10px] border border-tier-border-default bg-tier-surface-base text-sm text-tier-navy outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            {proPlayersLoading && (
              <Loader2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 animate-spin" />
            )}
          </div>

          {/* Search hint */}
          {proSearchQuery.length > 0 && proSearchQuery.length < 2 && (
            <p className="text-xs text-tier-text-tertiary mb-2">Type at least 2 characters to search...</p>
          )}

          {/* Pro Player Selection */}
          <div className="flex flex-wrap gap-2 min-h-[44px]">
            {proPlayersLoading ? (
              <p className="text-sm text-tier-text-tertiary flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Searching DataGolf...
              </p>
            ) : displayedProPlayers.length === 0 && proSearchQuery.length >= 2 ? (
              <p className="text-sm text-tier-text-tertiary">No players found for "{proSearchQuery}"</p>
            ) : (
              displayedProPlayers.map(pro => {
                const isSelected = selectedProPlayer?.id === pro.id;
                return (
                  <button
                    key={pro.id}
                    onClick={() => setSelectedProPlayer(isSelected ? null : pro)}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                      ${isSelected
                        ? 'bg-purple-600 text-white border-2 border-purple-600 shadow-sm'
                        : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                      }
                    `}
                  >
                    <span>{pro.name}</span>
                    <span className={`text-xs ${isSelected ? 'text-purple-200' : 'text-purple-500'}`}>
                      ({pro.country})
                    </span>
                    {pro.sgTotal !== null && (
                      <span className={`text-xs font-bold ${isSelected ? 'text-purple-200' : 'text-green-600'}`}>
                        +{pro.sgTotal.toFixed(2)}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Show top players hint when not searching */}
          {proSearchQuery.length === 0 && displayedProPlayers.length > 0 && (
            <p className="text-xs text-tier-text-tertiary mt-2">
              Showing top {displayedProPlayers.length} players from {getTourDisplayName(tour)}. Search to find more.
            </p>
          )}

          {/* Selected Pro Player Comparison Card */}
          {selectedProPlayer && (
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                    <Award size={16} className="text-purple-600" />
                    Comparing with: {selectedProPlayer.name}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    {selectedProPlayer.country} • {selectedProPlayer.tour?.toUpperCase() || getTourDisplayName(tour)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProPlayer(null)}
                  className="text-purple-400 hover:text-purple-600 text-xs"
                >
                  Remove
                </button>
              </div>

              {/* Pro Player Stats */}
              <div className="grid grid-cols-5 gap-2 mt-3">
                <div className="bg-white rounded-lg p-2 text-center">
                  <p className="text-[10px] text-purple-500">Total</p>
                  <p className="text-sm font-bold text-purple-700">
                    {selectedProPlayer.sgTotal !== null ? `+${selectedProPlayer.sgTotal.toFixed(2)}` : 'N/A'}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <p className="text-[10px] text-purple-500">Tee</p>
                  <p className="text-sm font-bold text-purple-700">
                    {selectedProPlayer.sgTee !== null && selectedProPlayer.sgTee !== undefined
                      ? (selectedProPlayer.sgTee > 0 ? '+' : '') + selectedProPlayer.sgTee.toFixed(2)
                      : 'N/A'}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <p className="text-[10px] text-purple-500">Approach</p>
                  <p className="text-sm font-bold text-purple-700">
                    {selectedProPlayer.sgApproach !== null && selectedProPlayer.sgApproach !== undefined
                      ? (selectedProPlayer.sgApproach > 0 ? '+' : '') + selectedProPlayer.sgApproach.toFixed(2)
                      : 'N/A'}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <p className="text-[10px] text-purple-500">Around</p>
                  <p className="text-sm font-bold text-purple-700">
                    {selectedProPlayer.sgAround !== null && selectedProPlayer.sgAround !== undefined
                      ? (selectedProPlayer.sgAround > 0 ? '+' : '') + selectedProPlayer.sgAround.toFixed(2)
                      : 'N/A'}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <p className="text-[10px] text-purple-500">Putting</p>
                  <p className="text-sm font-bold text-purple-700">
                    {selectedProPlayer.sgPutting !== null && selectedProPlayer.sgPutting !== undefined
                      ? (selectedProPlayer.sgPutting > 0 ? '+' : '') + selectedProPlayer.sgPutting.toFixed(2)
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
          </div>
        )}
        </div>
      </div>

      {/* Charts Section */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Strokes Gained Bar Chart */}
          <div className="bg-tier-white rounded-2xl p-5 border border-tier-border-default">
            <SubSectionTitle className="mb-4">Strokes Gained Overview</SubSectionTitle>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-default))" />
                <XAxis dataKey="name" stroke="rgb(var(--text-secondary))" fontSize={12} />
                <YAxis stroke="rgb(var(--text-secondary))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid rgb(var(--border-default))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="SG Total" fill="rgb(var(--status-info))" />
                <Bar dataKey="SG Approach" fill="rgb(var(--status-success))" />
                <Bar dataKey="SG Putting" fill="rgb(var(--tier-gold))" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Skill Category Breakdown */}
          <div className="bg-tier-white rounded-2xl p-5 border border-tier-border-default">
            <SubSectionTitle className="mb-4">Category Breakdown</SubSectionTitle>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-default))" />
                <XAxis type="number" stroke="rgb(var(--text-secondary))" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="rgb(var(--text-secondary))" fontSize={12} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid rgb(var(--border-default))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="SG Tee" fill="rgb(var(--category-j))" />
                <Bar dataKey="SG Around" fill="rgb(var(--status-error))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Player List */}
      <div className="bg-tier-white rounded-2xl p-5 border border-tier-border-default">
        <SubSectionTitle className="mb-4">
          Player Statistics ({filteredPlayers.length})
        </SubSectionTitle>

        {filteredPlayers.length === 0 ? (
          <StateCard
            variant="empty"
            title="No players found"
            description="Try adjusting the filters to see more players"
          />
        ) : (
          <div className="space-y-3">
            {filteredPlayers.map((player) => (
              <div
                key={player.playerId}
                className="bg-tier-surface-base rounded-xl p-4 border border-tier-border-default"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-tier-navy/15 flex items-center justify-center text-lg font-semibold text-tier-navy">
                      {(player.playerName || 'U').split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <SubSectionTitle className="m-0">{player.playerName || 'Unknown'}</SubSectionTitle>
                        <span className={`text-[11px] font-medium py-0.5 px-2 rounded ${getCategoryClasses(player.category).bg} ${getCategoryClasses(player.category).text}`}>
                          Cat. {player.category || '-'}
                        </span>
                      </div>
                      <p className="text-sm text-tier-text-secondary">HCP: {player.handicap?.toFixed(1) ?? 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-tier-text-tertiary mb-1">Total SG</p>
                    <p className={`text-2xl font-bold ${formatSgValue(player.stats?.sgTotal ?? null).color}`}>
                      {formatSgValue(player.stats?.sgTotal ?? null).text}
                    </p>
                  </div>
                </div>

                {/* SG Categories */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Tee', value: player.stats?.sgTee ?? null, percentile: player.percentiles?.sgTee ?? 0 },
                    { label: 'Approach', value: player.stats?.sgApproach ?? null, percentile: player.percentiles?.sgApproach ?? 0 },
                    { label: 'Around', value: player.stats?.sgAround ?? null, percentile: player.percentiles?.sgAround ?? 0 },
                    { label: 'Putting', value: player.stats?.sgPutting ?? null, percentile: player.percentiles?.sgPutting ?? 0 },
                  ].map((cat, idx) => (
                    <div key={idx} className="bg-tier-white rounded-lg p-3">
                      <p className="text-[11px] text-tier-text-tertiary mb-1">{cat.label}</p>
                      <p className={`text-lg font-bold ${formatSgValue(cat.value).color}`}>
                        {formatSgValue(cat.value).text}
                      </p>
                      <p className="text-[10px] text-tier-text-tertiary mt-1">
                        {cat.percentile}%ile
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">About Data Golf Statistics</p>
            <p className="text-sm text-blue-700">
              Data Golf statistics show players' Strokes Gained (SG) values compared to professional tour data.
              Positive numbers mean better than average, negative numbers mean worse.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachDataGolfStats;
