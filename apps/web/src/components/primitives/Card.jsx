/**
 * TIER GOLF — DESIGN SYSTEM v3.0
 * Card Primitive Component
 *
 * Uses design tokens via CSS variables. Do not hardcode colors or spacing.
 */

import React from 'react';

const variants = {
  default: {
    backgroundColor: 'var(--background-white)',
    border: 'none',
  },
  surface: {
    backgroundColor: 'var(--background-surface)',
    border: 'none',
  },
  outlined: {
    backgroundColor: 'var(--background-white)',
    border: '1px solid var(--border-default)',
  },
  elevated: {
    backgroundColor: 'var(--background-white)',
    boxShadow: 'var(--shadow-elevated)',
    border: 'none',
  },
};

const paddings = {
  none: '0',
  sm: 'var(--spacing-3)',
  md: 'var(--spacing-4)',
  lg: 'var(--spacing-6)',
};

/**
 * Card component with design system tokens
 *
 * @param {Object} props
 * @param {'default'|'surface'|'outlined'|'elevated'} props.variant - Card style variant
 * @param {'none'|'sm'|'md'|'lg'} props.padding - Card padding
 * @param {React.ReactNode} props.children - Card content
 */
export function Card({
  variant = 'default',
  padding = 'md',
  children,
  style,
  ...props
}) {
  const variantStyles = variants[variant] || variants.default;
  const paddingValue = paddings[padding] || paddings.md;

  const cardStyles = {
    borderRadius: 'var(--radius-md)',
    boxShadow: variant !== 'elevated' ? 'var(--shadow-card)' : undefined,
    padding: paddingValue,
    ...variantStyles,
    ...style,
  };

  return (
    <div style={cardStyles} {...props}>
      {children}
    </div>
  );
}

export default Card;
