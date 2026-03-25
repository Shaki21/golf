/**
 * ============================================================
 * Quick Actions Configuration
 * TIER Golf Design System v3.1
 * ============================================================
 *
 * Defines quick actions for different user roles.
 * Used by the QuickActions component on dashboards.
 *
 * ============================================================
 */

import {
  Plus,
  Target,
  Calendar,
  MessageSquare,
  Users,
  BarChart3,
  ClipboardList,
  Dumbbell,
  TrendingUp,
  FileText,
  Clock,
  Award,
} from 'lucide-react';
import type { QuickAction } from '../components/dashboard/QuickActions';

/**
 * Quick actions for player dashboard
 */
export const playerQuickActions: QuickAction[] = [
  {
    label: 'Log Training',
    href: '/trening/logg',
    icon: Plus,
    variant: 'primary',
    description: 'Log new training session',
  },
  {
    label: 'Log Test',
    href: '/trening/testing/registrer',
    icon: Target,
    variant: 'secondary',
    description: 'New test result',
  },
  {
    label: 'View Weekly Plan',
    href: '/plan/ukeplan',
    icon: Calendar,
    variant: 'secondary',
    description: 'Your weekly plan',
  },
];

/**
 * Extended quick actions for player (more options)
 */
export const playerQuickActionsExtended: QuickAction[] = [
  ...playerQuickActions,
  {
    label: 'Statistics',
    href: '/utvikling/statistikk',
    icon: TrendingUp,
    variant: 'secondary',
    description: 'View your progress',
  },
];

/**
 * Quick actions for coach dashboard
 */
export const coachQuickActions: QuickAction[] = [
  {
    label: 'New Session',
    href: '/coach/sessions/create',
    icon: Plus,
    variant: 'primary',
    description: 'Create training session',
  },
  {
    label: 'View Players',
    href: '/coach/athletes',
    icon: Users,
    variant: 'secondary',
    description: 'Player overview',
  },
  {
    label: 'Weekly Report',
    href: '/coach/reports/weekly',
    icon: BarChart3,
    variant: 'secondary',
    description: 'This week\'s statistics',
  },
];

/**
 * Extended quick actions for coach (more options)
 */
export const coachQuickActionsExtended: QuickAction[] = [
  ...coachQuickActions,
  {
    label: 'Messages',
    href: '/coach/messages',
    icon: MessageSquare,
    variant: 'secondary',
    description: 'Communication',
  },
];

/**
 * Quick actions for Training hub
 */
export const treningQuickActions: QuickAction[] = [
  {
    label: 'Log Session',
    href: '/trening/logg',
    icon: Plus,
    variant: 'primary',
  },
  {
    label: 'Log Test',
    href: '/trening/testing/registrer',
    icon: Target,
    variant: 'secondary',
  },
  {
    label: 'View Exercises',
    href: '/trening/ovelser',
    icon: Dumbbell,
    variant: 'secondary',
  },
];

/**
 * Quick actions for Development hub
 */
export const utviklingQuickActions: QuickAction[] = [
  {
    label: 'View Statistics',
    href: '/utvikling/statistikk',
    icon: BarChart3,
    variant: 'primary',
  },
  {
    label: 'Test Results',
    href: '/utvikling/testresultater',
    icon: ClipboardList,
    variant: 'secondary',
  },
  {
    label: 'My Badges',
    href: '/utvikling/badges',
    icon: Award,
    variant: 'secondary',
  },
];

/**
 * Quick actions for Plan hub
 */
export const planQuickActions: QuickAction[] = [
  {
    label: 'Open Calendar',
    href: '/plan/kalender',
    icon: Calendar,
    variant: 'primary',
  },
  {
    label: 'View Goals',
    href: '/plan/maal',
    icon: Target,
    variant: 'secondary',
  },
  {
    label: 'Tournaments',
    href: '/plan/turneringer',
    icon: Clock,
    variant: 'secondary',
  },
];

/**
 * Quick actions for More hub
 */
export const merQuickActions: QuickAction[] = [
  {
    label: 'Messages',
    href: '/mer/meldinger',
    icon: MessageSquare,
    variant: 'primary',
  },
  {
    label: 'My Profile',
    href: '/mer/profil',
    icon: Users,
    variant: 'secondary',
  },
  {
    label: 'Settings',
    href: '/mer/innstillinger',
    icon: FileText,
    variant: 'secondary',
  },
];

/**
 * Maps area ID to quick actions
 */
export const quickActionsByArea: Record<string, QuickAction[]> = {
  dashboard: playerQuickActions,
  trening: treningQuickActions,
  utvikling: utviklingQuickActions,
  plan: planQuickActions,
  mer: merQuickActions,
};

/**
 * Get quick actions for an area
 */
export function getQuickActionsForArea(areaId: string): QuickAction[] {
  return quickActionsByArea[areaId] || [];
}

export default {
  player: playerQuickActions,
  playerExtended: playerQuickActionsExtended,
  coach: coachQuickActions,
  coachExtended: coachQuickActionsExtended,
  byArea: quickActionsByArea,
};
