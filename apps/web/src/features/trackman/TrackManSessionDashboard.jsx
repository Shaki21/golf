/**
 * TrackManSessionDashboard
 * Dashboard for TrackMan/launch monitor sessions
 *
 * Features:
 * - List all launch monitor sessions
 * - Filter by player, date range
 * - Search by location or notes
 * - Create new session
 * - View session details
 * - Import TrackMan data
 * - View club gapping analysis
 */

import React, { useState, useCallback } from 'react';
import { useTrackMan } from '../../hooks/useTrackMan';
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
  cardTitle: 'text-base font-semibold text-[var(--text-inverse)] m-0',
  cardDate: 'text-xs text-[var(--video-text-secondary)]',
  cardInfo: 'flex flex-col gap-2 mb-4',
  infoRow: 'flex items-center gap-2 text-sm text-[var(--video-text-secondary)]',
  infoIcon: 'text-base',
  statsGrid: 'grid grid-cols-2 gap-2 mb-4',
  statBox: 'p-2 bg-surface-elevated rounded-lg',
  statLabel: 'text-xs text-[var(--video-text-secondary)] mb-1',
  statValue: 'text-lg font-bold text-[var(--text-inverse)]',
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

export function TrackManSessionDashboard({
  className = '',
  onCreateSession,
  onViewSession,
  onImportData,
  onViewGapping,
}) {
  const {
    sessions,
    loading,
    error,
    refresh,
  } = useTrackMan();

  const [searchQuery, setSearchQuery] = useState('');

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        session.location?.toLowerCase().includes(query) ||
        session.notes?.toLowerCase().includes(query) ||
        session.player?.name?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Handle view session
  const handleView = useCallback(
    (session) => {
      if (onViewSession) {
        onViewSession(session);
      }

      track('trackman_session_viewed', {
        screen: 'TrackManSessionDashboard',
        sessionId: session.id,
      });
    },
    [onViewSession]
  );

  // Handle import
  const handleImport = useCallback(
    (session, e) => {
      e.stopPropagation();
      if (onImportData) {
        onImportData(session);
      }
    },
    [onImportData]
  );

  // Loading state
  if (loading && sessions.length === 0) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard variant="loading" title="Laster økter..." />
      </div>
    );
  }

  // Error state
  if (error && sessions.length === 0) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard
          variant="error"
          title="Kunne ikke laste økter"
          description={error}
          action={<Button variant="primary" onClick={refresh}>Prøv igjen</Button>}
        />
      </div>
    );
  }

  return (
    <div className={`${tw.container} ${className}`}>
      {/* Header */}
      <PageHeader
        title="Launch Monitor Økter"
        subtitle="TrackMan og launch monitor data for alle dine øvingsøkter"
        helpText="Oversikt over alle launch monitor økter med TrackMan-data. Se carry distance, ball speed, smash factor og andre nøkkelparametre. Opprett nye økter, importer TrackMan-data, analyser club gapping og spor fremgang over tid. Søk etter lokasjon, spiller eller notater."
        actions={
          <>
            {onViewGapping && (
              <Button variant="secondary" onClick={onViewGapping}>
                Stats Club Gapping
              </Button>
            )}
            <Button variant="secondary" onClick={refresh}>
              🔄 Oppdater
            </Button>
            {onCreateSession && (
              <Button variant="primary" onClick={onCreateSession}>
                ➕ Ny Økt
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
            placeholder="Søk etter lokasjon, spiller eller notater..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={tw.searchInput}
          />
        </div>
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <div className={tw.emptyState}>
          <div className={tw.emptyIcon}>Stats</div>
          <SubSectionTitle style={{ marginBottom: 0 }}>Ingen okter funnet</SubSectionTitle>
          <p className={tw.emptyDescription}>
            {searchQuery
              ? 'Ingen økter matcher søket ditt'
              : 'Opprett din første launch monitor økt for å begynne å spore data'}
          </p>
          {onCreateSession && !searchQuery && (
            <Button variant="primary" onClick={onCreateSession}>
              ➕ Opprett Økt
            </Button>
          )}
        </div>
      ) : (
        <div className={tw.grid}>
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className={tw.card}
              onClick={() => handleView(session)}
            >
              <div className={tw.cardHeader}>
                <div>
                  <SubSectionTitle style={{ marginBottom: 0 }}>
                    {session.location || 'Launch Monitor Økt'}
                  </SubSectionTitle>
                  <p className={tw.cardDate}>
                    {new Date(session.date).toLocaleDateString('nb-NO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className={tw.cardInfo}>
                <div className={tw.infoRow}>
                  <span className={tw.infoIcon}>👤</span>
                  <span>{session.player?.name || 'Ukjent spiller'}</span>
                </div>
                <div className={tw.infoRow}>
                  <span className={tw.infoIcon}>🏌️</span>
                  <span>{session.shotCount || 0} slag registrert</span>
                </div>
              </div>

              {/* Stats Grid */}
              {session.statistics && (
                <div className={tw.statsGrid}>
                  <div className={tw.statBox}>
                    <div className={tw.statLabel}>Avg. Carry</div>
                    <div className={tw.statValue}>
                      {Math.round(session.statistics.avgCarryDistance || 0)}m
                    </div>
                  </div>
                  <div className={tw.statBox}>
                    <div className={tw.statLabel}>Avg. Ball Speed</div>
                    <div className={tw.statValue}>
                      {Math.round(session.statistics.avgBallSpeed || 0)} mph
                    </div>
                  </div>
                </div>
              )}

              <div className={tw.cardActions}>
                <button
                  onClick={(e) => handleImport(session, e)}
                  className={tw.actionButton}
                >
                  📥 Import Data
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleView(session);
                  }}
                  className={tw.primaryActionButton}
                >
                  👁️ Se Detaljer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrackManSessionDashboard;
