import React from 'react';

/**
 * Base skeleton components - UI Canon compliant
 * Uses semantic CSS variables
 */

const pulseKeyframes = `
  @keyframes skeletonPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

/**
 * Base skeleton component with shimmer animation
 */
export const SkeletonPulse = ({ width, height, rounded = false, style = {} }) => {
  return (
    <>
      <style>{pulseKeyframes}</style>
      <div
        style={{
          width: width || '100%',
          height: height || '1rem',
          backgroundColor: 'rgb(var(--tier-navy-rgb) / 0.1)',
          borderRadius: rounded ? '9999px' : '0.375rem',
          animation: 'skeletonPulse 1.5s ease-in-out infinite',
          ...style,
        }}
        aria-hidden="true"
      />
    </>
  );
};

/**
 * Card wrapper for skeleton content
 */
export const SkeletonCard = ({ children, style = {} }) => (
  <>
    <style>{pulseKeyframes}</style>
    <div
      style={{
        backgroundColor: 'rgb(var(--tier-white-rgb))',
        borderRadius: '0.75rem',
        border: '1px solid rgb(var(--tier-navy-rgb) / 0.1)',
        padding: '20px',
        boxShadow: '0 1px 3px 0 rgb(var(--tier-navy-rgb) / 0.1)',
        ...style,
      }}
    >
      {children}
    </div>
  </>
);

/**
 * Text skeleton line
 */
export const SkeletonText = ({ lines = 1, style = {} }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...style }}>
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonPulse
        key={i}
        height="0.875rem"
        width={i === lines - 1 ? '75%' : '100%'}
      />
    ))}
  </div>
);

/**
 * Circle skeleton (for avatars, icons)
 */
export const SkeletonCircle = ({ size = 40, style = {} }) => (
  <SkeletonPulse
    width={`${size}px`}
    height={`${size}px`}
    rounded
    style={style}
  />
);

export default SkeletonPulse;
