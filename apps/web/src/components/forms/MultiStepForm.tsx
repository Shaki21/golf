/**
 * ============================================================
 * MultiStepForm - Progressive Disclosure Form Component
 * TIER Golf Design System v3.1
 * ============================================================
 *
 * Bryter ned komplekse skjemaer i håndterbare steg.
 * Reduserer kognitiv belastning og forbedrer fullføringsrate.
 *
 * Funksjoner:
 * - Visuell fremdriftsindikator
 * - Steg-validering før navigering
 * - Auto-lagring mellom steg
 * - Tilbake/Neste navigering
 * - Keyboard navigering (Enter for neste)
 *
 * ============================================================
 */

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Check, ChevronLeft, ChevronRight, Circle } from 'lucide-react';
import { Button } from '../shadcn/button';
import { SectionTitle } from '../typography/Headings';

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  isValid?: () => boolean;
  isOptional?: boolean;
}

export interface MultiStepFormProps {
  steps: FormStep[];
  children: React.ReactNode[];
  onComplete: () => void;
  onStepChange?: (step: number) => void;
  className?: string;
  showProgressBar?: boolean;
  showStepIndicator?: boolean;
  allowSkipOptional?: boolean;
  submitLabel?: string;
  submitLoadingLabel?: string;
  isSubmitting?: boolean;
}

export function MultiStepForm({
  steps,
  children,
  onComplete,
  onStepChange,
  className,
  showProgressBar = true,
  showStepIndicator = true,
  allowSkipOptional = true,
  submitLabel = 'Fullfør',
  submitLoadingLabel = 'Sender...',
  isSubmitting = false,
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const currentStepData = steps[currentStep];
  const canProceed = currentStepData?.isValid?.() ?? true;

  const goToStep = useCallback(
    (step: number) => {
      if (step < 0 || step >= totalSteps) return;

      // Kan ikke hoppe forover uten å fullføre nåværende steg
      if (step > currentStep && !canProceed) return;

      // Marker nåværende steg som fullført hvis vi går videre
      if (step > currentStep) {
        setCompletedSteps((prev) => new Set(prev).add(currentStep));
      }

      setCurrentStep(step);
      onStepChange?.(step);
    },
    [currentStep, totalSteps, canProceed, onStepChange]
  );

  const goNext = useCallback(() => {
    if (isLastStep) {
      onComplete();
    } else {
      goToStep(currentStep + 1);
    }
  }, [isLastStep, currentStep, goToStep, onComplete]);

  const goBack = useCallback(() => {
    goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  const skipStep = useCallback(() => {
    if (currentStepData?.isOptional && allowSkipOptional) {
      goToStep(currentStep + 1);
    }
  }, [currentStep, currentStepData, allowSkipOptional, goToStep]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && canProceed) {
        e.preventDefault();
        goNext();
      }
    },
    [canProceed, goNext]
  );

  return (
    <div className={cn('w-full', className)} onKeyDown={handleKeyDown}>
      {/* Progress Bar */}
      {showProgressBar && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-tier-text-secondary mb-2">
            <span>
              Steg {currentStep + 1} av {totalSteps}
            </span>
            <span>{Math.round(progress)}% fullført</span>
          </div>
          <div className="h-2 bg-tier-surface-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-tier-gold transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Step Indicator */}
      {showStepIndicator && (
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={goToStep}
        />
      )}

      {/* Step Header */}
      <div className="mb-6">
        <SectionTitle className="text-xl font-bold text-tier-navy flex items-center gap-3" style={{ marginBottom: 0 }}>
          {currentStepData?.icon}
          {currentStepData?.title}
          {currentStepData?.isOptional && (
            <span className="text-sm font-normal text-tier-text-tertiary">
              (valgfritt)
            </span>
          )}
        </SectionTitle>
        {currentStepData?.description && (
          <p className="text-tier-text-secondary mt-1">
            {currentStepData.description}
          </p>
        )}
      </div>

      {/* Step Content */}
      <div className="min-h-[200px]">{children[currentStep]}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-tier-border-subtle">
        <div>
          {!isFirstStep && (
            <Button
              variant="outline"
              onClick={goBack}
              disabled={isSubmitting}
              className="gap-2"
            >
              <ChevronLeft size={16} />
              Tilbake
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          {currentStepData?.isOptional && allowSkipOptional && !isLastStep && (
            <Button
              variant="ghost"
              onClick={skipStep}
              disabled={isSubmitting}
            >
              Hopp over
            </Button>
          )}

          <Button
            variant="default"
            onClick={goNext}
            disabled={!canProceed || isSubmitting}
            className="gap-2"
          >
            {isLastStep ? (
              isSubmitting ? (
                submitLoadingLabel
              ) : (
                submitLabel
              )
            ) : (
              <>
                Neste
                <ChevronRight size={16} />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STEP INDICATOR COMPONENT
// ═══════════════════════════════════════════════════════════

interface StepIndicatorProps {
  steps: FormStep[];
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
}

function StepIndicator({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <nav className="mb-8" aria-label="Skjema-fremgang">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(index);
          const isCurrent = index === currentStep;
          const isClickable = index < currentStep || isCompleted;

          return (
            <li
              key={step.id}
              className={cn('flex items-center', index < steps.length - 1 && 'flex-1')}
            >
              <button
                type="button"
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable && index > currentStep}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-tier-gold/50',
                  isClickable && 'cursor-pointer hover:bg-tier-surface-secondary',
                  !isClickable && index > currentStep && 'cursor-not-allowed opacity-50'
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {/* Step Number/Icon */}
                <span
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all duration-200',
                    isCompleted && 'bg-status-success text-tier-white',
                    isCurrent && !isCompleted && 'bg-tier-gold text-tier-white',
                    !isCurrent &&
                      !isCompleted &&
                      'bg-tier-surface-secondary text-tier-text-tertiary border border-tier-border-subtle'
                  )}
                >
                  {isCompleted ? (
                    <Check size={16} />
                  ) : (
                    index + 1
                  )}
                </span>

                {/* Step Title (desktop only) */}
                <span
                  className={cn(
                    'hidden sm:block text-sm font-medium transition-colors duration-200',
                    isCurrent && 'text-tier-navy',
                    isCompleted && 'text-status-success',
                    !isCurrent && !isCompleted && 'text-tier-text-tertiary'
                  )}
                >
                  {step.title}
                </span>
              </button>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 transition-colors duration-300',
                    isCompleted ? 'bg-status-success' : 'bg-tier-border-subtle'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════
// FORM STEP WRAPPER (for bedre semantikk)
// ═══════════════════════════════════════════════════════════

interface FormStepContentProps {
  children: React.ReactNode;
  className?: string;
}

export function FormStepContent({ children, className }: FormStepContentProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FORM FIELD GROUP (for organisering)
// ═══════════════════════════════════════════════════════════

interface FormFieldGroupProps {
  label?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormFieldGroup({
  label,
  description,
  children,
  className,
}: FormFieldGroupProps) {
  return (
    <fieldset className={cn('space-y-3', className)}>
      {label && (
        <legend className="text-sm font-semibold text-tier-navy">{label}</legend>
      )}
      {description && (
        <p className="text-sm text-tier-text-secondary">{description}</p>
      )}
      <div className="space-y-3">{children}</div>
    </fieldset>
  );
}

export default MultiStepForm;
