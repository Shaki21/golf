/**
 * EventLegend Component
 *
 * Color-coded legend showing all event sources.
 * Supports compact mode for dashboard widget.
 *
 * Uses semantic tokens only (no raw hex values).
 */

import React from 'react';
import { EVENT_SOURCE_COLORS, UnifiedEventSource, EventLegendProps } from '../types';
import { CardTitle } from '../../../components/typography/Headings';

const ALL_SOURCES: UnifiedEventSource[] = [
  'golf_teknikk',
  'golf_slag',
  'golf_spill',
  'fysisk',
  'skole',
  'oppgave',
  'turnering',
];

export const EventLegend: React.FC<EventLegendProps> = ({
  compact = false,
  className = '',
  sources = ALL_SOURCES,
}) => {
  const filteredSources = ALL_SOURCES.filter((source) => sources.includes(source));

  if (compact) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {filteredSources.map((source) => {
          const colors = EVENT_SOURCE_COLORS[source];
          return (
            <div key={source} className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colors.border }}
              />
              <span
                className="text-[10px]"
                style={{ color: 'var(--calendar-text-tertiary)' }}
              >
                {colors.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`p-3 rounded-lg ${className}`}
      style={{
        backgroundColor: 'var(--calendar-surface-elevated)',
        border: '1px solid var(--calendar-border)',
      }}
    >
      <CardTitle
        style={{ color: 'var(--calendar-text-secondary)', marginBottom: '0.5rem' }}
      >
        Color codes
      </CardTitle>
      <div className="grid grid-cols-2 gap-2">
        {filteredSources.map((source) => {
          const colors = EVENT_SOURCE_COLORS[source];
          return (
            <div key={source} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{
                  backgroundColor: colors.bg,
                  borderLeft: `3px solid ${colors.border}`,
                }}
              />
              <span
                className="text-xs"
                style={{ color: 'var(--calendar-text-primary)' }}
              >
                {colors.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventLegend;
