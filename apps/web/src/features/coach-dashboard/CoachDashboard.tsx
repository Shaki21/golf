/**
 * CoachDashboard.tsx
 * Design System v3.1 - Decision-First Dashboard
 * Build: 2026-01-12-v1
 *
 * McKinsey-grade operating dashboard for coaches.
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "What is the most important coaching decision/action I should take NOW
 *  to help my athletes improve?"
 *
 * INFORMATION ARCHITECTURE (3-layer model):
 * Layer 1 (30%) — Decision Layer: Hero card with next critical action
 * Layer 2 (40%) — Control & Progress: Players needing attention + Team load
 * Layer 3 (30%) — Operations & Admin: Collapsible sections
 */

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import {
  CoachHeroDecisionCard,
  PlayersAttentionPanel,
  TeamLoadCard,
  CoachOperationsSection,
} from '../coach-plan-dashboard/components';
import { useCoachPlanDashboard } from '../coach-plan-dashboard/hooks/useCoachPlanDashboard';
import { Button } from '../../components/shadcn/button';

/**
 * Skeleton loader for the hero decision card
 */
function HeroSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-8 w-48 bg-tier-surface-secondary rounded" />
        <div className="h-6 w-24 bg-tier-surface-secondary rounded-full" />
      </div>
      <div className="h-12 w-64 bg-tier-surface-secondary rounded mb-4" />
      <div className="h-5 w-80 bg-tier-surface-secondary rounded mb-6" />
      <div className="h-12 w-40 bg-tier-surface-secondary rounded-lg" />
    </div>
  );
}

/**
 * Skeleton loader for cards in the control layer
 */
function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
      <div className="h-6 w-32 bg-tier-surface-secondary rounded mb-4" />
      <div className="space-y-3">
        <div className="h-16 w-full bg-tier-surface-secondary rounded" />
        <div className="h-16 w-full bg-tier-surface-secondary rounded" />
        <div className="h-16 w-full bg-tier-surface-secondary rounded" />
      </div>
    </div>
  );
}

/**
 * Error state component
 */
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-tier-text-primary mb-2">
        Could not load dashboard
      </h3>
      <p className="text-tier-text-secondary mb-6">{message}</p>
      <Button onClick={onRetry}>Try again</Button>
    </div>
  );
}

export default function CoachDashboard() {
  const { user } = useAuth();
  const { data: dashboardData, isLoading, error, refetch } = useCoachPlanDashboard();

  const coachName = user?.firstName || 'Coach';

  // Show loading skeletons
  if (isLoading) {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <PageHeader
          title="Dashboard"
          subtitle="Your coaching overview"
        />
        <PageContainer paddingY="lg" background="base">
          <section className="mb-8">
            <HeroSkeleton />
          </section>
          <section className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </section>
        </PageContainer>
      </div>
    );
  }

  // Show error state (but we still have fallback data)
  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <PageHeader
          title="Dashboard"
          subtitle="Your coaching overview"
        />
        <PageContainer paddingY="lg" background="base">
          <ErrorState message={error} onRetry={refetch} />
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-surface-base">
      {/* Compact header - less prominent than decision card */}
      <PageHeader
        title="Dashboard"
        subtitle="Your coaching overview"
        helpText="Focus on the most important coaching action this week. The dashboard automatically prioritizes what you should do now based on your players, sessions, and upcoming tournaments."
      />

      <PageContainer paddingY="lg" background="base">
        {/* Show non-blocking error banner if data loaded from fallback */}
        {error && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Could not load live data. Using cached data.</span>
            <button
              onClick={refetch}
              className="ml-auto text-amber-600 hover:text-amber-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* ============================================================
            LAYER 1 — DECISION LAYER (top ~30%)
            Hero card with next critical action and context
            ============================================================ */}
        <section className="mb-8" aria-label="Next action">
          <CoachHeroDecisionCard
            data={dashboardData}
            coachName={coachName}
          />
        </section>

        {/* ============================================================
            LAYER 2 — CONTROL & PROGRESS (middle ~40%)
            Players needing attention + Team load stats
            ============================================================ */}
        <section className="mb-8" aria-label="Players and status">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Players Needing Attention */}
            <PlayersAttentionPanel
              players={dashboardData.playersNeedingAttention}
            />

            {/* Team Load & Readiness */}
            <TeamLoadCard
              loadStats={dashboardData.teamLoadStats}
              tournaments={dashboardData.upcomingTournaments}
              attentionItems={dashboardData.attentionItems}
            />
          </div>
        </section>

        {/* ============================================================
            LAYER 3 — OPERATIONS & ADMIN (bottom ~30%)
            Visually quieter, collapsible sections
            ============================================================ */}
        <section aria-label="Tools and administration">
          <CoachOperationsSection />
        </section>
      </PageContainer>
    </div>
  );
}
