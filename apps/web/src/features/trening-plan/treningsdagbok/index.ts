/**
 * Treningsdagbok Feature
 *
 * Training Ledger with:
 * - Full AK hierarchy filtering
 * - URL-based state persistence
 * - Planned vs Free classification
 * - Weekly heatmap visualization
 * - Compliance tracking
 * - Virtualized session list
 */

// Main page
export { TreningsdagbokPage } from './TreningsdagbokPage';
export { default } from './TreningsdagbokPage';

// Hooks
export {
  useDagbokState,
  useDagbokFilters,
  useDagbokSessions,
  useDagbokHeatmap,
} from './hooks';

// Components
export {
  DagbokFilterBar,
  DagbokHierarchyFilters,
  DagbokSessionRow,
  DagbokSessionList,
  DagbokWeeklyHeatmap,
  DagbokComplianceBand,
  DagbokSummarySection,
} from './components';

// Types
export type {
  DagbokState,
  DagbokActions,
  DagbokSession,
  DagbokDrill,
  DagbokStats,
  DagbokPeriod,
  DagbokPlanType,
  WeeklyHeatmapData,
  HeatmapCell,
  HeatmapIntensity,
  FilterVisibility,
  FilterOption,
} from './types';

// Constants
export {
  PYRAMIDS,
  AREAS,
  L_PHASES,
  CS_LEVELS,
  ENVIRONMENTS,
  PRESSURE_LEVELS,
  PYRAMID_OPTIONS,
  PERIOD_OPTIONS,
  PLAN_TYPE_OPTIONS,
  PYRAMID_COLORS,
  DAY_NAMES,
  MONTH_NAMES,
} from './constants';
