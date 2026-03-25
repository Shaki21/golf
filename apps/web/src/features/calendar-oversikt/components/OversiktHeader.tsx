/**
 * OversiktHeader Component
 *
 * Header for the calendar overview (read-only).
 * Similar to CalendarHeader but WITHOUT "Ny økt" button.
 *
 * Uses semantic tokens only (no raw hex values).
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { OversiktView, OversiktHeaderProps } from '../types';
import { SectionTitle } from '../../../components/typography/Headings';

const VIEW_OPTIONS: { value: OversiktView; label: string }[] = [
  { value: 'day', label: 'DAY' },
  { value: 'week', label: 'WEEK' },
  { value: 'month', label: 'MONTH' },
];

export const OversiktHeader: React.FC<OversiktHeaderProps> = ({
  view,
  anchorDate,
  weekNumber,
  monthName,
  year,
  onViewChange,
  onToday,
  onPrev,
  onNext,
}) => {
  const getViewLabel = () => {
    switch (view) {
      case 'day':
        return anchorDate.toLocaleDateString('nb-NO', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      case 'week':
        return `${monthName} ${year}`;
      case 'month':
        return `${monthName} ${year}`;
      default:
        return `${monthName} ${year}`;
    }
  };

  return (
    <header
      className="flex items-center justify-between px-4 py-3 border-b"
      style={{
        backgroundColor: 'var(--calendar-surface-base)',
        borderColor: 'var(--calendar-border)',
      }}
    >
      {/* Left: Navigation and Title */}
      <div className="flex items-center gap-4">
        {/* Prev/Next Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            className="p-2 rounded-lg transition-colors"
            style={{
              color: 'var(--calendar-text-secondary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--calendar-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={onNext}
            className="p-2 rounded-lg transition-colors"
            style={{
              color: 'var(--calendar-text-secondary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--calendar-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Title */}
        <SectionTitle
          style={{ color: 'var(--calendar-text-primary)', marginBottom: 0, textTransform: 'capitalize' }}
        >
          {getViewLabel()}
        </SectionTitle>

        {/* Week number badge (only for week view) */}
        {view === 'week' && weekNumber && (
          <span
            className="text-sm px-2 py-1 rounded"
            style={{
              backgroundColor: 'var(--calendar-surface-elevated)',
              color: 'var(--calendar-text-tertiary)',
            }}
          >
            Week {weekNumber}
          </span>
        )}
      </div>

      {/* Center: View Switcher (Segmented Control) */}
      <div
        className="hidden md:flex items-center rounded-lg p-1"
        style={{
          backgroundColor: 'var(--calendar-surface-elevated)',
        }}
      >
        {VIEW_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onViewChange(option.value)}
            className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
            style={{
              backgroundColor:
                view === option.value
                  ? 'var(--calendar-surface-base)'
                  : 'transparent',
              color:
                view === option.value
                  ? 'var(--calendar-text-primary)'
                  : 'var(--calendar-text-tertiary)',
              boxShadow:
                view === option.value ? 'var(--shadow-card)' : 'none',
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Right: Today Button (no Ny økt button) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToday}
          className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
          style={{
            color: 'var(--calendar-text-secondary)',
            border: '1px solid var(--calendar-border)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--calendar-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          Today
        </button>
      </div>

      {/* Mobile View Switcher (dropdown) */}
      <div className="md:hidden">
        <select
          value={view}
          onChange={(e) => onViewChange(e.target.value as OversiktView)}
          className="px-2 py-1 text-sm rounded-md border"
          style={{
            backgroundColor: 'var(--calendar-surface-base)',
            borderColor: 'var(--calendar-border)',
            color: 'var(--calendar-text-primary)',
          }}
        >
          {VIEW_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
};

export default OversiktHeader;
