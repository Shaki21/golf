/**
 * ProgressReportViewer
 * Read-only view for progress reports
 *
 * Features:
 * - Display published progress report
 * - Formatted for readability
 * - Print-friendly layout
 * - Download as PDF option
 * - Share via email
 */

import React, { useCallback } from 'react';
import Button from '../../ui/primitives/Button';
import StateCard from '../../ui/composites/StateCard';
import { track } from '../../analytics/track';
import { PageTitle, SectionTitle } from '../../components/typography/Headings';

// ═══════════════════════════════════════════
// TAILWIND CLASSES
// ═══════════════════════════════════════════

const tw = {
  container: 'flex flex-col gap-6 max-w-4xl mx-auto',
  header: 'flex items-start justify-between gap-4',
  headerContent: 'flex-1',
  title: 'text-2xl font-bold text-[var(--text-inverse)] m-0 mb-2',
  subtitle: 'text-sm text-[var(--video-text-secondary)]',
  actions: 'flex gap-2',
  reportCard: 'p-6 bg-surface rounded-xl border border-border',
  infoGrid: 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-border',
  infoItem: 'flex flex-col gap-1',
  infoLabel: 'text-xs font-semibold text-[var(--video-text-secondary)] uppercase tracking-wider',
  infoValue: 'text-sm text-[var(--text-inverse)] font-medium',
  section: 'flex flex-col gap-3 mb-6',
  sectionTitle: 'text-base font-semibold text-[var(--text-inverse)] flex items-center gap-2',
  sectionIcon: 'text-lg',
  sectionContent: 'text-sm text-[var(--video-text-secondary)] whitespace-pre-wrap leading-relaxed',
  emptySection: 'text-sm text-[var(--video-text-tertiary)] italic',
  publishedBadge: 'inline-flex items-center gap-1 py-1 px-3 bg-tier-success/20 border border-tier-success rounded-md text-tier-success text-xs font-medium',
  footer: 'flex items-center justify-between pt-6 border-t border-border text-xs text-[var(--video-text-secondary)]',
};

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function ProgressReportViewer({ className = '', report, onBack }) {
  // Handle print
  const handlePrint = useCallback(() => {
    window.print();

    track('progress_report_printed', {
      screen: 'ProgressReportViewer',
      reportId: report?.id,
    });
  }, [report]);

  // Handle download (placeholder)
  const handleDownload = useCallback(() => {
    alert('PDF nedlasting kommer snart');

    track('progress_report_download_clicked', {
      screen: 'ProgressReportViewer',
      reportId: report?.id,
    });
  }, [report]);

  // If no report provided
  if (!report) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard
          variant="error"
          title="Ingen rapport valgt"
          description="Velg en rapport å vise"
        />
      </div>
    );
  }

  return (
    <div className={`${tw.container} ${className}`}>
      {/* Header */}
      <div className={tw.header}>
        <div className={tw.headerContent}>
          <PageTitle style={{ marginBottom: 0 }}>
            {report.title || `Fremdriftsrapport for ${report.player?.name || 'Spiller'}`}
          </PageTitle>
          <p className={tw.subtitle}>
            Periode: {new Date(report.periodStart).toLocaleDateString('nb-NO')} -{' '}
            {new Date(report.periodEnd).toLocaleDateString('nb-NO')}
          </p>
        </div>
        <div className={tw.actions}>
          {onBack && (
            <Button variant="secondary" onClick={onBack}>
              ← Tilbake
            </Button>
          )}
          <Button variant="secondary" onClick={handlePrint}>
            Skriv ut
            </Button>
          <Button variant="secondary" onClick={handleDownload}>
            Last ned PDF
          </Button>
        </div>
      </div>

      {/* Report Card */}
      <div className={tw.reportCard}>
        {/* Info Grid */}
        <div className={tw.infoGrid}>
          <div className={tw.infoItem}>
            <div className={tw.infoLabel}>Spiller</div>
            <div className={tw.infoValue}>{report.player?.name || 'Ukjent'}</div>
          </div>
          <div className={tw.infoItem}>
            <div className={tw.infoLabel}>Trener</div>
            <div className={tw.infoValue}>{report.coach?.name || 'Ukjent'}</div>
          </div>
          <div className={tw.infoItem}>
            <div className={tw.infoLabel}>Periode</div>
            <div className={tw.infoValue}>
              {new Date(report.periodStart).toLocaleDateString('nb-NO')} -{' '}
              {new Date(report.periodEnd).toLocaleDateString('nb-NO')}
            </div>
          </div>
          <div className={tw.infoItem}>
            <div className={tw.infoLabel}>Status</div>
            <div className={tw.publishedBadge}>
              ✓ Publisert {new Date(report.publishedAt || report.createdAt).toLocaleDateString('nb-NO')}
            </div>
          </div>
        </div>

        {/* Highlights Section */}
        <div className={tw.section}>
          <SectionTitle style={{ marginBottom: 0 }}>
            <span className={tw.sectionIcon}>[Star]</span>
            Høydepunkter
          </SectionTitle>
          {report.highlights ? (
            <p className={tw.sectionContent}>{report.highlights}</p>
          ) : (
            <p className={tw.emptySection}>Ingen høydepunkter registrert</p>
          )}
        </div>

        {/* Areas for Improvement Section */}
        <div className={tw.section}>
          <SectionTitle style={{ marginBottom: 0 }}>
            <span className={tw.sectionIcon}>[TrendUp]</span>
            Forbedringsområder
          </SectionTitle>
          {report.areasForImprovement ? (
            <p className={tw.sectionContent}>{report.areasForImprovement}</p>
          ) : (
            <p className={tw.emptySection}>Ingen forbedringsområder registrert</p>
          )}
        </div>

        {/* Goals for Next Period Section */}
        <div className={tw.section}>
          <SectionTitle style={{ marginBottom: 0 }}>
            <span className={tw.sectionIcon}>[Target]</span>
            Mål for neste periode
          </SectionTitle>
          {report.goalsForNextPeriod ? (
            <p className={tw.sectionContent}>{report.goalsForNextPeriod}</p>
          ) : (
            <p className={tw.emptySection}>Ingen mål satt for neste periode</p>
          )}
        </div>

        {/* Coach Comments Section */}
        {report.coachComments && (
          <div className={tw.section}>
            <SectionTitle style={{ marginBottom: 0 }}>
              <span className={tw.sectionIcon}>[Chat]</span>
              Trenerkommentarer
            </SectionTitle>
            <p className={tw.sectionContent}>{report.coachComments}</p>
          </div>
        )}

        {/* Footer */}
        <div className={tw.footer}>
          <span>Rapport opprettet {new Date(report.createdAt).toLocaleDateString('nb-NO')}</span>
          {report.publishedAt && (
            <span>
              Publisert {new Date(report.publishedAt).toLocaleDateString('nb-NO')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProgressReportViewer;
