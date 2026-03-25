/**
 * SessionHoverPreview.tsx
 *
 * Hover preview tooltip for calendar sessions
 * Shows detailed information when hovering over a session card
 *
 * PHASE 4 Feature:
 * - Pop-up on hover with session details
 * - Disappears on mouseout
 * - Shows: Title, Duration, Description, Focus Areas
 */

import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Clock, Target, MapPin } from 'lucide-react';
import type { CalendarEvent } from '../hooks/useCalendarEvents';
import { CardTitle } from '../../../components/typography/Headings';

interface SessionHoverPreviewProps {
  event: CalendarEvent;
  children: React.ReactNode;
}

export const SessionHoverPreview: React.FC<SessionHoverPreviewProps> = ({
  event,
  children,
}) => {
  // Calculate duration in minutes
  const [startHour, startMin] = event.start.split(':').map(Number);
  const [endHour, endMin] = event.end.split(':').map(Number);
  const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="max-w-[320px] px-4 py-3 bg-tier-white border border-tier-border-default rounded-lg shadow-lg z-[9999]"
            sideOffset={5}
            side="top"
          >
            <div className="space-y-2">
              {/* Title */}
              <CardTitle style={{ marginBottom: 0 }}>
                {event.title}
              </CardTitle>

              {/* Time & Duration */}
              <div className="flex items-center gap-2 text-xs text-tier-text-secondary">
                <Clock size={14} className="flex-shrink-0" />
                <span>{event.start} - {event.end}</span>
                <span>•</span>
                <span>{durationMinutes} min</span>
              </div>

              {/* Location */}
              {event.location && (
                <div className="flex items-center gap-2 text-xs text-tier-text-secondary">
                  <MapPin size={14} className="flex-shrink-0" />
                  <span>{event.location}</span>
                </div>
              )}

              {/* Description */}
              {event.description && (
                <p className="text-xs text-tier-text-secondary m-0 leading-relaxed">
                  {event.description}
                </p>
              )}

              {/* Focus Areas */}
              {event.focusAreas && event.focusAreas.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-tier-text-tertiary mb-1">
                    <Target size={14} className="flex-shrink-0" />
                    <span className="font-medium">Fokusområder:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {event.focusAreas.map((area, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[11px] rounded-full bg-tier-surface-base text-tier-text-secondary"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Badges */}
              {event.badges && event.badges.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {event.badges.map((badge, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 text-[10px] rounded-full ${
                        badge === 'Anbefalt'
                          ? 'bg-tier-navy/10 text-tier-navy'
                          : 'bg-tier-surface-base text-tier-text-secondary'
                      }`}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Tooltip.Arrow className="fill-tier-border-default" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export default SessionHoverPreview;
