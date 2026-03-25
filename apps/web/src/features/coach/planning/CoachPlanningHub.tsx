/**
 * Coach Planning Hub - Decision-First Dashboard
 * Design System v3.1 - McKinsey-grade operating dashboard
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "What planning action should I take NOW for my athletes?"
 *
 * INFORMATION ARCHITECTURE (3-layer model):
 * Layer 1 (30%) — Decision Layer: Hero card with next critical action
 * Layer 2 (40%) — Control & Progress: Player/group list with filters
 * Layer 3 (30%) — Operations & Admin: Planning tools
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import PageHeader from '../../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../../ui/raw-blocks/PageContainer.raw';
import {
  Search,
  ClipboardList,
  Users,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Calendar,
  Clock,
  FileText,
  Plus,
  Target,
  AlertCircle,
} from 'lucide-react';
import { athleteList, groups, type Athlete, type Group } from '../../../lib/coachMockData';

// =============================================================================
// STATE MACHINE - Determines primary action
// =============================================================================

type PlanningState =
  | 'players_without_plan'  // Players needing plans
  | 'plans_expiring'        // Plans expiring soon
  | 'pending_approvals'     // Plans awaiting player approval
  | 'review_needed'         // Plans needing periodic review
  | 'all_plans_current';    // Default: all plans up to date

interface PrimaryAction {
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  urgency: 'high' | 'medium' | 'low';
}

interface PlanningStats {
  playersWithPlan: number;
  playersWithoutPlan: number;
  groupsWithPlan: number;
  groupsWithoutPlan: number;
  plansExpiringSoon: number;
  pendingApprovals: number;
  plansNeedingReview: number;
}

function computePlanningState(stats: PlanningStats): { state: PlanningState; action: PrimaryAction } {
  // Priority 1: Players without plan
  if (stats.playersWithoutPlan > 0) {
    return {
      state: 'players_without_plan',
      action: {
        headline: `${stats.playersWithoutPlan} player${stats.playersWithoutPlan > 1 ? 's' : ''} need${stats.playersWithoutPlan === 1 ? 's' : ''} a plan`,
        subtext: 'Create training plans for athletes without one',
        ctaLabel: 'View Players',
        ctaHref: '#players-list',
        urgency: 'high',
      },
    };
  }

  // Priority 2: Plans expiring soon
  if (stats.plansExpiringSoon > 0) {
    return {
      state: 'plans_expiring',
      action: {
        headline: `${stats.plansExpiringSoon} plan${stats.plansExpiringSoon > 1 ? 's' : ''} expiring soon`,
        subtext: 'Review and extend plans before they expire',
        ctaLabel: 'Review Plans',
        ctaHref: '/coach/plans?filter=expiring',
        urgency: 'high',
      },
    };
  }

  // Priority 3: Pending approvals
  if (stats.pendingApprovals > 0) {
    return {
      state: 'pending_approvals',
      action: {
        headline: `${stats.pendingApprovals} plan${stats.pendingApprovals > 1 ? 's' : ''} awaiting approval`,
        subtext: 'Follow up with players to confirm their plans',
        ctaLabel: 'View Pending',
        ctaHref: '/coach/plans?filter=pending',
        urgency: 'medium',
      },
    };
  }

  // Priority 4: Plans needing review
  if (stats.plansNeedingReview > 0) {
    return {
      state: 'review_needed',
      action: {
        headline: `${stats.plansNeedingReview} plan${stats.plansNeedingReview > 1 ? 's' : ''} need${stats.plansNeedingReview === 1 ? 's' : ''} review`,
        subtext: 'Periodic review recommended for these plans',
        ctaLabel: 'Review Plans',
        ctaHref: '/coach/plans?filter=review',
        urgency: 'medium',
      },
    };
  }

  // Default: All plans current
  return {
    state: 'all_plans_current',
    action: {
      headline: 'All plans are current',
      subtext: `${stats.playersWithPlan} players with active plans`,
      ctaLabel: 'View All Plans',
      ctaHref: '/coach/plans',
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
    <div className="flex items-center gap-4 p-4 bg-tier-white rounded-xl border border-tier-border-default animate-pulse">
      <div className="w-10 h-10 rounded-full bg-tier-border-default" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-tier-border-default rounded w-1/3" />
        <div className="h-3 bg-tier-border-default rounded w-1/4" />
      </div>
      <div className="w-16 h-6 bg-tier-border-default rounded-full" />
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="bg-tier-white rounded-xl border border-tier-border-default p-4 animate-pulse">
      <div className="h-8 bg-tier-border-default rounded w-12 mb-2" />
      <div className="h-4 bg-tier-border-default rounded w-24" />
    </div>
  );
}

// =============================================================================
// HERO DECISION CARD
// =============================================================================

interface PlanningHeroCardProps {
  action: PrimaryAction;
  coachName: string;
  totalPlayers: number;
}

function PlanningHeroDecisionCard({ action, coachName, totalPlayers }: PlanningHeroCardProps) {
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

  const scrollToPlayers = () => {
    const element = document.getElementById('players-list');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`rounded-xl p-6 shadow-sm border ${urgencyColors[action.urgency]}`}>
      {/* Greeting + Badge */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg text-tier-text-secondary">
          {getGreeting()}, <span className="font-semibold text-tier-navy">{coachName}</span>
        </h2>
        {totalPlayers > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
            <Users size={14} />
            {totalPlayers} players
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
        {action.ctaHref === '#players-list' ? (
          <button
            onClick={scrollToPlayers}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-tier-navy text-white font-semibold hover:bg-tier-navy/90 transition-colors shadow-sm"
          >
            <ClipboardList size={18} />
            {action.ctaLabel}
          </button>
        ) : (
          <Link
            to={action.ctaHref}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-tier-navy text-white font-semibold hover:bg-tier-navy/90 transition-colors shadow-sm"
          >
            <ClipboardList size={18} />
            {action.ctaLabel}
          </Link>
        )}
        <Link
          to="/coach/plans/create"
          className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-tier-border-default text-tier-navy font-medium hover:bg-tier-surface-subtle transition-colors"
        >
          <Plus size={16} />
          Create Plan
        </Link>
      </div>
    </div>
  );
}

// =============================================================================
// STATS SUMMARY
// =============================================================================

interface StatsSummaryProps {
  stats: PlanningStats;
  isLoading: boolean;
}

function StatsSummary({ stats, isLoading }: StatsSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-tier-white rounded-xl border border-tier-border-default p-4">
        <div className="text-2xl font-bold text-tier-navy">{stats.playersWithPlan}</div>
        <div className="text-sm text-tier-text-secondary">Players with plan</div>
      </div>
      <div className="bg-tier-white rounded-xl border border-tier-border-default p-4">
        <div className="text-2xl font-bold text-yellow-600">{stats.playersWithoutPlan}</div>
        <div className="text-sm text-tier-text-secondary">Players without plan</div>
      </div>
      <div className="bg-tier-white rounded-xl border border-tier-border-default p-4">
        <div className="text-2xl font-bold text-tier-navy">{stats.groupsWithPlan}</div>
        <div className="text-sm text-tier-text-secondary">Groups with plan</div>
      </div>
      <div className="bg-tier-white rounded-xl border border-tier-border-default p-4">
        <div className="text-2xl font-bold text-yellow-600">{stats.groupsWithoutPlan}</div>
        <div className="text-sm text-tier-text-secondary">Groups without plan</div>
      </div>
    </div>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

type TabType = 'players' | 'groups';
type FilterType = 'all' | 'with_plan' | 'without_plan';

const AVATAR_COLORS = ['bg-tier-navy', 'bg-tier-success', 'bg-tier-warning', 'bg-tier-info'];

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name.split(',')[0]?.substring(0, 2).toUpperCase() || 'XX';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const bgColorClass = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];

  return (
    <div
      className={`rounded-full ${bgColorClass} text-white flex items-center justify-center font-semibold shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}

function PlanStatusBadge({ hasPlan }: { hasPlan: boolean }) {
  if (hasPlan) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
        <CheckCircle size={12} />
        Plan
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
      <AlertTriangle size={12} />
      No plan
    </span>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 font-medium rounded-lg transition-colors ${
        active ? 'bg-tier-navy text-white' : 'bg-tier-surface-base text-tier-text-secondary hover:text-tier-navy'
      }`}
    >
      {children}
    </button>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm rounded-full transition-colors ${
        active ? 'bg-tier-navy text-white' : 'bg-tier-surface-base text-tier-text-secondary hover:bg-tier-border-default'
      }`}
    >
      {children}
    </button>
  );
}

// Athlete card
const AthleteCard = React.memo(({ athlete, onClick }: { athlete: Athlete; onClick: () => void }) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-4 bg-tier-white rounded-xl border border-tier-border-default cursor-pointer hover:border-tier-navy transition-colors"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <Avatar name={athlete.displayName} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-tier-navy truncate">{athlete.displayName}</div>
        <div className="text-sm text-tier-text-secondary">HCP {athlete.hcp.toFixed(1)} • Cat. {athlete.category}</div>
      </div>
      <PlanStatusBadge hasPlan={athlete.hasPlan} />
      <ChevronRight size={18} className="text-tier-text-tertiary shrink-0" />
    </div>
  );
});

// Group card
const GroupCard = React.memo(({ group, onClick }: { group: Group; onClick: () => void }) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-4 bg-tier-white rounded-xl border border-tier-border-default cursor-pointer hover:border-tier-navy transition-colors"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="w-10 h-10 rounded-full bg-tier-navy/10 flex items-center justify-center">
        <Users size={20} className="text-tier-navy" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-tier-navy truncate">{group.name}</div>
        <div className="text-sm text-tier-text-secondary">{group.memberCount} members • {group.type}</div>
      </div>
      <PlanStatusBadge hasPlan={group.hasPlan} />
      <ChevronRight size={18} className="text-tier-text-tertiary shrink-0" />
    </div>
  );
});

// =============================================================================
// OPERATIONS SECTION
// =============================================================================

function PlanningOperationsSection() {
  const sections = [
    {
      title: 'Plans',
      items: [
        { label: 'All Plans', href: '/coach/plans', icon: ClipboardList, description: 'View all training plans' },
        { label: 'Create Plan', href: '/coach/plans/create', icon: Plus, description: 'New training plan' },
        { label: 'Templates', href: '/coach/plans/templates', icon: FileText, description: 'Plan templates' },
      ],
    },
    {
      title: 'Schedule',
      items: [
        { label: 'Calendar', href: '/coach/calendar', icon: Calendar, description: 'View schedule' },
        { label: 'Sessions', href: '/coach/sessions', icon: Target, description: 'Training sessions' },
        { label: 'Bookings', href: '/coach/booking', icon: Clock, description: 'Session bookings' },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
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

export default function CoachPlanningHub() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('players');
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);

  const coachName = user?.firstName || 'Coach';

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  // Calculate stats
  const stats: PlanningStats = useMemo(() => {
    const withPlan = athleteList.filter(a => a.hasPlan).length;
    const withoutPlan = athleteList.filter(a => !a.hasPlan).length;
    const groupsWithPlan = groups.filter(g => g.hasPlan).length;
    const groupsWithoutPlan = groups.filter(g => !g.hasPlan).length;

    return {
      playersWithPlan: withPlan,
      playersWithoutPlan: withoutPlan,
      groupsWithPlan,
      groupsWithoutPlan,
      plansExpiringSoon: 0,
      pendingApprovals: 0,
      plansNeedingReview: 0,
    };
  }, []);

  const { action } = computePlanningState(stats);

  // Filter athletes
  const filteredAthletes = useMemo(() => {
    let result = [...athleteList];
    if (searchTerm) {
      result = result.filter(
        a =>
          a.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (planFilter === 'with_plan') result = result.filter(a => a.hasPlan);
    else if (planFilter === 'without_plan') result = result.filter(a => !a.hasPlan);
    return result.sort((a, b) => a.displayName.localeCompare(b.displayName, 'nb-NO'));
  }, [searchTerm, planFilter]);

  // Filter groups
  const filteredGroups = useMemo(() => {
    let result = [...groups];
    if (searchTerm) {
      result = result.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (planFilter === 'with_plan') result = result.filter(g => g.hasPlan);
    else if (planFilter === 'without_plan') result = result.filter(g => !g.hasPlan);
    return result.sort((a, b) => a.name.localeCompare(b.name, 'nb-NO'));
  }, [searchTerm, planFilter]);

  const handleAthleteClick = (id: string) => navigate(`/coach/athletes/${id}/plan`);
  const handleGroupClick = (id: string) => navigate(`/coach/groups/${id}/plan`);

  return (
    <div className="min-h-screen bg-tier-surface-base">
      {/* Compact header */}
      <PageHeader
        title="Planning"
        subtitle="Manage training plans for players and groups"
        helpText="Create and manage training plans for your athletes. The dashboard shows who needs a plan and which plans need attention."
      />

      <PageContainer paddingY="lg" background="base">
        {/* ============================================================
            LAYER 1 — DECISION LAYER (top ~30%)
            Hero card with next critical action
            ============================================================ */}
        <section className="mb-8" aria-label="Next action">
          {isLoading ? (
            <HeroSkeleton />
          ) : (
            <PlanningHeroDecisionCard
              action={action}
              coachName={coachName}
              totalPlayers={athleteList.length}
            />
          )}
        </section>

        {/* ============================================================
            LAYER 2 — CONTROL & PROGRESS (middle ~40%)
            Stats + Player/Group list with filters
            ============================================================ */}
        <section id="players-list" aria-label="Players and groups">
          {/* Stats Summary */}
          <StatsSummary stats={stats} isLoading={isLoading} />

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <TabButton active={activeTab === 'players'} onClick={() => setActiveTab('players')}>
              <span className="flex items-center gap-2">
                <Users size={18} />
                Players ({athleteList.length})
              </span>
            </TabButton>
            <TabButton active={activeTab === 'groups'} onClick={() => setActiveTab('groups')}>
              <span className="flex items-center gap-2">
                <ClipboardList size={18} />
                Groups ({groups.length})
              </span>
            </TabButton>
          </div>

          {/* Search and filters */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-3 px-4 py-3 bg-tier-white rounded-xl border border-tier-border-default">
              <Search size={20} className="text-tier-text-secondary" />
              <input
                type="text"
                placeholder={activeTab === 'players' ? 'Search for player...' : 'Search for group...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-tier-navy placeholder:text-tier-text-tertiary"
              />
            </div>
            <div className="flex gap-2">
              <FilterChip active={planFilter === 'all'} onClick={() => setPlanFilter('all')}>All</FilterChip>
              <FilterChip active={planFilter === 'with_plan'} onClick={() => setPlanFilter('with_plan')}>With plan</FilterChip>
              <FilterChip active={planFilter === 'without_plan'} onClick={() => setPlanFilter('without_plan')}>Without plan</FilterChip>
            </div>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : activeTab === 'players' ? (
            <div className="space-y-3">
              {filteredAthletes.length === 0 ? (
                <div className="text-center py-12 bg-tier-white rounded-xl border border-tier-border-default">
                  <ClipboardList size={48} className="mx-auto text-tier-text-tertiary mb-3" />
                  <p className="text-tier-text-secondary">No players found</p>
                </div>
              ) : (
                filteredAthletes.map(athlete => (
                  <AthleteCard key={athlete.id} athlete={athlete} onClick={() => handleAthleteClick(athlete.id)} />
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGroups.length === 0 ? (
                <div className="text-center py-12 bg-tier-white rounded-xl border border-tier-border-default">
                  <Users size={48} className="mx-auto text-tier-text-tertiary mb-3" />
                  <p className="text-tier-text-secondary">No groups found</p>
                </div>
              ) : (
                filteredGroups.map(group => (
                  <GroupCard key={group.id} group={group} onClick={() => handleGroupClick(group.id)} />
                ))
              )}
            </div>
          )}

          <p className="text-center text-xs text-tier-text-tertiary mt-4">
            Sorted alphabetically (A-Z)
          </p>
        </section>

        {/* ============================================================
            LAYER 3 — OPERATIONS & ADMIN (bottom ~30%)
            Planning tools
            ============================================================ */}
        <section aria-label="Planning tools">
          <PlanningOperationsSection />
        </section>
      </PageContainer>
    </div>
  );
}
