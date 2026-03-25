/**
 * TrackManSessionDetail
 * Detailed view of a TrackMan session with all shots
 *
 * Features:
 * - Session info and statistics
 * - Shot-by-shot list with metrics
 * - Filter by club type
 * - Sort by various metrics
 * - Export session data
 * - Add manual shots
 */

import React, { useState, useCallback, useEffect } from 'react';
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
  header: 'flex items-start justify-between',
  headerContent: 'flex-1',
  title: 'text-2xl font-bold text-[var(--text-inverse)] m-0 mb-2',
  subtitle: 'text-sm text-[var(--video-text-secondary)]',
  headerActions: 'flex gap-2',
  statsGrid: 'grid grid-cols-2 md:grid-cols-4 gap-4',
  statCard: 'p-4 bg-surface rounded-xl border border-border',
  statLabel: 'text-xs font-semibold text-[var(--video-text-secondary)] uppercase tracking-wider mb-2',
  statValue: 'text-2xl font-bold text-[var(--text-inverse)]',
  statUnit: 'text-sm text-[var(--video-text-secondary)] ml-1',
  filters: 'flex gap-4 flex-wrap items-center',
  filterGroup: 'flex gap-2',
  filterButton: 'py-2 px-4 bg-surface-elevated border border-border rounded-lg text-[var(--text-inverse)] text-sm font-medium cursor-pointer hover:bg-surface-elevated-hover transition-colors',
  filterButtonActive: 'py-2 px-4 bg-primary border-2 border-primary rounded-lg text-white text-sm font-medium cursor-pointer',
  shotsList: 'flex flex-col gap-2',
  shotCard: 'p-4 bg-surface rounded-xl border border-border hover:border-primary transition-colors cursor-pointer',
  shotHeader: 'flex items-center justify-between mb-3',
  shotNumber: 'text-sm font-semibold text-[var(--video-text-secondary)]',
  shotClub: 'text-base font-bold text-[var(--text-inverse)]',
  shotMetrics: 'grid grid-cols-3 md:grid-cols-6 gap-3',
  metric: 'flex flex-col',
  metricLabel: 'text-xs text-[var(--video-text-secondary)] mb-1',
  metricValue: 'text-sm font-semibold text-[var(--text-inverse)]',
  emptyState: 'flex flex-col items-center justify-center gap-3 py-12 text-center bg-surface rounded-xl border border-border',
  emptyIcon: 'text-5xl opacity-30',
  emptyTitle: 'text-base font-semibold text-[var(--text-inverse)] m-0',
  emptyDescription: 'text-sm text-[var(--video-text-secondary)] m-0 max-w-xs',
};

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function TrackManSessionDetail({
  className = '',
  sessionId,
  onBack,
  onAddShot,
}) {
  const {
    selectedSession,
    shots,
    loading,
    error,
    fetchSession,
  } = useTrackMan({ sessionId });

  const [clubFilter, setClubFilter] = useState('all');
  const [sortBy, setSortBy] = useState('number'); // number, carryDistance, ballSpeed

  // Fetch session on mount
  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId);
    }
  }, [sessionId, fetchSession]);

  // Get unique clubs
  const clubs = Array.from(new Set(shots.map(s => s.club).filter(Boolean)));

  // Filter and sort shots
  const filteredShots = shots
    .filter((shot) => {
      if (clubFilter === 'all') return true;
      return shot.club === clubFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'carryDistance':
          return (b.carryDistance || 0) - (a.carryDistance || 0);
        case 'ballSpeed':
          return (b.ballSpeed || 0) - (a.ballSpeed || 0);
        case 'number':
        default:
          return (a.shotNumber || 0) - (b.shotNumber || 0);
      }
    });

  // Calculate session statistics
  const calculateStats = useCallback(() => {
    if (shots.length === 0) {
      return {
        avgCarry: 0,
        avgBallSpeed: 0,
        avgClubSpeed: 0,
        avgLaunchAngle: 0,
      };
    }

    const sum = shots.reduce(
      (acc, shot) => ({
        carry: acc.carry + (shot.carryDistance || 0),
        ballSpeed: acc.ballSpeed + (shot.ballSpeed || 0),
        clubSpeed: acc.clubSpeed + (shot.clubSpeed || 0),
        launchAngle: acc.launchAngle + (shot.launchAngle || 0),
      }),
      { carry: 0, ballSpeed: 0, clubSpeed: 0, launchAngle: 0 }
    );

    return {
      avgCarry: Math.round(sum.carry / shots.length),
      avgBallSpeed: Math.round(sum.ballSpeed / shots.length),
      avgClubSpeed: Math.round(sum.clubSpeed / shots.length),
      avgLaunchAngle: (sum.launchAngle / shots.length).toFixed(1),
    };
  }, [shots]);

  // Handle export
  const handleExport = useCallback(() => {
    alert('Eksport-funksjonalitet kommer snart');

    track('trackman_session_exported', {
      screen: 'TrackManSessionDetail',
      sessionId: selectedSession?.id,
      shotCount: shots.length,
    });
  }, [selectedSession, shots]);

  // Loading state
  if (loading && !selectedSession) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard variant="loading" title="Laster økt..." />
      </div>
    );
  }

  // Error state
  if (error && !selectedSession) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard
          variant="error"
          title="Kunne ikke laste økt"
          description={error}
          action={onBack && <Button variant="primary" onClick={onBack}>Tilbake</Button>}
        />
      </div>
    );
  }

  // No session
  if (!selectedSession) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard
          variant="error"
          title="Ingen økt valgt"
          description="Velg en økt å vise"
        />
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className={`${tw.container} ${className}`}>
      {/* Header */}
      <div className={tw.header}>
        <div className={tw.headerContent}>
          <PageTitle style={{ marginBottom: '8px' }}>
            {selectedSession.location || 'Launch Monitor Økt'}
          </PageTitle>
          <p className={tw.subtitle}>
            {new Date(selectedSession.date).toLocaleDateString('nb-NO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {' • '}
            {selectedSession.player?.name || 'Ukjent spiller'}
          </p>
        </div>
        <div className={tw.headerActions}>
          {onBack && (
            <Button variant="secondary" onClick={onBack}>
              ← Tilbake
            </Button>
          )}
          <Button variant="secondary" onClick={handleExport}>
            📥 Eksporter
          </Button>
          {onAddShot && (
            <Button variant="primary" onClick={onAddShot}>
              ➕ Legg til slag
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Grid */}
      <div className={tw.statsGrid}>
        <div className={tw.statCard}>
          <div className={tw.statLabel}>Totalt slag</div>
          <div className={tw.statValue}>{shots.length}</div>
        </div>
        <div className={tw.statCard}>
          <div className={tw.statLabel}>Avg. Carry</div>
          <div className={tw.statValue}>
            {stats.avgCarry}
            <span className={tw.statUnit}>m</span>
          </div>
        </div>
        <div className={tw.statCard}>
          <div className={tw.statLabel}>Avg. Ball Speed</div>
          <div className={tw.statValue}>
            {stats.avgBallSpeed}
            <span className={tw.statUnit}>mph</span>
          </div>
        </div>
        <div className={tw.statCard}>
          <div className={tw.statLabel}>Avg. Club Speed</div>
          <div className={tw.statValue}>
            {stats.avgClubSpeed}
            <span className={tw.statUnit}>mph</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={tw.filters}>
        <div className={tw.filterGroup}>
          <button
            onClick={() => setClubFilter('all')}
            className={clubFilter === 'all' ? tw.filterButtonActive : tw.filterButton}
          >
            Alle køller
          </button>
          {clubs.map((club) => (
            <button
              key={club}
              onClick={() => setClubFilter(club)}
              className={clubFilter === club ? tw.filterButtonActive : tw.filterButton}
            >
              {club}
            </button>
          ))}
        </div>

        <div className={tw.filterGroup}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={tw.filterButton}
          >
            <option value="number">Sorter: Slag nummer</option>
            <option value="carryDistance">Sorter: Carry distanse</option>
            <option value="ballSpeed">Sorter: Ball speed</option>
          </select>
        </div>
      </div>

      {/* Shots List */}
      {filteredShots.length === 0 ? (
        <div className={tw.emptyState}>
          <div className={tw.emptyIcon}>🏌️</div>
          <SubSectionTitle style={{ marginBottom: 0 }}>Ingen slag funnet</SubSectionTitle>
          <p className={tw.emptyDescription}>
            {clubFilter !== 'all'
              ? `Ingen slag med ${clubFilter} i denne økten`
              : 'Legg til slag for å begynne å spore data'}
          </p>
          {onAddShot && (
            <Button variant="primary" onClick={onAddShot}>
              ➕ Legg til slag
            </Button>
          )}
        </div>
      ) : (
        <div className={tw.shotsList}>
          {filteredShots.map((shot, index) => (
            <div key={shot.id || index} className={tw.shotCard}>
              <div className={tw.shotHeader}>
                <span className={tw.shotNumber}>
                  Slag #{shot.shotNumber || index + 1}
                </span>
                <span className={tw.shotClub}>{shot.club || 'Ukjent'}</span>
              </div>

              <div className={tw.shotMetrics}>
                <div className={tw.metric}>
                  <div className={tw.metricLabel}>Carry</div>
                  <div className={tw.metricValue}>
                    {shot.carryDistance ? `${Math.round(shot.carryDistance)}m` : '-'}
                  </div>
                </div>
                <div className={tw.metric}>
                  <div className={tw.metricLabel}>Total</div>
                  <div className={tw.metricValue}>
                    {shot.totalDistance ? `${Math.round(shot.totalDistance)}m` : '-'}
                  </div>
                </div>
                <div className={tw.metric}>
                  <div className={tw.metricLabel}>Ball Speed</div>
                  <div className={tw.metricValue}>
                    {shot.ballSpeed ? `${Math.round(shot.ballSpeed)} mph` : '-'}
                  </div>
                </div>
                <div className={tw.metric}>
                  <div className={tw.metricLabel}>Club Speed</div>
                  <div className={tw.metricValue}>
                    {shot.clubSpeed ? `${Math.round(shot.clubSpeed)} mph` : '-'}
                  </div>
                </div>
                <div className={tw.metric}>
                  <div className={tw.metricLabel}>Launch Angle</div>
                  <div className={tw.metricValue}>
                    {shot.launchAngle ? `${shot.launchAngle.toFixed(1)}°` : '-'}
                  </div>
                </div>
                <div className={tw.metric}>
                  <div className={tw.metricLabel}>Spin Rate</div>
                  <div className={tw.metricValue}>
                    {shot.spinRate ? `${Math.round(shot.spinRate)} rpm` : '-'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrackManSessionDetail;
