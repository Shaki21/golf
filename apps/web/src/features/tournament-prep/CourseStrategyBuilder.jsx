/**
 * CourseStrategyBuilder
 * Build course-level strategy for tournament
 *
 * Features:
 * - Course information (name, par, yardage)
 * - Weather conditions
 * - Key challenges
 * - Overall strategy notes
 * - Integrate with hole-by-hole planning
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTournamentPrep } from '../../hooks/useTournamentPrep';
import Button from '../../ui/primitives/Button';
import { track } from '../../analytics/track';
import { SectionTitle, SubSectionTitle } from '../../components/typography';

// ═══════════════════════════════════════════
// TAILWIND CLASSES
// ═══════════════════════════════════════════

const tw = {
  container: 'flex flex-col gap-6',
  header: 'flex items-center justify-between',
  title: 'text-xl font-semibold text-[var(--text-inverse)] m-0',
  form: 'flex flex-col gap-4',
  formRow: 'grid grid-cols-1 md:grid-cols-3 gap-4',
  formGroup: 'flex flex-col gap-2',
  label: 'text-sm font-semibold text-[var(--text-inverse)]',
  required: 'text-tier-error ml-1',
  input: 'w-full py-2 px-3 bg-surface-elevated border border-border rounded-lg text-[var(--text-inverse)] text-sm placeholder-[var(--video-text-tertiary)]',
  textarea: 'w-full py-2 px-3 bg-surface-elevated border border-border rounded-lg text-[var(--text-inverse)] text-sm placeholder-[var(--video-text-tertiary)] min-h-[100px] resize-y',
  select: 'w-full py-2 px-3 bg-surface-elevated border border-border rounded-lg text-[var(--text-inverse)] text-sm',
  helperText: 'text-xs text-[var(--video-text-secondary)] mt-1',
  infoCard: 'p-4 bg-purple-500/10 rounded-xl border border-purple-500',
  infoTitle: 'text-sm font-semibold text-[var(--text-inverse)] mb-2',
  infoText: 'text-xs text-[var(--video-text-secondary)]',
  actions: 'flex gap-3 justify-end pt-4 border-t border-border',
  errorMessage: 'py-2 px-3 bg-tier-error/20 border border-tier-error rounded-lg text-tier-error text-sm',
  successMessage: 'py-2 px-3 bg-tier-success/20 border border-tier-success rounded-lg text-tier-success text-sm',
};

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function CourseStrategyBuilder({
  className = '',
  preparation,
  onSave,
  onCancel,
}) {
  const {
    saveCourseStrategy,
    saving,
    error: apiError,
  } = useTournamentPrep();

  const existingStrategy = preparation?.courseStrategy;

  // Form state
  const [formData, setFormData] = useState({
    courseName: existingStrategy?.courseName || '',
    totalPar: existingStrategy?.totalPar || 72,
    totalYardage: existingStrategy?.totalYardage || '',
    weatherConditions: existingStrategy?.weatherConditions || '',
    keyChallenges: existingStrategy?.keyChallenges || '',
    overallStrategy: existingStrategy?.overallStrategy || '',
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Update form when strategy changes
  useEffect(() => {
    if (existingStrategy) {
      setFormData({
        courseName: existingStrategy.courseName || '',
        totalPar: existingStrategy.totalPar || 72,
        totalYardage: existingStrategy.totalYardage || '',
        weatherConditions: existingStrategy.weatherConditions || '',
        keyChallenges: existingStrategy.keyChallenges || '',
        overallStrategy: existingStrategy.overallStrategy || '',
      });
    }
  }, [existingStrategy]);

  // Handle input change
  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
    setSuccess(false);
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    if (!formData.courseName) {
      setError('Course name is required');
      return false;
    }

    return true;
  }, [formData]);

  // Handle save
  const handleSave = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      if (!preparation?.id) {
        setError('No preparation selected');
        return;
      }

      try {
        const savedStrategy = await saveCourseStrategy(preparation.id, formData);

        setSuccess(true);

        track('course_strategy_saved', {
          screen: 'CourseStrategyBuilder',
          prepId: preparation.id,
        });

        if (onSave) {
          onSave(savedStrategy);
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        console.error('Failed to save course strategy:', err);
        setError('Could not save course strategy');
      }
    },
    [formData, preparation, validateForm, saveCourseStrategy, onSave]
  );

  return (
    <div className={`${tw.container} ${className}`}>
      {/* Header */}
      <div className={tw.header}>
        <SectionTitle style={{ marginBottom: 0 }}>Course Strategy</SectionTitle>
      </div>

      {/* Info Card */}
      <div className={tw.infoCard}>
        <SubSectionTitle style={{ marginBottom: '8px' }}>Tips for course strategy</SubSectionTitle>
        <p className={tw.infoText}>
          Define an overall strategy for the course based on the player's strengths,
          weather impact, and course challenges. This will help you plan
          each hole more effectively.
        </p>
      </div>

      {/* Error Message */}
      {(error || apiError) && (
        <div className={tw.errorMessage}>{error || apiError}</div>
      )}

      {/* Success Message */}
      {success && (
        <div className={tw.successMessage}>✓ Course strategy saved!</div>
      )}

      {/* Form */}
      <form className={tw.form} onSubmit={handleSave}>
        {/* Course Info Row */}
        <div className={tw.formRow}>
          <div className={tw.formGroup}>
            <label className={tw.label}>
              Course Name<span className={tw.required}>*</span>
            </label>
            <input
              type="text"
              value={formData.courseName}
              onChange={(e) => handleChange('courseName', e.target.value)}
              placeholder="E.g. Augusta National"
              className={tw.input}
              required
            />
          </div>

          <div className={tw.formGroup}>
            <label className={tw.label}>Total Par</label>
            <input
              type="number"
              value={formData.totalPar}
              onChange={(e) => handleChange('totalPar', parseInt(e.target.value))}
              placeholder="72"
              className={tw.input}
              min="60"
              max="80"
            />
          </div>

          <div className={tw.formGroup}>
            <label className={tw.label}>Total Length (meters)</label>
            <input
              type="number"
              value={formData.totalYardage}
              onChange={(e) => handleChange('totalYardage', parseInt(e.target.value))}
              placeholder="E.g. 6500"
              className={tw.input}
              min="4000"
              max="8000"
            />
          </div>
        </div>

        {/* Weather Conditions */}
        <div className={tw.formGroup}>
          <label className={tw.label}>Weather Conditions</label>
          <select
            value={formData.weatherConditions}
            onChange={(e) => handleChange('weatherConditions', e.target.value)}
            className={tw.select}
          >
            <option value="">Select weather conditions...</option>
            <option value="sunny">Sunny</option>
            <option value="cloudy">Cloudy</option>
            <option value="windy">Windy</option>
            <option value="rainy">Rainy</option>
            <option value="cold">Cold</option>
            <option value="hot">Hot</option>
          </select>
          <p className={tw.helperText}>
            Select expected weather for the tournament (affects club selection and strategy)
          </p>
        </div>

        {/* Key Challenges */}
        <div className={tw.formGroup}>
          <label className={tw.label}>Key Challenges</label>
          <textarea
            value={formData.keyChallenges}
            onChange={(e) => handleChange('keyChallenges', e.target.value)}
            placeholder="Describe the course's key challenges (e.g. narrow fairways, deep bunkers, fast greens)..."
            className={tw.textarea}
          />
          <p className={tw.helperText}>
            Identify the biggest challenges on this course
          </p>
        </div>

        {/* Overall Strategy */}
        <div className={tw.formGroup}>
          <label className={tw.label}>Overall Strategy</label>
          <textarea
            value={formData.overallStrategy}
            onChange={(e) => handleChange('overallStrategy', e.target.value)}
            placeholder="Describe the overall strategy for the course (e.g. play conservative, focus on fairway, aggressive on par 5s)..."
            className={tw.textarea}
          />
          <p className={tw.helperText}>
            Your general approach to the course based on the player's strengths
          </p>
        </div>

        {/* Actions */}
        <div className={tw.actions}>
          {onCancel && (
            <Button variant="secondary" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
          )}
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save course strategy'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CourseStrategyBuilder;
