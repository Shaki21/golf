/**
 * TemplatePlanApplyDialog Component
 * Dialog for applying a template to athletes with configuration options
 */

import React, { useState } from 'react';
import { Calendar, Users, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Modal from '../../../ui/composites/Modal.composite';
import { Button } from '../../../ui/primitives/Button';
import { Input } from '../../../components/shadcn/input';
import { Checkbox } from '../../../components/shadcn/checkbox';
import { Badge } from '../../../components/shadcn/badge';
import { Card } from '../../../ui/primitives/Card';
import {
  TrainingPlanTemplate,
  TemplateApplicationOptions,
  TemplateApplicationResult
} from '../types/template.types';
import { useTemplateApplication } from '../hooks/useTemplateApplication';

interface TemplatePlanApplyDialogProps {
  template: TrainingPlanTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: TemplateApplicationResult) => void;
  availableAthletes?: Array<{
    id: string;
    name: string;
    email?: string;
  }>;
}

type ApplyStep = 'configure' | 'applying' | 'results';

export function TemplatePlanApplyDialog({
  template,
  isOpen,
  onClose,
  onSuccess,
  availableAthletes = []
}: TemplatePlanApplyDialogProps) {
  const [step, setStep] = useState<ApplyStep>('configure');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedAthleteIds, setSelectedAthleteIds] = useState<string[]>([]);
  const [skipWeekends, setSkipWeekends] = useState(false);
  const [adjustForExistingSessions, setAdjustForExistingSessions] = useState(true);
  const [result, setResult] = useState<TemplateApplicationResult | null>(null);

  const { applyTemplate, isApplying, progress, currentAthlete } = useTemplateApplication();

  if (!template) return null;

  const handleAthleteToggle = (athleteId: string) => {
    setSelectedAthleteIds(prev =>
      prev.includes(athleteId)
        ? prev.filter(id => id !== athleteId)
        : [...prev, athleteId]
    );
  };

  const handleApply = async () => {
    if (selectedAthleteIds.length === 0) return;

    setStep('applying');

    const options: TemplateApplicationOptions = {
      startDate,
      athleteIds: selectedAthleteIds,
      skipWeekends,
      adjustForExistingSessions
    };

    const applicationResult = await applyTemplate(template, options);
    setResult(applicationResult);
    setStep('results');

    if (onSuccess && applicationResult.success) {
      onSuccess(applicationResult);
    }
  };

  const handleClose = () => {
    setStep('configure');
    setSelectedAthleteIds([]);
    setResult(null);
    onClose();
  };

  const renderConfigureStep = () => (
    <div className="space-y-6">
      {/* Template info */}
      <Card className="bg-tier-navy/5 border-tier-navy/10">
        <div className="p-4">
          <h4 className="font-semibold text-tier-navy mb-2">{template.name}</h4>
          <div className="flex gap-4 text-sm text-tier-navy/70">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{template.durationWeeks} {template.durationWeeks === 1 ? 'week' : 'weeks'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{template.sessions.length} {template.sessions.length === 1 ? 'session' : 'sessions'}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Start date */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Start Date
        </label>
        <Input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
        <p className="text-xs text-tier-navy/60 mt-1">
          Sessions will be scheduled starting from this date
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Options
        </label>
        <div className="space-y-2">
          <label className="flex items-start gap-2 cursor-pointer">
            <Checkbox
              checked={skipWeekends}
              onCheckedChange={(checked) => setSkipWeekends(checked === true)}
            />
            <div className="flex-1">
              <div className="text-sm text-tier-navy">Skip weekends</div>
              <div className="text-xs text-tier-navy/60">
                Sessions scheduled for weekends will be moved to the next Monday
              </div>
            </div>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <Checkbox
              checked={adjustForExistingSessions}
              onCheckedChange={(checked) => setAdjustForExistingSessions(checked === true)}
            />
            <div className="flex-1">
              <div className="text-sm text-tier-navy">
                Check for existing sessions
              </div>
              <div className="text-xs text-tier-navy/60">
                Skip dates that already have sessions scheduled
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Athlete selection */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Select Athletes ({selectedAthleteIds.length} selected)
        </label>
        {availableAthletes.length === 0 ? (
          <Card className="p-6 text-center">
            <AlertCircle className="mx-auto text-tier-navy/30 mb-2" size={32} />
            <p className="text-sm text-tier-navy/60">
              No athletes available. Add athletes to your roster first.
            </p>
          </Card>
        ) : (
          <div className="max-h-64 overflow-y-auto border border-tier-navy/10 rounded-lg">
            {availableAthletes.map(athlete => (
              <label
                key={athlete.id}
                className="flex items-center gap-3 p-3 hover:bg-tier-navy/5 cursor-pointer border-b border-tier-navy/10 last:border-b-0"
              >
                <Checkbox
                  checked={selectedAthleteIds.includes(athlete.id)}
                  onChange={() => handleAthleteToggle(athlete.id)}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-tier-navy">
                    {athlete.name}
                  </div>
                  {athlete.email && (
                    <div className="text-xs text-tier-navy/60">
                      {athlete.email}
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Warning if no athletes selected */}
      {selectedAthleteIds.length === 0 && availableAthletes.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-tier-warning/10 border border-tier-warning/20 rounded-lg">
          <AlertCircle className="text-tier-warning flex-shrink-0 mt-0.5" size={16} />
          <p className="text-sm text-tier-navy/80">
            Please select at least one athlete to continue
          </p>
        </div>
      )}
    </div>
  );

  const renderApplyingStep = () => (
    <div className="space-y-6 py-8">
      <div className="text-center">
        <div className="inline-block relative mb-4">
          <div className="w-16 h-16 border-4 border-tier-navy/20 border-t-tier-gold rounded-full animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-tier-navy mb-2">
          Applying Template...
        </h3>
        <p className="text-tier-navy/60">
          {currentAthlete ? `Processing athlete ${currentAthlete}` : 'Setting up sessions'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-tier-navy/60">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-tier-navy/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-tier-gold transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );

  const renderResultsStep = () => {
    if (!result) return null;

    return (
      <div className="space-y-6">
        {/* Overall status */}
        <Card className={`p-4 ${result.success ? 'bg-tier-success/10 border-tier-success/20' : 'bg-tier-error/10 border-tier-error/20'}`}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="text-tier-success flex-shrink-0" size={24} />
            ) : (
              <XCircle className="text-tier-error flex-shrink-0" size={24} />
            )}
            <div className="flex-1">
              <h4 className="font-semibold text-tier-navy mb-1">
                {result.success ? 'Template Applied Successfully' : 'Application Failed'}
              </h4>
              <p className="text-sm text-tier-navy/70">
                {result.success
                  ? `Created ${result.sessionsCreated} training ${result.sessionsCreated === 1 ? 'session' : 'sessions'}`
                  : 'Failed to apply template. Please try again.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Per-athlete results */}
        {result.athleteResults.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-tier-navy mb-3">
              Results by Athlete
            </h4>
            <div className="space-y-2">
              {result.athleteResults.map(athleteResult => (
                <Card key={athleteResult.athleteId} className="p-3 border-tier-navy/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-tier-navy">
                      {athleteResult.athleteName}
                    </span>
                    <Badge
                      variant={athleteResult.sessionsCreated > 0 ? 'success' : 'secondary'}
                    >
                      {athleteResult.sessionsCreated}{' '}
                      {athleteResult.sessionsCreated === 1 ? 'session' : 'sessions'}
                    </Badge>
                  </div>
                  {athleteResult.conflicts.length > 0 && (
                    <div className="text-xs text-tier-warning">
                      {athleteResult.conflicts.length} conflict{athleteResult.conflicts.length === 1 ? '' : 's'} detected
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Conflicts summary */}
        {result.conflictsFound && result.conflictsFound > 0 && (
          <div className="flex items-start gap-2 p-3 bg-tier-warning/10 border border-tier-warning/20 rounded-lg">
            <AlertCircle className="text-tier-warning flex-shrink-0 mt-0.5" size={16} />
            <div className="text-sm text-tier-navy/80">
              <strong>{result.conflictsFound}</strong> existing{' '}
              {result.conflictsFound === 1 ? 'session was' : 'sessions were'} skipped
              to avoid conflicts
            </div>
          </div>
        )}

        {/* Errors */}
        {result.errors && result.errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-tier-error">Errors</h4>
            {result.errors.map((error, index) => (
              <div
                key={index}
                className="text-sm text-tier-error p-2 bg-tier-error/10 rounded border border-tier-error/20"
              >
                {error}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === 'configure'
          ? 'Apply Template'
          : step === 'applying'
          ? 'Applying Template'
          : 'Application Results'
      }
      size="lg"
      footer={
        step === 'configure' ? (
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleApply}
              disabled={selectedAthleteIds.length === 0}
            >
              Apply to {selectedAthleteIds.length}{' '}
              {selectedAthleteIds.length === 1 ? 'Athlete' : 'Athletes'}
            </Button>
          </div>
        ) : step === 'results' ? (
          <div className="flex justify-end gap-3">
            <Button variant="primary" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : null
      }
    >
      {step === 'configure' && renderConfigureStep()}
      {step === 'applying' && renderApplyingStep()}
      {step === 'results' && renderResultsStep()}
    </Modal>
  );
}

export default TemplatePlanApplyDialog;
