/**
 * Background Step - Golf history and experience
 */

import React, { useState, useEffect } from 'react';
import Input from '../../../ui/primitives/Input';

interface Props {
  data?: any;
  onComplete: (data: any) => void;
}

const TRAINING_HISTORY = [
  { value: 'none', label: 'No organized training', description: 'Playing on your own' },
  { value: 'sporadic', label: 'Sporadic training', description: 'Occasional sessions with a coach' },
  { value: 'regular', label: 'Regular training', description: 'Regular training sessions' },
  { value: 'systematic', label: 'Systematic training', description: 'Structured training program' },
];

const BackgroundStep: React.FC<Props> = ({ data, onComplete }) => {
  const [formData, setFormData] = useState({
    yearsPlaying: data?.yearsPlaying || 0,
    currentHandicap: data?.currentHandicap || 36,
    averageScore: data?.averageScore || 90,
    roundsPerYear: data?.roundsPerYear || 20,
    trainingHistory: data?.trainingHistory || 'none',
  });

  useEffect(() => {
    onComplete(formData);
  }, [formData, onComplete]);

  return (
    <div className="space-y-6">
      {/* Years Playing */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          How many years have you played golf?
        </label>
        <Input
          type="number"
          min={0}
          max={100}
          value={formData.yearsPlaying}
          onChange={(e) => setFormData({ ...formData, yearsPlaying: parseInt(e.target.value) || 0 })}
          className="w-full"
        />
      </div>

      {/* Current Handicap */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Current handicap
        </label>
        <Input
          type="number"
          min={-5}
          max={54}
          step={0.1}
          value={formData.currentHandicap}
          onChange={(e) => setFormData({ ...formData, currentHandicap: parseFloat(e.target.value) || 36 })}
          className="w-full"
        />
        <p className="text-xs text-tier-text-secondary mt-1">Handicap between -5 and 54</p>
      </div>

      {/* Average Score */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Average score (18 holes)
        </label>
        <Input
          type="number"
          min={60}
          max={150}
          value={formData.averageScore}
          onChange={(e) => setFormData({ ...formData, averageScore: parseInt(e.target.value) || 90 })}
          className="w-full"
        />
      </div>

      {/* Rounds Per Year */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Number of rounds per year
        </label>
        <Input
          type="number"
          min={0}
          max={200}
          value={formData.roundsPerYear}
          onChange={(e) => setFormData({ ...formData, roundsPerYear: parseInt(e.target.value) || 20 })}
          className="w-full"
        />
      </div>

      {/* Training History */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Training history
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TRAINING_HISTORY.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData({ ...formData, trainingHistory: option.value })}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                formData.trainingHistory === option.value
                  ? 'border-tier-info bg-tier-info-light'
                  : 'border-tier-border-default hover:border-tier-info'
              }`}
            >
              <div className="font-medium text-sm text-tier-navy mb-1">{option.label}</div>
              <div className="text-xs text-tier-text-secondary">{option.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BackgroundStep;
