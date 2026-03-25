// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TIER Golf - Coach Statistics Dashboard
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 * Comprehensive analytics and statistics view for coaches
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, TrendingUp, TrendingDown, Users, Target,
  Award, Download,
  Activity, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { analyticsAPI, coachesAPI } from '../../services/api';
import Card from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';
import StateCard from '../../ui/composites/StateCard';
import { PageTitle, SectionTitle } from '../../components/typography/Headings';

// Types
interface TeamAnalytics {
  totalPlayers: number;
  playersByCategory: Record<string, number>;
  overallCompletionRate: number;
  testsCompletedTotal: number;
  testsPossibleTotal: number;
  testStatistics: TestStatistic[];
  recentActivityCount: number;
  monthlyTrend: 'improving' | 'stable' | 'declining';
}

interface TestStatistic {
  testNumber: number;
  testName: string;
  averageScore: number;
  passRate: number;
  totalAttempts: number;
  trend: 'up' | 'down' | 'stable';
}

interface PlayerSummary {
  playerId: string;
  playerName: string;
  category: string;
  testsCompleted: number;
  totalTests: number;
  completionRate: number;
  lastActivity: string;
  trend: 'improving' | 'stable' | 'declining';
}

// Helper function for variant colors
const getVariantClasses = (variant: 'primary' | 'success' | 'warning' | 'gold') => {
  switch (variant) {
    case 'primary':
      return { text: 'text-tier-navy', bg: 'bg-tier-navy/10' };
    case 'success':
      return { text: 'text-tier-success', bg: 'bg-tier-success/10' };
    case 'warning':
      return { text: 'text-tier-warning', bg: 'bg-tier-warning/10' };
    case 'gold':
      return { text: 'text-amber-500', bg: 'bg-amber-500/10' };
    default:
      return { text: 'text-tier-navy', bg: 'bg-tier-navy/10' };
  }
};

// Stat Card Component
const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: number; direction: 'up' | 'down' };
  variant?: 'primary' | 'success' | 'warning' | 'gold';
}> = ({ label, value, icon: Icon, trend, variant = 'primary' }) => {
  const variantClasses = getVariantClasses(variant);

  return (
    <Card variant="default" padding="lg">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[13px] leading-[18px] text-tier-text-secondary mb-2">
            {label}
          </p>
          <p className={`text-[32px] font-bold m-0 ${variantClasses.text}`}>
            {value}
          </p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 ${trend.direction === 'up' ? 'text-tier-success' : 'text-tier-error'}`}>
              {trend.direction === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="text-xs font-medium">
                {trend.value}% fra forrige maned
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${variantClasses.bg} flex items-center justify-center`}>
          <Icon size={24} className={variantClasses.text} />
        </div>
      </div>
    </Card>
  );
};

// Progress bar component
const ProgressBar: React.FC<{ value: number; max?: number; colorClass?: string }> = ({
  value,
  max = 100,
  colorClass = 'bg-tier-navy',
}) => (
  <div className="w-full h-2 bg-tier-surface-base rounded overflow-hidden">
    <div
      className={`h-full ${colorClass} rounded transition-all duration-300`}
      style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
    />
  </div>
);

// Category distribution chart
const CategoryChart: React.FC<{ data: Record<string, number> }> = ({ data }) => {
  const categories = Object.entries(data).sort((a, b) => a[0].localeCompare(b[0]));
  const maxValue = Math.max(...categories.map(([, v]) => v as number), 1);

  const getCategoryColorClass = (cat: string) => {
    const colors: Record<string, string> = {
      A: 'bg-tier-navy',
      B: 'bg-tier-navy/70',
      C: 'bg-tier-success',
      D: 'bg-amber-500',
      E: 'bg-orange-500',
      F: 'bg-red-500',
    };
    return colors[cat] || 'bg-tier-text-secondary';
  };

  return (
    <div className="flex flex-col gap-3">
      {categories.map(([category, count]) => {
        const countNum = count as number;
        return (
        <div key={category}>
          <div className="flex justify-between mb-1">
            <span className="text-[15px] leading-[22px] font-medium">Kategori {category}</span>
            <span className="text-[15px] leading-[22px] text-tier-text-secondary">{countNum} spillere</span>
          </div>
          <div className="w-full h-6 bg-tier-surface-base rounded-md overflow-hidden">
            <div
              className={`h-full ${getCategoryColorClass(category)} rounded-md transition-all duration-500`}
              style={{ width: `${(countNum / maxValue) * 100}%` }}
            />
          </div>
        </div>
      );
      })}
    </div>
  );
};

// Test performance table
const TestPerformanceTable: React.FC<{ data: TestStatistic[] }> = ({ data }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} className="text-tier-success" />;
      case 'down':
        return <TrendingDown size={16} className="text-tier-error" />;
      default:
        return <Activity size={16} className="text-tier-text-secondary" />;
    }
  };

  const getPassRateColorClass = (rate: number) => {
    if (rate >= 80) return 'text-tier-success';
    if (rate >= 60) return 'text-tier-warning';
    return 'text-tier-error';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-tier-border-default">
            <th className="p-3 text-left text-[13px] leading-[18px] text-tier-text-secondary">
              Test
            </th>
            <th className="p-3 text-center text-[13px] leading-[18px] text-tier-text-secondary">
              Gjennomsnitt
            </th>
            <th className="p-3 text-center text-[13px] leading-[18px] text-tier-text-secondary">
              Bestattprosent
            </th>
            <th className="p-3 text-center text-[13px] leading-[18px] text-tier-text-secondary">
              Antall forsok
            </th>
            <th className="p-3 text-center text-[13px] leading-[18px] text-tier-text-secondary">
              Trend
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((test) => (
            <tr
              key={test.testNumber}
              className="border-b border-tier-surface-base"
            >
              <td className="py-3.5 px-3">
                <div>
                  <p className="text-[15px] leading-[22px] font-medium m-0">
                    Test {test.testNumber}
                  </p>
                  <p className="text-xs leading-4 text-tier-text-secondary m-0">
                    {test.testName}
                  </p>
                </div>
              </td>
              <td className="py-3.5 px-3 text-center">
                <span className="text-[15px] leading-[22px] font-semibold">
                  {test.averageScore.toFixed(1)}
                </span>
              </td>
              <td className="py-3.5 px-3 text-center">
                <span className={`text-[15px] leading-[22px] font-semibold ${getPassRateColorClass(test.passRate)}`}>
                  {test.passRate.toFixed(0)}%
                </span>
              </td>
              <td className="py-3.5 px-3 text-center">
                <span className="text-[15px] leading-[22px]">{test.totalAttempts}</span>
              </td>
              <td className="py-3.5 px-3 text-center">
                {getTrendIcon(test.trend)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Player summary list
const PlayerSummaryList: React.FC<{
  players: PlayerSummary[];
  onPlayerClick: (playerId: string) => void;
}> = ({ players, onPlayerClick }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp size={16} className="text-tier-success" />;
      case 'declining':
        return <TrendingDown size={16} className="text-tier-error" />;
      default:
        return <Activity size={16} className="text-tier-text-secondary" />;
    }
  };

  return (
    <div className="flex flex-col">
      {players.map((player) => (
        <div
          key={player.playerId}
          onClick={() => onPlayerClick(player.playerId)}
          className="flex items-center py-3.5 border-b border-tier-surface-base cursor-pointer"
        >
          <div className="flex-1">
            <p className="text-[15px] leading-[22px] font-medium m-0">
              {player.playerName}
            </p>
            <p className="text-xs leading-4 text-tier-text-secondary m-0">
              Kategori {player.category}
            </p>
          </div>
          <div className="w-[120px] mr-4">
            <div className="flex justify-between mb-1">
              <span className="text-xs leading-4 text-tier-text-secondary">
                {player.testsCompleted}/{player.totalTests}
              </span>
              <span className="text-xs leading-4 font-medium">
                {player.completionRate.toFixed(0)}%
              </span>
            </div>
            <ProgressBar value={player.completionRate} />
          </div>
          {getTrendIcon(player.trend)}
        </div>
      ))}
    </div>
  );
};

// Main component
export default function CoachStatistics() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [analytics, setAnalytics] = useState<TeamAnalytics | null>(null);
  const [players, setPlayers] = useState<PlayerSummary[]>([]);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!user?.coachId && !user?.id) return;

    setLoading(true);
    try {
      const coachId = user.coachId || user.id;

      // Fetch team analytics and players in parallel
      const [analyticsRes, playersRes] = await Promise.all([
        analyticsAPI.getTeamAnalytics(coachId).catch(() => ({ data: null })),
        coachesAPI.getAthletes().catch(() => ({ data: null })),
      ]);

      // Handle analytics response
      const analyticsData = analyticsRes.data?.data || analyticsRes.data;
      if (analyticsData) {
        setAnalytics(analyticsData);
      }

      // Transform players to summary format
      const playersData = playersRes.data?.data || playersRes.data || [];
      if (Array.isArray(playersData) && playersData.length > 0) {
        const playerSummaries: PlayerSummary[] = playersData.map((p: any) => ({
          playerId: p.id,
          playerName: `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.name || 'Spiller',
          category: p.category || 'C',
          testsCompleted: p.testsCompleted || p.completedTests || 0,
          totalTests: p.totalTests || 20,
          completionRate: p.completionRate || (p.testsCompleted / (p.totalTests || 20)) * 100 || 0,
          lastActivity: p.lastActivity || p.updatedAt || new Date().toISOString(),
          trend: p.trend || 'stable',
        }));
        setPlayers(playerSummaries);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.coachId, user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData, timeRange]);

  // Mock data for when API is not available
  const mockAnalytics: TeamAnalytics = analytics || {
    totalPlayers: 12,
    playersByCategory: { A: 3, B: 4, C: 3, D: 2 },
    overallCompletionRate: 78,
    testsCompletedTotal: 187,
    testsPossibleTotal: 240,
    testStatistics: [
      { testNumber: 1, testName: 'Driving Distance', averageScore: 245, passRate: 85, totalAttempts: 48, trend: 'up' },
      { testNumber: 2, testName: 'Driving Accuracy', averageScore: 72, passRate: 70, totalAttempts: 45, trend: 'stable' },
      { testNumber: 3, testName: 'Iron Play', averageScore: 68, passRate: 65, totalAttempts: 42, trend: 'up' },
      { testNumber: 4, testName: 'Short Game', averageScore: 75, passRate: 78, totalAttempts: 50, trend: 'up' },
      { testNumber: 5, testName: 'Putting', averageScore: 32, passRate: 82, totalAttempts: 52, trend: 'stable' },
    ],
    recentActivityCount: 24,
    monthlyTrend: 'improving',
  };

  const handleExport = () => {
    window.open('/api/v1/export/statistics', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tier-surface-base flex items-center justify-center">
        <StateCard variant="loading" title="Laster statistikk..." />
      </div>
    );
  }

  const data = mockAnalytics;

  return (
    <div className="min-h-screen bg-tier-surface-base font-sans">
      {/* Header */}
      <div className="p-6 bg-tier-white border-b border-tier-border-default">
        <div className="flex justify-between items-center">
          <div>
            <PageTitle className="text-[34px] leading-[41px] font-bold tracking-tight text-tier-navy m-0">
              Statistikk
            </PageTitle>
            <p className="text-[15px] leading-[22px] text-tier-text-secondary mt-1">
              Oversikt over dine spilleres prestasjoner
            </p>
          </div>
          <div className="flex gap-3">
            {/* Time range selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'quarter' | 'year')}
              className="py-2.5 px-4 rounded-lg border border-tier-border-default bg-tier-white text-[15px] leading-[22px] cursor-pointer"
            >
              <option value="week">Siste uke</option>
              <option value="month">Siste maned</option>
              <option value="quarter">Siste kvartal</option>
              <option value="year">Siste ar</option>
            </select>
            {/* Export button */}
            <Button variant="primary" size="md" onClick={handleExport} leftIcon={<Download size={18} />}>
              Eksporter
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-6">
        {/* Top stats row */}
        <div className="grid grid-cols-4 gap-5 mb-6">
          <StatCard
            label="Totalt spillere"
            value={data.totalPlayers}
            icon={Users}
            variant="primary"
          />
          <StatCard
            label="Gjennomforingsgrad"
            value={`${data.overallCompletionRate}%`}
            icon={Target}
            trend={{ value: 5, direction: 'up' }}
            variant="success"
          />
          <StatCard
            label="Tester fullfort"
            value={data.testsCompletedTotal}
            icon={CheckCircle}
            variant="primary"
          />
          <StatCard
            label="Aktivitet siste 7 dager"
            value={data.recentActivityCount}
            icon={Activity}
            trend={{ value: 12, direction: 'up' }}
            variant="gold"
          />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-[2fr_1fr] gap-5">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            {/* Test Performance */}
            <Card variant="default" padding="lg">
              <div className="flex justify-between items-center mb-5">
                <SectionTitle className="text-[22px] leading-7 font-bold text-tier-navy m-0">
                  Testprestasjoner
                </SectionTitle>
                <BarChart3 size={20} className="text-tier-text-secondary" />
              </div>
              <TestPerformanceTable data={data.testStatistics} />
            </Card>

            {/* Player Progress */}
            <Card variant="default" padding="lg">
              <div className="flex justify-between items-center mb-5">
                <SectionTitle className="text-[22px] leading-7 font-bold text-tier-navy m-0">
                  Spillerfremdrift
                </SectionTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/coach/athletes')}>
                  Se alle
                </Button>
              </div>
              <PlayerSummaryList
                players={players}
                onPlayerClick={(id) => navigate(`/coach/athlete/${id}`)}
              />
            </Card>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            {/* Category Distribution */}
            <Card variant="default" padding="lg">
              <SectionTitle className="text-[22px] leading-7 font-bold text-tier-navy m-0 mb-5">
                Kategorifordeling
              </SectionTitle>
              <CategoryChart data={data.playersByCategory} />
            </Card>

            {/* Quick Insights */}
            <Card variant="default" padding="lg">
              <SectionTitle className="text-[22px] leading-7 font-bold text-tier-navy m-0 mb-5">
                Innsikt
              </SectionTitle>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 p-3.5 bg-tier-success/10 rounded-lg">
                  <TrendingUp size={20} className="text-tier-success" />
                  <div>
                    <p className="text-[15px] leading-[22px] font-medium m-0">
                      Positiv trend
                    </p>
                    <p className="text-xs leading-4 text-tier-text-secondary m-0">
                      3 spillere har forbedret seg betydelig denne maneden
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3.5 bg-tier-warning/10 rounded-lg">
                  <AlertTriangle size={20} className="text-tier-warning" />
                  <div>
                    <p className="text-[15px] leading-[22px] font-medium m-0">
                      Oppmerksomhet nodvendig
                    </p>
                    <p className="text-xs leading-4 text-tier-text-secondary m-0">
                      2 spillere har ikke vart aktive pa over 2 uker
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3.5 bg-tier-navy/10 rounded-lg">
                  <Award size={20} className="text-tier-navy" />
                  <div>
                    <p className="text-[15px] leading-[22px] font-medium m-0">
                      Kategoriopprykksklar
                    </p>
                    <p className="text-xs leading-4 text-tier-text-secondary m-0">
                      Lars Olsen er klar for opprykk til kategori A
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Export Options */}
            <Card variant="default" padding="lg">
              <SectionTitle className="text-[22px] leading-7 font-bold text-tier-navy m-0 mb-4">
                Eksporter data
              </SectionTitle>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => window.open('/api/v1/export/test-results', '_blank')}
                  className="flex items-center gap-3 p-3 bg-tier-surface-base border-none rounded-lg cursor-pointer w-full text-left hover:bg-tier-surface-base transition-colors"
                >
                  <Download size={18} className="text-tier-navy" />
                  <span className="text-[15px] leading-[22px]">Testresultater (Excel)</span>
                </button>
                <button
                  onClick={() => window.open('/api/v1/export/training-sessions', '_blank')}
                  className="flex items-center gap-3 p-3 bg-tier-surface-base border-none rounded-lg cursor-pointer w-full text-left hover:bg-tier-surface-base transition-colors"
                >
                  <Download size={18} className="text-tier-navy" />
                  <span className="text-[15px] leading-[22px]">Treningsokter (Excel)</span>
                </button>
                <button
                  onClick={() => window.open('/api/v1/export/statistics', '_blank')}
                  className="flex items-center gap-3 p-3 bg-tier-surface-base border-none rounded-lg cursor-pointer w-full text-left hover:bg-tier-surface-base transition-colors"
                >
                  <Download size={18} className="text-tier-navy" />
                  <span className="text-[15px] leading-[22px]">Full statistikk (Excel)</span>
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
