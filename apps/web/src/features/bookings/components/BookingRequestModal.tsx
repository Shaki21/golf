/**
 * Booking Request Modal
 * Form for requesting a booking
 */

import React, { useState } from 'react';
import { X, Calendar, Clock, User, MessageSquare } from 'lucide-react';
import Button from '../../../ui/primitives/Button';
import { SectionTitle } from '../../../components/typography';
import { Coach } from '../../../hooks/useBookings';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  slot: {
    date: string;
    startTime: string;
    endTime: string;
  };
  coach?: Coach;
  onSubmit: (data: { reason: string; notes?: string }) => Promise<void>;
  loading: boolean;
}

const BookingRequestModal: React.FC<Props> = ({
  isOpen,
  onClose,
  slot,
  coach,
  onSubmit,
  loading,
}) => {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      setError('Please select a reason for the booking');
      return;
    }

    try {
      await onSubmit({ reason, notes });
      setReason('');
      setNotes('');
      setError('');
    } catch (err) {
      setError('Could not create booking. Please try again.');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const coachName = coach ? `${coach.firstName} ${coach.lastName}` : 'Coach';

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-[500px] w-full max-h-[90vh] overflow-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 px-6 border-b border-tier-border-default">
          <SectionTitle className="text-lg font-semibold text-tier-navy m-0">
            Book training session
          </SectionTitle>
          <button
            onClick={onClose}
            className="bg-transparent border-none cursor-pointer p-1 text-tier-text-secondary hover:text-tier-navy"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Booking Details */}
          <div className="bg-tier-surface-base rounded-lg p-4 mb-6 space-y-3">
            <div className="flex items-center gap-2 text-tier-navy">
              <User size={18} />
              <span className="font-medium">
                {coachName}
              </span>
            </div>

            <div className="flex items-center gap-2 text-tier-text-secondary">
              <Calendar size={18} />
              <span>{formatDate(slot.date)}</span>
            </div>

            <div className="flex items-center gap-2 text-tier-text-secondary">
              <Clock size={18} />
              <span>
                {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
              </span>
            </div>
          </div>

          {/* Reason */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-tier-navy mb-1.5">
              Reason / Topic for session <span className="text-tier-error">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-tier-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-navy"
              disabled={loading}
              required
            >
              <option value="">Select reason...</option>
              <option value="Swing technique">Swing technique</option>
              <option value="Putting">Putting</option>
              <option value="Short game">Short game</option>
              <option value="Strategy">Strategy</option>
              <option value="Mental training">Mental training</option>
              <option value="Physical training">Physical training</option>
              <option value="Test session">Test session</option>
              <option value="General guidance">General guidance</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Additional Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-tier-navy mb-1.5">
              Additional info (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional information about what you'd like to work on..."
              className="w-full px-4 py-2 border border-tier-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-navy resize-none"
              rows={4}
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-tier-error-light text-tier-error rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !reason.trim()}
              loading={loading}
              className="flex-1"
            >
              {loading ? 'Sending request...' : 'Send request'}
            </Button>
          </div>

          {/* Info Text */}
          <p className="mt-4 text-xs text-tier-text-secondary text-center">
            Your coach will receive the request and confirm or decline it.
          </p>
        </form>
      </div>
    </div>
  );
};

export default BookingRequestModal;
