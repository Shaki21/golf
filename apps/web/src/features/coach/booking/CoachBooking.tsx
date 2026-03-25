/**
 * CoachBooking - Booking Calendar Hub Page
 *
 * Purpose: Manage schedule and requests.
 *
 * Features:
 * - Week view grid
 * - Booking statuses: available/booked/pending/blocked
 * - Quick stats counts
 * - Links to requests and settings
 */

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  Settings,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ban,
} from 'lucide-react';
import { PageTitle, SectionTitle } from '../../../components/typography';
import { bookingSlots, getBookingStats, type BookingSlot } from '../../../lib/coachMockData';
import { bookingStatuses } from '../../../config/coach-navigation';

// Time slots for the grid
const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

// Generate week days
function getWeekDays(startDate: Date): Date[] {
  const days: Date[] = [];
  const start = new Date(startDate);
  // Start from Monday
  const dayOfWeek = start.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  start.setDate(start.getDate() + diff);

  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  return days;
}

// Format date for display
function formatDate(date: Date): string {
  return date.toLocaleDateString('nb-NO', { weekday: 'short', day: 'numeric' });
}

function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Status icon
function StatusIcon({ status }: { status: BookingSlot['status'] }) {
  switch (status) {
    case 'booked':
      return <CheckCircle size={14} className="text-blue-600" />;
    case 'pending':
      return <AlertCircle size={14} className="text-yellow-600" />;
    case 'blocked':
      return <Ban size={14} className="text-red-600" />;
    default:
      return null;
  }
}

// Slot cell component
function SlotCell({
  slot,
  onClick,
}: {
  slot?: BookingSlot;
  onClick: () => void;
}) {
  if (!slot) {
    return (
      <div
        onClick={onClick}
        className="h-16 border border-dashed border-tier-border-default rounded-lg flex items-center justify-center cursor-pointer hover:bg-tier-surface-base transition-colors"
      >
        <span className="text-xs text-tier-text-tertiary">Ledig</span>
      </div>
    );
  }

  const statusConfig = bookingStatuses[slot.status];
  const bgColors = {
    available: 'bg-green-50 border-green-200',
    booked: 'bg-blue-50 border-blue-200',
    pending: 'bg-yellow-50 border-yellow-200',
    blocked: 'bg-red-50 border-red-200',
  };

  return (
    <div
      onClick={onClick}
      className={`h-16 border rounded-lg p-2 cursor-pointer hover:shadow-md transition-all ${bgColors[slot.status]}`}
    >
      <div className="flex items-center gap-1 mb-1">
        <StatusIcon status={slot.status} />
        <span className="text-xs font-medium truncate">
          {slot.athleteName || statusConfig?.labelNO || slot.status}
        </span>
      </div>
      {slot.sessionType && (
        <span className="text-xs text-tier-text-secondary truncate block">
          {slot.sessionType}
        </span>
      )}
    </div>
  );
}

// Stat card
function StatCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ElementType;
}) {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-tier-white rounded-xl border border-tier-border-default p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center`}>
        <Icon size={20} />
      </div>
      <div>
        <div className="text-2xl font-bold text-tier-navy">{value}</div>
        <div className="text-sm text-tier-text-secondary">{label}</div>
      </div>
    </div>
  );
}

export default function CoachBooking() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const stats = getBookingStats();

  // Get slot for a specific date and time
  const getSlot = (date: Date, time: string): BookingSlot | undefined => {
    const dateStr = formatDateISO(date);
    return bookingSlots.find(s => s.date === dateStr && s.time === time);
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

  const handleSlotClick = (_date: Date, _time: string, _slot?: BookingSlot) => {
    // TODO: In a real app, this would open a modal or navigate to a detail page
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <PageTitle>Kalender</PageTitle>
          <p className="text-tier-text-secondary mt-1">
            Administrer dine økter og tilgjengelighet
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/coach/booking/requests"
            className="flex items-center gap-2 px-4 py-2 bg-tier-white border border-tier-border-default rounded-lg text-sm font-medium text-tier-navy hover:bg-tier-surface-base transition-colors"
          >
            <FileText size={18} />
            Forespørsler
          </Link>
          <Link
            to="/coach/booking/settings"
            className="flex items-center gap-2 px-4 py-2 bg-tier-white border border-tier-border-default rounded-lg text-sm font-medium text-tier-navy hover:bg-tier-surface-base transition-colors"
          >
            <Settings size={18} />
            Tilgjengelighet
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Tilgjengelig" value={stats.available} color="green" icon={CheckCircle} />
        <StatCard label="Booket" value={stats.booked} color="blue" icon={User} />
        <StatCard label="Venter" value={stats.pending} color="yellow" icon={AlertCircle} />
        <StatCard label="Blokkert" value={stats.blocked} color="red" icon={Ban} />
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousWeek}
            className="p-2 rounded-lg hover:bg-tier-surface-base transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToNextWeek}
            className="p-2 rounded-lg hover:bg-tier-surface-base transition-colors"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm font-medium text-tier-navy hover:bg-tier-navy/10 rounded-lg transition-colors"
          >
            I dag
          </button>
        </div>

        <SectionTitle className="!mb-0">
          {weekDays[0].toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' })}
        </SectionTitle>
      </div>

      {/* Calendar grid */}
      <div className="bg-tier-white rounded-xl border border-tier-border-default overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-8 border-b border-tier-border-default">
          <div className="p-3 bg-tier-surface-base flex items-center justify-center">
            <Clock size={16} className="text-tier-text-secondary" />
          </div>
          {weekDays.map((day, i) => {
            const isToday = formatDateISO(day) === formatDateISO(new Date());
            return (
              <div
                key={i}
                className={`p-3 text-center border-l border-tier-border-default ${
                  isToday ? 'bg-tier-navy/10' : 'bg-tier-surface-base'
                }`}
              >
                <div className={`text-sm font-medium ${isToday ? 'text-tier-navy' : 'text-tier-navy'}`}>
                  {formatDate(day)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time rows */}
        {TIME_SLOTS.map((time, timeIndex) => (
          <div
            key={time}
            className={`grid grid-cols-8 ${timeIndex !== TIME_SLOTS.length - 1 ? 'border-b border-tier-border-default' : ''}`}
          >
            <div className="p-3 bg-tier-surface-base flex items-center justify-center text-sm text-tier-text-secondary">
              {time}
            </div>
            {weekDays.map((day, dayIndex) => {
              const slot = getSlot(day, time);
              return (
                <div
                  key={dayIndex}
                  className="p-1 border-l border-tier-border-default"
                >
                  <SlotCell
                    slot={slot}
                    onClick={() => handleSlotClick(day, time, slot)}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        {Object.entries(bookingStatuses).map(([key, status]) => (
          <div key={key} className="flex items-center gap-2 text-sm text-tier-text-secondary">
            <span>{status.icon}</span>
            <span>{status.labelNO}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
