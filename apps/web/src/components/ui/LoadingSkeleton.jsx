import React from 'react';

/**
 * Skeleton loading components - UI Canon compliant
 * Uses semantic CSS variables
 */

const pulseKeyframes = `
  @keyframes skeletonPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const baseSkeletonStyle = {
  backgroundColor: 'var(--bg-tertiary)',
  borderRadius: 'var(--radius-sm)',
  animation: 'skeletonPulse 1.5s ease-in-out infinite',
};

// Skeleton line component
export function SkeletonLine({ width = '100%', height = '16px', style = {} }) {
  return (
    <>
      <style>{pulseKeyframes}</style>
      <div
        style={{
          ...baseSkeletonStyle,
          width,
          height,
          ...style,
        }}
        aria-hidden="true"
      />
    </>
  );
}

// Skeleton circle component
export function SkeletonCircle({ size = '40px', style = {} }) {
  return (
    <>
      <style>{pulseKeyframes}</style>
      <div
        style={{
          ...baseSkeletonStyle,
          width: size,
          height: size,
          borderRadius: '50%',
          ...style,
        }}
        aria-hidden="true"
      />
    </>
  );
}

// Skeleton card component
export function SkeletonCard({ style = {} }) {
  return (
    <>
      <style>{pulseKeyframes}</style>
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid var(--border-default)',
          ...style,
        }}
        aria-hidden="true"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <SkeletonCircle size="40px" />
          <div style={{ flex: 1 }}>
            <SkeletonLine width="60%" height="14px" style={{ marginBottom: '8px' }} />
            <SkeletonLine width="40%" height="12px" />
          </div>
        </div>
        <SkeletonLine width="100%" height="12px" style={{ marginBottom: '8px' }} />
        <SkeletonLine width="80%" height="12px" style={{ marginBottom: '8px' }} />
        <SkeletonLine width="60%" height="12px" />
      </div>
    </>
  );
}

// Dashboard skeleton layout
export function DashboardSkeleton() {
  return (
    <div style={{ fontFamily: 'var(--font-family)' }}>
      <style>{pulseKeyframes}</style>

      {/* Header skeleton */}
      <div style={{ marginBottom: '24px' }}>
        <SkeletonLine width="300px" height="32px" style={{ marginBottom: '8px' }} />
        <SkeletonLine width="200px" height="18px" />
      </div>

      {/* Grid skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid var(--border-default)',
              height: '200px',
            }}
          >
            <SkeletonLine width="150px" height="18px" style={{ marginBottom: '16px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <SkeletonLine width="100%" height="40px" />
              <SkeletonLine width="100%" height="40px" />
              <SkeletonLine width="100%" height="40px" />
            </div>
          </div>
          <SkeletonCard style={{ height: '200px' }} />
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}

// Widget skeleton
export function WidgetSkeleton({ lines = 3 }) {
  return (
    <>
      <style>{pulseKeyframes}</style>
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid var(--border-default)',
        }}
        aria-hidden="true"
      >
        <SkeletonLine width="40%" height="16px" style={{ marginBottom: '16px' }} />
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine
            key={i}
            width={`${100 - i * 15}%`}
            height="12px"
            style={{ marginBottom: i < lines - 1 ? '10px' : 0 }}
          />
        ))}
      </div>
    </>
  );
}

export default {
  Line: SkeletonLine,
  Circle: SkeletonCircle,
  Card: SkeletonCard,
  Dashboard: DashboardSkeleton,
  Widget: WidgetSkeleton,
};
