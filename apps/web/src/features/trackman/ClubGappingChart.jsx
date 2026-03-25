/**
 * ClubGappingChart
 * Visualize club distance gaps
 *
 * Features:
 * - Bar chart showing average distances per club
 * - Gap analysis between clubs
 * - Identify problematic gaps
 * - Recommendations for club adjustments
 * - Calculate and display gapping
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTrackMan } from '../../hooks/useTrackMan';
import Button from '../../ui/primitives/Button';
import StateCard from '../../ui/composites/StateCard';
import { track } from '../../analytics/track';
import { PageTitle, SubSectionTitle } from '../../components/typography';

// ═══════════════════════════════════════════
// TAILWIND CLASSES
// ═══════════════════════════════════════════

const tw = {
  container: 'flex flex-col gap-6',
  header: 'flex items-center justify-between',
  title: 'text-2xl font-bold text-[var(--text-inverse)] m-0',
  headerActions: 'flex gap-2',
  infoCard: 'p-4 bg-blue-500/10 rounded-xl border border-blue-500',
  infoTitle: 'text-sm font-semibold text-[var(--text-inverse)] mb-2',
  infoText: 'text-xs text-[var(--video-text-secondary)]',
  chartContainer: 'p-6 bg-surface rounded-xl border border-border',
  clubList: 'flex flex-col gap-3',
  clubRow: 'flex items-center gap-4',
  clubName: 'w-24 text-sm font-semibold text-[var(--text-inverse)]',
  barContainer: 'flex-1 relative h-12 bg-surface-elevated rounded-lg overflow-hidden',
  bar: 'h-full bg-primary transition-all duration-500',
  distanceLabel: 'absolute right-2 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--text-inverse)]',
  gapIndicator: 'w-16 text-sm text-center',
  gapGood: 'text-tier-success font-semibold',
  gapWarning: 'text-yellow-500 font-semibold',
  gapBad: 'text-tier-error font-semibold',
  summarySection: 'grid grid-cols-1 md:grid-cols-3 gap-4',
  summaryCard: 'p-4 bg-surface-elevated rounded-xl',
  summaryLabel: 'text-xs font-semibold text-[var(--video-text-secondary)] uppercase tracking-wider mb-2',
  summaryValue: 'text-2xl font-bold text-[var(--text-inverse)]',
  emptyState: 'flex flex-col items-center justify-center gap-3 py-12 text-center bg-surface rounded-xl border border-border',
  emptyIcon: 'text-5xl opacity-30',
  emptyTitle: 'text-base font-semibold text-[var(--text-inverse)] m-0',
  emptyDescription: 'text-sm text-[var(--video-text-secondary)] m-0 max-w-xs',
};

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function ClubGappingChart({
  className = '',
  playerId,
  onBack,
}) {
  const {
    clubGapping,
    loading,
    error,
    fetchClubGapping,
    calculateClubGapping,
    saving,
  } = useTrackMan();

  const [calculating, setCalculating] = useState(false);

  // Fetch club gapping on mount
  useEffect(() => {
    if (playerId) {
      fetchClubGapping(playerId);
    }
  }, [playerId, fetchClubGapping]);

  // Handle calculate
  const handleCalculate = useCallback(async () => {
    if (!playerId) return;

    setCalculating(true);
    try {
      await calculateClubGapping(playerId);

      track('club_gapping_calculated', {
        screen: 'ClubGappingChart',
        playerId,
      });
    } catch (err) {
      console.error('Failed to calculate club gapping:', err);
    } finally {
      setCalculating(false);
    }
  }, [playerId, calculateClubGapping]);

  // Calculate gap quality
  const getGapQuality = (gap) => {
    if (!gap) return 'good';
    if (gap < 8) return 'bad'; // Too small gap
    if (gap > 20) return 'bad'; // Too large gap
    if (gap > 15) return 'warning'; // Slightly large
    return 'good'; // Ideal gap (8-15 meters)
  };

  // Loading state
  if (loading && !clubGapping) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard variant="loading" title="Laster club gapping..." />
      </div>
    );
  }

  // Error state
  if (error && !clubGapping) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard
          variant="error"
          title="Kunne ikke laste club gapping"
          description={error}
          action={onBack && <Button variant="primary" onClick={onBack}>Tilbake</Button>}
        />
      </div>
    );
  }

  // No data
  if (!clubGapping || !clubGapping.clubs || clubGapping.clubs.length === 0) {
    return (
      <div className={`${tw.container} ${className}`}>
        {/* Header */}
        <div className={tw.header}>
          <PageTitle style={{ marginBottom: 0 }}>Club Gapping</PageTitle>
          <div className={tw.headerActions}>
            {onBack && (
              <Button variant="secondary" onClick={onBack}>
                ← Tilbake
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleCalculate}
              disabled={calculating || saving}
            >
              {calculating ? ' Beregner...' : ' Beregn Gapping'}
            </Button>
          </div>
        </div>

        <div className={tw.emptyState}>
          <div className={tw.emptyIcon}>ruler</div>
          <SubSectionTitle style={{ marginBottom: 0 }}>Ingen gapping-data</SubSectionTitle>
          <p className={tw.emptyDescription}>
            Klikk "Beregn Gapping" for å analysere distanser basert på tidligere økter
          </p>
        </div>
      </div>
    );
  }

  const clubs = clubGapping.clubs || [];
  const maxDistance = Math.max(...clubs.map(c => c.avgDistance || 0));

  // Calculate summary stats
  const avgGap = clubs.length > 1
    ? clubs.slice(0, -1).reduce((sum, club, i) => {
        const gap = club.avgDistance - clubs[i + 1].avgDistance;
        return sum + gap;
      }, 0) / (clubs.length - 1)
    : 0;

  const problematicGaps = clubs.slice(0, -1).filter((club, i) => {
    const gap = club.avgDistance - clubs[i + 1].avgDistance;
    return getGapQuality(gap) !== 'good';
  }).length;

  return (
    <div className={`${tw.container} ${className}`}>
      {/* Header */}
      <div className={tw.header}>
        <PageTitle style={{ marginBottom: 0 }}>Club Gapping Analyse</PageTitle>
        <div className={tw.headerActions}>
          {onBack && (
            <Button variant="secondary" onClick={onBack}>
              ← Tilbake
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleCalculate}
            disabled={calculating || saving}
          >
            {calculating ? ' Beregner...' : 'Oppdater Gapping'}
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <div className={tw.infoCard}>
        <SubSectionTitle style={{ marginBottom: '8px' }}>Om Club Gapping</SubSectionTitle>
        <p className={tw.infoText}>
          Club gapping viser gjennomsnittlig distanse for hver kølle og avstanden mellom dem.
          Ideelt gap er 8-15 meter mellom køller. For små gap (&lt;8m) betyr overlap, og for store gap (&gt;20m) betyr hull i settet.
        </p>
      </div>

      {/* Summary Section */}
      <div className={tw.summarySection}>
        <div className={tw.summaryCard}>
          <div className={tw.summaryLabel}>Totalt køller</div>
          <div className={tw.summaryValue}>{clubs.length}</div>
        </div>
        <div className={tw.summaryCard}>
          <div className={tw.summaryLabel}>Gjennomsnittlig gap</div>
          <div className={tw.summaryValue}>{Math.round(avgGap)}m</div>
        </div>
        <div className={tw.summaryCard}>
          <div className={tw.summaryLabel}>Problematiske gap</div>
          <div className={tw.summaryValue}>{problematicGaps}</div>
        </div>
      </div>

      {/* Chart */}
      <div className={tw.chartContainer}>
        <div className={tw.clubList}>
          {clubs.map((club, index) => {
            const nextClub = clubs[index + 1];
            const gap = nextClub ? club.avgDistance - nextClub.avgDistance : null;
            const gapQuality = gap ? getGapQuality(gap) : null;
            const barWidth = (club.avgDistance / maxDistance) * 100;

            return (
              <div key={club.club || index}>
                <div className={tw.clubRow}>
                  <div className={tw.clubName}>{club.club}</div>
                  <div className={tw.barContainer}>
                    <div
                      className={tw.bar}
                      style={{ width: `${barWidth}%` }}
                    />
                    <div className={tw.distanceLabel}>
                      {Math.round(club.avgDistance)}m
                    </div>
                  </div>
                  <div className={tw.gapIndicator}>
                    {gap && (
                      <span
                        className={
                          gapQuality === 'good'
                            ? tw.gapGood
                            : gapQuality === 'warning'
                            ? tw.gapWarning
                            : tw.gapBad
                        }
                      >
                        ↓ {Math.round(gap)}m
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ClubGappingChart;
