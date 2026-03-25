/**
 * ProgressReportList
 * Coach view for managing progress reports
 *
 * Features:
 * - List all progress reports
 * - Filter by player, status (draft/published), date range
 * - Search by player name or report title
 * - Create new report
 * - Edit draft reports
 * - Publish reports to parents
 * - Auto-generate reports
 */

import React, { useState, useCallback } from 'react';
import { useProgressReports } from '../../hooks/useProgressReports';
import Button from '../../ui/primitives/Button';
import StateCard from '../../ui/composites/StateCard';
import { track } from '../../analytics/track';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';

// ═══════════════════════════════════════════
// TAILWIND CLASSES
// ═══════════════════════════════════════════

const tw = {
  container: 'flex flex-col gap-4',
  header: 'flex items-center justify-between',
  title: 'text-xl font-semibold text-[var(--text-inverse)] m-0',
  headerActions: 'flex gap-2',
  filters: 'flex gap-4 flex-wrap items-center',
  filterGroup: 'flex gap-2',
  filterButton: 'py-2 px-4 bg-surface-elevated border border-border rounded-lg text-[var(--text-inverse)] text-sm font-medium cursor-pointer hover:bg-surface-elevated-hover transition-colors',
  filterButtonActive: 'py-2 px-4 bg-primary border-2 border-primary rounded-lg text-white text-sm font-medium cursor-pointer',
  search: 'flex-1 max-w-md',
  searchInput: 'w-full py-2 px-3 bg-surface-elevated border border-border rounded-lg text-[var(--text-inverse)] text-sm placeholder-[var(--video-text-tertiary)]',
  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
  card: 'p-4 bg-surface rounded-xl border border-border hover:border-primary transition-colors cursor-pointer',
  cardHeader: 'flex items-start justify-between mb-3',
  cardTitle: 'text-base font-semibold text-[var(--text-inverse)] m-0',
  statusBadge: {
    draft: 'inline-flex py-1 px-2 bg-yellow-500/20 border border-yellow-500 rounded-md text-yellow-500 text-xs font-medium',
    published: 'inline-flex py-1 px-2 bg-tier-success/20 border border-tier-success rounded-md text-tier-success text-xs font-medium',
  },
  cardInfo: 'flex flex-col gap-2 mb-3',
  infoRow: 'flex items-center gap-2 text-sm text-[var(--video-text-secondary)]',
  infoIcon: 'text-base',
  cardContent: 'text-sm text-[var(--video-text-secondary)] line-clamp-3 mb-3',
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

export function ProgressReportList({ className = '', onCreateReport, onEditReport, onViewReport }) {
  const {
    reports,
    loading,
    error,
    publishReport,
    refresh,
  } = useProgressReports();

  const [statusFilter, setStatusFilter] = useState('all'); // all, draft, published
  const [searchQuery, setSearchQuery] = useState('');

  // Filter reports
  const filteredReports = reports.filter((report) => {
    // Status filter
    if (statusFilter !== 'all' && report.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        report.player?.name?.toLowerCase().includes(query) ||
        report.title?.toLowerCase().includes(query) ||
        report.highlights?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Handle publish report
  const handlePublish = useCallback(
    async (reportId, e) => {
      e.stopPropagation();

      if (!window.confirm('Publisere rapport til foreldre? De vil motta e-post varsling.')) {
        return;
      }

      try {
        await publishReport(reportId);

        track('progress_report_published', {
          screen: 'ProgressReportList',
          reportId,
        });

        alert('Rapport publisert! Foreldre har mottatt e-post.');
      } catch (err) {
        console.error('Failed to publish report:', err);
        alert('Kunne ikke publisere rapport');
      }
    },
    [publishReport]
  );

  // Handle edit report
  const handleEdit = useCallback(
    (report, e) => {
      e.stopPropagation();
      if (onEditReport) {
        onEditReport(report);
      }
    },
    [onEditReport]
  );

  // Handle view report
  const handleView = useCallback(
    (report) => {
      if (onViewReport) {
        onViewReport(report);
      }
    },
    [onViewReport]
  );

  // Loading state
  if (loading && reports.length === 0) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard variant="loading" title="Laster rapporter..." />
      </div>
    );
  }

  // Error state
  if (error && reports.length === 0) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard
          variant="error"
          title="Kunne ikke laste rapporter"
          description={error}
          action={<Button variant="primary" onClick={refresh}>Prøv igjen</Button>}
        />
      </div>
    );
  }

  return (
    <div className={`${tw.container} ${className}`}>
      {/* Header */}
      <div className={tw.header}>
        <SectionTitle style={{ marginBottom: 0 }}>Fremdriftsrapporter</SectionTitle>
        <div className={tw.headerActions}>
          <Button variant="secondary" onClick={refresh}>
            Oppdater
          </Button>
          {onCreateReport && (
            <Button variant="primary" onClick={onCreateReport}>
              + Ny Rapport
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className={tw.filters}>
        <div className={tw.filterGroup}>
          <button
            onClick={() => setStatusFilter('all')}
            className={statusFilter === 'all' ? tw.filterButtonActive : tw.filterButton}
          >
            Alle
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={statusFilter === 'draft' ? tw.filterButtonActive : tw.filterButton}
          >
            Utkast
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={statusFilter === 'published' ? tw.filterButtonActive : tw.filterButton}
          >
            Publisert
          </button>
        </div>

        <div className={tw.search}>
          <input
            type="text"
            placeholder="Søk etter spiller eller rapport..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={tw.searchInput}
          />
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className={tw.emptyState}>
          <div className={tw.emptyIcon}>[Chart]</div>
          <SubSectionTitle style={{ marginBottom: 0 }}>Ingen rapporter funnet</SubSectionTitle>
          <p className={tw.emptyDescription}>
            {searchQuery || statusFilter !== 'all'
              ? 'Ingen rapporter matcher filteret ditt'
              : 'Opprett din første fremdriftsrapport'}
          </p>
          {onCreateReport && !searchQuery && statusFilter === 'all' && (
            <Button variant="primary" onClick={onCreateReport}>
              + Opprett Rapport
            </Button>
          )}
        </div>
      ) : (
        <div className={tw.grid}>
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className={tw.card}
              onClick={() => handleView(report)}
            >
              <div className={tw.cardHeader}>
                <SubSectionTitle style={{ marginBottom: 0 }}>
                  {report.title || `Rapport for ${report.player?.name || 'Spiller'}`}
                </SubSectionTitle>
                <span className={tw.statusBadge[report.status]}>
                  {report.status === 'draft' ? 'Utkast' : 'Publisert'}
                </span>
              </div>

              <div className={tw.cardInfo}>
                <div className={tw.infoRow}>
                  <span className={tw.infoIcon}>[User]</span>
                  <span>{report.player?.name || 'Ukjent spiller'}</span>
                </div>
                <div className={tw.infoRow}>
                  <span className={tw.infoIcon}>[Cal]</span>
                  <span>
                    {new Date(report.periodStart).toLocaleDateString('nb-NO')} -{' '}
                    {new Date(report.periodEnd).toLocaleDateString('nb-NO')}
                  </span>
                </div>
                {report.publishedAt && (
                  <div className={tw.infoRow}>
                    <span className={tw.infoIcon}>[Mail]</span>
                    <span>
                      Publisert {new Date(report.publishedAt).toLocaleDateString('nb-NO')}
                    </span>
                  </div>
                )}
              </div>

              {report.highlights && (
                <p className={tw.cardContent}>{report.highlights}</p>
              )}

              <div className={tw.cardActions}>
                {report.status === 'draft' ? (
                  <>
                    <button
                      onClick={(e) => handleEdit(report, e)}
                      className={tw.actionButton}
                    >
                      Rediger
                    </button>
                    <button
                      onClick={(e) => handlePublish(report.id, e)}
                      className={tw.primaryActionButton}
                    >
                      Publiser
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(report);
                    }}
                    className={tw.actionButton}
                  >
                    Vis Rapport
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProgressReportList;
