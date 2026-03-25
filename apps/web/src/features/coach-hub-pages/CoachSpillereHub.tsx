/**
 * Coach Players Hub Page - Decision-First Dashboard
 * Design System v3.1 - McKinsey-grade operating dashboard
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "Which player needs my attention right now?"
 *
 * INFORMATION ARCHITECTURE (3-layer model):
 * Layer 1 (30%) — Decision Layer: Hero card with next critical action
 * Layer 2 (40%) — Control & Progress: Players needing attention + Team stats
 * Layer 3 (30%) — Operations & Admin: Player management tools
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import { useCoachSpillereHubStats } from '../../hooks/useCoachSpillereHubStats';
import {
  Users,
  UserCheck,
  ClipboardList,
  CheckCircle,
  ChevronRight,
  AlertCircle,
  UserPlus,
  FileText,
  Award,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
} from 'lucide-react';

// =============================================================================
// STATE MACHINE - Determines primary action
// =============================================================================

type PlayersHubState =
  | 'sessions_need_feedback'  // Players have completed sessions without feedback
  | 'plans_need_update'       // Training plans expiring or need revision
  | 'inactive_players'        // Players with no activity >14 days
  | 'new_players'             // New players need onboarding/setup
  | 'all_healthy';            // All players are on track

interface PrimaryAction {
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  urgency: 'high' | 'medium' | 'low';
}

interface PlayersStats {
  totalPlayers: number;
  activeThisMonth: number;
  trainingPlans: number;
  evaluations: number;
  sessionsNeedingFeedback: number;
  plansExpiringSoon: number;
  inactivePlayers: number;
  newPlayers: number;
}

interface PlayerAttentionItem {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  issue: string;
  issueType: 'feedback' | 'inactive' | 'plan' | 'new';
  daysSince?: number;
}

function computePlayersState(stats: PlayersStats): { state: PlayersHubState; action: PrimaryAction } {
  // Priority 1: Sessions need feedback
  if (stats.sessionsNeedingFeedback > 0) {
    return {
      state: 'sessions_need_feedback',
      action: {
        headline: `${stats.sessionsNeedingFeedback} player${stats.sessionsNeedingFeedback > 1 ? 's' : ''} await${stats.sessionsNeedingFeedback === 1 ? 's' : ''} session feedback`,
        subtext: 'Review completed sessions and provide feedback',
        ctaLabel: 'Review Sessions',
        ctaHref: '/coach/session-evaluations?filter=needs-review',
        urgency: 'high',
      },
    };
  }

  // Priority 2: Plans expiring
  if (stats.plansExpiringSoon > 0) {
    return {
      state: 'plans_need_update',
      action: {
        headline: `${stats.plansExpiringSoon} training plan${stats.plansExpiringSoon > 1 ? 's' : ''} expire${stats.plansExpiringSoon === 1 ? 's' : ''} this week`,
        subtext: 'Update plans to keep players on track',
        ctaLabel: 'Update Plans',
        ctaHref: '/coach/planning?filter=expiring',
        urgency: 'high',
      },
    };
  }

  // Priority 3: Inactive players
  if (stats.inactivePlayers > 0) {
    return {
      state: 'inactive_players',
      action: {
        headline: `${stats.inactivePlayers} player${stats.inactivePlayers > 1 ? 's' : ''} inactive for 2+ weeks`,
        subtext: 'Check in with players who need motivation',
        ctaLabel: 'Check In',
        ctaHref: '/coach/athletes?filter=inactive',
        urgency: 'medium',
      },
    };
  }

  // Priority 4: New players
  if (stats.newPlayers > 0) {
    return {
      state: 'new_players',
      action: {
        headline: `${stats.newPlayers} new player${stats.newPlayers > 1 ? 's' : ''} need${stats.newPlayers === 1 ? 's' : ''} setup`,
        subtext: 'Complete onboarding for new players',
        ctaLabel: 'Complete Onboarding',
        ctaHref: '/coach/athletes?filter=new',
        urgency: 'medium',
      },
    };
  }

  // Default: All healthy
  return {
    state: 'all_healthy',
    action: {
      headline: `All ${stats.totalPlayers} players on track`,
      subtext: 'Great job! Your team is progressing well',
      ctaLabel: 'View Players',
      ctaHref: '/coach/athletes',
      urgency: 'low',
    },
  };
}

// =============================================================================
// HERO DECISION CARD
// =============================================================================

interface PlayersHeroCardProps {
  action: PrimaryAction;
  coachName: string;
  attentionCount: number;
}

function PlayersHeroDecisionCard({ action, coachName, attentionCount }: PlayersHeroCardProps) {
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
          {getGreeting()}, <span className="font-semibold text-tier-navy">{coachName}</span>
        </h2>
        {attentionCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">
            <AlertCircle size={14} />
            {attentionCount} need{attentionCount === 1 ? 's' : ''} attention
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
          <Users size={18} />
          {action.ctaLabel}
        </Link>
        <Link
          to="/coach/groups/create"
          className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-tier-border-default text-tier-navy font-medium hover:bg-tier-surface-subtle transition-colors"
        >
          <UserPlus size={16} />
          Add Player
        </Link>
      </div>
    </div>
  );
}

// =============================================================================
// PLAYERS NEEDING ATTENTION CARD
// =============================================================================

interface PlayersAttentionCardProps {
  players: PlayerAttentionItem[];
}

function PlayersAttentionCard({ players }: PlayersAttentionCardProps) {
  const getIssueIcon = (type: PlayerAttentionItem['issueType']) => {
    switch (type) {
      case 'feedback':
        return <FileText size={14} className="text-amber-600" />;
      case 'inactive':
        return <Clock size={14} className="text-red-600" />;
      case 'plan':
        return <ClipboardList size={14} className="text-purple-600" />;
      case 'new':
        return <UserPlus size={14} className="text-blue-600" />;
    }
  };

  const getIssueBg = (type: PlayerAttentionItem['issueType']) => {
    switch (type) {
      case 'feedback':
        return 'bg-amber-50';
      case 'inactive':
        return 'bg-red-50';
      case 'plan':
        return 'bg-purple-50';
      case 'new':
        return 'bg-blue-50';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-tier-navy">Players Needing Attention</h3>
        <Link
          to="/coach/athletes?filter=attention"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
        </Link>
      </div>
      {players.length === 0 ? (
        <div className="text-center py-6 text-tier-text-secondary">
          <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
          <p>All players are on track!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {players.slice(0, 5).map((player) => (
            <Link
              key={player.id}
              to={`/coach/athletes/${player.id}`}
              className="group flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-tier-surface-subtle transition-colors"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                style={{ backgroundColor: player.avatarColor }}
              >
                {player.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-tier-navy group-hover:text-tier-navy-dark">
                  {player.name}
                </div>
                <div className="flex items-center gap-2 text-xs text-tier-text-secondary">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${getIssueBg(player.issueType)}`}>
                    {getIssueIcon(player.issueType)}
                    {player.issue}
                  </span>
                  {player.daysSince !== undefined && (
                    <span>{player.daysSince}d ago</span>
                  )}
                </div>
              </div>
              <ChevronRight size={16} className="text-tier-text-tertiary" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// TEAM OVERVIEW CARD
// =============================================================================

interface TeamOverviewCardProps {
  stats: PlayersStats;
}

function TeamOverviewCard({ stats }: TeamOverviewCardProps) {
  const overviewItems = [
    {
      label: 'Total Players',
      value: stats.totalPlayers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Active This Month',
      value: stats.activeThisMonth,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Training Plans',
      value: stats.trainingPlans,
      icon: ClipboardList,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Evaluations',
      value: stats.evaluations,
      icon: Award,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <h3 className="text-lg font-semibold text-tier-navy mb-4">Team Overview</h3>
      <div className="grid grid-cols-2 gap-4">
        {overviewItems.map((item, index) => (
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

      {/* Activity indicator */}
      <div className="mt-6 pt-4 border-t border-tier-border-subtle">
        <div className="flex items-center justify-between">
          <span className="text-sm text-tier-text-secondary">Team Activity Rate</span>
          <span className="text-sm font-semibold text-green-600">
            {stats.totalPlayers > 0 ? Math.round((stats.activeThisMonth / stats.totalPlayers) * 100) : 0}%
          </span>
        </div>
        <div className="mt-2 h-2 bg-tier-surface-subtle rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${stats.totalPlayers > 0 ? (stats.activeThisMonth / stats.totalPlayers) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// OPERATIONS SECTION
// =============================================================================

function PlayersOperationsSection() {
  const sections = [
    {
      title: 'Player Management',
      items: [
        { label: 'All Players', href: '/coach/athletes', icon: Users, description: 'View all players' },
        { label: 'Add Player', href: '/coach/groups/create', icon: UserPlus, description: 'Register new player' },
        { label: 'Player Groups', href: '/coach/groups', icon: Users, description: 'Manage groups' },
      ],
    },
    {
      title: 'Training',
      items: [
        { label: 'Training Plans', href: '/coach/planning', icon: ClipboardList, description: 'Manage plans' },
        { label: 'Sessions', href: '/coach/session-evaluations', icon: Activity, description: 'View sessions' },
        { label: 'Templates', href: '/coach/exercises/templates', icon: FileText, description: 'Session templates' },
      ],
    },
    {
      title: 'Evaluation',
      items: [
        { label: 'Evaluations', href: '/coach/session-evaluations', icon: Award, description: 'Player evaluations' },
        { label: 'Progress Reports', href: '/coach/stats/progress', icon: TrendingUp, description: 'Generate reports' },
        { label: 'Benchmarks', href: '/coach/stats/compare', icon: CheckCircle, description: 'Team benchmarks' },
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
                <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-green-50 text-green-600">
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

export default function CoachSpillereHub() {
  const { user } = useAuth();
  const { stats, isLoading, error, refetch } = useCoachSpillereHubStats();
  const coachName = user?.firstName || 'Coach';

  // Map API stats to our interface - now using real data from hook
  const playersStats: PlayersStats = {
    totalPlayers: stats?.totaltSpillere || 0,
    activeThisMonth: stats?.aktiveDenneMnd || 0,
    trainingPlans: stats?.treningsplaner || 0,
    evaluations: stats?.evalueringer || 0,
    sessionsNeedingFeedback: stats?.sessionsNeedingFeedback || 0,
    plansExpiringSoon: stats?.plansExpiringSoon || 0,
    inactivePlayers: stats?.inactivePlayers || 0,
    newPlayers: stats?.newPlayers || 0,
  };

  // Use real players needing attention from hook
  const playersNeedingAttention: PlayerAttentionItem[] = stats?.playersNeedingAttention || [];

  const { action } = computePlayersState(playersStats);
  const attentionCount = playersStats.sessionsNeedingFeedback + playersStats.inactivePlayers + playersStats.plansExpiringSoon;

  // Loading skeleton
  if (isLoading && !stats) {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <PageHeader title="Players" subtitle="Manage athletes and training" />
        <PageContainer paddingY="lg" background="base">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-white rounded-xl" />
            <div className="grid grid-cols-2 gap-6">
              <div className="h-64 bg-white rounded-xl" />
              <div className="h-64 bg-white rounded-xl" />
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Players"
        subtitle="Manage athletes, training plans, and evaluations"
        helpText="Overview of all your players. View status, create training plans and conduct evaluations."
      />

      <PageContainer paddingY="lg" background="base">
        {/* Error banner */}
        {error && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            <span>Could not load live data. Using cached data.</span>
            <button onClick={refetch} className="ml-auto text-amber-600 hover:text-amber-800 underline">
              Retry
            </button>
          </div>
        )}

        {/* Layer 1 - Decision */}
        <section className="mb-8" aria-label="Next action">
          <PlayersHeroDecisionCard
            action={action}
            coachName={coachName}
            attentionCount={attentionCount}
          />
        </section>

        {/* Layer 2 - Control & Progress */}
        <section className="mb-8" aria-label="Team overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PlayersAttentionCard players={playersNeedingAttention} />
            <TeamOverviewCard stats={playersStats} />
          </div>
        </section>

        {/* Layer 3 - Operations */}
        <section aria-label="Player tools">
          <PlayersOperationsSection />
        </section>
      </PageContainer>
    </div>
  );
}
