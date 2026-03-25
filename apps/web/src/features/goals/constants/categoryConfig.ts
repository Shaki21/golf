/**
 * Category Configuration for Goals
 *
 * Defines color schemes and styling for goal categories.
 * Used consistently across goal cards and category filters.
 */

import { Target, Crosshair, Dumbbell, Brain, Trophy, RefreshCw } from 'lucide-react';

export interface CategoryColorScheme {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Text color for icons and labels */
  textColor: string;
  /** Background color for icon containers */
  bgColor: string;
  /** Border color for cards and buttons */
  borderColor: string;
  /** Hover state border color */
  hoverBorderColor: string;
  /** Tailwind color for badges and accents */
  accentColor: string;
}

export const CATEGORY_COLORS: Record<string, CategoryColorScheme> = {
  score: {
    id: 'score',
    label: 'Score',
    icon: Target,
    textColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    hoverBorderColor: 'hover:border-blue-400 dark:hover:border-blue-600',
    accentColor: 'blue',
  },
  teknikk: {
    id: 'teknikk',
    label: 'Teknikk',
    icon: Crosshair,
    textColor: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
    hoverBorderColor: 'hover:border-purple-400 dark:hover:border-purple-600',
    accentColor: 'purple',
  },
  fysisk: {
    id: 'fysisk',
    label: 'Fysisk',
    icon: Dumbbell,
    textColor: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    borderColor: 'border-green-200 dark:border-green-800',
    hoverBorderColor: 'hover:border-green-400 dark:hover:border-green-600',
    accentColor: 'green',
  },
  mental: {
    id: 'mental',
    label: 'Mental',
    icon: Brain,
    textColor: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    hoverBorderColor: 'hover:border-indigo-400 dark:hover:border-indigo-600',
    accentColor: 'indigo',
  },
  turnering: {
    id: 'turnering',
    label: 'Turnering',
    icon: Trophy,
    textColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    hoverBorderColor: 'hover:border-amber-400 dark:hover:border-amber-600',
    accentColor: 'amber',
  },
  prosess: {
    id: 'prosess',
    label: 'Prosess',
    icon: RefreshCw,
    textColor: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    hoverBorderColor: 'hover:border-cyan-400 dark:hover:border-cyan-600',
    accentColor: 'cyan',
  },
};

/**
 * Get category color scheme by category ID
 */
export function getCategoryColors(categoryId: string): CategoryColorScheme | null {
  return CATEGORY_COLORS[categoryId] || null;
}

/**
 * Get all category IDs
 */
export function getCategoryIds(): string[] {
  return Object.keys(CATEGORY_COLORS);
}

/**
 * Get icon component for category
 */
export function getCategoryIcon(categoryId: string): React.ComponentType<{ className?: string }> {
  return CATEGORY_COLORS[categoryId]?.icon || Target;
}
