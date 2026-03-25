/**
 * TIER GOLF — DESIGN SYSTEM v3.0
 * Textarea Primitive Component
 *
 * Uses design tokens via CSS variables. Do not hardcode colors or spacing.
 */

import React from 'react';

/**
 * Textarea component with design system tokens
 *
 * @param {Object} props
 * @param {string} props.label - Textarea label
 * @param {string} props.error - Error message
 * @param {string} props.hint - Helper text
 * @param {boolean} props.fullWidth - Make textarea full width
 * @param {number} props.rows - Number of visible rows
 */
export function Textarea({
  label,
  error,
  hint,
  fullWidth = false,
  rows = 4,
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

  const textareaStyles = {
    fontFamily: 'var(--font-family)',
    fontSize: 'var(--font-size-body)',
    lineHeight: 'var(--line-height-body)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-sm)',
    border: `1px solid ${error ? 'var(--error)' : 'var(--border-default)'}`,
    backgroundColor: 'var(--background-white)',
    color: 'var(--text-primary)',
    outline: 'none',
    resize: 'vertical',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    width: '100%',
    minHeight: '80px',
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
      <textarea style={textareaStyles} rows={rows} {...props} />
      {(error || hint) && (
        <span style={hintStyles}>{error || hint}</span>
      )}
    </div>
  );
}

export default Textarea;
