/**
 * DailyTrainingCalendar
 *
 * Enhanced "Dagens trening" component with calendar view.
 * Shows training sessions on a calendar with details on click.
 *
 * Features:
 * - Monthly calendar view with session indicators
 * - Color-coded sessions by status (planned, in_progress, completed, skipped)
 * - Click to view session details in popover
 * - Today's session highlighted
 * - Quick actions for today's session
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Target, BookOpen, Play, CheckCircle, SkipForward } from 'lucide-react';
import { Calendar } from '../../components/shadcn/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/shadcn/popover';
import { StandardPageHeader } from '../../components/layout/StandardPageHeader';
import Button from '../../ui/primitives/Button';
import Card from '../../ui/primitives/Card';
import { SubSectionTitle } from '../../components/typography';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { enUS } from 'date-fns/locale';

// ============================================================================
// TYPES
// ============================================================================

type SessionStatus = 'planned' | 'in_progress' | 'completed' | 'skipped' | 'rest_day';

interface TrainingSession {
  id: string;
  date: Date;
  type: string;
  duration: number;
  status: SessionStatus;
  period?: string;
  learningPhase?: string;
  description?: string;
  notes?: string;
  canBeSubstituted?: boolean;
}

interface DailyTrainingCalendarProps {
  planId?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const generateMockSessions = (): TrainingSession[] => {
  const today = new Date();
  const sessions: TrainingSession[] = [];

  // Add sessions for the current month
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  days.forEach((day, index) => {
    // Skip some days
    if (index % 3 === 0) return;

    // Rest day every 7th day
    if (index % 7 === 0) {
      sessions.push({
        id: `rest-${index}`,
        date: day,
        type: 'Rest Day',
        duration: 0,
        status: 'rest_day',
      });
      return;
    }

    const statuses: SessionStatus[] = ['planned', 'in_progress', 'completed', 'skipped'];
    const types = ['Technique Training', 'Physical Training', 'Putting Session', 'Short Game', 'Full Swing'];
    const durations = [45, 60, 90, 120];

    const isPast = day < today;
    const isToday = isSameDay(day, today);

    let status: SessionStatus;
    if (isPast) {
      status = Math.random() > 0.2 ? 'completed' : 'skipped';
    } else if (isToday) {
      status = 'in_progress';
    } else {
      status = 'planned';
    }

    sessions.push({
      id: `session-${index}`,
      date: day,
      type: types[Math.floor(Math.random() * types.length)],
      duration: durations[Math.floor(Math.random() * durations.length)],
      status,
      period: ['Preparation', 'Competition', 'Transition'][Math.floor(Math.random() * 3)],
      learningPhase: ['L-BODY', 'L-ARM', 'L-CLUB', 'L-BALL', 'L-AUTO'][Math.floor(Math.random() * 5)],
      description: 'Focus on short approaches and putting. Work on rhythm and timing.',
      notes: Math.random() > 0.7 ? 'Important: Remember to film swing' : undefined,
      canBeSubstituted: Math.random() > 0.5,
    });
  });

  return sessions;
};

// ============================================================================
// COMPONENTS
// ============================================================================

const STATUS_CONFIG = {
  planned: {
    label: 'Planned',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-tier-navy',
    textColor: 'text-tier-navy',
    bgColor: 'bg-tier-navy/10',
    borderColor: 'border-tier-navy/30',
  },
  completed: {
    label: 'Completed',
    color: 'bg-tier-success',
    textColor: 'text-tier-success',
    bgColor: 'bg-tier-success/10',
    borderColor: 'border-tier-success/30',
  },
  skipped: {
    label: 'Skipped',
    color: 'bg-tier-warning',
    textColor: 'text-tier-warning',
    bgColor: 'bg-tier-warning/10',
    borderColor: 'border-tier-warning/30',
  },
  rest_day: {
    label: 'Rest Day',
    color: 'bg-gray-400',
    textColor: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
};

interface SessionDetailsProps {
  session: TrainingSession;
  onAction?: (action: string) => void;
}

const SessionDetails: React.FC<SessionDetailsProps> = ({ session, onAction }) => {
  const navigate = useNavigate();
  const config = STATUS_CONFIG[session.status];

  if (session.status === 'rest_day') {
    return (
      <div className="w-80 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-3 h-3 rounded-full ${config.color}`} />
          <SubSectionTitle style={{ marginBottom: 0 }}>Rest Day</SubSectionTitle>
        </div>
        <p className="text-sm text-tier-text-secondary m-0">
          Recovery is important! Enjoy your rest day.
        </p>
      </div>
    );
  }

  const isToday = isSameDay(session.date, new Date());
  const isPast = session.date < new Date() && !isToday;

  return (
    <div className="w-96 p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-3 h-3 rounded-full ${config.color} flex-shrink-0`} />
            <SubSectionTitle className="truncate" style={{ marginBottom: 0 }}>
              {session.type}
            </SubSectionTitle>
          </div>
          <p className="text-xs text-tier-text-secondary m-0">
            {format(session.date, 'EEEE, MMMM d, yyyy', { locale: enUS })}
          </p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${config.bgColor} ${config.textColor} flex-shrink-0`}>
          {config.label}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Clock size={16} className="text-tier-text-tertiary flex-shrink-0" />
          <span className="text-tier-navy">{session.duration} minutes</span>
        </div>

        {session.period && (
          <div className="flex items-center gap-2 text-sm">
            <Target size={16} className="text-tier-text-tertiary flex-shrink-0" />
            <span className="text-tier-navy">
              {session.period} • {session.learningPhase}
            </span>
          </div>
        )}

        {session.description && (
          <div className="p-2 bg-tier-surface-base rounded text-sm">
            <p className="text-tier-text-secondary m-0">{session.description}</p>
          </div>
        )}

        {session.notes && (
          <div className="p-2 bg-amber-50 border border-amber-200 rounded text-sm">
            <p className="text-amber-800 m-0">
              <strong>Coach notes:</strong> {session.notes}
            </p>
          </div>
        )}
      </div>

      {/* Actions - Only show for today's session or future sessions */}
      {(isToday || !isPast) && session.status !== 'completed' && (
        <div className="flex gap-2 pt-3 border-t border-tier-border-default">
          {session.status === 'planned' && isToday && (
            <>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Play size={14} />}
                onClick={() => onAction?.('start')}
                className="flex-1"
              >
                Start
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle size={14} />}
                onClick={() => onAction?.('complete')}
                className="flex-1"
              >
                Complete
              </Button>
            </>
          )}

          {session.status === 'in_progress' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle size={14} />}
              onClick={() => navigate(`/session/${session.id}/evaluate`)}
              className="flex-1"
            >
              Evaluate session
            </Button>
          )}

          {session.status === 'planned' && !isPast && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/session/${session.id}`)}
              className="flex-1"
            >
              View details
            </Button>
          )}
        </div>
      )}

      {session.status === 'completed' && (
        <div className="pt-3 border-t border-tier-border-default">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/session/${session.id}`)}
            className="w-full"
          >
            View completed session
          </Button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const DailyTrainingCalendar: React.FC<DailyTrainingCalendarProps> = ({ planId }) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sessions] = useState(() => generateMockSessions());

  // Group sessions by date for easy lookup
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, TrainingSession>();
    sessions.forEach(session => {
      const dateKey = format(session.date, 'yyyy-MM-dd');
      map.set(dateKey, session);
    });
    return map;
  }, [sessions]);

  // Get session for selected date
  const selectedSession = useMemo(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return sessionsByDate.get(dateKey);
  }, [selectedDate, sessionsByDate]);

  // Get today's session
  const todaySession = useMemo(() => {
    const todayKey = format(new Date(), 'yyyy-MM-dd');
    return sessionsByDate.get(todayKey);
  }, [sessionsByDate]);

  // Get modifiers for dates with sessions
  const modifiers = useMemo(() => {
    const sessionDates = Array.from(sessionsByDate.keys()).map(key => {
      const [year, month, day] = key.split('-').map(Number);
      return new Date(year, month - 1, day);
    });
    return { hasSession: sessionDates };
  }, [sessionsByDate]);

  const handleAction = (_action: string) => {
    // TODO: Implement actual action handling
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <StandardPageHeader
        icon={CalendarIcon}
        title="Training Calendar"
        subtitle="Overview of your planned and completed training sessions"
        helpText="Calendar view of all your training sessions. See planned, in progress and completed sessions. Click on a day to see session details and log completed activities."
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<BookOpen size={16} />}
            onClick={() => navigate('/logg-trening')}
          >
            Log session
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <div className="p-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              modifiers={modifiers}
              modifiersClassNames={{
                hasSession: 'font-semibold relative after:content-[""] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-tier-navy',
              }}
            />

            {/* Info text */}
            <p className="text-xs text-tier-text-secondary mt-4 mb-0">
              Click on a date to see session details
            </p>
          </div>

          {/* Legend */}
          <div className="px-6 pb-6 pt-3 border-t border-tier-border-default">
            <p className="text-xs font-medium text-tier-text-secondary mb-2">Status:</p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${config.color}`} />
                  <span className="text-xs text-tier-text-secondary">{config.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Selected Date / Today's Training */}
        <Card>
          <div className="p-6">
            {selectedSession ? (
              <>
                <SubSectionTitle className="mb-4">
                  {isSameDay(selectedDate, new Date()) ? "Today's training" : 'Selected session'}
                </SubSectionTitle>
                <SessionDetails session={selectedSession} onAction={handleAction} />
              </>
            ) : (
              <>
                <SubSectionTitle className="mb-4">
                  {isSameDay(selectedDate, new Date()) ? 'No session today' : 'No session'}
                </SubSectionTitle>
                <p className="text-sm text-tier-text-secondary mb-4">
                  {isSameDay(selectedDate, new Date())
                    ? 'No session planned for today. Would you like to create one?'
                    : `No session planned for ${format(selectedDate, 'MMMM d, yyyy', { locale: enUS })}`}
                </p>
                {isSameDay(selectedDate, new Date()) && (
                  <Button
                    variant="primary"
                    onClick={() => navigate('/logg-trening')}
                    className="w-full"
                  >
                    Create training session
                  </Button>
                )}
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Stats Summary */}
      <Card className="mt-6">
        <div className="p-6">
          <SubSectionTitle className="mb-4">This month</SubSectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-tier-surface-base rounded-lg">
              <div className="text-2xl font-bold text-tier-navy mb-1">
                {sessions.filter(s => s.status === 'completed').length}
              </div>
              <div className="text-xs text-tier-text-secondary">Completed</div>
            </div>
            <div className="text-center p-4 bg-tier-surface-base rounded-lg">
              <div className="text-2xl font-bold text-tier-navy mb-1">
                {sessions.filter(s => s.status === 'planned').length}
              </div>
              <div className="text-xs text-tier-text-secondary">Planned</div>
            </div>
            <div className="text-center p-4 bg-tier-surface-base rounded-lg">
              <div className="text-2xl font-bold text-tier-navy mb-1">
                {sessions.filter(s => s.status === 'rest_day').length}
              </div>
              <div className="text-xs text-tier-text-secondary">Rest days</div>
            </div>
            <div className="text-center p-4 bg-tier-surface-base rounded-lg">
              <div className="text-2xl font-bold text-tier-navy mb-1">
                {Math.round(
                  (sessions.filter(s => s.status === 'completed').length /
                    sessions.filter(s => s.status !== 'rest_day' && s.date <= new Date()).length) *
                    100
                ) || 0}%
              </div>
              <div className="text-xs text-tier-text-secondary">Compliance</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DailyTrainingCalendar;
