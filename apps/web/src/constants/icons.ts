/**
 * Standardized Category Icons
 *
 * Central icon definitions for consistent usage across the app.
 * All icons are from lucide-react.
 *
 * Usage:
 *   import { CATEGORY_ICONS, ACTION_ICONS, getCategoryIcon } from '../constants/icons';
 *   const DrivingIcon = CATEGORY_ICONS.driving;
 *   <DrivingIcon size={20} />
 */

import {
  // Category icons
  Target,
  Flag,
  CircleDot,
  Zap,
  Brain,
  Dumbbell,
  Settings,
  Crosshair,
  // Action icons
  Plus,
  ChevronRight,
  Pencil,
  Trash2,
  Heart,
  Play,
  Check,
  // Additional utility icons
  type LucideIcon,
} from 'lucide-react';

// =============================================================================
// GOLF CATEGORY ICONS (Strokes Gained / Training Categories)
// =============================================================================

/**
 * Standard category icons for golf training areas
 */
export const CATEGORY_ICONS = {
  // Golf-specific categories (Strokes Gained)
  driving: Target,        // Driving/Fullspill - Target for precision off the tee
  tee: Target,            // Alias for driving
  fullspill: Target,      // Norwegian alias

  approach: Crosshair,    // Approach shots - Crosshair for precision targeting
  iron: Flag,             // Iron play / Jernspill - Flag represents the target
  jernspill: Flag,        // Norwegian alias

  shortGame: Zap,         // Short game / Kortspill - Zap for quick, sharp shots
  kortspill: Zap,         // Norwegian alias
  aroundGreen: Flag,      // Around the green - Flag for proximity
  around_green: Flag,     // Snake_case alias for API compatibility

  putting: CircleDot,     // Putting - CircleDot represents the hole

  // Training pyramid categories (TIER Golf system)
  physical: Dumbbell,     // Fysisk - Physical training
  fys: Dumbbell,          // Norwegian code alias
  fysisk: Dumbbell,       // Norwegian alias

  technique: Settings,    // Teknikk - Technical training
  tek: Settings,          // Norwegian code alias
  teknikk: Settings,      // Norwegian alias

  mental: Brain,          // Mental training

  // Generic fallback
  default: Target,
} as const;

/**
 * Strokes Gained specific icons (for PlayerStatsPage compatibility)
 */
export const STROKES_GAINED_ICONS = {
  approach: Crosshair,
  around_green: Flag,
  putting: CircleDot,
  default: Target,
} as const;

/**
 * Test category icons (for RegistrerTestContainer)
 */
export const TEST_CATEGORY_ICONS = {
  driving: Target,
  iron_play: Flag,
  short_game: Zap,
  putting: CircleDot,
  physical: Dumbbell,
  default: Target,
} as const;

/**
 * Training pyramid icons (TIER Golf Kategori Hierarki)
 * Maps pyramid codes to icons
 */
export const PYRAMID_ICONS = {
  FYS: Dumbbell,    // Fysisk
  TEK: Settings,    // Teknikk
  SLAG: Target,     // Golfslag
  SPILL: Flag,      // Spill
  TURN: Target,     // Turnering (using Target as it represents goals/achievements)
} as const;

// =============================================================================
// ACTION ICONS
// =============================================================================

/**
 * Standard action icons for UI consistency
 */
export const ACTION_ICONS = {
  add: Plus,
  new: Plus,
  details: ChevronRight,
  more: ChevronRight,
  edit: Pencil,
  delete: Trash2,
  remove: Trash2,
  favorite: Heart,
  start: Play,
  complete: Check,
  done: Check,
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get category icon by key (case-insensitive)
 * @param category - Category key (e.g., 'driving', 'putting', 'physical')
 * @returns LucideIcon component
 */
export function getCategoryIcon(category: string): LucideIcon {
  const normalizedKey = category.toLowerCase().replace(/-/g, '_');
  return (CATEGORY_ICONS as Record<string, LucideIcon>)[normalizedKey] || CATEGORY_ICONS.default;
}

/**
 * Get Strokes Gained icon by category
 * @param category - SG category key (approach, around_green, putting)
 * @returns LucideIcon component
 */
export function getStrokesGainedIcon(category: string): LucideIcon {
  return (STROKES_GAINED_ICONS as Record<string, LucideIcon>)[category] || STROKES_GAINED_ICONS.default;
}

/**
 * Get test category icon
 * @param category - Test category key
 * @returns LucideIcon component
 */
export function getTestCategoryIcon(category: string): LucideIcon {
  return (TEST_CATEGORY_ICONS as Record<string, LucideIcon>)[category] || TEST_CATEGORY_ICONS.default;
}

/**
 * Get pyramid icon by code
 * @param pyramid - Pyramid code (FYS, TEK, SLAG, SPILL, TURN)
 * @returns LucideIcon component
 */
export function getPyramidIcon(pyramid: string): LucideIcon {
  return (PYRAMID_ICONS as Record<string, LucideIcon>)[pyramid] || CATEGORY_ICONS.default;
}

/**
 * Get action icon by key
 * @param action - Action key (e.g., 'add', 'edit', 'delete')
 * @returns LucideIcon component
 */
export function getActionIcon(action: string): LucideIcon {
  const normalizedKey = action.toLowerCase();
  return (ACTION_ICONS as Record<string, LucideIcon>)[normalizedKey] || ACTION_ICONS.add;
}

// Type exports
export type CategoryIconKey = keyof typeof CATEGORY_ICONS;
export type ActionIconKey = keyof typeof ACTION_ICONS;
export type PyramidIconKey = keyof typeof PYRAMID_ICONS;
