import React from 'react';

/**
 * Spinner Primitive
 * Loading spinner with multiple variants
 */

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
type SpinnerVariant = 'circular' | 'dots' | 'pulse';

interface SpinnerProps {
  /** Size variant */
  size?: SpinnerSize;
  /** Visual variant */
  variant?: SpinnerVariant;
  /** Custom color */
  color?: string;
  /** Label for accessibility */
  label?: string;
  /** Additional className */
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'circular',
  color = 'var(--accent)',
  label = 'Loading',
  className = '',
}) => {
  const sizeValue = sizes[size];

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex gap-1 items-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-full animate-pulse"
                style={{
                  backgroundColor: color,
                  width: sizeValue / 4,
                  height: sizeValue / 4,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div
            className="rounded-full animate-pulse"
            style={{
              width: sizeValue,
              height: sizeValue,
              backgroundColor: color,
            }}
          />
        );

      default:
        return (
          <svg
            width={sizeValue}
            height={sizeValue}
            viewBox="0 0 50 50"
            className="animate-spin"
          >
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke={color}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="31.4 31.4"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      role="status"
      aria-label={label}
    >
      {renderSpinner()}
      <span className="sr-only">{label}</span>
    </div>
  );
};

const sizes: Record<SpinnerSize, number> = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

export default Spinner;
