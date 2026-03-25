/**
 * TIER Golf Design System - Component Library
 * Version: 1.0.0
 *
 * Core UI components for TIER Golf application.
 * All components follow TIER Golf design system principles.
 */

// Base Components
export { TierButton } from './TierButton';
export { TierCard } from './TierCard';
export { TierBadge } from './TierBadge';

// Gamification Components
export { CategoryRing } from './CategoryRing';
export { StreakIndicator } from './StreakIndicator';
export { AchievementBadge } from './AchievementBadge';

// Widgets (Dashboard & Feature Components)
export { StatCard, CategoryProgressCard, PlayerHeader, QuickActionCard } from './widgets';

/**
 * Usage:
 *
 * import { TierButton, TierCard, CategoryRing, StatCard } from '@/components/tier';
 *
 * <TierButton variant="primary">Click me</TierButton>
 * <TierCard variant="category" category="A">Content</TierCard>
 * <CategoryRing category="A" progress={65} />
 * <StatCard icon={Target} value="12/15" label="Økter" trend={+3} />
 */
