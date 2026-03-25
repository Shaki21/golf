/**
 * Dashboard Card Components
 *
 * Three-tier card hierarchy for pro dashboard design:
 * 1. PrimaryKPICard - Hero KPI (Total SG)
 * 2. InsightCard - Secondary metrics (Delta, Percentile, Benchmark)
 * 3. DiagnosticCard - Tertiary breakdown (Tee, Approach, Short, Putting)
 */

export { PrimaryKPICard } from './PrimaryKPICard';
export type { PrimaryKPICardProps } from './PrimaryKPICard';

export { InsightCard, InsightCardGrid } from './InsightCard';
export type { InsightCardProps } from './InsightCard';

export { DiagnosticCard, DiagnosticCardGrid, DiagnosticSection } from './DiagnosticCard';
export type { DiagnosticCardProps } from './DiagnosticCard';
