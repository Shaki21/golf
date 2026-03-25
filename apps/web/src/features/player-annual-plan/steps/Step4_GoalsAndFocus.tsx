/**
 * Step 4: Short-term and Long-term Goals
 * Define goals for 6-12 months and 1-3 years
 */

import React, { useState } from 'react';
import { Card } from '../../../components/shadcn/card';
import { Button } from '../../../components/shadcn/button';
import { Input } from '../../../components/shadcn/input';
import { Label } from '../../../components/shadcn/label';
import { Plus, X } from 'lucide-react';
import { SectionTitle } from '../../../components/typography';

interface Step4GoalsAndFocusProps {
  shortTermGoals: string[];
  longTermGoals: string[];
  onUpdateShortTermGoals: (goals: string[]) => void;
  onUpdateLongTermGoals: (goals: string[]) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function Step4GoalsAndFocus({
  shortTermGoals,
  longTermGoals,
  onUpdateShortTermGoals,
  onUpdateLongTermGoals,
  onNext,
  onPrevious,
}: Step4GoalsAndFocusProps) {
  const [newShortTermGoal, setNewShortTermGoal] = useState('');
  const [newLongTermGoal, setNewLongTermGoal] = useState('');

  const handleAddShortTermGoal = () => {
    if (newShortTermGoal.trim()) {
      onUpdateShortTermGoals([...shortTermGoals, newShortTermGoal.trim()]);
      setNewShortTermGoal('');
    }
  };

  const handleRemoveShortTermGoal = (index: number) => {
    onUpdateShortTermGoals(shortTermGoals.filter((_, i) => i !== index));
  };

  const handleAddLongTermGoal = () => {
    if (newLongTermGoal.trim()) {
      onUpdateLongTermGoals([...longTermGoals, newLongTermGoal.trim()]);
      setNewLongTermGoal('');
    }
  };

  const handleRemoveLongTermGoal = (index: number) => {
    onUpdateLongTermGoals(longTermGoals.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (shortTermGoals.length === 0 && longTermGoals.length === 0) {
      alert('Vennligst legg til minst ett mål (kortsiktig eller langsiktig)');
      return;
    }
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <SectionTitle style={{ marginBottom: 0 }}>
          Hva er dine mål?
        </SectionTitle>
        <p className="text-tier-gray">
          Definer både kortsiktige og langsiktige mål for din utvikling
        </p>
      </div>

      {/* Short-term Goals (6-12 months) */}
      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold text-tier-navy">
              Kortsiktige mål (6-12 måneder)
            </Label>
            <span className="text-xs text-tier-gray bg-gray-100 px-2 py-1 rounded">
              {shortTermGoals.length} mål
            </span>
          </div>
          <p className="text-sm text-tier-gray">
            Hva vil du oppnå i løpet av det neste året?
          </p>
        </div>

        {/* Existing short-term goals */}
        {shortTermGoals.length > 0 && (
          <div className="space-y-2">
            {shortTermGoals.map((goal, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <span className="text-tier-navy">{goal}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveShortTermGoal(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add new short-term goal */}
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="F.eks. 'Senke handicap til 5.0'"
            value={newShortTermGoal}
            onChange={(e) => setNewShortTermGoal(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddShortTermGoal();
              }
            }}
            className="flex-1"
          />
          <Button
            onClick={handleAddShortTermGoal}
            className="bg-tier-gold hover:bg-tier-gold/90 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Legg til
          </Button>
        </div>

        {shortTermGoals.length === 0 && (
          <p className="text-sm text-tier-gray italic">
            Eksempler: "Senke handicap med 2 slag", "Vinne klubbmesterskap", "Forbedre driving accuracy 15%"
          </p>
        )}
      </Card>

      {/* Long-term Goals (1-3 years) */}
      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold text-tier-navy">
              Langsiktige mål (1-3 år)
            </Label>
            <span className="text-xs text-tier-gray bg-gray-100 px-2 py-1 rounded">
              {longTermGoals.length} mål
            </span>
          </div>
          <p className="text-sm text-tier-gray">
            Hvor ser du deg selv om 1-3 år?
          </p>
        </div>

        {/* Existing long-term goals */}
        {longTermGoals.length > 0 && (
          <div className="space-y-2">
            {longTermGoals.map((goal, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <span className="text-tier-navy">{goal}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveLongTermGoal(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add new long-term goal */}
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="F.eks. 'Spille på landslaget'"
            value={newLongTermGoal}
            onChange={(e) => setNewLongTermGoal(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddLongTermGoal();
              }
            }}
            className="flex-1"
          />
          <Button
            onClick={handleAddLongTermGoal}
            className="bg-tier-gold hover:bg-tier-gold/90 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Legg til
          </Button>
        </div>

        {longTermGoals.length === 0 && (
          <p className="text-sm text-tier-gray italic">
            Eksempler: "Bli profesjonell golfer", "Spille på landslaget", "Nå kategori A"
          </p>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="border-tier-navy text-tier-navy hover:bg-tier-navy hover:text-white"
        >
          Forrige
        </Button>
        <Button
          onClick={handleNext}
          className="bg-tier-gold hover:bg-tier-gold/90 text-white"
        >
          Neste
        </Button>
      </div>
    </div>
  );
}
