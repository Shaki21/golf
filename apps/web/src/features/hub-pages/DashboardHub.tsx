/**
 * Dashboard Hub Page - Decision-First Dashboard
 * Design System v3.1 - McKinsey-grade operating dashboard
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "What is the most important action I should take NOW?"
 *
 * INFORMATION ARCHITECTURE (3-layer model):
 * Layer 1 (30%) — Decision Layer: Hero card with next critical action
 * Layer 2 (40%) — Control & Progress: Today's focus + Weekly stats
 * Layer 3 (30%) — Operations & Admin: Quick actions and navigation
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import { useTodayData } from '../../hooks/useTodayData';
import { QuickLogModal, useQuickLogModal } from '../../components/modals/QuickLogModal';
import { Button } from '../../components/shadcn/button';
import {
  Calendar,
  Target,
  MessageSquare,
  User,
  ChevronRight,
  AlertCircle,
  Plus,
  Dumbbell,
  TrendingUp,
  Trophy,
  Clock,
  CheckCircle,
  BookOpen,
  Settings,
} from 'lucide-react';

// =============================================================================
// STATE MACHINE - Determines primary action
// =============================================================================

type DashboardState =
  | 'training_today'      // Session scheduled for today
  | 'goal_at_risk'        // A goal needs attention
  | 'new_message'         // Unread message from coach
  | 'profile_incomplete'  // Profile needs completing
  | 'ready_to_train';     // Default: ready to start

interface PrimaryAction {
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  urgency: 'high' | 'medium' | 'low';
}

interface DashboardStats {
  trainingDays: number;
  upcomingTests: number;
  weeklyGoalProgress: number;
  badges: number;
  hasTrainingToday: boolean;
  goalsAtRisk: number;
  unreadMessages: number;
  profileComplete: boolean;
}

function computeDashboardState(stats: DashboardStats, todayState: any): { state: DashboardState; action: PrimaryAction } {
  // Priority 1: Goal at risk
  if (stats.goalsAtRisk > 0) {
    return {
      state: 'goal_at_risk',
      action: {
        headline: `${stats.goalsAtRisk} goal${stats.goalsAtRisk > 1 ? 's' : ''} need${stats.goalsAtRisk === 1 ? 's' : ''} attention`,
        subtext: 'Review your goals and take action to stay on track',
        ctaLabel: 'Review Goals',
        ctaHref: '/maalsetninger',
        urgency: 'high',
      },
    };
  }

  // Priority 2: Training session today
  if (stats.hasTrainingToday || todayState?.primarySession) {
    return {
      state: 'training_today',
      action: {
        headline: todayState?.message || 'Training session today',
        subtext: todayState?.primarySession?.title || 'Ready to start your scheduled session',
        ctaLabel: 'Start Training',
        ctaHref: '/trening/logg',
        urgency: 'medium',
      },
    };
  }

  // Priority 3: Unread messages
  if (stats.unreadMessages > 0) {
    return {
      state: 'new_message',
      action: {
        headline: `${stats.unreadMessages} new message${stats.unreadMessages > 1 ? 's' : ''}`,
        subtext: 'Check messages from your coach',
        ctaLabel: 'View Messages',
        ctaHref: '/mer/meldinger',
        urgency: 'medium',
      },
    };
  }

  // Priority 4: Profile incomplete
  if (!stats.profileComplete) {
    return {
      state: 'profile_incomplete',
      action: {
        headline: 'Complete your profile',
        subtext: 'Add your details to get personalized training recommendations',
        ctaLabel: 'Edit Profile',
        ctaHref: '/mer/profil',
        urgency: 'low',
      },
    };
  }

  // Default: Ready to train
  return {
    state: 'ready_to_train',
    action: {
      headline: 'Ready to train',
      subtext: 'Log a session to track your progress',
      ctaLabel: 'Log Training',
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

interface DashboardHeroCardProps {
  action: PrimaryAction;
  userName: string;
  weeklyProgress: number;
  onQuickLog: () => void;
}

function DashboardHeroDecisionCard({ action, userName, weeklyProgress, onQuickLog }: DashboardHeroCardProps) {
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
        {weeklyProgress > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
            <TrendingUp size={14} />
            {weeklyProgress}% weekly goal
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
// WEEKLY STATS CARD
// =============================================================================

interface WeeklyStatsCardProps {
  stats: DashboardStats;
}

function WeeklyStatsCard({ stats }: WeeklyStatsCardProps) {
  const statItems = [
    { label: 'Training days', value: stats.trainingDays, icon: Calendar, color: 'text-green-600' },
    { label: 'Upcoming tests', value: stats.upcomingTests, icon: Target, color: 'text-blue-600' },
    { label: 'Weekly goal', value: `${stats.weeklyGoalProgress}%`, icon: CheckCircle, color: 'text-amber-600' },
    { label: 'Badges earned', value: stats.badges, icon: Trophy, color: 'text-purple-600' },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <h3 className="text-lg font-semibold text-tier-navy mb-4">This Week</h3>
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
// TODAY'S FOCUS CARD
// =============================================================================

interface TodayFocusCardProps {
  todayState: any;
  isLoading: boolean;
}

function TodayFocusCard({ todayState, isLoading }: TodayFocusCardProps) {
  if (isLoading) {
    return <CardSkeleton />;
  }

  const focusItems = [
    {
      title: todayState?.primarySession?.title || 'No session planned',
      subtitle: todayState?.primarySession?.time || 'Add a training session',
      icon: Dumbbell,
      href: '/trening/okter',
      color: 'bg-green-50 text-green-600',
    },
    {
      title: todayState?.primarySession?.goalConnection?.goalName || 'Set a goal',
      subtitle: todayState?.primarySession?.goalConnection?.status || 'Connect training to goals',
      icon: Target,
      href: '/maalsetninger',
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-tier-navy">Today's Focus</h3>
        <Link
          to="/trening/plan?view=dag"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View Plan
        </Link>
      </div>
      <div className="space-y-3">
        {focusItems.map((item, index) => (
          <Link
            key={index}
            to={item.href}
            className="group flex items-center gap-3 p-3 -mx-3 rounded-lg hover:bg-tier-surface-subtle transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
              <item.icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-tier-navy group-hover:text-tier-navy-dark truncate">
                {item.title}
              </div>
              <div className="text-xs text-tier-text-secondary truncate">
                {item.subtitle}
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

function DashboardOperationsSection() {
  const sections = [
    {
      title: 'Training',
      items: [
        { label: 'Training', href: '/trening', icon: Dumbbell, description: 'Sessions and exercises' },
        { label: 'My Plan', href: '/plan', icon: Calendar, description: 'Training plan overview' },
        { label: 'Development', href: '/utvikling', icon: TrendingUp, description: 'Progress tracking' },
      ],
    },
    {
      title: 'Goals & Planning',
      items: [
        { label: 'Goals', href: '/maalsetninger', icon: Target, description: 'Outcome and process goals' },
        { label: 'Planner', href: '/plan', icon: Clock, description: 'Schedule management' },
        { label: 'Tournaments', href: '/plan/turneringer', icon: Trophy, description: 'Competition calendar' },
      ],
    },
    {
      title: 'More',
      items: [
        { label: 'Messages', href: '/mer/meldinger', icon: MessageSquare, description: 'Coach communication' },
        { label: 'Profile', href: '/mer/profil', icon: User, description: 'Your information' },
        { label: 'Settings', href: '/mer/innstillinger', icon: Settings, description: 'App preferences' },
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
                <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-tier-navy/10 text-tier-navy">
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

interface DashboardHubProps {
  playerName?: string;
  stats?: {
    trainingDays: number;
    upcomingTests: number;
    weeklyGoalProgress: number;
    badges: number;
  };
}

export default function DashboardHub({
  playerName,
  stats = {
    trainingDays: 12,
    upcomingTests: 2,
    weeklyGoalProgress: 75,
    badges: 8,
  },
}: DashboardHubProps) {
  const { user } = useAuth();
  const { todayState, goals, isLoading: isTodayLoading, refresh } = useTodayData();
  const quickLogModal = useQuickLogModal();

  const userName = playerName || user?.firstName || 'Player';

  // Dashboard stats derived from todayState and goals data
  // When a dedicated dashboard API is available, this can be replaced with useDashboardStats hook
  const goalsAtRiskCount = goals?.filter((g: any) =>
    g.status === 'at_risk' || g.status === 'behind'
  ).length || 0;

  const dashboardStats: DashboardStats = {
    ...stats,
    hasTrainingToday: !!todayState?.primarySession,
    goalsAtRisk: goalsAtRiskCount,
    unreadMessages: 0, // Requires messaging API integration
    profileComplete: !!(user?.firstName && user?.lastName && user?.email),
  };

  const { action } = computeDashboardState(dashboardStats, todayState);

  // Handle quick log completion
  const handleQuickLogComplete = async () => {
    await refresh();
  };

  // Loading state
  if (isTodayLoading) {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <PageHeader
          title="Dashboard"
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
        title="Dashboard"
        subtitle="Your training overview"
        helpText="Your main overview showing the most important action to take. The dashboard prioritizes based on your training schedule, goals, and messages."
      />

      <PageContainer paddingY="lg" background="base">
        {/* ============================================================
            LAYER 1 — DECISION LAYER (top ~30%)
            Hero card with next critical action
            ============================================================ */}
        <section className="mb-8" aria-label="Next action">
          <DashboardHeroDecisionCard
            action={action}
            userName={userName}
            weeklyProgress={stats.weeklyGoalProgress}
            onQuickLog={() => quickLogModal.openModal()}
          />
        </section>

        {/* ============================================================
            LAYER 2 — CONTROL & PROGRESS (middle ~40%)
            Today's focus + Weekly stats
            ============================================================ */}
        <section className="mb-8" aria-label="Today and stats">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TodayFocusCard todayState={todayState} isLoading={isTodayLoading} />
            <WeeklyStatsCard stats={dashboardStats} />
          </div>
        </section>

        {/* ============================================================
            LAYER 3 — OPERATIONS & ADMIN (bottom ~30%)
            Quick navigation
            ============================================================ */}
        <section aria-label="Navigation">
          <DashboardOperationsSection />
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
