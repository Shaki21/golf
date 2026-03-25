/**
 * Progress Reports Page
 * Player view for viewing their progress reports
 */

import React, { useState } from 'react';
import { FileText, Calendar, Award, TrendingUp, CheckCircle } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';
import { useProgressReports } from '../../hooks/useProgressReports';
import { useAuth } from '../../contexts/AuthContext';

const ProgressReportsPage: React.FC = () => {
  const { user } = useAuth();
  const player = user;
  const { reports, loading, error } = useProgressReports({
    playerId: (player?.id || player?.playerId || '') as string,
    coachId: '', // Not filtering by coach for player view
    status: 'published' // Only show published reports to players
  });
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      weekly: 'Ukentlig',
      monthly: 'Månedlig',
      quarterly: 'Kvartalsvis',
      annual: 'Årlig',
    };
    return labels[type] || type;
  };

  const getReportTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      weekly: 'bg-tier-info-light text-tier-info border-tier-info',
      monthly: 'bg-tier-success-light text-tier-success border-tier-success',
      quarterly: 'bg-tier-warning-light text-tier-warning border-tier-warning',
      annual: 'bg-tier-error-light text-tier-error border-tier-error',
    };
    return colors[type] || 'bg-tier-surface-base text-tier-text-secondary border-tier-border-default';
  };

  const ReportCard = ({ report }: { report: any }) => (
    <div
      className="bg-white rounded-xl border border-tier-border-default p-6 hover:border-tier-info hover:shadow-md transition-all cursor-pointer"
      onClick={() => setSelectedReport(report)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <FileText size={24} className="text-tier-info" />
          <div>
            <div className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold ${getReportTypeColor(report.reportType)}`}>
              {getReportTypeLabel(report.reportType)}
            </div>
            <div className="text-xs text-tier-text-secondary mt-2 flex items-center gap-2">
              <Calendar size={12} />
              {new Date(report.publishedAt || report.createdAt).toLocaleDateString('no-NO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
        {report.status === 'published' && (
          <CheckCircle size={20} className="text-tier-success" />
        )}
      </div>

      <p className="text-tier-text-secondary text-sm line-clamp-2 mb-4">
        {report.summary}
      </p>

      <div className="flex items-center justify-between text-sm">
        <div className="text-tier-text-secondary">
          {report.coach?.firstName} {report.coach?.lastName}
        </div>
        <div className="flex items-center gap-2 text-tier-info">
          <span>{report.sessionsCompleted} økter</span>
          {report.handicapChange && (
            <span className={report.handicapChange < 0 ? 'text-tier-success' : 'text-tier-warning'}>
              {report.handicapChange > 0 ? '+' : ''}
              {report.handicapChange}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const ReportDetail = ({ report }: { report: any }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedReport(null)}>
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-tier-info-light to-tier-info p-8 border-b border-tier-border-default">
          <div className="flex items-center justify-between mb-4">
            <div className={`inline-block px-4 py-2 rounded-full border font-semibold ${getReportTypeColor(report.reportType)}`}>
              {getReportTypeLabel(report.reportType)}
            </div>
            <button
              onClick={() => setSelectedReport(null)}
              className="px-4 py-2 bg-white text-tier-navy rounded-lg hover:bg-tier-surface-base transition-all"
            >
              Lukk
            </button>
          </div>
          <SectionTitle style={{ marginBottom: 0 }}>Fremdriftsrapport</SectionTitle>
          <div className="flex items-center gap-4 text-sm text-tier-text-secondary">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              {new Date(report.publishedAt || report.createdAt).toLocaleDateString('no-NO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div>
              Av: {report.coach?.firstName} {report.coach?.lastName}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Summary */}
          <div>
            <SubSectionTitle style={{ marginBottom: 0 }}>
              <FileText size={20} />
              Sammendrag
            </SubSectionTitle>
            <p className="text-tier-text-secondary leading-relaxed">{report.summary}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-tier-info-light rounded-lg border border-tier-info p-4">
              <div className="text-sm text-tier-text-secondary mb-1">Økter gjennomført</div>
              <div className="text-3xl font-bold text-tier-navy">{report.sessionsCompleted}</div>
            </div>
            {report.handicapChange !== null && report.handicapChange !== undefined && (
              <div className={`rounded-lg border p-4 ${
                report.handicapChange < 0
                  ? 'bg-tier-success-light border-tier-success'
                  : 'bg-tier-warning-light border-tier-warning'
              }`}>
                <div className="text-sm text-tier-text-secondary mb-1">Handicap endring</div>
                <div className={`text-3xl font-bold ${
                  report.handicapChange < 0 ? 'text-tier-success' : 'text-tier-warning'
                }`}>
                  {report.handicapChange > 0 ? '+' : ''}{report.handicapChange}
                </div>
              </div>
            )}
          </div>

          {/* Strengths */}
          {report.strengths && report.strengths.length > 0 && (
            <div>
              <SubSectionTitle style={{ marginBottom: 0 }}>
                <Award size={20} className="text-tier-success" />
                Styrker
              </SubSectionTitle>
              <ul className="space-y-2">
                {report.strengths.map((strength: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-tier-text-secondary">
                    <CheckCircle size={18} className="text-tier-success flex-shrink-0 mt-0.5" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas for Improvement */}
          {report.areasForImprovement && report.areasForImprovement.length > 0 && (
            <div>
              <SubSectionTitle style={{ marginBottom: 0 }}>
                <TrendingUp size={20} className="text-tier-warning" />
                Områder for forbedring
              </SubSectionTitle>
              <ul className="space-y-2">
                {report.areasForImprovement.map((area: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-tier-text-secondary">
                    <TrendingUp size={18} className="text-tier-warning flex-shrink-0 mt-0.5" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Goals */}
          {report.goals && report.goals.length > 0 && (
            <div>
              <SubSectionTitle style={{ marginBottom: 0 }}>Mål for neste periode</SubSectionTitle>
              <ul className="space-y-2">
                {report.goals.map((goal: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-tier-text-secondary">
                    <div className="w-2 h-2 rounded-full bg-tier-info flex-shrink-0 mt-2" />
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          {report.nextSteps && report.nextSteps.length > 0 && (
            <div>
              <SubSectionTitle style={{ marginBottom: 0 }}>Neste steg</SubSectionTitle>
              <ul className="space-y-2">
                {report.nextSteps.map((step: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-tier-text-secondary">
                    <div className="w-6 h-6 rounded-full bg-tier-info text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-tier-surface-base p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl border border-tier-border-default p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tier-info mx-auto mb-4"></div>
            <p className="text-tier-text-secondary">Laster rapporter...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-tier-surface-base p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl border border-tier-border-default p-8 text-center">
            <div className="text-tier-error text-4xl mb-2">[Warning]</div>
            <p className="text-tier-error">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-surface-base p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Fremdriftsrapporter"
          subtitle="Oversikt over dine fremdriftsrapporter fra trener"
          helpText=""
          actions={null}
        />

        {/* Reports Grid */}
        {reports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-tier-border-default p-12 text-center">
            <div className="text-6xl mb-4">[Chart]</div>
            <SubSectionTitle style={{ marginBottom: 0 }}>Ingen rapporter ennå</SubSectionTitle>
            <p className="text-tier-text-secondary">
              Din trener vil dele fremdriftsrapporter med deg her
            </p>
          </div>
        )}

        {/* Report Detail Modal */}
        {selectedReport && <ReportDetail report={selectedReport} />}
      </div>
    </div>
  );
};

export default ProgressReportsPage;
