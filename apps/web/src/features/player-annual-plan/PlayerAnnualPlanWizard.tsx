/**
 * Player Annual Plan Wizard
 * Main wizard component for creating player annual plans
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnnualPlanWizard } from './hooks/useAnnualPlanWizard';
import { usePlayerAnnualPlan } from './hooks/usePlayerAnnualPlan';
import { Step1BasicInfo } from './steps/Step1_BasicInfo';
import { Step2PeriodSelection } from './steps/Step2_PeriodSelection';
import { Step3PeriodDetails } from './steps/Step3_PeriodDetails';
import { Step4GoalsAndFocus } from './steps/Step4_GoalsAndFocus';
import { Step5Review } from './steps/Step5_Review';

export function PlayerAnnualPlanWizard() {
  const navigate = useNavigate();
  const wizard = useAnnualPlanWizard();
  const { createPlan, isLoading } = usePlayerAnnualPlan();

  const handleCancel = () => {
    if (
      confirm(
        'Er du sikker på at du vil avbryte? All progresjon vil gå tapt.'
      )
    ) {
      navigate('/plan/aarsplan');
    }
  };

  const handleSavePlan = async () => {
    const { basicInfo, periods } = wizard.state;

    const result = await createPlan({
      name: basicInfo.name,
      startDate: basicInfo.startDate,
      endDate: basicInfo.endDate,
      periods,
    });

    if (result) {
      wizard.reset();
      navigate('/plan/aarsplan');
    }
  };

  const renderStep = () => {
    const { currentStep, basicInfo, selectedPeriodTypes, periods, shortTermGoals, longTermGoals } =
      wizard.state;

    switch (currentStep) {
      case 0:
        return (
          <Step1BasicInfo
            basicInfo={basicInfo}
            onUpdate={wizard.updateBasicInfo}
            onNext={wizard.goToNext}
            onCancel={handleCancel}
          />
        );

      case 1:
        return (
          <Step2PeriodSelection
            selectedPeriodTypes={selectedPeriodTypes}
            onUpdate={wizard.updatePeriodTypes}
            onNext={wizard.goToNext}
            onPrevious={wizard.goToPrevious}
          />
        );

      case 2:
        return (
          <Step3PeriodDetails
            selectedPeriodTypes={selectedPeriodTypes}
            periods={periods}
            basicInfo={{
              startDate: basicInfo.startDate,
              endDate: basicInfo.endDate,
            }}
            onUpdate={wizard.updatePeriods}
            onNext={wizard.goToNext}
            onPrevious={wizard.goToPrevious}
          />
        );

      case 3:
        return (
          <Step4GoalsAndFocus
            shortTermGoals={shortTermGoals}
            longTermGoals={longTermGoals}
            onUpdateShortTermGoals={wizard.updateShortTermGoals}
            onUpdateLongTermGoals={wizard.updateLongTermGoals}
            onNext={wizard.goToNext}
            onPrevious={wizard.goToPrevious}
          />
        );

      case 4:
        return (
          <Step5Review
            basicInfo={basicInfo}
            periods={periods}
            shortTermGoals={shortTermGoals}
            longTermGoals={longTermGoals}
            onSave={handleSavePlan}
            onPrevious={wizard.goToPrevious}
            isLoading={isLoading}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      {/* Progress Bar */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-tier-navy">
            Steg {wizard.state.currentStep + 1} av {wizard.state.totalSteps}
          </span>
          <span className="text-sm text-tier-gray">
            {Math.round(
              ((wizard.state.currentStep + 1) / wizard.state.totalSteps) * 100
            )}
            % fullført
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-tier-navy transition-all duration-300"
            style={{
              width: `${
                ((wizard.state.currentStep + 1) / wizard.state.totalSteps) * 100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Current Step */}
      {renderStep()}
    </div>
  );
}

export default PlayerAnnualPlanWizard;
