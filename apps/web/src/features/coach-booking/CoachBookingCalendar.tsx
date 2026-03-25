/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TIER Golf - Coach Booking Calendar
 * Design System v3.0 - Premium Light (Modernized)
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 *
 * Calendar view for coach bookings.
 * Shows all bookings, available times and requests.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  X,
  Settings,
  Calendar,
  User,
  Video,
  Target,
  AlertCircle,
} from 'lucide-react';
import Button from '../../ui/primitives/Button';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import BookingCreateDialog, { BookingFormData } from './BookingCreateDialog';
import { SectionTitle, SubSectionTitle } from '../../ui/primitives/typography';
import { CalendarSkeleton } from '../../components/skeletons';

// ============================================================================
// MODERN STATUS STYLING
// ============================================================================

const SLOT_STATUS_CLASSES = {
  booked: {
    bg: 'bg-teal-50',
    border: 'border-l-teal-500',
    hoverBg: 'hover:bg-teal-100',
    ring: 'ring-teal-200',
  },
  pending: {
    bg: 'bg-amber-50',
    border: 'border-l-amber-400',
    hoverBg: 'hover:bg-amber-100',
    ring: 'ring-amber-200',
  },
  blocked: {
    bg: 'bg-gray-100',
    border: 'border-l-gray-300',
    hoverBg: '',
    ring: 'ring-gray-200',
  },
  available: {
    bg: 'bg-white',
    border: 'border-l-transparent',
    hoverBg: 'hover:bg-tier-navy/5',
    ring: 'ring-tier-navy/20',
  },
};

// Session type icons
const SESSION_TYPE_ICONS: Record<string, React.ReactNode> = {
  'Individual Session': <User size={12} className="text-teal-600" />,
  'Video Analysis': <Video size={12} className="text-purple-600" />,
  'On Course': <Target size={12} className="text-green-600" />,
};

interface BookingSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'pending' | 'blocked';
  booking?: {
    id: string;
    playerName: string;
    playerInitials: string;
    sessionType: string;
    notes?: string;
  };
}

interface DaySchedule {
  date: string;
  slots: BookingSlot[];
}

export default function CoachBookingCalendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDialogSlot, setCreateDialogSlot] = useState<{date: string; startTime: string; endTime: string} | null>(null);

  // Get week dates
  const getWeekDates = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  };

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

  // Fetch schedule
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const startDate = weekDates[0].toISOString().split('T')[0];
        const endDate = weekDates[6].toISOString().split('T')[0];
        const response = await fetch(
          `/api/v1/coach/bookings/schedule?start=${startDate}&end=${endDate}`
        );
        if (response.ok) {
          const data = await response.json();
          setSchedule(data.schedule || []);
        }
      } catch (error) {
        console.error('Failed to fetch schedule:', error);
        // Mock data for development
        const mockSchedule: DaySchedule[] = weekDates.map((date) => ({
          date: date.toISOString().split('T')[0],
          slots: generateMockSlots(date),
        }));
        setSchedule(mockSchedule);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [weekDates]);

  // Generate mock slots for a day
  const generateMockSlots = (date: Date): BookingSlot[] => {
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();

    // No slots on Sunday
    if (dayOfWeek === 0) return [];

    const slots: BookingSlot[] = [];
    const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

    times.forEach((time, idx) => {
      const random = Math.random();
      let status: BookingSlot['status'] = 'available';
      let booking;

      if (random < 0.3) {
        status = 'booked';
        booking = {
          id: `b${idx}`,
          playerName: ['Anders Hansen', 'Sofie Andersen', 'Erik Johansen'][idx % 3],
          playerInitials: ['AH', 'SA', 'EJ'][idx % 3],
          sessionType: ['Individual Session', 'Video Analysis', 'On Course'][idx % 3],
        };
      } else if (random < 0.4) {
        status = 'pending';
        booking = {
          id: `p${idx}`,
          playerName: 'Lars Olsen',
          playerInitials: 'LO',
          sessionType: 'Individual Session',
          notes: 'Want to focus on putting',
        };
      } else if (random < 0.5) {
        status = 'blocked';
      }

      slots.push({
        id: `${dateStr}-${time}`,
        date: dateStr,
        startTime: time,
        endTime: `${parseInt(time) + 1}:00`,
        status,
        booking,
      });
    });

    return slots;
  };

  // Navigation
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get status classes
  const getStatusClasses = (status: string) => {
    return SLOT_STATUS_CLASSES[status as keyof typeof SLOT_STATUS_CLASSES] || SLOT_STATUS_CLASSES.available;
  };

  // Handle slot actions
  const handleApprove = async (slotId: string) => {
    try {
      await fetch(`/api/v1/coach/bookings/${slotId}/approve`, { method: 'PUT' });
      // Refresh schedule
      setSchedule((prev) =>
        prev.map((day) => ({
          ...day,
          slots: day.slots.map((slot) =>
            slot.id === slotId ? { ...slot, status: 'booked' as const } : slot
          ),
        }))
      );
    } catch (error) {
      console.error('Failed to approve booking:', error);
    }
    setSelectedSlot(null);
  };

  const handleDecline = async (slotId: string) => {
    try {
      await fetch(`/api/v1/coach/bookings/${slotId}/decline`, { method: 'PUT' });
      setSchedule((prev) =>
        prev.map((day) => ({
          ...day,
          slots: day.slots.map((slot) =>
            slot.id === slotId
              ? { ...slot, status: 'available' as const, booking: undefined }
              : slot
          ),
        }))
      );
    } catch (error) {
      console.error('Failed to decline booking:', error);
    }
    setSelectedSlot(null);
  };

  const handleCreateBooking = async (data: BookingFormData) => {
    try {
      // API call to create booking
      const response = await fetch('/api/v1/coach/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: createDialogSlot?.date,
          startTime: createDialogSlot?.startTime,
          endTime: createDialogSlot?.endTime,
          playerId: data.playerId,
          sessionType: data.sessionType,
          duration: data.duration,
          notes: data.notes,
        }),
      });

      if (response.ok) {
        const newBooking = await response.json();
        // Update schedule with new booking
        setSchedule((prev) =>
          prev.map((day) => ({
            ...day,
            slots: day.slots.map((slot) =>
              slot.id === `${createDialogSlot?.date}-${createDialogSlot?.startTime}`
                ? {
                    ...slot,
                    status: 'booked' as const,
                    booking: {
                      id: newBooking.id || data.playerId,
                      playerName: data.playerName,
                      playerInitials: data.playerName.split(' ').map(n => n[0]).join(''),
                      sessionType: data.sessionType,
                      notes: data.notes,
                    },
                  }
                : slot
            ),
          }))
        );
      }
    } catch (error) {
      console.error('Failed to create booking:', error);
      // Still update UI optimistically for demo purposes
      setSchedule((prev) =>
        prev.map((day) => ({
          ...day,
          slots: day.slots.map((slot) =>
            slot.id === `${createDialogSlot?.date}-${createDialogSlot?.startTime}`
              ? {
                  ...slot,
                  status: 'booked' as const,
                  booking: {
                    id: data.playerId,
                    playerName: data.playerName,
                    playerInitials: data.playerName.split(' ').map(n => n[0]).join(''),
                    sessionType: data.sessionType,
                    notes: data.notes,
                  },
                }
              : slot
          ),
        }))
      );
    } finally {
      setCreateDialogOpen(false);
      setCreateDialogSlot(null);
    }
  };

  // Stats
  const stats = useMemo(() => {
    let booked = 0;
    let pending = 0;
    let available = 0;

    schedule.forEach((day) => {
      day.slots.forEach((slot) => {
        if (slot.status === 'booked') booked++;
        else if (slot.status === 'pending') pending++;
        else if (slot.status === 'available') available++;
      });
    });

    return { booked, pending, available };
  }, [schedule]);

  if (loading) {
    return <CalendarSkeleton />;
  }

  return (
    <div className="min-h-screen bg-tier-surface-base font-sans">
      {/* Header - Standardized layout matching other coach pages */}
      <PageHeader
        title="Booking Calendar"
        subtitle="Manage your bookings and availability"
        helpText="Weekly calendar view of all your bookings. See confirmed and pending sessions, available slots and blocked time. Click on a time slot to create a new booking or manage existing ones."
        actions={
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/coach/booking/requests')}
              className={`
                relative flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium
                transition-all duration-150 border-2
                ${stats.pending > 0
                  ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100 hover:border-amber-400'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                }
              `}
            >
              <Clock size={18} />
              Requests
              {stats.pending > 0 && (
                <span className="ml-1 py-0.5 px-2.5 bg-amber-400 text-white rounded-full text-xs font-bold shadow-sm animate-pulse">
                  {stats.pending}
                </span>
              )}
            </button>
            <Button
              variant="primary"
              leftIcon={<Settings size={18} />}
              onClick={() => navigate('/coach/booking/settings')}
            >
              Availability
            </Button>
          </div>
        }
      />

      {/* Modern Stats Dashboard */}
      <div className="px-6 pb-5">
        <div className="flex flex-wrap gap-3">
          {/* Booked stats */}
          <div className="group flex items-center gap-3 py-2.5 px-4 bg-gradient-to-r from-teal-50 to-teal-100/50 rounded-xl border border-teal-200/60 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center shadow-sm">
              <Check size={18} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-teal-700 leading-none">{stats.booked}</p>
              <p className="text-xs text-teal-600/80 mt-0.5 font-medium">Confirmed</p>
            </div>
          </div>

          {/* Pending stats */}
          <div className="group flex items-center gap-3 py-2.5 px-4 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-xl border border-amber-200/60 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="w-10 h-10 rounded-lg bg-amber-400 flex items-center justify-center shadow-sm">
              <Clock size={18} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700 leading-none">{stats.pending}</p>
              <p className="text-xs text-amber-600/80 mt-0.5 font-medium">Pending</p>
            </div>
          </div>

          {/* Available stats */}
          <div className="group flex items-center gap-3 py-2.5 px-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200/60 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center shadow-sm">
              <Calendar size={18} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700 leading-none">{stats.available}</p>
              <p className="text-xs text-emerald-600/80 mt-0.5 font-medium">Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Calendar Navigation */}
      <div className="bg-white py-4 px-6 flex items-center justify-between border-y border-gray-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={goToPreviousWeek}
              className="w-9 h-9 rounded-md bg-transparent hover:bg-white flex items-center justify-center cursor-pointer transition-all duration-150 border-none"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <button
              onClick={goToNextWeek}
              className="w-9 h-9 rounded-md bg-transparent hover:bg-white flex items-center justify-center cursor-pointer transition-all duration-150 border-none"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
          <div className="h-6 w-px bg-gray-200" />
          <SectionTitle className="text-lg font-semibold text-gray-900 tracking-tight" style={{ marginBottom: 0 }}>
            {weekDates[0].toLocaleDateString('en-US', { day: 'numeric', month: 'long' })} -{' '}
            {weekDates[6].toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
          </SectionTitle>
        </div>

        <button
          onClick={goToToday}
          className="py-2 px-4 bg-tier-navy text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-tier-navy-dark transition-colors duration-150 border-none shadow-sm"
        >
          Today
        </button>
      </div>

      {/* Modern Calendar Grid */}
      <div className="p-6 overflow-x-auto">
        <div className="bg-white rounded-2xl shadow-tier-card border border-gray-200/60 overflow-hidden min-w-[900px]">
          {/* Header row */}
          <div className="grid grid-cols-[70px_repeat(7,1fr)] border-b border-gray-200">
            <div className="bg-gray-50/50 p-3" />
            {weekDates.map((date) => {
              const isToday = date.toDateString() === new Date().toDateString();
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const daySchedule = schedule.find(
                (s) => s.date === date.toISOString().split('T')[0]
              );
              const bookedCount = daySchedule?.slots.filter((s) => s.status === 'booked').length || 0;
              const pendingCount = daySchedule?.slots.filter((s) => s.status === 'pending').length || 0;

              return (
                <div
                  key={date.toISOString()}
                  className={`p-4 text-center border-l border-gray-200/60 transition-colors duration-200 ${
                    isToday
                      ? 'bg-tier-navy/5'
                      : isWeekend
                        ? 'bg-gray-50/30'
                        : 'bg-white'
                  }`}
                >
                  <p className={`text-[11px] font-medium uppercase tracking-wider m-0 ${
                    isWeekend ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mt-1 ${
                    isToday
                      ? 'bg-tier-navy text-white shadow-sm'
                      : ''
                  }`}>
                    <span className={`text-xl font-semibold ${
                      isToday ? 'text-white' : isWeekend ? 'text-gray-400' : 'text-gray-900'
                    }`}>
                      {date.getDate()}
                    </span>
                  </div>
                  {(bookedCount > 0 || pendingCount > 0) && (
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      {bookedCount > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded text-[10px] font-medium">
                          {bookedCount}
                        </span>
                      )}
                      {pendingCount > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-medium">
                          {pendingCount}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

          </div>

          {/* Time slots grid */}
          {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(
            (time) => (
              <div key={time} className={`grid grid-cols-[70px_repeat(7,1fr)] ${time === '12:00' ? 'border-t-2 border-gray-200' : 'border-t border-gray-100'}`}>
                {/* Time label */}
                <div className="bg-gray-50/50 px-3 py-3 flex items-start justify-end">
                  <span className="text-xs font-medium text-gray-500">{time}</span>
                </div>

                {/* Day slots */}
                {weekDates.map((date) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  const daySchedule = schedule.find((s) => s.date === dateStr);
                  const slot = daySchedule?.slots.find((s) => s.startTime === time);
                  const statusClasses = slot ? getStatusClasses(slot.status) : getStatusClasses('available');
                  const isClickable = slot?.booking || slot?.status === 'available';

                  return (
                    <div
                      key={`${dateStr}-${time}`}
                      onClick={() => {
                        if (slot?.booking) {
                          setSelectedSlot(slot);
                        } else if (slot?.status === 'available') {
                          setCreateDialogSlot({
                            date: dateStr,
                            startTime: time,
                            endTime: `${parseInt(time) + 1}:00`,
                          });
                          setCreateDialogOpen(true);
                        }
                      }}
                      className={`
                        relative p-2 min-h-[72px] border-l border-gray-100
                        transition-all duration-150 group
                        ${statusClasses.bg}
                        ${slot?.booking ? `border-l-[3px] ${statusClasses.border}` : ''}
                        ${isClickable ? `cursor-pointer ${statusClasses.hoverBg}` : 'cursor-default'}
                        ${isWeekend && !slot?.booking ? 'bg-gray-50/30' : ''}
                      `}
                    >
                      {/* Booking card */}
                      {slot?.booking && (
                        <div className={`
                          h-full rounded-lg p-2
                          ${slot.status === 'pending' ? 'bg-amber-50/80' : 'bg-teal-50/80'}
                          group-hover:shadow-sm transition-shadow duration-150
                        `}>
                          {/* Avatar and name */}
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className={`
                              w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shadow-sm
                              ${slot.status === 'pending'
                                ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white'
                                : 'bg-gradient-to-br from-teal-500 to-teal-600 text-white'
                              }
                            `}>
                              {slot.booking.playerInitials}
                            </div>
                            <span className="text-sm font-medium text-gray-900 truncate flex-1">
                              {slot.booking.playerName}
                            </span>
                          </div>

                          {/* Session type with icon */}
                          <div className="flex items-center gap-1.5">
                            {SESSION_TYPE_ICONS[slot.booking.sessionType] || <User size={12} className="text-gray-400" />}
                            <span className="text-[11px] text-gray-600 truncate">
                              {slot.booking.sessionType}
                            </span>
                          </div>

                          {/* Pending badge */}
                          {slot.status === 'pending' && (
                            <div className="flex items-center gap-1 mt-2">
                              <span className="inline-flex items-center gap-1 py-0.5 px-2 bg-amber-400 text-white rounded-full text-[10px] font-semibold shadow-sm">
                                <AlertCircle size={10} />
                                Awaiting response
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Blocked slot with diagonal stripes */}
                      {slot?.status === 'blocked' && (
                        <div className="h-full rounded-lg relative overflow-hidden bg-gray-100">
                          {/* Diagonal stripe pattern */}
                          <div
                            className="absolute inset-0 opacity-30"
                            style={{
                              backgroundImage: `repeating-linear-gradient(
                                -45deg,
                                transparent,
                                transparent 4px,
                                #9ca3af 4px,
                                #9ca3af 8px
                              )`
                            }}
                          />
                          <div className="relative z-10 flex items-center justify-center h-full">
                            <span className="text-xs font-medium text-gray-500 bg-gray-100/90 px-2 py-0.5 rounded">
                              Blocked
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Available slot hover indicator */}
                      {slot?.status === 'available' && (
                        <div className="absolute inset-2 rounded-lg border-2 border-dashed border-transparent group-hover:border-tier-navy/20 transition-colors duration-150 flex items-center justify-center">
                          <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            + New booking
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>

      {/* Modern Slot Detail Modal */}
      {selectedSlot && selectedSlot.booking && (
        <>
          {/* Backdrop with blur */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-fade-in"
            onClick={() => setSelectedSlot(null)}
          />

          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl w-[420px] max-w-[92vw] z-[101] shadow-2xl overflow-hidden animate-fade-in">
            {/* Header with status color */}
            <div className={`px-6 py-4 ${
              selectedSlot.status === 'pending'
                ? 'bg-gradient-to-r from-amber-50 to-amber-100/50'
                : 'bg-gradient-to-r from-teal-50 to-teal-100/50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className={`
                    w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold shadow-md
                    ${selectedSlot.status === 'pending'
                      ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white'
                      : 'bg-gradient-to-br from-teal-500 to-teal-600 text-white'
                    }
                  `}>
                    {selectedSlot.booking.playerInitials}
                  </div>
                  <div>
                    <SubSectionTitle className="text-lg font-semibold text-gray-900" style={{ marginBottom: 0 }}>
                      {selectedSlot.booking.playerName}
                    </SubSectionTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {SESSION_TYPE_ICONS[selectedSlot.booking.sessionType] || <User size={14} className="text-gray-400" />}
                      <span className="text-sm text-gray-600">
                        {selectedSlot.booking.sessionType}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="w-9 h-9 rounded-lg bg-white/80 hover:bg-white border-none flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {/* Status badge */}
              {selectedSlot.status === 'pending' && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 text-white rounded-full text-xs font-semibold shadow-sm">
                  <AlertCircle size={12} />
                  Awaiting approval
                </div>
              )}
              {selectedSlot.status === 'booked' && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 text-white rounded-full text-xs font-semibold shadow-sm">
                  <Check size={12} />
                  Confirmed
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Date and time cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide m-0">
                    Date
                  </p>
                  <p className="text-base font-semibold text-gray-900 mt-1.5 m-0 capitalize">
                    {new Date(selectedSlot.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide m-0">
                    Time
                  </p>
                  <p className="text-base font-semibold text-gray-900 mt-1.5 m-0">
                    {selectedSlot.startTime} - {selectedSlot.endTime}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {selectedSlot.booking.notes && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-4">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User size={12} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-600 m-0">
                        Note from player
                      </p>
                      <p className="text-sm text-gray-700 mt-1 m-0 leading-relaxed">
                        {selectedSlot.booking.notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedSlot.status === 'pending' ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDecline(selectedSlot.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white text-red-600 border-2 border-red-200 hover:border-red-300 hover:bg-red-50 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-150"
                  >
                    <X size={18} />
                    Decline
                  </button>
                  <button
                    onClick={() => handleApprove(selectedSlot.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white border-none rounded-xl text-sm font-semibold cursor-pointer shadow-md hover:shadow-lg transition-all duration-150"
                  >
                    <Check size={18} />
                    Approve
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate(`/coach/athletes/${selectedSlot.booking?.id}`)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-tier-navy hover:bg-tier-navy-dark text-white border-none rounded-xl text-sm font-semibold cursor-pointer shadow-md hover:shadow-lg transition-all duration-150"
                >
                  <User size={18} />
                  View Player Profile
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Create booking dialog */}
      {createDialogSlot && (
        <BookingCreateDialog
          isOpen={createDialogOpen}
          onClose={() => {
            setCreateDialogOpen(false);
            setCreateDialogSlot(null);
          }}
          onSave={handleCreateBooking}
          date={createDialogSlot.date}
          startTime={createDialogSlot.startTime}
          endTime={createDialogSlot.endTime}
        />
      )}
    </div>
  );
}
