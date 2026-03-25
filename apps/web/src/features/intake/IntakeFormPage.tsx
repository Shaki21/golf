/**
 * Intake Form Page
 * Multi-step wizard for player onboarding assessment
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useIntake from '../../hooks/useIntake';
import { PageHeader } from '../../components/layout/PageHeader';
import Button from '../../ui/primitives/Button';
import BackgroundStep from './steps/BackgroundStep';
import AvailabilityStep from './steps/AvailabilityStep';
import GoalsStep from './steps/GoalsStep';
import WeaknessesStep from './steps/WeaknessesStep';
import HealthStep from './steps/HealthStep';
import LifestyleStep from './steps/LifestyleStep';
import EquipmentStep from './steps/EquipmentStep';
import LearningStep from './steps/LearningStep';
import IntakeFormStepper from './components/IntakeFormStepper';
import { SectionTitle } from '../../components/typography';

type StepId = 'background' | 'availability' | 'goals' | 'weaknesses' | 'health' | 'lifestyle' | 'equipment' | 'learning';

interface IntakeFormData {
  background?: any;
  availability?: any;
  goals?: any;
  weaknesses?: any;
  health?: any;
  lifestyle?: any;
  equipment?: any;
  learning?: any;
}

const STEPS: { id: StepId; label: string; description: string }[] = [
  { id: 'background', label: 'Background', description: 'Your golf history' },
  { id: 'availability', label: 'Availability', description: 'Time and resources' },
  { id: 'goals', label: 'Goals', description: 'What do you want to achieve?' },
  { id: 'weaknesses', label: 'Challenges', description: 'Areas to improve' },
  { id: 'health', label: 'Health', description: 'Injuries and limitations' },
  { id: 'lifestyle', label: 'Lifestyle', description: 'Work and daily life' },
  { id: 'equipment', label: 'Equipment', description: 'Access to equipment' },
  { id: 'learning', label: 'Learning Style', description: 'How do you learn best?' },
];

const IntakeFormPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const playerId = user?.playerId;

  const { intake, loading: loadingIntake, fetchIntake, submitIntake, submitting } = useIntake();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<IntakeFormData>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const currentStep = STEPS[currentStepIndex];

  // Load existing intake data on mount
  useEffect(() => {
    if (playerId) {
      fetchIntake(playerId);
    }
  }, [playerId, fetchIntake]);

  // Update form data when intake loads
  useEffect(() => {
    if (intake) {
      setFormData({
        background: intake.background || {},
        availability: intake.availability || {},
        goals: intake.goals || {},
        weaknesses: intake.weaknesses || {},
        health: intake.health || {},
        lifestyle: intake.lifestyle || {},
        equipment: intake.equipment || {},
        learning: intake.learning || {},
      });
      setCompletionPercentage(intake.completionPercentage || 0);
    }
  }, [intake]);

  const handleStepComplete = (stepId: StepId, stepData: any) => {
    setFormData((prev) => ({
      ...prev,
      [stepId]: stepData,
    }));
  };

  const handleNext = async () => {
    // Save current step
    await handleSave(false);

    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      window.scrollTo(0, 0);
    } else {
      // Final step - submit and show success
      await handleSave(true);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSave = async (isFinalSubmit = false) => {
    if (!playerId) return;

    try {
      const result = await submitIntake(playerId, formData);
      if (!result) return;
      setCompletionPercentage(result.completionPercentage || 0);

      if (isFinalSubmit && result.isComplete) {
        setShowSuccess(true);
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to save intake:', error);
      alert('Could not save form. Please try again.');
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
    window.scrollTo(0, 0);
  };

  if (loadingIntake) {
    return (
      <div className="min-h-screen bg-tier-surface-base flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tier-info mx-auto mb-4"></div>
          <p className="text-tier-text-secondary">Loading intake form...</p>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-tier-surface-base flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl border border-tier-border-default p-8 text-center">
          <CheckCircle size={64} className="text-tier-success mx-auto mb-4" />
          <SectionTitle className="text-2xl font-bold text-tier-navy mb-2">Thank you for your submission!</SectionTitle>
          <p className="text-tier-text-secondary mb-6">
            We have received your intake assessment. Your training plan will soon be generated based on the information you provided.
          </p>
          <div className="bg-tier-info-light border border-tier-info rounded-lg p-4">
            <p className="text-sm text-tier-navy">
              Completed: <span className="font-bold">{completionPercentage}%</span>
            </p>
          </div>
          <p className="text-xs text-tier-text-secondary mt-4">
            Redirecting you to the dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-surface-base p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <PageHeader title="Player Assessment" subtitle="" helpText="" actions={null} className="mb-2" />
          <p className="text-tier-text-secondary">
            Help us understand your background and goals, so we can create the best training plan for you.
          </p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl border border-tier-border-default p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-tier-navy">Progress</span>
            <span className="text-sm text-tier-text-secondary">{completionPercentage}% completed</span>
          </div>
          <div className="w-full bg-tier-surface-base rounded-full h-2">
            <div
              className="bg-tier-success h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Stepper */}
        <IntakeFormStepper
          steps={STEPS}
          currentStep={currentStepIndex}
          completedSteps={STEPS.slice(0, currentStepIndex).map((_, i) => i)}
          onStepClick={handleStepClick}
          className="mb-6"
        />

        {/* Step Content */}
        <div className="bg-white rounded-xl border border-tier-border-default p-6 mb-6">
          <div className="mb-6">
            <SectionTitle className="text-xl font-semibold text-tier-navy mb-1">{currentStep.label}</SectionTitle>
            <p className="text-sm text-tier-text-secondary">{currentStep.description}</p>
          </div>

          {currentStep.id === 'background' && (
            <BackgroundStep
              data={formData.background}
              onComplete={(data) => handleStepComplete('background', data)}
            />
          )}
          {currentStep.id === 'availability' && (
            <AvailabilityStep
              data={formData.availability}
              onComplete={(data) => handleStepComplete('availability', data)}
            />
          )}
          {currentStep.id === 'goals' && (
            <GoalsStep
              data={formData.goals}
              onComplete={(data) => handleStepComplete('goals', data)}
            />
          )}
          {currentStep.id === 'weaknesses' && (
            <WeaknessesStep
              data={formData.weaknesses}
              onComplete={(data) => handleStepComplete('weaknesses', data)}
            />
          )}
          {currentStep.id === 'health' && (
            <HealthStep
              data={formData.health}
              onComplete={(data) => handleStepComplete('health', data)}
            />
          )}
          {currentStep.id === 'lifestyle' && (
            <LifestyleStep
              data={formData.lifestyle}
              onComplete={(data) => handleStepComplete('lifestyle', data)}
            />
          )}
          {currentStep.id === 'equipment' && (
            <EquipmentStep
              data={formData.equipment}
              onComplete={(data) => handleStepComplete('equipment', data)}
            />
          )}
          {currentStep.id === 'learning' && (
            <LearningStep
              data={formData.learning}
              onComplete={(data) => handleStepComplete('learning', data)}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            leftIcon={<ArrowLeft size={18} />}
          >
            Previous
          </Button>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => handleSave(false)}
              disabled={submitting}
              loading={submitting}
              leftIcon={<Save size={18} />}
            >
              Save draft
            </Button>

            <Button
              variant="primary"
              onClick={handleNext}
              disabled={submitting}
              loading={submitting}
              rightIcon={currentStepIndex === STEPS.length - 1 ? <CheckCircle size={18} /> : <ArrowRight size={18} />}
            >
              {currentStepIndex === STEPS.length - 1 ? 'Complete' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntakeFormPage;
