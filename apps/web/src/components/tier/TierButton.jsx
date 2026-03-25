import React from 'react';
import { cn } from '../../lib/utils';

/**
 * TIER Golf Button Component
 *
 * A versatile button component with TIER Golf design system styling.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {'primary' | 'secondary' | 'outline' | 'ghost'} props.variant - Visual style
 * @param {'sm' | 'md' | 'lg'} props.size - Button size
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Click handler
 *
 * @example
 * <TierButton variant="primary" size="md" onClick={handleClick}>
 *   Submit
 * </TierButton>
 */

const variants = {
  primary: [
    'bg-tier-navy text-tier-white',
    'hover:bg-tier-navy-light',
    'active:bg-tier-navy-dark',
    'disabled:bg-gray-300 disabled:text-gray-500',
  ].join(' '),

  secondary: [
    'bg-tier-gold text-tier-navy',
    'hover:bg-tier-gold-light',
    'active:bg-tier-gold-dark',
    'disabled:bg-gray-300 disabled:text-gray-500',
  ].join(' '),

  outline: [
    'bg-transparent border-2 border-tier-navy text-tier-navy',
    'hover:bg-tier-navy hover:text-tier-white',
    'active:bg-tier-navy-dark active:text-tier-white',
    'disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent',
  ].join(' '),

  ghost: [
    'bg-transparent text-tier-navy',
    'hover:bg-gray-100',
    'active:bg-gray-200',
    'disabled:text-gray-400 disabled:hover:bg-transparent',
  ].join(' '),
};

const sizes = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

export function TierButton({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center',
        'font-semibold tracking-wide rounded-lg',
        'transition-all duration-150 ease-in-out',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-tier-navy focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',

        // Variant & size
        variants[variant],
        sizes[size],

        // Custom className
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// Export variant and size types for external use
TierButton.variants = Object.keys(variants);
TierButton.sizes = Object.keys(sizes);
