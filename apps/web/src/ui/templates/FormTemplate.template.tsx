import React from 'react';
import { AppShell, PageHeader, CardSimple, CardHeader } from '../raw-blocks';
import { Button, Text, Divider } from '../primitives';
import { Modal } from '../composites';

/**
 * FormTemplate
 * Form page template with validation and multi-step support
 */

interface FormSection {
  id: string;
  title?: string;
  description?: string;
  content: React.ReactNode;
}

interface FormTemplateProps {
  /** Page title */
  title: string;
  /** Page subtitle */
  subtitle?: string;
  /** Form sections */
  sections: FormSection[];
  /** Submit button label */
  submitLabel?: string;
  /** Submit handler */
  onSubmit: () => void | Promise<void>;
  /** Cancel button label */
  cancelLabel?: string;
  /** Cancel handler */
  onCancel?: () => void;
  /** Show cancel button */
  showCancel?: boolean;
  /** Form is valid */
  isValid?: boolean;
  /** Form is dirty (has changes) */
  isDirty?: boolean;
  /** Loading/submitting state */
  loading?: boolean;
  /** Show progress */
  showProgress?: boolean;
  /** Current step (for multi-step forms) */
  currentStep?: number;
  /** Total steps */
  totalSteps?: number;
  /** Step navigation */
  onStepChange?: (step: number) => void;
  /** Validation errors */
  errors?: Record<string, string>;
  /** Success message */
  successMessage?: string;
}

const FormTemplate: React.FC<FormTemplateProps> = ({
  title,
  subtitle,
  sections,
  submitLabel = 'Save',
  onSubmit,
  cancelLabel = 'Cancel',
  onCancel,
  showCancel = true,
  isValid = true,
  isDirty = false,
  loading = false,
  showProgress = false,
  currentStep,
  totalSteps,
  onStepChange,
  errors,
  successMessage,
}) => {
  const [submitting, setSubmitting] = React.useState(false);
  const [cancelModalOpen, setCancelModalOpen] = React.useState(false);

  const isMultiStep = currentStep !== undefined && totalSteps !== undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setCancelModalOpen(true);
    } else {
      onCancel?.();
    }
  };

  const confirmCancel = () => {
    setCancelModalOpen(false);
    onCancel?.();
  };

  const handleNextStep = () => {
    if (currentStep !== undefined && totalSteps !== undefined && currentStep < totalSteps) {
      onStepChange?.(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep !== undefined && currentStep > 1) {
      onStepChange?.(currentStep - 1);
    }
  };

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <AppShell
      header={
        <PageHeader
          title={title}
          subtitle={subtitle}
          onBack={onCancel}
        />
      }
    >
      <div className="max-w-[800px] mx-auto w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Progress Bar */}
          {isMultiStep && showProgress && (
            <div className="flex flex-col gap-2">
              <div className="w-full h-2 bg-tier-surface-subtle rounded-full overflow-hidden">
                <div
                  className="h-full bg-tier-gold transition-all duration-300"
                  style={{ width: `${((currentStep || 0) / (totalSteps || 1)) * 100}%` }}
                />
              </div>
              <Text variant="caption1" color="secondary">
                Step {currentStep} of {totalSteps}
              </Text>
            </div>
          )}

          {/* Form Sections */}
          {sections.map((section, index) => {
            // For multi-step forms, only show current step
            if (isMultiStep && currentStep !== index + 1) {
              return null;
            }

            return (
              <CardSimple key={section.id} padding="lg">
                {(section.title || section.description) && (
                  <>
                    <CardHeader
                      title={section.title || ''}
                      subtitle={section.description}
                      size="md"
                    />
                    <Divider spacing={16} />
                  </>
                )}

                <div className="flex flex-col gap-4">
                  {section.content}
                </div>
              </CardSimple>
            );
          })}

          {/* Error Summary */}
          {errors && Object.keys(errors).length > 0 && (
            <CardSimple
              padding="md"
              className="bg-red-50 border-l-4 border-l-red-500"
            >
              <Text variant="footnote" weight={600} color="error">
                Please fix the following errors:
              </Text>
              <ul className="mt-2 ml-5 p-0">
                {Object.entries(errors).map(([key, message]) => (
                  <li key={key}>
                    <Text variant="caption1" color="error">
                      {message}
                    </Text>
                  </li>
                ))}
              </ul>
            </CardSimple>
          )}

          {/* Success Message */}
          {successMessage && (
            <CardSimple
              padding="md"
              className="bg-green-50 border-l-4 border-l-green-500"
            >
              <Text variant="body" color="success">
                {successMessage}
              </Text>
            </CardSimple>
          )}

          {/* Form Actions */}
          <div className="flex flex-col-reverse md:flex-row justify-between items-stretch md:items-center gap-3 pt-4 border-t border-tier-border-subtle">
            <div className="flex gap-2 w-full md:w-auto">
              {showCancel && onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  {cancelLabel}
                </Button>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              {isMultiStep && !isFirstStep && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={submitting}
                >
                  Previous
                </Button>
              )}

              {isMultiStep && !isLastStep ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNextStep}
                  disabled={!isValid || submitting}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                  disabled={!isValid || submitting}
                >
                  {submitLabel}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Discard changes?"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setCancelModalOpen(false)}
            >
              Continue editing
            </Button>
            <Button variant="danger" onClick={confirmCancel}>
              Discard
            </Button>
          </>
        }
      >
        <Text>
          You have unsaved changes. Are you sure you want to discard them?
        </Text>
      </Modal>
    </AppShell>
  );
};

export default FormTemplate;
