/**
 * SessionPlannerModal Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 *
 * Main container for the TIER training formula session planner wizard.
 * Manages step navigation and renders appropriate step components.
 */

import React, { useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSessionPlanner, type WizardStep } from './hooks';
import { StepIndicatorWithLabels } from './shared';
import {
  PyramidStep,
  AreaStep,
  LPhaseStep,
  ContextStep,
  FocusStep,
  SummaryStep,
} from './steps';
import { SectionTitle } from '../../../../components/typography';

export interface NewPlannedSession {
  formula: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  duration: number;
}

interface SessionPlannerModalProps {
  isOpen: boolean;
  initialDate?: Date;
  initialTime?: string;
  onClose: () => void;
  onSubmit: (session: NewPlannedSession) => void;
}

export const SessionPlannerModal: React.FC<SessionPlannerModalProps> = ({
  isOpen,
  initialDate,
  initialTime,
  onClose,
  onSubmit,
}) => {
  const planner = useSessionPlanner(initialDate);

  // Set initial time if provided
  React.useEffect(() => {
    if (initialTime) {
      planner.setStartTime(initialTime);
    }
  }, [initialTime]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (!planner.parsedFormula) return;

    onSubmit({
      formula: planner.parsedFormula.formula,
      title: planner.parsedFormula.title,
      description: planner.parsedFormula.description,
      date: planner.formState.date,
      startTime: planner.formState.startTime,
      duration: planner.formState.duration,
    });

    planner.reset();
    onClose();
  }, [planner, onSubmit, onClose]);

  // Handle close with reset
  const handleClose = useCallback(() => {
    planner.reset();
    onClose();
  }, [planner, onClose]);

  // Render step content
  const renderStep = (step: WizardStep) => {
    switch (step) {
      case 'pyramid':
        return <PyramidStep planner={planner} />;
      case 'area':
        return <AreaStep planner={planner} />;
      case 'lphase':
        return <LPhaseStep planner={planner} />;
      case 'context':
        return <ContextStep planner={planner} />;
      case 'focus':
        return <FocusStep planner={planner} />;
      case 'summary':
        return <SummaryStep planner={planner} />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const isSummaryStep = planner.currentStep === 'summary';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-lg max-h-[90vh] rounded-xl overflow-hidden flex flex-col bg-tier-white shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-tier-border-default shrink-0">
            <SectionTitle className="text-lg font-semibold text-tier-navy">
              Plan session
            </SectionTitle>
            <button
              onClick={handleClose}
              className="p-1 rounded-lg transition-colors text-tier-text-tertiary hover:bg-tier-surface-base"
            >
              <X size={20} />
            </button>
          </div>

          {/* Step indicator */}
          <div className="shrink-0 border-b border-tier-border-default">
            <StepIndicatorWithLabels
              steps={planner.steps}
              currentStep={planner.currentStep}
              currentStepIndex={planner.currentStepIndex}
              isStepComplete={planner.isStepComplete}
              onStepClick={planner.goToStep}
            />
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-y-auto p-4">
            {renderStep(planner.currentStep)}
          </div>

          {/* Navigation footer */}
          <div className="flex items-center justify-between p-4 border-t border-tier-border-default shrink-0">
            {/* Back button */}
            <button
              type="button"
              onClick={planner.goBack}
              disabled={!planner.canGoBack}
              className="flex items-center gap-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-40 bg-transparent text-tier-text-secondary hover:bg-tier-surface-base"
            >
              <ChevronLeft size={16} />
              Back
            </button>

            {/* Next/Submit button */}
            {isSummaryStep ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!planner.parsedFormula?.isValid}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-40 bg-tier-navy text-white hover:bg-tier-navy/90"
              >
                Create session
              </button>
            ) : (
              <button
                type="button"
                onClick={planner.goNext}
                disabled={!planner.canGoNext}
                className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-40 bg-tier-navy text-white hover:bg-tier-navy/90"
              >
                Next
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SessionPlannerModal;
