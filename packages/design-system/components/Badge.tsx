/**
 * AK Golf Academy - Badge/Tag Component
 * Design System v3.0 - Blue Palette 01
 */

import React from 'react';

export type BadgeVariant =
  | 'neutral'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'achievement';

export type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

const baseStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  fontWeight: 600,
  borderRadius: '8px',
  whiteSpace: 'nowrap',
};

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  neutral: {
    backgroundColor: 'var(--bg-neutral-subtle)',
    color: 'var(--text-secondary)',
  },
  accent: {
    backgroundColor: 'var(--bg-accent-subtle)',
    color: 'var(--accent)',
  },
  success: {
    backgroundColor: 'var(--bg-success-subtle)',
    color: 'var(--success)',
  },
  warning: {
    backgroundColor: 'var(--bg-warning-subtle)',
    color: 'var(--warning)',
  },
  error: {
    backgroundColor: 'var(--bg-error-subtle)',
    color: 'var(--error)',
  },
  achievement: {
    backgroundColor: 'var(--bg-achievement-subtle)',
    color: 'var(--achievement)',
  },
};

const sizeStyles: Record<BadgeSize, React.CSSProperties> = {
  sm: {
    padding: '2px 6px',
    fontSize: '11px',
    lineHeight: '13px',
  },
  md: {
    padding: '4px 10px',
    fontSize: '13px',
    lineHeight: '18px',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  children,
  icon,
  style,
}) => {
  const combinedStyles: React.CSSProperties = {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  return (
    <span style={combinedStyles}>
      {icon && icon}
      {children}
    </span>
  );
};

// Level Badge - for competency levels
interface LevelBadgeProps {
  level: 1 | 2 | 3 | 4 | 5;
  size?: BadgeSize;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level, size = 'md' }) => {
  const levelConfig = {
    1: { bg: 'var(--bg-neutral-subtle)', color: 'var(--text-tertiary)', label: 'L1' },
    2: { bg: 'var(--gray-300)', color: 'var(--text-tertiary)', label: 'L2' },
    3: { bg: 'var(--bg-accent-subtle)', color: 'var(--accent)', label: 'L3' },
    4: { bg: 'var(--accent-hover)', color: 'var(--text-inverse)', label: 'L4' },
    5: { bg: 'var(--accent)', color: 'var(--text-inverse)', label: 'L5' },
  };

  const config = levelConfig[level];

  return (
    <Badge
      variant="neutral"
      size={size}
      style={{
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      {config.label}
    </Badge>
  );
};

// Category Badge - for session categories
interface CategoryBadgeProps {
  category: 'teknikk' | 'fysisk' | 'mental' | 'spill' | 'test';
  size?: BadgeSize;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'md' }) => {
  const categoryConfig = {
    teknikk: { icon: '🏌️', label: 'Teknikk', color: 'var(--accent)' },
    fysisk: { icon: '💪', label: 'Fysisk', color: 'var(--warning)' },
    mental: { icon: '🧠', label: 'Mental', color: 'var(--info)' },
    spill: { icon: '⛳', label: 'Spill', color: 'var(--success)' },
    test: { icon: '📊', label: 'Test', color: 'var(--achievement)' },
  };

  const config = categoryConfig[category];

  return (
    <Badge
      variant="neutral"
      size={size}
      icon={<span>{config.icon}</span>}
      style={{
        backgroundColor: `color-mix(in srgb, ${config.color} 10%, transparent)`,
        color: config.color,
      }}
    >
      {config.label}
    </Badge>
  );
};

export default Badge;
