/**
 * AK Golf Academy - Card Component
 * Design System v3.0 - Blue Palette 01
 */

import React from 'react';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'highlight';

interface CardProps {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

const baseStyles: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '16px',
  overflow: 'hidden',
};

const variantStyles: Record<CardVariant, React.CSSProperties> = {
  default: {
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)',
  },
  elevated: {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  outlined: {
    boxShadow: 'none',
    border: '1px solid #E5E5EA',
  },
  highlight: {
    boxShadow: '0 4px 12px rgba(16, 69, 106, 0.15)',
    border: '2px solid #10456A',
  },
};

const paddingStyles: Record<string, React.CSSProperties> = {
  none: { padding: 0 },
  sm: { padding: '12px' },
  md: { padding: '16px' },
  lg: { padding: '24px' },
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  children,
  onClick,
  style,
  className,
}) => {
  const combinedStyles: React.CSSProperties = {
    ...baseStyles,
    ...variantStyles[variant],
    ...paddingStyles[padding],
    ...(onClick && { cursor: 'pointer', transition: 'all 0.2s ease' }),
    ...style,
  };

  return (
    <div style={combinedStyles} className={className} onClick={onClick}>
      {children}
    </div>
  );
};

// Session Card - specialized for training sessions
interface SessionCardProps {
  title: string;
  subtitle?: string;
  duration?: string;
  category?: string;
  status?: 'upcoming' | 'active' | 'completed';
  onClick?: () => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  title,
  subtitle,
  duration,
  category,
  status = 'upcoming',
  onClick,
}) => {
  const statusColors = {
    upcoming: { bg: '#EDF0F2', text: '#10456A' },
    active: { bg: '#10456A', text: '#FFFFFF' },
    completed: { bg: '#4A7C59', text: '#FFFFFF' },
  };

  return (
    <Card variant="default" onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: statusColors[status].bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}
        >
          {category === 'teknikk' ? '🏌️' : category === 'fysisk' ? '💪' : '⛳'}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: '#1C1C1E',
              marginBottom: '4px',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: '13px', color: '#8E8E93' }}>{subtitle}</div>
          )}
        </div>
        {duration && (
          <div
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#10456A',
              backgroundColor: '#E8F1F5',
              padding: '4px 8px',
              borderRadius: '8px',
            }}
          >
            {duration}
          </div>
        )}
      </div>
    </Card>
  );
};

// Stats Card - for displaying statistics
interface StatsCardProps {
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  value,
  label,
  trend,
  trendValue,
}) => {
  const trendColors = {
    up: '#4A7C59',
    down: '#C45B4E',
    neutral: '#8E8E93',
  };

  return (
    <Card variant="default" padding="md">
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#10456A',
            marginBottom: '4px',
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#8E8E93',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {label}
        </div>
        {trend && trendValue && (
          <div
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: trendColors[trend],
              marginTop: '8px',
            }}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </div>
        )}
      </div>
    </Card>
  );
};

export default Card;
