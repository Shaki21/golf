/**
 * TIER GOLF — DESIGN SYSTEM v3.0
 * Input Primitive Component
 *
 * Uses design tokens via CSS variables. Do not hardcode colors or spacing.
 */

import React from 'react';

/**
 * Input component with design system tokens
 *
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {string} props.error - Error message
 * @param {string} props.hint - Helper text
 * @param {boolean} props.fullWidth - Make input full width
 */
export function Input({
  label,
  error,
  hint,
  fullWidth = false,
  style,
  ...props
}) {
  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
    width: fullWidth ? '100%' : 'auto',
  };

  const labelStyles = {
    fontFamily: 'var(--font-family)',
    fontSize: 'var(--font-size-subheadline)',
    lineHeight: 'var(--line-height-subheadline)',
    fontWeight: 500,
    color: 'var(--text-primary)',
  };

  const inputStyles = {
    fontFamily: 'var(--font-family)',
    fontSize: 'var(--font-size-body)',
    lineHeight: 'var(--line-height-body)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-sm)',
    border: `1px solid ${error ? 'var(--error)' : 'var(--border-default)'}`,
    backgroundColor: 'var(--background-white)',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    width: '100%',
    ...style,
  };

  const hintStyles = {
    fontFamily: 'var(--font-family)',
    fontSize: 'var(--font-size-footnote)',
    lineHeight: 'var(--line-height-footnote)',
    color: error ? 'var(--error)' : 'var(--text-secondary)',
  };

  return (
    <div style={containerStyles}>
      {label && <label style={labelStyles}>{label}</label>}
      <input style={inputStyles} {...props} />
      {(error || hint) && (
        <span style={hintStyles}>{error || hint}</span>
      )}
    </div>
  );
}

export default Input;
