import React from 'react';

/**
 * Divider Primitive
 * Visual separator with optional label
 */

type DividerOrientation = 'horizontal' | 'vertical';
type DividerVariant = 'solid' | 'dashed' | 'dotted';

interface DividerProps {
  /** Orientation */
  orientation?: DividerOrientation;
  /** Visual variant */
  variant?: DividerVariant;
  /** Optional label */
  label?: string;
  /** Spacing around divider */
  spacing?: number;
  /** Custom color */
  color?: string;
  /** Additional className */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
}

const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  label,
  spacing = 16,
  color = 'var(--border-default)',
  className = '',
  style = {},
}) => {
  const isHorizontal = orientation === 'horizontal';

  if (label && isHorizontal) {
    return (
      <div className={`flex items-center gap-3 w-full ${className}`}>
        <div
          className="flex-1 h-0 border-t"
          style={{ borderColor: color, borderStyle: variant }}
        />
        <span className="text-[11px] text-tier-text-secondary uppercase tracking-wide font-semibold whitespace-nowrap">
          {label}
        </span>
        <div
          className="flex-1 h-0 border-t"
          style={{ borderColor: color, borderStyle: variant }}
        />
      </div>
    );
  }

  return (
    <hr
      className={`m-0 border-0 ${
        isHorizontal
          ? 'border-t w-full h-0'
          : 'border-l h-full w-0 inline-block'
      } ${className}`}
      style={{
        borderColor: color,
        borderStyle: variant,
        ...(isHorizontal
          ? { marginTop: spacing, marginBottom: spacing }
          : { marginLeft: spacing, marginRight: spacing }),
        ...style,
      }}
    />
  );
};

export default Divider;
