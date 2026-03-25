/**
 * HeroCard
 * Design System v3.1 - Tailwind CSS
 *
 * Primary dashboard card displaying the day's main focus.
 * Occupies col-span-7 on desktop, full width on mobile.
 *
 * Design principles:
 * - Prominent but not overpowering
 * - Clear hierarchy: Priority > Context > Action
 * - Single CTA (primary button)
 * - No decorative elements
 */

import React from 'react';
import Card from '../../../../ui/primitives/Card';
import { PageTitle, SectionTitle } from '../../../../components/typography';

interface HeroCardProps {
  /** Current date formatted (e.g., "Mandag 29. desember") */
  dateLabel: string;
  /** Player's first name for personalized greeting */
  playerName: string;
  /** Primary focus/priority for today */
  todaysFocus: {
    title: string;
    description: string;
    category?: string;
    progress?: number; // 0-100
  };
  /** Primary CTA button */
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Secondary action (text link) */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

const HeroCard: React.FC<HeroCardProps> = ({
  dateLabel,
  playerName,
  todaysFocus,
  primaryAction,
  secondaryAction,
}) => {
  return (
    <Card variant="elevated" padding="spacious">
      {/* Date Label */}
      <p className="text-xs leading-tight text-tier-text-tertiary uppercase tracking-wider font-medium m-0">
        {dateLabel}
      </p>

      {/* Greeting */}
      <PageTitle className="text-2xl leading-tight font-bold text-tier-navy mt-1 mb-5">
        Good morning, {playerName}
      </PageTitle>

      {/* Today's Focus Section */}
      <div className="bg-tier-surface-subtle rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm leading-tight font-semibold text-tier-gold uppercase tracking-wide">
            Dagens fokus
          </span>
          {todaysFocus.category && (
            <span className="text-[10px] leading-tight font-medium text-tier-text-secondary bg-white px-2 py-0.5 rounded-full">
              {todaysFocus.category}
            </span>
          )}
        </div>

        <SectionTitle className="text-lg leading-tight font-semibold text-tier-navy m-0 mb-1.5">
          {todaysFocus.title}
        </SectionTitle>

        <p className="text-sm leading-relaxed text-tier-text-secondary m-0">
          {todaysFocus.description}
        </p>

        {/* Progress indicator (if applicable) */}
        {typeof todaysFocus.progress === 'number' && (
          <div className="flex items-center gap-3 mt-3">
            <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-tier-navy rounded-full transition-all duration-300"
                style={{ width: `${todaysFocus.progress}%` }}
              />
            </div>
            <span className="text-xs text-tier-text-tertiary tabular-nums">
              {todaysFocus.progress}% fullført
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-3 flex-wrap">
          {primaryAction && (
            <button
              className="inline-flex items-center justify-center h-11 px-5 bg-tier-navy text-white border-none rounded-md text-sm font-semibold cursor-pointer transition-all duration-150 hover:bg-tier-navy/90"
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </button>
          )}
          {secondaryAction && (
            <button
              className="inline-flex items-center justify-center h-11 px-4 bg-transparent text-tier-gold border-none text-sm font-medium cursor-pointer transition-colors duration-150 hover:text-tier-gold/80"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </Card>
  );
};

export default HeroCard;
