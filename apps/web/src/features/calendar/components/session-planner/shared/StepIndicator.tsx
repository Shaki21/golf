/**
 * StepIndicator Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles
 *
 * Visual progress indicator for the session planner wizard.
 * Shows current step, completed steps, and remaining steps.
 */

import React from 'react';
import { Check } from 'lucide-react';
import type { WizardStep } from '../hooks';

interface StepIndicatorProps {
  steps: WizardStep[];
  currentStep: WizardStep;
  currentStepIndex: number;
  isStepComplete: (step: WizardStep) => boolean;
  onStepClick?: (step: WizardStep) => void;
}

const STEP_LABELS: Record<WizardStep, string> = {
  pyramid: 'Nivå',
  area: 'Område',
  lphase: 'Fase',
  context: 'Kontekst',
  focus: 'Fokus',
  summary: 'Oppsummering',
};

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  currentStepIndex,
  isStepComplete,
  onStepClick,
}) => {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-3">
      {steps.map((step, index) => {
        const isActive = step === currentStep;
        const isCompleted = index < currentStepIndex || (index === currentStepIndex && isStepComplete(step));
        const isPast = index < currentStepIndex;
        const isClickable = isPast && onStepClick;

        return (
          <React.Fragment key={step}>
            {/* Step circle */}
            <button
              type="button"
              onClick={() => isClickable && onStepClick(step)}
              disabled={!isClickable}
              className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                transition-all duration-200 border-2
                ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                ${isActive
                  ? 'bg-tier-navy text-white border-tier-navy'
                  : isCompleted
                  ? 'bg-tier-success text-white border-tier-success'
                  : 'bg-tier-surface-base text-tier-text-tertiary border-tier-border-default'
                }
              `}
              title={STEP_LABELS[step]}
            >
              {isCompleted && !isActive ? (
                <Check size={16} />
              ) : (
                index + 1
              )}
            </button>

            {/* Connector line (not after last step) */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 max-w-8 ${
                  index < currentStepIndex ? 'bg-tier-success' : 'bg-tier-border-default'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/**
 * Compact step indicator for mobile
 */
export const StepIndicatorCompact: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  currentStepIndex,
}) => {
  return (
    <div className="flex items-center justify-center gap-1 px-4 py-2">
      {steps.map((step, index) => {
        const isActive = step === currentStep;
        const isPast = index < currentStepIndex;

        return (
          <div
            key={step}
            className={`h-1.5 rounded-full transition-all duration-200 ${
              isActive ? 'w-6' : 'w-1.5'
            } ${
              isActive
                ? 'bg-tier-navy'
                : isPast
                ? 'bg-tier-success'
                : 'bg-tier-border-default'
            }`}
          />
        );
      })}
    </div>
  );
};

/**
 * Step indicator with labels
 */
export const StepIndicatorWithLabels: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  currentStepIndex,
  isStepComplete,
  onStepClick,
}) => {
  return (
    <div className="px-4 py-3">
      {/* Progress bar */}
      <div className="relative mb-2">
        {/* Background track */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-tier-border-default" />

        {/* Progress fill - needs inline style for dynamic width */}
        <div
          className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 transition-all duration-300 bg-tier-navy"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        />

        {/* Step dots */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isActive = step === currentStep;
            const isCompleted = index < currentStepIndex;
            const isPast = index < currentStepIndex;
            const isClickable = isPast && onStepClick;

            return (
              <button
                key={step}
                type="button"
                onClick={() => isClickable && onStepClick(step)}
                disabled={!isClickable}
                className={`
                  flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium
                  transition-all duration-200 border-2
                  ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                  ${isActive || isCompleted
                    ? 'bg-tier-navy text-white border-tier-navy'
                    : 'bg-white text-tier-text-tertiary border-tier-border-default'
                  }
                `}
              >
                {isCompleted ? <Check size={12} /> : index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Labels - need inline style for dynamic width */}
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isActive = step === currentStep;

          return (
            <span
              key={step}
              className={`text-xs text-center ${
                isActive ? 'text-tier-navy font-semibold' : 'text-tier-text-tertiary'
              }`}
              style={{ width: `${100 / steps.length}%` }}
            >
              {STEP_LABELS[step]}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
