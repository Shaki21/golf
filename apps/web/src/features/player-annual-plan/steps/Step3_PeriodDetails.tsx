/**
 * Step 3: Period Details
 * Configure details for each selected period
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/shadcn/card';
import { Button } from '../../../components/shadcn/button';
import { Input } from '../../../components/shadcn/input';
import { Label } from '../../../components/shadcn/label';
import { FrequencySelector } from '../components/FrequencySelector';
import {
  PERIOD_LABELS,
  PERIOD_COLORS,
  PERIOD_DEFAULTS,
} from '../utils/periodDefaults';
import type { Period } from '../hooks/usePlayerAnnualPlan';
import { SectionTitle } from '../../../components/typography';

interface Step3PeriodDetailsProps {
  selectedPeriodTypes: Array<'E' | 'G' | 'S' | 'T'>;
  periods: Period[];
  basicInfo: {
    startDate: string;
    endDate: string;
  };
  onUpdate: (periods: Period[]) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function Step3PeriodDetails({
  selectedPeriodTypes,
  periods,
  basicInfo,
  onUpdate,
  onNext,
  onPrevious,
}: Step3PeriodDetailsProps) {
  const [currentPeriodIndex, setCurrentPeriodIndex] = useState(0);
  const [localPeriods, setLocalPeriods] = useState<Period[]>([]);

  // Initialize periods based on selected types
  useEffect(() => {
    if (periods.length === 0 && selectedPeriodTypes.length > 0) {
      const newPeriods = selectedPeriodTypes.map((type) => {
        const defaults = PERIOD_DEFAULTS[type];
        const colors = PERIOD_COLORS[type];

        return {
          id: crypto.randomUUID(),
          type,
          name: defaults.name,
          description: defaults.description,
          startDate: basicInfo.startDate,
          endDate: basicInfo.endDate,
          weeklyFrequency: defaults.weeklyFrequency,
          goals: [...defaults.goals],
          color: colors.primary,
          textColor: colors.text,
        };
      });
      setLocalPeriods(newPeriods);
    } else if (periods.length > 0) {
      setLocalPeriods(periods);
    }
  }, [selectedPeriodTypes, periods, basicInfo]);

  const currentPeriod = localPeriods[currentPeriodIndex];

  const updateCurrentPeriod = (updates: Partial<Period>) => {
    const updated = [...localPeriods];
    updated[currentPeriodIndex] = { ...updated[currentPeriodIndex], ...updates };
    setLocalPeriods(updated);
  };

  const handleNext = () => {
    if (currentPeriodIndex < localPeriods.length - 1) {
      setCurrentPeriodIndex(currentPeriodIndex + 1);
    } else {
      // Validate all periods
      for (const period of localPeriods) {
        if (!period.name.trim()) {
          alert('Alle perioder må ha et navn');
          return;
        }
        if (!period.startDate || !period.endDate) {
          alert('Alle perioder må ha start- og sluttdato');
          return;
        }
        if (new Date(period.endDate) <= new Date(period.startDate)) {
          alert('Sluttdato må være etter startdato for alle perioder');
          return;
        }
      }
      onUpdate(localPeriods);
      onNext();
    }
  };

  const handlePrevious = () => {
    if (currentPeriodIndex > 0) {
      setCurrentPeriodIndex(currentPeriodIndex - 1);
    } else {
      onPrevious();
    }
  };

  if (!currentPeriod) {
    return null;
  }

  const colors = PERIOD_COLORS[currentPeriod.type];

  // Calculate weeks between dates
  const getWeeksBetween = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks;
  };

  const weeks = getWeeksBetween(currentPeriod.startDate, currentPeriod.endDate);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <div
            className="w-6 h-6 rounded"
            style={{ backgroundColor: colors.primary }}
          />
          <SectionTitle style={{ marginBottom: 0 }}>
            Periode {currentPeriodIndex + 1}: {PERIOD_LABELS[currentPeriod.type]}
          </SectionTitle>
        </div>
        <p className="text-tier-gray">
          Tilpass detaljer for denne perioden
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Period Name */}
        <div className="space-y-2">
          <Label htmlFor="periodName" className="text-sm font-medium text-tier-navy">
            Navn på periode
          </Label>
          <Input
            id="periodName"
            type="text"
            value={currentPeriod.name}
            onChange={(e) => updateCurrentPeriod({ name: e.target.value })}
            className="w-full"
          />
        </div>

        {/* Date Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-tier-navy">Varighet</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periodStart" className="text-xs text-tier-gray">
                Fra
              </Label>
              <Input
                id="periodStart"
                type="date"
                value={currentPeriod.startDate}
                onChange={(e) => updateCurrentPeriod({ startDate: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodEnd" className="text-xs text-tier-gray">
                Til
              </Label>
              <Input
                id="periodEnd"
                type="date"
                value={currentPeriod.endDate}
                onChange={(e) => updateCurrentPeriod({ endDate: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
          {weeks > 0 && (
            <p className="text-sm text-tier-gray">({weeks} uker)</p>
          )}
        </div>

        {/* Weekly Frequency */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-tier-navy">
            Ukentlig treningsfrekvens (økter per uke)
          </Label>
          <FrequencySelector
            value={currentPeriod.weeklyFrequency}
            onChange={(freq) => updateCurrentPeriod({ weeklyFrequency: freq })}
          />
        </div>

        {/* Weekly Hours */}
        <div className="space-y-2">
          <Label htmlFor="weeklyHours" className="text-sm font-medium text-tier-navy">
            Treningstimer per uke
          </Label>
          <Input
            id="weeklyHours"
            type="number"
            min={1}
            max={40}
            value={currentPeriod.weeklyHours || ''}
            onChange={(e) => updateCurrentPeriod({ weeklyHours: parseInt(e.target.value) || undefined })}
            placeholder="f.eks. 10"
            className="max-w-xs"
          />
          <p className="text-xs text-tier-text-tertiary">
            Estimert antall timer trening per uke i denne perioden
          </p>
        </div>

        {/* Description (optional) */}
        <div className="space-y-2">
          <Label htmlFor="periodDescription" className="text-sm font-medium text-tier-navy">
            Beskrivelse (valgfritt)
          </Label>
          <textarea
            id="periodDescription"
            value={currentPeriod.description || ''}
            onChange={(e) => updateCurrentPeriod({ description: e.target.value })}
            className="w-full min-h-[80px] px-3 py-2 border rounded-md"
            placeholder="Beskriv fokusområder for denne perioden..."
          />
        </div>
      </Card>

      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-2">
        {localPeriods.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentPeriodIndex
                ? 'bg-tier-navy w-8'
                : index < currentPeriodIndex
                ? 'bg-tier-gold'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious}>
          Tilbake
        </Button>
        <Button onClick={handleNext} className="bg-tier-navy hover:bg-tier-navy/90">
          {currentPeriodIndex < localPeriods.length - 1
            ? 'Neste periode'
            : 'Neste steg'}
        </Button>
      </div>
    </div>
  );
}
