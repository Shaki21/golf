/**
 * Today View - Decision-First Dashboard
 * Design System v3.1 - McKinsey-grade operating dashboard
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "What is the single most important thing I should do TODAY?"
 *
 * INFORMATION ARCHITECTURE (3-layer model):
 * Layer 1 (30%) — Decision Layer: Hero card with next critical action
 * Layer 2 (40%) — Control & Progress: Today's goals + Session details
 * Layer 3 (30%) — Operations & Admin: Quick actions
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTodayData } from '../../hooks/useTodayData';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import { QuickLogModal, useQuickLogModal } from '../../components/modals/QuickLogModal';
import { Button } from '../../components/shadcn/button';
import {
  Target,
  Calendar,
  Clock,
  ChevronRight,
  AlertCircle,
  Plus,
  Dumbbell,
  CheckCircle,
  Circle,
  Play,
  BookOpen,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';

// =============================================================================
// STATE MACHINE - Determines primary action
// =============================================================================

type TodayState =
  | 'session_scheduled'     // Training session scheduled for today
  | 'goal_at_risk'          // A goal needs attention today
  | 'session_in_progress'   // Currently in a training session
  | 'session_completed'     // Today's training completed
  | 'no_session_planned';   // No session planned for today

interface PrimaryAction {
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  urgency: 'high' | 'medium' | 'low';
}

interface TodayStats {
  hasSessionToday: boolean;
  sessionInProgress: boolean;
  sessionCompleted: boolean;
  goalsAtRisk: number;
  sessionTitle: string;
  sessionTime: string;
  plannedMinutes: number;
}

function computeTodayState(
  stats: TodayStats,
  todayState: any
): { state: TodayState; action: PrimaryAction } {
  // Priority 1: Goal at risk
  if (stats.goalsAtRisk > 0 || todayState?.primarySession?.goalConnection?.status === 'at-risk') {
    const goalName = todayState?.primarySession?.goalConnection?.goalName;
    return {
      state: 'goal_at_risk',
      action: {
        headline: goalName ? `${goalName} needs attention` : 'A goal needs attention',
        subtext: 'Training recommended today to stay on track',
        ctaLabel: 'Start Training',
        ctaHref: '/trening/logg',
        urgency: 'high',
      },
    };
  }

  // Priority 2: Session in progress
  if (stats.sessionInProgress) {
    return {
      state: 'session_in_progress',
      action: {
        headline: 'Session in progress',
        subtext: stats.sessionTitle || 'Continue your training session',
        ctaLabel: 'Continue Session',
        ctaHref: '/trening/aktiv',
        urgency: 'medium',
      },
    };
  }

  // Priority 3: Session scheduled
  if (stats.hasSessionToday || todayState?.primarySession) {
    return {
      state: 'session_scheduled',
      action: {
        headline: todayState?.message || 'Training session today',
        subtext: todayState?.primarySession?.title || stats.sessionTitle || 'Ready to start your session',
        ctaLabel: 'Start Training',
        ctaHref: '/trening/logg',
        urgency: 'medium',
      },
    };
  }

  // Priority 4: Session completed
  if (stats.sessionCompleted) {
    return {
      state: 'session_completed',
      action: {
        headline: 'Great job today!',
        subtext: 'Your training session is complete',
        ctaLabel: 'View Summary',
        ctaHref: '/trening/dagbok',
        urgency: 'low',
      },
    };
  }

  // Default: No session planned
  return {
    state: 'no_session_planned',
    action: {
      headline: 'No session planned',
      subtext: 'Log a quick session to keep your momentum',
      ctaLabel: 'Quick Log',
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

interface TodayHeroCardProps {
  action: PrimaryAction;
  userName: string;
  plannedMinutes: number;
  onQuickLog: () => void;
}

function TodayHeroDecisionCard({ action, userName, plannedMinutes, onQuickLog }: TodayHeroCardProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
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
        {plannedMinutes > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
            <Clock size={14} />
            {plannedMinutes} min planned
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
          <Play size={18} />
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
// TODAY'S GOALS CARD
// =============================================================================

interface Goal {
  id: string;
  name: string;
  currentProgress: number;
  targetProgress: number;
  unit: string;
  status: 'on_track' | 'at_risk' | 'completed';
}

interface TodayGoalsCardProps {
  goals: Goal[];
}

function TodayGoalsCard({ goals }: TodayGoalsCardProps) {
  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'at_risk':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <Circle size={16} className="text-blue-600" />;
    }
  };

  const getProgressColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'at_risk':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-tier-navy">Today's Goals</h3>
        <Link
          to="/maalsetninger"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
        </Link>
      </div>
      <div className="space-y-4">
        {goals.slice(0, 4).map((goal) => {
          const progressPercent = Math.min(100, Math.round((goal.currentProgress / goal.targetProgress) * 100));
          return (
            <Link
              key={goal.id}
              to="/maalsetninger"
              className="group block"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getStatusIcon(goal.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-tier-navy group-hover:text-tier-navy-dark truncate mb-1">
                    {goal.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-tier-surface-subtle rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(goal.status)} rounded-full transition-all duration-300`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-tier-text-secondary whitespace-nowrap">
                      {goal.currentProgress}/{goal.targetProgress} {goal.unit}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
        {goals.length === 0 && (
          <div className="text-center py-4">
            <Target size={24} className="mx-auto text-tier-text-tertiary mb-2" />
            <p className="text-sm text-tier-text-secondary">No goals set for today</p>
            <Link to="/maalsetninger" className="text-sm text-blue-600 hover:text-blue-700 mt-1 inline-block">
              Create a goal
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// SESSION DETAILS CARD
// =============================================================================

interface SessionDetailsCardProps {
  todayState: any;
  isLoading: boolean;
}

function SessionDetailsCard({ todayState, isLoading }: SessionDetailsCardProps) {
  if (isLoading) {
    return <CardSkeleton />;
  }

  const session = todayState?.primarySession;
  const exercises = session?.exercises || [];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-tier-navy">Session Details</h3>
        <Link
          to="/trening/okter"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View Sessions
        </Link>
      </div>

      {session ? (
        <div className="space-y-4">
          {/* Session info */}
          <div className="flex items-center gap-3 p-3 bg-tier-surface-subtle rounded-lg">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-50 text-green-600">
              <Dumbbell size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-tier-navy truncate">
                {session.title || 'Training Session'}
              </div>
              <div className="text-xs text-tier-text-secondary">
                {session.time || 'Scheduled for today'}
              </div>
            </div>
          </div>

          {/* Exercises preview */}
          {exercises.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-tier-text-secondary uppercase tracking-wide">Exercises</p>
              {exercises.slice(0, 3).map((exercise: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Circle size={8} className="text-tier-text-tertiary" />
                  <span className="text-tier-navy">{exercise.name || exercise}</span>
                </div>
              ))}
              {exercises.length > 3 && (
                <p className="text-xs text-tier-text-secondary">+{exercises.length - 3} more</p>
              )}
            </div>
          )}

          {/* Goal connection */}
          {session.goalConnection && (
            <div className="pt-3 border-t border-tier-border-subtle">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-amber-600" />
                <span className="text-xs text-tier-text-secondary">
                  Connected to: <span className="text-tier-navy font-medium">{session.goalConnection.goalName}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <Calendar size={32} className="mx-auto text-tier-text-tertiary mb-3" />
          <p className="text-sm text-tier-text-secondary mb-2">No session scheduled</p>
          <Link
            to="/trening/logg"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Log a session
          </Link>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// OPERATIONS SECTION
// =============================================================================

function TodayOperationsSection() {
  const quickActions = [
    { label: 'Log Training', href: '/trening/logg', icon: Dumbbell, description: 'Record a session' },
    { label: 'View Plan', href: '/plan', icon: Calendar, description: 'See your training plan' },
    { label: 'My Goals', href: '/maalsetninger', icon: Target, description: 'Track your goals' },
    { label: 'Messages', href: '/mer/meldinger', icon: MessageSquare, description: 'Coach messages' },
    { label: 'Development', href: '/utvikling', icon: TrendingUp, description: 'Your progress' },
    { label: 'Resources', href: '/trening/ovelser', icon: BookOpen, description: 'Exercise library' },
  ];

  return (
    <div className="bg-white rounded-xl border border-tier-border-default overflow-hidden">
      <div className="px-5 py-4 border-b border-tier-border-subtle bg-tier-surface-subtle">
        <h3 className="text-sm font-semibold text-tier-text-secondary uppercase tracking-wide">
          Quick Actions
        </h3>
      </div>
      <div className="p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            to={action.href}
            className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-tier-surface-subtle transition-colors"
          >
            <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-tier-navy/10 text-tier-navy">
              <action.icon size={18} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-tier-body font-medium text-tier-navy group-hover:text-tier-navy-dark">
                {action.label}
              </div>
              <div className="text-tier-footnote text-tier-text-secondary">
                {action.description}
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

export default function TodayView() {
  const { user } = useAuth();
  const { todayState, goals, isLoading, refresh } = useTodayData();
  const quickLogModal = useQuickLogModal();

  const userName = user?.firstName || 'Player';

  // Compute stats from today data
  // Note: sessionInProgress is derived from todayState - when a session has started
  // but completedToday is still 0, the session is in progress
  const hasStartedSession = todayState?.primarySession?.status === 'in_progress';
  const todayStats: TodayStats = {
    hasSessionToday: !!todayState?.primarySession || (todayState?.plannedToday || 0) > 0,
    sessionInProgress: hasStartedSession || false,
    sessionCompleted: (todayState?.completedToday || 0) > 0,
    goalsAtRisk: todayState?.primarySession?.goalConnection?.status === 'at-risk' ? 1 : 0,
    sessionTitle: todayState?.primarySession?.title || '',
    sessionTime: todayState?.primarySession?.time || '',
    plannedMinutes: todayState?.primarySession?.estimatedDuration || 0,
  };

  const { action } = computeTodayState(todayStats, todayState);

  // Transform goals to expected format
  const transformedGoals: Goal[] = goals.map((goal) => ({
    id: goal.id,
    name: goal.name,
    currentProgress: goal.currentProgress,
    targetProgress: goal.targetProgress,
    unit: goal.unit,
    status: goal.currentProgress >= goal.targetProgress
      ? 'completed'
      : goal.currentProgress < goal.targetProgress * 0.5
        ? 'at_risk'
        : 'on_track',
  }));

  // Handle quick log completion
  const handleQuickLogComplete = async () => {
    await refresh();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <PageHeader
          title="Today"
          subtitle="Your focus for today"
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
        title="Today"
        subtitle="Your focus for today"
        helpText="Your personalized training recommendations based on your goals and progress. Focus on the most important action to take today."
      />

      <PageContainer paddingY="lg" background="base">
        {/* ============================================================
            LAYER 1 — DECISION LAYER (top ~30%)
            Hero card with next critical action
            ============================================================ */}
        <section className="mb-8" aria-label="Next action">
          <TodayHeroDecisionCard
            action={action}
            userName={userName}
            plannedMinutes={todayStats.plannedMinutes}
            onQuickLog={() => quickLogModal.openModal()}
          />
        </section>

        {/* ============================================================
            LAYER 2 — CONTROL & PROGRESS (middle ~40%)
            Today's goals + Session details
            ============================================================ */}
        <section className="mb-8" aria-label="Today's overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TodayGoalsCard goals={transformedGoals} />
            <SessionDetailsCard todayState={todayState} isLoading={isLoading} />
          </div>
        </section>

        {/* ============================================================
            LAYER 3 — OPERATIONS & ADMIN (bottom ~30%)
            Quick actions
            ============================================================ */}
        <section aria-label="Quick actions">
          <TodayOperationsSection />
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
