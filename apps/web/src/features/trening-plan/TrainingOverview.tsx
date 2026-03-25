/**
 * Training Hub Page - Decision-First Dashboard
 * Design System v3.1 - McKinsey-grade operating dashboard
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "What training action should I take NOW?"
 *
 * INFORMATION ARCHITECTURE (3-layer model):
 * Layer 1 (30%) — Decision Layer: Hero card with next critical action
 * Layer 2 (40%) — Control & Progress: Today's focus + Weekly stats
 * Layer 3 (30%) — Operations & Admin: Training navigation
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import { useTodayData } from '../../hooks/useTodayData';
import { QuickLogModal, useQuickLogModal } from '../../components/modals/QuickLogModal';
import { Button } from '../../components/shadcn/button';
import {
  Calendar,
  Target,
  Dumbbell,
  TrendingUp,
  Flame,
  ChevronRight,
  Video,
  FileText,
  Radar,
  Plus,
  Activity,
  Clock,
  Trophy,
} from 'lucide-react';

// =============================================================================
// STATE MACHINE - Determines primary action
// =============================================================================

type TrainingState =
  | 'session_today'      // Session scheduled for today
  | 'weekly_goal_close'  // Close to weekly goal
  | 'streak_active'      // Training streak active
  | 'ready_to_train';    // Default: ready to start

interface PrimaryAction {
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  urgency: 'high' | 'medium' | 'low';
}

interface TrainingStats {
  sessionsThisWeek: number;
  weeklyGoal: number;
  currentStreak: number;
  recordStreak: number;
  totalSessions: number;
  totalHours: number;
  totalExercises: number;
  totalTests: number;
  hasTrainingToday: boolean;
}

function computeTrainingState(stats: TrainingStats, todayState: any): { state: TrainingState; action: PrimaryAction } {
  // Priority 1: Training session today
  if (stats.hasTrainingToday || todayState?.primarySession) {
    return {
      state: 'session_today',
      action: {
        headline: todayState?.primarySession?.title || 'Training session today',
        subtext: 'Ready to start your scheduled session',
        ctaLabel: 'Start Training',
        ctaHref: '/trening/logg',
        urgency: 'high',
      },
    };
  }

  // Priority 2: Close to weekly goal
  const remaining = Math.max(0, stats.weeklyGoal - stats.sessionsThisWeek);
  if (remaining > 0 && remaining <= 2) {
    return {
      state: 'weekly_goal_close',
      action: {
        headline: remaining === 1 ? 'One session to reach your weekly goal!' : `${remaining} sessions to reach your weekly goal`,
        subtext: 'Keep the momentum going',
        ctaLabel: 'Log Training',
        ctaHref: '/trening/logg',
        urgency: 'medium',
      },
    };
  }

  // Priority 3: Streak active
  if (stats.currentStreak >= 3) {
    return {
      state: 'streak_active',
      action: {
        headline: `${stats.currentStreak} day streak! Keep it going`,
        subtext: 'Consistency is key to improvement',
        ctaLabel: 'View Sessions',
        ctaHref: '/trening/sessions',
        urgency: 'medium',
      },
    };
  }

  // Default: Ready to train
  return {
    state: 'ready_to_train',
    action: {
      headline: 'Ready to train',
      subtext: 'Log a session or view your training plan',
      ctaLabel: 'Log Training',
      ctaHref: '/trening/logg',
      urgency: 'low',
    },
  };
}

// =============================================================================
// HERO DECISION CARD
// =============================================================================

interface TrainingHeroCardProps {
  action: PrimaryAction;
  userName: string;
  weeklyProgress: number;
  currentStreak: number;
  recordStreak: number;
  onQuickLog: () => void;
}

function TrainingHeroCard({ action, userName, weeklyProgress, currentStreak, recordStreak, onQuickLog }: TrainingHeroCardProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const urgencyColors = {
    high: 'bg-green-50 border-green-200',
    medium: 'bg-amber-50 border-amber-200',
    low: 'bg-white border-tier-border-default',
  };

  return (
    <div className={`rounded-xl p-6 shadow-sm border ${urgencyColors[action.urgency]}`}>
      {/* Greeting + Streak Badge */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg text-tier-text-secondary">
          {getGreeting()}, <span className="font-semibold text-tier-navy">{userName}</span>
        </h2>
        {currentStreak > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-sm font-medium">
            <Flame size={14} />
            {currentStreak} day streak
            {currentStreak === recordStreak && ' 🔥'}
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
        <a
          href={action.ctaHref}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-tier-navy text-white font-semibold hover:bg-tier-navy/90 transition-colors shadow-sm"
        >
          <Target size={18} />
          {action.ctaLabel}
        </a>
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
  stats: TrainingStats;
}

function WeeklyStatsCard({ stats }: WeeklyStatsCardProps) {
  const weeklyProgress = (stats.sessionsThisWeek / stats.weeklyGoal) * 100;

  const statItems = [
    { label: 'Sessions', value: stats.totalSessions, icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Hours', value: `${stats.totalHours}h`, icon: Clock, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Exercises', value: stats.totalExercises, icon: Dumbbell, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Tests', value: stats.totalTests, icon: Target, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <h3 className="text-lg font-semibold text-tier-navy mb-4">This Week</h3>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {statItems.map((stat, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <div className="text-xl font-bold text-tier-navy">{stat.value}</div>
              <div className="text-xs text-tier-text-secondary">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Progress Bar */}
      <div className="pt-4 border-t border-tier-border-subtle">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-tier-text-secondary">Weekly goal</span>
          <span className="text-sm font-medium text-tier-navy">
            {stats.sessionsThisWeek} / {stats.weeklyGoal}
          </span>
        </div>
        <div className="w-full h-2 bg-tier-surface-subtle rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${Math.min(100, weeklyProgress)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TODAY'S FOCUS CARD
// =============================================================================

interface TodayFocusCardProps {
  todayState: any;
  onStartSession: () => void;
}

function TodayFocusCard({ todayState, onStartSession }: TodayFocusCardProps) {
  if (!todayState?.primarySession) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
        <h3 className="text-lg font-semibold text-tier-navy mb-4">Today's Focus</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-tier-surface-subtle mx-auto mb-3 flex items-center justify-center">
            <Calendar className="text-tier-text-tertiary" size={24} />
          </div>
          <p className="text-tier-text-secondary mb-4">No session planned for today</p>
          <Button onClick={onStartSession} variant="outline" size="sm">
            <Plus size={16} />
            Add Session
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-tier-navy">Today's Focus</h3>
        <a
          href="/trening/plan"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View Plan
        </a>
      </div>
      <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
        <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
          <Dumbbell className="text-green-600" size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-tier-navy mb-1">
            {todayState.primarySession.title}
          </div>
          <div className="text-xs text-tier-text-secondary">
            {todayState.primarySession.time || 'No time set'}
          </div>
        </div>
        <Button onClick={onStartSession} size="sm" className="flex-shrink-0">
          Start
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// OPERATIONS SECTION
// =============================================================================

function TrainingOperationsSection() {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Training',
      color: 'text-green-600',
      items: [
        { label: 'My Sessions', href: '/trening/sessions', icon: Calendar, description: 'Planned sessions' },
        { label: 'My Training Plan', href: '/trening/plan', icon: Target, description: 'Weekly plan' },
      ],
    },
    {
      title: 'Technique Plan',
      color: 'text-purple-600',
      items: [
        { label: 'Technique Plan', href: '/trening/teknikk', icon: FileText, description: 'Technical development' },
        { label: 'Exercise Library', href: '/oevelser', icon: Dumbbell, description: 'All exercises' },
        { label: 'Video', href: '/trening/video', icon: Video, description: 'Videos and comparison' },
        { label: 'TrackMan Sync', href: '/trening/trackman', icon: Radar, description: 'Sync TrackMan data' },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {sections.map((section) => (
        <div key={section.title} className="bg-white rounded-xl border border-tier-border-default overflow-hidden">
          <div className="px-5 py-4 border-b border-tier-border-subtle bg-tier-surface-subtle">
            <h3 className={`text-sm font-semibold uppercase tracking-wide ${section.color}`}>
              {section.title}
            </h3>
          </div>
          <div className="p-2">
            {section.items.map((item) => (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className="group w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-tier-surface-subtle transition-colors"
              >
                <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-tier-navy/10 text-tier-navy flex-shrink-0">
                  <item.icon size={18} />
                </span>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium text-tier-navy group-hover:text-tier-navy-dark">
                    {item.label}
                  </div>
                  <div className="text-xs text-tier-text-secondary truncate">
                    {item.description}
                  </div>
                </div>
                <ChevronRight size={16} className="text-tier-text-tertiary flex-shrink-0" />
              </button>
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

export default function TrainingOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { todayState, isLoading: isTodayLoading, refresh } = useTodayData();
  const quickLogModal = useQuickLogModal();

  const userName = user?.firstName || 'Player';

  // Mock stats - replace with API
  const stats: TrainingStats = {
    sessionsThisWeek: 3,
    weeklyGoal: 5,
    currentStreak: 5,
    recordStreak: 12,
    totalSessions: 15,
    totalHours: 24,
    totalExercises: 87,
    totalTests: 3,
    hasTrainingToday: !!todayState?.primarySession,
  };

  const { action } = computeTrainingState(stats, todayState);

  // Handle quick log completion
  const handleQuickLogComplete = async () => {
    await refresh();
  };

  const weeklyProgress = (stats.sessionsThisWeek / stats.weeklyGoal) * 100;

  return (
    <div className="min-h-screen bg-tier-surface-base">
      {/* Compact header */}
      <PageHeader
        title="Training"
        subtitle="Log training, view sessions, and track progress"
        helpText="Focus on your most important training action. The dashboard prioritizes based on your schedule, weekly goals, and training streak."
      />

      <PageContainer paddingY="lg" background="base">
        {/* ============================================================
            LAYER 1 — DECISION LAYER (top ~30%)
            Hero card with next critical action
            ============================================================ */}
        <section className="mb-8" aria-label="Next action">
          <TrainingHeroCard
            action={action}
            userName={userName}
            weeklyProgress={weeklyProgress}
            currentStreak={stats.currentStreak}
            recordStreak={stats.recordStreak}
            onQuickLog={() => quickLogModal.openModal()}
          />
        </section>

        {/* ============================================================
            LAYER 2 — CONTROL & PROGRESS (middle ~40%)
            Today's focus + Weekly stats
            ============================================================ */}
        <section className="mb-8" aria-label="Today and stats">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TodayFocusCard
              todayState={todayState}
              onStartSession={() => navigate('/trening/logg')}
            />
            <WeeklyStatsCard stats={stats} />
          </div>
        </section>

        {/* ============================================================
            LAYER 3 — OPERATIONS & ADMIN (bottom ~30%)
            Training navigation
            ============================================================ */}
        <section aria-label="Training sections">
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
