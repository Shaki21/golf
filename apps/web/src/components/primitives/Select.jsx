/**
 * TIER GOLF — DESIGN SYSTEM v3.0
 * Select Primitive Component
 *
 * Uses design tokens via CSS variables. Do not hardcode colors or spacing.
 */

import React from 'react';

/**
 * Select component with design system tokens
 *
 * @param {Object} props
 * @param {string} props.label - Select label
 * @param {string} props.error - Error message
 * @param {string} props.hint - Helper text
 * @param {boolean} props.fullWidth - Make select full width
 * @param {Array} props.options - Array of { value, label } objects
 */
export function Select({
  label,
  error,
  hint,
  fullWidth = false,
  options = [],
  placeholder,
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

  const selectStyles = {
    fontFamily: 'var(--font-family)',
    fontSize: 'var(--font-size-body)',
    lineHeight: 'var(--line-height-body)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    paddingRight: 'var(--spacing-8)',
    borderRadius: 'var(--radius-sm)',
    border: `1px solid ${error ? 'var(--error)' : 'var(--border-default)'}`,
    backgroundColor: 'var(--background-white)',
    color: 'var(--text-primary)',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%238E8E93' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right var(--spacing-2) center',
    backgroundSize: 'var(--icon-size)',
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
      <select style={selectStyles} {...props}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {(error || hint) && (
        <span style={hintStyles}>{error || hint}</span>
      )}
    </div>
  );
}

export default Select;
