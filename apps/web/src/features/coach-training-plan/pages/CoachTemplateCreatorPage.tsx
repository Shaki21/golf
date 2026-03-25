/**
 * CoachTemplateCreatorPage - Page wrapper for template creation
 * Handles routing and saving logic
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../ui/primitives/Button';
import { CoachTemplateCreator } from '../components/CoachTemplateCreator';
import type { TrainingPlanTemplate } from '../types/template.types';

export function CoachTemplateCreatorPage() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (template: TrainingPlanTemplate) => {
    setIsSaving(true);

    try {
      // TODO: Call API to save template
      console.log('Saving template:', template);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate back to templates page
      navigate('/coach/training-plan-templates', {
        state: { message: 'Template created successfully!', template },
      });
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure? Unsaved changes will be lost.')) {
      navigate('/coach/training-plan-templates');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/coach/training-plan-templates')}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft size={16} />
            Back to Templates
          </Button>
        </div>

        {/* Creator Component */}
        {isSaving ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-tier-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-tier-navy font-medium">Saving template...</p>
            </div>
          </div>
        ) : (
          <CoachTemplateCreator onSave={handleSave} onCancel={handleCancel} />
        )}
      </div>
    </div>
  );
}

export default CoachTemplateCreatorPage;
