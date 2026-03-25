/**
 * UkensTreningsplanContainer.jsx
 * Design System v3.0 - Premium Light
 *
 * Integrert med AK_GOLF_KATEGORI_HIERARKI_v2.0
 * Bruker pyramide-systemet: FYS → TEK → SLAG → SPILL → TURN
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 * UPDATED: Integrated with CalendarWeekGrid for time-based view
 */
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Calendar, Clock, Target, CheckCircle, ChevronRight, ChevronLeft,
  Dumbbell, Brain, Flag, RotateCcw, Flame, X, Plus, FileText,
  MoreHorizontal, Trophy, Crosshair, Grid, List
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { AICoachGuide } from '../ai-coach';
import { GUIDE_PRESETS } from '../ai-coach/types';
import { CalendarWeekGrid } from '../calendar/components/enhanced/CalendarWeekGrid';
import { SectionTitle } from '../../ui/primitives/typography';

// =============================================================================
// AK HIERARCHY CONFIGURATION (from AK_GOLF_KATEGORI_HIERARKI_v2.0)
// =============================================================================

// Pyramid-based session types (replaces old SESSION_TYPE_CLASSES)
const PYRAMID_CLASSES = {
  FYS: {
    text: 'text-red-600',
    bg: 'bg-red-500/10',
    activeBg: 'bg-red-500',
    icon: Dumbbell,
    emoji: '',
    label: 'Physical',
    description: 'Strength, power, mobility',
  },
  TEK: {
    text: 'text-tier-navy',
    bg: 'bg-tier-navy/10',
    activeBg: 'bg-tier-navy',
    icon: Target,
    emoji: '',
    label: 'Technique',
    description: 'Movement patterns, positions',
  },
  SLAG: {
    text: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    activeBg: 'bg-emerald-500',
    icon: Crosshair,
    emoji: '',
    label: 'Golf Shots',
    description: 'Shot quality, accuracy',
  },
  SPILL: {
    text: 'text-amber-600',
    bg: 'bg-amber-500/10',
    activeBg: 'bg-amber-500',
    icon: Flag,
    emoji: '',
    label: 'Play',
    description: 'Strategy, course management',
  },
  TURN: {
    text: 'text-purple-600',
    bg: 'bg-purple-500/10',
    activeBg: 'bg-purple-500',
    icon: Trophy,
    emoji: '',
    label: 'Tournament',
    description: 'Mental performance',
  },
  REST: {
    text: 'text-tier-text-secondary',
    bg: 'bg-tier-surface-base',
    activeBg: 'bg-tier-text-secondary',
    icon: RotateCcw,
    emoji: '',
    label: 'Rest',
    description: 'Recovery',
  },
};

// L-Phase labels for display
const L_PHASE_LABELS = {
  'L-BODY': 'Body',
  'L-ARM': 'Arm',
  'L-CLUB': 'Club',
  'L-BALL': 'Ball',
  'L-AUTO': 'Auto',
};

// Environment labels
const ENVIRONMENT_LABELS = {
  M0: 'Gym',
  M1: 'Simulator',
  M2: 'Range',
  M3: 'Practice Area',
  M4: 'Course',
  M5: 'Tournament',
};

// Legacy mapping for backwards compatibility
const SESSION_TYPE_CLASSES = {
  technical: PYRAMID_CLASSES.TEK,
  physical: PYRAMID_CLASSES.FYS,
  mental: PYRAMID_CLASSES.TURN, // Mental maps to TURN
  short_game: PYRAMID_CLASSES.SLAG,
  warmup: { ...PYRAMID_CLASSES.FYS, label: 'Warm-up' },
  rest: PYRAMID_CLASSES.REST,
  // Direct pyramid mappings
  FYS: PYRAMID_CLASSES.FYS,
  TEK: PYRAMID_CLASSES.TEK,
  SLAG: PYRAMID_CLASSES.SLAG,
  SPILL: PYRAMID_CLASSES.SPILL,
  TURN: PYRAMID_CLASSES.TURN,
  REST: PYRAMID_CLASSES.REST,
};

// ============================================================================
// MOCK DATA - Will be replaced with API data
// ============================================================================

const getWeekDates = (weekOffset = 0) => {
  const now = new Date();
  const currentDay = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + (weekOffset * 7));

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  return dates;
};

const WEEK_DATA = {
  weekNumber: 1,
  theme: 'Long game and strength',
  period: 'Winter Training',
  totalPlannedHours: 12,
  completedHours: 5.5,
  days: [
    {
      dayName: 'Monday',
      date: '2025-12-29',
      isToday: false,
      isCompleted: true,
      sessions: [
        {
          id: 's1',
          type: 'FYS',
          pyramid: 'FYS',
          name: 'Strength Training',
          formula: 'FYS_STYRKE_M0',
          lPhase: null,
          csLevel: null,
          environment: 'M0',
          pressure: 'PR1',
          duration: 60,
          startTime: '07:00',
          status: 'completed',
          description: 'Focus on core and rotation. 3 sets of each exercise.',
          exercises: ['Plank 3x60s', 'Russian twists 3x20', 'Cable rotations 3x15'],
        },
        {
          id: 's2',
          type: 'TURN',
          pyramid: 'TURN',
          name: 'Visualization',
          formula: 'TURN_UTV_M0_PR1',
          duration: 20,
          startTime: '18:00',
          status: 'completed',
          description: 'Visualize perfect shots on the driving range.',
        },
      ],
    },
    {
      dayName: 'Tuesday',
      date: '2025-12-30',
      isToday: false,
      isCompleted: true,
      sessions: [
        {
          id: 's3',
          type: 'TEK',
          pyramid: 'TEK',
          name: 'Simulator - Driver',
          formula: 'TEK_TEE_L-BALL_CS60_M1_PR2',
          lPhase: 'L-BALL',
          csLevel: 60,
          environment: 'M1',
          pressure: 'PR2',
          duration: 90,
          startTime: '09:00',
          status: 'completed',
          description: 'Focus on consistent contact and ball flight.',
          exercises: ['Warm-up 20 balls', 'Alignment drill', 'Tempo drill 1-2-3', 'Full swing with target'],
        },
        {
          id: 's4',
          type: 'SLAG',
          pyramid: 'SLAG',
          name: 'Putting Drill',
          formula: 'SLAG_PUTT5-10_M3_PR2_SPEED',
          environment: 'M3',
          pressure: 'PR2',
          duration: 30,
          startTime: '14:00',
          status: 'completed',
          description: 'Gate putting and distance control.',
        },
      ],
    },
    {
      dayName: 'Wednesday',
      date: '2025-12-31',
      isToday: true,
      isCompleted: false,
      sessions: [
        { id: 's5', type: 'REST', pyramid: 'REST', name: 'Rest Day', duration: 0, status: 'pending' },
      ],
    },
    {
      dayName: 'Thursday',
      date: '2026-01-01',
      isToday: false,
      isCompleted: false,
      sessions: [
        {
          id: 's6',
          type: 'TEK',
          pyramid: 'TEK',
          name: 'Long Irons',
          formula: 'TEK_INN150_L-BALL_CS70_M2_PR2_P4.0-P7.0',
          lPhase: 'L-BALL',
          csLevel: 70,
          environment: 'M2',
          pressure: 'PR2',
          positionStart: 'P4.0',
          positionEnd: 'P7.0',
          duration: 120,
          startTime: '09:00',
          status: 'pending',
          description: 'Precision and distance control with 4-6 irons.',
          exercises: ['6-iron to target 147m', '5-iron to target 160m', '4-iron to target 175m'],
        },
        {
          id: 's7',
          type: 'SLAG',
          pyramid: 'SLAG',
          name: 'Chipping',
          formula: 'SLAG_CHIP_M3_PR2_P6.0-P8.0',
          environment: 'M3',
          pressure: 'PR2',
          duration: 40,
          startTime: '14:00',
          status: 'pending',
          description: 'Chip from tight lie and fringe.',
        },
      ],
    },
    {
      dayName: 'Friday',
      date: '2026-01-02',
      isToday: false,
      isCompleted: false,
      sessions: [
        {
          id: 's8',
          type: 'FYS',
          pyramid: 'FYS',
          name: 'Mobility',
          formula: 'FYS_MOBILITET_M0',
          environment: 'M0',
          duration: 45,
          startTime: '07:00',
          status: 'pending',
          description: 'Dynamic stretching and mobility training.',
        },
        {
          id: 's9',
          type: 'TURN',
          pyramid: 'TURN',
          name: 'Mental Preparation',
          formula: 'TURN_UTV_M0_PR2',
          duration: 30,
          startTime: '18:00',
          status: 'pending',
          description: 'Pre-round routine and focus exercises.',
        },
      ],
    },
    {
      dayName: 'Saturday',
      date: '2026-01-03',
      isToday: false,
      isCompleted: false,
      sessions: [
        {
          id: 's10',
          type: 'SPILL',
          pyramid: 'SPILL',
          name: 'Simulated Round',
          formula: 'SPILL_BANE_CS90_M4_PR4_STRATEGI',
          csLevel: 90,
          environment: 'M4',
          pressure: 'PR4',
          duration: 150,
          startTime: '10:00',
          status: 'pending',
          description: 'Full 18-hole simulation on TrackMan.',
          exercises: ['Pre-shot routine', 'Course management', 'Scoring focus'],
        },
      ],
    },
    {
      dayName: 'Sunday',
      date: '2026-01-04',
      isToday: false,
      isCompleted: false,
      sessions: [
        { id: 's11', type: 'REST', pyramid: 'REST', name: 'Rest Day', duration: 0, status: 'pending' },
      ],
    },
  ],
  weeklyGoals: [
    { text: 'Complete all planned strength sessions', progress: 50 },
    { text: 'Minimum 200 balls with driver', progress: 75 },
    { text: '2 hours putting practice', progress: 30 },
  ],
  stats: {
    technicalHours: 6,
    physicalHours: 2,
    mentalHours: 1,
    shortGameHours: 1.5,
    restDays: 2,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getSessionTypeConfig = (type) => {
  return SESSION_TYPE_CLASSES[type] || SESSION_TYPE_CLASSES.rest;
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { day: 'numeric' });
};

const formatFullDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
};

// ============================================================================
// SESSION TO CALENDAR EVENT TRANSFORMATION
// ============================================================================

/**
 * Convert training plan sessions to calendar events
 * Assigns default times based on session type and order
 */
const sessionsToCalendarEvents = (weekData) => {
  const events = [];

  // Default time assignments by session type
  const defaultTimes = {
    FYS: '07:00',      // Fysisk - morning
    TEK: '09:00',      // Teknikk - mid-morning
    SLAG: '14:00',     // Golfslag - afternoon
    SPILL: '10:00',    // Spill - morning
    TURN: '18:00',     // Turnering/mental - evening
    REST: null,        // Rest days - no time
  };

  weekData.days.forEach((day) => {
    let currentHour = 7; // Start assigning from 7:00

    day.sessions.forEach((session, idx) => {
      if (session.type === 'REST') return; // Skip rest days

      // Use session's assigned time or calculate based on order
      const startTime = session.startTime || defaultTimes[session.type] || `${String(currentHour).padStart(2, '0')}:00`;
      const [startHour, startMin] = startTime.split(':').map(Number);

      const durationHours = Math.floor(session.duration / 60);
      const durationMins = session.duration % 60;

      let endHour = startHour + durationHours;
      let endMin = startMin + durationMins;

      if (endMin >= 60) {
        endHour += 1;
        endMin -= 60;
      }

      const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

      // Map session type to calendar category
      const categoryMap = {
        FYS: 'trening',
        TEK: 'trening',
        SLAG: 'trening',
        SPILL: 'trening',
        TURN: 'mental',
      };

      // Map status
      const statusMap = {
        completed: 'completed',
        in_progress: 'in_progress',
        pending: 'planned',
      };

      events.push({
        id: session.id,
        title: session.name,
        date: day.date,
        start: startTime,
        end: endTime,
        location: session.environment ? ENVIRONMENT_LABELS[session.environment] : undefined,
        category: categoryMap[session.type] || 'trening',
        status: statusMap[session.status] || 'planned',
        // Store original session for details
        _originalSession: session,
      });

      // Increment time for next session (add buffer time)
      currentHour = endHour + 1;
      if (currentHour > 21) currentHour = 7; // Wrap around
    });
  });

  return events;
};

// ============================================================================
// SESSION CHIP COMPONENT (Notion-style)
// ============================================================================

const SessionChip = ({ session, isSelected, onClick }) => {
  const config = getSessionTypeConfig(session.type);
  const Icon = config.icon;
  const isRest = session.type === 'rest' || session.type === 'REST';
  const isCompleted = session.status === 'completed';
  const pyramidConfig = session.pyramid ? PYRAMID_CLASSES[session.pyramid] : null;

  if (isRest) {
    return (
      <div className="py-1.5 px-2.5 text-xs text-tier-text-secondary italic">
        Rest Day
      </div>
    );
  }

  // Build subtitle from AK hierarchy data
  const subtitleParts = [];
  if (session.lPhase && L_PHASE_LABELS[session.lPhase]) {
    subtitleParts.push(L_PHASE_LABELS[session.lPhase]);
  }
  if (session.csLevel) {
    subtitleParts.push(`CS${session.csLevel}`);
  }
  if (session.environment && ENVIRONMENT_LABELS[session.environment]) {
    subtitleParts.push(ENVIRONMENT_LABELS[session.environment]);
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(session);
      }}
      data-session-chip
      className={`flex flex-col gap-0.5 py-1.5 px-2.5 border-none rounded-md text-xs font-medium cursor-pointer w-full text-left transition-all duration-150 ${
        isSelected
          ? `${config.activeBg} text-white`
          : `${config.bg} ${config.text} hover:opacity-80`
      } ${isCompleted ? 'opacity-70' : ''}`}
    >
      <div className="flex items-center gap-1.5">
        {pyramidConfig?.emoji && <span className="text-sm">{pyramidConfig.emoji}</span>}
        {!pyramidConfig?.emoji && (isCompleted ? <CheckCircle size={12} /> : <Icon size={12} />)}
        <span className={`flex-1 overflow-hidden text-ellipsis whitespace-nowrap ${isCompleted ? 'line-through' : ''}`}>
          {session.name}
        </span>
        <span className="text-[10px] opacity-80">
          {session.duration}m
        </span>
      </div>
      {subtitleParts.length > 0 && (
        <div className={`text-[10px] opacity-70 ${isSelected ? 'text-white/80' : ''}`}>
          {subtitleParts.join(' • ')}
        </div>
      )}
    </button>
  );
};

// ============================================================================
// DAY COLUMN COMPONENT (Notion-style)
// ============================================================================

const DayColumn = ({ day, selectedSessionId, onSessionClick }) => {
  const isToday = day.isToday;
  const dayNumber = formatDate(day.date);
  const dayName = day.dayName.slice(0, 3);

  return (
    <div className="flex-1 min-w-0 border-r border-tier-border-default flex flex-col">
      {/* Day Header */}
      <div className={`py-3 px-2 border-b border-tier-border-default text-center relative ${
        isToday ? 'bg-tier-navy/5' : ''
      }`}>
        {isToday && (
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-tier-navy" />
        )}
        <div className={`text-[11px] font-medium uppercase tracking-wide ${
          isToday ? 'text-tier-navy' : 'text-tier-text-secondary'
        }`}>
          {dayName}
        </div>
        <div className={`text-xl font-semibold mt-0.5 ${
          isToday ? 'text-tier-navy' : 'text-tier-navy'
        }`}>
          {dayNumber}
        </div>
        {isToday && (
          <div className="mt-1 text-[9px] font-semibold text-tier-navy uppercase tracking-wide">
            Today
          </div>
        )}
      </div>

      {/* Sessions */}
      <div className={`flex-1 p-2 flex flex-col gap-1.5 min-h-[120px] ${
        day.isCompleted ? 'bg-tier-surface-base' : ''
      }`}>
        {day.sessions.map((session) => (
          <SessionChip
            key={session.id}
            session={session}
            isSelected={selectedSessionId === session.id}
            onClick={onSessionClick}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// SESSION SIDEBAR DRAWER COMPONENT
// ============================================================================

const SessionSidebarDrawer = ({ isOpen, session, onClose, allSessions, onSessionSelect }) => {
  const drawerRef = useRef(null);
  const config = session ? getSessionTypeConfig(session.type) : null;

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target) && isOpen) {
        if (e.target.closest('[data-session-chip]')) return;
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/10 transition-all duration-200 z-40 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        role="complementary"
        aria-label="Session details"
        className={`fixed top-0 left-0 bottom-0 w-[380px] bg-tier-white z-50 flex flex-col overflow-hidden transition-transform duration-[250ms] ${
          isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between py-4 px-5 border-b border-tier-border-default">
          <SectionTitle style={{ marginBottom: 0 }}>
            {session ? 'Session Details' : 'Overview'}
          </SectionTitle>
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="flex items-center justify-center w-8 h-8 border-none bg-transparent rounded-md cursor-pointer text-tier-text-secondary hover:bg-tier-surface-base"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          {session ? (
            // Session Details View
            <div>
              {/* Session Title */}
              <div className="mb-5">
                <div className={`inline-flex items-center gap-1.5 py-1 px-2.5 ${config.bg} ${config.text} rounded-md text-[11px] font-semibold mb-3`}>
                  {React.createElement(config.icon, { size: 12 })}
                  {config.label}
                </div>
                <h3 className="text-xl font-semibold text-tier-navy m-0">
                  {session.name}
                </h3>
              </div>

              {/* Metadata */}
              <div className="flex flex-col gap-3 p-4 bg-tier-surface-base rounded-lg mb-5">
                <div className="flex items-center gap-2.5">
                  <Calendar size={14} className="text-tier-text-secondary" />
                  <span className="text-[13px] text-tier-navy">
                    {formatFullDate(WEEK_DATA.days.find(d => d.sessions.some(s => s.id === session.id))?.date)}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock size={14} className="text-tier-text-secondary" />
                  <span className="text-[13px] text-tier-navy">
                    {session.duration} minutes
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  {session.status === 'completed' ? (
                    <>
                      <CheckCircle size={14} className="text-tier-success" />
                      <span className="text-[13px] text-tier-success font-medium">
                        Completed
                      </span>
                    </>
                  ) : session.status === 'in_progress' ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full bg-tier-info" />
                      <span className="text-[13px] text-tier-info font-medium">
                        In Progress
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-tier-text-secondary" />
                      <span className="text-[13px] text-tier-text-secondary">
                        Planned
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              {session.description && (
                <div className="mb-5">
                  <h4 className="text-xs font-semibold text-tier-text-secondary uppercase tracking-wide mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-tier-navy leading-relaxed m-0">
                    {session.description}
                  </p>
                </div>
              )}

              {/* Exercises */}
              {session.exercises && session.exercises.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-xs font-semibold text-tier-text-secondary uppercase tracking-wide mb-2">
                    Exercises
                  </h4>
                  <ul className="m-0 p-0 list-none">
                    {session.exercises.map((exercise, idx) => (
                      <li
                        key={idx}
                        className={`flex items-center gap-2.5 py-2.5 ${
                          idx < session.exercises.length - 1 ? 'border-b border-tier-border-default' : ''
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${config.activeBg} shrink-0`} />
                        <span className="text-[13px] text-tier-navy">
                          {exercise}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {session.status !== 'completed' && (
                  <button className="flex items-center justify-center gap-2 py-3 px-4 bg-tier-navy text-white border-none rounded-lg text-sm font-medium cursor-pointer">
                    <CheckCircle size={16} />
                    Mark as completed
                  </button>
                )}
                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-transparent text-tier-navy border border-tier-border-default rounded-lg text-sm font-medium cursor-pointer">
                  <FileText size={16} />
                  Add note
                </button>
              </div>
            </div>
          ) : (
            // Overview View (when no session selected)
            <div>
              {/* Today's Sessions */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-tier-text-secondary uppercase tracking-wide mb-3">
                  Today's Sessions
                </h4>
                <div className="flex flex-col gap-2">
                  {allSessions
                    .filter(s => {
                      const day = WEEK_DATA.days.find(d => d.sessions.some(sess => sess.id === s.id));
                      return day?.isToday;
                    })
                    .map(sess => {
                      const cfg = getSessionTypeConfig(sess.type);
                      return (
                        <button
                          key={sess.id}
                          onClick={() => onSessionSelect(sess)}
                          className="flex items-center gap-2.5 p-3 bg-tier-surface-base border-none rounded-lg cursor-pointer text-left w-full"
                        >
                          <div className={`w-8 h-8 rounded-md ${cfg.bg} flex items-center justify-center`}>
                            {React.createElement(cfg.icon, { size: 16, className: cfg.text })}
                          </div>
                          <div className="flex-1">
                            <div className="text-[13px] font-medium text-tier-navy">
                              {sess.name}
                            </div>
                            <div className="text-xs text-tier-text-secondary">
                              {sess.duration} min
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-tier-text-secondary" />
                        </button>
                      );
                    })}
                  {allSessions.filter(s => {
                    const day = WEEK_DATA.days.find(d => d.sessions.some(sess => sess.id === s.id));
                    return day?.isToday;
                  }).length === 0 && (
                    <p className="text-[13px] text-tier-text-secondary italic">
                      No sessions planned today
                    </p>
                  )}
                </div>
              </div>

              {/* Week Summary */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-tier-text-secondary uppercase tracking-wide mb-3">
                  Week Overview
                </h4>
                <div className="p-4 bg-tier-surface-base rounded-lg">
                  <div className="flex justify-between mb-3">
                    <span className="text-[13px] text-tier-text-secondary">Completed</span>
                    <span className="text-sm font-semibold text-tier-navy">
                      {WEEK_DATA.completedHours}h / {WEEK_DATA.totalPlannedHours}h
                    </span>
                  </div>
                  <div className="h-1.5 bg-tier-border-default rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-tier-navy rounded-sm"
                      style={{ width: `${(WEEK_DATA.completedHours / WEEK_DATA.totalPlannedHours) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="text-xs font-semibold text-tier-text-secondary uppercase tracking-wide mb-3">
                  Categories
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['technical', 'physical', 'mental', 'short_game'].map(type => {
                    const cfg = getSessionTypeConfig(type);
                    return (
                      <div
                        key={type}
                        className={`flex items-center gap-1.5 py-1.5 px-3 ${cfg.bg} rounded-md text-xs font-medium ${cfg.text}`}
                      >
                        {React.createElement(cfg.icon, { size: 12 })}
                        {cfg.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

// ============================================================================
// WEEK STATS BAR (Notion-style minimal)
// ============================================================================

const WeekStatsBar = ({ stats, completedHours, totalHours }) => {
  const progressPercent = Math.round((completedHours / totalHours) * 100);

  return (
    <div className="flex items-center gap-6 py-3 px-5 bg-tier-white border-b border-tier-border-default text-[13px]">
      <div className="flex items-center gap-2">
        <span className="text-tier-text-secondary">Progress:</span>
        <span className="font-semibold text-tier-navy">{progressPercent}%</span>
        <div className="w-20 h-1 bg-tier-border-default rounded-sm overflow-hidden">
          <div
            className="h-full bg-tier-navy rounded-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="w-px h-4 bg-tier-border-default" />

      <div className="flex items-center gap-1.5">
        <Clock size={14} className="text-tier-text-secondary" />
        <span className="text-tier-text-secondary">{completedHours}h completed</span>
        <span className="text-tier-text-secondary/50">/</span>
        <span className="text-tier-text-secondary">{totalHours}h planned</span>
      </div>

      <div className="w-px h-4 bg-tier-border-default" />

      <div className="flex items-center gap-3">
        {[
          { type: 'technical', hours: stats.technicalHours },
          { type: 'physical', hours: stats.physicalHours },
          { type: 'mental', hours: stats.mentalHours },
          { type: 'short_game', hours: stats.shortGameHours },
        ].map(({ type, hours }) => {
          const cfg = getSessionTypeConfig(type);
          return (
            <div key={type} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-sm ${cfg.activeBg}`} />
              <span className="text-tier-text-secondary">{hours}t</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UkensTreningsplanContainer = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'

  const weekDates = getWeekDates(weekOffset);
  const startDate = weekDates[0].toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  const endDate = weekDates[6].toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

  // Get all sessions flat
  const allSessions = WEEK_DATA.days.flatMap(day => day.sessions);
  const selectedSession = allSessions.find(s => s.id === selectedSessionId);

  // Convert sessions to calendar events
  const calendarEvents = useMemo(() => {
    return sessionsToCalendarEvents(WEEK_DATA);
  }, []);

  const handleSessionClick = useCallback((session) => {
    setSelectedSessionId(session.id);
    setIsSidebarOpen(true);
  }, []);

  const handleCalendarEventClick = useCallback((event) => {
    // If event has original session data, use that
    const session = event._originalSession || allSessions.find(s => s.id === event.id);
    if (session) {
      handleSessionClick(session);
    }
  }, [allSessions, handleSessionClick]);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
    setTimeout(() => setSelectedSessionId(null), 200);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    if (isSidebarOpen) {
      handleCloseSidebar();
    } else {
      setSelectedSessionId(null);
      setIsSidebarOpen(true);
    }
  }, [isSidebarOpen, handleCloseSidebar]);

  return (
    <div className="min-h-screen bg-tier-white">
      {/* Page Header */}
      <PageHeader
        title="Weekly Training Plan"
        subtitle="Your plan for this week"
        helpText="View your weekly training plan with all scheduled sessions. Track progress and adjust the plan as needed."
      />

      {/* AI Coach Guide */}
      <div className="px-5 mb-3">
        <AICoachGuide config={GUIDE_PRESETS.weeklyPlan} variant="compact" />
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center justify-between py-3 px-5 border-b border-tier-border-default bg-tier-white">
        <div className="flex items-center gap-3">
          {/* Sidebar Toggle */}
          <button
            onClick={handleToggleSidebar}
            className={`flex items-center justify-center w-8 h-8 border border-tier-border-default rounded-md cursor-pointer text-tier-text-secondary ${
              isSidebarOpen ? 'bg-tier-surface-base' : 'bg-tier-white'
            }`}
            aria-label="Toggle sidebar"
          >
            <MoreHorizontal size={16} />
          </button>

          {/* Week Navigation */}
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="flex items-center justify-center w-8 h-8 border border-tier-border-default rounded-md bg-tier-white cursor-pointer text-tier-navy"
            aria-label="Previous week"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="flex items-center justify-center w-8 h-8 border border-tier-border-default rounded-md bg-tier-white cursor-pointer text-tier-navy"
            aria-label="Next week"
          >
            <ChevronRight size={16} />
          </button>

          {/* Week Info */}
          <div className="ml-2">
            <span className="text-[15px] font-semibold text-tier-navy">
              Week {WEEK_DATA.weekNumber}
            </span>
            <span className="text-sm text-tier-text-secondary ml-2">
              {startDate} – {endDate}
            </span>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-tier-surface-base rounded-md">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 py-1.5 px-3 border-none rounded text-xs font-medium cursor-pointer transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-tier-white text-tier-navy shadow-sm'
                  : 'bg-transparent text-tier-text-secondary hover:text-tier-navy'
              }`}
              aria-label="Calendar view"
            >
              <Grid size={14} />
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 py-1.5 px-3 border-none rounded text-xs font-medium cursor-pointer transition-colors ${
                viewMode === 'list'
                  ? 'bg-tier-white text-tier-navy shadow-sm'
                  : 'bg-transparent text-tier-text-secondary hover:text-tier-navy'
              }`}
              aria-label="List view"
            >
              <List size={14} />
              List
            </button>
          </div>

          <div className="flex items-center gap-1.5 py-1.5 px-3 bg-tier-navy/10 rounded-md text-xs font-medium text-tier-navy">
            <Calendar size={12} />
            {WEEK_DATA.period}
          </div>

          <button className="flex items-center gap-1.5 py-2 px-3.5 bg-tier-navy text-white border-none rounded-md text-[13px] font-medium cursor-pointer">
            <Plus size={14} />
            Add session
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <WeekStatsBar
        stats={WEEK_DATA.stats}
        completedHours={WEEK_DATA.completedHours}
        totalHours={WEEK_DATA.totalPlannedHours}
      />

      {/* View Content */}
      {viewMode === 'calendar' ? (
        /* Calendar Week Grid View */
        <div className="h-[calc(100vh-340px)]">
          <CalendarWeekGrid
            weekDates={weekDates}
            events={calendarEvents}
            onEventClick={handleCalendarEventClick}
            startHour={6}
            endHour={22}
          />
        </div>
      ) : (
        /* Original List View */
        <div className="flex border-b border-tier-border-default min-h-[calc(100vh-280px)]">
          {WEEK_DATA.days.map((day, idx) => (
            <DayColumn
              key={idx}
              day={day}
              selectedSessionId={selectedSessionId}
              onSessionClick={handleSessionClick}
            />
          ))}
        </div>
      )}

      {/* Sidebar Drawer */}
      <SessionSidebarDrawer
        isOpen={isSidebarOpen}
        session={selectedSession}
        onClose={handleCloseSidebar}
        allSessions={allSessions}
        onSessionSelect={handleSessionClick}
      />
    </div>
  );
};

export default UkensTreningsplanContainer;
