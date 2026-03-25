/**
 * Shared types and constants for NotionCalendar components
 * Extracted to avoid circular dependencies
 */

// Calendar color definitions using TIER Golf tokens
export const CALENDAR_COLORS = {
  red: { bg: 'rgb(var(--surface-error))', border: 'rgb(var(--status-error))', text: 'rgb(var(--status-error))' },
  orange: { bg: 'rgb(var(--surface-warning))', border: 'rgb(var(--status-warning))', text: 'rgb(var(--status-warning))' },
  yellow: { bg: 'rgb(var(--tier-gold-light))', border: 'rgb(var(--tier-gold))', text: 'rgb(var(--tier-gold-dark))' },
  green: { bg: 'rgb(var(--surface-success))', border: 'rgb(var(--status-success))', text: 'rgb(var(--status-success))' },
  teal: { bg: 'rgb(var(--surface-info))', border: 'rgb(var(--status-info))', text: 'rgb(var(--status-info))' },
  blue: { bg: 'rgb(var(--surface-info))', border: 'rgb(var(--status-info))', text: 'rgb(var(--status-info))' },
  purple: { bg: 'rgba(var(--category-j), 0.1)', border: 'rgb(var(--category-j))', text: 'rgb(var(--category-j))' },
  pink: { bg: 'rgb(var(--surface-error))', border: 'rgb(var(--status-error))', text: 'rgb(var(--status-error))' },
  gray: { bg: 'rgb(var(--surface-secondary))', border: 'rgb(var(--border-default))', text: 'rgb(var(--text-secondary))' },
} as const;

export type CalendarColorKey = keyof typeof CALENDAR_COLORS;

export interface CalendarSource {
  id: string;
  name: string;
  color: CalendarColorKey;
  visible: boolean;
  isDefault?: boolean;
}

export type ViewType = 'day' | 'week' | 'month';
