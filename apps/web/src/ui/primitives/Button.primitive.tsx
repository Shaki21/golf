import React from 'react';

/**
 * Button Primitive
 * Base button component with multiple variants and sizes
 * Migrated to Tailwind CSS
 */

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size variant */
  size?: ButtonSize;
  /** Full width button */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Icon on the left */
  leftIcon?: React.ReactNode;
  /** Icon on the right */
  rightIcon?: React.ReactNode;
  /** Button content */
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-tier-gold text-white border-transparent hover:bg-tier-gold/90',
  secondary: 'bg-transparent text-tier-gold border border-tier-gold hover:bg-tier-gold/10',
  outline: 'bg-transparent text-tier-gold border border-tier-gold hover:bg-tier-gold/10',
  ghost: 'bg-transparent text-tier-navy border-transparent hover:bg-tier-surface-subtle',
  danger: 'bg-red-600 text-white border-transparent hover:bg-red-700',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-xs min-h-[36px]',
  md: 'px-4 py-3 text-sm min-h-[44px]',
  lg: 'px-6 py-4 text-base min-h-[52px]',
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg cursor-pointer transition-all duration-150 no-underline select-none whitespace-nowrap relative';
  const variantClasses = VARIANT_CLASSES[variant];
  const sizeClasses = SIZE_CLASSES[size];
  const widthClasses = fullWidth ? 'w-full' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
  const loadingClasses = loading ? 'pointer-events-none' : '';

  return (
    <button
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses} ${disabledClasses} ${loadingClasses} ${className}`}
      {...props}
    >
      {loading && (
        <span className="flex items-center justify-center">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="animate-spin"
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="9.42 31.42"
            />
          </svg>
        </span>
      )}
      {!loading && leftIcon && <span className="flex items-center justify-center shrink-0">{leftIcon}</span>}
      <span className="flex-1">{children}</span>
      {!loading && rightIcon && <span className="flex items-center justify-center shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;
