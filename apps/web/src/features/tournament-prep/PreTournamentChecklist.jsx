/**
 * PreTournamentChecklist
 * Interactive checklist for pre-tournament preparation
 *
 * Features:
 * - Equipment check
 * - Course reconnaissance
 * - Practice round
 * - Mental routine
 * - Nutrition plan
 * - Track completion status
 * - Auto-save on check/uncheck
 */

import React, { useState, useCallback } from 'react';
import { useTournamentPrep } from '../../hooks/useTournamentPrep';
import { track } from '../../analytics/track';
import { SectionTitle, SubSectionTitle } from '../../components/typography';

// ═══════════════════════════════════════════
// TAILWIND CLASSES
// ═══════════════════════════════════════════

const tw = {
  container: 'flex flex-col gap-6',
  header: 'flex items-center justify-between',
  title: 'text-xl font-semibold text-[var(--text-inverse)] m-0',
  subtitle: 'text-sm text-[var(--video-text-secondary)]',
  progressCard: 'p-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-xl border border-primary',
  progressLabel: 'text-sm font-semibold text-[var(--text-inverse)] mb-2',
  progressBar: 'w-full h-3 bg-surface-elevated rounded-full overflow-hidden mb-2',
  progressFill: 'h-full bg-primary transition-all duration-500',
  progressText: 'text-xs text-[var(--video-text-secondary)]',
  checklistSection: 'flex flex-col gap-3',
  checklistItem: 'p-4 bg-surface rounded-xl border border-border hover:border-primary transition-colors',
  checklistItemCompleted: 'p-4 bg-tier-success/10 rounded-xl border-2 border-tier-success',
  checklistHeader: 'flex items-start gap-3 cursor-pointer',
  checkbox: 'w-5 h-5 mt-0.5 flex-shrink-0 cursor-pointer',
  checklistContent: 'flex-1',
  checklistTitle: 'text-base font-semibold text-[var(--text-inverse)] mb-1',
  checklistDescription: 'text-sm text-[var(--video-text-secondary)]',
  emptyState: 'flex flex-col items-center justify-center gap-3 py-12 text-center bg-surface rounded-xl border border-border',
  emptyIcon: 'text-5xl opacity-30',
  emptyTitle: 'text-base font-semibold text-[var(--text-inverse)] m-0',
  emptyDescription: 'text-sm text-[var(--video-text-secondary)] m-0 max-w-xs',
  errorMessage: 'py-2 px-3 bg-tier-error/20 border border-tier-error rounded-lg text-tier-error text-sm',
};

// ═══════════════════════════════════════════
// CHECKLIST ITEMS
// ═══════════════════════════════════════════

const CHECKLIST_ITEMS = [
  {
    key: 'equipmentChecked',
    title: 'Equipment Check',
    description: 'Check that all equipment is complete and in order (clubs, balls, gloves, tees)',
  },
  {
    key: 'courseReconDone',
    title: 'Course Reconnaissance',
    description: 'Walk the course or study maps/photos to learn layout and challenges',
  },
  {
    key: 'practiceRoundCompleted',
    title: 'Practice Round',
    description: 'Play at least one practice round on the course to test strategy',
  },
  {
    key: 'mentalRoutineSet',
    title: 'Mental Routine',
    description: 'Define and practice pre-shot routine and mental focus points',
  },
  {
    key: 'nutritionPlanned',
    title: 'Nutrition Plan',
    description: 'Plan food and hydration for tournament day',
  },
];

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function PreTournamentChecklist({
  className = '',
  preparation,
}) {
  const {
    updateChecklistItem,
    saving,
  } = useTournamentPrep();

  const [error, setError] = useState(null);

  const checklist = preparation?.checklist || {};

  // Calculate completion percentage
  const calculateCompletion = useCallback(() => {
    const completed = CHECKLIST_ITEMS.filter(
      (item) => checklist[item.key] === true
    ).length;
    return Math.round((completed / CHECKLIST_ITEMS.length) * 100);
  }, [checklist]);

  // Handle checkbox toggle
  const handleToggle = useCallback(
    async (itemKey) => {
      if (!preparation?.id) {
        setError('No preparation selected');
        return;
      }

      const newValue = !checklist[itemKey];

      try {
        await updateChecklistItem(preparation.id, {
          [itemKey]: newValue,
        });

        track('checklist_item_toggled', {
          screen: 'PreTournamentChecklist',
          itemKey,
          checked: newValue,
          prepId: preparation.id,
        });

        setError(null);
      } catch (err) {
        console.error('Failed to update checklist:', err);
        setError('Could not update checklist');
      }
    },
    [preparation, checklist, updateChecklistItem]
  );

  // If no preparation, show message
  if (!preparation) {
    return (
      <div className={`${tw.container} ${className}`}>
        <div className={tw.emptyState}>
          <div className={tw.emptyIcon}>✅</div>
          <SubSectionTitle style={{ marginBottom: 0 }}>No preparation selected</SubSectionTitle>
          <p className={tw.emptyDescription}>
            Select or create a tournament preparation to use the checklist
          </p>
        </div>
      </div>
    );
  }

  const completion = calculateCompletion();

  return (
    <div className={`${tw.container} ${className}`}>
      {/* Header */}
      <div className={tw.header}>
        <div>
          <SectionTitle style={{ marginBottom: 0 }}>Pre-Tournament Checklist</SectionTitle>
          <p className={tw.subtitle}>
            Make sure everything is ready before the tournament
          </p>
        </div>
      </div>

      {/* Progress Card */}
      <div className={tw.progressCard}>
        <div className={tw.progressLabel}>
          Progress: {completion}% complete
        </div>
        <div className={tw.progressBar}>
          <div
            className={tw.progressFill}
            style={{ width: `${completion}%` }}
          />
        </div>
        <div className={tw.progressText}>
          {CHECKLIST_ITEMS.filter((item) => checklist[item.key]).length} of{' '}
          {CHECKLIST_ITEMS.length} tasks completed
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={tw.errorMessage}>{error}</div>
      )}

      {/* Checklist Items */}
      <div className={tw.checklistSection}>
        {CHECKLIST_ITEMS.map((item) => {
          const isCompleted = checklist[item.key] === true;

          return (
            <div
              key={item.key}
              className={
                isCompleted ? tw.checklistItemCompleted : tw.checklistItem
              }
            >
              <div
                className={tw.checklistHeader}
                onClick={() => handleToggle(item.key)}
              >
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={() => handleToggle(item.key)}
                  className={tw.checkbox}
                  disabled={saving}
                />
                <div className={tw.checklistContent}>
                  <SubSectionTitle style={{ marginBottom: '4px' }}>{item.title}</SubSectionTitle>
                  <p className={tw.checklistDescription}>
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
      {completion === 100 && (
        <div className="p-4 bg-tier-success/20 rounded-xl border-2 border-tier-success text-center">
          <div className="text-base font-semibold text-tier-success">
            Congratulations! All preparations are complete!
          </div>
          <div className="text-sm text-[var(--video-text-secondary)] mt-1">
            You are ready for the tournament. Good luck!
          </div>
        </div>
      )}
    </div>
  );
}

export default PreTournamentChecklist;
