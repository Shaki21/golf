/**
 * TIER Golf - Player Training Plan View
 * Design System v3.1 - Decision-First Sub-Page
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "What training session should I complete next?"
 *
 * INFORMATION ARCHITECTURE:
 * Layer 1 — Decision Hero: Next session to complete
 * Layer 2 — Plan Overview: Current progress and week view
 * Layer 3 — Full Schedule: All sessions with navigation
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, Circle, TrendingUp, Clock, Target, ArrowRight, Play } from 'lucide-react';
import { Card } from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';
import { Badge } from '../../components/shadcn/badge';
import { Progress } from '../../components/shadcn/progress';
import { PlayerWeekNavigation } from './PlayerWeekNavigation';

// Mock data structure - will be replaced with API data
interface PlayerTrainingPlan {
  id: string;
  name: string;
  description: string;
  startDate: string;
  durationWeeks: number;
  currentWeek: number;
  sessions: PlayerSession[];
  completedSessions: string[];
}

interface PlayerSession {
  id: string;
  name: string;
  description?: string;
  weekNumber: number;
  dayOfWeek: number;
  durationMinutes: number;
  categories: string[];
  exercises?: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  phase?: string;
  environment?: string;
  completed?: boolean;
}

// Mock data
const MOCK_PLAN: PlayerTrainingPlan = {
  id: 'plan-1',
  name: '8-Week Full Swing Development',
  description: 'Comprehensive program focused on improving full swing mechanics and consistency',
  startDate: '2026-01-06',
  durationWeeks: 8,
  currentWeek: 2,
  completedSessions: ['session-1', 'session-2'],
  sessions: [
    {
      id: 'session-1',
      name: 'Setup Fundamentals',
      description: 'Focus on grip, posture, and alignment basics',
      weekNumber: 1,
      dayOfWeek: 1,
      durationMinutes: 60,
      categories: ['TEE'],
      phase: 'L1',
      environment: 'C1',
      completed: true,
    },
    {
      id: 'session-2',
      name: 'Backswing Foundation',
      description: 'Develop proper backswing sequence and positions',
      weekNumber: 1,
      dayOfWeek: 3,
      durationMinutes: 60,
      categories: ['TEE'],
      phase: 'L1',
      environment: 'C1',
      completed: true,
    },
    {
      id: 'session-3',
      name: 'Transition & Downswing',
      description: 'Learn efficient transition and downswing mechanics',
      weekNumber: 2,
      dayOfWeek: 1,
      durationMinutes: 90,
      categories: ['TEE'],
      phase: 'L2',
      environment: 'C2',
      completed: false,
    },
    {
      id: 'session-4',
      name: 'Impact Position',
      description: 'Practice achieving consistent impact position',
      weekNumber: 2,
      dayOfWeek: 3,
      durationMinutes: 60,
      categories: ['TEE'],
      phase: 'L2',
      environment: 'C2',
      completed: false,
    },
  ],
};

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CATEGORY_COLORS: Record<string, string> = {
  TEE: 'bg-tier-gold/20 text-tier-gold border-tier-gold',
  APP: 'bg-tier-navy/20 text-tier-navy border-tier-navy',
  SGR: 'bg-tier-success/20 text-tier-success border-tier-success',
  PGR: 'bg-tier-accent/20 text-tier-accent border-tier-accent',
  GBR: 'bg-tier-warning/20 text-tier-warning border-tier-warning',
};

export function PlayerTrainingPlanView() {
  const navigate = useNavigate();
  const [plan] = useState<PlayerTrainingPlan>(MOCK_PLAN);
  const [selectedWeek, setSelectedWeek] = useState<number>(MOCK_PLAN.currentWeek);
  const [completedSessions, setCompletedSessions] = useState<Set<string>>(
    new Set(MOCK_PLAN.completedSessions)
  );

  // Calculate progress
  const progress = useMemo(() => {
    const totalSessions = plan.sessions.length;
    const completed = completedSessions.size;
    const percentage = totalSessions > 0 ? (completed / totalSessions) * 100 : 0;

    return {
      total: totalSessions,
      completed,
      percentage,
      remaining: totalSessions - completed,
    };
  }, [plan.sessions, completedSessions]);

  // Get current week sessions (based on selected week)
  const currentWeekSessions = useMemo(() => {
    return plan.sessions
      .filter(s => s.weekNumber === selectedWeek)
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  }, [plan.sessions, selectedWeek]);

  // Get upcoming sessions
  const upcomingSessions = useMemo(() => {
    return plan.sessions
      .filter(s => s.weekNumber > plan.currentWeek ||
        (s.weekNumber === plan.currentWeek && !completedSessions.has(s.id)))
      .sort((a, b) => {
        if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber;
        return a.dayOfWeek - b.dayOfWeek;
      })
      .slice(0, 3);
  }, [plan.sessions, plan.currentWeek, completedSessions]);

  // Get next session to complete (for Decision Hero)
  const nextSession = useMemo(() => {
    return plan.sessions
      .filter(s => !completedSessions.has(s.id))
      .sort((a, b) => {
        if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber;
        return a.dayOfWeek - b.dayOfWeek;
      })[0] || null;
  }, [plan.sessions, completedSessions]);

  // Week navigation handlers
  const handlePreviousWeek = () => {
    if (selectedWeek > 1) {
      setSelectedWeek(prev => prev - 1);
    }
  };

  const handleNextWeek = () => {
    if (selectedWeek < plan.durationWeeks) {
      setSelectedWeek(prev => prev + 1);
    }
  };

  const handleSelectWeek = (weekNumber: number) => {
    if (weekNumber >= 1 && weekNumber <= plan.durationWeeks) {
      setSelectedWeek(weekNumber);
    }
  };

  const handleToggleComplete = (sessionId: string) => {
    setCompletedSessions(prev => {
      const next = new Set(prev);
      if (next.has(sessionId)) {
        next.delete(sessionId);
      } else {
        next.add(sessionId);
      }
      return next;
    });

    // TODO: Call API to update session completion status
    console.log('Toggle session completion:', sessionId);
  };

  const isSessionCompleted = (sessionId: string) => completedSessions.has(sessionId);

  const handleStartSession = (session: PlayerSession) => {
    navigate(`/trening/plan/session/${session.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-tier-navy/10 rounded-lg">
            <Target className="text-tier-navy" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-tier-navy">My Training Plan</h1>
            <p className="text-sm text-tier-navy/60 mt-0.5">
              Track your progress and complete training sessions
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/trening/plan/progress')}
          className="flex items-center gap-2"
        >
          <TrendingUp size={16} />
          View Progress
        </Button>
      </div>

      {/* Layer 1: Decision Hero - Next session to complete */}
      <TrainingHero
        session={nextSession}
        totalRemaining={progress.remaining}
        onStartSession={handleStartSession}
        progress={progress}
      />

      {/* Plan Overview */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-tier-navy mb-1">{plan.name}</h2>
            <p className="text-sm text-tier-navy/70 mb-3">{plan.description}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">
                Week {plan.currentWeek} of {plan.durationWeeks}
              </Badge>
              <Badge variant="secondary">
                {plan.sessions.length} sessions
              </Badge>
              <Badge variant="secondary">
                Started {new Date(plan.startDate).toLocaleDateString()}
              </Badge>
            </div>
          </div>

          {/* Progress Circle */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="transform -rotate-90" width="120" height="120">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-tier-navy/10"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - progress.percentage / 100)}
                    className="text-tier-gold transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-tier-navy">
                    {Math.round(progress.percentage)}%
                  </span>
                  <span className="text-xs text-tier-navy/60">Complete</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-tier-navy/60">
                {progress.completed} of {progress.total} sessions
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Week Navigation */}
      <Card className="p-4">
        <PlayerWeekNavigation
          currentWeek={selectedWeek}
          totalWeeks={plan.durationWeeks}
          onPrevious={handlePreviousWeek}
          onNext={handleNextWeek}
          onSelectWeek={handleSelectWeek}
        />
      </Card>

      {/* Selected Week's Sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-tier-navy flex items-center gap-2">
            <Calendar size={20} />
            {selectedWeek === plan.currentWeek ? 'This Week' : `Week ${selectedWeek}`} (Week {selectedWeek})
          </h3>
        </div>

        {currentWeekSessions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-tier-navy/60">No sessions scheduled for this week</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentWeekSessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                isCompleted={isSessionCompleted(session.id)}
                onToggleComplete={() => handleToggleComplete(session.id)}
                onViewDetails={() => navigate(`/trening/plan/session/${session.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-tier-navy flex items-center gap-2 mb-4">
            <TrendingUp size={20} />
            Coming Up Next
          </h3>
          <div className="space-y-3">
            {upcomingSessions.map(session => (
              <UpcomingSessionRow
                key={session.id}
                session={session}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// DECISION HERO - Shows next session to complete
// =============================================================================

interface TrainingHeroProps {
  session: PlayerSession | null;
  totalRemaining: number;
  onStartSession: (session: PlayerSession) => void;
  progress: { completed: number; total: number; percentage: number };
}

function TrainingHero({ session, totalRemaining, onStartSession, progress }: TrainingHeroProps) {
  if (!session) {
    return (
      <Card className="p-6 bg-gradient-to-r from-tier-success/10 to-tier-success/5 border-tier-success/20 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-tier-success/20 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-tier-success" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-tier-navy">All sessions complete!</h2>
            <p className="text-tier-navy/70">Great work! You've completed all scheduled training sessions.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-r from-tier-gold/10 to-tier-gold/5 border-tier-gold/30 mb-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-tier-gold/20 flex items-center justify-center">
            <Play className="w-6 h-6 text-tier-gold" />
          </div>
          <div>
            <span className="text-sm text-tier-navy/60">Your next session</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-medium text-tier-gold bg-tier-gold/20 px-2 py-0.5 rounded-full">
                {totalRemaining} sessions remaining
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-tier-navy">{Math.round(progress.percentage)}%</span>
          <p className="text-xs text-tier-navy/60">complete</p>
        </div>
      </div>

      {/* Session details */}
      <h2 className="text-xl font-bold text-tier-navy mb-2">{session.name}</h2>
      <p className="text-tier-navy/70 mb-4">
        Week {session.weekNumber} • {DAY_NAMES[session.dayOfWeek - 1]} • {session.durationMinutes} min
      </p>

      {/* Description preview */}
      {session.description && (
        <p className="text-sm text-tier-navy/60 mb-4 line-clamp-2">{session.description}</p>
      )}

      {/* Quick meta */}
      <div className="flex flex-wrap gap-2 mb-4">
        {session.categories.map(cat => (
          <span key={cat} className={`px-2 py-1 text-xs font-medium rounded border ${CATEGORY_COLORS[cat] || CATEGORY_COLORS.APP}`}>
            {cat}
          </span>
        ))}
        {session.phase && (
          <Badge variant="outline" className="text-xs">{session.phase}</Badge>
        )}
      </div>

      {/* Primary CTA */}
      <button
        onClick={() => onStartSession(session)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-tier-navy text-white rounded-lg font-medium hover:bg-tier-navy/90 transition-colors"
      >
        Start Session
        <ArrowRight size={16} />
      </button>
    </Card>
  );
}

// Session Card Component
interface SessionCardProps {
  session: PlayerSession;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onViewDetails: () => void;
}

function SessionCard({ session, isCompleted, onToggleComplete, onViewDetails }: SessionCardProps) {
  const categoryColorClass = CATEGORY_COLORS[session.categories[0]] || CATEGORY_COLORS.APP;

  return (
    <Card className={`p-4 border-l-4 ${isCompleted ? 'opacity-75 bg-tier-success/5' : ''}
      transition-all hover:shadow-md border-l-tier-gold cursor-pointer`}
      onClick={onViewDetails}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h4 className="font-semibold text-tier-navy line-clamp-1 mb-1">
              {session.name}
            </h4>
            <p className="text-sm text-tier-navy/60 mb-2 line-clamp-2">
              {DAY_NAMES[session.dayOfWeek - 1]}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete();
            }}
            className="flex-shrink-0 focus:outline-none hover:scale-110 transition-transform"
            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isCompleted ? (
              <CheckCircle className="text-tier-success" size={28} />
            ) : (
              <Circle className="text-tier-navy/30 hover:text-tier-navy" size={28} />
            )}
          </button>
        </div>

        {/* Description */}
        {session.description && (
          <p className="text-sm text-tier-navy/70 line-clamp-2">{session.description}</p>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="secondary" className="text-xs">
            <Clock size={12} className="mr-1" />
            {session.durationMinutes} min
          </Badge>
          {session.categories.map(cat => (
            <span key={cat} className={`px-2 py-0.5 text-xs font-medium rounded border ${categoryColorClass}`}>
              {cat}
            </span>
          ))}
          {session.phase && (
            <Badge variant="outline" className="text-xs">
              {session.phase}
            </Badge>
          )}
        </div>

        {/* Exercises count */}
        {session.exercises && session.exercises.length > 0 && (
          <div className="text-xs text-tier-navy/60">
            {session.exercises.length} {session.exercises.length === 1 ? 'exercise' : 'exercises'}
          </div>
        )}
      </div>
    </Card>
  );
}

// Upcoming Session Row Component
interface UpcomingSessionRowProps {
  session: PlayerSession;
}

function UpcomingSessionRow({ session }: UpcomingSessionRowProps) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <Badge variant="default" className="text-xs">
              Week {session.weekNumber}
            </Badge>
            <span className="text-sm font-medium text-tier-navy">{session.name}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-tier-navy/60">
            <span>{DAY_NAMES[session.dayOfWeek - 1]}</span>
            <span>•</span>
            <span>{session.durationMinutes} min</span>
            <span>•</span>
            <span>{session.categories.join(', ')}</span>
          </div>
        </div>
        <Circle className="text-tier-navy/20" size={24} />
      </div>
    </Card>
  );
}

export default PlayerTrainingPlanView;
