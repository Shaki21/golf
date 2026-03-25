/**
 * Goals Hub Page - Decision-First Dashboard
 * Design System v3.1 - McKinsey-grade operating dashboard
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "What goal action should I take NOW to stay on track?"
 *
 * INFORMATION ARCHITECTURE (3-layer model):
 * Layer 1 (30%) — Decision Layer: Hero card with next critical action
 * Layer 2 (40%) — Control & Progress: Active goals + Goal progress
 * Layer 3 (30%) — Operations & Admin: Goal management tools
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import {
  Target,
  Flag,
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
  ChevronRight,
  AlertCircle,
  Plus,
  Crosshair,
  Calendar,
} from 'lucide-react';

// =============================================================================
// STATE MACHINE - Determines primary action
// =============================================================================

type GoalsState =
  | 'goal_at_risk'              // A goal is behind schedule
  | 'goal_deadline_approaching' // Deadline coming up
  | 'goal_ready_to_log'         // Action can be logged
  | 'new_goal_needed'           // No active goals
  | 'goals_on_track';           // Default: all good

interface PrimaryAction {
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  urgency: 'high' | 'medium' | 'low';
}

interface GoalsStats {
  activeGoals: number;
  completedGoals: number;
  processGoals: number;
  outcomeGoals: number;
  goalsAtRisk: number;
  goalsNearDeadline: number;
  pendingActions: number;
  overallProgress: number;
}

interface Goal {
  id: string;
  title: string;
  type: 'process' | 'outcome';
  progress: number;
  daysRemaining?: number;
  status: 'on_track' | 'at_risk' | 'completed';
}

function computeGoalsState(stats: GoalsStats): { state: GoalsState; action: PrimaryAction } {
  // Priority 1: Goals at risk
  if (stats.goalsAtRisk > 0) {
    return {
      state: 'goal_at_risk',
      action: {
        headline: `${stats.goalsAtRisk} goal${stats.goalsAtRisk > 1 ? 's' : ''} need${stats.goalsAtRisk === 1 ? 's' : ''} attention`,
        subtext: 'Review your goals and take action to get back on track',
        ctaLabel: 'Review Goals',
        ctaHref: '/maalsetninger',
        urgency: 'high',
      },
    };
  }

  // Priority 2: Deadline approaching
  if (stats.goalsNearDeadline > 0) {
    return {
      state: 'goal_deadline_approaching',
      action: {
        headline: `${stats.goalsNearDeadline} goal${stats.goalsNearDeadline > 1 ? 's' : ''} with upcoming deadline`,
        subtext: 'Deadlines within the next 7 days - make progress now',
        ctaLabel: 'View Goals',
        ctaHref: '/maalsetninger',
        urgency: 'medium',
      },
    };
  }

  // Priority 3: Actions to log
  if (stats.pendingActions > 0) {
    return {
      state: 'goal_ready_to_log',
      action: {
        headline: `${stats.pendingActions} action${stats.pendingActions > 1 ? 's' : ''} ready to log`,
        subtext: 'Log your progress to stay on track with your goals',
        ctaLabel: 'Log Progress',
        ctaHref: '/maalsetninger',
        urgency: 'medium',
      },
    };
  }

  // Priority 4: No active goals
  if (stats.activeGoals === 0) {
    return {
      state: 'new_goal_needed',
      action: {
        headline: 'Set your first goal',
        subtext: 'Create goals to track your development journey',
        ctaLabel: 'Create Goal',
        ctaHref: '/maalsetninger',
        urgency: 'medium',
      },
    };
  }

  // Default: Goals on track
  return {
    state: 'goals_on_track',
    action: {
      headline: 'All goals on track!',
      subtext: `${stats.activeGoals} active goal${stats.activeGoals > 1 ? 's' : ''} progressing well`,
      ctaLabel: 'View Goals',
      ctaHref: '/maalsetninger',
      urgency: 'low',
    },
  };
}

// =============================================================================
// HERO DECISION CARD
// =============================================================================

interface GoalsHeroCardProps {
  action: PrimaryAction;
  userName: string;
  overallProgress: number;
}

function GoalsHeroDecisionCard({ action, userName, overallProgress }: GoalsHeroCardProps) {
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
        {overallProgress > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
            <Target size={14} />
            {overallProgress}% overall progress
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
        <Link
          to="/maalsetninger"
          className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-tier-border-default text-tier-navy font-medium hover:bg-tier-surface-subtle transition-colors"
        >
          <Plus size={16} />
          New Goal
        </Link>
      </div>
    </div>
  );
}

// =============================================================================
// ACTIVE GOALS CARD
// =============================================================================

interface ActiveGoalsCardProps {
  goals: Goal[];
}

function ActiveGoalsCard({ goals }: ActiveGoalsCardProps) {
  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={16} className="text-green-600" />;
      case 'at_risk':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <Circle size={16} className="text-blue-600" />;
    }
  };

  const getStatusColor = (status: Goal['status']) => {
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
        <h3 className="text-lg font-semibold text-tier-navy">Active Goals</h3>
        <Link
          to="/maalsetninger"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
        </Link>
      </div>
      <div className="space-y-4">
        {goals.slice(0, 4).map((goal) => (
          <Link
            key={goal.id}
            to="/maalsetninger"
            className="group block"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getStatusIcon(goal.status)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-tier-navy group-hover:text-tier-navy-dark truncate">
                    {goal.title}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    goal.type === 'outcome' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {goal.type === 'outcome' ? 'Outcome' : 'Process'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-tier-surface-subtle rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStatusColor(goal.status)} rounded-full transition-all duration-300`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-tier-text-secondary">{goal.progress}%</span>
                </div>
                {goal.daysRemaining !== undefined && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-tier-text-secondary">
                    <Clock size={12} />
                    {goal.daysRemaining} days remaining
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// GOALS SUMMARY CARD
// =============================================================================

interface GoalsSummaryCardProps {
  stats: GoalsStats;
}

function GoalsSummaryCard({ stats }: GoalsSummaryCardProps) {
  const summaryItems = [
    {
      label: 'Active Goals',
      value: stats.activeGoals,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Completed',
      value: stats.completedGoals,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Process Goals',
      value: stats.processGoals,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Outcome Goals',
      value: stats.outcomeGoals,
      icon: Crosshair,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <h3 className="text-lg font-semibold text-tier-navy mb-4">Goals Summary</h3>
      <div className="grid grid-cols-2 gap-4">
        {summaryItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.bgColor} ${item.color}`}>
              <item.icon size={20} />
            </div>
            <div>
              <div className="text-xl font-bold text-tier-navy">{item.value}</div>
              <div className="text-xs text-tier-text-secondary">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-6 pt-4 border-t border-tier-border-subtle">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-tier-text-secondary">Overall Progress</span>
          <span className="text-sm font-semibold text-tier-navy">{stats.overallProgress}%</span>
        </div>
        <div className="h-2 bg-tier-surface-subtle rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-300"
            style={{ width: `${stats.overallProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// OPERATIONS SECTION
// =============================================================================

function GoalsOperationsSection() {
  const sections = [
    {
      title: 'My Goals',
      items: [
        { label: 'All Goals', href: '/maalsetninger', icon: Target, description: 'View all your goals' },
        { label: 'Active', href: '/maalsetninger?filter=active', icon: Circle, description: 'Goals in progress' },
        { label: 'Completed', href: '/maalsetninger?filter=completed', icon: CheckCircle2, description: 'Achieved goals' },
      ],
    },
    {
      title: 'Progress',
      items: [
        { label: 'Log Progress', href: '/maalsetninger', icon: TrendingUp, description: 'Update your progress' },
        { label: 'Timeline', href: '/maalsetninger/timeline', icon: Calendar, description: 'Goal timeline view' },
        { label: 'Statistics', href: '/maalsetninger/statistikk', icon: Flag, description: 'Goal analytics' },
      ],
    },
    {
      title: 'Management',
      items: [
        { label: 'Create Goal', href: '/maalsetninger', icon: Plus, description: 'Set a new goal' },
        { label: 'Categories', href: '/maalsetninger/kategorier', icon: Crosshair, description: 'Goal categories' },
        { label: 'Archive', href: '/maalsetninger/arkiv', icon: Clock, description: 'Past goals' },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {sections.map((section) => (
        <div key={section.title} className="bg-white rounded-xl border border-tier-border-default overflow-hidden">
          <div className="px-5 py-4 border-b border-tier-border-subtle bg-tier-surface-subtle">
            <h3 className="text-sm font-semibold text-tier-text-secondary uppercase tracking-wide">
              {section.title}
            </h3>
          </div>
          <div className="p-2">
            {section.items.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-tier-surface-subtle transition-colors"
              >
                <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600">
                  <item.icon size={18} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-tier-body font-medium text-tier-navy group-hover:text-tier-navy-dark">
                    {item.label}
                  </div>
                  <div className="text-tier-footnote text-tier-text-secondary">
                    {item.description}
                  </div>
                </div>
                <ChevronRight size={16} className="text-tier-text-tertiary" />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface MaalsetningerHubProps {
  stats?: {
    activeGoals: number;
    completedGoals: number;
    processGoals: number;
    outcomeGoals: number;
  };
}

export default function MaalsetningerHub({
  stats = {
    activeGoals: 5,
    completedGoals: 12,
    processGoals: 3,
    outcomeGoals: 2,
  },
}: MaalsetningerHubProps) {
  const { user } = useAuth();
  const userName = user?.firstName || 'Player';

  // TODO: Replace with real API hook
  const goalsStats: GoalsStats = {
    ...stats,
    goalsAtRisk: 0,
    goalsNearDeadline: 1,
    pendingActions: 0,
    overallProgress: 68,
  };

  // Mock active goals data
  const activeGoals: Goal[] = [
    { id: '1', title: 'Improve putting accuracy to 85%', type: 'outcome', progress: 72, daysRemaining: 14, status: 'on_track' },
    { id: '2', title: 'Practice 20 hours per month', type: 'process', progress: 65, daysRemaining: 7, status: 'on_track' },
    { id: '3', title: 'Reduce handicap to 5', type: 'outcome', progress: 45, daysRemaining: 30, status: 'on_track' },
    { id: '4', title: 'Complete 10 mental training sessions', type: 'process', progress: 80, daysRemaining: 21, status: 'on_track' },
  ];

  const { action } = computeGoalsState(goalsStats);

  return (
    <div className="min-h-screen bg-tier-surface-base">
      {/* Compact header */}
      <PageHeader
        title="Goals"
        subtitle="Outcome and process goals"
        helpText="Track your goal progress and see how you're advancing towards your targets. Set both outcome and process goals for balanced development."
      />

      <PageContainer paddingY="lg" background="base">
        {/* ============================================================
            LAYER 1 — DECISION LAYER (top ~30%)
            Hero card with next critical action
            ============================================================ */}
        <section className="mb-8" aria-label="Next action">
          <GoalsHeroDecisionCard
            action={action}
            userName={userName}
            overallProgress={goalsStats.overallProgress}
          />
        </section>

        {/* ============================================================
            LAYER 2 — CONTROL & PROGRESS (middle ~40%)
            Active goals + Summary
            ============================================================ */}
        <section className="mb-8" aria-label="Goals overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActiveGoalsCard goals={activeGoals} />
            <GoalsSummaryCard stats={goalsStats} />
          </div>
        </section>

        {/* ============================================================
            LAYER 3 — OPERATIONS & ADMIN (bottom ~30%)
            Goal management tools
            ============================================================ */}
        <section aria-label="Goal tools">
          <GoalsOperationsSection />
        </section>
      </PageContainer>
    </div>
  );
}
