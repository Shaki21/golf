/**
 * CoachCalendarPage.tsx
 *
 * TIER Golf - Coach Calendar
 * Design System v3.1 - Decision-First Architecture
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "What should I focus on today and what approvals need my attention?"
 *
 * INFORMATION ARCHITECTURE:
 * Layer 1 - Decision Hero: Today's date, pending approvals count, next session
 * Layer 2 - Calendar Header: Navigation and view controls
 * Layer 3 - Calendar Grid: Full calendar with sessions
 * Layer 4 - Sidebar: Mini calendar, booking requests, quick actions
 *
 * Features:
 * - Day/Week/Month/Year views
 * - Mini calendar sidebar with booking requests
 * - Session management and player details
 * - Booking approval/decline actions
 * - Dark mode support
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  X,
  MapPin,
  Clock,
  User,
  Calendar as CalendarIcon,
  Check,
  ChevronRight,
  Bell,
  Settings,
  ArrowRight,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import clsx from 'clsx';
import { sessionsAPI, calendarAPI, trainingPlanAPI } from '../../services/api';

import {
  CalendarHeader,
  CalendarMonthGrid,
  CalendarWeekGrid,
  CalendarMiniMonth,
  type CalendarView,
  type CalendarEvent,
} from './components/enhanced';
import { CalendarColorLegend } from './components/CalendarColorLegend';
import { SubSectionTitle, SectionTitle } from '../../components/typography/Headings';

// ============================================================================
// TYPES
// ============================================================================

interface BookingRequest {
  id: string;
  playerId: string;
  playerName: string;
  playerInitials: string;
  date: string;
  startTime: string;
  endTime: string;
  sessionType: string;
  notes?: string;
  requestedAt: string;
}

interface CoachSession extends CalendarEvent {
  playerId?: string;
  playerName?: string;
  playerInitials?: string;
  sessionType?: string;
  notes?: string;
  isBooking?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getMonthName(date: Date): string {
  return date.toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' });
}

function getWeekRange(date: Date): string {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const startStr = weekStart.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
  const endStr = weekEnd.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });

  return `${startStr} - ${endStr}`;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDates(date: Date): Date[] {
  const weekStart = getWeekStart(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

function getMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start, end };
}

// ============================================================================
// MOCK DATA
// ============================================================================

function generateMockSessions(rangeStart: Date, rangeEnd: Date): CoachSession[] {
  const sessions: CoachSession[] = [];
  const players = [
    { id: 'p1', name: 'Anders Hansen', initials: 'AH' },
    { id: 'p2', name: 'Sofie Andersen', initials: 'SA' },
    { id: 'p3', name: 'Erik Johansen', initials: 'EJ' },
    { id: 'p4', name: 'Maria Olsen', initials: 'MO' },
  ];

  const sessionTypes = [
    'Individuell økt',
    'Videoanalyse',
    'På banen',
    'Gruppe-trening',
    'Putting-fokus',
  ];

  let currentDate = new Date(rangeStart);
  let sessionId = 1;

  while (currentDate <= rangeEnd) {
    const dayOfWeek = currentDate.getDay();

    // Skip Sunday
    if (dayOfWeek !== 0) {
      const numSessions = dayOfWeek === 6 ? 2 : Math.floor(Math.random() * 3) + 1;
      const usedTimes = new Set<string>();

      for (let i = 0; i < numSessions; i++) {
        const possibleTimes = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
        const availableTimes = possibleTimes.filter((t) => !usedTimes.has(t));
        if (availableTimes.length === 0) break;

        const startTime = availableTimes[Math.floor(Math.random() * availableTimes.length)];
        usedTimes.add(startTime);

        const startHour = parseInt(startTime.split(':')[0]);
        const endTime = `${(startHour + 1).toString().padStart(2, '0')}:00`;

        const player = players[Math.floor(Math.random() * players.length)];
        const sessionType = sessionTypes[Math.floor(Math.random() * sessionTypes.length)];

        const status = Math.random() < 0.2 ? 'completed' : 'planned';
        const color = status === 'completed' ? 'green' : 'blue';

        sessions.push({
          id: `session-${sessionId++}`,
          title: `${player.name.split(' ')[0]} - ${sessionType}`,
          date: formatDateKey(currentDate),
          start: startTime,
          end: endTime,
          status: status as 'planned' | 'completed',
          category: 'coach',
          color: color as 'blue' | 'green',
          location: 'TIER Golf',
          playerId: player.id,
          playerName: player.name,
          playerInitials: player.initials,
          sessionType,
          isBooking: true,
        });
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return sessions;
}

function generateMockBookingRequests(): BookingRequest[] {
  return [
    {
      id: 'req-1',
      playerId: 'p5',
      playerName: 'Lars Berg',
      playerInitials: 'LB',
      date: formatDateKey(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)),
      startTime: '14:00',
      endTime: '15:00',
      sessionType: 'Individuell økt',
      notes: 'Ønsker fokus på driving',
      requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'req-2',
      playerId: 'p6',
      playerName: 'Kristine Holm',
      playerInitials: 'KH',
      date: formatDateKey(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
      startTime: '10:00',
      endTime: '11:00',
      sessionType: 'Videoanalyse',
      requestedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'req-3',
      playerId: 'p7',
      playerName: 'Petter Nilsen',
      playerInitials: 'PN',
      date: formatDateKey(new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)),
      startTime: '09:00',
      endTime: '10:00',
      sessionType: 'På banen',
      notes: 'Trenger hjelp med korspill',
      requestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

// ============================================================================
// CALENDAR HERO - Decision-First Component
// ============================================================================

interface CalendarHeroProps {
  todaysSessions: CoachSession[];
  pendingApprovals: number;
  nextSession: CoachSession | null;
  onViewToday: () => void;
  onApproveBookings: () => void;
}

/**
 * CalendarHero - Decision-First Hero Component
 *
 * Answers the primary job-to-be-done question:
 * "What should I focus on today and what approvals need my attention?"
 *
 * Displays:
 * - Today's date prominently
 * - Number of pending approvals/bookings (with urgency indicator)
 * - Next scheduled session
 * - Primary CTA based on context (approve pending or view today's schedule)
 */
function CalendarHero({
  todaysSessions,
  pendingApprovals,
  nextSession,
  onViewToday,
  onApproveBookings,
}: CalendarHeroProps) {
  const today = new Date();
  const dayName = today.toLocaleDateString('nb-NO', { weekday: 'long' });
  const dateFormatted = today.toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Determine urgency level for pending approvals
  const hasUrgentApprovals = pendingApprovals > 0;
  const urgencyLevel = pendingApprovals >= 5 ? 'high' : pendingApprovals >= 2 ? 'medium' : 'low';

  // Format next session time
  const nextSessionTime = nextSession
    ? `${nextSession.start} - ${nextSession.playerName?.split(' ')[0] || 'Session'}`
    : null;

  // Determine primary CTA
  const hasPendingPriority = pendingApprovals > 0;

  return (
    <div className="bg-tier-white border-b border-tier-border-default">
      <div className="px-4 py-5 lg:px-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left: Today's Date */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-tier-navy flex flex-col items-center justify-center text-white">
              <span className="text-xs font-medium uppercase tracking-wide opacity-80">
                {today.toLocaleDateString('nb-NO', { weekday: 'short' })}
              </span>
              <span className="text-2xl font-bold leading-none">
                {today.getDate()}
              </span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-tier-navy capitalize">
                {dayName}
              </h1>
              <p className="text-sm text-tier-text-secondary">{dateFormatted}</p>
            </div>
          </div>

          {/* Center: Quick Stats */}
          <div className="flex items-center gap-6">
            {/* Today's Sessions */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-tier-navy/10 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-tier-navy" />
              </div>
              <div>
                <p className="text-lg font-semibold text-tier-navy">
                  {todaysSessions.length}
                </p>
                <p className="text-xs text-tier-text-tertiary">
                  {todaysSessions.length === 1 ? 'session today' : 'sessions today'}
                </p>
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="flex items-center gap-2">
              <div
                className={clsx(
                  'w-9 h-9 rounded-lg flex items-center justify-center',
                  hasUrgentApprovals
                    ? urgencyLevel === 'high'
                      ? 'bg-tier-error/10'
                      : urgencyLevel === 'medium'
                        ? 'bg-tier-warning/10'
                        : 'bg-tier-gold/10'
                    : 'bg-tier-success/10'
                )}
              >
                {hasUrgentApprovals ? (
                  <AlertCircle
                    className={clsx(
                      'w-4 h-4',
                      urgencyLevel === 'high'
                        ? 'text-tier-error'
                        : urgencyLevel === 'medium'
                          ? 'text-tier-warning'
                          : 'text-tier-gold'
                    )}
                  />
                ) : (
                  <CheckCircle className="w-4 h-4 text-tier-success" />
                )}
              </div>
              <div>
                <p
                  className={clsx(
                    'text-lg font-semibold',
                    hasUrgentApprovals
                      ? urgencyLevel === 'high'
                        ? 'text-tier-error'
                        : urgencyLevel === 'medium'
                          ? 'text-tier-warning'
                          : 'text-tier-gold'
                      : 'text-tier-success'
                  )}
                >
                  {pendingApprovals}
                </p>
                <p className="text-xs text-tier-text-tertiary">
                  {pendingApprovals === 1 ? 'pending approval' : 'pending approvals'}
                </p>
              </div>
            </div>

            {/* Next Session */}
            {nextSession && (
              <div className="hidden md:flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-tier-surface-base flex items-center justify-center">
                  <Clock className="w-4 h-4 text-tier-text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-tier-navy">
                    {nextSession.start}
                  </p>
                  <p className="text-xs text-tier-text-tertiary truncate max-w-[120px]">
                    {nextSession.playerName?.split(' ')[0] || 'Next session'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Primary CTA */}
          <div className="flex items-center gap-3">
            {hasPendingPriority ? (
              <button
                onClick={onApproveBookings}
                className={clsx(
                  'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors',
                  urgencyLevel === 'high'
                    ? 'bg-tier-error text-white hover:bg-tier-error/90'
                    : urgencyLevel === 'medium'
                      ? 'bg-tier-warning text-tier-navy hover:bg-tier-warning/90'
                      : 'bg-tier-gold text-tier-navy hover:bg-tier-gold/90'
                )}
              >
                <Bell className="w-4 h-4" />
                Approve Bookings
                <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs">
                  {pendingApprovals}
                </span>
              </button>
            ) : (
              <button
                onClick={onViewToday}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-tier-navy text-white rounded-lg font-semibold text-sm hover:bg-tier-navy/90 transition-colors"
              >
                View Today's Schedule
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile: Next Session Preview */}
        {nextSession && (
          <div className="mt-4 md:hidden p-3 bg-tier-surface-base rounded-lg border border-tier-border-default">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-tier-navy text-white flex items-center justify-center text-xs font-semibold">
                  {nextSession.playerInitials}
                </div>
                <div>
                  <p className="text-sm font-medium text-tier-navy">
                    Next: {nextSession.playerName}
                  </p>
                  <p className="text-xs text-tier-text-tertiary">
                    {nextSession.start} - {nextSession.sessionType}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-tier-text-tertiary" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function CoachCalendarPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL-based state
  const viewParam = (searchParams.get('view') as CalendarView) || 'week';
  const dateParam = searchParams.get('date');

  const [view, setView] = useState<CalendarView>(viewParam);
  const [currentDate, setCurrentDate] = useState(() => {
    if (dateParam) {
      const parsed = new Date(dateParam);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSession, setSelectedSession] = useState<CoachSession | null>(null);
  const [sessions, setSessions] = useState<CoachSession[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync URL with state
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('view', view);
    params.set('date', formatDateKey(currentDate));
    setSearchParams(params, { replace: true });
  }, [view, currentDate, setSearchParams]);

  // Fetch sessions and booking requests
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { start, end } = getMonthRange(currentDate);
        // Extend range for week view
        start.setDate(start.getDate() - 7);
        end.setDate(end.getDate() + 7);

        const fromDate = start.toISOString().split('T')[0];
        const toDate = end.toISOString().split('T')[0];

        // Fetch real sessions from API
        let realSessions: CoachSession[] = [];
        try {
          const sessionsResponse = await sessionsAPI.list({
            coachId: 'me',
            fromDate,
            toDate,
            limit: 500,
          } as any);

          const apiSessions = (sessionsResponse.data?.data as any)?.sessions || sessionsResponse.data?.data || [];

          // Map API sessions to CoachSession format
          realSessions = apiSessions.map((session: any, index: number) => {
            const sessionDate = new Date(session.sessionDate);
            const startTime = session.startTime || `${9 + (index % 8)}:00`;
            const endTime = session.endTime || `${10 + (index % 8)}:00`;

            return {
              id: session.id,
              title: session.sessionType || 'Training Session',
              date: sessionDate,
              start: startTime,
              end: endTime,
              status: session.status === 'completed' ? 'completed' : (session.status === 'in_progress' ? 'in_progress' : 'planned'),
              category: 'coach' as const,
              color: session.status === 'completed' ? 'green' : (session.status === 'in_progress' ? 'yellow' : 'blue'),
              location: session.location || 'TIER Golf',
              playerId: session.playerId,
              playerName: session.player?.firstName && session.player?.lastName
                ? `${session.player.firstName} ${session.player.lastName}`
                : 'Unknown Player',
              playerInitials: session.player?.firstName && session.player?.lastName
                ? `${session.player.firstName.charAt(0)}${session.player.lastName.charAt(0)}`
                : 'UP',
              sessionType: session.sessionType || 'Training',
              notes: session.notes,
            };
          });
        } catch (err) {
          console.error('Failed to fetch sessions from API:', err);
        }

        // Use real sessions if available, otherwise fall back to mock
        if (realSessions.length > 0) {
          setSessions(realSessions);
        } else {
          // Fallback to mock data for demo
          const mockSessions = generateMockSessions(start, end);
          setSessions(mockSessions);
        }

        // Fetch modification requests as booking requests
        let realRequests: BookingRequest[] = [];
        try {
          const modRequestsResponse = await trainingPlanAPI.getModificationRequests({ status: 'pending' });
          const modRequests = modRequestsResponse.data?.data || [];

          realRequests = (Array.isArray(modRequests) ? modRequests : []).map((req: any) => ({
            id: req.id,
            playerId: req.playerId || req.player?.id || 'unknown',
            playerName: req.playerName || (req.player?.firstName && req.player?.lastName
              ? `${req.player.firstName} ${req.player.lastName}`
              : 'Unknown Player'),
            playerInitials: req.playerInitials || (req.player?.firstName && req.player?.lastName
              ? `${req.player.firstName.charAt(0)}${req.player.lastName.charAt(0)}`
              : 'UP'),
            date: new Date(req.requestedDate || req.createdAt || new Date()).toISOString().split('T')[0],
            startTime: req.startTime || '09:00',
            endTime: req.endTime || '10:00',
            sessionType: req.sessionType || 'Training',
            notes: req.notes || req.reason || '',
            status: 'pending' as const,
            requestedAt: req.createdAt || req.requestedDate || new Date().toISOString(),
          }));
        } catch (err) {
          console.error('Failed to fetch modification requests:', err);
        }

        // Use real requests if available, otherwise fall back to mock
        if (realRequests.length > 0) {
          setBookingRequests(realRequests);
        } else {
          const mockRequests = generateMockBookingRequests();
          setBookingRequests(mockRequests);
        }
      } catch (error) {
        console.error('Failed to fetch calendar data:', error);
        // Fallback to mock data
        const { start, end } = getMonthRange(currentDate);
        start.setDate(start.getDate() - 7);
        end.setDate(end.getDate() + 7);
        const mockSessions = generateMockSessions(start, end);
        setSessions(mockSessions);
        const mockRequests = generateMockBookingRequests();
        setBookingRequests(mockRequests);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentDate]);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (view === 'day') d.setDate(d.getDate() - 1);
      else if (view === 'week') d.setDate(d.getDate() - 7);
      else if (view === 'month') d.setMonth(d.getMonth() - 1);
      else d.setFullYear(d.getFullYear() - 1);
      return d;
    });
  }, [view]);

  const handleNext = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (view === 'day') d.setDate(d.getDate() + 1);
      else if (view === 'week') d.setDate(d.getDate() + 7);
      else if (view === 'month') d.setMonth(d.getMonth() + 1);
      else d.setFullYear(d.getFullYear() + 1);
      return d;
    });
  }, [view]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleViewChange = useCallback((newView: CalendarView) => {
    setView(newView);
  }, []);

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date);
    if (view === 'month' || view === 'year') {
      setView('week');
    }
  }, [view]);

  const handleSessionClick = useCallback((session: CalendarEvent) => {
    setSelectedSession(session as CoachSession);
  }, []);

  // Booking request handlers
  const handleApproveRequest = useCallback(async (requestId: string) => {
    try {
      // In real app, call API
      const request = bookingRequests.find((r) => r.id === requestId);
      if (request) {
        // Add as session
        const newSession: CoachSession = {
          id: `session-from-${requestId}`,
          title: `${request.playerName.split(' ')[0]} - ${request.sessionType}`,
          date: request.date,
          start: request.startTime,
          end: request.endTime,
          status: 'planned',
          category: 'coach',
          color: 'blue',
          location: 'TIER Golf',
          playerId: request.playerId,
          playerName: request.playerName,
          playerInitials: request.playerInitials,
          sessionType: request.sessionType,
          notes: request.notes,
          isBooking: true,
        };
        setSessions((prev) => [...prev, newSession]);
        setBookingRequests((prev) => prev.filter((r) => r.id !== requestId));
      }
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  }, [bookingRequests]);

  const handleDeclineRequest = useCallback(async (requestId: string) => {
    try {
      // In real app, call API
      setBookingRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (error) {
      console.error('Failed to decline request:', error);
    }
  }, []);

  // Derived data
  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

  const title = useMemo(() => {
    if (view === 'day') {
      return currentDate.toLocaleDateString('nb-NO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    if (view === 'week') return getWeekRange(currentDate);
    if (view === 'year') return currentDate.getFullYear().toString();
    return getMonthName(currentDate);
  }, [view, currentDate]);

  const subtitle = view === 'day' ? undefined : undefined;

  const eventDates = useMemo(() => {
    return [...new Set(sessions.map((s) => s.date))];
  }, [sessions]);

  // Map sessions to CalendarEvent format for components
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return sessions.map((s) => ({
      id: s.id,
      title: s.title,
      date: s.date,
      start: s.start,
      end: s.end,
      status: s.status,
      category: s.category,
      color: s.color,
      location: s.location,
    }));
  }, [sessions]);

  // Sessions for today
  const todaysSessions = useMemo(() => {
    const today = formatDateKey(new Date());
    return sessions.filter((s) => s.date === today);
  }, [sessions]);

  // Upcoming sessions (next 7 days)
  const upcomingSessions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    return sessions
      .filter((s) => {
        const sessionDate = new Date(s.date);
        return sessionDate >= today && sessionDate <= weekFromNow;
      })
      .sort((a, b) => {
        const aDate = typeof a.date === 'string' ? a.date : new Date(a.date).toISOString().split('T')[0];
        const bDate = typeof b.date === 'string' ? b.date : new Date(b.date).toISOString().split('T')[0];
        const dateCompare = aDate.localeCompare(bDate);
        if (dateCompare !== 0) return dateCompare;
        return (a.start || '').localeCompare(b.start || '');
      })
      .slice(0, 5);
  }, [sessions]);

  // Next session (first upcoming session today or in the future)
  const nextSession = useMemo(() => {
    const now = new Date();
    const todayKey = formatDateKey(now);
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    // Find sessions from today onwards, sorted by date and time
    const upcoming = sessions
      .filter((s) => {
        const sDate = typeof s.date === 'string' ? s.date : new Date(s.date).toISOString().split('T')[0];
        if (sDate > todayKey) return true;
        if (sDate === todayKey && (s.start || '') >= currentTime) return true;
        return false;
      })
      .sort((a, b) => {
        const aDate = typeof a.date === 'string' ? a.date : new Date(a.date).toISOString().split('T')[0];
        const bDate = typeof b.date === 'string' ? b.date : new Date(b.date).toISOString().split('T')[0];
        const dateCompare = aDate.localeCompare(bDate);
        if (dateCompare !== 0) return dateCompare;
        return (a.start || '').localeCompare(b.start || '');
      });

    return upcoming[0] || null;
  }, [sessions]);

  // Hero action handlers
  const handleViewToday = useCallback(() => {
    setCurrentDate(new Date());
    setView('day');
  }, []);

  const handleApproveBookings = useCallback(() => {
    // Scroll to booking requests section on desktop, or navigate on mobile
    const bookingSection = document.querySelector('[data-booking-requests]');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/coach/booking/requests');
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-tier-surface-base flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-tier-border-default border-t-tier-navy rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:w-80 lg:flex-col lg:border-r lg:border-tier-border-default lg:bg-tier-white">
          {/* Mini Calendar */}
          <div className="p-4 border-b border-tier-border-default">
            <CalendarMiniMonth
              currentDate={currentDate}
              selectedDate={selectedDate}
              eventDates={eventDates}
              onSelectDate={handleDateSelect}
              onMonthChange={setCurrentDate}
            />
          </div>

          {/* Booking Requests */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4" data-booking-requests>
              <div className="flex items-center justify-between mb-3">
                <SubSectionTitle style={{ marginBottom: 0 }} className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Booking-forespørsler
                  {bookingRequests.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-tier-warning text-tier-navy text-xs font-semibold rounded-full">
                      {bookingRequests.length}
                    </span>
                  )}
                </SubSectionTitle>
                <button
                  onClick={() => navigate('/coach/booking/requests')}
                  className="text-xs text-tier-navy hover:text-tier-navy/80"
                >
                  Se alle
                </button>
              </div>

              {bookingRequests.length === 0 ? (
                <p className="text-sm text-tier-text-tertiary text-center py-4">
                  Ingen ventende forespørsler
                </p>
              ) : (
                <ul className="space-y-2">
                  {bookingRequests.slice(0, 3).map((request) => (
                    <li
                      key={request.id}
                      className="p-3 bg-tier-surface-base rounded-lg border border-tier-warning/30"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-tier-navy text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {request.playerInitials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-tier-navy truncate">
                            {request.playerName}
                          </p>
                          <p className="text-xs text-tier-text-tertiary">
                            {request.sessionType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-tier-text-secondary mb-2">
                        <CalendarIcon className="h-3 w-3" />
                        <span>
                          {new Date(request.date).toLocaleDateString('nb-NO', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                        <Clock className="h-3 w-3 ml-1" />
                        <span>{request.startTime}</span>
                      </div>
                      {request.notes && (
                        <p className="text-xs text-tier-text-tertiary italic mb-2 truncate">
                          "{request.notes}"
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeclineRequest(request.id)}
                          className="flex-1 py-1.5 text-xs font-medium text-tier-error border border-tier-error rounded hover:bg-tier-error/10 transition-colors"
                        >
                          Avslå
                        </button>
                        <button
                          onClick={() => handleApproveRequest(request.id)}
                          className="flex-1 py-1.5 text-xs font-medium text-white bg-tier-success rounded hover:bg-tier-success/90 transition-colors"
                        >
                          Godkjenn
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Today's Sessions */}
            <div className="p-4 border-t border-tier-border-default">
              <SubSectionTitle style={{ marginBottom: '0.75rem' }}>
                I dag ({todaysSessions.length} økter)
              </SubSectionTitle>
              {todaysSessions.length === 0 ? (
                <p className="text-sm text-tier-text-tertiary text-center py-2">
                  Ingen økter i dag
                </p>
              ) : (
                <ul className="space-y-2">
                  {todaysSessions.map((session) => (
                    <li key={session.id}>
                      <button
                        onClick={() => handleSessionClick(session)}
                        className="w-full p-2 rounded-lg bg-tier-navy/5 hover:bg-tier-navy/10 text-left transition-colors border-l-2 border-tier-navy"
                      >
                        <p className="text-sm font-medium text-tier-navy">
                          {session.playerName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-tier-text-secondary mt-0.5">
                          <span>{session.start}</span>
                          <span>•</span>
                          <span>{session.sessionType}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-tier-border-default">
              <SubSectionTitle style={{ marginBottom: '0.75rem' }}>
                Hurtigvalg
              </SubSectionTitle>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/coach/booking/settings')}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-sm text-tier-text-secondary hover:bg-tier-surface-base transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Tilgjengelighet
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </button>
                <button
                  onClick={() => navigate('/coach/athletes')}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-sm text-tier-text-secondary hover:bg-tier-surface-base transition-colors"
                >
                  <User className="h-4 w-4" />
                  Mine spillere
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </button>
              </div>
            </div>

            {/* Color Legend */}
            <div className="p-4 border-t border-tier-border-default">
              <SubSectionTitle style={{ marginBottom: '0.75rem' }}>
                Fargekoder
              </SubSectionTitle>
              <CalendarColorLegend orientation="vertical" variant="status" />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Layer 1: Decision Hero - "What should I focus on today?" */}
          <CalendarHero
            todaysSessions={todaysSessions}
            pendingApprovals={bookingRequests.length}
            nextSession={nextSession}
            onViewToday={handleViewToday}
            onApproveBookings={handleApproveBookings}
          />

          {/* Layer 2: Calendar Header */}
          <CalendarHeader
            view={view}
            title={title}
            subtitle={subtitle}
            helpText="Trener-kalender med booking-administrasjon. Viser dine bookede økter med spillere inkludert navn, tidspunkt, økttype (video, fysisk, fjern) og notater. Sidebar med mini-kalender og ventende booking-forespørsler som kan godkjennes eller avslås. Bytt mellom Dag-, Uke-, Måned- og År-visning. Naviger med forrige/neste eller hopp til i dag. Klikk på økt for å se spillerdetaljer, notater og handlinger. Legg til tilgjengelighet for å åpne for nye bookinger. Støtter både desktop og mobil med responsiv layout."
            onPrev={handlePrev}
            onNext={handleNext}
            onToday={handleToday}
            onViewChange={handleViewChange}
            onAddEvent={() => navigate('/coach/booking/settings')}
            addEventLabel="Tilgjengelighet"
          />

          {/* Calendar Content */}
          <div className="flex-1 overflow-hidden">
            {view === 'month' && (
              <CalendarMonthGrid
                currentDate={currentDate}
                events={calendarEvents}
                onDayClick={handleDateSelect}
                onEventClick={handleSessionClick}
                maxEventsPerDay={3}
              />
            )}

            {view === 'week' && (
              <CalendarWeekGrid
                weekDates={weekDates}
                events={calendarEvents}
                onEventClick={handleSessionClick}
                startHour={7}
                endHour={20}
              />
            )}

            {view === 'day' && (
              <div className="h-full p-6 overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                  <SectionTitle style={{ marginBottom: '1rem' }}>
                    Økter for {currentDate.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </SectionTitle>
                  {sessions.filter((s) => s.date === formatDateKey(currentDate)).length === 0 ? (
                    <div className="text-center py-12 text-tier-text-tertiary">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Ingen økter denne dagen</p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {sessions
                        .filter((s) => s.date === formatDateKey(currentDate))
                        .sort((a, b) => a.start.localeCompare(b.start))
                        .map((session) => (
                          <li key={session.id}>
                            <button
                              onClick={() => handleSessionClick(session)}
                              className="w-full p-4 rounded-xl bg-tier-white border border-tier-border-default hover:border-tier-navy/50 text-left transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-tier-navy text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                  {session.playerInitials}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-base font-semibold text-tier-navy">
                                    {session.playerName}
                                  </p>
                                  <p className="text-sm text-tier-text-secondary">
                                    {session.sessionType}
                                  </p>
                                  <div className="flex items-center gap-3 mt-2 text-sm text-tier-text-tertiary">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {session.start} - {session.end}
                                    </span>
                                    {session.location && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {session.location}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-tier-text-tertiary" />
                              </div>
                            </button>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {view === 'year' && (
              <div className="h-full p-6 overflow-y-auto">
                <div className="grid grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {Array.from({ length: 12 }, (_, i) => {
                    const monthDate = new Date(currentDate.getFullYear(), i, 1);
                    const monthName = monthDate.toLocaleDateString('nb-NO', { month: 'long' });
                    const monthSessions = sessions.filter((s) => {
                      const sDate = new Date(s.date);
                      return sDate.getMonth() === i && sDate.getFullYear() === currentDate.getFullYear();
                    });

                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setCurrentDate(monthDate);
                          setView('month');
                        }}
                        className="p-4 rounded-xl bg-tier-white border border-tier-border-default hover:border-tier-navy/50 text-left transition-colors"
                      >
                        <SubSectionTitle style={{ marginBottom: 0, textTransform: 'capitalize' }}>
                          {monthName}
                        </SubSectionTitle>
                        <p className="text-2xl font-bold text-tier-navy mt-1">
                          {monthSessions.length}
                        </p>
                        <p className="text-xs text-tier-text-tertiary">
                          {monthSessions.length === 1 ? 'økt' : 'økter'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setSelectedSession(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-tier-white rounded-xl shadow-xl z-50 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-tier-navy text-white flex items-center justify-center text-lg font-semibold">
                    {selectedSession.playerInitials}
                  </div>
                  <div>
                    <SectionTitle style={{ marginBottom: 0 }}>
                      {selectedSession.playerName}
                    </SectionTitle>
                    <p className="text-sm text-tier-text-secondary">
                      {selectedSession.sessionType}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="p-2 rounded-lg hover:bg-tier-surface-base transition-colors"
                >
                  <X className="h-5 w-5 text-tier-text-tertiary" />
                </button>
              </div>

              {/* Details */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-tier-surface-base rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-tier-text-tertiary" />
                  <div>
                    <p className="text-xs text-tier-text-tertiary">Dato</p>
                    <p className="text-sm font-medium text-tier-navy">
                      {new Date(selectedSession.date).toLocaleDateString('nb-NO', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-tier-surface-base rounded-lg">
                  <Clock className="h-5 w-5 text-tier-text-tertiary" />
                  <div>
                    <p className="text-xs text-tier-text-tertiary">Tidspunkt</p>
                    <p className="text-sm font-medium text-tier-navy">
                      {selectedSession.start} - {selectedSession.end}
                    </p>
                  </div>
                </div>

                {selectedSession.location && (
                  <div className="flex items-center gap-3 p-3 bg-tier-surface-base rounded-lg">
                    <MapPin className="h-5 w-5 text-tier-text-tertiary" />
                    <div>
                      <p className="text-xs text-tier-text-tertiary">Sted</p>
                      <p className="text-sm font-medium text-tier-navy">
                        {selectedSession.location}
                      </p>
                    </div>
                  </div>
                )}

                {selectedSession.notes && (
                  <div className="p-3 bg-tier-navy/5 rounded-lg border-l-2 border-tier-navy">
                    <p className="text-xs text-tier-text-tertiary mb-1">Notat</p>
                    <p className="text-sm text-tier-navy">{selectedSession.notes}</p>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      'px-2 py-1 rounded text-xs font-medium',
                      selectedSession.status === 'completed'
                        ? 'bg-tier-success/10 text-tier-success'
                        : 'bg-tier-navy/10 text-tier-navy'
                    )}
                  >
                    {selectedSession.status === 'completed' ? 'Fullført' : 'Planlagt'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    navigate(`/coach/athletes/${selectedSession.playerId}`);
                    setSelectedSession(null);
                  }}
                  className="flex-1 py-2.5 px-4 bg-tier-navy text-white rounded-lg text-sm font-semibold hover:bg-tier-navy/90 transition-colors"
                >
                  Se spillerprofil
                </button>
                {selectedSession.status !== 'completed' && (
                  <button
                    onClick={() => {
                      // Mark as completed
                      setSessions((prev) =>
                        prev.map((s) =>
                          s.id === selectedSession.id
                            ? { ...s, status: 'completed' as const, color: 'green' as const }
                            : s
                        )
                      );
                      setSelectedSession(null);
                    }}
                    className="p-2.5 rounded-lg border border-tier-success text-tier-success hover:bg-tier-success/10 transition-colors"
                    title="Marker som fullført"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
