/**
 * Planner Hub Page - Decision-First Dashboard
 * Design System v3.1 - McKinsey-grade operating dashboard
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "What scheduling action should I take NOW?"
 *
 * INFORMATION ARCHITECTURE (3-layer model):
 * Layer 1 (30%) — Decision Layer: Hero card with next critical action
 * Layer 2 (40%) — Control & Progress: Upcoming events + Plan status
 * Layer 3 (30%) — Operations & Admin: Planning tools
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import {
  Calendar,
  Trophy,
  BookOpen,
  Clock,
  ChevronRight,
  AlertCircle,
  Plus,
  CalendarDays,
  CalendarRange,
  MapPin,
  FileText,
  Target,
} from 'lucide-react';

// =============================================================================
// STATE MACHINE - Determines primary action
// =============================================================================

type PlannerState =
  | 'tournament_approaching'  // Tournament soon needing preparation
  | 'session_to_plan'         // Training sessions need scheduling
  | 'school_deadline'         // School task deadline approaching
  | 'plan_review_needed'      // Annual/training plan needs review
  | 'calendar_organized';     // Default: all planned

interface PrimaryAction {
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  urgency: 'high' | 'medium' | 'low';
}

interface PlannerStats {
  plannedSessions: number;
  upcomingTournaments: number;
  schoolTasks: number;
  periodHours: number;
  tournamentsThisMonth: number;
  unscheduledSessions: number;
  schoolDeadlines: number;
  needsPlanReview: boolean;
}

interface UpcomingEvent {
  id: string;
  title: string;
  type: 'tournament' | 'session' | 'school';
  date: string;
  location?: string;
  daysUntil: number;
}

function computePlannerState(stats: PlannerStats): { state: PlannerState; action: PrimaryAction } {
  // Priority 1: Tournament approaching
  if (stats.tournamentsThisMonth > 0) {
    return {
      state: 'tournament_approaching',
      action: {
        headline: `${stats.tournamentsThisMonth} tournament${stats.tournamentsThisMonth > 1 ? 's' : ''} this month`,
        subtext: 'Review your preparation and travel plans',
        ctaLabel: 'View Tournaments',
        ctaHref: '/planlegger/turneringer',
        urgency: 'high',
      },
    };
  }

  // Priority 2: School deadlines
  if (stats.schoolDeadlines > 0) {
    return {
      state: 'school_deadline',
      action: {
        headline: `${stats.schoolDeadlines} school deadline${stats.schoolDeadlines > 1 ? 's' : ''} coming up`,
        subtext: 'Balance your training with school commitments',
        ctaLabel: 'View School Plan',
        ctaHref: '/planlegger/skoleplan',
        urgency: 'high',
      },
    };
  }

  // Priority 3: Sessions need scheduling
  if (stats.unscheduledSessions > 0) {
    return {
      state: 'session_to_plan',
      action: {
        headline: `${stats.unscheduledSessions} session${stats.unscheduledSessions > 1 ? 's' : ''} need${stats.unscheduledSessions === 1 ? 's' : ''} scheduling`,
        subtext: 'Plan your training to stay on track',
        ctaLabel: 'Schedule Sessions',
        ctaHref: '/planlegger/treningsplan',
        urgency: 'medium',
      },
    };
  }

  // Priority 4: Plan review needed
  if (stats.needsPlanReview) {
    return {
      state: 'plan_review_needed',
      action: {
        headline: 'Time to review your plan',
        subtext: 'Your annual plan needs attention',
        ctaLabel: 'Review Plan',
        ctaHref: '/planlegger/aarsplan',
        urgency: 'medium',
      },
    };
  }

  // Default: Calendar organized
  return {
    state: 'calendar_organized',
    action: {
      headline: 'Calendar is organized!',
      subtext: `${stats.plannedSessions} sessions planned this period`,
      ctaLabel: 'View Calendar',
      ctaHref: '/planlegger/kalender',
      urgency: 'low',
    },
  };
}

// =============================================================================
// HERO DECISION CARD
// =============================================================================

interface PlannerHeroCardProps {
  action: PrimaryAction;
  userName: string;
  periodHours: number;
}

function PlannerHeroDecisionCard({ action, userName, periodHours }: PlannerHeroCardProps) {
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
        {periodHours > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
            <Clock size={14} />
            {periodHours}h planned this period
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
          <Calendar size={18} />
          {action.ctaLabel}
        </Link>
        <Link
          to="/planlegger/opprett"
          className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-tier-border-default text-tier-navy font-medium hover:bg-tier-surface-subtle transition-colors"
        >
          <Plus size={16} />
          Add Event
        </Link>
      </div>
    </div>
  );
}

// =============================================================================
// UPCOMING EVENTS CARD
// =============================================================================

interface UpcomingEventsCardProps {
  events: UpcomingEvent[];
}

function UpcomingEventsCard({ events }: UpcomingEventsCardProps) {
  const getEventIcon = (type: UpcomingEvent['type']) => {
    switch (type) {
      case 'tournament':
        return <Trophy size={16} className="text-amber-600" />;
      case 'school':
        return <BookOpen size={16} className="text-purple-600" />;
      default:
        return <Calendar size={16} className="text-blue-600" />;
    }
  };

  const getEventBg = (type: UpcomingEvent['type']) => {
    switch (type) {
      case 'tournament':
        return 'bg-amber-50';
      case 'school':
        return 'bg-purple-50';
      default:
        return 'bg-blue-50';
    }
  };

  const getUrgencyClass = (daysUntil: number) => {
    if (daysUntil <= 3) return 'text-red-600 font-semibold';
    if (daysUntil <= 7) return 'text-amber-600';
    return 'text-tier-text-secondary';
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-tier-navy">Upcoming Events</h3>
        <Link
          to="/planlegger/kalender"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View Calendar
        </Link>
      </div>
      <div className="space-y-3">
        {events.slice(0, 5).map((event) => (
          <Link
            key={event.id}
            to={`/planlegger/${event.type === 'tournament' ? 'turneringer' : event.type === 'school' ? 'skoleplan' : 'treningsplan'}/${event.id}`}
            className="group flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-tier-surface-subtle transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getEventBg(event.type)}`}>
              {getEventIcon(event.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-tier-navy group-hover:text-tier-navy-dark truncate">
                {event.title}
              </div>
              <div className="flex items-center gap-2 text-xs text-tier-text-secondary">
                <span>{event.date}</span>
                {event.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={10} />
                      {event.location}
                    </span>
                  </>
                )}
              </div>
            </div>
            <span className={`text-xs ${getUrgencyClass(event.daysUntil)}`}>
              {event.daysUntil === 0 ? 'Today' : event.daysUntil === 1 ? 'Tomorrow' : `${event.daysUntil} days`}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// PLAN SUMMARY CARD
// =============================================================================

interface PlanSummaryCardProps {
  stats: PlannerStats;
}

function PlanSummaryCard({ stats }: PlanSummaryCardProps) {
  const summaryItems = [
    {
      label: 'Planned Sessions',
      value: stats.plannedSessions,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Tournaments',
      value: stats.upcomingTournaments,
      icon: Trophy,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'School Tasks',
      value: stats.schoolTasks,
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Period Hours',
      value: `${stats.periodHours}h`,
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <h3 className="text-lg font-semibold text-tier-navy mb-4">Plan Overview</h3>
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

      {/* Quick links */}
      <div className="mt-6 pt-4 border-t border-tier-border-subtle">
        <div className="flex items-center gap-2">
          <Link
            to="/planlegger/aarsplan"
            className="flex-1 text-center py-2 px-3 rounded-lg bg-tier-surface-subtle text-sm font-medium text-tier-navy hover:bg-tier-surface-secondary transition-colors"
          >
            Annual Plan
          </Link>
          <Link
            to="/planlegger/treningsplan"
            className="flex-1 text-center py-2 px-3 rounded-lg bg-tier-surface-subtle text-sm font-medium text-tier-navy hover:bg-tier-surface-secondary transition-colors"
          >
            Training Plan
          </Link>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// OPERATIONS SECTION
// =============================================================================

function PlannerOperationsSection() {
  const sections = [
    {
      title: 'Plans',
      items: [
        { label: 'Annual Plan', href: '/planlegger/aarsplan', icon: CalendarRange, description: 'Long-term planning' },
        { label: 'Training Plan', href: '/planlegger/treningsplan', icon: Target, description: 'Session scheduling' },
        { label: 'School Plan', href: '/planlegger/skoleplan', icon: BookOpen, description: 'School calendar' },
      ],
    },
    {
      title: 'Events',
      items: [
        { label: 'My Tournaments', href: '/plan/turneringer', icon: Trophy, description: 'Competition schedule' },
        { label: 'Calendar', href: '/plan/kalender', icon: CalendarDays, description: 'Full calendar view' },
        { label: 'Add Event', href: '/plan/kalender', icon: Plus, description: 'Create new event' },
      ],
    },
    {
      title: 'Resources',
      items: [
        { label: 'Period Plans', href: '/planlegger/perioder', icon: FileText, description: 'Training periods' },
        { label: 'Templates', href: '/planlegger/maler', icon: FileText, description: 'Plan templates' },
        { label: 'History', href: '/planlegger/historikk', icon: Clock, description: 'Past plans' },
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

interface PlanleggerHubProps {
  stats?: {
    plannedSessions: number;
    upcomingTournaments: number;
    schoolTasks: number;
    periodHours: number;
  };
}

export default function PlanleggerHub({
  stats = {
    plannedSessions: 8,
    upcomingTournaments: 3,
    schoolTasks: 5,
    periodHours: 25,
  },
}: PlanleggerHubProps) {
  const { user } = useAuth();
  const userName = user?.firstName || 'Player';

  // TODO: Replace with real API hook
  const plannerStats: PlannerStats = {
    ...stats,
    tournamentsThisMonth: 1,
    unscheduledSessions: 0,
    schoolDeadlines: 0,
    needsPlanReview: false,
  };

  // Mock upcoming events data
  const upcomingEvents: UpcomingEvent[] = [
    { id: '1', title: 'Junior Championship', type: 'tournament', date: 'Jan 18', location: 'Oslo GK', daysUntil: 6 },
    { id: '2', title: 'Training Session - Putting', type: 'session', date: 'Jan 14', daysUntil: 2 },
    { id: '3', title: 'Math Test', type: 'school', date: 'Jan 15', daysUntil: 3 },
    { id: '4', title: 'Training Session - Long Game', type: 'session', date: 'Jan 16', daysUntil: 4 },
    { id: '5', title: 'Club Tournament', type: 'tournament', date: 'Jan 25', location: 'Bergen GK', daysUntil: 13 },
  ];

  const { action } = computePlannerState(plannerStats);

  return (
    <div className="min-h-screen bg-tier-surface-base">
      {/* Compact header */}
      <PageHeader
        title="Planner"
        subtitle="Plan your training journey"
        helpText="Organize training, school, and tournaments in one place. Keep track of your schedule and stay on top of upcoming events."
      />

      <PageContainer paddingY="lg" background="base">
        {/* ============================================================
            LAYER 1 — DECISION LAYER (top ~30%)
            Hero card with next critical action
            ============================================================ */}
        <section className="mb-8" aria-label="Next action">
          <PlannerHeroDecisionCard
            action={action}
            userName={userName}
            periodHours={stats.periodHours}
          />
        </section>

        {/* ============================================================
            LAYER 2 — CONTROL & PROGRESS (middle ~40%)
            Upcoming events + Plan summary
            ============================================================ */}
        <section className="mb-8" aria-label="Schedule overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UpcomingEventsCard events={upcomingEvents} />
            <PlanSummaryCard stats={plannerStats} />
          </div>
        </section>

        {/* ============================================================
            LAYER 3 — OPERATIONS & ADMIN (bottom ~30%)
            Planning tools
            ============================================================ */}
        <section aria-label="Planning tools">
          <PlannerOperationsSection />
        </section>
      </PageContainer>
    </div>
  );
}
