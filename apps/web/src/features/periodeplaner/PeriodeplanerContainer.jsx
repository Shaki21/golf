/**
 * TIER Golf - Periodeplaner Container
 * Design System v3.0 - Premium Light
 *
 * Season planning with period cards and week overview.
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar, Target, ChevronDown,
  Snowflake, Sun, Leaf, Flower2, CheckCircle, Clock, Play,
  Dumbbell, Brain, RefreshCw
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionTitle, SubSectionTitle } from '../../components/typography';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { useSessionSync } from '../../hooks/useSessionSync';
import Button from '../../ui/primitives/Button';

// ============================================================================
// DEFAULT/FALLBACK DATA
// ============================================================================

const DEFAULT_PERIODS = [
  {
    id: 'p1',
    name: 'Vintertrening',
    phase: 'off-season',
    startDate: '2025-01-01',
    endDate: '2025-03-15',
    status: 'active',
    progress: 65,
    focus: ['Fysisk grunnlag', 'Tekniske justeringer', 'Mental trening'],
    goals: [
      { id: 'g1', text: 'Oke rotasjonshastighet med 5%', completed: true },
      { id: 'g2', text: 'Forbedre hip-mobil mobilitet', completed: true },
      { id: 'g3', text: 'Gjennomfore 20 simulator-okter', completed: false, current: 14 },
      { id: 'g4', text: 'Lese 2 mentale treningsboker', completed: false, current: 1 },
    ],
    weeklyHours: { technical: 6, physical: 4, mental: 2 },
    keyActivities: ['Simulator-trening', 'Styrketrening', 'Video-analyse', 'Visualisering'],
    coach: 'Anders Kristiansen',
    notes: 'Fokus pa a bygge et sterkt fysisk fundament for sesongen. Spesielt viktig med hoftemobilitet.',
  },
  {
    id: 'p2',
    name: 'Varforberedelse',
    phase: 'pre-season',
    startDate: '2025-03-16',
    endDate: '2025-04-30',
    status: 'upcoming',
    progress: 0,
    focus: ['Banespill', 'Konkurranseforberedelse', 'Kortspill-finpuss'],
    goals: [
      { id: 'g5', text: 'Spille 10 treningsrunder', completed: false },
      { id: 'g6', text: 'Forbedre sand-save % til 50%', completed: false },
      { id: 'g7', text: 'Etablere pre-shot rutine', completed: false },
      { id: 'g8', text: 'Delta pa 2 treningsturneringer', completed: false },
    ],
    weeklyHours: { technical: 10, physical: 3, mental: 2 },
    keyActivities: ['Banespill', 'Short game', 'Treningsturneringer', 'Mentaltrening'],
    coach: 'Anders Kristiansen',
    notes: 'Gradvis overgang fra innendors til utendors. Prioriter kortspill og putting.',
  },
  {
    id: 'p3',
    name: 'Konkurransesesong',
    phase: 'competition',
    startDate: '2025-05-01',
    endDate: '2025-09-15',
    status: 'upcoming',
    progress: 0,
    focus: ['Turneringsprestasjoner', 'Score-fokus', 'Recovery'],
    goals: [
      { id: 'g9', text: 'Topp 10 i NM Junior', completed: false },
      { id: 'g10', text: 'Senke handicap til +2', completed: false },
      { id: 'g11', text: 'Vinne minst 2 klubbturneringer', completed: false },
      { id: 'g12', text: 'Gjennomsnittsscore under 74', completed: false },
    ],
    weeklyHours: { technical: 8, physical: 2, mental: 3 },
    keyActivities: ['Turneringer', 'Treningsrunder', 'Recovery', 'Turneringsanalyse'],
    coach: 'Anders Kristiansen',
    notes: 'Hovedfokus pa a prestere i turneringer. Balansere trening med recovery.',
  },
  {
    id: 'p4',
    name: 'Hostperiode',
    phase: 'transition',
    startDate: '2025-09-16',
    endDate: '2025-11-30',
    status: 'upcoming',
    progress: 0,
    focus: ['Sesongevaluering', 'Tekniske endringer', 'Planlegging'],
    goals: [
      { id: 'g13', text: 'Gjennomfore sesongevaluering med trener', completed: false },
      { id: 'g14', text: 'Identifisere 3 forbedringsomrader', completed: false },
      { id: 'g15', text: 'Sette mal for 2026', completed: false },
      { id: 'g16', text: 'Starte pa tekniske justeringer', completed: false },
    ],
    weeklyHours: { technical: 6, physical: 3, mental: 1 },
    keyActivities: ['Analyse', 'Teknikkarbeid', 'Planlegging', 'Lett trening'],
    coach: 'Anders Kristiansen',
    notes: 'Tid for refleksjon og planlegging. Start arbeid med eventuelle swing-endringer.',
  },
];

const CURRENT_WEEK_PLAN = {
  week: 3,
  periodId: 'p1',
  theme: 'Rotasjonskraft',
  sessions: [
    { day: 'Mandag', type: 'Styrke', duration: 60, focus: 'Bein og core', completed: true },
    { day: 'Tirsdag', type: 'Simulator', duration: 90, focus: 'Driver og lange jern', completed: true },
    { day: 'Onsdag', type: 'Hvile', duration: 0, focus: 'Aktiv restitusjon', completed: true },
    { day: 'Torsdag', type: 'Teknikk', duration: 120, focus: 'Video-analyse + drill', completed: false },
    { day: 'Fredag', type: 'Mental', duration: 45, focus: 'Visualisering', completed: false },
    { day: 'Lordag', type: 'Simulator', duration: 120, focus: '18 hull simulert runde', completed: false },
    { day: 'Sondag', type: 'Hvile', duration: 0, focus: 'Hvile', completed: false },
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Get start of current week (Monday)
const getWeekStart = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

// Get end of current week (Sunday)
const getWeekEnd = () => {
  const weekStart = getWeekStart();
  const sunday = new Date(weekStart);
  sunday.setDate(sunday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
};

// Get current week number
const getWeekNumber = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
};

// Day names mapping
const DAY_NAMES = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];

// Transform sessions from API to week plan format
const transformSessionsToWeekPlan = (sessions) => {
  // Group sessions by day
  const sessionsByDay = {};
  const weekStart = getWeekStart();

  // Initialize all days
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const dayName = DAY_NAMES[date.getDay()];
    sessionsByDay[dayName] = {
      day: dayName,
      type: 'Hvile',
      duration: 0,
      focus: 'Hvile',
      completed: false,
    };
  }

  // Map sessions to days
  sessions.forEach(session => {
    const sessionDate = new Date(session.sessionDate);
    const dayName = DAY_NAMES[sessionDate.getDay()];

    // Determine session type label
    const typeLabels = {
      'teknikk': 'Teknikk',
      'fysisk': 'Styrke',
      'mental': 'Mental',
      'spill': 'Banespill',
      'hvile': 'Hvile',
    };

    sessionsByDay[dayName] = {
      day: dayName,
      type: typeLabels[session.sessionType] || session.sessionType,
      duration: session.duration || session.plannedDuration || 60,
      focus: session.focusArea || session.notes || session.sessionType,
      completed: session.status === 'completed',
    };
  });

  // Convert to array in weekday order
  const orderedDays = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];
  const weekSessions = orderedDays.map(day => sessionsByDay[day]);

  return {
    week: getWeekNumber(),
    periodId: sessions[0]?.dailyAssignmentId || 'current',
    theme: 'Denne ukens plan',
    sessions: weekSessions,
  };
};

const formatDateRange = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const startStr = startDate.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
  const endStr = endDate.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
  return `${startStr} - ${endStr}`;
};

const getPhaseConfig = (phase) => {
  switch (phase) {
    case 'off-season':
      return {
        label: 'Off-season',
        colorClasses: { bg: 'bg-tier-navy/15', text: 'text-tier-navy', fill: 'bg-tier-navy' },
        icon: Snowflake,
        description: 'Grunnlagsperiode',
      };
    case 'pre-season':
      return {
        label: 'Forberedelse',
        colorClasses: { bg: 'bg-tier-success/15', text: 'text-tier-success', fill: 'bg-tier-success' },
        icon: Flower2,
        description: 'Oppkjoring',
      };
    case 'competition':
      return {
        label: 'Konkurranse',
        colorClasses: { bg: 'bg-amber-500/15', text: 'text-amber-600', fill: 'bg-amber-500' },
        icon: Sun,
        description: 'Turneringssesong',
      };
    case 'transition':
      return {
        label: 'Overgang',
        colorClasses: { bg: 'bg-tier-warning/15', text: 'text-tier-warning', fill: 'bg-tier-warning' },
        icon: Leaf,
        description: 'Evaluering og planlegging',
      };
    default:
      return {
        label: phase,
        colorClasses: { bg: 'bg-tier-surface-base', text: 'text-tier-text-secondary', fill: 'bg-tier-text-secondary' },
        icon: Calendar,
        description: '',
      };
  }
};

const getStatusConfig = (status) => {
  switch (status) {
    case 'active':
      return { label: 'Aktiv', colorClasses: { bg: 'bg-tier-success/15', text: 'text-tier-success' }, icon: Play };
    case 'upcoming':
      return { label: 'Kommende', colorClasses: { bg: 'bg-tier-surface-base', text: 'text-tier-text-secondary' }, icon: Clock };
    case 'completed':
      return { label: 'Fullfort', colorClasses: { bg: 'bg-tier-navy/15', text: 'text-tier-navy' }, icon: CheckCircle };
    default:
      return { label: status, colorClasses: { bg: 'bg-tier-surface-base', text: 'text-tier-text-secondary' }, icon: Clock };
  }
};

const getSessionTypeConfig = (type) => {
  switch (type) {
    case 'Styrke':
      return { colorClasses: { bg: 'bg-tier-error/15', text: 'text-tier-error' }, icon: Dumbbell };
    case 'Simulator':
    case 'Teknikk':
      return { colorClasses: { bg: 'bg-tier-navy/15', text: 'text-tier-navy' }, icon: Target };
    case 'Mental':
      return { colorClasses: { bg: 'bg-amber-500/15', text: 'text-amber-600' }, icon: Brain };
    case 'Hvile':
      return { colorClasses: { bg: 'bg-tier-surface-base', text: 'text-tier-text-secondary' }, icon: Clock };
    default:
      return { colorClasses: { bg: 'bg-tier-surface-base', text: 'text-tier-text-secondary' }, icon: Calendar };
  }
};

// ============================================================================
// PERIOD CARD COMPONENT
// ============================================================================

const PeriodCard = ({ period, isExpanded, onToggle }) => {
  const phaseConfig = getPhaseConfig(period.phase);
  const statusConfig = getStatusConfig(period.status);
  const PhaseIcon = phaseConfig.icon;
  const StatusIcon = statusConfig.icon;

  const completedGoals = period.goals.filter(g => g.completed).length;
  const totalGoals = period.goals.length;

  return (
    <div className={`bg-tier-white rounded-2xl overflow-hidden shadow-sm ${
      period.status === 'active' ? 'border-2 border-tier-success' : 'border-2 border-transparent'
    }`}>
      {/* Header */}
      <div
        onClick={onToggle}
        className="p-5 cursor-pointer flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${phaseConfig.colorClasses.bg} flex items-center justify-center`}>
            <PhaseIcon size={24} className={phaseConfig.colorClasses.text} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <SubSectionTitle className="text-base font-semibold text-tier-navy m-0">
                {period.name}
              </SubSectionTitle>
              <span className={`text-[11px] font-medium py-0.5 px-2 rounded ${statusConfig.colorClasses.bg} ${statusConfig.colorClasses.text} flex items-center gap-1`}>
                <StatusIcon size={10} />
                {statusConfig.label}
              </span>
            </div>
            <div className="text-[13px] text-tier-text-secondary mt-1">
              {formatDateRange(period.startDate, period.endDate)} - {phaseConfig.description}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {period.status === 'active' && (
            <div className="text-right">
              <div className="text-xl font-bold text-tier-navy">
                {period.progress}%
              </div>
              <div className="text-[11px] text-tier-text-secondary">fullfort</div>
            </div>
          )}
          <div className={`w-8 h-8 rounded-lg bg-tier-surface-base flex items-center justify-center transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : 'rotate-0'
          }`}>
            <ChevronDown size={18} className="text-tier-text-secondary" />
          </div>
        </div>
      </div>

      {/* Progress bar for active period */}
      {period.status === 'active' && (
        <div className="px-5 pb-4">
          <div className="h-1.5 bg-tier-surface-base rounded-sm overflow-hidden">
            <div
              className="h-full bg-tier-success rounded-sm transition-all duration-300"
              style={{ width: `${period.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-tier-border-default">
          {/* Focus Areas */}
          <div className="mt-4">
            <div className="text-[13px] font-semibold text-tier-navy mb-2">
              Fokusomrader
            </div>
            <div className="flex gap-2 flex-wrap">
              {period.focus.map((item, idx) => (
                <span
                  key={idx}
                  className={`text-xs py-1.5 px-3 rounded-lg ${phaseConfig.colorClasses.bg} ${phaseConfig.colorClasses.text}`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[13px] font-semibold text-tier-navy">
                Mal for perioden
              </div>
              <div className="text-xs text-tier-text-secondary">
                {completedGoals}/{totalGoals} fullfort
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {period.goals.map((goal) => (
                <div
                  key={goal.id}
                  className={`flex items-center gap-2.5 py-2.5 px-3 rounded-lg ${
                    goal.completed ? 'bg-tier-success/10' : 'bg-tier-surface-base'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    goal.completed
                      ? 'bg-tier-success'
                      : 'bg-tier-white border-2 border-tier-border-default'
                  }`}>
                    {goal.completed && <CheckCircle size={14} className="text-white" />}
                  </div>
                  <span className={`text-[13px] flex-1 ${
                    goal.completed ? 'text-tier-text-secondary line-through' : 'text-tier-navy'
                  }`}>
                    {goal.text}
                  </span>
                  {goal.current !== undefined && !goal.completed && (
                    <span className="text-[11px] text-tier-navy bg-tier-navy/10 py-0.5 px-2 rounded">
                      {goal.current} av mal
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Hours Distribution */}
          <div className="mt-5">
            <div className="text-[13px] font-semibold text-tier-navy mb-3">
              Ukentlig treningstid
            </div>
            <div className="flex gap-3">
              <div className="flex-1 bg-tier-navy/10 p-3 rounded-[10px] text-center">
                <div className="text-xl font-bold text-tier-navy">
                  {period.weeklyHours.technical}t
                </div>
                <div className="text-[11px] text-tier-text-secondary">Teknisk</div>
              </div>
              <div className="flex-1 bg-tier-error/10 p-3 rounded-[10px] text-center">
                <div className="text-xl font-bold text-tier-error">
                  {period.weeklyHours.physical}t
                </div>
                <div className="text-[11px] text-tier-text-secondary">Fysisk</div>
              </div>
              <div className="flex-1 bg-amber-500/10 p-3 rounded-[10px] text-center">
                <div className="text-xl font-bold text-amber-600">
                  {period.weeklyHours.mental}t
                </div>
                <div className="text-[11px] text-tier-text-secondary">Mental</div>
              </div>
            </div>
          </div>

          {/* Coach Note */}
          {period.notes && (
            <div className={`mt-4 p-3 bg-tier-surface-base rounded-[10px] border-l-[3px] ${
              phaseConfig.colorClasses.text === 'text-tier-navy' ? 'border-l-tier-navy' :
              phaseConfig.colorClasses.text === 'text-tier-success' ? 'border-l-tier-success' :
              phaseConfig.colorClasses.text === 'text-amber-600' ? 'border-l-amber-500' :
              'border-l-tier-warning'
            }`}>
              <div className="text-[11px] text-tier-text-secondary mb-1">
                Trenernotat - {period.coach}
              </div>
              <div className="text-[13px] text-tier-navy leading-relaxed">
                {period.notes}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CURRENT WEEK COMPONENT
// ============================================================================

const CurrentWeekPlan = ({ weekPlan }) => {
  const completedSessions = weekPlan.sessions.filter(s => s.completed).length;
  const totalSessions = weekPlan.sessions.filter(s => s.type !== 'Hvile').length;

  return (
    <div className="bg-tier-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <SubSectionTitle className="text-base font-semibold text-tier-navy m-0">
            Denne uken (Uke {weekPlan.week})
          </SubSectionTitle>
          <div className="text-[13px] text-tier-text-secondary mt-0.5">
            Tema: {weekPlan.theme}
          </div>
        </div>
        <div className="bg-tier-success/10 py-2 px-3 rounded-lg">
          <span className="text-sm font-semibold text-tier-success">
            {completedSessions}/{totalSessions} okter
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {weekPlan.sessions.map((session, idx) => {
          const config = getSessionTypeConfig(session.type);
          const Icon = config.icon;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-[10px] ${
                session.completed ? 'bg-tier-success/5' : 'bg-tier-surface-base'
              } ${session.type === 'Hvile' ? 'opacity-60' : 'opacity-100'}`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                session.completed ? 'bg-tier-success/15' : config.colorClasses.bg
              }`}>
                {session.completed ? (
                  <CheckCircle size={18} className="text-tier-success" />
                ) : (
                  <Icon size={18} className={config.colorClasses.text} />
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-tier-navy">
                  {session.day}
                </div>
                <div className="text-xs text-tier-text-secondary">
                  {session.type} - {session.focus}
                </div>
              </div>
              {session.duration > 0 && (
                <div className="text-xs text-tier-text-secondary bg-tier-white py-1 px-2 rounded-md">
                  {session.duration} min
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// TRANSFORM API DATA
// ============================================================================

/**
 * Transform API training plan data to period format
 */
const transformPlanToPeriods = (plans) => {
  if (!plans || plans.length === 0) {
    return DEFAULT_PERIODS;
  }

  // Get the most recent plan
  const plan = plans[0];

  // Build periods from plan phases
  const periods = [];
  const startDate = new Date(plan.startDate || new Date());

  // Define phase durations and configurations
  const phases = [
    {
      name: 'Vintertrening',
      phase: 'off-season',
      durationMonths: 2.5,
      focus: ['Fysisk grunnlag', 'Tekniske justeringer', 'Mental trening'],
      weeklyHours: { technical: 6, physical: 4, mental: 2 },
    },
    {
      name: 'Varforberedelse',
      phase: 'pre-season',
      durationMonths: 1.5,
      focus: ['Banespill', 'Konkurranseforberedelse', 'Kortspill-finpuss'],
      weeklyHours: { technical: 10, physical: 3, mental: 2 },
    },
    {
      name: 'Konkurransesesong',
      phase: 'competition',
      durationMonths: 4.5,
      focus: ['Turneringsprestasjoner', 'Score-fokus', 'Recovery'],
      weeklyHours: { technical: 8, physical: 2, mental: 3 },
    },
    {
      name: 'Hostperiode',
      phase: 'transition',
      durationMonths: 2.5,
      focus: ['Sesongevaluering', 'Tekniske endringer', 'Planlegging'],
      weeklyHours: { technical: 6, physical: 3, mental: 1 },
    },
  ];

  let currentDate = new Date(startDate);
  const today = new Date();

  phases.forEach((phaseConfig, idx) => {
    const phaseStartDate = new Date(currentDate);
    const phaseEndDate = new Date(currentDate);
    phaseEndDate.setMonth(phaseEndDate.getMonth() + phaseConfig.durationMonths);

    // Determine status
    let status = 'upcoming';
    let progress = 0;
    if (today >= phaseStartDate && today <= phaseEndDate) {
      status = 'active';
      const totalDays = (phaseEndDate - phaseStartDate) / (1000 * 60 * 60 * 24);
      const elapsedDays = (today - phaseStartDate) / (1000 * 60 * 60 * 24);
      progress = Math.round((elapsedDays / totalDays) * 100);
    } else if (today > phaseEndDate) {
      status = 'completed';
      progress = 100;
    }

    periods.push({
      id: `p${idx + 1}`,
      name: phaseConfig.name,
      phase: phaseConfig.phase,
      startDate: phaseStartDate.toISOString().split('T')[0],
      endDate: phaseEndDate.toISOString().split('T')[0],
      status,
      progress,
      focus: phaseConfig.focus,
      goals: plan.targets?.slice(idx * 4, (idx + 1) * 4)?.map((t, i) => ({
        id: `g${idx * 4 + i}`,
        text: t.description || t,
        completed: t.achieved || false,
      })) || DEFAULT_PERIODS[idx]?.goals || [],
      weeklyHours: phaseConfig.weeklyHours,
      keyActivities: DEFAULT_PERIODS[idx]?.keyActivities || [],
      coach: plan.player?.firstName ? `${plan.player.firstName} ${plan.player.lastName}` : 'Trener',
      notes: plan.notes || DEFAULT_PERIODS[idx]?.notes || '',
    });

    currentDate = new Date(phaseEndDate);
    currentDate.setDate(currentDate.getDate() + 1);
  });

  return periods;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PeriodeplanerContainer = () => {
  const { user } = useAuth();
  const [state, setState] = useState('loading');
  const [error, setError] = useState(null);
  const [periods, setPeriods] = useState(DEFAULT_PERIODS);
  const [weekPlan, setWeekPlan] = useState(CURRENT_WEEK_PLAN);
  const [expandedPeriod, setExpandedPeriod] = useState('p1');

  // Session sync hook
  const { syncPeriodSessions, isSyncing } = useSessionSync({
    onSyncComplete: () => {
      // Sync completed successfully
    },
  });

  const handleSyncSessions = async () => {
    await syncPeriodSessions(periods, weekPlan);
  };

  const fetchPeriods = useCallback(async () => {
    try {
      setState('loading');
      setError(null);

      // Fetch training plans
      const response = await apiClient.get('/training-plan');
      const plans = response.data?.data || response.data || [];

      // Transform to period format
      const transformedPeriods = transformPlanToPeriods(plans);
      setPeriods(transformedPeriods);

      // Set expanded period to active one
      const activePeriod = transformedPeriods.find(p => p.status === 'active');
      if (activePeriod) {
        setExpandedPeriod(activePeriod.id);
      }

      // Fetch current week's sessions
      try {
        const sessionsResponse = await apiClient.get('/sessions/my', {
          params: {
            startDate: getWeekStart().toISOString(),
            endDate: getWeekEnd().toISOString(),
          },
        });
        const sessions = sessionsResponse.data?.data || sessionsResponse.data || [];

        if (sessions.length > 0) {
          // Transform sessions to week plan format
          const weekSessions = transformSessionsToWeekPlan(sessions);
          setWeekPlan(weekSessions);
        }
      } catch (sessionsErr) {
        console.warn('Could not fetch sessions, using default week plan:', sessionsErr);
      }

      setState('idle');
    } catch (err) {
      console.error('Error fetching periods:', err);
      // Use default data on error
      setPeriods(DEFAULT_PERIODS);
      setState('idle');
    }
  }, []);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  const activePeriod = periods.find(p => p.status === 'active');
  const totalWeeklyHours = activePeriod
    ? activePeriod.weeklyHours.technical + activePeriod.weeklyHours.physical + activePeriod.weeklyHours.mental
    : 0;

  if (state === 'loading') {
    return <LoadingState message="Laster periodeplaner..." />;
  }

  if (state === 'error') {
    return (
      <ErrorState
        message={error?.message || 'Kunne ikke laste periodeplaner'}
        onRetry={fetchPeriods}
      />
    );
  }

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Periodeplaner"
        subtitle="Sesongplanlegging og periodisering"
        helpText="Oversikt over treningsperiodens struktur med evalueringsperiode, grunnperiode, spesialiseringsperiode og turneringsperiode. Se mål og fokus for hver periode."
        actions={
          <Button
            variant={isSyncing ? 'secondary' : 'primary'}
            size="sm"
            onClick={handleSyncSessions}
            disabled={isSyncing}
            leftIcon={<RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />}
          >
            {isSyncing ? 'Synkroniserer...' : 'Synkroniser til økter'}
          </Button>
        }
      />

      <div className="p-4 px-6 pb-6 w-full">
        {/* Stats Overview */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 mb-6">
          <div className="bg-tier-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-tier-success">
              {activePeriod?.name.split(' ')[0] || '-'}
            </div>
            <div className="text-xs text-tier-text-secondary">Aktiv periode</div>
          </div>
          <div className="bg-tier-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-tier-navy">
              {activePeriod?.progress || 0}%
            </div>
            <div className="text-xs text-tier-text-secondary">Fullfort</div>
          </div>
          <div className="bg-tier-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">
              {totalWeeklyHours}t
            </div>
            <div className="text-xs text-tier-text-secondary">Timer/uke</div>
          </div>
          <div className="bg-tier-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-tier-navy">
              {periods.length}
            </div>
            <div className="text-xs text-tier-text-secondary">Perioder i ar</div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6">
          {/* Left: Period Cards */}
          <div>
            <SectionTitle className="text-lg font-semibold text-tier-navy m-0 mb-4">
              Arsplan 2025
            </SectionTitle>
            <div className="flex flex-col gap-3">
              {periods.map((period) => (
                <PeriodCard
                  key={period.id}
                  period={period}
                  isExpanded={expandedPeriod === period.id}
                  onToggle={() => setExpandedPeriod(expandedPeriod === period.id ? null : period.id)}
                />
              ))}
            </div>
          </div>

          {/* Right: Current Week */}
          <div>
            <SectionTitle className="text-lg font-semibold text-tier-navy m-0 mb-4">
              Ukeoversikt
            </SectionTitle>
            <CurrentWeekPlan weekPlan={CURRENT_WEEK_PLAN} />

            {/* Period Timeline Visual */}
            <div className="mt-6 bg-tier-white rounded-2xl p-5 shadow-sm">
              <SubSectionTitle className="text-sm font-semibold text-tier-navy m-0 mb-4">
                Arshjul
              </SubSectionTitle>
              <div className="flex gap-1 h-6">
                {periods.map((period) => {
                  const phaseConfig = getPhaseConfig(period.phase);
                  const startMonth = new Date(period.startDate).getMonth();
                  const endMonth = new Date(period.endDate).getMonth();
                  const width = ((endMonth - startMonth + 1) / 12) * 100;

                  return (
                    <div
                      key={period.id}
                      className={`rounded flex items-center justify-center ${
                        period.status === 'active'
                          ? phaseConfig.colorClasses.fill
                          : phaseConfig.colorClasses.bg
                      }`}
                      style={{ flex: `0 0 ${width}%` }}
                      title={period.name}
                    >
                      {width > 15 && (
                        <span className={`text-[10px] font-semibold ${
                          period.status === 'active' ? 'text-white' : phaseConfig.colorClasses.text
                        }`}>
                          {period.name.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-tier-text-secondary">
                <span>Jan</span>
                <span>Apr</span>
                <span>Jul</span>
                <span>Okt</span>
                <span>Des</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodeplanerContainer;
