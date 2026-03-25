/**
 * AK Golf Academy - Progress Components
 * Design System v3.0 - Blue Palette 01
 */

import React from 'react';

// Progress Bar
interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  style?: React.CSSProperties;
}

const barHeights = {
  sm: 4,
  md: 8,
  lg: 12,
};

const variantColors = {
  primary: 'var(--accent)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  error: 'var(--error)',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  label,
  animated = false,
  style,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const containerStyles: React.CSSProperties = {
    width: '100%',
    ...style,
  };

  const trackStyles: React.CSSProperties = {
    width: '100%',
    height: barHeights[size],
    backgroundColor: 'var(--bg-neutral-subtle)',
    borderRadius: barHeights[size] / 2,
    overflow: 'hidden',
  };

  const fillStyles: React.CSSProperties = {
    width: `${percentage}%`,
    height: '100%',
    backgroundColor: variantColors[variant],
    borderRadius: barHeights[size] / 2,
    transition: animated ? 'width 0.5s ease' : 'none',
  };

  const labelStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    fontSize: '13px',
    fontWeight: 500,
  };

  return (
    <div style={containerStyles}>
      {(showLabel || label) && (
        <div style={labelStyles}>
          <span style={{ color: 'var(--text-primary)' }}>{label || ''}</span>
          {showLabel && (
            <span style={{ color: variantColors[variant] }}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div style={trackStyles}>
        <div style={fillStyles} />
      </div>
    </div>
  );
};

// Circular Progress
interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  showValue?: boolean;
  label?: string;
  style?: React.CSSProperties;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 80,
  strokeWidth = 8,
  variant = 'primary',
  showValue = true,
  label,
  style,
}) => {
  const percentage = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: size,
    height: size,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  };

  const textStyles: React.CSSProperties = {
    position: 'absolute',
    textAlign: 'center',
  };

  const valueStyles: React.CSSProperties = {
    fontSize: size * 0.25,
    fontWeight: 700,
    color: 'var(--accent)',
    lineHeight: 1,
  };

  const labelStyles: React.CSSProperties = {
    fontSize: size * 0.12,
    color: 'var(--text-tertiary)',
    marginTop: '2px',
  };

  return (
    <div style={containerStyles}>
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-neutral-subtle)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={variantColors[variant]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 0.5s ease',
          }}
        />
      </svg>
      {showValue && (
        <div style={textStyles}>
          <div style={valueStyles}>{Math.round(percentage)}%</div>
          {label && <div style={labelStyles}>{label}</div>}
        </div>
      )}
    </div>
  );
};

// Goal Progress - specialized for showing goal completion
interface GoalProgressProps {
  current: number;
  target: number;
  unit?: string;
  title: string;
  icon?: string;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({
  current,
  target,
  unit = '',
  title,
  icon = '🎯',
}) => {
  const percentage = Math.min((current / target) * 100, 100);
  const isComplete = current >= target;

  return (
    <div
      style={{
        backgroundColor: 'var(--card)',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: isComplete ? 'var(--success)' : 'var(--bg-neutral-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            color: isComplete ? 'var(--text-inverse)' : 'inherit',
          }}
        >
          {isComplete ? '✓' : icon}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '2px',
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
            {current} / {target} {unit}
          </div>
        </div>
      </div>
      <ProgressBar
        value={current}
        max={target}
        size="md"
        variant={isComplete ? 'success' : 'primary'}
        animated
      />
    </div>
  );
};

export default ProgressBar;
