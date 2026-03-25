/**
 * Coach Analysis Hub Page - Decision-First Dashboard
 * Design System v3.1 - McKinsey-grade operating dashboard
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "What analysis action should I take NOW to improve coaching?"
 *
 * INFORMATION ARCHITECTURE (3-layer model):
 * Layer 1 (30%) — Decision Layer: Hero card with next critical action
 * Layer 2 (40%) — Control & Progress: Statistics + Content overview
 * Layer 3 (30%) — Operations & Admin: Quick actions and navigation
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import { useCoachAnalysisHubStats } from '../../hooks/useCoachAnalysisHubStats';
import {
  BarChart3,
  Dumbbell,
  FileText,
  User,
  ChevronRight,
  AlertCircle,
  Plus,
  TrendingUp,
  Library,
  Target,
  Activity,
} from 'lucide-react';

// =============================================================================
// STATE MACHINE - Determines primary action
// =============================================================================

type AnalysisState =
  | 'new_reports'           // New reports available
  | 'exercises_to_review'   // Exercises needing review
  | 'templates_outdated'    // Templates need updating
  | 'stats_ready'           // Statistics ready to view
  | 'analysis_up_to_date';  // Everything is current

interface PrimaryAction {
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  urgency: 'high' | 'medium' | 'low';
}

function computeAnalysisState(stats: {
  statisticsReports: number;
  myExercises: number;
  sessionTemplates: number;
  exercisesInLibrary: number;
}): { state: AnalysisState; action: PrimaryAction } {
  // Priority 1: New reports available (check if there are reports to review)
  if (stats.statisticsReports > 0) {
    return {
      state: 'new_reports',
      action: {
        headline: `${stats.statisticsReports} report${stats.statisticsReports > 1 ? 's' : ''} available`,
        subtext: 'Review player statistics and progress',
        ctaLabel: 'View Reports',
        ctaHref: '/coach/stats',
        urgency: 'medium',
      },
    };
  }

  // Priority 2: Exercises to review
  if (stats.myExercises === 0 && stats.exercisesInLibrary > 0) {
    return {
      state: 'exercises_to_review',
      action: {
        headline: 'Explore the exercise library',
        subtext: `${stats.exercisesInLibrary} exercises available to add to your collection`,
        ctaLabel: 'Browse Library',
        ctaHref: '/coach/exercises',
        urgency: 'low',
      },
    };
  }

  // Priority 3: Templates to create
  if (stats.sessionTemplates === 0) {
    return {
      state: 'templates_outdated',
      action: {
        headline: 'Create your first template',
        subtext: 'Session templates help you plan faster',
        ctaLabel: 'Create Template',
        ctaHref: '/coach/exercises/templates/create',
        urgency: 'low',
      },
    };
  }

  // Priority 4: Stats ready
  if (stats.statisticsReports === 0 && stats.myExercises > 0) {
    return {
      state: 'stats_ready',
      action: {
        headline: 'View player statistics',
        subtext: 'Analyze performance and track progress',
        ctaLabel: 'View Statistics',
        ctaHref: '/coach/stats',
        urgency: 'low',
      },
    };
  }

  // Default: Analysis up to date
  return {
    state: 'analysis_up_to_date',
    action: {
      headline: 'Analysis tools ready',
      subtext: 'Explore statistics and manage your content',
      ctaLabel: 'View Statistics',
      ctaHref: '/coach/stats',
      urgency: 'low',
    },
  };
}

// =============================================================================
// SKELETON LOADERS
// =============================================================================

function HeroSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-8 w-48 bg-tier-surface-secondary rounded" />
        <div className="h-6 w-24 bg-tier-surface-secondary rounded-full" />
      </div>
      <div className="h-12 w-64 bg-tier-surface-secondary rounded mb-4" />
      <div className="h-5 w-80 bg-tier-surface-secondary rounded mb-6" />
      <div className="h-12 w-40 bg-tier-surface-secondary rounded-lg" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
      <div className="h-6 w-32 bg-tier-surface-secondary rounded mb-4" />
      <div className="space-y-3">
        <div className="h-16 w-full bg-tier-surface-secondary rounded" />
        <div className="h-16 w-full bg-tier-surface-secondary rounded" />
      </div>
    </div>
  );
}

// =============================================================================
// HERO DECISION CARD
// =============================================================================

interface AnalysisHeroCardProps {
  action: PrimaryAction;
  userName: string;
}

function AnalysisHeroDecisionCard({
  action,
  userName,
}: AnalysisHeroCardProps) {
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
      {/* Greeting */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg text-tier-text-secondary">
          {getGreeting()}, <span className="font-semibold text-tier-navy">{userName}</span>
        </h2>
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
          <BarChart3 size={18} />
          {action.ctaLabel}
        </Link>
        <Link
          to="/coach/exercises/templates/create"
          className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-tier-border-default bg-white text-tier-navy font-medium hover:bg-tier-surface-subtle transition-colors"
        >
          <Plus size={16} />
          New Template
        </Link>
      </div>
    </div>
  );
}

// =============================================================================
// ANALYSIS STATS CARD
// =============================================================================

interface AnalysisStatsCardProps {
  stats: {
    exercisesInLibrary: number;
    myExercises: number;
    sessionTemplates: number;
    statisticsReports: number;
  };
}

function AnalysisStatsCard({ stats }: AnalysisStatsCardProps) {
  const statItems = [
    { label: 'Exercises in library', value: stats.exercisesInLibrary, icon: Library, color: 'text-blue-600' },
    { label: 'My exercises', value: stats.myExercises, icon: User, color: 'text-green-600' },
    { label: 'Session templates', value: stats.sessionTemplates, icon: FileText, color: 'text-purple-600' },
    { label: 'Reports', value: stats.statisticsReports, icon: BarChart3, color: 'text-amber-600' },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <h3 className="text-lg font-semibold text-tier-navy mb-4">Content Overview</h3>
      <div className="grid grid-cols-2 gap-4">
        {statItems.map((stat, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-tier-surface-subtle ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <div className="text-xl font-bold text-tier-navy">{stat.value}</div>
              <div className="text-xs text-tier-text-secondary">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// QUICK INSIGHTS CARD
// =============================================================================

function QuickInsightsCard() {
  const insights = [
    {
      label: 'Player Progress',
      description: 'Track improvement over time',
      href: '/coach/stats/progress',
      icon: TrendingUp,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Training Load',
      description: 'Monitor training volume',
      href: '/coach/stats/team',
      icon: Activity,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-tier-navy">Quick Insights</h3>
        <Link
          to="/coach/stats"
          className="text-sm text-tier-gold hover:text-tier-gold-dark transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="space-y-3">
        {insights.map((insight) => (
          <Link
            key={insight.href}
            to={insight.href}
            className="flex items-center gap-3 p-3 bg-tier-surface-subtle rounded-lg hover:bg-tier-surface-secondary transition-colors cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${insight.bgColor} ${insight.iconColor}`}>
              <insight.icon size={20} />
            </div>
            <div className="flex-1">
              <div className="font-medium text-tier-navy">{insight.label}</div>
              <div className="text-sm text-tier-text-secondary">
                {insight.description}
              </div>
            </div>
            <ChevronRight size={16} className="text-tier-text-tertiary" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// OPERATIONS SECTION
// =============================================================================

function AnalysisOperationsSection() {
  const operations = [
    { label: 'Statistics', href: '/coach/stats', icon: BarChart3, description: 'Player statistics and reports' },
    { label: 'Exercise Library', href: '/coach/exercises', icon: Dumbbell, description: 'Browse and manage exercises' },
    { label: 'My Exercises', href: '/coach/exercises/mine', icon: User, description: 'Your custom exercises' },
    { label: 'Session Templates', href: '/coach/exercises/templates', icon: FileText, description: 'Reusable session plans' },
    { label: 'Progress Tracking', href: '/coach/stats/progress', icon: Target, description: 'Player progress reports' },
  ];

  return (
    <div className="bg-white rounded-xl border border-tier-border-default overflow-hidden">
      <div className="px-5 py-4 border-b border-tier-border-subtle bg-tier-surface-subtle">
        <h3 className="text-sm font-semibold text-tier-text-secondary uppercase tracking-wide">
          Analysis Tools
        </h3>
      </div>
      <div className="p-2">
        {operations.map((op) => (
          <Link
            key={op.href}
            to={op.href}
            className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-tier-surface-subtle transition-colors"
          >
            <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
              <op.icon size={18} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-tier-body font-medium text-tier-navy group-hover:text-tier-navy-dark">
                {op.label}
              </div>
              <div className="text-tier-footnote text-tier-text-secondary">
                {op.description}
              </div>
            </div>
            <ChevronRight size={16} className="text-tier-text-tertiary" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CoachAnalyseHub() {
  const { user } = useAuth();
  const { stats, isLoading, error, refetch } = useCoachAnalysisHubStats();

  const userName = user?.firstName || 'Coach';

  // Default stats if API fails
  const displayStats = stats || {
    exercisesInLibrary: 0,
    myExercises: 0,
    sessionTemplates: 0,
    statisticsReports: 0,
  };

  // Compute state and action
  const { action } = computeAnalysisState(displayStats);

  // Loading state
  if (isLoading && !stats) {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <PageHeader
          title="Analysis"
          subtitle="Statistics, exercises and templates"
        />
        <PageContainer paddingY="lg" background="base">
          <section className="mb-8">
            <HeroSkeleton />
          </section>
          <section className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </section>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-surface-base">
      {/* Compact header */}
      <PageHeader
        title="Analysis"
        subtitle="Statistics, exercises and templates"
        helpText="Analyze player data, explore the exercise library and manage your training templates."
      />

      <PageContainer paddingY="lg" background="base">
        {/* Error banner (non-blocking) */}
        {error && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            <span>Could not load live data. Using cached data.</span>
            <button onClick={refetch} className="ml-auto text-amber-600 hover:text-amber-800 underline">
              Retry
            </button>
          </div>
        )}

        {/* ============================================================
            LAYER 1 — DECISION LAYER (top ~30%)
            Hero card with next critical action
            ============================================================ */}
        <section className="mb-8" aria-label="Next action">
          <AnalysisHeroDecisionCard
            action={action}
            userName={userName}
          />
        </section>

        {/* ============================================================
            LAYER 2 — CONTROL & PROGRESS (middle ~40%)
            Statistics + Content overview
            ============================================================ */}
        <section className="mb-8" aria-label="Analysis status">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Insights */}
            <QuickInsightsCard />

            {/* Analysis Stats */}
            <AnalysisStatsCard stats={displayStats} />
          </div>
        </section>

        {/* ============================================================
            LAYER 3 — OPERATIONS & ADMIN (bottom ~30%)
            Quick actions and navigation
            ============================================================ */}
        <section aria-label="Analysis tools">
          <AnalysisOperationsSection />
        </section>
      </PageContainer>
    </div>
  );
}
