/**
 * Step 2: Period Selection
 * Select which period types to include (E/G/S/T)
 */

import React from 'react';
import { Card } from '../../../components/shadcn/card';
import { Button } from '../../../components/shadcn/button';
import { Checkbox } from '../../../components/shadcn/checkbox';
import { Label } from '../../../components/shadcn/label';
import { PERIOD_LABELS, PERIOD_DESCRIPTIONS, PERIOD_COLORS } from '../utils/periodDefaults';
import { SectionTitle } from '../../../components/typography';

interface Step2PeriodSelectionProps {
  selectedPeriodTypes: Array<'E' | 'G' | 'S' | 'T'>;
  onUpdate: (types: Array<'E' | 'G' | 'S' | 'T'>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function Step2PeriodSelection({
  selectedPeriodTypes,
  onUpdate,
  onNext,
  onPrevious,
}: Step2PeriodSelectionProps) {
  const handleTogglePeriod = (type: 'E' | 'G' | 'S' | 'T') => {
    if (selectedPeriodTypes.includes(type)) {
      onUpdate(selectedPeriodTypes.filter((t) => t !== type));
    } else {
      onUpdate([...selectedPeriodTypes, type]);
    }
  };

  const handleNext = () => {
    if (selectedPeriodTypes.length === 0) {
      alert('Vennligst velg minst én periode');
      return;
    }
    onNext();
  };

  const periodOptions: Array<{
    type: 'E' | 'G' | 'S' | 'T';
    recommendedWeeks: string;
  }> = [
    { type: 'E', recommendedWeeks: '4-8 uker' },
    { type: 'G', recommendedWeeks: '12-20 uker' },
    { type: 'S', recommendedWeeks: '8-12 uker' },
    { type: 'T', recommendedWeeks: '12-20 uker' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <SectionTitle style={{ marginBottom: 0 }}>
          Hvilke treningsperioder vil du ha?
        </SectionTitle>
        <p className="text-tier-gray">
          Velg periodene som passer best for din sesong
        </p>
      </div>

      <div className="space-y-4">
        {periodOptions.map(({ type, recommendedWeeks }) => {
          const isSelected = selectedPeriodTypes.includes(type);
          const colors = PERIOD_COLORS[type];

          return (
            <Card
              key={type}
              className={`p-5 cursor-pointer transition-all ${
                isSelected
                  ? `ring-2 ring-[${colors.primary}] bg-[${colors.light}]/10`
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleTogglePeriod(type)}
            >
              <div className="flex items-start space-x-4">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleTogglePeriod(type)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: colors.primary }}
                    />
                    <Label className="text-lg font-semibold text-tier-navy cursor-pointer">
                      {PERIOD_LABELS[type]} ({type})
                    </Label>
                  </div>
                  <p className="text-sm text-tier-gray">
                    {PERIOD_DESCRIPTIONS[type]}
                  </p>
                  <p className="text-xs text-tier-gold font-medium">
                    Anbefalt: {recommendedWeeks}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Tilbake
        </Button>
        <Button onClick={handleNext} className="bg-tier-navy hover:bg-tier-navy/90">
          Neste steg
        </Button>
      </div>
    </div>
  );
}
