/**
 * Coach Plan Hub Page - Decision-First Dashboard
 * Design System v3.1 - McKinsey-grade operating dashboard
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "What is the most important coaching decision/action I should take NOW?"
 *
 * INFORMATION ARCHITECTURE (3-layer model):
 * Layer 1 (30%) — Decision Layer: Hero card with next critical action
 * Layer 2 (40%) — Control & Progress: Players needing attention + Team stats
 * Layer 3 (30%) — Operations & Admin: Quick actions and navigation
 */

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import { AlertCircle, RefreshCw } from 'lucide-react';

// Import decision-first dashboard components and hook
import { useCoachPlanDashboard } from '../coach-plan-dashboard/hooks/useCoachPlanDashboard';
import {
  CoachHeroDecisionCard,
  PlayersAttentionPanel,
  TeamLoadCard,
  CoachOperationsSection,
} from '../coach-plan-dashboard/components';

// =============================================================================
// SKELETON LOADERS
// =============================================================================

function HeroSkeleton() {
  return (
    <div className="rounded-2xl bg-tier-navy p-6 md:p-8 animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-6 w-32 bg-white/10 rounded" />
        <div className="h-6 w-24 bg-white/10 rounded-full" />
      </div>
      <div className="bg-white/10 rounded-xl p-5 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/10" />
          <div className="flex-1">
            <div className="h-4 w-24 bg-white/10 rounded mb-2" />
            <div className="h-6 w-48 bg-white/10 rounded mb-2" />
            <div className="h-4 w-64 bg-white/10 rounded" />
          </div>
          <div className="h-12 w-32 bg-white/10 rounded-xl" />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="h-4 w-24 bg-white/10 rounded" />
        <div className="h-4 w-24 bg-white/10 rounded" />
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
      <div className="h-6 w-40 bg-tier-surface-secondary rounded mb-4" />
      <div className="space-y-3">
        <div className="h-16 w-full bg-tier-surface-secondary rounded" />
        <div className="h-16 w-full bg-tier-surface-secondary rounded" />
        <div className="h-16 w-full bg-tier-surface-secondary rounded" />
      </div>
    </div>
  );
}

// =============================================================================
// ERROR STATE
// =============================================================================

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-xl bg-red-50 border border-red-200 p-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-1">
            Could not load dashboard
          </h3>
          <p className="text-red-700 text-sm mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CoachPlanHub() {
  const { user } = useAuth();
  const coachName = user?.firstName || 'Coach';

  // Fetch dashboard data from API
  const { data, isLoading, error, refetch } = useCoachPlanDashboard();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <PageHeader
          title="Plan"
          subtitle="Coaching dashboard and team management"
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

  return (
    <div className="min-h-screen bg-tier-surface-base">
      {/* Compact header */}
      <PageHeader
        title="Plan"
        subtitle="Coaching dashboard and team management"
        helpText="Your decision-first dashboard. See what needs attention, review player progress, and manage your coaching schedule."
      />

      <PageContainer paddingY="lg" background="base">
        {/* Error state (with fallback data still shown) */}
        {error && (
          <div className="mb-6">
            <ErrorState error={error} onRetry={refetch} />
          </div>
        )}

        {/* ============================================================
            LAYER 1 — DECISION LAYER (top ~30%)
            Hero card with next critical action
            ============================================================ */}
        <section className="mb-8" aria-label="Next action">
          <CoachHeroDecisionCard data={data} coachName={coachName} />
        </section>

        {/* ============================================================
            LAYER 2 — CONTROL & PROGRESS (middle ~40%)
            Players needing attention + Team load stats
            ============================================================ */}
        <section className="mb-8" aria-label="Team status">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Players needing attention */}
            <PlayersAttentionPanel players={data.playersNeedingAttention} />

            {/* Team load stats and tournaments */}
            <TeamLoadCard
              loadStats={data.teamLoadStats}
              tournaments={data.upcomingTournaments}
              attentionItems={data.attentionItems}
            />
          </div>
        </section>

        {/* ============================================================
            LAYER 3 — OPERATIONS & ADMIN (bottom ~30%)
            Quick actions and navigation
            ============================================================ */}
        <section aria-label="Tools and administration">
          <CoachOperationsSection />
        </section>
      </PageContainer>
    </div>
  );
}
