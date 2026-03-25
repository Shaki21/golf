/**
 * My Development Hub Page - Decision-First Dashboard
 * Design System v3.1 - McKinsey-grade operating dashboard
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "What development action should I take NOW to improve?"
 *
 * INFORMATION ARCHITECTURE (3-layer model):
 * Layer 1 (30%) — Decision Layer: Hero card with next critical action
 * Layer 2 (40%) — Control & Progress: Skills + Achievements
 * Layer 3 (30%) — Operations & Admin: Development tools
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import {
  TrendingUp,
  Target,
  Award,
  BarChart2,
  ChevronRight,
  AlertCircle,
  Star,
  BookOpen,
  Trophy,
  Zap,
} from 'lucide-react';

// =============================================================================
// STATE MACHINE - Determines primary action
// =============================================================================

type DevelopmentState =
  | 'new_test_available'    // New skill test ready to take
  | 'badge_unlocked'        // Recently unlocked badge to view
  | 'skills_need_work'      // Skill areas below target
  | 'progress_milestone'    // Close to a milestone
  | 'view_progress';        // Default: review development

interface PrimaryAction {
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  urgency: 'high' | 'medium' | 'low';
}

interface DevelopmentStats {
  categoryProgress: number;
  testScore: number;
  badgesEarned: number;
  weeklyImprovement: number;
  newTestsAvailable: number;
  unviewedBadges: number;
  skillsBelowTarget: number;
  progressToNextMilestone: number;
}

function computeDevelopmentState(stats: DevelopmentStats): { state: DevelopmentState; action: PrimaryAction } {
  // Priority 1: Skills needing work
  if (stats.skillsBelowTarget > 0) {
    return {
      state: 'skills_need_work',
      action: {
        headline: `${stats.skillsBelowTarget} skill${stats.skillsBelowTarget > 1 ? 's' : ''} need${stats.skillsBelowTarget === 1 ? 's' : ''} attention`,
        subtext: 'Focus on these areas to improve your overall development',
        ctaLabel: 'View Skills',
        ctaHref: '/utvikling/ferdigheter',
        urgency: 'high',
      },
    };
  }

  // Priority 2: New test available
  if (stats.newTestsAvailable > 0) {
    return {
      state: 'new_test_available',
      action: {
        headline: `${stats.newTestsAvailable} new test${stats.newTestsAvailable > 1 ? 's' : ''} available`,
        subtext: 'Take a skill test to track your progress',
        ctaLabel: 'Start Test',
        ctaHref: '/trening/testing/registrer',
        urgency: 'medium',
      },
    };
  }

  // Priority 3: Badge unlocked
  if (stats.unviewedBadges > 0) {
    return {
      state: 'badge_unlocked',
      action: {
        headline: `You earned ${stats.unviewedBadges} new badge${stats.unviewedBadges > 1 ? 's' : ''}!`,
        subtext: 'View your achievements and celebrate your progress',
        ctaLabel: 'View Badges',
        ctaHref: '/utvikling/badges',
        urgency: 'medium',
      },
    };
  }

  // Priority 4: Close to milestone
  if (stats.progressToNextMilestone >= 80) {
    return {
      state: 'progress_milestone',
      action: {
        headline: 'Almost at your next milestone!',
        subtext: `You're ${stats.progressToNextMilestone}% there - keep going!`,
        ctaLabel: 'View Progress',
        ctaHref: '/utvikling/oversikt',
        urgency: 'medium',
      },
    };
  }

  // Default: View progress
  return {
    state: 'view_progress',
    action: {
      headline: 'Track your development',
      subtext: 'Review your progress and identify areas for growth',
      ctaLabel: 'View Progress',
      ctaHref: '/utvikling/oversikt',
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

// =============================================================================
// HERO DECISION CARD
// =============================================================================

interface DevelopmentHeroCardProps {
  action: PrimaryAction;
  userName: string;
  weeklyImprovement: number;
}

function DevelopmentHeroDecisionCard({ action, userName, weeklyImprovement }: DevelopmentHeroCardProps) {
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
        {weeklyImprovement > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
            <TrendingUp size={14} />
            +{weeklyImprovement}% this week
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
        <TrendingUp size={18} />
        {action.ctaLabel}
      </Link>
    </div>
  );
}

// =============================================================================
// SKILLS PROGRESS CARD
// =============================================================================

interface SkillsProgressCardProps {
  stats: DevelopmentStats;
}

function SkillsProgressCard({ stats }: SkillsProgressCardProps) {
  const skillCategories = [
    { name: 'Long Game', progress: 72, color: 'bg-blue-500' },
    { name: 'Short Game', progress: 85, color: 'bg-green-500' },
    { name: 'Putting', progress: 68, color: 'bg-amber-500' },
    { name: 'Course Management', progress: 54, color: 'bg-purple-500' },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-tier-navy">Skill Progress</h3>
        <Link
          to="/utvikling/ferdigheter"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
        </Link>
      </div>
      <div className="space-y-4">
        {skillCategories.map((skill) => (
          <div key={skill.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-tier-navy">{skill.name}</span>
              <span className="text-sm text-tier-text-secondary">{skill.progress}%</span>
            </div>
            <div className="h-2 bg-tier-surface-subtle rounded-full overflow-hidden">
              <div
                className={`h-full ${skill.color} rounded-full transition-all duration-300`}
                style={{ width: `${skill.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// ACHIEVEMENTS CARD
// =============================================================================

interface AchievementsCardProps {
  stats: DevelopmentStats;
}

function AchievementsCard({ stats }: AchievementsCardProps) {
  const recentBadges = [
    { name: 'Practice Streak', icon: Zap, color: 'text-amber-500 bg-amber-50' },
    { name: 'Putting Pro', icon: Target, color: 'text-green-500 bg-green-50' },
    { name: 'Early Bird', icon: Star, color: 'text-blue-500 bg-blue-50' },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-tier-navy">Achievements</h3>
        <Link
          to="/utvikling/badges"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600">
            <Trophy size={20} />
          </div>
          <div>
            <div className="text-xl font-bold text-tier-navy">{stats.badgesEarned}</div>
            <div className="text-xs text-tier-text-secondary">Badges Earned</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
            <Target size={20} />
          </div>
          <div>
            <div className="text-xl font-bold text-tier-navy">{stats.testScore}</div>
            <div className="text-xs text-tier-text-secondary">Latest Test Score</div>
          </div>
        </div>
      </div>

      {/* Recent badges */}
      <div className="border-t border-tier-border-subtle pt-4">
        <p className="text-xs text-tier-text-secondary mb-3">Recent Badges</p>
        <div className="flex gap-2">
          {recentBadges.map((badge) => (
            <div
              key={badge.name}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${badge.color}`}
            >
              <badge.icon size={14} />
              <span className="text-xs font-medium">{badge.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// OPERATIONS SECTION
// =============================================================================

function DevelopmentOperationsSection() {
  const sections = [
    {
      title: 'Progress',
      items: [
        { label: 'Overview', href: '/utvikling/oversikt', icon: BarChart2, description: 'Your development summary' },
        { label: 'Skills', href: '/utvikling/ferdigheter', icon: Target, description: 'Skill breakdown' },
        { label: 'Statistics', href: '/utvikling/statistikk', icon: TrendingUp, description: 'Detailed stats' },
      ],
    },
    {
      title: 'Achievements',
      items: [
        { label: 'Badges', href: '/utvikling/badges', icon: Award, description: 'Your earned badges' },
        { label: 'Milestones', href: '/utvikling/milestones', icon: Trophy, description: 'Progress milestones' },
        { label: 'Leaderboard', href: '/utvikling/leaderboard', icon: Star, description: 'Compare with others' },
      ],
    },
    {
      title: 'Learning',
      items: [
        { label: 'Skill Tests', href: '/trening/testing', icon: Target, description: 'Take skill tests' },
        { label: 'Resources', href: '/utvikling/resurser', icon: BookOpen, description: 'Learning materials' },
        { label: 'Tips', href: '/utvikling/tips', icon: Zap, description: 'Improvement tips' },
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
                <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
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

interface UtviklingHubProps {
  stats?: {
    categoryProgress: number;
    testScore: number;
    badgesEarned: number;
    weeklyImprovement: number;
  };
}

export default function UtviklingHub({
  stats = {
    categoryProgress: 68,
    testScore: 82,
    badgesEarned: 12,
    weeklyImprovement: 5,
  },
}: UtviklingHubProps) {
  const { user } = useAuth();
  const userName = user?.firstName || 'Player';

  // TODO: Replace with real API hook
  const developmentStats: DevelopmentStats = {
    ...stats,
    newTestsAvailable: 1,
    unviewedBadges: 0,
    skillsBelowTarget: 0,
    progressToNextMilestone: 75,
  };

  const { action } = computeDevelopmentState(developmentStats);

  return (
    <div className="min-h-screen bg-tier-surface-base">
      {/* Compact header */}
      <PageHeader
        title="My Development"
        subtitle="Track your progress and achievements"
        helpText="View your progress, statistics, and earned badges. Analyze your development over time and identify areas for improvement."
      />

      <PageContainer paddingY="lg" background="base">
        {/* ============================================================
            LAYER 1 — DECISION LAYER (top ~30%)
            Hero card with next critical action
            ============================================================ */}
        <section className="mb-8" aria-label="Next action">
          <DevelopmentHeroDecisionCard
            action={action}
            userName={userName}
            weeklyImprovement={stats.weeklyImprovement}
          />
        </section>

        {/* ============================================================
            LAYER 2 — CONTROL & PROGRESS (middle ~40%)
            Skills progress + Achievements
            ============================================================ */}
        <section className="mb-8" aria-label="Progress overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkillsProgressCard stats={developmentStats} />
            <AchievementsCard stats={developmentStats} />
          </div>
        </section>

        {/* ============================================================
            LAYER 3 — OPERATIONS & ADMIN (bottom ~30%)
            Development tools and navigation
            ============================================================ */}
        <section aria-label="Development tools">
          <DevelopmentOperationsSection />
        </section>
      </PageContainer>
    </div>
  );
}
