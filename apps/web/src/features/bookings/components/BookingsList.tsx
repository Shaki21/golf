/**
 * Bookings List Component
 * Displays player's bookings with status and actions
 */

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import Button from '../../../ui/primitives/Button';
import { SubSectionTitle } from '../../../components/typography/Headings';
import { Booking } from '../../../hooks/useBookings';

interface Props {
  bookings: Booking[];
  onCancel: (bookingId: string, reason?: string) => Promise<void>;
  loading: boolean;
}

const STATUS_CONFIG = {
  pending: {
    label: 'Awaiting confirmation',
    icon: AlertCircle,
    colorClasses: 'bg-tier-warning-light text-tier-warning',
    borderColor: 'border-tier-warning',
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle2,
    colorClasses: 'bg-tier-success-light text-tier-success',
    borderColor: 'border-tier-success',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    colorClasses: 'bg-tier-error-light text-tier-error',
    borderColor: 'border-tier-error',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    colorClasses: 'bg-tier-surface-secondary text-tier-text-secondary',
    borderColor: 'border-tier-border-default',
  },
};

const BookingsList: React.FC<Props> = ({ bookings, onCancel, loading }) => {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCancel = async (bookingId: string) => {
    setCancellingId(bookingId);
    try {
      await onCancel(bookingId);
    } finally {
      setCancellingId(null);
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

  const sortedBookings = [...bookings].sort((a, b) => {
    // Sort by date (newest first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Group bookings by status
  const groupedBookings = {
    pending: sortedBookings.filter((b) => b.status === 'pending'),
    confirmed: sortedBookings.filter((b) => b.status === 'confirmed'),
    past: sortedBookings.filter((b) => b.status === 'completed' || b.status === 'cancelled'),
  };

  const renderBookingCard = (booking: Booking) => {
    const statusConfig = STATUS_CONFIG[booking.status];
    const StatusIcon = statusConfig.icon;
    const isExpanded = expandedId === booking.id;
    const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
    const coachName = booking.coach
      ? `${booking.coach.firstName} ${booking.coach.lastName}`
      : booking.coachName || 'Unknown Coach';
    const coachEmail = booking.coach?.email || '';

    return (
      <div
        key={booking.id}
        className={`bg-white rounded-lg border-2 ${statusConfig.borderColor} p-4 transition-all`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <User size={20} className="text-tier-navy" />
            <div>
              <div className="font-semibold text-tier-navy">
                {coachName}
              </div>
              {coachEmail && (
                <div className="text-sm text-tier-text-secondary">
                  {coachEmail}
                </div>
              )}
            </div>
          </div>

          <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.colorClasses} flex items-center gap-1`}>
            <StatusIcon size={14} />
            {statusConfig.label}
          </div>
        </div>

        {/* Date and Time */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-tier-text-secondary text-sm">
            <Calendar size={16} />
            <span>{formatDate(booking.date)}</span>
          </div>

          <div className="flex items-center gap-2 text-tier-text-secondary text-sm">
            <Clock size={16} />
            <span>
              {booking.startTime.substring(0, 5)} - {booking.endTime.substring(0, 5)}
            </span>
          </div>
        </div>

        {/* Reason */}
        {booking.title && (
          <div className="mb-3">
            <div className="text-sm font-medium text-tier-navy mb-1">Topic:</div>
            <div className="text-sm text-tier-text-secondary">{booking.title}</div>
          </div>
        )}

        {/* Description (if any) */}
        {booking.description && (
          <div className="mb-3">
            <div className="text-sm font-medium text-tier-navy mb-1">Additional info:</div>
            <div className="text-sm text-tier-text-secondary bg-tier-surface-base p-2 rounded">
              {booking.description}
            </div>
          </div>
        )}

        {/* Coach Notes (if any) */}
        {booking.coachNotes && (
          <div className="mb-3">
            <div className="flex items-center gap-1 text-sm font-medium text-tier-navy mb-1">
              <MessageSquare size={14} />
              Message from coach:
            </div>
            <div className="text-sm text-tier-text-secondary bg-tier-info-light p-2 rounded">
              {booking.coachNotes}
            </div>
          </div>
        )}

        {/* Actions */}
        {canCancel && (
          <div className="flex gap-2 mt-4 pt-3 border-t border-tier-border-default">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleCancel(booking.id)}
              disabled={loading || cancellingId === booking.id}
              loading={cancellingId === booking.id}
              className="flex-1"
            >
              {cancellingId === booking.id ? 'Cancelling...' : 'Cancel booking'}
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-tier-border-default p-8 text-center">
        <Calendar size={48} className="text-tier-text-secondary mx-auto mb-4" />
        <SubSectionTitle style={{ marginBottom: '0.5rem' }}>
          No bookings yet
        </SubSectionTitle>
        <p className="text-tier-text-secondary mb-4">
          When you book a session, it will appear here.
        </p>
        <p className="text-sm text-tier-text-secondary">
          Go to &quot;Available slots&quot; to book a session with your coach.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Bookings */}
      {groupedBookings.pending.length > 0 && (
        <div>
          <SubSectionTitle style={{ marginBottom: '1rem' }}>
            Awaiting confirmation ({groupedBookings.pending.length})
          </SubSectionTitle>
          <div className="grid gap-4">
            {groupedBookings.pending.map((booking) => renderBookingCard(booking))}
          </div>
        </div>
      )}

      {/* Confirmed Bookings */}
      {groupedBookings.confirmed.length > 0 && (
        <div>
          <SubSectionTitle style={{ marginBottom: '1rem' }}>
            Confirmed bookings ({groupedBookings.confirmed.length})
          </SubSectionTitle>
          <div className="grid gap-4">
            {groupedBookings.confirmed.map((booking) => renderBookingCard(booking))}
          </div>
        </div>
      )}

      {/* Past Bookings */}
      {groupedBookings.past.length > 0 && (
        <div>
          <SubSectionTitle style={{ marginBottom: '1rem' }}>
            Past bookings ({groupedBookings.past.length})
          </SubSectionTitle>
          <div className="grid gap-4">
            {groupedBookings.past.map((booking) => renderBookingCard(booking))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsList;
