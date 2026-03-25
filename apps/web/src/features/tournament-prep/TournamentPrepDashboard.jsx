/**
 * TournamentPrepDashboard
 * Dashboard for tournament preparation
 *
 * Features:
 * - List all tournament preparations
 * - Filter by tournament, player, status
 * - Search by tournament name
 * - Create new preparation
 * - Edit existing preparation
 * - View full preparation details
 * - Track completion status
 */

import React, { useState, useCallback } from 'react';
import { useTournamentPrep } from '../../hooks/useTournamentPrep';
import Button from '../../ui/primitives/Button';
import StateCard from '../../ui/composites/StateCard';
import { track } from '../../analytics/track';
import { PageHeader } from '../../ui/raw-blocks';
import { SubSectionTitle } from '../../components/typography';

// ═══════════════════════════════════════════
// TAILWIND CLASSES
// ═══════════════════════════════════════════

const tw = {
  container: 'flex flex-col gap-6',
  header: 'flex items-center justify-between',
  title: 'text-2xl font-bold text-[var(--text-inverse)] m-0',
  headerActions: 'flex gap-2',
  filters: 'flex gap-4 flex-wrap items-center',
  search: 'flex-1 max-w-md',
  searchInput: 'w-full py-2 px-3 bg-surface-elevated border border-border rounded-lg text-[var(--text-inverse)] text-sm placeholder-[var(--video-text-tertiary)]',
  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
  card: 'p-5 bg-surface rounded-xl border border-border hover:border-primary transition-colors cursor-pointer',
  cardHeader: 'flex items-start justify-between mb-4',
  cardTitle: 'text-base font-semibold text-[var(--text-inverse)] m-0 flex-1',
  statusBadge: {
    draft: 'inline-flex py-1 px-2 bg-yellow-500/20 border border-yellow-500 rounded-md text-yellow-500 text-xs font-medium',
    ready: 'inline-flex py-1 px-2 bg-tier-success/20 border border-tier-success rounded-md text-tier-success text-xs font-medium',
  },
  cardInfo: 'flex flex-col gap-2 mb-4',
  infoRow: 'flex items-center gap-2 text-sm text-[var(--video-text-secondary)]',
  infoIcon: 'text-base',
  progressSection: 'mb-4',
  progressLabel: 'text-xs font-semibold text-[var(--video-text-secondary)] uppercase tracking-wider mb-2',
  progressBar: 'w-full h-2 bg-surface-elevated rounded-full overflow-hidden',
  progressFill: 'h-full bg-primary transition-all duration-300',
  cardActions: 'flex gap-2',
  actionButton: 'flex-1 py-2 px-3 bg-surface-elevated border border-border rounded-lg text-[var(--text-inverse)] text-xs font-medium cursor-pointer hover:bg-surface-elevated-hover transition-colors text-center',
  primaryActionButton: 'flex-1 py-2 px-3 bg-primary border-2 border-primary rounded-lg text-white text-xs font-medium cursor-pointer hover:bg-primary-hover transition-colors text-center',
  emptyState: 'flex flex-col items-center justify-center gap-3 py-12 text-center',
  emptyIcon: 'text-5xl opacity-30',
  emptyTitle: 'text-base font-semibold text-[var(--text-inverse)] m-0',
  emptyDescription: 'text-sm text-[var(--video-text-secondary)] m-0 max-w-xs',
};

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function TournamentPrepDashboard({
  className = '',
  onCreatePrep,
  onEditPrep,
  onViewPrep,
}) {
  const {
    preparations,
    loading,
    error,
    refresh,
  } = useTournamentPrep();

  const [searchQuery, setSearchQuery] = useState('');

  // Filter preparations
  const filteredPreparations = preparations.filter((prep) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        prep.tournament?.name?.toLowerCase().includes(query) ||
        prep.player?.name?.toLowerCase().includes(query) ||
        prep.mentalFocusAreas?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Calculate completion percentage
  const calculateCompletion = useCallback((prep) => {
    let completed = 0;
    let total = 0;

    // Course strategy
    if (prep.courseStrategy) {
      completed++;
    }
    total++;

    // Hole strategies (consider at least 50% of holes planned)
    if (prep.courseStrategy?.holes?.length >= 9) {
      completed++;
    }
    total++;

    // Checklist
    if (prep.checklist) {
      const checklistItems = [
        prep.checklist.equipmentChecked,
        prep.checklist.courseReconDone,
        prep.checklist.practiceRoundCompleted,
        prep.checklist.mentalRoutineSet,
        prep.checklist.nutritionPlanned,
      ];
      const checklistCompleted = checklistItems.filter(Boolean).length;
      completed += checklistCompleted / 5;
      total++;
    } else {
      total++;
    }

    // Goals set
    if (prep.goalScore || prep.processGoals?.length > 0) {
      completed++;
    }
    total++;

    return Math.round((completed / total) * 100);
  }, []);

  // Handle view prep
  const handleView = useCallback(
    (prep) => {
      if (onViewPrep) {
        onViewPrep(prep);
      }

      track('tournament_prep_viewed', {
        screen: 'TournamentPrepDashboard',
        prepId: prep.id,
      });
    },
    [onViewPrep]
  );

  // Handle edit prep
  const handleEdit = useCallback(
    (prep, e) => {
      e.stopPropagation();
      if (onEditPrep) {
        onEditPrep(prep);
      }
    },
    [onEditPrep]
  );

  // Loading state
  if (loading && preparations.length === 0) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard variant="loading" title="Loading tournament preparations..." />
      </div>
    );
  }

  // Error state
  if (error && preparations.length === 0) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard
          variant="error"
          title="Could not load preparations"
          description={error}
          action={<Button variant="primary" onClick={refresh}>Try again</Button>}
        />
      </div>
    );
  }

  return (
    <div className={`${tw.container} ${className}`}>
      {/* Header */}
      <PageHeader
        title="Tournament Preparation"
        subtitle="Prepare for upcoming tournaments with course strategies and checklists"
        helpText="Overview of tournament preparations. Create and manage preparations with course strategies, hole-by-hole plans, checklists and target scores. View completion status, search by tournament or player, and track progress towards tournament date."
        actions={
          <>
            <Button variant="secondary" onClick={refresh}>
              🔄 Refresh
            </Button>
            {onCreatePrep && (
              <Button variant="primary" onClick={onCreatePrep}>
                ➕ New Preparation
              </Button>
            )}
          </>
        }
      />

      {/* Search */}
      <div className={tw.filters}>
        <div className={tw.search}>
          <input
            type="text"
            placeholder="Search for tournament, player or focus area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={tw.searchInput}
          />
        </div>
      </div>

      {/* Preparations Grid */}
      {filteredPreparations.length === 0 ? (
        <div className={tw.emptyState}>
          <div className={tw.emptyIcon}></div>
          <SubSectionTitle style={{ marginBottom: 0 }}>No preparations found</SubSectionTitle>
          <p className={tw.emptyDescription}>
            {searchQuery
              ? 'No preparations match your search'
              : 'Create your first tournament preparation to get started'}
          </p>
          {onCreatePrep && !searchQuery && (
            <Button variant="primary" onClick={onCreatePrep}>
              ➕ Create Preparation
            </Button>
          )}
        </div>
      ) : (
        <div className={tw.grid}>
          {filteredPreparations.map((prep) => {
            const completion = calculateCompletion(prep);
            const isReady = completion >= 80;

            return (
              <div
                key={prep.id}
                className={tw.card}
                onClick={() => handleView(prep)}
              >
                <div className={tw.cardHeader}>
                  <SubSectionTitle style={{ marginBottom: 0, flex: 1 }}>
                    {prep.tournament?.name || 'Unknown tournament'}
                  </SubSectionTitle>
                  <span className={tw.statusBadge[isReady ? 'ready' : 'draft']}>
                    {isReady ? '✓ Ready' : '⏳ In progress'}
                  </span>
                </div>

                <div className={tw.cardInfo}>
                  <div className={tw.infoRow}>
                    <span className={tw.infoIcon}>👤</span>
                    <span>{prep.player?.name || 'Unknown player'}</span>
                  </div>
                  <div className={tw.infoRow}>
                    <span className={tw.infoIcon}>📅</span>
                    <span>
                      {prep.tournament?.date
                        ? new Date(prep.tournament.date).toLocaleDateString('en-US')
                        : 'No date'}
                    </span>
                  </div>
                  {prep.goalScore && (
                    <div className={tw.infoRow}>
                      <span className={tw.infoIcon}></span>
                      <span>Target score: {prep.goalScore}</span>
                    </div>
                  )}
                </div>

                {/* Completion Progress */}
                <div className={tw.progressSection}>
                  <div className={tw.progressLabel}>
                    Completed: {completion}%
                  </div>
                  <div className={tw.progressBar}>
                    <div
                      className={tw.progressFill}
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                </div>

                <div className={tw.cardActions}>
                  <button
                    onClick={(e) => handleEdit(prep, e)}
                    className={tw.actionButton}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(prep);
                    }}
                    className={tw.primaryActionButton}
                  >
                    👁️ View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TournamentPrepDashboard;
