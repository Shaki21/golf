/**
 * Treningsdagbok Constants
 *
 * Filter options and configuration for the Training Ledger.
 * Re-exports from useAKFormula for consistency.
 */

import {
  PYRAMIDS,
  AREAS,
  L_PHASES,
  CS_LEVELS,
  ENVIRONMENTS,
  PRESSURE_LEVELS,
  POSITIONS,
  POSITION_ORDER,
  PUTTING_FOCUS,
  TOURNAMENT_TYPES,
  PHYSICAL_FOCUS,
  PLAY_FOCUS,
} from '../../calendar/components/session-planner/hooks/useAKFormula';

import type {
  Pyramid,
  Area,
  FilterOption,
  DagbokPeriod,
  DagbokPlanType,
  HeatmapIntensity,
} from './types';

import { PYRAMID_ICONS } from '../../../constants/icons';

// Re-export for convenience
export {
  PYRAMIDS,
  AREAS,
  L_PHASES,
  CS_LEVELS,
  ENVIRONMENTS,
  PRESSURE_LEVELS,
  POSITIONS,
  POSITION_ORDER,
  PUTTING_FOCUS,
  TOURNAMENT_TYPES,
  PHYSICAL_FOCUS,
  PLAY_FOCUS,
  PYRAMID_ICONS,
};

// =============================================================================
// FILTER OPTIONS
// =============================================================================

/** Pyramid filter options */
export const PYRAMID_OPTIONS: FilterOption<Pyramid | 'all'>[] = [
  { value: 'all', label: 'All' },
  { value: 'FYS', label: 'Physical', icon: PYRAMIDS.FYS.icon },
  { value: 'TEK', label: 'Technique', icon: PYRAMIDS.TEK.icon },
  { value: 'SLAG', label: 'Golf Shots', icon: PYRAMIDS.SLAG.icon },
  { value: 'SPILL', label: 'Play', icon: PYRAMIDS.SPILL.icon },
  { value: 'TURN', label: 'Tournament', icon: PYRAMIDS.TURN.icon },
];

/** Period filter options */
export const PERIOD_OPTIONS: FilterOption<DagbokPeriod>[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'custom', label: 'Custom' },
];

/** Plan type filter options */
export const PLAN_TYPE_OPTIONS: FilterOption<DagbokPlanType>[] = [
  { value: 'all', label: 'All' },
  { value: 'planned', label: 'Planned' },
  { value: 'free', label: 'Free' },
];

// =============================================================================
// PYRAMID-SPECIFIC CONFIGURATION
// =============================================================================

/** Areas by pyramid level */
export const AREAS_BY_PYRAMID: Record<Pyramid, Area[]> = {
  FYS: [],
  TEK: ['TEE', 'INN200', 'INN150', 'INN100', 'INN50', 'CHIP', 'PITCH', 'LOB', 'BUNKER', 'PUTT0-3', 'PUTT3-5', 'PUTT5-10', 'PUTT10-15', 'PUTT15-25', 'PUTT25-40', 'PUTT40+'],
  SLAG: ['TEE', 'INN200', 'INN150', 'INN100', 'INN50', 'CHIP', 'PITCH', 'LOB', 'BUNKER', 'PUTT0-3', 'PUTT3-5', 'PUTT5-10', 'PUTT10-15', 'PUTT15-25', 'PUTT25-40', 'PUTT40+'],
  SPILL: ['BANE'],
  TURN: [],
};

/** Full swing areas (use CS) */
export const FULL_SWING_AREAS: Area[] = ['TEE', 'INN200', 'INN150', 'INN100', 'INN50'];

/** Short game areas */
export const SHORT_GAME_AREAS: Area[] = ['CHIP', 'PITCH', 'LOB', 'BUNKER'];

/** Putting areas */
export const PUTTING_AREAS: Area[] = ['PUTT0-3', 'PUTT3-5', 'PUTT5-10', 'PUTT10-15', 'PUTT15-25', 'PUTT25-40', 'PUTT40+'];

/** Check if area is full swing */
export function isFullSwingArea(area: Area): boolean {
  return FULL_SWING_AREAS.includes(area);
}

/** Check if area is short game */
export function isShortGameArea(area: Area): boolean {
  return SHORT_GAME_AREAS.includes(area);
}

/** Check if area is putting */
export function isPuttingArea(area: Area): boolean {
  return PUTTING_AREAS.includes(area);
}

// =============================================================================
// HEATMAP CONFIGURATION
// =============================================================================

/** Day names (English, starting Monday) */
export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Day names (full, English) */
export const DAY_NAMES_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** Pyramid order for heatmap columns */
export const HEATMAP_PYRAMID_ORDER: Pyramid[] = ['FYS', 'TEK', 'SLAG', 'SPILL', 'TURN'];

/** Minutes thresholds for heatmap intensity levels */
export const HEATMAP_INTENSITY_THRESHOLDS: { min: number; intensity: HeatmapIntensity }[] = [
  { min: 91, intensity: 4 },
  { min: 61, intensity: 3 },
  { min: 31, intensity: 2 },
  { min: 1, intensity: 1 },
  { min: 0, intensity: 0 },
];

/** Get intensity level based on minutes */
export function getHeatmapIntensity(minutes: number): HeatmapIntensity {
  for (const threshold of HEATMAP_INTENSITY_THRESHOLDS) {
    if (minutes >= threshold.min) {
      return threshold.intensity;
    }
  }
  return 0;
}

/** Heatmap intensity colors (CSS variable names) */
export const HEATMAP_INTENSITY_COLORS: Record<HeatmapIntensity, string> = {
  0: 'var(--heatmap-intensity-0)',
  1: 'var(--heatmap-intensity-1)',
  2: 'var(--heatmap-intensity-2)',
  3: 'var(--heatmap-intensity-3)',
  4: 'var(--heatmap-intensity-4)',
};

/** Fallback heatmap colors if CSS variables not defined */
export const HEATMAP_INTENSITY_COLORS_FALLBACK: Record<HeatmapIntensity, string> = {
  0: 'transparent',
  1: 'color-mix(in srgb, var(--accent) 20%, transparent)',
  2: 'color-mix(in srgb, var(--accent) 40%, transparent)',
  3: 'color-mix(in srgb, var(--accent) 60%, transparent)',
  4: 'color-mix(in srgb, var(--accent) 80%, transparent)',
};

// =============================================================================
// PYRAMID COLORS (for badges and indicators)
// =============================================================================

export const PYRAMID_COLORS: Record<Pyramid, { bg: string; text: string; border: string }> = {
  FYS: {
    bg: 'color-mix(in srgb, var(--error) 15%, transparent)',
    text: 'var(--error)',
    border: 'var(--error)',
  },
  TEK: {
    bg: 'color-mix(in srgb, var(--accent) 15%, transparent)',
    text: 'var(--accent)',
    border: 'var(--accent)',
  },
  SLAG: {
    bg: 'color-mix(in srgb, var(--success) 15%, transparent)',
    text: 'var(--success)',
    border: 'var(--success)',
  },
  SPILL: {
    bg: 'color-mix(in srgb, var(--warning) 15%, transparent)',
    text: 'var(--warning)',
    border: 'var(--warning)',
  },
  TURN: {
    bg: 'color-mix(in srgb, var(--text-primary) 15%, transparent)',
    text: 'var(--text-primary)',
    border: 'var(--text-primary)',
  },
};

// =============================================================================
// MONTH NAMES
// =============================================================================

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// =============================================================================
// DEBOUNCE SETTINGS
// =============================================================================

export const SEARCH_DEBOUNCE_MS = 200;

// =============================================================================
// VIRTUALIZATION SETTINGS
// =============================================================================

export const SESSION_ROW_HEIGHT = 72; // pixels
export const SESSION_ROW_EXPANDED_HEIGHT = 180; // pixels
export const OVERSCAN_COUNT = 5; // extra rows to render
