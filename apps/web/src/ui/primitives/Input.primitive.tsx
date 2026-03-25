import React from 'react';

/**
 * Input Primitive
 * Base text input component with variants and states
 * Migrated to Tailwind CSS
 */

type InputSize = 'sm' | 'md' | 'lg';
type InputVariant = 'default' | 'filled' | 'flushed';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input size */
  size?: InputSize;
  /** Visual variant */
  variant?: InputVariant;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Helper text */
  helperText?: string;
  /** Input label */
  label?: string;
  /** Left addon (icon or text) */
  leftAddon?: React.ReactNode;
  /** Right addon (icon or text) */
  rightAddon?: React.ReactNode;
  /** Full width */
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<InputVariant, string> = {
  default: 'border border-tier-border-default rounded-lg bg-white',
  filled: 'bg-tier-surface-subtle border border-transparent rounded-lg',
  flushed: 'rounded-none border-t-0 border-l-0 border-r-0 border-b-2 border-tier-border-default px-0',
};

const SIZE_CLASSES: Record<InputSize, string> = {
  sm: 'px-3 py-2 text-xs min-h-[36px]',
  md: 'px-4 py-3 text-sm min-h-[44px]',
  lg: 'px-5 py-4 text-base min-h-[52px]',
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  size = 'md',
  variant = 'default',
  error = false,
  errorMessage,
  helperText,
  label,
  leftAddon,
  rightAddon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}, ref) => {
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const baseInputClasses = 'w-full text-tier-navy transition-all duration-150 outline-none focus:border-tier-gold';
  const variantClasses = VARIANT_CLASSES[variant];
  const sizeClasses = SIZE_CLASSES[size];
  const errorClasses = error ? 'border-red-600' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed bg-tier-surface-subtle' : '';
  const leftAddonPadding = leftAddon ? 'pl-10' : '';
  const rightAddonPadding = rightAddon ? 'pr-10' : '';

  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-tier-navy mb-0.5">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftAddon && (
          <div className="absolute left-3 flex items-center text-tier-text-secondary pointer-events-none">
            {leftAddon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error}
          aria-describedby={
            error && errorMessage ? `${inputId}-error` :
            helperText ? `${inputId}-helper` : undefined
          }
          className={`${baseInputClasses} ${variantClasses} ${sizeClasses} ${errorClasses} ${disabledClasses} ${leftAddonPadding} ${rightAddonPadding} ${className}`}
          {...props}
        />

        {rightAddon && (
          <div className="absolute right-3 flex items-center text-tier-text-secondary">
            {rightAddon}
          </div>
        )}
      </div>

      {error && errorMessage && (
        <div id={`${inputId}-error`} className="text-[10px] text-red-600 mt-0.5">
          {errorMessage}
        </div>
      )}

      {!error && helperText && (
        <div id={`${inputId}-helper`} className="text-[10px] text-tier-text-secondary mt-0.5">
          {helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
