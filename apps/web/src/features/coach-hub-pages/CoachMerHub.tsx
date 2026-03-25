/**
 * Coach More Hub Page - Decision-First Dashboard
 * Design System v3.1 - McKinsey-grade operating dashboard
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "What communication or admin action should I take NOW?"
 *
 * INFORMATION ARCHITECTURE (3-layer model):
 * Layer 1 (30%) — Decision Layer: Hero card with next critical action
 * Layer 2 (40%) — Control & Progress: Messages + Groups overview
 * Layer 3 (30%) — Operations & Admin: Quick actions and navigation
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import { useCoachMerHubStats } from '../../hooks/useCoachMerHubStats';
import {
  MessageSquare,
  Users,
  GitPullRequest,
  Settings,
  ChevronRight,
  AlertCircle,
  PenSquare,
  Bell,
  UserCog,
  HelpCircle,
  Mail,
} from 'lucide-react';

// =============================================================================
// STATE MACHINE - Determines primary action
// =============================================================================

type MoreState =
  | 'unread_messages'       // Unread messages need attention
  | 'change_requests'       // Change requests pending
  | 'group_updates'         // Group updates needed
  | 'settings_review'       // Settings to review
  | 'all_clear';            // Everything is up to date

interface PrimaryAction {
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  urgency: 'high' | 'medium' | 'low';
}

function computeMoreState(stats: {
  ulesteMeldinger: number;
  grupper: number;
  endringsforesporsler: number;
}): { state: MoreState; action: PrimaryAction } {
  // Priority 1: Unread messages
  if (stats.ulesteMeldinger > 0) {
    return {
      state: 'unread_messages',
      action: {
        headline: `${stats.ulesteMeldinger} unread message${stats.ulesteMeldinger > 1 ? 's' : ''}`,
        subtext: 'Players are waiting for your response',
        ctaLabel: 'Read Messages',
        ctaHref: '/coach/messages',
        urgency: 'high',
      },
    };
  }

  // Priority 2: Change requests pending
  if (stats.endringsforesporsler > 0) {
    return {
      state: 'change_requests',
      action: {
        headline: `${stats.endringsforesporsler} change request${stats.endringsforesporsler > 1 ? 's' : ''} pending`,
        subtext: 'Review and approve player requests',
        ctaLabel: 'Review Requests',
        ctaHref: '/coach/modification-requests',
        urgency: 'medium',
      },
    };
  }

  // Priority 3: Group updates (if few groups)
  if (stats.grupper === 0) {
    return {
      state: 'group_updates',
      action: {
        headline: 'Create your first group',
        subtext: 'Organize players into training groups',
        ctaLabel: 'Create Group',
        ctaHref: '/coach/groups/create',
        urgency: 'low',
      },
    };
  }

  // Default: All clear
  return {
    state: 'all_clear',
    action: {
      headline: 'All caught up',
      subtext: 'No pending messages or requests',
      ctaLabel: 'New Message',
      ctaHref: '/coach/messages/compose',
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

interface MoreHeroCardProps {
  action: PrimaryAction;
  userName: string;
  attentionCount: number;
}

function MoreHeroDecisionCard({
  action,
  userName,
  attentionCount,
}: MoreHeroCardProps) {
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
          <MessageSquare size={18} />
          {action.ctaLabel}
        </Link>
        <Link
          to="/coach/messages/compose"
          className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-tier-border-default bg-white text-tier-navy font-medium hover:bg-tier-surface-subtle transition-colors"
        >
          <PenSquare size={16} />
          Compose
        </Link>
      </div>
    </div>
  );
}

// =============================================================================
// MORE STATS CARD
// =============================================================================

interface MoreStatsCardProps {
  stats: {
    ulesteMeldinger: number;
    grupper: number;
    endringsforesporsler: number;
  };
}

function MoreStatsCard({ stats }: MoreStatsCardProps) {
  const statItems = [
    { label: 'Unread messages', value: stats.ulesteMeldinger, icon: MessageSquare, color: 'text-purple-600' },
    { label: 'Groups', value: stats.grupper, icon: Users, color: 'text-blue-600' },
    { label: 'Change requests', value: stats.endringsforesporsler, icon: GitPullRequest, color: 'text-amber-600' },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <h3 className="text-lg font-semibold text-tier-navy mb-4">Overview</h3>
      <div className="grid grid-cols-3 gap-4">
        {statItems.map((stat, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-tier-surface-subtle ${stat.color} mb-2`}>
              <stat.icon size={24} />
            </div>
            <div className="text-2xl font-bold text-tier-navy">{stat.value}</div>
            <div className="text-xs text-tier-text-secondary">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// QUICK ACTIONS CARD
// =============================================================================

function QuickActionsCard() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-tier-navy">Quick Actions</h3>
      </div>

      <div className="space-y-3">
        <Link
          to="/coach/messages/compose"
          className="flex items-center gap-3 p-3 bg-tier-surface-subtle rounded-lg hover:bg-tier-surface-secondary transition-colors"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600">
            <PenSquare size={20} />
          </div>
          <div className="flex-1">
            <div className="font-medium text-tier-navy">Send Message</div>
            <div className="text-sm text-tier-text-secondary">
              Message a player or group
            </div>
          </div>
          <ChevronRight size={16} className="text-tier-text-tertiary" />
        </Link>

        <Link
          to="/coach/groups/create"
          className="flex items-center gap-3 p-3 bg-tier-surface-subtle rounded-lg hover:bg-tier-surface-secondary transition-colors"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
            <Users size={20} />
          </div>
          <div className="flex-1">
            <div className="font-medium text-tier-navy">Create Group</div>
            <div className="text-sm text-tier-text-secondary">
              Organize players into groups
            </div>
          </div>
          <ChevronRight size={16} className="text-tier-text-tertiary" />
        </Link>
      </div>
    </div>
  );
}

// =============================================================================
// OPERATIONS SECTION
// =============================================================================

function MoreOperationsSection() {
  const operations = [
    { label: 'Messages', href: '/coach/messages', icon: MessageSquare, description: 'View all messages' },
    { label: 'Groups', href: '/coach/groups', icon: Users, description: 'Manage training groups' },
    { label: 'Change Requests', href: '/coach/modification-requests', icon: GitPullRequest, description: 'Review pending requests' },
    { label: 'Notifications', href: '/coach/notifications', icon: Bell, description: 'Notification settings' },
    { label: 'Booking Settings', href: '/coach/booking/settings', icon: UserCog, description: 'Your booking preferences' },
    { label: 'Settings', href: '/coach/settings', icon: Settings, description: 'App preferences' },
  ];

  return (
    <div className="bg-white rounded-xl border border-tier-border-default overflow-hidden">
      <div className="px-5 py-4 border-b border-tier-border-subtle bg-tier-surface-subtle">
        <h3 className="text-sm font-semibold text-tier-text-secondary uppercase tracking-wide">
          Settings & Support
        </h3>
      </div>
      <div className="p-2">
        {operations.map((op) => (
          <Link
            key={op.href}
            to={op.href}
            className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-tier-surface-subtle transition-colors"
          >
            <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600">
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

export default function CoachMerHub() {
  const { user } = useAuth();
  const { stats, isLoading, error, refetch } = useCoachMerHubStats();
  const userName = user?.firstName || 'Coach';

  // Use real stats from hook, with defaults for loading state
  const displayStats = {
    ulesteMeldinger: stats?.ulesteMeldinger || 0,
    grupper: stats?.grupper || 0,
    endringsforesporsler: stats?.endringsforesporsler || 0,
  };

  // Compute state and action
  const { action } = computeMoreState(displayStats);

  // Calculate attention count
  const attentionCount = displayStats.ulesteMeldinger + displayStats.endringsforesporsler;

  // Loading state
  if (isLoading && !stats) {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <PageHeader
          title="More"
          subtitle="Messages, groups and settings"
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
        title="More"
        subtitle="Messages, groups and settings"
        helpText="Communicate with players, manage groups and customize your settings."
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
          <MoreHeroDecisionCard
            action={action}
            userName={userName}
            attentionCount={attentionCount}
          />
        </section>

        {/* ============================================================
            LAYER 2 — CONTROL & PROGRESS (middle ~40%)
            Messages + Groups overview
            ============================================================ */}
        <section className="mb-8" aria-label="Communication status">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <QuickActionsCard />

            {/* More Stats */}
            <MoreStatsCard stats={displayStats} />
          </div>
        </section>

        {/* ============================================================
            LAYER 3 — OPERATIONS & ADMIN (bottom ~30%)
            Quick actions and navigation
            ============================================================ */}
        <section aria-label="Settings and support">
          <MoreOperationsSection />
        </section>
      </PageContainer>
    </div>
  );
}
