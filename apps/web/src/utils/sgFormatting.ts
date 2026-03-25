/**
 * ================================================================
 * Strokes Gained Formatting Utilities
 * ================================================================
 *
 * Standardized formatters for SG values, deltas, percentiles,
 * and benchmark comparisons. Provides consistent, professional
 * number presentation across the dashboard.
 */

import type { CSSProperties } from 'react';

/**
 * Threshold for considering a value "neutral" (near zero)
 */
const NEUTRAL_THRESHOLD = 0.01;

/**
 * Format a Strokes Gained value
 *
 * @param value - SG value
 * @param options - Formatting options
 * @returns Formatted string like "+1.8" or "-0.5"
 *
 * @example
 * ```typescript
 * formatSG(1.85);                    // "+1.85"
 * formatSG(-0.5);                    // "-0.50"
 * formatSG(0);                       // "0.00"
 * formatSG(1.85, { decimals: 1 });   // "+1.9"
 * formatSG(1.85, { showSuffix: true }); // "+1.85 SG"
 * ```
 */
export function formatSG(
  value: number | null | undefined,
  options: {
    decimals?: number;
    showSuffix?: boolean;
    showSign?: boolean;
  } = {}
): string {
  const { decimals = 2, showSuffix = false, showSign = true } = options;

  if (value === null || value === undefined) {
    return 'N/A';
  }

  const formatted = value.toFixed(decimals);
  const sign = showSign && value > 0 ? '+' : '';
  const suffix = showSuffix ? ' SG' : '';

  return `${sign}${formatted}${suffix}`;
}

/**
 * Format a delta/change value over a period
 *
 * @param value - Change value
 * @param period - Period description (e.g., "30d", "7d", "week")
 * @param unit - Optional unit (e.g., "/round", "/session")
 * @returns Formatted string like "Δ30d +0.23/round"
 *
 * @example
 * ```typescript
 * formatDelta(0.23, '30d');                    // "Δ30d +0.23"
 * formatDelta(-0.15, '7d', '/round');          // "Δ7d -0.15/round"
 * formatDelta(0, '30d');                       // "Δ30d ±0.00"
 * ```
 */
export function formatDelta(
  value: number | null | undefined,
  period: string = '30d',
  unit: string = ''
): string {
  if (value === null || value === undefined) {
    return `Δ${period} N/A`;
  }

  const absValue = Math.abs(value);
  if (absValue < NEUTRAL_THRESHOLD) {
    return `Δ${period} ±0.00${unit}`;
  }

  const sign = value > 0 ? '+' : '';
  return `Δ${period} ${sign}${value.toFixed(2)}${unit}`;
}

/**
 * Format a percentile value
 *
 * @param value - Percentile (0-100)
 * @param options - Formatting options
 * @returns Formatted string like "85th" or "Top 15%"
 *
 * @example
 * ```typescript
 * formatPercentile(85);                        // "85th"
 * formatPercentile(85, { style: 'top' });      // "Top 15%"
 * formatPercentile(50);                        // "50th"
 * formatPercentile(1);                         // "1st"
 * formatPercentile(2);                         // "2nd"
 * formatPercentile(3);                         // "3rd"
 * ```
 */
export function formatPercentile(
  value: number | null | undefined,
  options: {
    style?: 'ordinal' | 'top';
  } = {}
): string {
  const { style = 'ordinal' } = options;

  if (value === null || value === undefined) {
    return 'N/A';
  }

  const rounded = Math.round(value);

  if (style === 'top') {
    return `Top ${100 - rounded}%`;
  }

  // Ordinal suffix
  const suffix = getOrdinalSuffix(rounded);
  return `${rounded}${suffix}`;
}

/**
 * Get ordinal suffix for a number
 */
function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

/**
 * Format a benchmark comparison
 *
 * @param value - Player's value
 * @param benchmark - Benchmark value
 * @param categoryLabel - Category/benchmark label
 * @returns Formatted string like "vs Category B +0.6"
 *
 * @example
 * ```typescript
 * formatVsBenchmark(1.5, 0.9, 'Category B');   // "vs Category B +0.60"
 * formatVsBenchmark(0.5, 1.2, 'PGA Tour');     // "vs PGA Tour -0.70"
 * formatVsBenchmark(1.0, 1.0, 'Par');          // "vs Par ±0.00"
 * ```
 */
export function formatVsBenchmark(
  value: number | null | undefined,
  benchmark: number | null | undefined,
  categoryLabel: string
): string {
  if (value === null || value === undefined || benchmark === null || benchmark === undefined) {
    return `vs ${categoryLabel} N/A`;
  }

  const diff = value - benchmark;
  const absValue = Math.abs(diff);

  if (absValue < NEUTRAL_THRESHOLD) {
    return `vs ${categoryLabel} ±0.00`;
  }

  const sign = diff > 0 ? '+' : '';
  return `vs ${categoryLabel} ${sign}${diff.toFixed(2)}`;
}

/**
 * Format SG with full context (value + trend + percentile)
 *
 * @param sg - Main SG value
 * @param trend - Trend/delta value
 * @param percentile - Percentile ranking
 * @returns Object with formatted strings for each component
 *
 * @example
 * ```typescript
 * const formatted = formatSGContext(1.8, 0.23, 85);
 * // {
 * //   value: "+1.80",
 * //   trend: "Δ30d +0.23",
 * //   percentile: "85th",
 * //   summary: "+1.80 SG (85th percentile)"
 * // }
 * ```
 */
export function formatSGContext(
  sg: number | null | undefined,
  trend?: number | null,
  percentile?: number | null
): {
  value: string;
  trend: string;
  percentile: string;
  summary: string;
} {
  const valueStr = formatSG(sg);
  const trendStr = trend !== null && trend !== undefined ? formatDelta(trend, '30d') : '';
  const percentileStr = percentile !== null && percentile !== undefined ? formatPercentile(percentile) : '';

  let summary = formatSG(sg, { showSuffix: true });
  if (percentile !== null && percentile !== undefined) {
    summary += ` (${percentileStr} percentile)`;
  }

  return {
    value: valueStr,
    trend: trendStr,
    percentile: percentileStr,
    summary,
  };
}

/**
 * Get semantic classification for an SG value
 *
 * @param value - SG value
 * @param threshold - Threshold for positive/negative (default 0)
 * @returns 'positive' | 'negative' | 'neutral'
 *
 * @example
 * ```typescript
 * getSGSemantic(1.5);    // 'positive'
 * getSGSemantic(-0.3);   // 'negative'
 * getSGSemantic(0.005);  // 'neutral'
 * ```
 */
export function getSGSemantic(
  value: number | null | undefined,
  threshold: number = 0
): 'positive' | 'negative' | 'neutral' {
  if (value === null || value === undefined) {
    return 'neutral';
  }

  const adjusted = value - threshold;
  if (Math.abs(adjusted) < NEUTRAL_THRESHOLD) {
    return 'neutral';
  }

  return adjusted > 0 ? 'positive' : 'negative';
}

/**
 * Get CSS class for semantic coloring
 *
 * @param value - SG value
 * @param options - Options for class generation
 * @returns CSS class string
 *
 * @example
 * ```typescript
 * getSGColorClass(1.5);                           // 'sg-positive'
 * getSGColorClass(-0.3);                          // 'sg-negative'
 * getSGColorClass(0, { withBackground: true });   // 'sg-neutral sg-neutral-bg'
 * ```
 */
export function getSGColorClass(
  value: number | null | undefined,
  options: {
    withBackground?: boolean;
    prefix?: string;
  } = {}
): string {
  const { withBackground = false, prefix = 'sg' } = options;
  const semantic = getSGSemantic(value);

  const baseClass = `${prefix}-${semantic}`;
  if (withBackground) {
    return `${baseClass} ${prefix}-${semantic}-bg`;
  }

  return baseClass;
}

/**
 * Get inline style object for semantic coloring
 * Use when CSS classes aren't available
 *
 * @param value - SG value
 * @returns Style object with color property
 */
export function getSGColorStyle(
  value: number | null | undefined
): CSSProperties {
  const semantic = getSGSemantic(value);

  const colors: Record<string, string> = {
    positive: 'var(--semantic-positive-text, #047857)',
    negative: 'var(--semantic-negative-text, #b91c1c)',
    neutral: 'var(--semantic-neutral-text, #6b7280)',
  };

  return { color: colors[semantic] };
}

/**
 * Format multiple SG categories for comparison display
 *
 * @param categories - Object with category values
 * @returns Array of formatted category data
 *
 * @example
 * ```typescript
 * formatSGCategories({
 *   tee: { value: 0.5, benchmark: 0.3 },
 *   approach: { value: -0.2, benchmark: 0.1 },
 * });
 * // [
 * //   { key: 'tee', value: '+0.50', vsBenchmark: 'vs Benchmark +0.20', semantic: 'positive' },
 * //   { key: 'approach', value: '-0.20', vsBenchmark: 'vs Benchmark -0.30', semantic: 'negative' },
 * // ]
 * ```
 */
export function formatSGCategories(
  categories: Record<string, { value: number; benchmark?: number }>
): Array<{
  key: string;
  value: string;
  vsBenchmark: string;
  semantic: 'positive' | 'negative' | 'neutral';
}> {
  return Object.entries(categories).map(([key, { value, benchmark }]) => ({
    key,
    value: formatSG(value),
    vsBenchmark: benchmark !== undefined ? formatVsBenchmark(value, benchmark, 'Benchmark') : '',
    semantic: getSGSemantic(value),
  }));
}

export default {
  formatSG,
  formatDelta,
  formatPercentile,
  formatVsBenchmark,
  formatSGContext,
  getSGSemantic,
  getSGColorClass,
  getSGColorStyle,
  formatSGCategories,
};
