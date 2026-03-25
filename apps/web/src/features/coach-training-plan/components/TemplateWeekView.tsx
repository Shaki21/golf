/**
 * TemplateWeekView Component
 * 7-column week grid for template sessions with drag-and-drop
 */

import React, { useMemo } from 'react';
import { format, isToday } from 'date-fns';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TemplateSession } from '../types/template.types';
import TemplateSessionBlock from './TemplateSessionBlock';

interface TemplateWeekViewProps {
  weekNumber: number;
  weekDates: Date[];
  sessions: TemplateSession[];
  onEditSession: (session: TemplateSession) => void;
  selectionMode?: boolean;
  isSelected?: (sessionId: string) => boolean;
  onToggleSelection?: (sessionId: string) => void;
}

const WEEKDAY_LABELS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

interface DayColumnProps {
  date: Date;
  dayOfWeek: number;
  weekNumber: number;
  sessions: TemplateSession[];
  onEditSession: (session: TemplateSession) => void;
  selectionMode?: boolean;
  isSelected?: (sessionId: string) => boolean;
  onToggleSelection?: (sessionId: string) => void;
}

function DayColumn({
  date,
  dayOfWeek,
  weekNumber,
  sessions,
  onEditSession,
  selectionMode,
  isSelected,
  onToggleSelection
}: DayColumnProps) {
  const dropId = `day-${weekNumber}-${dayOfWeek}`;

  const { setNodeRef, isOver } = useDroppable({
    id: dropId,
    data: {
      type: 'day',
      weekNumber,
      dayOfWeek
    }
  });

  const isCurrentDay = isToday(date);
  const totalDuration = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const sessionIds = sessions.map(s => s.id);

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-1 min-w-0 p-2 rounded-lg
        border-2
        ${isCurrentDay ? 'border-tier-gold bg-tier-gold/5' : 'border-tier-navy/10 bg-white'}
        ${isOver ? 'border-tier-navy bg-tier-navy/5' : ''}
        transition-colors
        min-h-[200px]
      `}
    >
      {/* Day header */}
      <div className="mb-3 pb-2 border-b border-tier-navy/10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-tier-navy uppercase">
            {WEEKDAY_LABELS[dayOfWeek]}
          </span>
          {sessions.length > 0 && (
            <span className="text-xs bg-tier-navy text-tier-white px-2 py-0.5 rounded-full">
              {sessions.length}
            </span>
          )}
        </div>
        <div className="text-lg font-bold text-tier-navy">
          {format(date, 'd')}
        </div>
        <div className="text-xs text-tier-navy/60">
          {format(date, 'MMM')}
        </div>
      </div>

      {/* Sessions */}
      <SortableContext items={sessionIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-tier-navy/40 text-sm">
              No sessions
            </div>
          ) : (
            sessions.map(session => (
              <TemplateSessionBlock
                key={session.id}
                session={session}
                onClick={() => onEditSession(session)}
                selectionMode={selectionMode}
                isSelected={isSelected?.(session.id)}
                onToggleSelection={() => onToggleSelection?.(session.id)}
              />
            ))
          )}
        </div>
      </SortableContext>

      {/* Day footer - total duration */}
      {totalDuration > 0 && (
        <div className="mt-3 pt-2 border-t border-tier-navy/10 text-xs text-tier-navy/60 text-center">
          {totalDuration} min total
        </div>
      )}
    </div>
  );
}

export function TemplateWeekView({
  weekNumber,
  weekDates,
  sessions,
  onEditSession,
  selectionMode,
  isSelected,
  onToggleSelection
}: TemplateWeekViewProps) {
  // Group sessions by day of week
  const sessionsByDay = useMemo(() => {
    const grouped: Record<number, TemplateSession[]> = {
      0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
    };

    sessions.forEach(session => {
      if (session.weekNumber === weekNumber) {
        grouped[session.dayOfWeek].push(session);
      }
    });

    return grouped;
  }, [sessions, weekNumber]);

  return (
    <div className="w-full">
      {/* Desktop/Tablet: 7-column grid */}
      <div className="hidden md:grid md:grid-cols-7 gap-3">
        {weekDates.map((date, index) => (
          <DayColumn
            key={index}
            date={date}
            dayOfWeek={index}
            weekNumber={weekNumber}
            sessions={sessionsByDay[index]}
            onEditSession={onEditSession}
            selectionMode={selectionMode}
            isSelected={isSelected}
            onToggleSelection={onToggleSelection}
          />
        ))}
      </div>

      {/* Mobile: Vertical stack */}
      <div className="md:hidden space-y-4">
        {weekDates.map((date, index) => (
          <DayColumn
            key={index}
            date={date}
            dayOfWeek={index}
            weekNumber={weekNumber}
            sessions={sessionsByDay[index]}
            onEditSession={onEditSession}
            selectionMode={selectionMode}
            isSelected={isSelected}
            onToggleSelection={onToggleSelection}
          />
        ))}
      </div>
    </div>
  );
}

export default TemplateWeekView;
