import React from 'react';
import { cn } from '../../lib/utils';

/**
 * TIER Golf Card Component
 *
 * A flexible card component with multiple variants for different use cases.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {'base' | 'elevated' | 'category' | 'tier'} props.variant - Visual style
 * @param {'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K'} props.category - Category for category variant
 * @param {'bronze' | 'silver' | 'gold' | 'platinum'} props.tier - Tier for tier variant
 * @param {boolean} props.hoverable - Enable hover effect
 * @param {string} props.className - Additional CSS classes
 *
 * @example
 * // Base card
 * <TierCard>
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </TierCard>
 *
 * // Category card with top border
 * <TierCard variant="category" category="A">
 *   <h3>Category A Progress</h3>
 * </TierCard>
 *
 * // Tier card with colored border
 * <TierCard variant="tier" tier="gold">
 *   <h3>Gold Badge</h3>
 * </TierCard>
 */

const categoryColors = {
  A: 'border-t-category-a',
  B: 'border-t-category-b',
  C: 'border-t-category-c',
  D: 'border-t-category-d',
  E: 'border-t-category-e',
  F: 'border-t-category-f',
  G: 'border-t-category-g',
  H: 'border-t-category-h',
  I: 'border-t-category-i',
  J: 'border-t-category-j',
  K: 'border-t-category-k',
};

const tierColors = {
  bronze: 'border-badge-tier-bronze shadow-sm',
  silver: 'border-badge-tier-silver shadow-sm',
  gold: 'border-badge-tier-gold shadow-[0_4px_14px_0_rgba(201,162,39,0.25)]',
  platinum: 'border-badge-tier-platinum shadow-sm',
};

export function TierCard({
  children,
  variant = 'base',
  category,
  tier,
  hoverable = false,
  className,
  ...props
}) {
  // Get variant-specific classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'shadow-md';

      case 'category':
        if (!category) {
          console.warn('TierCard: category prop is required when variant="category"');
          return '';
        }
        return cn('border-t-4', categoryColors[category]);

      case 'tier':
        if (!tier) {
          console.warn('TierCard: tier prop is required when variant="tier"');
          return '';
        }
        return cn('border-2', tierColors[tier]);

      default:
        return '';
    }
  };

  return (
    <div
      className={cn(
        // Base styles
        'bg-white rounded-xl border border-gray-200 p-4',
        'transition-shadow duration-200',

        // Hover effect
        hoverable && 'hover:shadow-md cursor-pointer',

        // Variant-specific
        getVariantClasses(),

        // Custom className
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Export available variants
TierCard.variants = ['base', 'elevated', 'category', 'tier'];
TierCard.categories = Object.keys(categoryColors);
TierCard.tiers = Object.keys(tierColors);
