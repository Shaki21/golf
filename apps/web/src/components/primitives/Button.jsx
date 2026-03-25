/**
 * TIER GOLF — DESIGN SYSTEM v3.0
 * Button Primitive Component
 *
 * Uses design tokens via CSS variables. Do not hardcode colors or spacing.
 */

import React from 'react';

const variants = {
  primary: {
    backgroundColor: 'var(--accent)',
    color: 'var(--text-inverse)',
    border: 'none',
  },
  secondary: {
    backgroundColor: 'var(--background-surface)',
    color: 'var(--accent)',
    border: '1px solid var(--border-default)',
  },
  outline: {
    backgroundColor: 'transparent',
    color: 'var(--accent)',
    border: '1px solid var(--accent)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--accent)',
    border: 'none',
  },
  danger: {
    backgroundColor: 'var(--error)',
    color: 'var(--text-inverse)',
    border: 'none',
  },
};

const sizes = {
  sm: {
    padding: 'var(--spacing-1) var(--spacing-3)',
    fontSize: 'var(--font-size-footnote)',
    lineHeight: 'var(--line-height-footnote)',
  },
  md: {
    padding: 'var(--spacing-2) var(--spacing-4)',
    fontSize: 'var(--font-size-body)',
    lineHeight: 'var(--line-height-body)',
  },
  lg: {
    padding: 'var(--spacing-3) var(--spacing-6)',
    fontSize: 'var(--font-size-headline)',
    lineHeight: 'var(--line-height-headline)',
  },
};

/**
 * Button component with design system tokens
 *
 * @param {Object} props
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'} props.variant - Button style variant
 * @param {'sm'|'md'|'lg'} props.size - Button size
 * @param {boolean} props.fullWidth - Make button full width
 * @param {boolean} props.disabled - Disable the button
 * @param {React.ReactNode} props.children - Button content
 */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  children,
  style,
  ...props
}) {
  const variantStyles = variants[variant] || variants.primary;
  const sizeStyles = sizes[size] || sizes.md;

  const baseStyles = {
    fontFamily: 'var(--font-family)',
    fontWeight: 600,
    borderRadius: 'var(--radius-sm)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'background-color 0.2s, opacity 0.2s',
    width: fullWidth ? '100%' : 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-2)',
    ...variantStyles,
    ...sizeStyles,
    ...style,
  };

  return (
    <button
      style={baseStyles}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
