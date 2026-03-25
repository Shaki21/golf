/**
 * Dashboard V5 - TIER Golf
 *
 * Player dashboard using TIER design system with Tailwind utilities.
 * Mobile-first responsive layout with semantic TIER tokens.
 *
 * Zones:
 * - Header: Welcome + Profile
 * - Stats: Quick KPIs in grid
 * - Sessions: Today's training schedule
 * - Progress: Goals + Achievements
 * - Quick Actions: Navigation shortcuts
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Target,
  Trophy,
  ChevronRight,
  Play,
  TrendingUp,
  Flame,
  MapPin,
  Bell,
  MessageSquare,
  Plus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

// Hooks
import { useDashboard } from '../../hooks/useDashboard';
import { useAuth } from '../../contexts/AuthContext';

// UI Components
import Button from '../../ui/primitives/Button';
import { Badge } from '../../components/shadcn/badge';
import { Card } from '../../ui/primitives/Card';
import StateCard from '../../ui/composites/StateCard';

// AI Coach
import { AICoachGuide } from '../ai-coach';
import { GUIDE_PRESETS } from '../ai-coach/types';

// ============================================================================
// TYPES
// ============================================================================

interface QuickStat {
  id: string;
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  change?: string;
  color?: string;
}

interface Session {
  id: string;
  title: string;
  time: string;
  location: string;
  duration: number;
  status?: 'scheduled' | 'in_progress' | 'completed';
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface DashboardData {
  player: { name: string; category: string; avatarUrl?: string };
  stats: {
    sessionsCompleted: number;
    sessionsTotal: number;
    hoursThisWeek: number;
    hoursGoal?: number;
    streak: number;
  };
  level: number;
  xp: number;
  nextLevelXp: number;
  upcomingSessions?: Session[];
  calendarEvents?: Array<{ id: string | number; title: string; startTime: string; endTime: string; type: string; location: string }>;
  tasks?: Array<{ id: string | number; title: string; area?: string; completed: boolean; priority: string }>;
  messages?: Array<{ id: string | number; from: string; preview: string; time: string; read: boolean; isGroup?: boolean }>;
  achievements?: Array<{ id: string | number; icon?: string; iconEmoji?: string; title: string; description: string }>;
  notifications?: Array<{ id: string | number; type: string; title: string; message: string; time: string }>;
  nextTournament?: { title: string; date: string; location: string };
  nextTest?: { title: string; date: string; location: string };
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Welcome Header with player info
 */
const WelcomeHeader: React.FC<{
  playerName: string;
  category: string;
  greeting: string;
}> = ({ playerName, category, greeting }) => (
  <div className="flex justify-between items-center mb-2">
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-tier-navy/60">{greeting}</span>
      <h1 className="text-3xl font-bold text-tier-navy">
        {playerName.split(' ')[0]}
      </h1>
    </div>
    <Badge variant="secondary">
      Category {category}
    </Badge>
  </div>
);

/**
 * Stats Grid - Key metrics at a glance
 */
const StatsGrid: React.FC<{ stats: QuickStat[] }> = ({ stats }) => (
  <div className="grid grid-cols-2 gap-3">
    {stats.map((stat) => (
      <Card key={stat.id} className="flex items-center gap-3 p-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-tier-navy/5">
          {stat.icon}
        </div>
        <div className="flex flex-col flex-1">
          <span className="text-xl font-bold text-tier-navy">{stat.value}</span>
          <span className="text-xs text-tier-navy/60">{stat.label}</span>
        </div>
        {stat.change && (
          <span className={`text-xs font-semibold ${
            stat.trend === 'up' ? 'text-tier-success' :
            stat.trend === 'down' ? 'text-tier-error' :
            'text-tier-navy/60'
          }`}>
            {stat.change}
          </span>
        )}
      </Card>
    ))}
  </div>
);

/**
 * Today's Sessions Card
 */
const TodaysSessions: React.FC<{
  sessions: Session[];
  onSessionClick: (id: string) => void;
  onAddSession: () => void;
}> = ({ sessions, onSessionClick, onAddSession }) => (
  <Card>
    <div className="flex justify-between items-center p-4 border-b border-tier-navy/10">
      <div className="flex items-center gap-2">
        <Calendar size={20} className="text-tier-gold" />
        <h3 className="text-base font-semibold text-tier-navy">Today's Sessions</h3>
      </div>
      <Button variant="ghost" size="sm" onClick={onAddSession}>
        <Plus size={16} />
      </Button>
    </div>

    {sessions.length === 0 ? (
      <div className="flex flex-col items-center gap-3 p-6">
        <p className="text-sm text-tier-navy/60">No sessions scheduled today</p>
        <Button variant="secondary" size="sm" leftIcon={<Plus size={16} />} onClick={onAddSession}>
          Schedule session
        </Button>
      </div>
    ) : (
      <div className="flex flex-col">
        {sessions.map((session, index) => (
          <div
            key={session.id}
            className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-tier-navy/5 transition-colors ${
              index > 0 ? 'border-t border-tier-navy/10' : ''
            }`}
            onClick={() => onSessionClick(session.id)}
          >
            <div className="flex items-center gap-1 min-w-[60px] text-xs font-semibold text-tier-navy/60">
              <Clock size={14} />
              <span>{session.time}</span>
            </div>
            <div className="flex-1 flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-tier-navy">{session.title}</span>
              <span className="flex items-center gap-1 text-xs text-tier-navy/60">
                <MapPin size={12} />
                {session.location} · {session.duration} min
              </span>
            </div>
            <div className="flex items-center">
              {session.status === 'completed' ? (
                <CheckCircle2 size={20} className="text-tier-success" />
              ) : session.status === 'in_progress' ? (
                <Play size={20} className="text-tier-gold" />
              ) : (
                <ChevronRight size={20} className="text-tier-navy/40" />
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </Card>
);

/**
 * Goals Progress Card
 */
const GoalsProgress: React.FC<{
  tasks: Array<{ id: string | number; title: string; completed: boolean; priority: string }>;
  onViewAll: () => void;
}> = ({ tasks, onViewAll }) => {
  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <Card>
      <div className="flex justify-between items-center p-4 border-b border-tier-navy/10">
        <div className="flex items-center gap-2">
          <Target size={20} className="text-tier-gold" />
          <h3 className="text-base font-semibold text-tier-navy">Weekly Goals</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View all
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 h-2 bg-tier-navy/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-tier-success rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-tier-navy/60 whitespace-nowrap">
          {completedCount}/{tasks.length} completed
        </span>
      </div>

      {/* Task List (show top 3) */}
      <div className="flex flex-col gap-2 px-4 pb-4">
        {tasks.slice(0, 3).map((task) => (
          <div key={task.id} className="flex items-center gap-3">
            <div className={`
              w-5 h-5 rounded flex items-center justify-center border-2 transition-colors
              ${task.completed
                ? 'bg-tier-success border-tier-success'
                : 'bg-transparent border-tier-navy/20'
              }
            `}>
              {task.completed && <CheckCircle2 size={12} className="text-white" />}
            </div>
            <span className={`
              flex-1 text-sm
              ${task.completed
                ? 'line-through text-tier-navy/60'
                : 'text-tier-navy'
              }
            `}>
              {task.title}
            </span>
            {task.priority === 'high' && !task.completed && (
              <AlertCircle size={14} className="text-tier-warning" />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

/**
 * Quick Actions Grid
 */
const QuickActions: React.FC<{
  actions: QuickAction[];
  onActionClick: (href: string) => void;
}> = ({ actions, onActionClick }) => (
  <div className="grid grid-cols-4 gap-3">
    {actions.map((action) => (
      <button
        key={action.id}
        className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-tier-navy/5 transition-colors"
        onClick={() => onActionClick(action.href)}
      >
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: action.color }}
        >
          {action.icon}
        </div>
        <span className="text-xs font-medium text-tier-navy">{action.label}</span>
      </button>
    ))}
  </div>
);

/**
 * Countdown Card (Tournament/Test)
 */
const CountdownCard: React.FC<{
  title: string;
  eventName: string;
  date: string;
  location: string;
  icon: React.ReactNode;
  onView: () => void;
}> = ({ title, eventName, date, location, icon, onView }) => {
  const daysUntil = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-lg transition-all"
      onClick={onView}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-tier-navy/60">{title}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-4xl font-bold text-tier-navy leading-none">{daysUntil}</span>
        <span className="text-xs text-tier-navy/60">days</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-tier-navy">{eventName}</span>
        <span className="flex items-center gap-1 text-xs text-tier-navy/60">
          <MapPin size={12} /> {location}
        </span>
      </div>
    </Card>
  );
};

/**
 * Messages Preview
 */
const MessagesPreview: React.FC<{
  messages: Array<{ id: string | number; from: string; preview: string; time: string; read: boolean }>;
  unreadCount: number;
  onViewAll: () => void;
}> = ({ messages, unreadCount, onViewAll }) => (
  <Card>
    <div className="flex justify-between items-center p-4 border-b border-tier-navy/10">
      <div className="flex items-center gap-2">
        <MessageSquare size={20} className="text-tier-gold" />
        <h3 className="text-base font-semibold text-tier-navy">Messages</h3>
        {unreadCount > 0 && (
          <Badge variant="destructive">{unreadCount}</Badge>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={onViewAll}>
        View all
      </Button>
    </div>

    <div className="flex flex-col">
      {messages.slice(0, 2).map((msg) => (
        <div key={msg.id} className="flex items-center gap-3 p-4 border-t border-tier-navy/10">
          <div className="w-9 h-9 rounded-full bg-tier-gold flex items-center justify-center text-white text-sm font-semibold">
            {msg.from.charAt(0)}
          </div>
          <div className="flex-1 flex flex-col gap-0.5 min-w-0">
            <span className={`text-sm ${msg.read ? 'font-medium' : 'font-semibold'} text-tier-navy`}>
              {msg.from}
            </span>
            <span className="text-xs text-tier-navy/60 truncate">{msg.preview}</span>
          </div>
          <span className="text-xs text-tier-navy/40 whitespace-nowrap">{msg.time}</span>
        </div>
      ))}
    </div>
  </Card>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DashboardV5() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading, error, refetch } = useDashboard() as {
    data: DashboardData | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Build quick stats from data
  const quickStats: QuickStat[] = data ? [
    {
      id: 'streak',
      label: 'Streak',
      value: data.stats?.streak || 0,
      icon: <Flame size={20} className="text-tier-warning" />,
      trend: 'up',
      change: '+2',
    },
    {
      id: 'sessions',
      label: 'Sessions this week',
      value: `${data.stats?.sessionsCompleted || 0}/${data.stats?.sessionsTotal || 12}`,
      icon: <Calendar size={20} className="text-tier-gold" />,
    },
    {
      id: 'hours',
      label: 'Hours this week',
      value: data.stats?.hoursThisWeek?.toFixed(1) || '0',
      icon: <Clock size={20} className="text-tier-success" />,
    },
    {
      id: 'level',
      label: 'Level',
      value: data.level || 1,
      icon: <TrendingUp size={20} className="text-tier-navy" />,
    },
  ] : [];

  // Quick actions - aligned with 4+1 navigation structure
  const quickActions: QuickAction[] = [
    { id: 'log-training', label: 'Log Training', icon: <Play size={20} color="white" />, href: '/trening/logg', color: '#10B981' },
    { id: 'take-test', label: 'Take test', icon: <Target size={20} color="white" />, href: '/testprotokoll', color: '#C9A227' },
    { id: 'view-stats', label: 'Statistics', icon: <TrendingUp size={20} color="white" />, href: '/stats', color: '#0A2540' },
    { id: 'calendar', label: 'Calendar', icon: <Calendar size={20} color="white" />, href: '/kalender', color: '#F59E0B' },
  ];

  // Loading state
  if (loading && !data) {
    return (
      <div className="flex flex-col gap-5 p-4 w-full">
        <StateCard variant="loading" title="Loading dashboard..." />
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="flex flex-col gap-5 p-4 w-full">
        <StateCard
          variant="error"
          title="Could not load dashboard"
          description={error}
          action={
            <Button variant="primary" onClick={refetch}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const playerName = data?.player?.name || (user as { name?: string })?.name || 'Player';
  const playerCategory = data?.player?.category || (user as { category?: string })?.category || 'B';
  const sessions = data?.upcomingSessions || [];
  const tasks = data?.tasks || [];
  const messages = data?.messages || [];
  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="flex flex-col gap-5 p-4 w-full">
      {/* Welcome Header */}
      <WelcomeHeader
        playerName={playerName}
        category={playerCategory}
        greeting={getGreeting()}
      />

      {/* AI Coach Guide */}
      <AICoachGuide config={GUIDE_PRESETS.dashboard} />

      {/* Stats Grid */}
      <StatsGrid stats={quickStats} />

      {/* Quick Actions */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-tier-navy">Quick Actions</h2>
        <QuickActions
          actions={quickActions}
          onActionClick={(href) => navigate(href)}
        />
      </section>

      {/* Countdowns Row */}
      {(data?.nextTournament || data?.nextTest) && (
        <section className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            {data?.nextTournament && (
              <CountdownCard
                title="Next tournament"
                eventName={data.nextTournament.title}
                date={data.nextTournament.date}
                location={data.nextTournament.location}
                icon={<Trophy size={16} className="text-tier-warning" />}
                onView={() => navigate('/turneringer')}
              />
            )}
            {data?.nextTest && (
              <CountdownCard
                title="Next test"
                eventName={data.nextTest.title}
                date={data.nextTest.date}
                location={data.nextTest.location}
                icon={<Target size={16} className="text-tier-gold" />}
                onView={() => navigate('/testing')}
              />
            )}
          </div>
        </section>
      )}

      {/* Today's Sessions */}
      <section className="flex flex-col gap-3">
        <TodaysSessions
          sessions={sessions}
          onSessionClick={(id) => navigate(`/sessions/${id}`)}
          onAddSession={() => navigate('/logg-trening')}
        />
      </section>

      {/* Goals Progress */}
      <section className="flex flex-col gap-3">
        <GoalsProgress
          tasks={tasks}
          onViewAll={() => navigate('/goals')}
        />
      </section>

      {/* Messages Preview */}
      <section className="flex flex-col gap-3">
        <MessagesPreview
          messages={messages}
          unreadCount={unreadCount}
          onViewAll={() => navigate('/meldinger')}
        />
      </section>
    </div>
  );
}
