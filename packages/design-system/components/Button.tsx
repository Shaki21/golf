/**
 * AK Golf Academy - Button Component
 * Design System v3.0 - Blue Palette 01
 */

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

const baseStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  fontWeight: 600,
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  outline: 'none',
};

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: '#10456A',
    color: '#FFFFFF',
  },
  secondary: {
    backgroundColor: '#EDF0F2',
    color: '#10456A',
    border: '2px solid #10456A',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#10456A',
  },
  danger: {
    backgroundColor: '#C45B4E',
    color: '#FFFFFF',
  },
  success: {
    backgroundColor: '#4A7C59',
    color: '#FFFFFF',
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    padding: '8px 16px',
    fontSize: '13px',
    lineHeight: '18px',
  },
  md: {
    padding: '12px 24px',
    fontSize: '15px',
    lineHeight: '20px',
  },
  lg: {
    padding: '16px 32px',
    fontSize: '17px',
    lineHeight: '22px',
  },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  disabled,
  style,
  ...props
}) => {
  const combinedStyles: React.CSSProperties = {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...(fullWidth && { width: '100%' }),
    ...(disabled && { opacity: 0.5, cursor: 'not-allowed' }),
    ...style,
  };

  return (
    <button
      style={combinedStyles}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span style={{ opacity: 0.7 }}>Laster...</span>
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </button>
  );
};

export default Button;
