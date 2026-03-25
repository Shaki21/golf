import React from 'react';

/**
 * CardSimple Raw Block
 * Basic card container component with consistent styling
 */

interface CardSimpleProps {
  /** Card content */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Enable hover effects */
  hoverable?: boolean;
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Shadow depth */
  shadow?: 'none' | 'card' | 'elevated';
  /** Border radius */
  rounded?: 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
}

// Padding configuration
const PADDING_CLASSES: Record<string, string> = {
  none: 'p-0',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

// Shadow configuration
const SHADOW_CLASSES: Record<string, string> = {
  none: 'shadow-none',
  card: 'shadow-sm',
  elevated: 'shadow-lg',
};

// Border radius configuration
const ROUNDED_CLASSES: Record<string, string> = {
  sm: 'rounded',
  md: 'rounded-lg',
  lg: 'rounded-xl',
};

const CardSimple: React.FC<CardSimpleProps> = ({
  children,
  onClick,
  hoverable = false,
  padding = 'md',
  shadow = 'card',
  rounded = 'md',
  className = '',
  style = {},
}) => {
  const paddingClass = PADDING_CLASSES[padding];
  const shadowClass = SHADOW_CLASSES[shadow];
  const roundedClass = ROUNDED_CLASSES[rounded];

  const baseClass = `bg-white border-none block w-full text-left transition-all duration-150 ${paddingClass} ${shadowClass} ${roundedClass}`;
  const clickableClass = onClick ? 'cursor-pointer' : '';
  const hoverClass = hoverable ? 'hover:shadow-md hover:-translate-y-0.5' : '';

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={`${baseClass} ${clickableClass} ${hoverClass} ${className}`}
      onClick={onClick}
      style={style}
      type={onClick ? 'button' : undefined}
    >
      {children}
    </Component>
  );
};

export default CardSimple;
