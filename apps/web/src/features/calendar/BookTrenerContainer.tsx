/**
 * BookTrenerContainer
 *
 * Archetype: C - Dashboard/Calendar Page
 * Purpose: Book a session with a trainer
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar, Clock, User, ChevronLeft, ChevronRight, Check,
  Video, MapPin, Star, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/layout/PageHeader';
import apiClient from '../../services/apiClient';
import Button from '../../ui/primitives/Button';
import { SubSectionTitle, CardTitle } from '../../components/typography/Headings';
import { useAuth } from '../../contexts/AuthContext';

// ============================================================================
// TYPES
// ============================================================================

interface Coach {
  id: string;
  name: string;
  role: string;
  specialties: string[];
  avatar: string | null;
  rating: number;
  reviews: number;
  nextAvailable: string;
}

interface TimeSlot {
  time: string;
  duration: number;
  available: boolean;
}

interface SessionType {
  id: string;
  label: string;
  duration: number;
  price: number;
}

// API response types
interface CoachApiResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  specializations?: string[];
  certifications?: string[];
  status: string;
  profileImageUrl?: string;
  avatar?: string;
}

// API returns availability rules, not individual slots
interface AvailabilityRule {
  id: string;
  coachId: string;
  dayOfWeek: number;
  startTime: string;  // "09:00" format
  endTime: string;    // "17:00" format
  slotDuration: number;
  maxBookings: number;
  isActive: boolean;
}

// ============================================================================
// SESSION TYPES CONFIG
// ============================================================================

const SESSION_TYPES: SessionType[] = [
  { id: 'individual', label: 'Individuell økt', duration: 60, price: 800 },
  { id: 'video_analysis', label: 'Videoanalyse', duration: 45, price: 600 },
  { id: 'on_course', label: 'På banen', duration: 90, price: 1200 },
  { id: 'online', label: 'Online økt', duration: 45, price: 500 },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function mapApiCoachToCoach(apiCoach: CoachApiResponse): Coach {
  // Combine specializations and certifications for display
  const specialties = [
    ...(apiCoach.specializations || []),
    ...(apiCoach.certifications || [])
  ];

  return {
    id: apiCoach.id,
    name: `${apiCoach.firstName} ${apiCoach.lastName}`,
    role: apiCoach.specializations?.[0] || 'Trener',
    specialties: specialties.slice(0, 3),
    avatar: apiCoach.avatar || apiCoach.profileImageUrl || null,
    rating: 4.8, // Default rating - would come from reviews in real system
    reviews: 0,
    nextAvailable: new Date().toISOString().split('T')[0],
  };
}

function mapAvailabilityToSlots(availabilityRules: AvailabilityRule[], selectedDate: string): TimeSlot[] {
  // Get day of week for the selected date (0=Sun, 1=Mon, etc.)
  const date = new Date(selectedDate);
  const dayOfWeek = date.getDay();

  // Find ALL matching availability rules for this day (e.g., morning and afternoon slots)
  const matchingRules = availabilityRules.filter(rule => rule.dayOfWeek === dayOfWeek && rule.isActive);

  if (matchingRules.length === 0) {
    return [];
  }

  // Generate time slots from all matching rules
  const slots: TimeSlot[] = [];

  for (const rule of matchingRules) {
    const [startHour, startMin] = rule.startTime.split(':').map(Number);
    const [endHour, endMin] = rule.endTime.split(':').map(Number);
    const slotDuration = rule.slotDuration || 60;

    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
      slots.push({
        time: timeStr,
        duration: slotDuration,
        available: true, // Would check bookings in real implementation
      });

      // Advance by slot duration
      currentMin += slotDuration;
      while (currentMin >= 60) {
        currentMin -= 60;
        currentHour += 1;
      }
    }
  }

  // Sort slots by time
  slots.sort((a, b) => a.time.localeCompare(b.time));

  return slots;
}

// ============================================================================
// COACH CARD
// ============================================================================

interface CoachCardProps {
  coach: Coach;
  selected: boolean;
  onSelect: (coach: Coach) => void;
}

const CoachCard: React.FC<CoachCardProps> = ({ coach, selected, onSelect }) => (
  <div
    onClick={() => onSelect(coach)}
    className={`
      bg-tier-white rounded-xl p-3.5 cursor-pointer transition-all shadow-sm
      hover:-translate-y-0.5 border-2
      ${selected ? 'border-tier-navy' : 'border-transparent'}
    `}
  >
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-tier-navy flex items-center justify-center text-white text-lg font-semibold">
        {coach.name.split(' ').map((n) => n[0]).join('')}
      </div>
      <div className="flex-1">
        <CardTitle className="text-sm font-semibold text-tier-navy m-0">
          {coach.name}
        </CardTitle>
        <p className="text-xs text-tier-text-secondary mt-0.5 mb-0">
          {coach.role}
        </p>
        <div className="flex items-center gap-1 mt-1">
          <Star size={12} className="fill-tier-warning text-tier-warning" />
          <span className="text-xs font-medium text-tier-navy">
            {coach.rating}
          </span>
          <span className="text-[11px] text-tier-text-secondary">
            ({coach.reviews} anmeldelser)
          </span>
        </div>
      </div>
      {selected && (
        <div className="w-6 h-6 rounded-full bg-tier-navy flex items-center justify-center">
          <Check size={14} className="text-white" />
        </div>
      )}
    </div>
    <div className="flex gap-1.5 mt-2.5 flex-wrap">
      {coach.specialties.map((specialty, idx) => (
        <span
          key={idx}
          className="text-[10px] px-2 py-0.5 rounded bg-tier-surface-base text-tier-text-secondary"
        >
          {specialty}
        </span>
      ))}
    </div>
  </div>
);

// ============================================================================
// DATE SELECTOR
// ============================================================================

interface DateSelectorProps {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  availableSlots: Record<string, TimeSlot[]>;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onSelectDate, availableSlots }) => {
  const [weekOffset, setWeekOffset] = useState(0);

  const getWeekDates = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + (weekOffset * 7));

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const weekDates = getWeekDates();

  return (
    <div className="bg-tier-white rounded-[14px] p-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setWeekOffset(weekOffset - 1)}
          className="p-2 rounded-lg border-none bg-tier-surface-base cursor-pointer"
        >
          <ChevronLeft size={18} className="text-tier-navy" />
        </button>
        <SubSectionTitle className="text-sm font-semibold text-tier-navy m-0">
          {weekDates[0].toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' })}
        </SubSectionTitle>
        <button
          onClick={() => setWeekOffset(weekOffset + 1)}
          className="p-2 rounded-lg border-none bg-tier-surface-base cursor-pointer"
        >
          <ChevronRight size={18} className="text-tier-navy" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {weekDates.map((date) => {
          const dateStr = date.toISOString().split('T')[0];
          const isSelected = dateStr === selectedDate;
          const hasSlots = availableSlots[dateStr]?.some((s) => s.available);
          const isToday = date.toDateString() === new Date().toDateString();
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

          return (
            <button
              key={dateStr}
              onClick={() => !isPast && onSelectDate(dateStr)}
              disabled={isPast}
              className={`
                flex flex-col items-center py-2.5 px-1 rounded-[10px] border-2 cursor-pointer
                ${isSelected ? 'border-tier-navy bg-tier-navy/15' : 'border-transparent'}
                ${!isSelected && isToday ? 'bg-tier-surface-base' : ''}
                ${isPast ? 'cursor-not-allowed opacity-40' : ''}
              `}
            >
              <span className="text-[10px] text-tier-text-secondary uppercase">
                {date.toLocaleDateString('nb-NO', { weekday: 'short' })}
              </span>
              <span className={`
                text-base font-semibold my-1
                ${isSelected ? 'text-tier-navy' : 'text-tier-navy'}
              `}>
                {date.getDate()}
              </span>
              {hasSlots && !isPast && (
                <div className="w-1.5 h-1.5 rounded-full bg-tier-success" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// TIME SLOTS
// ============================================================================

interface TimeSlotsProps {
  date: string | null;
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  availableSlots: Record<string, TimeSlot[]>;
  loading?: boolean;
}

const TimeSlots: React.FC<TimeSlotsProps> = ({ date, selectedSlot, onSelectSlot, availableSlots, loading }) => {
  const slots = date ? availableSlots[date] || [] : [];

  if (!date) {
    return (
      <div className="bg-tier-white rounded-[14px] p-6 text-center">
        <Calendar size={32} className="text-tier-text-secondary mb-2 mx-auto" />
        <p className="text-sm text-tier-text-secondary m-0">
          Velg en dato for å se tilgjengelige tider
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-tier-white rounded-[14px] p-6 text-center">
        <Loader2 size={32} className="text-tier-navy mb-2 mx-auto animate-spin" />
        <p className="text-sm text-tier-text-secondary m-0">
          Henter tilgjengelige tider...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-tier-white rounded-[14px] p-4 mb-5">
      <SubSectionTitle className="text-sm font-semibold text-tier-navy mb-3">
        Tilgjengelige tider - {new Date(date).toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' })}
      </SubSectionTitle>

      {slots.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2">
          {slots.map((slot, idx) => (
            <button
              key={idx}
              onClick={() => slot.available && onSelectSlot(slot)}
              disabled={!slot.available}
              className={`
                py-3 px-2 rounded-lg border-2 text-sm font-medium
                ${!slot.available
                  ? 'bg-tier-border-default text-tier-text-secondary cursor-not-allowed line-through border-transparent'
                  : selectedSlot?.time === slot.time
                    ? 'border-tier-navy bg-tier-navy/15 text-tier-navy cursor-pointer'
                    : 'bg-tier-surface-base text-tier-navy cursor-pointer border-transparent'
                }
              `}
            >
              {slot.time}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-tier-text-secondary m-0">
          Ingen tilgjengelige tider denne dagen
        </p>
      )}
    </div>
  );
};

// ============================================================================
// SESSION TYPE SELECTOR
// ============================================================================

interface SessionTypeSelectorProps {
  selected: SessionType | null;
  onSelect: (type: SessionType) => void;
}

const SessionTypeSelector: React.FC<SessionTypeSelectorProps> = ({ selected, onSelect }) => (
  <div className="bg-tier-white rounded-[14px] p-4 mb-5">
    <SubSectionTitle className="text-sm font-semibold text-tier-navy mb-3">
      Type økt
    </SubSectionTitle>
    <div className="flex flex-col gap-2">
      {SESSION_TYPES.map((type) => (
        <button
          key={type.id}
          onClick={() => onSelect(type)}
          className={`
            flex items-center justify-between py-3 px-3.5 rounded-[10px] cursor-pointer
            ${selected?.id === type.id
              ? 'border-2 border-tier-navy bg-tier-navy/10'
              : 'border border-tier-border-default bg-tier-white'
            }
          `}
        >
          <div className="flex items-center gap-2.5">
            {type.id === 'online' ? <Video size={18} className="text-tier-navy" /> :
             type.id === 'on_course' ? <MapPin size={18} className="text-tier-success" /> :
             <User size={18} className="text-tier-navy" />}
            <div className="text-left">
              <div className="text-sm font-medium text-tier-navy">
                {type.label}
              </div>
              <div className="text-xs text-tier-text-secondary">
                {type.duration} min
              </div>
            </div>
          </div>
          <div className="text-sm font-semibold text-tier-navy">
            {type.price} kr
          </div>
        </button>
      ))}
    </div>
  </div>
);

// ============================================================================
// BOOKING SUMMARY
// ============================================================================

interface BookingSummaryProps {
  coach: Coach | null;
  date: string | null;
  slot: TimeSlot | null;
  sessionType: SessionType | null;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ coach, date, slot, sessionType, onConfirm, isSubmitting }) => {
  const canBook = coach && date && slot && sessionType && !isSubmitting;

  return (
    <div className="bg-tier-white rounded-[14px] p-4">
      <SubSectionTitle className="text-[15px] font-semibold text-tier-navy mb-4">
        Bookingoppsummering
      </SubSectionTitle>

      {coach && (
        <div className="flex items-center gap-2.5 mb-3 p-2.5 bg-tier-surface-base rounded-lg">
          <User size={16} className="text-tier-text-secondary" />
          <span className="text-[13px] text-tier-navy">
            {coach.name}
          </span>
        </div>
      )}

      {date && slot && (
        <div className="flex items-center gap-2.5 mb-3 p-2.5 bg-tier-surface-base rounded-lg">
          <Calendar size={16} className="text-tier-text-secondary" />
          <span className="text-[13px] text-tier-navy">
            {new Date(date).toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' })} kl. {slot.time}
          </span>
        </div>
      )}

      {sessionType && (
        <div className="flex items-center gap-2.5 mb-3 p-2.5 bg-tier-surface-base rounded-lg">
          <Clock size={16} className="text-tier-text-secondary" />
          <span className="text-[13px] text-tier-navy">
            {sessionType.label} ({sessionType.duration} min)
          </span>
        </div>
      )}

      {sessionType && (
        <div className="flex justify-between items-center py-3 border-t border-tier-border-default">
          <span className="text-sm text-tier-text-secondary">Total</span>
          <span className="text-lg font-bold text-tier-navy">
            {sessionType.price} kr
          </span>
        </div>
      )}

      <Button
        variant="primary"
        onClick={onConfirm}
        disabled={!canBook}
        className="w-full mt-4"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Booker...
          </span>
        ) : (
          'Bekreft booking'
        )}
      </Button>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const BookTrenerContainer: React.FC = () => {
  // Auth context
  const { user } = useAuth();

  // Selection state
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedSessionType, setSelectedSessionType] = useState<SessionType | null>(null);

  // Data state
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Record<string, TimeSlot[]>>({});

  // Loading/error state
  const [isLoadingCoaches, setIsLoadingCoaches] = useState(true);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Fetch coaches on mount
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        setIsLoadingCoaches(true);
        const response = await apiClient.get('/coaches');
        // API returns { success: true, data: { coaches: [...] } }
        const apiCoaches = response.data?.data?.coaches || response.data?.coaches || [];
        const mappedCoaches = apiCoaches.map(mapApiCoachToCoach);
        setCoaches(mappedCoaches);
      } catch (err) {
        console.error('Failed to fetch coaches:', err);
        // Keep empty array on error
      } finally {
        setIsLoadingCoaches(false);
      }
    };

    fetchCoaches();
  }, []);

  // Fetch availability when coach or date changes
  const fetchAvailability = useCallback(async (coachId: string, date: string) => {
    try {
      setIsLoadingAvailability(true);
      // Get availability for the selected date
      const startDate = date;
      const endDate = date;
      const response = await apiClient.get(`/coaches/${coachId}/availability`, {
        params: { startDate, endDate }
      });

      // API returns { success: true, data: [...availability rules...] }
      const availabilityRules = response.data?.data || response.data?.slots || [];
      const slots = Array.isArray(availabilityRules) ? mapAvailabilityToSlots(availabilityRules, date) : [];

      setAvailableSlots(prev => ({
        ...prev,
        [date]: slots
      }));
    } catch (err) {
      console.error('Failed to fetch availability:', err);
      // Set empty slots on error
      setAvailableSlots(prev => ({
        ...prev,
        [date]: []
      }));
    } finally {
      setIsLoadingAvailability(false);
    }
  }, []);

  // Fetch availability when coach or date changes
  useEffect(() => {
    if (selectedCoach && selectedDate) {
      fetchAvailability(selectedCoach.id, selectedDate);
    }
  }, [selectedCoach, selectedDate, fetchAvailability]);

  const handleConfirm = async () => {
    if (!selectedCoach || !selectedDate || !selectedSlot || !selectedSessionType) {
      return;
    }

    // Get playerId from user context
    const playerId = user?.playerId || user?.id;
    if (!playerId) {
      setBookingError('Kunne ikke finne bruker-ID');
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    try {
      // Create start and end times from selected date and slot
      const startTime = new Date(`${selectedDate}T${selectedSlot.time}:00`);
      const endTime = new Date(startTime.getTime() + selectedSessionType.duration * 60000);

      await apiClient.post('/bookings', {
        playerId,
        coachId: selectedCoach.id,
        sessionType: selectedSessionType.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      setBookingSuccess(true);

      // Show success toast
      const dateStr = new Date(selectedDate).toLocaleDateString('nb-NO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
      toast.success('Booking bekreftet!', {
        description: `${selectedSessionType.label} med ${selectedCoach.name} - ${dateStr} kl. ${selectedSlot.time}`,
        duration: 5000,
      });

      // Reset form after successful booking
      setSelectedDate(null);
      setSelectedSlot(null);
      setSelectedSessionType(null);
      setAvailableSlots({});
    } catch (err) {
      console.error('Booking failed:', err);
      const errorMessage = (err as Error).message || 'Kunne ikke fullføre bestillingen';
      setBookingError(errorMessage);

      // Show error toast
      toast.error('Booking feilet', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unused state for future implementation
  void bookingSuccess;
  void bookingError;

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Book trener"
        subtitle="Reserver en time med din trener"
        helpText="Book en individuell treningstime eller veiledning med din trener. Velg tilgjengelig tidspunkt i trenerens kalender og bekreft reservasjonen."
        actions={null}
      />

      <div className="py-4 px-6 max-w-7xl mx-auto grid grid-cols-[1fr_320px] gap-6 items-start">
        <div>
          {/* Coach Selection */}
          <div className="mb-6">
            <SubSectionTitle className="text-sm font-semibold text-tier-navy mb-3">
              Velg trener
            </SubSectionTitle>
            {isLoadingCoaches ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="text-tier-navy animate-spin mr-2" />
                <span className="text-tier-text-secondary">Henter trenere...</span>
              </div>
            ) : coaches.length === 0 ? (
              <div className="bg-tier-white rounded-xl p-6 text-center">
                <p className="text-tier-text-secondary">Ingen trenere tilgjengelig</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {coaches.map((coach) => (
                  <CoachCard
                    key={coach.id}
                    coach={coach}
                    selected={selectedCoach?.id === coach.id}
                    onSelect={setSelectedCoach}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Date Selection */}
          <DateSelector
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setSelectedSlot(null);
            }}
            availableSlots={availableSlots}
          />

          {/* Time Slots */}
          <TimeSlots
            date={selectedDate}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
            availableSlots={availableSlots}
            loading={isLoadingAvailability}
          />

          {/* Session Type */}
          <SessionTypeSelector
            selected={selectedSessionType}
            onSelect={setSelectedSessionType}
          />
        </div>

        {/* Booking Summary */}
        <div className="sticky top-4 self-start">
          <BookingSummary
            coach={selectedCoach}
            date={selectedDate}
            slot={selectedSlot}
            sessionType={selectedSessionType}
            onConfirm={handleConfirm}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default BookTrenerContainer;
