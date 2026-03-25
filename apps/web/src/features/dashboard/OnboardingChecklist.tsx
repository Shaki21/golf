/**
 * OnboardingChecklist - First-time user setup guide
 *
 * Shows a checklist of recommended setup steps for new users.
 * Tracks completion status and allows dismissal.
 *
 * WCAG AA Compliant:
 * - Keyboard navigable
 * - Screen reader friendly
 * - Sufficient color contrast
 * - 44px minimum touch targets
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 * (except dynamic progress width which requires runtime value)
 */

import React, { memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  User,
  Target,
  Calendar,
  Trophy,
  CheckCircle2,
  Circle,
  ChevronRight,
  X,
  LucideIcon,
} from 'lucide-react';
import Button from '../../ui/primitives/Button';
import { SectionTitle } from '../../components/typography/Headings';

// ============================================================================
// TYPES
// ============================================================================

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  route: string;
  checkKey: string;
  optional?: boolean;
}

interface StepItemProps {
  step: OnboardingStep;
  isCompleted: boolean;
  onNavigate: (route: string) => void;
}

interface OnboardingChecklistProps {
  completionStatus?: Record<string, boolean>;
  onDismiss?: () => void;
  showDismissButton?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Onboarding steps configuration - defined outside component
const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'profile',
    title: 'Complete your profile',
    description: 'Add photo and contact information',
    icon: User,
    route: '/profil/rediger',
    checkKey: 'profileComplete',
  },
  {
    id: 'goal',
    title: 'Set your first goal',
    description: 'Define what you want to achieve this week',
    icon: Target,
    route: '/maalsetninger/new',
    checkKey: 'hasGoals',
  },
  {
    id: 'session',
    title: 'Schedule a training session',
    description: 'Book your first session with the coach',
    icon: Calendar,
    route: '/sessions/new',
    checkKey: 'hasScheduledSession',
  },
  {
    id: 'tournament',
    title: 'Register for a tournament',
    description: 'Find upcoming tournaments in your region',
    icon: Trophy,
    route: '/tournaments',
    checkKey: 'hasUpcomingTournament',
    optional: true,
  },
];

// ============================================================================
// STEP ITEM COMPONENT
// ============================================================================

const StepItem = memo(({ step, isCompleted, onNavigate }: StepItemProps) => {
  const Icon = step.icon;

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onNavigate(step.route);
    }
  }, [onNavigate, step.route]);

  return (
    <button
      className={`w-full flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors min-h-[72px] border-none bg-transparent text-left hover:bg-tier-surface-base ${
        isCompleted ? 'opacity-70' : ''
      }`}
      onClick={() => onNavigate(step.route)}
      onKeyDown={handleKeyDown}
      aria-label={`${step.title}${isCompleted ? ' (completed)' : ''}`}
      role="listitem"
    >
      {/* Completion checkbox */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
          isCompleted
            ? 'bg-tier-success text-white border-none'
            : 'bg-transparent text-tier-text-tertiary border-2 border-tier-border-default'
        }`}
        aria-hidden="true"
      >
        {isCompleted ? (
          <CheckCircle2 size={18} />
        ) : (
          <Circle size={14} />
        )}
      </div>

      {/* Step icon */}
      <div
        className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 ${
          isCompleted
            ? 'bg-tier-success/10 text-tier-success'
            : 'bg-tier-navy/10 text-tier-navy'
        }`}
        aria-hidden="true"
      >
        <Icon size={20} />
      </div>

      {/* Step content */}
      <div className="flex-1 min-w-0">
        <div className={`text-[15px] font-semibold text-tier-navy mb-0.5 ${isCompleted ? 'line-through text-tier-text-tertiary' : ''}`}>
          {step.title}
          {step.optional && (
            <span className="ml-2 text-[11px] font-medium text-tier-text-tertiary bg-tier-surface-base px-2 py-0.5 rounded">
              Optional
            </span>
          )}
        </div>
        <div className="text-[13px] text-tier-text-secondary">
          {step.description}
        </div>
      </div>

      {/* Arrow */}
      {!isCompleted && (
        <ChevronRight size={20} className="text-tier-text-tertiary flex-shrink-0" aria-hidden="true" />
      )}
    </button>
  );
});

StepItem.displayName = 'StepItem';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const OnboardingChecklist = memo(({
  completionStatus = {},
  onDismiss,
  showDismissButton = true,
}: OnboardingChecklistProps) => {
  const navigate = useNavigate();

  // Calculate completion progress
  const { completedCount, requiredCount, progressPercent } = useMemo(() => {
    const requiredSteps = ONBOARDING_STEPS.filter(s => !s.optional);
    const completed = requiredSteps.filter(s => completionStatus[s.checkKey]).length;
    const percent = requiredSteps.length > 0
      ? Math.round((completed / requiredSteps.length) * 100)
      : 0;

    return {
      completedCount: completed,
      requiredCount: requiredSteps.length,
      progressPercent: percent,
    };
  }, [completionStatus]);

  // Memoized navigation handler
  const handleNavigate = useCallback((route: string) => {
    navigate(route);
  }, [navigate]);

  // Keyboard handler for dismiss button
  const handleDismissKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onDismiss?.();
    }
  }, [onDismiss]);

  // All required steps completed?
  const allRequiredComplete = progressPercent === 100;

  return (
    <div
      className="bg-tier-white rounded-2xl border border-tier-border-default shadow-sm overflow-hidden"
      role="region"
      aria-label="Get started with TIER Golf"
    >
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-5 pb-4 border-b border-tier-border-default bg-tier-navy/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-tier-navy flex items-center justify-center text-white" aria-hidden="true">
            <Sparkles size={22} />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-tier-navy uppercase tracking-wider mb-0.5">
              Welcome!
            </div>
            <SectionTitle className="text-lg font-bold text-tier-navy m-0 p-0">Get started</SectionTitle>
          </div>
        </div>

        {showDismissButton && (
          <button
            className="bg-transparent border-none p-2 cursor-pointer text-tier-text-tertiary rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors hover:bg-tier-surface-base"
            onClick={onDismiss}
            onKeyDown={handleDismissKeyDown}
            aria-label="Close getting started guide"
          >
            <X size={20} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="px-6 py-3 border-b border-tier-border-default bg-tier-surface-base">
        <div className="h-2 bg-gray-200 rounded overflow-hidden mb-2">
          <div
            className="h-full bg-tier-success rounded transition-[width] duration-300"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progress: ${progressPercent}%`}
          />
        </div>
        <div className="text-[13px] text-tier-text-secondary font-medium">
          {allRequiredComplete
            ? 'All set! You are ready to begin.'
            : `${completedCount} of ${requiredCount} steps completed`}
        </div>
      </div>

      {/* Steps list */}
      <div className="py-2" role="list" aria-label="Setup steps">
        {ONBOARDING_STEPS.map((step) => (
          <StepItem
            key={step.id}
            step={step}
            isCompleted={!!completionStatus[step.checkKey]}
            onNavigate={handleNavigate}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-tier-border-default bg-tier-surface-base flex justify-between items-center">
        <button
          className="text-[13px] text-tier-text-tertiary bg-none border-none cursor-pointer px-3 py-2 min-h-[44px] flex items-center hover:text-tier-text-secondary"
          onClick={onDismiss}
          onKeyDown={handleDismissKeyDown}
          aria-label="Skip guide and go to dashboard"
        >
          Skip for now
        </button>

        {allRequiredComplete && (
          <Button
            variant="primary"
            size="sm"
            onClick={onDismiss}
            aria-label="Complete setup and close guide"
          >
            Done!
          </Button>
        )}
      </div>
    </div>
  );
});

OnboardingChecklist.displayName = 'OnboardingChecklist';

export default OnboardingChecklist;
