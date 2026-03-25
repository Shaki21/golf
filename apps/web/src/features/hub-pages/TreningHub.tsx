/**
 * Training Hub Page - Decision-First Dashboard
 * Design System v3.1 - McKinsey-grade operating dashboard
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "What is the most important training action I should take NOW?"
 *
 * INFORMATION ARCHITECTURE (3-layer model):
 * Layer 1 (30%) — Decision Layer: Hero card with next critical action
 * Layer 2 (40%) — Control & Progress: Today's sessions + Training stats
 * Layer 3 (30%) — Operations & Admin: Quick actions and navigation
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import { TodayHero } from '../../components/dashboard/TodayHero';
import { QuickLogModal, useQuickLogModal } from '../../components/modals/QuickLogModal';
import { useTodayData } from '../../hooks/useTodayData';
import { useTrainingHubStats } from '../../hooks/useTrainingHubStats';
import { PAGE_TITLES, ACTION_LABELS } from '../../constants/ui-labels';
import { Button } from '../../components/shadcn/button';
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  Target,
  Dumbbell,
  History,
  Video,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

// =============================================================================
// STATE MACHINE - Determines primary action
// =============================================================================

type TrainingState =
  | 'goal_at_risk'        // A goal is behind schedule
  | 'session_today'       // Sessions planned for today
  | 'log_pending'         // Recent training not logged
  | 'test_due'            // Test scheduled soon
  | 'ready_to_train';     // Default: ready to start

interface PrimaryAction {
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  urgency: 'high' | 'medium' | 'low';
}

function computeTrainingState(
  todayState: any,
  stats: any
): { state: TrainingState; action: PrimaryAction } {
  // Priority 1: Goal at risk (check primary session's goal connection status)
  const hasAtRiskGoal = todayState?.primarySession?.goalConnection?.status === 'at-risk';
  if (hasAtRiskGoal) {
    return {
      state: 'goal_at_risk',
      action: {
        headline: todayState.primarySession?.goalConnection?.goalName
          ? `${todayState.primarySession.goalConnection.goalName} needs attention`
          : 'A goal needs attention',
        subtext: 'Training recommended to stay on track',
        ctaLabel: 'Start Training',
        ctaHref: '/trening/logg',
        urgency: 'high',
      },
    };
  }

  // Priority 2: Session today
  if (todayState?.primarySession || todayState?.plannedToday > 0) {
    return {
      state: 'session_today',
      action: {
        headline: todayState.message || 'Training session today',
        subtext: `${todayState.plannedToday || 1} session${(todayState.plannedToday || 1) > 1 ? 's' : ''} planned`,
        ctaLabel: 'View Session',
        ctaHref: '/trening/okter',
        urgency: 'medium',
      },
    };
  }

  // Priority 3: Test due
  if (stats?.testsCompleted === 0 || todayState?.testDue) {
    return {
      state: 'test_due',
      action: {
        headline: 'Time for a test',
        subtext: 'Track your progress with a skill test',
        ctaLabel: 'Register Test',
        ctaHref: '/trening/testing/registrer',
        urgency: 'medium',
      },
    };
  }

  // Default: Ready to train
  return {
    state: 'ready_to_train',
    action: {
      headline: 'Ready to train',
      subtext: 'Log a session to track your progress',
      ctaLabel: ACTION_LABELS.logSession,
      ctaHref: '/trening/logg',
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

interface TrainingHeroCardProps {
  action: PrimaryAction;
  userName: string;
  attentionCount: number;
  onQuickLog: () => void;
}

function TrainingHeroDecisionCard({
  action,
  userName,
  attentionCount,
  onQuickLog,
}: TrainingHeroCardProps) {
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
        {attentionCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
            <AlertCircle size={14} />
            {attentionCount} needs attention
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

      {/* CTAs */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={action.ctaHref}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-tier-navy text-white font-semibold hover:bg-tier-navy/90 transition-colors shadow-sm"
        >
          <Target size={18} />
          {action.ctaLabel}
        </Link>
        <Button
          onClick={onQuickLog}
          variant="outline"
          className="gap-2"
        >
          <Plus size={16} />
          Quick Log
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// TRAINING STATS CARD
// =============================================================================

interface TrainingStatsCardProps {
  stats: {
    sessionsThisMonth: number;
    hoursTrained: number;
    exercisesCompleted: number;
    testsCompleted: number;
  };
}

function TrainingStatsCard({ stats }: TrainingStatsCardProps) {
  const statItems = [
    { label: 'Sessions this month', value: stats.sessionsThisMonth, icon: Calendar, color: 'text-green-600' },
    { label: 'Hours trained', value: stats.hoursTrained, icon: Clock, color: 'text-blue-600' },
    { label: 'Exercises completed', value: stats.exercisesCompleted, icon: CheckCircle, color: 'text-purple-600' },
    { label: 'Tests completed', value: stats.testsCompleted, icon: Target, color: 'text-amber-600' },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <h3 className="text-lg font-semibold text-tier-navy mb-4">This Month</h3>
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
// OPERATIONS SECTION
// =============================================================================

function TrainingOperationsSection() {
  const operations = [
    { label: 'My Sessions', href: '/trening/okter', icon: Calendar, description: 'View scheduled sessions' },
    { label: 'Training History', href: '/trening/dagbok', icon: History, description: 'View past training' },
    { label: 'Exercise Library', href: '/trening/ovelser', icon: Dumbbell, description: 'Browse exercises' },
    { label: 'Video Analysis', href: '/trening/video', icon: Video, description: 'Review technique videos' },
    { label: 'Test Protocol', href: '/trening/testing', icon: Target, description: 'Skill tests and results' },
  ];

  return (
    <div className="bg-white rounded-xl border border-tier-border-default overflow-hidden">
      <div className="px-5 py-4 border-b border-tier-border-subtle bg-tier-surface-subtle">
        <h3 className="text-sm font-semibold text-tier-text-secondary uppercase tracking-wide">
          Training Tools
        </h3>
      </div>
      <div className="p-2">
        {operations.map((op) => (
          <Link
            key={op.href}
            to={op.href}
            className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-tier-surface-subtle transition-colors"
          >
            <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-green-50 text-green-600">
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

export default function TreningHub() {
  const { user } = useAuth();
  const { todayState, isLoading: isTodayLoading, refresh } = useTodayData();
  const { stats, isLoading: isStatsLoading, error: statsError, refetch } = useTrainingHubStats();
  const quickLogModal = useQuickLogModal();

  const userName = user?.firstName || 'Player';

  // Compute state and action
  const displayStats = stats || {
    sessionsThisMonth: 0,
    hoursTrained: 0,
    exercisesCompleted: 0,
    testsCompleted: 0,
  };

  const { action } = computeTrainingState(todayState, displayStats);

  // Calculate attention count based on primary session goal status
  const attentionCount = todayState?.primarySession?.goalConnection?.status === 'at-risk' ? 1 : 0;

  // Handle quick log completion
  const handleQuickLogComplete = async () => {
    await refresh();
    await refetch();
  };

  // Loading state
  if (isStatsLoading && isTodayLoading) {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <PageHeader
          title={PAGE_TITLES.training}
          subtitle="Your training overview"
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
        title={PAGE_TITLES.training}
        subtitle="Your training overview"
        helpText="Focus on your most important training action. The dashboard prioritizes what you should do based on your goals, sessions, and progress."
      />

      <PageContainer paddingY="lg" background="base">
        {/* Error banner (non-blocking) */}
        {statsError && (
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
          <TrainingHeroDecisionCard
            action={action}
            userName={userName}
            attentionCount={attentionCount}
            onQuickLog={() => quickLogModal.openModal()}
          />
        </section>

        {/* ============================================================
            LAYER 2 — CONTROL & PROGRESS (middle ~40%)
            Today's sessions + Training stats
            ============================================================ */}
        <section className="mb-8" aria-label="Training status">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Sessions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
              <h3 className="text-lg font-semibold text-tier-navy mb-4">Today's Focus</h3>
              <TodayHero
                todayState={todayState}
                isLoading={isTodayLoading}
                variant="compact"
              />
            </div>

            {/* Training Stats */}
            <TrainingStatsCard stats={displayStats} />
          </div>
        </section>

        {/* ============================================================
            LAYER 3 — OPERATIONS & ADMIN (bottom ~30%)
            Quick actions and navigation
            ============================================================ */}
        <section aria-label="Training tools">
          <TrainingOperationsSection />
        </section>
      </PageContainer>

      {/* Quick Log Modal */}
      <QuickLogModal
        isOpen={quickLogModal.isOpen}
        onClose={quickLogModal.closeModal}
        onComplete={handleQuickLogComplete}
        {...quickLogModal.config}
      />
    </div>
  );
}
