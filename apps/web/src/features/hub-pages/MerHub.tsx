/**
 * More Hub Page - Decision-First Dashboard
 * Design System v3.1 - McKinsey-grade operating dashboard
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "What communication or admin task needs my attention NOW?"
 *
 * INFORMATION ARCHITECTURE (3-layer model):
 * Layer 1 (30%) — Decision Layer: Hero card with next critical action
 * Layer 2 (40%) — Control & Progress: Messages + Profile status
 * Layer 3 (30%) — Operations & Admin: Settings and resources
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import {
  Mail,
  MessageSquare,
  User,
  Settings,
  BookOpen,
  CreditCard,
  Users,
  ChevronRight,
  AlertCircle,
  Bell,
  Shield,
  HelpCircle,
} from 'lucide-react';

// =============================================================================
// STATE MACHINE - Determines primary action
// =============================================================================

type MoreState =
  | 'unread_messages'       // Messages awaiting response
  | 'new_feedback'          // New feedback from coach
  | 'profile_incomplete'    // Profile needs completion
  | 'all_clear';            // No admin tasks

interface PrimaryAction {
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  urgency: 'high' | 'medium' | 'low';
}

interface MoreStats {
  unreadMessages: number;
  newFeedback: number;
  resources: number;
  profileComplete: boolean;
}

function computeMoreState(stats: MoreStats): { state: MoreState; action: PrimaryAction } {
  // Priority 1: Unread messages
  if (stats.unreadMessages > 0) {
    return {
      state: 'unread_messages',
      action: {
        headline: `${stats.unreadMessages} unread message${stats.unreadMessages > 1 ? 's' : ''}`,
        subtext: 'Check your inbox for important updates',
        ctaLabel: 'View Messages',
        ctaHref: '/mer/meldinger',
        urgency: 'high',
      },
    };
  }

  // Priority 2: New feedback
  if (stats.newFeedback > 0) {
    return {
      state: 'new_feedback',
      action: {
        headline: `${stats.newFeedback} new feedback`,
        subtext: 'Your coach has left feedback for you',
        ctaLabel: 'View Feedback',
        ctaHref: '/mer/feedback',
        urgency: 'medium',
      },
    };
  }

  // Priority 3: Incomplete profile
  if (!stats.profileComplete) {
    return {
      state: 'profile_incomplete',
      action: {
        headline: 'Complete your profile',
        subtext: 'Add missing information to get the most out of the app',
        ctaLabel: 'Edit Profile',
        ctaHref: '/mer/profil',
        urgency: 'medium',
      },
    };
  }

  // Default: All clear
  return {
    state: 'all_clear',
    action: {
      headline: 'All caught up!',
      subtext: 'No pending messages or tasks',
      ctaLabel: 'View Profile',
      ctaHref: '/mer/profil',
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

interface MoreHeroCardProps {
  action: PrimaryAction;
  userName: string;
  totalAttention: number;
}

function MoreHeroDecisionCard({ action, userName, totalAttention }: MoreHeroCardProps) {
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
        {totalAttention > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-medium">
            <Bell size={14} />
            {totalAttention} notification{totalAttention > 1 ? 's' : ''}
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
        <Mail size={18} />
        {action.ctaLabel}
      </Link>
    </div>
  );
}

// =============================================================================
// QUICK STATS CARD
// =============================================================================

interface QuickStatsCardProps {
  stats: MoreStats;
}

function QuickStatsCard({ stats }: QuickStatsCardProps) {
  const statItems = [
    {
      label: 'Unread Messages',
      value: stats.unreadMessages,
      icon: Mail,
      color: stats.unreadMessages > 0 ? 'text-red-600' : 'text-tier-text-secondary',
      bgColor: stats.unreadMessages > 0 ? 'bg-red-50' : 'bg-tier-surface-subtle',
    },
    {
      label: 'New Feedback',
      value: stats.newFeedback,
      icon: MessageSquare,
      color: stats.newFeedback > 0 ? 'text-amber-600' : 'text-tier-text-secondary',
      bgColor: stats.newFeedback > 0 ? 'bg-amber-50' : 'bg-tier-surface-subtle',
    },
    {
      label: 'Resources',
      value: stats.resources,
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <h3 className="text-lg font-semibold text-tier-navy mb-4">Quick Stats</h3>
      <div className="space-y-4">
        {statItems.map((stat, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bgColor} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div className="flex-1">
              <div className="text-sm text-tier-text-secondary">{stat.label}</div>
            </div>
            <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// PROFILE CARD
// =============================================================================

interface ProfileCardProps {
  user: any;
}

function ProfileCard({ user }: ProfileCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <h3 className="text-lg font-semibold text-tier-navy mb-4">Your Profile</h3>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-tier-surface-subtle flex items-center justify-center">
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={user.firstName}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <User size={32} className="text-tier-text-secondary" />
          )}
        </div>
        <div>
          <div className="font-semibold text-tier-navy">
            {user?.firstName} {user?.lastName}
          </div>
          <div className="text-sm text-tier-text-secondary">{user?.email}</div>
        </div>
      </div>
      <Link
        to="/mer/profil"
        className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700"
      >
        Edit Profile
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}

// =============================================================================
// OPERATIONS SECTION
// =============================================================================

function MoreOperationsSection() {
  const sections = [
    {
      title: 'Communication',
      items: [
        { label: 'Messages', href: '/mer/meldinger', icon: Mail, description: 'Your inbox' },
        { label: 'Chat', href: '/mer/chat', icon: MessageSquare, description: 'Real-time chat' },
        { label: 'Coach Feedback', href: '/mer/feedback', icon: MessageSquare, description: 'Feedback from coach' },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'My Profile', href: '/mer/profil', icon: User, description: 'Your profile' },
        { label: 'Coach Team', href: '/mer/trenerteam', icon: Users, description: 'Your coaches' },
        { label: 'Payment', href: '/mer/betaling', icon: CreditCard, description: 'Billing & subscriptions' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { label: 'Settings', href: '/mer/innstillinger', icon: Settings, description: 'App settings' },
        { label: 'Privacy', href: '/mer/deling', icon: Shield, description: 'Sharing settings' },
        { label: 'Support', href: '/mer/support', icon: HelpCircle, description: 'Get help' },
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
                <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600">
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

interface MerHubProps {
  stats?: {
    unreadMessages: number;
    newFeedback: number;
    resources: number;
  };
}

export default function MerHub({
  stats = {
    unreadMessages: 3,
    newFeedback: 2,
    resources: 45,
  },
}: MerHubProps) {
  const { user } = useAuth();
  const userName = user?.firstName || 'Player';

  // TODO: Replace with real API hook
  const moreStats: MoreStats = {
    ...stats,
    profileComplete: Boolean(user?.firstName && user?.lastName && user?.email),
  };

  const { action } = computeMoreState(moreStats);
  const totalAttention = stats.unreadMessages + stats.newFeedback;

  return (
    <div className="min-h-screen bg-tier-surface-base">
      {/* Compact header */}
      <PageHeader
        title="More"
        subtitle="Profile, messages, and settings"
        helpText="Manage your profile, read messages from your coach, and access resources and settings."
      />

      <PageContainer paddingY="lg" background="base">
        {/* ============================================================
            LAYER 1 — DECISION LAYER (top ~30%)
            Hero card with next critical action
            ============================================================ */}
        <section className="mb-8" aria-label="Next action">
          <MoreHeroDecisionCard
            action={action}
            userName={userName}
            totalAttention={totalAttention}
          />
        </section>

        {/* ============================================================
            LAYER 2 — CONTROL & PROGRESS (middle ~40%)
            Quick stats + Profile summary
            ============================================================ */}
        <section className="mb-8" aria-label="Status overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuickStatsCard stats={moreStats} />
            <ProfileCard user={user} />
          </div>
        </section>

        {/* ============================================================
            LAYER 3 — OPERATIONS & ADMIN (bottom ~30%)
            Grouped navigation links
            ============================================================ */}
        <section aria-label="Settings and resources">
          <MoreOperationsSection />
        </section>
      </PageContainer>
    </div>
  );
}
