import React from 'react';
import { cn } from '../../lib/utils';

/**
 * TIER Golf Badge Component
 *
 * Small badge/pill component for status indicators, labels, and tags.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Badge content
 * @param {'primary' | 'gold' | 'success' | 'warning' | 'error' | 'info' | 'neutral'} props.variant - Visual style
 * @param {'sm' | 'md' | 'lg'} props.size - Badge size
 * @param {React.ReactNode} props.icon - Optional icon (Lucide icon component)
 * @param {string} props.className - Additional CSS classes
 *
 * @example
 * import { CheckCircle } from 'lucide-react';
 *
 * <TierBadge variant="success" icon={<CheckCircle />}>
 *   Completed
 * </TierBadge>
 */

const variants = {
  primary: 'bg-tier-navy text-tier-white',

  gold: 'bg-tier-gold/10 text-tier-gold-dark border border-tier-gold/30',

  success: 'bg-status-success/10 text-green-700 border border-status-success/30',

  warning: 'bg-status-warning/10 text-orange-700 border border-status-warning/30',

  error: 'bg-status-error/10 text-red-700 border border-status-error/30',

  info: 'bg-status-info/10 text-blue-700 border border-status-info/30',

  neutral: 'bg-gray-100 text-gray-700 border border-gray-200',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-xs gap-1',
  lg: 'px-3 py-1.5 text-sm gap-1.5',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
};

export function TierBadge({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className,
  ...props
}) {
  return (
    <span
      className={cn(
        // Base styles
        'inline-flex items-center justify-center',
        'font-medium rounded-full',
        'transition-colors duration-150',

        // Variant & size
        variants[variant],
        sizes[size],

        // Custom className
        className
      )}
      {...props}
    >
      {icon && (
        <span className={cn('flex-shrink-0', iconSizes[size])}>
          {React.cloneElement(icon, {
            className: cn(iconSizes[size], icon.props.className),
          })}
        </span>
      )}
      {children}
    </span>
  );
}

// Export variant and size types
TierBadge.variants = Object.keys(variants);
TierBadge.sizes = Object.keys(sizes);
