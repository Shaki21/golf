/**
 * ================================================================
 * Formatting Utility Functions
 * ================================================================
 *
 * Reusable formatting functions for the frontend application.
 * Handles numbers, dates, strings, and UI-specific formatting.
 */

/**
 * Format a number with Norwegian locale
 *
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted string with Norwegian number formatting
 *
 * @example
 * ```typescript
 * formatNumber(1234.56); // Returns "1 235"
 * formatNumber(1234.56, 2); // Returns "1 234,56"
 * ```
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('nb-NO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format duration in minutes to readable string
 *
 * @param minutes - Duration in minutes
 * @returns Formatted string (e.g., "1t 30min", "45 min")
 *
 * @example
 * ```typescript
 * formatDuration(90); // Returns "1t 30min"
 * formatDuration(45); // Returns "45 min"
 * formatDuration(120); // Returns "2t"
 * ```
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}t ${mins}min` : `${hours}t`;
}

/**
 * Format percentage with optional decimal places
 *
 * @param value - Value between 0 and 100
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string
 *
 * @example
 * ```typescript
 * formatPercentage(75); // Returns "75%"
 * formatPercentage(75.5, 1); // Returns "75,5%"
 * ```
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${formatNumber(value, decimals)}%`;
}

/**
 * Format handicap value
 *
 * @param hcp - Handicap value
 * @returns Formatted handicap string with sign
 *
 * @example
 * ```typescript
 * formatHandicap(10.5); // Returns "+10,5"
 * formatHandicap(-2.4); // Returns "-2,4"
 * formatHandicap(0); // Returns "0,0"
 * ```
 */
export function formatHandicap(hcp: number): string {
  const sign = hcp > 0 ? '+' : '';
  return `${sign}${formatNumber(hcp, 1)}`;
}

/**
 * Truncate text with ellipsis
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated string with "..." if needed
 *
 * @example
 * ```typescript
 * truncate('This is a long text', 10); // Returns "This is..."
 * truncate('Short', 10); // Returns "Short"
 * ```
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Pluralize a Norwegian word based on count
 *
 * @param count - Number of items
 * @param singular - Singular form
 * @param plural - Plural form
 * @returns Singular or plural form based on count
 *
 * @example
 * ```typescript
 * pluralize(1, 'økt', 'økter'); // Returns "økt"
 * pluralize(5, 'økt', 'økter'); // Returns "økter"
 * ```
 */
export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

/**
 * Format a count with its unit
 *
 * @param count - Number to format
 * @param singular - Singular unit
 * @param plural - Plural unit
 * @returns Formatted string like "5 økter" or "1 økt"
 *
 * @example
 * ```typescript
 * formatCount(1, 'økt', 'økter'); // Returns "1 økt"
 * formatCount(5, 'økt', 'økter'); // Returns "5 økter"
 * ```
 */
export function formatCount(count: number, singular: string, plural: string): string {
  return `${count} ${pluralize(count, singular, plural)}`;
}

/**
 * Capitalize first letter of a string
 *
 * @param text - Text to capitalize
 * @returns Text with first letter capitalized
 *
 * @example
 * ```typescript
 * capitalize('hello world'); // Returns "Hello world"
 * capitalize('HELLO'); // Returns "HELLO"
 * ```
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Format initials from a full name
 *
 * @param name - Full name
 * @returns Initials (max 2 characters)
 *
 * @example
 * ```typescript
 * getInitials('John Doe'); // Returns "JD"
 * getInitials('Anders Kristiansen'); // Returns "AK"
 * getInitials('Bob'); // Returns "B"
 * ```
 */
export function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Format relative time (e.g., "2t siden", "5d siden")
 *
 * @param date - The date to format
 * @returns Relative time string in Norwegian
 *
 * @example
 * ```typescript
 * // If now is 14:00
 * formatRelativeTime(new Date('12:00')); // Returns "2t siden"
 * formatRelativeTime(new Date('yesterday')); // Returns "1d siden"
 * ```
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
  } else if (days > 0) {
    return `${days}d siden`;
  } else if (hours > 0) {
    return `${hours}t siden`;
  } else if (minutes > 0) {
    return `${minutes}min siden`;
  } else {
    return 'Nå nettopp';
  }
}

/**
 * Format change value with + or - sign and optional unit
 *
 * @param value - The change value
 * @param unit - Optional unit to append (e.g., "%", "t")
 * @param decimals - Number of decimal places
 * @returns Formatted change string
 *
 * @example
 * ```typescript
 * formatChange(5); // Returns "+5"
 * formatChange(-3, '%'); // Returns "-3%"
 * formatChange(2.5, 't', 1); // Returns "+2,5t"
 * formatChange(0); // Returns "±0"
 * ```
 */
export function formatChange(value: number, unit: string = '', decimals: number = 0): string {
  if (value === 0) {
    return `±0${unit}`;
  }
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatNumber(value, decimals)}${unit}`;
}

/**
 * Get color class for a change value
 *
 * @param value - The change value
 * @returns Tailwind color class
 *
 * @example
 * ```typescript
 * getChangeColor(5); // Returns "text-green-600"
 * getChangeColor(-3); // Returns "text-red-600"
 * getChangeColor(0); // Returns "text-gray-600"
 * ```
 */
export function getChangeColor(value: number): string {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-600';
}
