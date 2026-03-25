/**
 * Intake Form Stepper
 * Visual progress indicator for multi-step intake form
 */

import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  description: string;
}

interface Props {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick: (stepIndex: number) => void;
  className?: string;
}

const IntakeFormStepper: React.FC<Props> = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-xl border border-tier-border-default p-6 ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = index === currentStep;
          const isAccessible = index <= currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step */}
              <button
                type="button"
                onClick={() => isAccessible && onStepClick(index)}
                disabled={!isAccessible}
                className={`flex flex-col items-center gap-2 transition-all ${
                  isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                }`}
              >
                {/* Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    isCompleted
                      ? 'bg-tier-success text-white'
                      : isCurrent
                        ? 'bg-tier-info text-white'
                        : 'bg-tier-surface-base text-tier-text-secondary border border-tier-border-default'
                  }`}
                >
                  {isCompleted ? <Check size={18} /> : index + 1}
                </div>

                {/* Label */}
                <div className="text-center max-w-[100px]">
                  <div
                    className={`text-xs font-medium mb-0.5 ${
                      isCurrent ? 'text-tier-navy' : 'text-tier-text-secondary'
                    }`}
                  >
                    {step.label}
                  </div>
                  <div className="text-[10px] text-tier-text-secondary leading-tight hidden md:block">
                    {step.description}
                  </div>
                </div>
              </button>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-[2px] bg-tier-surface-base mx-2 relative">
                  <div
                    className={`absolute top-0 left-0 h-full transition-all ${
                      completedSteps.includes(index + 1) ? 'bg-tier-success w-full' : 'bg-transparent w-0'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default IntakeFormStepper;
