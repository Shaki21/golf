/**
 * Skeleton Component Library - TIER Design System
 * All skeletons use tier color tokens with opacity for consistent loading states
 */

import React from 'react';
import { Skeleton } from '../shadcn/skeleton';

/**
 * Card Skeleton - For card-based layouts
 */
export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="bg-tier-white rounded-xl p-6 border border-tier-navy/10 shadow-sm">
      <div className="space-y-3">
        <Skeleton className="h-5 w-3/4" />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * Stats Card Skeleton - For dashboard stat cards
 */
export function StatsCardSkeleton() {
  return (
    <div className="bg-tier-white rounded-lg p-4 border border-tier-navy/10">
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

/**
 * List Item Skeleton - For list views
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-tier-white border border-tier-navy/10 rounded-lg">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

/**
 * Table Skeleton - For table views
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-tier-white rounded-xl border border-tier-navy/10 overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 p-4 bg-tier-navy/5 border-b border-tier-navy/10">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-4 border-b border-tier-navy/10 last:border-b-0">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Dashboard Skeleton - For full dashboard layouts
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton rows={4} />
        <CardSkeleton rows={4} />
      </div>
    </div>
  );
}

/**
 * Hub Page Skeleton - For hub landing pages
 */
export function HubPageSkeleton() {
  return (
    <div className="min-h-screen bg-tier-surface-base">
      {/* Header */}
      <div className="bg-gradient-to-br from-tier-navy to-tier-navy/90 text-white p-8">
        <Skeleton className="h-10 w-48 mb-3 bg-tier-white/20" />
        <Skeleton className="h-5 w-96 bg-tier-white/20" />
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton rows={2} />
          <CardSkeleton rows={2} />
          <CardSkeleton rows={2} />
        </div>
      </div>
    </div>
  );
}

/**
 * List Page Skeleton - For list-based pages (athletes, groups, etc.)
 */
export function ListPageSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* List Items */}
      <div className="space-y-3">
        {Array.from({ length: items }).map((_, i) => (
          <ListItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Form Skeleton - For form pages
 */
export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div className="bg-tier-white rounded-xl p-6 border border-tier-navy/10 shadow-sm space-y-6">
      <Skeleton className="h-8 w-64" />

      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}

      <div className="flex gap-3 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

/**
 * Calendar Skeleton - For calendar views
 */
export function CalendarSkeleton() {
  return (
    <div className="bg-tier-white rounded-xl p-6 border border-tier-navy/10">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * Shimmer Effect - Enhanced shimmer with tier colors
 */
export const shimmerStyles = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  .skeleton-shimmer {
    background: linear-gradient(
      90deg,
      rgb(var(--tier-navy-rgb) / 0.05) 0%,
      rgb(var(--tier-gold-rgb) / 0.1) 50%,
      rgb(var(--tier-navy-rgb) / 0.05) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }
`;
