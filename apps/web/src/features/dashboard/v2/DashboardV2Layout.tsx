/**
 * DashboardV2Layout
 * Design System v3.1 - Tailwind CSS
 *
 * Premium dashboard layout component with strict 12-column grid system.
 * Follows Apple/Stripe design principles: precision, restraint, clarity.
 *
 * LAYOUT SPEC:
 * - Mobile (0-767px): Single column, card-for-card rhythm
 * - Tablet (768-1023px): 8-column grid, 2-col sections
 * - Desktop (1024px+): 12-column grid, asymmetric hero/stats split
 *
 * GRID STRUCTURE (Desktop):
 * Row 1: Hero (col-span-7) | Stats Grid (col-span-5)
 * Row 2: Next Up (col-span-7) | Daily Plan (col-span-5)
 * Row 3: Strokes Gained (col-span-7) | Activity Feed (col-span-5)
 */

import React from 'react';

interface DashboardV2LayoutProps {
  /** Header component (greeting, profile summary) */
  header: React.ReactNode;
  /** Hero card component (primary focus/priority) */
  hero: React.ReactNode;
  /** Stats grid component (2x2 metric cards) */
  statsGrid: React.ReactNode;
  /** Next up section (tournament + test countdowns) */
  nextUp: React.ReactNode;
  /** Daily plan/schedule component */
  dailyPlan: React.ReactNode;
  /** Strokes gained visualization */
  strokesGained: React.ReactNode;
  /** Activity feed component */
  activityFeed: React.ReactNode;
  /** Additional className */
  className?: string;
}

const DashboardV2Layout: React.FC<DashboardV2LayoutProps> = ({
  header,
  hero,
  statsGrid,
  nextUp,
  dailyPlan,
  strokesGained,
  activityFeed,
  className = '',
}) => {
  return (
    <div
      className={`min-h-screen bg-tier-surface-base ${className}`}
      style={{ paddingBottom: 'calc(56px + var(--safe-area-inset-bottom))' }}
    >
      {/* Header - Full width on all breakpoints */}
      <header
        className="p-4"
        style={{ paddingTop: 'calc(var(--safe-area-inset-top) + 1rem)' }}
      >
        {header}
      </header>

      {/* Main Dashboard Grid */}
      <main className="p-4 pt-0 flex flex-col gap-5">
        {/* Row 1: Hero + Stats */}
        <section className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-[7fr_5fr] lg:gap-6">
          <div>{hero}</div>
          <div>{statsGrid}</div>
        </section>

        {/* Row 2: Next Up + Daily Plan */}
        <section className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-[7fr_5fr] lg:gap-6">
          <div>{nextUp}</div>
          <div>{dailyPlan}</div>
        </section>

        {/* Row 3: Strokes Gained + Activity */}
        <section className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-[7fr_5fr] lg:gap-6">
          <div>{strokesGained}</div>
          <div>{activityFeed}</div>
        </section>
      </main>
    </div>
  );
};

export default DashboardV2Layout;
