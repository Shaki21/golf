/**
 * CountdownCard
 * Design System v3.1 - Tailwind CSS
 *
 * Displays countdown to upcoming events (tournaments, tests, milestones).
 * Uses monospace numerals for the countdown value.
 *
 * Design principles:
 * - Event type indicated by subtle background tint (not color overload)
 * - Days remaining is the dominant visual element
 * - Location and date are secondary information
 * - No icons as UI elements (per design spec)
 */

import React from 'react';
import Card from '../../../../ui/primitives/Card';
import { SubSectionTitle } from '../../../../components/typography';

type EventType = 'tournament' | 'test' | 'milestone';

interface CountdownCardProps {
  /** Event type for visual differentiation */
  type: EventType;
  /** Event title */
  title: string;
  /** Target date */
  date: Date | string;
  /** Optional location */
  location?: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Click handler for details */
  onClick?: () => void;
}

// Event type styling configuration
const TYPE_CONFIG: Record<EventType, { labelClass: string; bgClass: string; label: string }> = {
  tournament: {
    labelClass: 'text-amber-600',
    bgClass: 'bg-amber-50',
    label: 'Turnering',
  },
  test: {
    labelClass: 'text-blue-600',
    bgClass: 'bg-blue-50',
    label: 'Test',
  },
  milestone: {
    labelClass: 'text-tier-navy',
    bgClass: 'bg-indigo-50',
    label: 'Milepæl',
  },
};

const CountdownCard: React.FC<CountdownCardProps> = ({
  type,
  title,
  date,
  location,
  subtitle,
  onClick,
}) => {
  // Calculate days remaining
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Format date for display
  const formatDate = (d: Date): string => {
    return d.toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'short',
    });
  };

  const typeConfig = TYPE_CONFIG[type];

  // Handle past/today events
  const getDaysLabel = (): string => {
    if (daysRemaining === 0) return 'I dag';
    if (daysRemaining === 1) return '1 dag';
    if (daysRemaining < 0) return 'Passert';
    return `${daysRemaining} dager`;
  };

  return (
    <Card
      variant="outlined"
      padding="md"
      onClick={onClick}
      className={`${typeConfig.bgClass} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left side: Event info */}
        <div className="flex-1 min-w-0">
          {/* Type label */}
          <span className={`block text-[10px] leading-tight font-semibold uppercase tracking-wider mb-1 ${typeConfig.labelClass}`}>
            {typeConfig.label}
          </span>

          {/* Title */}
          <SubSectionTitle className="text-sm leading-tight font-semibold text-tier-navy m-0 mb-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {title}
          </SubSectionTitle>

          {/* Subtitle or location */}
          {(subtitle || location) && (
            <p className="text-xs leading-tight text-tier-text-secondary m-0 mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
              {subtitle || location}
            </p>
          )}

          {/* Date */}
          <p className="text-xs leading-tight text-tier-text-tertiary m-0">
            {formatDate(targetDate)}
          </p>
        </div>

        {/* Right side: Countdown */}
        <div className="flex flex-col items-end shrink-0">
          <span className="text-2xl leading-none font-bold text-tier-gold tabular-nums">
            {daysRemaining >= 0 ? daysRemaining : '—'}
          </span>
          <span className="text-[10px] leading-tight text-tier-text-tertiary mt-0.5">
            {getDaysLabel()}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default CountdownCard;

/**
 * NextUpSection
 *
 * Container for 2 CountdownCards (tournament + test).
 * Stacked on mobile, side-by-side on tablet+.
 */
interface NextUpSectionProps {
  /** Tournament countdown data */
  tournament?: {
    title: string;
    date: Date | string;
    location?: string;
    onClick?: () => void;
  };
  /** Test countdown data */
  test?: {
    title: string;
    date: Date | string;
    subtitle?: string;
    onClick?: () => void;
  };
}

export const NextUpSection: React.FC<NextUpSectionProps> = ({
  tournament,
  test,
}) => {
  if (!tournament && !test) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {tournament && (
        <CountdownCard
          type="tournament"
          title={tournament.title}
          date={tournament.date}
          location={tournament.location}
          onClick={tournament.onClick}
        />
      )}
      {test && (
        <CountdownCard
          type="test"
          title={test.title}
          date={test.date}
          subtitle={test.subtitle}
          onClick={test.onClick}
        />
      )}
    </div>
  );
};
