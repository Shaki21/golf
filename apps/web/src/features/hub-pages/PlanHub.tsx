/**
 * Plan Hub Page - Decision-First Dashboard
 *
 * McKinsey-grade operating dashboard that turns goals into weekly actions.
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "What is the most important training decision/action I should take now
 *  to improve performance this week?"
 *
 * INFORMATION ARCHITECTURE (3-layer model):
 * Layer 1 (30%) — Decision Layer: Hero card with next critical action
 * Layer 2 (40%) — Control & Progress: Goals + Load/Readiness
 * Layer 3 (30%) — Operations & Admin: Collapsible sections
 *
 * NON-NEGOTIABLE PRINCIPLES:
 * 1. Decision-first, not feature-first
 * 2. One primary action per screen (single dominant CTA)
 * 3. Progress > status (numbers must have implication)
 * 4. Coach mindset > admin mindset (language & structure)
 * 5. Designed for scale: player + coach roles
 */

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import {
  PlanHeroDecisionCard,
  GoalsControlPanel,
  LoadAndReadinessCard,
  OperationsSection,
} from '../plan/components';
import { usePlanDashboard } from '../plan/hooks/usePlanDashboard';
import { QuickLogModal, useQuickLogModal } from '../../components/modals/QuickLogModal';
import { PAGE_TITLES, ACTION_LABELS, ERROR_MESSAGES } from '../../constants/ui-labels';
import { Button } from '../../components/shadcn/button';
import { Plus } from 'lucide-react';

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
        {ERROR_MESSAGES.couldNotLoadDashboard}
      </h3>
      <p className="text-tier-text-secondary mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 bg-tier-navy text-white rounded-lg hover:bg-tier-navy/90 transition-colors"
      >
        {ACTION_LABELS.tryAgain}
      </button>
    </div>
  );
}

export default function PlanHub() {
  const { user } = useAuth();
  const { data: dashboardData, isLoading, error, refetch } = usePlanDashboard();
  const quickLogModal = useQuickLogModal();

  const userName = user?.firstName || 'Player';

  // Handle quick log completion
  const handleQuickLogComplete = async () => {
    await refetch();
  };

  // Show loading skeletons
  if (isLoading) {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <PageHeader
          title={PAGE_TITLES.plan}
          subtitle="Your training overview"
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
          title={PAGE_TITLES.plan}
          subtitle="Your training overview"
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
        title={PAGE_TITLES.plan}
        subtitle="Your training overview"
        helpText="Focus on the most important action this week. The dashboard automatically prioritizes what you should do now based on your goals, planned sessions, and upcoming tournaments."
      />

      <PageContainer paddingY="lg" background="base">
        {/* Show non-blocking error banner if data loaded from fallback */}
        {error && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{ERROR_MESSAGES.couldNotLoadLiveData}</span>
            <button
              onClick={refetch}
              className="ml-auto text-amber-600 hover:text-amber-800 underline"
            >
              {ACTION_LABELS.tryAgain}
            </button>
          </div>
        )}

        {/* ============================================================
            LAYER 1 — DECISION LAYER (top ~30%)
            Hero card with next critical action and context
            ============================================================ */}
        <section className="mb-8" aria-label="Next action">
          <PlanHeroDecisionCard
            data={dashboardData}
            userName={userName}
          />
        </section>

        {/* ============================================================
            LAYER 2 — CONTROL & PROGRESS (middle ~40%)
            Goals (max 3) + Load & Readiness
            ============================================================ */}
        <section className="mb-8" aria-label="Goals and status">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Goals Panel - at-risk surfaced first */}
            <GoalsControlPanel
              goals={dashboardData.goals}
              showAddGoal={true}
            />

            {/* Load & Readiness */}
            <LoadAndReadinessCard
              loadStats={dashboardData.loadStats}
              tournament={dashboardData.upcomingTournament}
              attentionItems={dashboardData.attentionItems}
              missingLogs={dashboardData.missingLogs}
            />
          </div>
        </section>

        {/* ============================================================
            LAYER 3 — OPERATIONS & ADMIN (bottom ~30%)
            Visually quieter, collapsible sections
            ============================================================ */}
        <section aria-label="Tools and administration">
          {/* Quick Log Button */}
          <div className="mb-6">
            <Button
              onClick={() => quickLogModal.openModal()}
              variant="outline"
              className="gap-2"
            >
              <Plus size={16} />
              {ACTION_LABELS.logSession}
            </Button>
          </div>

          <OperationsSection />
        </section>
      </PageContainer>

      {/* Quick Log Modal */}
      <QuickLogModal
        isOpen={quickLogModal.isOpen}
        onClose={quickLogModal.closeModal}
        onComplete={handleQuickLogComplete}
        {...quickLogModal.config}
      />
    </div>
  );
}
