/**
 * Step 5: Review and Confirm
 * Final review before creating the plan
 */

import React from 'react';
import { Card } from '../../../components/shadcn/card';
import { Button } from '../../../components/shadcn/button';
import { Badge } from '../../../components/shadcn/badge';
import { PeriodTimeline } from '../components/PeriodTimeline';
import { PERIOD_LABELS } from '../utils/periodDefaults';
import { exportToPDF, exportToICal } from '../utils/planExport';
import type { Period } from '../hooks/usePlayerAnnualPlan';
import { Calendar, Target, TrendingUp, Download, FileText } from 'lucide-react';
import { SectionTitle, SubSectionTitle, CardTitle } from '../../../components/typography';

interface Step5ReviewProps {
  basicInfo: {
    name: string;
    startDate: string;
    endDate: string;
  };
  periods: Period[];
  shortTermGoals: string[];
  longTermGoals: string[];
  onSave: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
}

export function Step5Review({
  basicInfo,
  periods,
  shortTermGoals,
  longTermGoals,
  onSave,
  onPrevious,
  isLoading = false,
}: Step5ReviewProps) {
  // Calculate statistics
  const totalWeeks = periods.reduce((sum, period) => {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    const weeks = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)
    );
    return sum + weeks;
  }, 0);

  const avgFrequency =
    periods.reduce((sum, p) => sum + p.weeklyFrequency, 0) / periods.length;

  const totalSessions = periods.reduce((sum, period) => {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    const weeks = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)
    );
    return sum + weeks * period.weeklyFrequency;
  }, 0);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <SectionTitle style={{ marginBottom: 0 }}>Din årsplan er klar!</SectionTitle>
        <p className="text-tier-gray">
          Gjennomgå detaljene og lagre planen din
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex flex-col items-center text-center">
            <Calendar className="w-8 h-8 text-tier-navy mb-2" />
            <p className="text-2xl font-bold text-tier-navy">{periods.length}</p>
            <p className="text-sm text-tier-gray">Perioder</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex flex-col items-center text-center">
            <Target className="w-8 h-8 text-tier-navy mb-2" />
            <p className="text-2xl font-bold text-tier-navy">
              {avgFrequency.toFixed(1)}
            </p>
            <p className="text-sm text-tier-gray">Gj.snitt økter/uke</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex flex-col items-center text-center">
            <TrendingUp className="w-8 h-8 text-tier-navy mb-2" />
            <p className="text-2xl font-bold text-tier-navy">{totalSessions}</p>
            <p className="text-sm text-tier-gray">Totalt økter</p>
          </div>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="p-6 space-y-4">
        <SubSectionTitle style={{ marginBottom: 0 }}>Tidslinje</SubSectionTitle>
        <PeriodTimeline
          periods={periods}
          startDate={basicInfo.startDate}
          endDate={basicInfo.endDate}
        />
      </Card>

      {/* Periods Details */}
      <Card className="p-6 space-y-4">
        <SubSectionTitle style={{ marginBottom: 0 }}>Perioder</SubSectionTitle>
        <div className="space-y-3">
          {periods.map((period, index) => {
            const start = new Date(period.startDate);
            const end = new Date(period.endDate);
            const weeks = Math.ceil(
              (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)
            );

            return (
              <div
                key={period.id}
                className="flex items-start space-x-4 p-4 rounded-lg border"
              >
                <div
                  className="w-6 h-6 rounded flex-shrink-0 mt-1"
                  style={{ backgroundColor: period.color }}
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <CardTitle style={{ marginBottom: 0 }}>
                      {index + 1}. {period.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {PERIOD_LABELS[period.type]}
                    </Badge>
                  </div>
                  <p className="text-sm text-tier-gray">
                    {formatDate(period.startDate)} - {formatDate(period.endDate)} ({weeks}{' '}
                    uker)
                  </p>
                  <p className="text-sm text-tier-navy">
                    {period.weeklyFrequency} økter/uke • ~{weeks * period.weeklyFrequency}{' '}
                    totale økter
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Short-term Goals */}
      {shortTermGoals.length > 0 && (
        <Card className="p-6 space-y-3">
          <SubSectionTitle style={{ marginBottom: 0 }}>Kortsiktige mål (6-12 måneder)</SubSectionTitle>
          <ul className="space-y-2">
            {shortTermGoals.map((goal, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-tier-gold mt-1">•</span>
                <span className="text-tier-navy">{goal}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Long-term Goals */}
      {longTermGoals.length > 0 && (
        <Card className="p-6 space-y-3">
          <SubSectionTitle style={{ marginBottom: 0 }}>Langsiktige mål (1-3 år)</SubSectionTitle>
          <ul className="space-y-2">
            {longTermGoals.map((goal, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-tier-gold mt-1">•</span>
                <span className="text-tier-navy">{goal}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Export Options */}
      <div className="flex justify-center space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            exportToPDF(basicInfo.name, periods, basicInfo.startDate, basicInfo.endDate)
          }
        >
          <FileText className="w-4 h-4 mr-2" />
          Eksporter til PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            exportToICal(basicInfo.name, periods, basicInfo.startDate, basicInfo.endDate)
          }
        >
          <Download className="w-4 h-4 mr-2" />
          Eksporter til kalender
        </Button>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious} disabled={isLoading}>
          Rediger
        </Button>
        <Button
          onClick={onSave}
          disabled={isLoading}
          className="bg-tier-gold hover:bg-tier-gold/90 text-white font-semibold"
        >
          {isLoading ? 'Lagrer...' : 'Lagre årsplan'}
        </Button>
      </div>
    </div>
  );
}
