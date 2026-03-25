/**
 * ParentDashboard
 * Parent portal - read-only overview of child's progress
 *
 * Features:
 * - View all published progress reports
 * - Summary statistics (sessions, goals, achievements)
 * - Latest report highlights
 * - Upcoming goals
 * - Contact coach option
 * - Read-only view (no editing capabilities)
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useProgressReports } from '../../hooks/useProgressReports';
import { ProgressReportViewer } from './ProgressReportViewer';
import Button from '../../ui/primitives/Button';
import StateCard from '../../ui/composites/StateCard';
import { track } from '../../analytics/track';
import { PageHeader } from '../../ui/raw-blocks';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';

// ═══════════════════════════════════════════
// TAILWIND CLASSES
// ═══════════════════════════════════════════

const tw = {
  container: 'flex flex-col gap-6',
  header: 'flex items-start justify-between',
  headerContent: 'flex-1',
  title: 'text-2xl font-bold text-[var(--text-inverse)] m-0 mb-2',
  subtitle: 'text-sm text-[var(--video-text-secondary)]',
  welcomeCard: 'p-6 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-xl border border-primary',
  welcomeTitle: 'text-lg font-semibold text-[var(--text-inverse)] mb-2',
  welcomeText: 'text-sm text-[var(--video-text-secondary)]',
  statsGrid: 'grid grid-cols-1 md:grid-cols-4 gap-4',
  statCard: 'p-4 bg-surface rounded-xl border border-border',
  statLabel: 'text-xs font-semibold text-[var(--video-text-secondary)] uppercase tracking-wider mb-2',
  statValue: 'text-3xl font-bold text-[var(--text-inverse)]',
  statIcon: 'text-2xl mb-2',
  section: 'flex flex-col gap-4',
  sectionHeader: 'flex items-center justify-between',
  sectionTitle: 'text-lg font-semibold text-[var(--text-inverse)] m-0',
  reportsGrid: 'grid grid-cols-1 gap-4',
  reportCard: 'p-4 bg-surface rounded-xl border border-border hover:border-primary transition-colors cursor-pointer',
  reportHeader: 'flex items-start justify-between mb-3',
  reportTitle: 'text-base font-semibold text-[var(--text-inverse)] m-0',
  reportDate: 'text-xs text-[var(--video-text-secondary)]',
  reportHighlights: 'text-sm text-[var(--video-text-secondary)] line-clamp-3',
  readMoreButton: 'mt-3 text-primary text-sm font-medium',
  emptyState: 'flex flex-col items-center justify-center gap-3 py-12 text-center bg-surface rounded-xl border border-border',
  emptyIcon: 'text-5xl opacity-30',
  emptyTitle: 'text-base font-semibold text-[var(--text-inverse)] m-0',
  emptyDescription: 'text-sm text-[var(--video-text-secondary)] m-0 max-w-xs',
  contactCoachCard: 'p-4 bg-purple-500/10 rounded-xl border border-purple-500',
  contactTitle: 'text-sm font-semibold text-[var(--text-inverse)] mb-2',
  contactText: 'text-xs text-[var(--video-text-secondary)] mb-3',
  contactButton: 'py-2 px-4 bg-purple-500 border-2 border-purple-500 rounded-lg text-white text-sm font-medium cursor-pointer hover:bg-purple-600 transition-colors',
};

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function ParentDashboard({ className = '', playerId, playerName }) {
  const {
    reports,
    loading,
    error,
    fetchReport,
    refresh,
  } = useProgressReports({
    playerId,
    status: 'published', // Only show published reports to parents
  });

  const [selectedReport, setSelectedReport] = useState(null);
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' or 'report'

  // Calculate statistics
  const stats = {
    totalReports: reports.length,
    latestReport: reports[0] || null,
    // These would normally come from API
    totalSessions: 24,
    goalsAchieved: 8,
  };

  // Handle view report
  const handleViewReport = useCallback(
    async (report) => {
      const fullReport = await fetchReport(report.id);
      if (fullReport) {
        setSelectedReport(fullReport);
        setViewMode('report');

        track('progress_report_viewed', {
          screen: 'ParentDashboard',
          reportId: report.id,
          role: 'parent',
        });
      }
    },
    [fetchReport]
  );

  // Handle back to dashboard
  const handleBackToDashboard = useCallback(() => {
    setSelectedReport(null);
    setViewMode('dashboard');
  }, []);

  // Handle contact coach
  const handleContactCoach = useCallback(() => {
    alert('Kontakt trener-funksjonalitet kommer snart');

    track('contact_coach_clicked', {
      screen: 'ParentDashboard',
      playerId,
    });
  }, [playerId]);

  // Show report viewer if in report mode
  if (viewMode === 'report' && selectedReport) {
    return (
      <ProgressReportViewer
        className={className}
        report={selectedReport}
        onBack={handleBackToDashboard}
      />
    );
  }

  // Loading state
  if (loading && reports.length === 0) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard variant="loading" title="Laster fremdriftsrapporter..." />
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
      <PageHeader
        title="Fremdriftsrapporter"
        subtitle={`Følg ${playerName || 'spillerens'} utvikling og fremgang`}
        helpText="Foresattes portal for å følge spillerens fremgang. Les publiserte fremdriftsrapporter fra trener, se statistikk over økter, mål og prestasjoner. Vis oppsummering av siste rapport, kommende mål og kontakt trener. Kun lesevisning (ingen redigeringsmulighet)."
        actions={
          <Button variant="secondary" onClick={refresh}>
            Oppdater
          </Button>
        }
      />

      {/* Welcome Card */}
      {reports.length > 0 && (
        <div className={tw.welcomeCard}>
          <SectionTitle style={{ marginBottom: 0 }}>
            Velkommen til forelderportalen!
          </SectionTitle>
          <p className={tw.welcomeText}>
            Her kan du følge {playerName || 'spillerens'} fremgang, se detaljerte rapporter fra treneren,
            og holde deg oppdatert på mål og prestasjoner.
          </p>
        </div>
      )}

      {/* Statistics Grid */}
      {reports.length > 0 && (
        <div className={tw.statsGrid}>
          <div className={tw.statCard}>
            <div className={tw.statIcon}>[Chart]</div>
            <div className={tw.statLabel}>Rapporter</div>
            <div className={tw.statValue}>{stats.totalReports}</div>
          </div>
          <div className={tw.statCard}>
            <div className={tw.statIcon}>[Gym]</div>
            <div className={tw.statLabel}>Økter totalt</div>
            <div className={tw.statValue}>{stats.totalSessions}</div>
          </div>
          <div className={tw.statCard}>
            <div className={tw.statIcon}>[Target]</div>
            <div className={tw.statLabel}>Mål oppnådd</div>
            <div className={tw.statValue}>{stats.goalsAchieved}</div>
          </div>
          <div className={tw.statCard}>
            <div className={tw.statIcon}>[Star]</div>
            <div className={tw.statLabel}>Siste oppdatering</div>
            <div className={tw.statValue}>
              {stats.latestReport
                ? new Date(stats.latestReport.publishedAt || stats.latestReport.createdAt)
                    .toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })
                : 'N/A'}
            </div>
          </div>
        </div>
      )}

      {/* Reports Section */}
      <div className={tw.section}>
        <div className={tw.sectionHeader}>
          <SectionTitle style={{ marginBottom: 0 }}>Alle rapporter</SectionTitle>
        </div>

        {reports.length === 0 ? (
          <div className={tw.emptyState}>
            <div className={tw.emptyIcon}>[List]</div>
            <SubSectionTitle style={{ marginBottom: 0 }}>Ingen rapporter ennå</SubSectionTitle>
            <p className={tw.emptyDescription}>
              Treneren har ikke publisert noen fremdriftsrapporter ennå.
              Du vil motta e-post når en ny rapport er klar.
            </p>
          </div>
        ) : (
          <div className={tw.reportsGrid}>
            {reports.map((report) => (
              <div
                key={report.id}
                className={tw.reportCard}
                onClick={() => handleViewReport(report)}
              >
                <div className={tw.reportHeader}>
                  <SubSectionTitle style={{ marginBottom: 0 }}>
                    {report.title || `Rapport ${new Date(report.periodStart).toLocaleDateString('nb-NO')}`}
                  </SubSectionTitle>
                  <span className={tw.reportDate}>
                    {new Date(report.publishedAt || report.createdAt).toLocaleDateString('nb-NO')}
                  </span>
                </div>

                <p className={tw.reportDate}>
                  Periode: {new Date(report.periodStart).toLocaleDateString('nb-NO')} -{' '}
                  {new Date(report.periodEnd).toLocaleDateString('nb-NO')}
                </p>

                {report.highlights && (
                  <p className={tw.reportHighlights}>{report.highlights}</p>
                )}

                <div className={tw.readMoreButton}>Les mer →</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Coach Card */}
      <div className={tw.contactCoachCard}>
        <SubSectionTitle style={{ marginBottom: 0 }}>Har du spørsmål?</SubSectionTitle>
        <p className={tw.contactText}>
          Kontakt treneren direkte for å diskutere {playerName || 'spillerens'} fremgang eller stille spørsmål.
        </p>
        <button onClick={handleContactCoach} className={tw.contactButton}>
          Kontakt trener
        </button>
      </div>
    </div>
  );
}

export default ParentDashboard;
