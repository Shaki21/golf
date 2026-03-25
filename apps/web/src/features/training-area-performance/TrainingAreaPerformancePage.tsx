import React, { useState } from 'react';
import { ProgressTrackingView } from './ProgressTrackingView';
import { LogTrainingAreaPerformanceForm } from './LogTrainingAreaPerformanceForm';
import { PageHeader } from '../../ui/raw-blocks';

export const TrainingAreaPerformancePage: React.FC = () => {
  const [showLogForm, setShowLogForm] = useState(false);

  const handleLogSuccess = () => {
    setShowLogForm(false);
    // The ProgressTrackingView will automatically refresh when it detects the change
    window.location.reload();
  };

  if (showLogForm) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => setShowLogForm(false)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Tilbake til statistikk
          </button>
        </div>
        <LogTrainingAreaPerformanceForm
          onSuccess={handleLogSuccess}
          onCancel={() => setShowLogForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <PageHeader
        title="Treningsområdeprestasjoner"
        subtitle="Spor fremgang på spesifikke treningsområder"
        helpText="Oversikt over prestasjoner og fremgang for ulike treningsområder (chipping, putting, driving, osv.). Logg nye økter med prestasjonsmålinger, se historikk, trender og sammenlign resultater over tid. Bruk pluss-knappen for å registrere ny økt."
        actions={null}
      />
      {/* Floating Action Button */}
      <button
        onClick={() => setShowLogForm(true)}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110 z-50 flex items-center justify-center"
        title="Logg ny treningsøkt"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      <ProgressTrackingView />
    </div>
  );
};
