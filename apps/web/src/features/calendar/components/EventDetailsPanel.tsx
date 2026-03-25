/**
 * EventDetailsPanel.tsx
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles
 *
 * Shared panel for displaying event details:
 * - Side panel on desktop
 * - Bottom sheet on mobile (simplified version)
 * - Event info, actions, and status
 */

import React from 'react';
import {
  X,
  Clock,
  MapPin,
  Play,
  Check,
  Calendar,
  Edit2,
  Trash2,
} from 'lucide-react';
import type { CalendarEvent } from '../hooks/useCalendarEvents';
import { SubSectionTitle } from '../../../components/typography';

interface EventDetailsPanelProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onStart: (event: CalendarEvent) => void;
  onComplete: (event: CalendarEvent) => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
}

function getStatusBadge(status: CalendarEvent['status']) {
  switch (status) {
    case 'recommended':
      return {
        label: 'Recommended',
        bg: 'var(--calendar-event-recommended-bg)',
        text: 'var(--calendar-event-recommended-text)',
      };
    case 'in_progress':
      return {
        label: 'In Progress',
        bg: 'var(--calendar-event-inprogress-bg)',
        text: 'var(--calendar-event-inprogress-text)',
      };
    case 'completed':
      return {
        label: 'Completed',
        bg: 'var(--calendar-event-completed-bg)',
        text: 'var(--calendar-event-completed-text)',
      };
    case 'ghost':
      return {
        label: 'Suggested',
        bg: 'var(--calendar-event-ghost-bg)',
        text: 'var(--calendar-event-ghost-text)',
      };
    case 'external':
      return {
        label: 'External',
        bg: 'var(--calendar-event-external-bg)',
        text: 'var(--calendar-event-external-text)',
      };
    default:
      return {
        label: 'Planned',
        bg: 'var(--calendar-event-planned-bg)',
        text: 'var(--calendar-event-planned-text)',
      };
  }
}

function getCategoryLabel(category?: CalendarEvent['category']) {
  const labels: Record<string, string> = {
    training: 'Training',
    mental: 'Mental',
    testing: 'Testing',
    tournament: 'Tournament',
    putting: 'Putting',
    range: 'Range',
    mobility: 'Mobility',
    threshold: 'Threshold',
  };
  return category ? labels[category] || category : null;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}

export const EventDetailsPanel: React.FC<EventDetailsPanelProps> = ({
  event,
  isOpen,
  onClose,
  onStart,
  onComplete,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !event) return null;

  const statusBadge = getStatusBadge(event.status);
  const categoryLabel = getCategoryLabel(event.category);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 lg:hidden bg-black/50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed z-50 lg:relative lg:z-auto bg-tier-white border-l border-tier-border-default">
        {/* Desktop: Side panel */}
        <div className="hidden lg:block w-80 h-full">
          <PanelContent
            event={event}
            statusBadge={statusBadge}
            categoryLabel={categoryLabel}
            onClose={onClose}
            onStart={onStart}
            onComplete={onComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>

        {/* Mobile: Bottom sheet */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 max-h-[70vh] rounded-t-2xl overflow-hidden bg-tier-white shadow-lg">
          <PanelContent
            event={event}
            statusBadge={statusBadge}
            categoryLabel={categoryLabel}
            onClose={onClose}
            onStart={onStart}
            onComplete={onComplete}
            onEdit={onEdit}
            onDelete={onDelete}
            isMobile
          />
        </div>
      </div>
    </>
  );
};

interface PanelContentProps {
  event: CalendarEvent;
  statusBadge: { label: string; bg: string; text: string };
  categoryLabel: string | null;
  onClose: () => void;
  onStart: (event: CalendarEvent) => void;
  onComplete: (event: CalendarEvent) => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
  isMobile?: boolean;
}

const PanelContent: React.FC<PanelContentProps> = ({
  event,
  statusBadge,
  categoryLabel,
  onClose,
  onStart,
  onComplete,
  onEdit,
  onDelete,
  isMobile,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Handle (mobile) */}
      {isMobile && (
        <div className="flex justify-center py-2">
          <div className="w-10 h-1 rounded-full bg-tier-border-default" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-tier-border-default">
        <div className="flex-1 pr-2">
          {/* Status badge */}
          <span
            className="inline-flex px-2 py-0.5 rounded text-xs font-medium"
            style={{
              backgroundColor: statusBadge.bg,
              color: statusBadge.text,
            }}
          >
            {statusBadge.label}
          </span>

          {/* Title */}
          <SubSectionTitle className="text-lg font-semibold mt-2 text-tier-navy">
            {event.title}
          </SubSectionTitle>

          {/* Category */}
          {categoryLabel && (
            <span className="text-sm text-tier-text-tertiary">
              {categoryLabel}
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg transition-colors text-tier-text-tertiary hover:bg-tier-surface-base"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Date and time */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-tier-text-secondary">
            <Calendar size={16} className="text-tier-text-tertiary" />
            <span className="text-sm">{formatDate(event.date)}</span>
          </div>

          <div className="flex items-center gap-2 text-tier-text-secondary">
            <Clock size={16} className="text-tier-text-tertiary" />
            <span className="text-sm">
              {event.start} – {event.end} ({event.duration} min)
            </span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-tier-text-secondary">
              <MapPin size={16} className="text-tier-text-tertiary" />
              <span className="text-sm">{event.location}</span>
            </div>
          )}
        </div>

        {/* Weekly focus (for recommended) */}
        {event.weeklyFocus && (
          <div className="p-3 rounded-lg bg-tier-surface-base">
            <div className="text-xs font-medium mb-1 text-tier-text-tertiary">
              Weekly Focus
            </div>
            <div className="text-sm text-tier-navy">
              {event.weeklyFocus}
            </div>
          </div>
        )}

        {/* Badges */}
        {event.badges && event.badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {event.badges.map((badge) => (
              <span
                key={badge}
                className="px-2 py-1 rounded text-xs bg-tier-surface-base text-tier-text-secondary"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-tier-border-default space-y-2">
        {/* Primary action based on status */}
        {event.status === 'recommended' || event.status === 'planned' ? (
          <button
            onClick={() => onStart(event)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-tier-navy text-white"
          >
            <Play size={16} />
            Start session
          </button>
        ) : event.status === 'in_progress' ? (
          <button
            onClick={() => onComplete(event)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-tier-success text-white"
          >
            <Check size={16} />
            Complete
          </button>
        ) : null}

        {/* Secondary actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(event)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors bg-tier-surface-base text-tier-text-secondary"
          >
            <Edit2 size={14} />
            Edit
          </button>
          <button
            onClick={() => onDelete(event)}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors bg-tier-error/10 text-tier-error"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPanel;
