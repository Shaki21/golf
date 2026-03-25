/**
 * Player Annual Plan Overview
 * View and manage player annual plan
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerAnnualPlan } from './hooks/usePlayerAnnualPlan';
import { Card } from '../../components/shadcn/card';
import { Button } from '../../components/shadcn/button';
import { Badge } from '../../components/shadcn/badge';
import { PeriodTimeline } from './components/PeriodTimeline';
import { PERIOD_LABELS } from './utils/periodDefaults';
import { exportToPDF, exportToICal } from './utils/planExport';
import { Plus, Calendar, Target, TrendingUp, Download, FileText, ChevronDown, ChevronUp, Bell } from 'lucide-react';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import { PageTitle, SectionTitle, SubSectionTitle, CardTitle } from '../../components/typography/Headings';

export function PlayerAnnualPlanOverview() {
  const navigate = useNavigate();
  const { plan, hasActivePlan, isLoading, fetchPlan, cancelPlan } =
    usePlayerAnnualPlan();
  const [expandedPeriodId, setExpandedPeriodId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const handleCreateNew = () => {
    navigate('/plan/aarsplan/ny');
  };

  const handleRequestPlanChange = async () => {
    // TODO: Implement API call to notify coach
    alert('Forespørsel om å endre plan sendt til trener');
  };

  const handleGeneratePlan = () => {
    // TODO: Implement plan generation
    navigate('/plan/aarsplan/generer');
  };

  const togglePeriodExpansion = (periodId: string) => {
    setExpandedPeriodId(expandedPeriodId === periodId ? null : periodId);
  };

  const handleCancelPlan = async () => {
    if (
      confirm(
        'Er du sikker på at du vil kansellere denne årsplanen? Dette kan ikke angres.'
      )
    ) {
      const success = await cancelPlan();
      if (success) {
        fetchPlan();
      }
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <PageHeader
          title="Årsplan"
          subtitle="Din årlige trenings- og konkurranseplan"
        />
        <PageContainer paddingY="md" background="base">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tier-navy mx-auto mb-4" />
              <p className="text-tier-text-secondary">Laster årsplan...</p>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  if (!hasActivePlan || !plan || !plan.periods || !Array.isArray(plan.periods)) {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <PageHeader
          title="Årsplan"
          subtitle="Din årlige trenings- og konkurranseplan"
        />
        <PageContainer paddingY="md" background="base">
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-tier-navy mx-auto mb-4" />
            <SectionTitle style={{ marginBottom: '0.5rem' }}>
              Ingen årsplan funnet
            </SectionTitle>
            <p className="text-tier-text-secondary mb-6">
              Opprett en årsplan for å strukturere din treningssesong
            </p>
            <Button
              onClick={handleCreateNew}
              className="bg-status-success hover:bg-status-success/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Opprett årsplan
            </Button>
          </div>
        </PageContainer>
      </div>
    );
  }

  const periods = plan.periods as any[];

  // Calculate statistics
  const totalSessions = periods.reduce((sum, period) => {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    const weeks = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)
    );
    return sum + weeks * period.weeklyFrequency;
  }, 0);

  const avgFrequency =
    periods.reduce((sum, p) => sum + p.weeklyFrequency, 0) / periods.length;

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Årsplan"
      />
      <PageContainer paddingY="md" background="base">
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() =>
                  exportToPDF(plan.name, periods, plan.startDate, plan.endDate)
                }
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  exportToICal(plan.name, periods, plan.startDate, plan.endDate)
                }
              >
                <Download className="w-4 h-4 mr-2" />
                iCal
              </Button>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleRequestPlanChange}>
                <Bell className="w-4 h-4 mr-2" />
                Endre plan
              </Button>
              <Button variant="outline" onClick={handleCancelPlan}>
                Kanseller plan
              </Button>
              <Button onClick={handleCreateNew} className="bg-status-success hover:bg-status-success/90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Ny plan
              </Button>
              <Button onClick={handleGeneratePlan} variant="outline">
                Generer årsplan
              </Button>
            </div>
          </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <Calendar className="w-10 h-10 text-tier-navy mb-3" />
              <p className="text-3xl font-bold text-tier-navy">{periods.length}</p>
              <p className="text-sm text-tier-gray mt-1">Perioder</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <Target className="w-10 h-10 text-tier-navy mb-3" />
              <p className="text-3xl font-bold text-tier-navy">
                {avgFrequency.toFixed(1)}
              </p>
              <p className="text-sm text-tier-gray mt-1">Gj.snitt økter/uke</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <TrendingUp className="w-10 h-10 text-tier-navy mb-3" />
              <p className="text-3xl font-bold text-tier-navy">{totalSessions}</p>
              <p className="text-sm text-tier-gray mt-1">Totalt økter</p>
            </div>
          </Card>
        </div>

        {/* Timeline */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <SectionTitle style={{ marginBottom: 0 }}>Tidslinje</SectionTitle>
            <Badge variant="outline" className="text-xs">
              {plan.status}
            </Badge>
          </div>
          <PeriodTimeline
            periods={periods}
            startDate={plan.startDate}
            endDate={plan.endDate}
          />
        </Card>

        {/* Periods Details */}
        <Card className="p-6 space-y-4">
          <SectionTitle style={{ marginBottom: 0 }}>Perioder</SectionTitle>
          <div className="space-y-4">
            {periods.map((period, index) => {
              const start = new Date(period.startDate);
              const end = new Date(period.endDate);
              const weeks = Math.ceil(
                (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)
              );
              const isExpanded = expandedPeriodId === period.id;

              return (
                <div
                  key={period.id}
                  className="rounded-lg border hover:border-tier-navy/30 transition-colors"
                >
                  {/* Period Header - Clickable */}
                  <button
                    onClick={() => togglePeriodExpansion(period.id)}
                    className="w-full flex items-start space-x-4 p-5 text-left"
                  >
                    <div
                      className="w-8 h-8 rounded flex-shrink-0 mt-1"
                      style={{ backgroundColor: period.color }}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <SubSectionTitle style={{ marginBottom: 0 }}>
                            {index + 1}. {period.name}
                          </SubSectionTitle>
                          <Badge variant="outline" className="text-xs">
                            {PERIOD_LABELS[period.type as 'E' | 'G' | 'S' | 'T']}
                          </Badge>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-tier-navy" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-tier-navy" />
                        )}
                      </div>
                      <p className="text-sm text-tier-text-secondary">
                        {formatDate(period.startDate)} - {formatDate(period.endDate)} (
                        {weeks} uker)
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-tier-navy font-medium">
                          {period.weeklyFrequency} økter/uke
                        </span>
                        <span className="text-tier-text-secondary">
                          ~{weeks * period.weeklyFrequency} totale økter
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-4 border-t">
                      {period.description && (
                        <div className="pt-4">
                          <p className="text-sm text-tier-text-secondary italic">
                            {period.description}
                          </p>
                        </div>
                      )}

                      {/* Session breakdown by type */}
                      <div>
                        <p className="text-sm font-semibold text-tier-navy mb-2">
                          Økter per type:
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-tier-text-secondary">Fysisk:</span>
                            <span className="font-medium">
                              {Math.round(weeks * period.weeklyFrequency * 0.2)} økter
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-tier-text-secondary">Teknikk:</span>
                            <span className="font-medium">
                              {Math.round(weeks * period.weeklyFrequency * 0.3)} økter
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-tier-text-secondary">Golfslag:</span>
                            <span className="font-medium">
                              {Math.round(weeks * period.weeklyFrequency * 0.3)} økter
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-tier-text-secondary">Banespill:</span>
                            <span className="font-medium">
                              {Math.round(weeks * period.weeklyFrequency * 0.2)} økter
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Total training hours */}
                      <div>
                        <p className="text-sm font-semibold text-tier-navy mb-2">
                          Treningstimer fordeling:
                        </p>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-tier-text-secondary">Timer per uke:</span>
                            <span className="font-medium">{(period.weeklyFrequency * 1.5).toFixed(1)}t</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-tier-text-secondary">Total for periode:</span>
                            <span className="font-medium">{(weeks * period.weeklyFrequency * 1.5).toFixed(0)}t</span>
                          </div>
                        </div>
                      </div>

                      {/* Tournaments - only show for tournament period */}
                      {period.type === 'T' && (
                        <div>
                          <p className="text-sm font-semibold text-tier-navy mb-2">
                            Turneringer:
                          </p>
                          <div className="text-sm">
                            <span className="text-tier-text-secondary">
                              Planlagte turneringer: {Math.ceil(weeks / 2)} stk
                            </span>
                          </div>
                        </div>
                      )}

                      {/* School plan overview */}
                      <div>
                        <p className="text-sm font-semibold text-tier-navy mb-2">
                          Skoleplan:
                        </p>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-tier-text-secondary">Prøver:</span>
                            <span className="font-medium">{Math.max(1, Math.floor(weeks / 4))} stk</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-tier-text-secondary">Innleveringer:</span>
                            <span className="font-medium">{Math.max(2, Math.floor(weeks / 2))} stk</span>
                          </div>
                        </div>
                      </div>

                      {/* Goals with progress */}
                      {period.goals && period.goals.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-tier-navy mb-2">
                            Mål:
                          </p>
                          <ul className="space-y-2">
                            {period.goals.map((goal: string, i: number) => (
                              <li key={i} className="text-sm">
                                <div className="flex items-start">
                                  <span className="text-tier-gold mr-2">•</span>
                                  <span className="text-tier-text-secondary flex-1">{goal}</span>
                                </div>
                                {/* Progress bar placeholder */}
                                <div className="ml-5 mt-1 w-full h-2 bg-tier-surface-base rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-tier-success rounded-full"
                                    style={{ width: `${Math.random() * 100}%` }}
                                  />
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* School plan overview (if applicable) */}
                      <div>
                        <p className="text-sm font-semibold text-tier-navy mb-2">
                          Skoleplan:
                        </p>
                        <p className="text-xs text-tier-text-secondary italic">
                          Ingen prøver eller innleveringer planlagt i denne perioden
                        </p>
                      </div>

                      {/* Tournament info (for tournament periods) */}
                      {period.type === 'T' && (
                        <div>
                          <p className="text-sm font-semibold text-tier-navy mb-2">
                            Turneringer:
                          </p>
                          <p className="text-xs text-tier-text-secondary italic">
                            Ingen turneringer registrert ennå
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
        </div>
      </PageContainer>
    </div>
  );
}

export default PlayerAnnualPlanOverview;
