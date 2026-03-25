/**
 * TournamentPrepForm
 * Form for creating and editing tournament preparation
 *
 * Features:
 * - Select tournament and player
 * - Set goal score
 * - Define mental focus areas
 * - Set process goals
 * - Save preparation
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTournamentPrep } from '../../hooks/useTournamentPrep';
import Button from '../../ui/primitives/Button';
import { track } from '../../analytics/track';
import { SectionTitle } from '../../components/typography';

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
  textarea: 'w-full py-2 px-3 bg-surface-elevated border border-border rounded-lg text-[var(--text-inverse)] text-sm placeholder-[var(--video-text-tertiary)] min-h-[100px] resize-y',
  select: 'w-full py-2 px-3 bg-surface-elevated border border-border rounded-lg text-[var(--text-inverse)] text-sm',
  helperText: 'text-xs text-[var(--video-text-secondary)] mt-1',
  goalsList: 'flex flex-col gap-2',
  goalItem: 'flex items-center gap-2 p-2 bg-surface-elevated rounded-lg border border-border',
  goalText: 'flex-1 text-sm text-[var(--text-inverse)]',
  removeButton: 'py-1 px-2 bg-tier-error/20 border border-tier-error rounded-md text-tier-error text-xs font-medium cursor-pointer hover:bg-tier-error/30 transition-colors',
  addGoalRow: 'flex gap-2',
  addGoalInput: 'flex-1 py-2 px-3 bg-surface-elevated border border-border rounded-lg text-[var(--text-inverse)] text-sm',
  addGoalButton: 'py-2 px-4 bg-primary border-2 border-primary rounded-lg text-white text-sm font-medium cursor-pointer hover:bg-primary-hover transition-colors',
  actions: 'flex gap-3 justify-end pt-4 border-t border-border',
  errorMessage: 'py-2 px-3 bg-tier-error/20 border border-tier-error rounded-lg text-tier-error text-sm',
};

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function TournamentPrepForm({
  className = '',
  preparation = null,
  onSave,
  onCancel,
}) {
  const {
    createPreparation,
    updatePreparation,
    saving,
    error: apiError,
  } = useTournamentPrep();

  // Form state
  const [formData, setFormData] = useState({
    tournamentId: preparation?.tournamentId || '',
    playerId: preparation?.playerId || '',
    goalScore: preparation?.goalScore || '',
    mentalFocusAreas: preparation?.mentalFocusAreas || '',
    processGoals: preparation?.processGoals || [],
  });

  const [newGoal, setNewGoal] = useState('');
  const [error, setError] = useState(null);

  // Update form when preparation changes
  useEffect(() => {
    if (preparation) {
      setFormData({
        tournamentId: preparation.tournamentId || '',
        playerId: preparation.playerId || '',
        goalScore: preparation.goalScore || '',
        mentalFocusAreas: preparation.mentalFocusAreas || '',
        processGoals: preparation.processGoals || [],
      });
    }
  }, [preparation]);

  // Handle input change
  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  }, []);

  // Add process goal
  const handleAddGoal = useCallback(() => {
    if (!newGoal.trim()) return;

    setFormData((prev) => ({
      ...prev,
      processGoals: [...prev.processGoals, newGoal.trim()],
    }));
    setNewGoal('');
  }, [newGoal]);

  // Remove process goal
  const handleRemoveGoal = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      processGoals: prev.processGoals.filter((_, i) => i !== index),
    }));
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    if (!formData.tournamentId) {
      setError('Tournament is required');
      return false;
    }

    if (!formData.playerId) {
      setError('Player is required');
      return false;
    }

    return true;
  }, [formData]);

  // Handle save
  const handleSave = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      try {
        let savedPrep;
        if (preparation?.id) {
          savedPrep = await updatePreparation(preparation.id, formData);
        } else {
          savedPrep = await createPreparation(formData);
        }

        track('tournament_prep_saved', {
          screen: 'TournamentPrepForm',
          mode: preparation?.id ? 'edit' : 'create',
        });

        if (onSave) {
          onSave(savedPrep);
        }
      } catch (err) {
        console.error('Failed to save preparation:', err);
        setError('Could not save preparation');
      }
    },
    [formData, preparation, validateForm, createPreparation, updatePreparation, onSave]
  );

  return (
    <div className={`${tw.container} ${className}`}>
      {/* Header */}
      <div className={tw.header}>
        <SectionTitle style={{ marginBottom: 0 }}>
          {preparation?.id ? 'Edit Preparation' : 'New Tournament Preparation'}
        </SectionTitle>
      </div>

      {/* Error Message */}
      {(error || apiError) && (
        <div className={tw.errorMessage}>{error || apiError}</div>
      )}

      {/* Form */}
      <form className={tw.form} onSubmit={handleSave}>
        {/* Tournament Selection */}
        <div className={tw.formGroup}>
          <label className={tw.label}>
            Tournament<span className={tw.required}>*</span>
          </label>
          <select
            value={formData.tournamentId}
            onChange={(e) => handleChange('tournamentId', e.target.value)}
            className={tw.select}
            required
          >
            <option value="">Select tournament...</option>
            {/* TODO: Load tournaments from API */}
            <option value="demo-tournament-1">Demo Tournament 2024</option>
          </select>
        </div>

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
          >
            <option value="">Select player...</option>
            <option value="00000000-0000-0000-0000-000000000004">Demo Player</option>
            {/* TODO: Load players from API */}
          </select>
        </div>

        {/* Goal Score */}
        <div className={tw.formGroup}>
          <label className={tw.label}>Goal Score</label>
          <input
            type="number"
            value={formData.goalScore}
            onChange={(e) => handleChange('goalScore', e.target.value)}
            placeholder="E.g. 72"
            className={tw.input}
            min="0"
            max="200"
          />
          <p className={tw.helperText}>
            Set a realistic goal for what the player should score in the tournament
          </p>
        </div>

        {/* Mental Focus Areas */}
        <div className={tw.formGroup}>
          <label className={tw.label}>Mental Focus Areas</label>
          <textarea
            value={formData.mentalFocusAreas}
            onChange={(e) => handleChange('mentalFocusAreas', e.target.value)}
            placeholder="Describe mental aspects the player should focus on..."
            className={tw.textarea}
          />
          <p className={tw.helperText}>
            E.g. stay calm under pressure, positive self-talk, focus on process
          </p>
        </div>

        {/* Process Goals */}
        <div className={tw.formGroup}>
          <label className={tw.label}>Process Goals</label>
          <div className={tw.goalsList}>
            {formData.processGoals.map((goal, index) => (
              <div key={index} className={tw.goalItem}>
                <span className={tw.goalText}>• {goal}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveGoal(index)}
                  className={tw.removeButton}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className={tw.addGoalRow}>
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Add process goal..."
              className={tw.addGoalInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddGoal();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddGoal}
              className={tw.addGoalButton}
            >
              + Add
            </button>
          </div>
          <p className={tw.helperText}>
            Process goals focus on actions the player can control (e.g. "Stay focused on each shot", "Follow pre-shot routine")
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
            {saving ? 'Saving...' : 'Save Preparation'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default TournamentPrepForm;
