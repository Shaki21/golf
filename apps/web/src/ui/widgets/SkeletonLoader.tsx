import React from 'react';

/**
 * SkeletonLoader
 * Centralized loading skeleton library with multiple variants
 */

interface SkeletonLoaderProps {
  /** Skeleton variant type */
  variant?: 'pulse' | 'card' | 'stat' | 'list' | 'table' | 'stats-grid' | 'tasks' | 'countdown';
  /** Additional className */
  className?: string;
  /** Number of items for list/table variants */
  count?: number;
  /** Custom children for card variant */
  children?: React.ReactNode;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'pulse',
  className = '',
  count = 3,
  children,
}) => {
  switch (variant) {
    case 'pulse':
      return <SkeletonPulse className={className} />;

    case 'card':
      return <CardSkeleton>{children}</CardSkeleton>;

    case 'stat':
      return <StatSkeleton />;

    case 'list':
      return <ListSkeleton count={count} />;

    case 'table':
      return <TableSkeleton count={count} />;

    case 'stats-grid':
      return <StatsGridSkeleton />;

    case 'tasks':
      return <TasksSkeleton count={count} />;

    case 'countdown':
      return <CountdownSkeleton />;

    default:
      return <SkeletonPulse className={className} />;
  }
};

// Base pulse component
const SkeletonPulse: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// Card wrapper skeleton
const CardSkeleton: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className="bg-white rounded-lg border border-tier-border-subtle p-5 shadow-sm">
    {children}
  </div>
);

// Single stat skeleton
const StatSkeleton: React.FC = () => (
  <div className="text-center p-3 bg-gray-100 rounded-lg">
    <SkeletonPulse className="h-8 w-12 mx-auto mb-2" />
    <SkeletonPulse className="h-3 w-16 mx-auto" />
  </div>
);

// List skeleton
const ListSkeleton: React.FC<{ count: number }> = ({ count }) => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="flex flex-col gap-1">
        <SkeletonPulse className="h-4 w-3/4 mb-1" />
        <SkeletonPulse className="h-3 w-1/2" />
      </div>
    ))}
  </div>
);

// Table skeleton
const TableSkeleton: React.FC<{ count: number }> = ({ count }) => (
  <div className="flex flex-col gap-2">
    {/* Header */}
    <div className="flex gap-4 pb-2 border-b border-tier-border-subtle">
      <SkeletonPulse className="h-4 w-20" />
      <SkeletonPulse className="h-4 w-24" />
      <SkeletonPulse className="h-4 w-16" />
    </div>
    {/* Rows */}
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="flex gap-4 py-2">
        <SkeletonPulse className="h-3 w-24" />
        <SkeletonPulse className="h-3 w-32" />
        <SkeletonPulse className="h-3 w-20" />
      </div>
    ))}
  </div>
);

// Stats grid skeleton (3 stats in a row)
const StatsGridSkeleton: React.FC = () => (
  <CardSkeleton>
    <SkeletonPulse className="h-5 w-32 mb-4" />
    <div className="grid grid-cols-3 gap-4 mb-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="text-center p-3 bg-gray-100 rounded-lg">
          <SkeletonPulse className="h-8 w-12 mx-auto mb-2" />
          <SkeletonPulse className="h-3 w-16 mx-auto" />
        </div>
      ))}
    </div>
    <div className="flex flex-col gap-3">
      <SkeletonPulse className="h-2 w-full rounded-full" />
      <SkeletonPulse className="h-2 w-full rounded-full" />
    </div>
  </CardSkeleton>
);

// Tasks skeleton
const TasksSkeleton: React.FC<{ count: number }> = ({ count }) => (
  <CardSkeleton>
    <SkeletonPulse className="h-5 w-28 mb-4" />
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
          <SkeletonPulse className="h-5 w-5 rounded-full" />
          <div className="flex-1">
            <SkeletonPulse className="h-4 w-3/4 mb-1" />
            <SkeletonPulse className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  </CardSkeleton>
);

// Countdown skeleton
const CountdownSkeleton: React.FC = () => (
  <CardSkeleton>
    <div className="flex items-start gap-3">
      <SkeletonPulse className="h-10 w-10 rounded-lg" />
      <div className="flex-1">
        <SkeletonPulse className="h-3 w-20 mb-2" />
        <SkeletonPulse className="h-4 w-32 mb-1" />
        <SkeletonPulse className="h-3 w-24" />
      </div>
      <div className="text-right">
        <SkeletonPulse className="h-8 w-10 mb-1" />
        <SkeletonPulse className="h-3 w-8" />
      </div>
    </div>
  </CardSkeleton>
);

export default SkeletonLoader;
export { SkeletonPulse, CardSkeleton, StatSkeleton, ListSkeleton, TableSkeleton };
