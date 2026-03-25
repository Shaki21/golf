/**
 * Status & Progress Page - Decision-First Dashboard
 * Design System v3.1 - McKinsey-grade operating dashboard
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "Am I making progress towards my goals?"
 *
 * INFORMATION ARCHITECTURE (3-layer model):
 * Layer 1 (30%) — Decision Layer: Hero card with progress vs effort insight
 * Layer 2 (40%) — Control & Progress: KPI stats + Breaking Points
 * Layer 3 (30%) — Operations & Admin: SG summary + Quick links
 */

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  RefreshCw,
  Zap,
  Award,
} from 'lucide-react';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import { useBreakingPoints, BreakingPoint, BpStatus } from '../../hooks/useBreakingPoints';
import { useStrokesGained } from '../../hooks/useStrokesGained';
import { useScreenView } from '../../analytics/useScreenView';

// =============================================================================
// TYPES
// =============================================================================

interface PrimaryAction {
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  urgency: 'high' | 'medium' | 'low';
}

// =============================================================================
// STATE MACHINE - Determines primary action
// =============================================================================

function computeProgressState(
  bpData: any,
  sgData: any
): PrimaryAction {
  // No breaking points data
  if (!bpData || !bpData.breakingPoints || bpData.breakingPoints.length === 0) {
    return {
      headline: 'Set your first goal',
      subtext: 'Define breaking points to track your improvement',
      ctaLabel: 'Create Breaking Point',
      ctaHref: '/utvikling/breaking-points',
      urgency: 'medium',
    };
  }

  const activeBreakingPoints = bpData.breakingPoints.filter(
    (bp: BreakingPoint) => bp.status !== 'resolved'
  );

  // High effort but low progress - need to review method
  const avgEffort = bpData.summary?.averageEffort || 0;
  const avgProgress = bpData.summary?.averageProgress || 0;

  if (avgEffort > 70 && avgProgress < 30) {
    return {
      headline: 'High effort, low results',
      subtext: 'Consider reviewing your training method with your coach',
      ctaLabel: 'Review Breaking Points',
      ctaHref: '/utvikling/breaking-points',
      urgency: 'high',
    };
  }

  // Awaiting proof - close to breakthrough
  const awaitingProof = activeBreakingPoints.filter(
    (bp: BreakingPoint) => bp.status === 'awaiting_proof'
  );
  if (awaitingProof.length > 0) {
    return {
      headline: `${awaitingProof.length} breakthrough${awaitingProof.length > 1 ? 's' : ''} pending verification`,
      subtext: 'You may have reached a milestone! Awaiting coach confirmation.',
      ctaLabel: 'View Status',
      ctaHref: '/utvikling/breaking-points',
      urgency: 'low',
    };
  }

  // Regressed - need attention
  const regressed = activeBreakingPoints.filter(
    (bp: BreakingPoint) => bp.status === 'regressed'
  );
  if (regressed.length > 0) {
    return {
      headline: `${regressed.length} area${regressed.length > 1 ? 's' : ''} need${regressed.length === 1 ? 's' : ''} attention`,
      subtext: 'Some progress has regressed - refocus your training',
      ctaLabel: 'Address Regression',
      ctaHref: '/utvikling/breaking-points',
      urgency: 'high',
    };
  }

  // Good progress
  if (avgProgress >= 60) {
    return {
      headline: 'Great progress!',
      subtext: `${avgProgress}% average progress towards your goals`,
      ctaLabel: 'View Details',
      ctaHref: '/utvikling/breaking-points',
      urgency: 'low',
    };
  }

  // Default - keep working
  return {
    headline: `${activeBreakingPoints.length} active goal${activeBreakingPoints.length !== 1 ? 's' : ''} in progress`,
    subtext: 'Keep training consistently to see results',
    ctaLabel: 'View Breaking Points',
    ctaHref: '/utvikling/breaking-points',
    urgency: 'medium',
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getStatusColor(status: BpStatus): string {
  switch (status) {
    case 'resolved':
      return 'text-green-600 bg-green-100';
    case 'awaiting_proof':
      return 'text-amber-600 bg-amber-100';
    case 'in_progress':
      return 'text-tier-gold bg-tier-gold/10';
    case 'regressed':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

function getStatusLabel(status: BpStatus): string {
  switch (status) {
    case 'not_started':
      return 'Not Started';
    case 'identified':
      return 'Identified';
    case 'in_progress':
      return 'In Progress';
    case 'awaiting_proof':
      return 'Awaiting Proof';
    case 'resolved':
      return 'Resolved';
    case 'regressed':
      return 'Regressed';
    default:
      return status;
  }
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-500';
    case 'high':
      return 'bg-amber-500';
    case 'medium':
      return 'bg-gray-400';
    case 'low':
      return 'bg-green-500';
    default:
      return 'bg-gray-300';
  }
}

function formatSG(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  if (value > 0) return `+${value.toFixed(2)}`;
  return value.toFixed(2);
}

function getDaysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// =============================================================================
// HERO DECISION CARD
// =============================================================================

interface StatusHeroCardProps {
  action: PrimaryAction;
  avgProgress: number;
  avgEffort: number;
  resolvedCount: number;
  totalCount: number;
}

function StatusHeroDecisionCard({
  action,
  avgProgress,
  avgEffort,
  resolvedCount,
  totalCount,
}: StatusHeroCardProps) {
  const urgencyColors = {
    high: 'bg-red-50 border-red-200',
    medium: 'bg-amber-50 border-amber-200',
    low: 'bg-white border-tier-border-default',
  };

  return (
    <div className={`rounded-xl p-6 shadow-sm border ${urgencyColors[action.urgency]}`}>
      {/* Stats Badge */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg text-tier-text-secondary">
          Your progress
        </h2>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tier-gold/10 text-tier-gold text-sm font-medium">
            <Zap size={14} />
            {avgEffort}% Effort
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
            avgProgress >= 60 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            <Target size={14} />
            {avgProgress}% Progress
          </span>
        </div>
      </div>

      {/* Primary Action */}
      <h1 className="text-2xl md:text-3xl font-bold text-tier-navy mb-2">
        {action.headline}
      </h1>
      <p className="text-tier-text-secondary mb-6">
        {action.subtext}
      </p>

      {/* CTAs */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={action.ctaHref}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-tier-navy text-white font-semibold hover:bg-tier-navy/90 transition-colors shadow-sm"
        >
          <Target size={18} />
          {action.ctaLabel}
        </Link>
        <Link
          to="/statistikk?tab=strokes-gained"
          className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-tier-border-default bg-white text-tier-navy font-medium hover:bg-tier-surface-subtle transition-colors"
        >
          <Activity size={16} />
          View Statistics
        </Link>
      </div>
    </div>
  );
}

// =============================================================================
// KPI STATS CARD
// =============================================================================

interface KPIStatsCardProps {
  avgProgress: number;
  avgEffort: number;
  sgTrend: number | null | undefined;
  resolvedCount: number;
  totalCount: number;
}

function KPIStatsCard({ avgProgress, avgEffort, sgTrend, resolvedCount, totalCount }: KPIStatsCardProps) {
  const stats = [
    {
      label: 'Average Progress',
      value: `${avgProgress}%`,
      sublabel: 'Towards goals',
      icon: <Target size={20} className="text-tier-gold" />,
      bgColor: 'bg-tier-gold/10',
    },
    {
      label: 'Effort Score',
      value: `${avgEffort}%`,
      sublabel: 'Training completion',
      icon: <Zap size={20} className="text-amber-500" />,
      bgColor: 'bg-amber-50',
    },
    {
      label: 'SG Trend',
      value: formatSG(sgTrend),
      sublabel: 'Last week',
      icon: (sgTrend || 0) >= 0
        ? <TrendingUp size={20} className="text-green-500" />
        : <TrendingDown size={20} className="text-red-500" />,
      bgColor: (sgTrend || 0) >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
    {
      label: 'Breaking Points',
      value: `${resolvedCount}/${totalCount}`,
      sublabel: 'Resolved',
      icon: <Award size={20} className="text-tier-gold" />,
      bgColor: 'bg-tier-gold/10',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-tier-border-default overflow-hidden">
      <div className="px-5 py-4 border-b border-tier-border-subtle bg-tier-surface-subtle">
        <h3 className="text-sm font-semibold text-tier-text-secondary uppercase tracking-wide">
          Key Metrics
        </h3>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-tier-border-subtle">
        {stats.map((stat, i) => (
          <div key={i} className="p-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-tier-navy">{stat.value}</div>
                <div className="text-xs text-tier-text-secondary">{stat.label}</div>
                {stat.sublabel && (
                  <div className="text-xs text-tier-text-tertiary mt-0.5">{stat.sublabel}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// EFFORT VS PROGRESS INFO CARD
// =============================================================================

function EffortProgressInfoCard() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <div className="flex gap-3">
        <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-tier-navy mb-1">Effort vs Progress</h4>
          <p className="text-sm text-tier-text-secondary leading-relaxed">
            <strong>Effort</strong> shows how much you've trained (completed sessions).{' '}
            <strong>Progress</strong> shows actual improvement measured through benchmark tests.
            High effort without progress means the training method should be evaluated.
          </p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// EFFORT PROGRESS BAR
// =============================================================================

interface EffortProgressBarProps {
  effort: number;
  progress: number;
}

function EffortProgressBar({ effort, progress }: EffortProgressBarProps) {
  const getProgressColor = (p: number) => {
    if (p >= 80) return 'bg-green-500';
    if (p >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-tier-text-tertiary w-12">Effort</span>
        <div className="flex-1 h-2 bg-tier-surface-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-tier-gold rounded-full transition-all duration-300"
            style={{ width: `${effort}%` }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-tier-text-tertiary w-12">Result</span>
        <div className="flex-1 h-2 bg-tier-surface-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// BREAKING POINT CARD
// =============================================================================

interface BreakingPointCardProps {
  bp: BreakingPoint;
  onClick: () => void;
}

function BreakingPointCard({ bp, onClick }: BreakingPointCardProps) {
  const daysUntilBenchmark = getDaysUntil(bp.nextBenchmarkDue);

  return (
    <div
      onClick={onClick}
      className="p-4 cursor-pointer hover:bg-tier-surface-subtle transition-colors"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${getSeverityColor(bp.severity)}`} />
          <span className="font-semibold text-tier-navy">{bp.specificArea}</span>
        </div>
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(bp.status)}`}>
          {getStatusLabel(bp.status)}
        </span>
      </div>

      <p className="text-sm text-tier-text-secondary mb-2">
        Goal: {bp.targetMeasurement || bp.description}
      </p>

      <EffortProgressBar effort={bp.effortPercent} progress={bp.progressPercent} />

      {daysUntilBenchmark !== null && daysUntilBenchmark > 0 && (
        <div className="flex items-center gap-1.5 mt-3 text-xs text-tier-text-tertiary">
          <Clock size={12} />
          <span>Next benchmark in {daysUntilBenchmark} {daysUntilBenchmark === 1 ? 'day' : 'days'}</span>
        </div>
      )}

      {bp.status === 'awaiting_proof' && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-green-600">
          <CheckCircle2 size={12} />
          <span>Awaiting coach confirmation</span>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// BREAKING POINTS LIST CARD
// =============================================================================

interface BreakingPointsListCardProps {
  breakingPoints: BreakingPoint[];
  onItemClick: (id: string) => void;
}

function BreakingPointsListCard({ breakingPoints, onItemClick }: BreakingPointsListCardProps) {
  const navigate = useNavigate();
  const activeBreakingPoints = breakingPoints.filter(bp => bp.status !== 'resolved');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-tier-border-default overflow-hidden">
      <div className="px-5 py-4 border-b border-tier-border-subtle bg-tier-surface-subtle flex items-center justify-between">
        <h3 className="text-sm font-semibold text-tier-text-secondary uppercase tracking-wide">
          Active Breaking Points ({activeBreakingPoints.length})
        </h3>
        <button
          onClick={() => navigate('/utvikling/breaking-points')}
          className="text-sm text-tier-gold hover:text-tier-gold/80 font-medium flex items-center gap-1"
        >
          View All
          <ChevronRight size={14} />
        </button>
      </div>

      {activeBreakingPoints.length === 0 ? (
        <div className="p-8 text-center">
          <CheckCircle2 size={40} className="mx-auto mb-3 text-green-500" />
          <p className="font-medium text-tier-navy mb-1">No active breaking points!</p>
          <span className="text-sm text-tier-text-tertiary">All your challenges are resolved</span>
        </div>
      ) : (
        <div className="divide-y divide-tier-border-subtle">
          {activeBreakingPoints.map((bp) => (
            <BreakingPointCard
              key={bp.id}
              bp={bp}
              onClick={() => onItemClick(bp.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// STROKES GAINED SUMMARY CARD
// =============================================================================

interface SGSummaryCardProps {
  sgData: any;
}

function SGSummaryCard({ sgData }: SGSummaryCardProps) {
  if (!sgData) return null;

  const categories = sgData.byCategory ? Object.entries(sgData.byCategory) : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-tier-border-default overflow-hidden">
      <div className="px-5 py-4 border-b border-tier-border-subtle bg-tier-surface-subtle flex items-center justify-between">
        <h3 className="text-sm font-semibold text-tier-text-secondary uppercase tracking-wide">
          Strokes Gained Overview
        </h3>
        <Link
          to="/statistikk?tab=strokes-gained"
          className="text-sm text-tier-gold hover:text-tier-gold/80 font-medium flex items-center gap-1"
        >
          Details
          <ChevronRight size={14} />
        </Link>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-tier-border-subtle">
          <span className="text-sm font-medium text-tier-text-secondary">Total SG</span>
          <span className={`text-3xl font-bold ${
            (sgData.total || 0) >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatSG(sgData.total)}
          </span>
        </div>

        <div className="space-y-3">
          {categories.map(([key, cat]: [string, any]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-sm text-tier-text-secondary">
                {key === 'approach' ? 'Approach' : key === 'around_green' ? 'Around Green' : 'Putting'}
              </span>
              <span className={`font-semibold ${
                cat.value >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatSG(cat.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// QUICK LINKS CARD
// =============================================================================

function QuickLinksCard() {
  const links = [
    {
      title: 'My Goals',
      description: 'View and update your goals',
      href: '/maalsetninger',
      icon: <Target size={20} className="text-tier-gold" />,
    },
    {
      title: 'Progress History',
      description: 'See your development over time',
      href: '/progress',
      icon: <TrendingUp size={20} className="text-green-500" />,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-tier-border-default overflow-hidden">
      <div className="px-5 py-4 border-b border-tier-border-subtle bg-tier-surface-subtle">
        <h3 className="text-sm font-semibold text-tier-text-secondary uppercase tracking-wide">
          Explore More
        </h3>
      </div>
      <div className="divide-y divide-tier-border-subtle">
        {links.map((link, i) => (
          <Link
            key={i}
            to={link.href}
            className="flex items-center gap-4 p-4 hover:bg-tier-surface-subtle transition-colors"
          >
            <div className="w-11 h-11 rounded-lg bg-tier-surface-subtle flex items-center justify-center">
              {link.icon}
            </div>
            <div className="flex-1">
              <div className="font-medium text-tier-navy">{link.title}</div>
              <div className="text-sm text-tier-text-tertiary">{link.description}</div>
            </div>
            <ChevronRight size={20} className="text-tier-text-tertiary" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const StatusProgressPage: React.FC = () => {
  useScreenView('Status & Progress');
  const navigate = useNavigate();

  const { data: bpData, loading: bpLoading, error: bpError, refetch: refetchBp } = useBreakingPoints();
  const { data: sgData, loading: sgLoading } = useStrokesGained();

  const isLoading = bpLoading || sgLoading;

  // Calculate summary stats
  const avgProgress = bpData?.summary?.averageProgress || 0;
  const avgEffort = bpData?.summary?.averageEffort || 0;
  const resolvedCount = bpData?.summary?.resolved || 0;
  const totalCount = bpData?.summary?.total || 0;
  const sgTrend = sgData?.trend;

  const action = computeProgressState(bpData, sgData);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <PageHeader
          title="Status & Progress"
          subtitle="Your progression towards goals"
          helpText="Cockpit view for your progression towards goals with focus on Breaking Points."
        />
        <PageContainer paddingY="lg" background="base">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-white rounded-xl" />
            <div className="h-32 bg-white rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-white rounded-xl" />
              <div className="h-64 bg-white rounded-xl" />
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  // Error state
  if (bpError && !bpData) {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <PageHeader
          title="Status & Progress"
          subtitle="Your progression towards goals"
        />
        <PageContainer paddingY="lg" background="base">
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-tier-navy mb-2">Could not load data</h3>
            <p className="text-tier-text-secondary mb-6">{bpError}</p>
            <button
              onClick={refetchBp}
              className="inline-flex items-center gap-2 px-4 py-2 bg-tier-navy text-white rounded-lg hover:bg-tier-navy/90 transition-colors"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Status & Progress"
        subtitle="Your progression towards goals"
        helpText="Cockpit view for your progression towards goals with focus on Breaking Points. KPI dashboard shows average progress towards goals, effort score (training completion), SG trend, and resolved Breaking Points count. Important: Effort (completed sessions) vs Progress (actual improvement via tests) - high effort without progress means training method should be evaluated."
        actions={
          <button
            onClick={refetchBp}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-tier-text-secondary hover:text-tier-navy transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        }
      />

      <PageContainer paddingY="lg" background="base">
        {/* ============================================================
            LAYER 1 — DECISION LAYER (top ~30%)
            Hero card with progress vs effort insight
            ============================================================ */}
        <section className="mb-8" aria-label="Progress summary">
          <StatusHeroDecisionCard
            action={action}
            avgProgress={avgProgress}
            avgEffort={avgEffort}
            resolvedCount={resolvedCount}
            totalCount={totalCount}
          />
        </section>

        {/* ============================================================
            LAYER 2 — CONTROL & PROGRESS (middle ~40%)
            KPI stats + Breaking Points
            ============================================================ */}
        <section className="mb-8 space-y-6" aria-label="Key metrics and breaking points">
          <KPIStatsCard
            avgProgress={avgProgress}
            avgEffort={avgEffort}
            sgTrend={sgTrend}
            resolvedCount={resolvedCount}
            totalCount={totalCount}
          />

          <EffortProgressInfoCard />

          <BreakingPointsListCard
            breakingPoints={bpData?.breakingPoints || []}
            onItemClick={(id) => navigate(`/utvikling/breaking-points?id=${id}`)}
          />
        </section>

        {/* ============================================================
            LAYER 3 — OPERATIONS & ADMIN (bottom ~30%)
            SG summary + Quick links
            ============================================================ */}
        <section aria-label="Additional information">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sgData && <SGSummaryCard sgData={sgData} />}
            <QuickLinksCard />
          </div>
        </section>
      </PageContainer>
    </div>
  );
};

export default StatusProgressPage;
