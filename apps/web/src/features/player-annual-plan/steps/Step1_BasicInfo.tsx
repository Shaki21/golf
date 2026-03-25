/**
 * Step 1: Basic Information
 * Collect plan name, dates, and player level
 */

import React from 'react';
import { Card } from '../../../components/shadcn/card';
import { Button } from '../../../components/shadcn/button';
import { Input } from '../../../components/shadcn/input';
import { Label } from '../../../components/shadcn/label';
import { RadioGroup, RadioGroupItem } from '../../../components/shadcn/radio-group';
import { SectionTitle } from '../../../components/typography';

interface Step1BasicInfoProps {
  basicInfo: {
    name: string;
    startDate: string;
    endDate: string;
    playerLevel: string;
  };
  onUpdate: (info: Partial<Step1BasicInfoProps['basicInfo']>) => void;
  onNext: () => void;
  onCancel: () => void;
}

export function Step1BasicInfo({
  basicInfo,
  onUpdate,
  onNext,
  onCancel,
}: Step1BasicInfoProps) {
  const handleNext = () => {
    // Validation
    if (!basicInfo.name.trim()) {
      alert('Vennligst skriv inn et navn for planen');
      return;
    }
    if (!basicInfo.startDate || !basicInfo.endDate) {
      alert('Vennligst velg start- og sluttdato');
      return;
    }
    if (new Date(basicInfo.endDate) <= new Date(basicInfo.startDate)) {
      alert('Sluttdato må være etter startdato');
      return;
    }
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <SectionTitle style={{ marginBottom: 0 }}>Opprett din årsplan</SectionTitle>
        <p className="text-tier-gray">
          La oss starte med grunnleggende informasjon om din treningsplan
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Plan Name */}
        <div className="space-y-2">
          <Label htmlFor="planName" className="text-sm font-medium text-tier-navy">
            Planens navn
          </Label>
          <Input
            id="planName"
            type="text"
            placeholder="Min treningsplan 2026"
            value={basicInfo.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full"
          />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm font-medium text-tier-navy">
              Startdato
            </Label>
            <Input
              id="startDate"
              type="date"
              value={basicInfo.startDate}
              onChange={(e) => onUpdate({ startDate: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm font-medium text-tier-navy">
              Sluttdato
            </Label>
            <Input
              id="endDate"
              type="date"
              value={basicInfo.endDate}
              onChange={(e) => onUpdate({ endDate: e.target.value })}
              className="w-full"
            />
          </div>
        </div>

        {/* Player Level */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-tier-navy">
            Din nåværende kategori
          </Label>
          <RadioGroup
            value={basicInfo.playerLevel}
            onValueChange={(value) => onUpdate({ playerLevel: value })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="elite" id="elite" />
              <Label htmlFor="elite" className="cursor-pointer">
                Elite
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="aspirant" id="aspirant" />
              <Label htmlFor="aspirant" className="cursor-pointer">
                Aspirant
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="talent" id="talent" />
              <Label htmlFor="talent" className="cursor-pointer">
                Talent
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="junior" id="junior" />
              <Label htmlFor="junior" className="cursor-pointer">
                Junior
              </Label>
            </div>
          </RadioGroup>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Avbryt
        </Button>
        <Button onClick={handleNext} className="bg-tier-navy hover:bg-tier-navy/90">
          Neste steg
        </Button>
      </div>
    </div>
  );
}
