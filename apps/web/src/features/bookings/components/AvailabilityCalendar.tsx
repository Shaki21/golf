/**
 * Availability Calendar Component
 * Shows coach availability in a weekly calendar view
 */

import React from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../../ui/primitives/Button';
import { SubSectionTitle } from '../../../components/typography/Headings';
import { CoachAvailability } from '../../../hooks/useBookings';

interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
  reason?: string;
}

interface Props {
  availability: CoachAvailability[];
  onSlotSelect: (slot: AvailabilitySlot) => void;
  dateRange: { startDate: string; endDate: string };
  onDateRangeChange: (range: { startDate: string; endDate: string }) => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const AvailabilityCalendar: React.FC<Props> = ({
  availability,
  onSlotSelect,
  dateRange,
  onDateRangeChange,
}) => {
  // Transform CoachAvailability to AvailabilitySlot and group by date
  const availabilityByDate = React.useMemo(() => {
    const grouped: Record<string, AvailabilitySlot[]> = {};

    // Transform CoachAvailability[] to flat AvailabilitySlot[]
    availability.forEach((coachAvail) => {
      coachAvail.availability.forEach((day) => {
        if (!grouped[day.date]) {
          grouped[day.date] = [];
        }
        day.slots.forEach((slot, index) => {
          grouped[day.date].push({
            id: `${coachAvail.coachId}-${day.date}-${index}`,
            date: day.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            available: slot.available,
          });
        });
      });
    });

    return grouped;
  }, [availability]);

  // Generate week dates
  const weekDates = React.useMemo(() => {
    const start = new Date(dateRange.startDate);
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [dateRange.startDate]);

  // Navigate to previous/next week
  const navigateWeek = (direction: 'prev' | 'next') => {
    const start = new Date(dateRange.startDate);
    const offset = direction === 'prev' ? -7 : 7;
    start.setDate(start.getDate() + offset);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    onDateRangeChange({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    });
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="bg-white rounded-xl border border-tier-border-default overflow-hidden">
      {/* Header with week navigation */}
      <div className="flex items-center justify-between p-4 border-b border-tier-border-default">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-tier-navy" />
          <SubSectionTitle style={{ marginBottom: 0 }}>
            Available slots
          </SubSectionTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ChevronLeft size={16} />}
            onClick={() => navigateWeek('prev')}
          >
            Previous week
          </Button>
          <Button
            variant="secondary"
            size="sm"
            rightIcon={<ChevronRight size={16} />}
            onClick={() => navigateWeek('next')}
          >
            Next week
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 divide-x divide-tier-border-default">
        {weekDates.map((date, index) => {
          const dateStr = date.toISOString().split('T')[0];
          const slots = availabilityByDate[dateStr] || [];
          const availableSlots = slots.filter((s) => s.available);
          const today = isToday(date);

          return (
            <div
              key={dateStr}
              className={`min-h-[200px] ${today ? 'bg-tier-info-light' : ''}`}
            >
              {/* Day header */}
              <div
                className={`p-3 text-center border-b border-tier-border-default ${
                  today ? 'bg-tier-info text-white' : 'bg-tier-surface-base'
                }`}
              >
                <div className="text-xs font-medium">
                  {WEEKDAYS[date.getDay() === 0 ? 6 : date.getDay() - 1]}
                </div>
                <div className="text-lg font-bold mt-1">{formatDate(date)}</div>
              </div>

              {/* Time slots */}
              <div className="p-2 space-y-2">
                {availableSlots.length === 0 ? (
                  <p className="text-xs text-tier-text-secondary text-center py-4">
                    No available slots
                  </p>
                ) : (
                  availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => onSlotSelect(slot)}
                      className="w-full px-2 py-2 bg-tier-success-light text-tier-success rounded text-xs font-medium hover:bg-tier-success hover:text-white transition-colors"
                    >
                      <Clock size={12} className="inline mr-1" />
                      {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 p-4 border-t border-tier-border-default bg-tier-surface-base">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-tier-success-light rounded"></div>
          <span className="text-sm text-tier-text-secondary">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-tier-surface-base border border-tier-border-default rounded"></div>
          <span className="text-sm text-tier-text-secondary">Busy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-tier-info rounded"></div>
          <span className="text-sm text-tier-text-secondary">Today</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
