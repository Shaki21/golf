/**
 * CoachTrainingPlanTemplates - Main page for Training Plan Builder
 * Allows coaches to browse, create, edit, and apply training plan templates
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookTemplate, Plus } from 'lucide-react';
import { Card } from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';
import { TemplatePlanLibrary } from './components/TemplatePlanLibrary';
import { TemplatePlanCalendar } from './components/TemplatePlanCalendar';
import { TrainingPlanTemplate } from './types/template.types';

const CUSTOM_TEMPLATES_STORAGE_KEY = 'tier_custom_templates';

// Load custom templates from localStorage (until backend API is available)
function loadCustomTemplates(): TrainingPlanTemplate[] {
  try {
    const stored = localStorage.getItem(CUSTOM_TEMPLATES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Failed to load custom templates:', err);
  }
  return [];
}

// Save custom templates to localStorage (until backend API is available)
function saveCustomTemplates(templates: TrainingPlanTemplate[]): void {
  try {
    localStorage.setItem(CUSTOM_TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  } catch (err) {
    console.error('Failed to save custom templates:', err);
  }
}

export function CoachTrainingPlanTemplates() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<TrainingPlanTemplate | null>(null);
  const [viewMode, setViewMode] = useState<'library' | 'calendar'>('library');
  const [customTemplates, setCustomTemplates] = useState<TrainingPlanTemplate[]>([]);

  // Load custom templates on mount
  useEffect(() => {
    const templates = loadCustomTemplates();
    setCustomTemplates(templates);
  }, []);

  const handleSelectTemplate = (template: TrainingPlanTemplate) => {
    setSelectedTemplate(template);
    setViewMode('calendar');
  };

  const handleBackToLibrary = () => {
    setViewMode('library');
    setSelectedTemplate(null);
  };

  const handleSaveTemplate = useCallback((modifiedTemplate: TrainingPlanTemplate) => {
    // Save to localStorage (backend API integration pending)
    const existingIndex = customTemplates.findIndex(t => t.id === modifiedTemplate.id);
    let updatedTemplates: TrainingPlanTemplate[];

    if (existingIndex >= 0) {
      // Update existing template
      updatedTemplates = [...customTemplates];
      updatedTemplates[existingIndex] = modifiedTemplate;
    } else {
      // Add new template
      updatedTemplates = [...customTemplates, { ...modifiedTemplate, id: `custom-${Date.now()}` }];
    }

    setCustomTemplates(updatedTemplates);
    saveCustomTemplates(updatedTemplates);

    console.log('Template saved to localStorage (API integration pending):', modifiedTemplate);
  }, [customTemplates]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-tier-navy/10 rounded-lg">
            <BookTemplate className="text-tier-navy" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-tier-navy">
              Training Plan Templates
            </h1>
            <p className="text-sm text-tier-navy/60 mt-0.5">
              Build and manage training plan templates for your athletes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {viewMode === 'library' ? (
            <Button
              variant="primary"
              onClick={() => navigate('/coach/training-plan-templates/create')}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Create Template
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={handleBackToLibrary}
            >
              ← Back to Library
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'library' ? (
        <TemplatePlanLibrary
          onSelectTemplate={handleSelectTemplate}
          customTemplates={customTemplates}
        />
      ) : selectedTemplate ? (
        <TemplatePlanCalendar
          template={selectedTemplate}
          onSave={handleSaveTemplate}
        />
      ) : null}
    </div>
  );
}

export default CoachTrainingPlanTemplates;
