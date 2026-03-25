/**
 * ProgressReportForm
 * Form for creating and editing progress reports
 *
 * Features:
 * - Create new progress report
 * - Edit existing draft report
 * - Select player and period
 * - Fill in highlights, improvements, goals
 * - Save as draft or publish immediately
 * - Auto-generate report option
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useProgressReports } from '../../hooks/useProgressReports';
import Button from '../../ui/primitives/Button';
import { track } from '../../analytics/track';
import { SectionTitle } from '../../components/typography/Headings';

// ═══════════════════════════════════════════
// TAILWIND CLASSES
// ═══════════════════════════════════════════

const tw = {
  container: 'flex flex-col gap-6',
  header: 'flex items-center justify-between',
  title: 'text-xl font-semibold text-[var(--text-inverse)] m-0',
  form: 'flex flex-col gap-4',
  formGroup: 'flex flex-col gap-2',
  label: 'text-sm font-semibold text-[var(--text-inverse)]',
  required: 'text-tier-error ml-1',
  input: 'w-full py-2 px-3 bg-surface-elevated border border-border rounded-lg text-[var(--text-inverse)] text-sm placeholder-[var(--video-text-tertiary)]',
  textarea: 'w-full py-2 px-3 bg-surface-elevated border border-border rounded-lg text-[var(--text-inverse)] text-sm placeholder-[var(--video-text-tertiary)] min-h-[120px] resize-y',
  select: 'w-full py-2 px-3 bg-surface-elevated border border-border rounded-lg text-[var(--text-inverse)] text-sm',
  dateRow: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  helperText: 'text-xs text-[var(--video-text-secondary)] mt-1',
  actions: 'flex gap-3 justify-end pt-4 border-t border-border',
  autoGenerateButton: 'py-2 px-4 bg-purple-500/20 border border-purple-500 rounded-lg text-purple-500 text-sm font-medium cursor-pointer hover:bg-purple-500/30 transition-colors',
  errorMessage: 'py-2 px-3 bg-tier-error/20 border border-tier-error rounded-lg text-tier-error text-sm',
};

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function ProgressReportForm({
  className = '',
  report = null,
  playerId: initialPlayerId = null,
  onSave,
  onCancel,
}) {
  const {
    createReport,
    updateReport,
    generateReport,
    saving,
    error: apiError,
  } = useProgressReports();

  // Form state
  const [formData, setFormData] = useState({
    playerId: initialPlayerId || report?.playerId || '',
    title: report?.title || '',
    periodStart: report?.periodStart
      ? new Date(report.periodStart).toISOString().split('T')[0]
      : '',
    periodEnd: report?.periodEnd
      ? new Date(report.periodEnd).toISOString().split('T')[0]
      : '',
    highlights: report?.highlights || '',
    areasForImprovement: report?.areasForImprovement || '',
    goalsForNextPeriod: report?.goalsForNextPeriod || '',
    coachComments: report?.coachComments || '',
  });

  const [error, setError] = useState(null);

  // Update form when report changes
  useEffect(() => {
    if (report) {
      setFormData({
        playerId: report.playerId || '',
        title: report.title || '',
        periodStart: report.periodStart
          ? new Date(report.periodStart).toISOString().split('T')[0]
          : '',
        periodEnd: report.periodEnd
          ? new Date(report.periodEnd).toISOString().split('T')[0]
          : '',
        highlights: report.highlights || '',
        areasForImprovement: report.areasForImprovement || '',
        goalsForNextPeriod: report.goalsForNextPeriod || '',
        coachComments: report.coachComments || '',
      });
    }
  }, [report]);

  // Handle input change
  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    if (!formData.playerId) {
      setError('Player is required');
      return false;
    }

    if (!formData.periodStart || !formData.periodEnd) {
      setError('Start and end date are required');
      return false;
    }

    if (new Date(formData.periodStart) > new Date(formData.periodEnd)) {
      setError('Start date must be before end date');
      return false;
    }

    return true;
  }, [formData]);

  // Handle save as draft
  const handleSaveDraft = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      try {
        const payload = {
          ...formData,
          status: 'draft',
        };

        let savedReport;
        if (report?.id) {
          savedReport = await updateReport(report.id, payload);
        } else {
          savedReport = await createReport(payload);
        }

        track('progress_report_saved', {
          screen: 'ProgressReportForm',
          mode: report?.id ? 'edit' : 'create',
          status: 'draft',
        });

        if (onSave) {
          onSave(savedReport);
        }
      } catch (err) {
        console.error('Failed to save report:', err);
        setError('Could not save report');
      }
    },
    [formData, report, validateForm, createReport, updateReport, onSave]
  );

  // Handle save and publish
  const handleSaveAndPublish = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      if (!window.confirm('Publish report to parents? They will receive an email notification.')) {
        return;
      }

      try {
        const payload = {
          ...formData,
          status: 'published',
        };

        let savedReport;
        if (report?.id) {
          savedReport = await updateReport(report.id, payload);
        } else {
          savedReport = await createReport(payload);
        }

        track('progress_report_published', {
          screen: 'ProgressReportForm',
          mode: report?.id ? 'edit' : 'create',
        });

        alert('Report published! Parents have received email notification.');

        if (onSave) {
          onSave(savedReport);
        }
      } catch (err) {
        console.error('Failed to publish report:', err);
        setError('Could not publish report');
      }
    },
    [formData, report, validateForm, createReport, updateReport, onSave]
  );

  // Handle auto-generate
  const handleAutoGenerate = useCallback(async () => {
    if (!formData.playerId || !formData.periodStart || !formData.periodEnd) {
      alert('Please select player and period first');
      return;
    }

    if (
      !window.confirm(
        'Automatically generate report based on player data? This will overwrite existing content.'
      )
    ) {
      return;
    }

    try {
      const generatedReport = await generateReport(
        formData.playerId,
        formData.periodStart,
        formData.periodEnd
      );

      // Update form with generated data
      setFormData((prev) => ({
        ...prev,
        highlights: generatedReport.highlights || prev.highlights,
        areasForImprovement:
          generatedReport.areasForImprovement || prev.areasForImprovement,
        goalsForNextPeriod: generatedReport.goalsForNextPeriod || prev.goalsForNextPeriod,
        coachComments: generatedReport.coachComments || prev.coachComments,
      }));

      track('progress_report_generated', {
        screen: 'ProgressReportForm',
        playerId: formData.playerId,
      });

      alert('Report generated! You can now edit and save.');
    } catch (err) {
      console.error('Failed to generate report:', err);
      alert('Could not generate report');
    }
  }, [formData, generateReport]);

  return (
    <div className={`${tw.container} ${className}`}>
      {/* Header */}
      <div className={tw.header}>
        <SectionTitle style={{ marginBottom: 0 }}>
          {report?.id ? 'Edit Report' : 'New Progress Report'}
        </SectionTitle>
        <button onClick={handleAutoGenerate} className={tw.autoGenerateButton} disabled={saving}>
          Auto-generate
        </button>
      </div>

      {/* Error Message */}
      {(error || apiError) && (
        <div className={tw.errorMessage}>{error || apiError}</div>
      )}

      {/* Form */}
      <form className={tw.form} onSubmit={handleSaveDraft}>
        {/* Player Selection */}
        <div className={tw.formGroup}>
          <label className={tw.label}>
            Player<span className={tw.required}>*</span>
          </label>
          <select
            value={formData.playerId}
            onChange={(e) => handleChange('playerId', e.target.value)}
            className={tw.select}
            required
            disabled={!!report?.id} // Can't change player for existing report
          >
            <option value="">Select player...</option>
            <option value="00000000-0000-0000-0000-000000000004">Demo Player</option>
            {/* TODO: Load players from API */}
          </select>
        </div>

        {/* Title */}
        <div className={tw.formGroup}>
          <label className={tw.label}>Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="E.g. Monthly Report October 2024"
            className={tw.input}
          />
          <p className={tw.helperText}>Optional - default title generated if empty</p>
        </div>

        {/* Period Dates */}
        <div className={tw.dateRow}>
          <div className={tw.formGroup}>
            <label className={tw.label}>
              Period from<span className={tw.required}>*</span>
            </label>
            <input
              type="date"
              value={formData.periodStart}
              onChange={(e) => handleChange('periodStart', e.target.value)}
              className={tw.input}
              required
            />
          </div>
          <div className={tw.formGroup}>
            <label className={tw.label}>
              Period to<span className={tw.required}>*</span>
            </label>
            <input
              type="date"
              value={formData.periodEnd}
              onChange={(e) => handleChange('periodEnd', e.target.value)}
              className={tw.input}
              required
            />
          </div>
        </div>

        {/* Highlights */}
        <div className={tw.formGroup}>
          <label className={tw.label}>Highlights</label>
          <textarea
            value={formData.highlights}
            onChange={(e) => handleChange('highlights', e.target.value)}
            placeholder="Describe the player's key achievements and progress during the period..."
            className={tw.textarea}
          />
        </div>

        {/* Areas for Improvement */}
        <div className={tw.formGroup}>
          <label className={tw.label}>Areas for Improvement</label>
          <textarea
            value={formData.areasForImprovement}
            onChange={(e) => handleChange('areasForImprovement', e.target.value)}
            placeholder="Describe areas where the player can improve..."
            className={tw.textarea}
          />
        </div>

        {/* Goals for Next Period */}
        <div className={tw.formGroup}>
          <label className={tw.label}>Goals for Next Period</label>
          <textarea
            value={formData.goalsForNextPeriod}
            onChange={(e) => handleChange('goalsForNextPeriod', e.target.value)}
            placeholder="Set goals for the next period..."
            className={tw.textarea}
          />
        </div>

        {/* Coach Comments */}
        <div className={tw.formGroup}>
          <label className={tw.label}>Coach Comments</label>
          <textarea
            value={formData.coachComments}
            onChange={(e) => handleChange('coachComments', e.target.value)}
            placeholder="General comments from coach..."
            className={tw.textarea}
          />
        </div>

        {/* Actions */}
        <div className={tw.actions}>
          {onCancel && (
            <Button variant="secondary" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
          )}
          <Button variant="secondary" onClick={handleSaveDraft} disabled={saving}>
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button variant="primary" onClick={handleSaveAndPublish} disabled={saving}>
            {saving ? 'Publishing...' : 'Publish to Parents'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ProgressReportForm;
