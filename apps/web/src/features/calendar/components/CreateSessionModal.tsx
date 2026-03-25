/**
 * CreateSessionModal.tsx
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 *
 * MVP modal for creating a new session:
 * - Title
 * - Date
 * - Start time
 * - Duration
 * - Category
 */

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SectionTitle } from '../../../components/typography';

interface CreateSessionModalProps {
  isOpen: boolean;
  initialDate?: Date;
  initialTime?: string;
  onClose: () => void;
  onSubmit: (session: NewSession) => void;
}

export interface NewSession {
  title: string;
  date: string;
  start: string;
  duration: number;
  category: string;
}

const CATEGORIES = [
  { value: 'putting', label: 'Putting' },
  { value: 'range', label: 'Range' },
  { value: 'mental', label: 'Mental' },
  { value: 'testing', label: 'Testing' },
  { value: 'training', label: 'General training' },
  { value: 'mobility', label: 'Mobility' },
  { value: 'threshold', label: 'Threshold' },
];

const DURATION_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  isOpen,
  initialDate,
  initialTime,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState(30);
  const [category, setCategory] = useState('training');

  // Initialize with initial values
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDate(initialDate ? formatDateForInput(initialDate) : formatDateForInput(new Date()));
      setStartTime(initialTime || '09:00');
      setDuration(30);
      setCategory('training');
    }
  }, [isOpen, initialDate, initialTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      date,
      start: startTime,
      duration,
      category,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-xl overflow-hidden bg-tier-white shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-tier-border-default">
            <SectionTitle className="text-lg font-semibold text-tier-navy">
              New session
            </SectionTitle>
            <button
              onClick={onClose}
              className="p-1 rounded-lg transition-colors text-tier-text-tertiary hover:bg-tier-surface-base"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1 text-tier-text-secondary">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g. Putting - 100 putts"
                className="w-full px-3 py-2 rounded-lg text-sm bg-tier-surface-base border border-tier-border-default text-tier-navy focus:border-tier-navy outline-none"
                required
                autoFocus
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium mb-1 text-tier-text-secondary">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm bg-tier-surface-base border border-tier-border-default text-tier-navy focus:border-tier-navy outline-none"
                required
              />
            </div>

            {/* Start time and duration in row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Start time */}
              <div>
                <label className="block text-sm font-medium mb-1 text-tier-text-secondary">
                  Start time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-tier-surface-base border border-tier-border-default text-tier-navy focus:border-tier-navy outline-none"
                  required
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium mb-1 text-tier-text-secondary">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-tier-surface-base border border-tier-border-default text-tier-navy"
                >
                  {DURATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1 text-tier-text-secondary">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm bg-tier-surface-base border border-tier-border-default text-tier-navy"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-tier-surface-base text-tier-text-secondary hover:bg-tier-surface-base/80"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-tier-navy text-white hover:bg-tier-navy/90"
              >
                Create session
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateSessionModal;
