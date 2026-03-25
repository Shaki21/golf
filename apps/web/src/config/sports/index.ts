/**
 * Sports Configuration Index
 *
 * Central registry for all sport configurations.
 * Import sport configs from here to ensure consistent access.
 *
 * Usage:
 *   import { GOLF_CONFIG, getSportConfig } from '@/config/sports';
 *   const config = getSportConfig('golf');
 */

export * from './types';
export { GOLF_CONFIG, default as GolfConfig } from './golf.config';
export { RUNNING_CONFIG } from './running.config';
export { HANDBALL_CONFIG } from './handball.config';
export { FOOTBALL_CONFIG } from './football.config';
export { TENNIS_CONFIG } from './tennis.config';
export { SWIMMING_CONFIG } from './swimming.config';
export { JAVELIN_CONFIG } from './javelin.config';

import type { SportConfig, SportId } from './types';
import { GOLF_CONFIG } from './golf.config';
import { RUNNING_CONFIG } from './running.config';
import { HANDBALL_CONFIG } from './handball.config';
import { FOOTBALL_CONFIG } from './football.config';
import { TENNIS_CONFIG } from './tennis.config';
import { SWIMMING_CONFIG } from './swimming.config';
import { JAVELIN_CONFIG } from './javelin.config';

// ============================================================================
// SPORT REGISTRY
// ============================================================================

/**
 * Registry of all available sport configurations.
 * Add new sports here as they are implemented.
 */
export const SPORTS_REGISTRY: Record<SportId, SportConfig> = {
  golf: GOLF_CONFIG,
  running: RUNNING_CONFIG,
  handball: HANDBALL_CONFIG,
  football: FOOTBALL_CONFIG,
  tennis: TENNIS_CONFIG,
  swimming: SWIMMING_CONFIG,
  javelin: JAVELIN_CONFIG,
};

/**
 * Get sport configuration by ID
 * @param sportId - The sport identifier
 * @returns SportConfig for the requested sport
 * @throws Error if sport is not found
 */
export function getSportConfig(sportId: SportId): SportConfig {
  const config = SPORTS_REGISTRY[sportId];
  if (!config) {
    throw new Error(`Sport configuration not found for: ${sportId}`);
  }
  return config;
}

/**
 * Check if a sport is available
 * @param sportId - The sport identifier
 * @returns true if sport has a real config (not placeholder)
 */
export function isSportAvailable(sportId: SportId): boolean {
  // All sports are now fully implemented
  return sportId in SPORTS_REGISTRY;
}

/**
 * Get list of all available sports
 * @returns Array of sport IDs that are fully implemented
 */
export function getAvailableSports(): SportId[] {
  return (Object.keys(SPORTS_REGISTRY) as SportId[]).filter(isSportAvailable);
}

/**
 * Get all sports (including placeholders)
 * @returns Array of all sport IDs
 */
export function getAllSports(): SportId[] {
  return Object.keys(SPORTS_REGISTRY) as SportId[];
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

/**
 * Default sport configuration (Golf)
 * Used when no specific sport is selected
 */
export const DEFAULT_SPORT_CONFIG = GOLF_CONFIG;
export const DEFAULT_SPORT_ID: SportId = 'golf';
