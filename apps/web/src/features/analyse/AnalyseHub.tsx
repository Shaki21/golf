/**
 * Analyse Hub Page - Decision-First Dashboard
 * Design System v3.1 - McKinsey-grade operating dashboard
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "What data should I review or analyze NOW?"
 *
 * INFORMATION ARCHITECTURE (3-layer model):
 * Layer 1 (30%) — Decision Layer: Hero card with next critical action
 * Layer 2 (40%) — Control & Progress: Quick stats + Trend overview
 * Layer 3 (30%) — Operations & Admin: Analysis navigation cards
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAnalyseHubStats } from '../../hooks/useAnalyseHubStats';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import {
  BarChart3,
  Users,
  FileText,
  Target,
  Trophy,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Zap,
} from 'lucide-react';

// =============================================================================
// STATE MACHINE - Determines primary action
// =============================================================================

type AnalysisState =
  | 'new_reports'          // New reports from coach to review
  | 'tests_due'            // Time for a test/assessment
  | 'achievement_unlocked' // New badge/achievement to view
  | 'trend_alert'          // Notable trend detected
  | 'view_analysis';       // Default: general stats review

interface PrimaryAction {
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  urgency: 'high' | 'medium' | 'low';
}

interface AnalysisStats {
  newReports: number;
  testsDue: number;
  newAchievements: number;
  hasTrendAlert: boolean;
  trendMessage?: string;
  strokesGained: number;
  peerRank: number;
  totalPeers: number;
  badgesEarned: number;
  totalBadges: number;
}

function computeAnalysisState(stats: AnalysisStats): { state: AnalysisState; action: PrimaryAction } {
  // Priority 1: New reports from coach
  if (stats.newReports > 0) {
    return {
      state: 'new_reports',
      action: {
        headline: `${stats.newReports} new report${stats.newReports > 1 ? 's' : ''} from your coach`,
        subtext: 'Review feedback and recommendations for your development',
        ctaLabel: 'View Reports',
        ctaHref: '/analyse/rapporter',
        urgency: 'high',
      },
    };
  }

  // Priority 2: Trend alert
  if (stats.hasTrendAlert) {
    return {
      state: 'trend_alert',
      action: {
        headline: stats.trendMessage || 'Significant trend detected',
        subtext: 'Check your statistics for detailed insights',
        ctaLabel: 'View Statistics',
        ctaHref: '/analyse/statistikk',
        urgency: 'high',
      },
    };
  }

  // Priority 3: Tests due
  if (stats.testsDue > 0) {
    return {
      state: 'tests_due',
      action: {
        headline: `${stats.testsDue} test${stats.testsDue > 1 ? 's' : ''} ready to take`,
        subtext: 'Complete your assessments to track progress',
        ctaLabel: 'View Tests',
        ctaHref: '/analyse/tester',
        urgency: 'medium',
      },
    };
  }

  // Priority 4: New achievement
  if (stats.newAchievements > 0) {
    return {
      state: 'achievement_unlocked',
      action: {
        headline: `You earned ${stats.newAchievements} new achievement${stats.newAchievements > 1 ? 's' : ''}!`,
        subtext: 'View your latest milestones and badges',
        ctaLabel: 'View Achievements',
        ctaHref: '/analyse/prestasjoner',
        urgency: 'medium',
      },
    };
  }

  // Default: View analysis
  return {
    state: 'view_analysis',
    action: {
      headline: 'Explore your performance data',
      subtext: 'Review statistics, comparisons, and trends',
      ctaLabel: 'View Statistics',
      ctaHref: '/analyse/statistikk',
      urgency: 'low',
    },
  };
}

// =============================================================================
// SPARKLINE COMPONENT
// =============================================================================

interface SparklineProps {
  data: number[];
  color: string;
  height?: number;
}

const Sparkline: React.FC<SparklineProps> = ({ data, color, height = 40 }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg
      width="100%"
      height={height}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="opacity-50"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        points={points}
      />
    </svg>
  );
};

// =============================================================================
// HERO DECISION CARD
// =============================================================================

interface AnalysisHeroCardProps {
  action: PrimaryAction;
  userName: string;
  strokesGained: number;
}

function AnalysisHeroDecisionCard({ action, userName, strokesGained }: AnalysisHeroCardProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const urgencyColors = {
    high: 'bg-red-50 border-red-200',
    medium: 'bg-amber-50 border-amber-200',
    low: 'bg-white border-tier-border-default',
  };

  return (
    <div className={`rounded-xl p-6 shadow-sm border ${urgencyColors[action.urgency]}`}>
      {/* Greeting + Badge */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg text-tier-text-secondary">
          {getGreeting()}, <span className="font-semibold text-tier-navy">{userName}</span>
        </h2>
        {strokesGained !== 0 && (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
            strokesGained > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <TrendingUp size={14} className={strokesGained < 0 ? 'rotate-180' : ''} />
            {strokesGained > 0 ? '+' : ''}{strokesGained} strokes gained
          </span>
        )}
      </div>

      {/* Primary Action */}
      <h1 className="text-2xl md:text-3xl font-bold text-tier-navy mb-2">
        {action.headline}
      </h1>
      <p className="text-tier-text-secondary mb-6">
        {action.subtext}
      </p>

      {/* CTA */}
      <Link
        to={action.ctaHref}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-tier-navy text-white font-semibold hover:bg-tier-navy/90 transition-colors shadow-sm"
      >
        <BarChart3 size={18} />
        {action.ctaLabel}
      </Link>
    </div>
  );
}

// =============================================================================
// QUICK STATS CARD
// =============================================================================

interface QuickStatsCardProps {
  stats: AnalysisStats;
}

function QuickStatsCard({ stats }: QuickStatsCardProps) {
  const statItems = [
    {
      label: 'Strokes Gained',
      value: stats.strokesGained > 0 ? `+${stats.strokesGained}` : `${stats.strokesGained}`,
      icon: TrendingUp,
      color: stats.strokesGained > 0 ? 'text-green-600' : 'text-red-600',
      bgColor: stats.strokesGained > 0 ? 'bg-green-50' : 'bg-red-50',
    },
    {
      label: 'Peer Rank',
      value: `#${stats.peerRank}`,
      subValue: `of ${stats.totalPeers}`,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Achievements',
      value: `${stats.badgesEarned}`,
      subValue: `/ ${stats.totalBadges}`,
      icon: Trophy,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <h3 className="text-lg font-semibold text-tier-navy mb-4">Performance Overview</h3>
      <div className="space-y-4">
        {statItems.map((stat, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bgColor} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div className="flex-1">
              <div className="text-sm text-tier-text-secondary">{stat.label}</div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
              {stat.subValue && (
                <span className="text-sm text-tier-text-secondary">{stat.subValue}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// RECENT ACTIVITY CARD
// =============================================================================

function RecentActivityCard() {
  const activities = [
    {
      title: 'New test result recorded',
      subtitle: 'Category test - 85.5%',
      time: '2 hours ago',
      href: '/analyse/tester?tab=resultater',
      icon: Target,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      title: 'Badge earned',
      subtitle: 'Putting Excellence',
      time: '1 day ago',
      href: '/analyse/prestasjoner',
      icon: Trophy,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Progress report from coach',
      subtitle: 'Monthly evaluation',
      time: '3 days ago',
      href: '/analyse/rapporter',
      icon: FileText,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-tier-navy">Recent Activity</h3>
      </div>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <Link
            key={index}
            to={activity.href}
            className="group flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-tier-surface-subtle transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.iconBg} ${activity.iconColor}`}>
              <activity.icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-tier-navy group-hover:text-tier-navy-dark">
                {activity.title}
              </div>
              <div className="text-xs text-tier-text-secondary">
                {activity.subtitle} • {activity.time}
              </div>
            </div>
            <ChevronRight size={16} className="text-tier-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// OPERATIONS SECTION - ANALYSIS NAVIGATION CARDS
// =============================================================================

interface AnalysisCard {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  sparklineData?: number[];
  sparklineColor?: string;
  stats?: { label: string; value: string }[];
}

interface AnalysisOperationsSectionProps {
  sparklines: {
    statistikk: number[];
    sammenligninger: number[];
    rapporter: number[];
    tester: number[];
    prestasjoner: number[];
  };
  strokesGained: number;
  peerRank: number;
  totalPeers: number;
  newReports: number;
  latestReportDate: string | null;
  latestTestScore: number;
  badgesEarned: number;
  totalBadges: number;
  totalAchievements: number;
}

function AnalysisOperationsSection({
  sparklines,
  strokesGained,
  peerRank,
  totalPeers,
  newReports,
  latestReportDate,
  latestTestScore,
  badgesEarned,
  totalBadges,
  totalAchievements,
}: AnalysisOperationsSectionProps) {
  // Calculate trend from sparkline
  const sgTrend = sparklines.statistikk.length >= 2
    ? sparklines.statistikk[sparklines.statistikk.length - 1] - sparklines.statistikk[0]
    : 0;

  // Format latest report date
  const formatReportDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const cards: AnalysisCard[] = [
    {
      title: 'Statistics',
      description: 'View your development, strokes gained, trends and goal status',
      href: '/analyse/statistikk',
      icon: BarChart3,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      sparklineData: sparklines.statistikk.length > 0 ? sparklines.statistikk : [0],
      sparklineColor: '#3B82F6',
      stats: [
        { label: 'Strokes Gained', value: strokesGained > 0 ? `+${strokesGained.toFixed(1)}` : `${strokesGained.toFixed(1)}` },
        { label: 'Trend', value: sgTrend > 0 ? '↗ Positive' : sgTrend < 0 ? '↘ Negative' : '→ Stable' },
      ],
    },
    {
      title: 'Comparisons',
      description: 'Compare with peer group, professionals and others',
      href: '/analyse/sammenligninger',
      icon: Users,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
      sparklineData: sparklines.sammenligninger.length > 0 ? sparklines.sammenligninger : [0],
      sparklineColor: '#9333EA',
      stats: [
        { label: 'Peer Rank', value: `#${peerRank} of ${totalPeers}` },
        { label: 'Percentile', value: `${Math.round((1 - peerRank / totalPeers) * 100)}%` },
      ],
    },
    {
      title: 'Reports',
      description: 'Progress reports and feedback from your coaches',
      href: '/analyse/rapporter',
      icon: FileText,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-50',
      sparklineData: sparklines.rapporter.length > 0 ? sparklines.rapporter : [0],
      sparklineColor: '#059669',
      stats: [
        { label: 'New reports', value: `${newReports}` },
        { label: 'Latest', value: formatReportDate(latestReportDate) },
      ],
    },
    {
      title: 'Tests',
      description: 'Test results, history and category requirements',
      href: '/analyse/tester',
      icon: Target,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      sparklineData: sparklines.tester.length > 0 ? sparklines.tester : [0],
      sparklineColor: '#D97706',
      stats: [
        { label: 'Latest test', value: `${latestTestScore.toFixed(1)}%` },
        { label: 'Tests taken', value: `${sparklines.tester.length}` },
      ],
    },
    {
      title: 'Achievements',
      description: 'Your badges, achievements and milestones',
      href: '/analyse/prestasjoner',
      icon: Trophy,
      iconColor: 'text-tier-gold',
      iconBg: 'bg-amber-50',
      sparklineData: sparklines.prestasjoner.length > 0 ? sparklines.prestasjoner : [0],
      sparklineColor: '#C9A227',
      stats: [
        { label: 'Badges', value: `${badgesEarned}/${totalBadges}` },
        { label: 'Achievements', value: `${totalAchievements}` },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <Link
          key={card.href}
          to={card.href}
          className="group bg-white rounded-xl border border-tier-border-default p-6 hover:shadow-md hover:border-tier-navy/20 transition-all duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.iconBg}`}>
              <card.icon size={24} className={card.iconColor} />
            </div>
            <ChevronRight size={20} className="text-tier-text-tertiary group-hover:text-tier-navy transition-colors" />
          </div>

          {/* Title & Description */}
          <h3 className="text-lg font-semibold text-tier-navy mb-1 group-hover:text-tier-navy-dark">
            {card.title}
          </h3>
          <p className="text-sm text-tier-text-secondary mb-4">
            {card.description}
          </p>

          {/* Sparkline */}
          {card.sparklineData && card.sparklineColor && (
            <div className="mb-4 h-[40px] rounded-lg bg-tier-surface-subtle overflow-hidden">
              <Sparkline
                data={card.sparklineData}
                color={card.sparklineColor}
                height={40}
              />
            </div>
          )}

          {/* Stats */}
          {card.stats && (
            <div className="flex items-center gap-4 pt-3 border-t border-tier-border-subtle">
              {card.stats.map((stat, index) => (
                <div key={index} className="flex-1">
                  <div className="text-xs text-tier-text-secondary">{stat.label}</div>
                  <div className="text-sm font-semibold text-tier-navy">{stat.value}</div>
                </div>
              ))}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AnalyseHub() {
  const { user } = useAuth();
  const userName = user?.firstName || 'Player';
  const { stats, isLoading, error, refetch } = useAnalyseHubStats();

  // Loading state
  if (isLoading && !stats) {
    return <LoadingSpinner message="Loading analysis overview..." />;
  }

  // Error state
  if (error && !stats) {
    return (
      <div className="min-h-screen bg-tier-surface-base flex items-center justify-center p-6">
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  // Use real stats or fallback to defaults
  const displayStats = stats || {
    newReports: 0,
    testsDue: 0,
    newAchievements: 0,
    strokesGained: 0,
    hasTrendAlert: false,
    peerRank: 0,
    totalPeers: 0,
    badgesEarned: 0,
    totalBadges: 0,
    sparklines: {
      statistikk: [0],
      sammenligninger: [0],
      rapporter: [0],
      tester: [0],
      prestasjoner: [0],
    },
    latestTestScore: 0,
    latestReportDate: null,
    totalAchievements: 0,
  };

  const analysisStats: AnalysisStats = {
    newReports: displayStats.newReports,
    testsDue: displayStats.testsDue,
    newAchievements: displayStats.newAchievements,
    strokesGained: displayStats.strokesGained,
    hasTrendAlert: displayStats.hasTrendAlert,
    trendMessage: displayStats.trendMessage,
    peerRank: displayStats.peerRank,
    totalPeers: displayStats.totalPeers,
    badgesEarned: displayStats.badgesEarned,
    totalBadges: displayStats.totalBadges,
  };

  const { action } = computeAnalysisState(analysisStats);

  return (
    <div className="min-h-screen bg-tier-surface-base">
      {/* Compact header */}
      <PageHeader
        title="Analysis"
        subtitle="Track your development and gain performance insights"
        helpText="This area contains your statistics, comparisons, reports, tests and achievements. Click on cards below to explore each section."
      />

      <PageContainer paddingY="lg" background="base">
        {/* ============================================================
            LAYER 1 — DECISION LAYER (top ~30%)
            Hero card with next critical action
            ============================================================ */}
        <section className="mb-8" aria-label="Next action">
          <AnalysisHeroDecisionCard
            action={action}
            userName={userName}
            strokesGained={displayStats.strokesGained}
          />
        </section>

        {/* ============================================================
            LAYER 2 — CONTROL & PROGRESS (middle ~40%)
            Quick stats + Recent activity
            ============================================================ */}
        <section className="mb-8" aria-label="Performance overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuickStatsCard stats={analysisStats} />
            <RecentActivityCard />
          </div>
        </section>

        {/* ============================================================
            LAYER 3 — OPERATIONS & ADMIN (bottom ~30%)
            Analysis navigation cards
            ============================================================ */}
        <section aria-label="Analysis tools">
          <AnalysisOperationsSection
            sparklines={displayStats.sparklines}
            strokesGained={displayStats.strokesGained}
            peerRank={displayStats.peerRank}
            totalPeers={displayStats.totalPeers}
            newReports={displayStats.newReports}
            latestReportDate={displayStats.latestReportDate}
            latestTestScore={displayStats.latestTestScore}
            badgesEarned={displayStats.badgesEarned}
            totalBadges={displayStats.totalBadges}
            totalAchievements={displayStats.totalAchievements}
          />
        </section>
      </PageContainer>
    </div>
  );
}
