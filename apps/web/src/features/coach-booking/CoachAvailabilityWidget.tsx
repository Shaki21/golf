/**
 * TIER Golf - Coach Availability Widget
 * Design System v3.0 - Premium Light
 *
 * Compact widget showing coach's current week availability.
 * Uses coachesAPI.getAvailability() backend endpoint.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Settings,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { coachesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../ui/primitives/Button';
import { SubSectionTitle } from '../../ui/primitives/typography';

// Types for availability
interface AvailabilitySlot {
  id: string;
  coachId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  maxBookings: number;
  sessionType?: string;
  validFrom: string;
  validUntil?: string;
  isActive: boolean;
}

// Day names in English
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface CoachAvailabilityWidgetProps {
  coachId?: string;
  compact?: boolean;
  onSettingsClick?: () => void;
}

export const CoachAvailabilityWidget: React.FC<CoachAvailabilityWidgetProps> = ({
  coachId: propCoachId,
  compact = false,
  onSettingsClick,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Use provided coachId or fall back to logged-in coach
  const coachId = propCoachId || user?.coachId || user?.id;

  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!coachId) {
        setLoading(false);
        return;
      }

      try {
        setError(null);

        // Get current week's date range
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

        const startDate = startOfWeek.toISOString().split('T')[0];
        const endDate = endOfWeek.toISOString().split('T')[0];

        const response = await coachesAPI.getAvailability(coachId, startDate, endDate);

        if (response?.data?.data) {
          setAvailability(response.data.data as AvailabilitySlot[]);
        }
      } catch (err) {
        console.error('Failed to fetch availability:', err);
        setError('Could not load availability');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [coachId]);

  // Group availability by day
  const availabilityByDay = useMemo(() => {
    const byDay: Record<number, AvailabilitySlot[]> = {};

    availability.forEach((slot) => {
      if (!byDay[slot.dayOfWeek]) {
        byDay[slot.dayOfWeek] = [];
      }
      byDay[slot.dayOfWeek].push(slot);
    });

    // Sort slots by start time within each day
    Object.keys(byDay).forEach((day) => {
      byDay[Number(day)].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return byDay;
  }, [availability]);

  // Get today's day of week (0-6)
  const today = new Date().getDay();

  // Calculate total available hours this week
  const totalHours = useMemo(() => {
    let minutes = 0;
    availability.forEach((slot) => {
      const [startH, startM] = slot.startTime.split(':').map(Number);
      const [endH, endM] = slot.endTime.split(':').map(Number);
      minutes += (endH * 60 + endM) - (startH * 60 + startM);
    });
    return Math.round(minutes / 60);
  }, [availability]);

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      navigate('/coach/booking/settings');
    }
  };

  if (loading) {
    return (
      <div className="bg-tier-white rounded-2xl p-5 border border-tier-border-default">
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-tier-navy" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-tier-white rounded-2xl p-5 border border-tier-border-default">
        <div className="flex items-center gap-2 text-tier-warning">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (compact) {
    // Compact version for dashboard
    return (
      <div className="bg-tier-white rounded-2xl p-4 border border-tier-border-default">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-tier-navy" />
            <span className="text-sm font-semibold text-tier-navy">
              Availability
            </span>
          </div>
          <button
            onClick={handleSettingsClick}
            className="p-1.5 hover:bg-tier-surface-base rounded-lg transition-colors"
          >
            <Settings size={16} className="text-tier-text-tertiary" />
          </button>
        </div>

        {availability.length === 0 ? (
          <p className="text-sm text-tier-text-secondary text-center py-4">
            No availability set up
          </p>
        ) : (
          <>
            {/* Summary stats */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-tier-text-tertiary" />
                <span className="text-sm text-tier-text-secondary">
                  {totalHours}h this week
                </span>
              </div>
              <div className="text-sm text-tier-text-secondary">
                {Object.keys(availabilityByDay).length} days
              </div>
            </div>

            {/* Mini week view */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                const slots = availabilityByDay[day] || [];
                const isToday = day === today;
                const hasSlots = slots.length > 0;

                return (
                  <div
                    key={day}
                    className={`flex-1 text-center py-2 rounded-lg text-xs font-medium ${
                      hasSlots
                        ? isToday
                          ? 'bg-tier-navy text-white'
                          : 'bg-tier-success/10 text-tier-success'
                        : 'bg-tier-surface-base text-tier-text-tertiary'
                    }`}
                  >
                    {DAY_NAMES[day]}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <button
          onClick={() => navigate('/coach/booking')}
          className="flex items-center justify-center gap-1 w-full mt-3 py-2 text-sm text-tier-navy hover:bg-tier-navy/5 rounded-lg transition-colors"
        >
          View Calendar
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  // Full version
  return (
    <div className="bg-tier-white rounded-2xl p-5 border border-tier-border-default">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-tier-navy" />
          <SubSectionTitle className="text-base font-semibold text-tier-navy" style={{ marginBottom: 0 }}>
            Weekly Availability
          </SubSectionTitle>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSettingsClick}>
          <Settings size={16} />
          Settings
        </Button>
      </div>

      {availability.length === 0 ? (
        <div className="text-center py-8 bg-tier-surface-base rounded-xl border border-dashed border-tier-border-default">
          <Calendar size={32} className="mx-auto text-tier-text-tertiary mb-2" />
          <p className="text-sm text-tier-text-secondary mb-3">
            No availability set up
          </p>
          <Button variant="primary" size="sm" onClick={handleSettingsClick}>
            Set Up Availability
          </Button>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-tier-surface-base rounded-xl p-3 text-center">
              <span className="text-2xl font-bold text-tier-navy">
                {totalHours}
              </span>
              <p className="text-xs text-tier-text-secondary">Hours available</p>
            </div>
            <div className="bg-tier-surface-base rounded-xl p-3 text-center">
              <span className="text-2xl font-bold text-tier-navy">
                {Object.keys(availabilityByDay).length}
              </span>
              <p className="text-xs text-tier-text-secondary">Days with sessions</p>
            </div>
          </div>

          {/* Week schedule */}
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 0].map((day) => {
              const slots = availabilityByDay[day] || [];
              const isToday = day === today;

              return (
                <div
                  key={day}
                  className={`flex items-center gap-3 py-2 px-3 rounded-xl ${
                    isToday ? 'bg-tier-navy/5 border border-tier-navy/20' : ''
                  }`}
                >
                  <div className="w-16">
                    <span
                      className={`text-sm font-medium ${
                        isToday ? 'text-tier-navy' : 'text-tier-navy'
                      }`}
                    >
                      {FULL_DAY_NAMES[day]}
                    </span>
                  </div>
                  <div className="flex-1">
                    {slots.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {slots.map((slot) => (
                          <span
                            key={slot.id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-tier-success/10 text-tier-success text-xs font-medium rounded"
                          >
                            <Clock size={12} />
                            {slot.startTime}-{slot.endTime}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-tier-text-tertiary">
                        Not available
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default CoachAvailabilityWidget;
