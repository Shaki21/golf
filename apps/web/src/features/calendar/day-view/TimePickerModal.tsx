/**
 * TimePickerModal
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 *
 * Modal to select a specific time for scheduling/rescheduling workouts
 */

import React, { useState, useEffect } from 'react';
import { X, Clock, Check } from 'lucide-react';
import { SectionTitle } from '../../../components/typography';

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (time: string) => void;
  initialTime?: string;
  title?: string;
}

// Generate hours (6-22)
const hours = Array.from({ length: 17 }, (_, i) => i + 6);
// Generate minutes (0, 15, 30, 45)
const minutes = [0, 15, 30, 45];

// Quick time options
const quickOptions = [
  { label: '08:00', time: '08:00' },
  { label: '10:00', time: '10:00' },
  { label: '12:00', time: '12:00' },
  { label: '14:00', time: '14:00' },
  { label: '16:00', time: '16:00' },
  { label: '18:00', time: '18:00' },
];

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialTime,
  title = 'Velg tidspunkt',
}) => {
  const [selectedHour, setSelectedHour] = useState(10);
  const [selectedMinute, setSelectedMinute] = useState(0);

  // Initialize from initialTime
  useEffect(() => {
    if (isOpen && initialTime) {
      const [h, m] = initialTime.split(':').map(Number);
      setSelectedHour(h);
      setSelectedMinute(m);
    } else if (isOpen) {
      // Default to current hour rounded to nearest 15 min
      const now = new Date();
      setSelectedHour(Math.max(6, Math.min(22, now.getHours())));
      setSelectedMinute(Math.floor(now.getMinutes() / 15) * 15);
    }
  }, [isOpen, initialTime]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    const time = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    onSelect(time);
    onClose();
  };

  const handleQuickSelect = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    setSelectedHour(h);
    setSelectedMinute(m);
  };

  if (!isOpen) return null;

  const displayTime = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[100] bg-black/50 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[360px] z-[101] rounded-xl shadow-lg transition-all duration-200 bg-tier-white ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-tier-border-default">
          <SectionTitle className="text-lg font-semibold text-tier-navy">
            {title}
          </SectionTitle>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-full transition-colors text-tier-text-tertiary hover:bg-tier-surface-base"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Time Display */}
          <div className="flex items-center justify-center gap-2 p-4 mb-4 rounded-lg bg-tier-surface-base">
            <Clock size={24} className="text-tier-text-tertiary" />
            <span className="text-5xl font-bold text-tier-navy tabular-nums">
              {displayTime}
            </span>
          </div>

          {/* Quick Options */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {quickOptions.map((option) => (
              <button
                key={option.time}
                onClick={() => handleQuickSelect(option.time)}
                className={`p-3 rounded-lg text-sm font-medium text-center transition-all border ${
                  displayTime === option.time
                    ? 'bg-tier-navy/10 border-tier-navy text-tier-navy'
                    : 'bg-tier-surface-base border-tier-border-default text-tier-text-secondary hover:border-tier-navy'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Picker Columns */}
          <div className="flex gap-4 mb-4">
            {/* Hour Picker */}
            <div className="flex-1 flex flex-col">
              <div className="text-xs font-medium text-center mb-2 text-tier-text-tertiary">
                Time
              </div>
              <div className="h-[200px] overflow-auto rounded-lg border border-tier-border-default bg-tier-white">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    onClick={() => setSelectedHour(hour)}
                    className={`flex items-center justify-center w-full p-3 text-base font-medium transition-all ${
                      selectedHour === hour
                        ? 'bg-tier-navy text-white'
                        : 'text-tier-text-secondary hover:bg-tier-surface-base'
                    }`}
                  >
                    {hour.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* Minute Picker */}
            <div className="flex-1 flex flex-col">
              <div className="text-xs font-medium text-center mb-2 text-tier-text-tertiary">
                Minutt
              </div>
              <div className="h-[200px] overflow-auto rounded-lg border border-tier-border-default bg-tier-white">
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    onClick={() => setSelectedMinute(minute)}
                    className={`flex items-center justify-center w-full p-3 text-base font-medium transition-all ${
                      selectedMinute === minute
                        ? 'bg-tier-navy text-white'
                        : 'text-tier-text-secondary hover:bg-tier-surface-base'
                    }`}
                  >
                    {minute.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-tier-border-default">
          <button
            onClick={onClose}
            className="flex-1 p-3 rounded-lg text-base font-medium transition-all border border-tier-border-default text-tier-text-secondary hover:border-tier-navy"
          >
            Avbryt
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg text-base font-semibold transition-colors bg-tier-navy text-white hover:bg-tier-navy/90"
          >
            <Check size={18} />
            Bekreft
          </button>
        </div>
      </div>
    </>
  );
};

export default TimePickerModal;
