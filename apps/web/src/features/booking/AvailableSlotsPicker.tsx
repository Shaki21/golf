import React, { useState, useEffect } from 'react';
import { calendarAPI } from '../../services/api';
import { useToast } from '../../components/shadcn/use-toast';
import Button from '../../ui/primitives/Button';
import Card from '../../ui/primitives/Card';
import { TextInput } from '../../ui/primitives/Input';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';
import { Calendar, Clock, ChevronLeft, ChevronRight, User } from 'lucide-react';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  coachId: string;
  coachName: string;
  available: boolean;
}

interface AvailableSlotsPickerProps {
  coachId?: string;
  onSelectSlot: (slot: TimeSlot) => void;
  selectedSlotId?: string;
}

export const AvailableSlotsPicker: React.FC<AvailableSlotsPickerProps> = ({
  coachId,
  onSelectSlot,
  selectedSlotId,
}) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, [selectedDate, coachId]);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const response = await calendarAPI.getAvailability(coachId || '', selectedDate);
      const availabilityData = response.data.data || [];
      // Transform to slots
      const transformedSlots: TimeSlot[] = availabilityData.map((slot: any, index: number) => ({
        id: slot.id || `slot-${index}`,
        startTime: slot.startTime || slot.start,
        endTime: slot.endTime || slot.end,
        coachId: slot.coachId || coachId || '',
        coachName: slot.coachName || 'Coach',
        available: slot.available !== false,
      }));
      setSlots(transformedSlots);
    } catch (error) {
      // Demo data
      const demoSlots: TimeSlot[] = [
        { id: '1', startTime: '09:00', endTime: '10:00', coachId: '1', coachName: 'Hans Coach', available: true },
        { id: '2', startTime: '10:00', endTime: '11:00', coachId: '1', coachName: 'Hans Coach', available: true },
        { id: '3', startTime: '11:00', endTime: '12:00', coachId: '1', coachName: 'Hans Coach', available: false },
        { id: '4', startTime: '13:00', endTime: '14:00', coachId: '1', coachName: 'Hans Coach', available: true },
        { id: '5', startTime: '14:00', endTime: '15:00', coachId: '1', coachName: 'Hans Coach', available: true },
        { id: '6', startTime: '15:00', endTime: '16:00', coachId: '1', coachName: 'Hans Coach', available: true },
      ];
      setSlots(demoSlots);
    } finally {
      setLoading(false);
    }
  };

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const availableSlots = slots.filter(s => s.available);

  return (
    <Card variant="default" padding="lg">
      <SectionTitle className="mb-4">Select time</SectionTitle>

      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-4 p-3 bg-tier-surface-base rounded-lg">
        <button
          onClick={() => changeDate(-1)}
          className="p-2 hover:bg-tier-border-default rounded-lg transition-colors"
        >
          <ChevronLeft size={20} className="text-tier-text-secondary" />
        </button>
        <div className="text-center">
          <p className="font-semibold text-tier-navy capitalize">
            {formatDate(selectedDate)}
          </p>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs text-tier-text-secondary bg-transparent border-none text-center cursor-pointer"
          />
        </div>
        <button
          onClick={() => changeDate(1)}
          className="p-2 hover:bg-tier-border-default rounded-lg transition-colors"
        >
          <ChevronRight size={20} className="text-tier-text-secondary" />
        </button>
      </div>

      {/* Time Slots */}
      {loading ? (
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-16 bg-tier-surface-base rounded-lg animate-pulse" />
          ))}
        </div>
      ) : availableSlots.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {slots.map(slot => {
            const isSelected = selectedSlotId === slot.id;
            const isAvailable = slot.available;

            return (
              <button
                key={slot.id}
                onClick={() => isAvailable && onSelectSlot(slot)}
                disabled={!isAvailable}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  isSelected
                    ? 'border-tier-navy bg-tier-navy/10'
                    : isAvailable
                    ? 'border-tier-border-default bg-tier-white hover:border-tier-navy/50'
                    : 'border-tier-border-default bg-tier-surface-base opacity-50 cursor-not-allowed'
                }`}
              >
                <Clock size={16} className={`mx-auto mb-1 ${isSelected ? 'text-tier-navy' : 'text-tier-text-secondary'}`} />
                <p className={`font-semibold ${isSelected ? 'text-tier-navy' : 'text-tier-navy'}`}>
                  {slot.startTime}
                </p>
                <p className="text-xs text-tier-text-secondary">
                  {slot.endTime}
                </p>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Calendar size={32} className="mx-auto text-tier-border-default mb-2" />
          <p className="text-tier-text-secondary">No available times this day</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => changeDate(1)}
            className="mt-2"
          >
            Try next day
          </Button>
        </div>
      )}

      {/* Summary */}
      {availableSlots.length > 0 && (
        <p className="text-xs text-tier-text-secondary text-center mt-3">
          {availableSlots.length} available times
        </p>
      )}
    </Card>
  );
};

export default AvailableSlotsPicker;
