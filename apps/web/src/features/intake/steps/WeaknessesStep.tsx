/**
 * Weaknesses Step - Problem areas and challenges
 */

import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import Input from '../../../ui/primitives/Input';
import Button from '../../../ui/primitives/Button';

interface Props {
  data?: any;
  onComplete: (data: any) => void;
}

interface PhysicalLimitation {
  area: string;
  severity: string;
  affectsSwing: boolean;
}

const PROBLEM_AREAS = [
  'Driving',
  'Fairway woods',
  'Long irons',
  'Short irons',
  'Wedges',
  'Putting',
  'Bunker',
  'Chipping',
  'Course strategy',
  'Mental game',
];

const MENTAL_CHALLENGES = [
  'Performance anxiety',
  'Focus',
  'Self-confidence',
  'Stress management',
  'Tournament nerves',
  'Negative thoughts',
];

const LIMITATION_AREAS = [
  { value: 'back', label: 'Back' },
  { value: 'shoulder', label: 'Shoulder' },
  { value: 'wrist', label: 'Wrist' },
  { value: 'hip', label: 'Hip' },
  { value: 'knee', label: 'Knee' },
  { value: 'elbow', label: 'Elbow' },
];

const SEVERITIES = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'significant', label: 'Significant' },
];

const WeaknessesStep: React.FC<Props> = ({ data, onComplete }) => {
  const [formData, setFormData] = useState({
    biggestFrustration: data?.biggestFrustration || '',
    problemAreas: data?.problemAreas || [],
    mentalChallenges: data?.mentalChallenges || [],
    physicalLimitations: data?.physicalLimitations || [],
  });

  useEffect(() => {
    onComplete(formData);
  }, [formData, onComplete]);

  const toggleProblemArea = (area: string) => {
    const areas = formData.problemAreas.includes(area)
      ? formData.problemAreas.filter((a: string) => a !== area)
      : [...formData.problemAreas, area];
    setFormData({ ...formData, problemAreas: areas });
  };

  const toggleMentalChallenge = (challenge: string) => {
    const challenges = formData.mentalChallenges.includes(challenge)
      ? formData.mentalChallenges.filter((c: string) => c !== challenge)
      : [...formData.mentalChallenges, challenge];
    setFormData({ ...formData, mentalChallenges: challenges });
  };

  const addPhysicalLimitation = () => {
    setFormData({
      ...formData,
      physicalLimitations: [
        ...formData.physicalLimitations,
        { area: 'back', severity: 'mild', affectsSwing: false },
      ],
    });
  };

  const updatePhysicalLimitation = (index: number, updates: Partial<PhysicalLimitation>) => {
    const updated = formData.physicalLimitations.map((lim: PhysicalLimitation, i: number) =>
      i === index ? { ...lim, ...updates } : lim
    );
    setFormData({ ...formData, physicalLimitations: updated });
  };

  const removePhysicalLimitation = (index: number) => {
    setFormData({
      ...formData,
      physicalLimitations: formData.physicalLimitations.filter((_: any, i: number) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Biggest Frustration */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          What is your biggest frustration with your golf game?
        </label>
        <textarea
          value={formData.biggestFrustration}
          onChange={(e) => setFormData({ ...formData, biggestFrustration: e.target.value })}
          placeholder="Briefly describe what frustrates you most..."
          rows={3}
          className="w-full px-4 py-3 border border-tier-border-default rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-tier-info focus:border-transparent text-sm"
        />
      </div>

      {/* Problem Areas */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Which areas need the most improvement?
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {PROBLEM_AREAS.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => toggleProblemArea(area)}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                formData.problemAreas.includes(area)
                  ? 'border-tier-error bg-tier-error-light text-tier-navy'
                  : 'border-tier-border-default text-tier-text-secondary hover:border-tier-error'
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Mental Challenges */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Mental challenges <span className="text-tier-text-secondary font-normal">(optional)</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {MENTAL_CHALLENGES.map((challenge) => (
            <button
              key={challenge}
              type="button"
              onClick={() => toggleMentalChallenge(challenge)}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                formData.mentalChallenges.includes(challenge)
                  ? 'border-tier-warning bg-tier-warning-light text-tier-navy'
                  : 'border-tier-border-default text-tier-text-secondary hover:border-tier-warning'
              }`}
            >
              {challenge}
            </button>
          ))}
        </div>
      </div>

      {/* Physical Limitations */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Physical limitations <span className="text-tier-text-secondary font-normal">(optional)</span>
        </label>

        {formData.physicalLimitations.length > 0 && (
          <div className="space-y-3 mb-3">
            {formData.physicalLimitations.map((limitation: PhysicalLimitation, index: number) => (
              <div key={index} className="p-4 bg-tier-surface-base rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-sm font-medium text-tier-navy">Limitation #{index + 1}</div>
                  <button
                    type="button"
                    onClick={() => removePhysicalLimitation(index)}
                    className="p-1 text-tier-error hover:bg-tier-error-light rounded transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-tier-text-secondary mb-1">Area</label>
                    <select
                      value={limitation.area}
                      onChange={(e) => updatePhysicalLimitation(index, { area: e.target.value })}
                      className="w-full px-3 py-2 border border-tier-border-default rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tier-info"
                    >
                      {LIMITATION_AREAS.map((area) => (
                        <option key={area.value} value={area.value}>
                          {area.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-tier-text-secondary mb-1">Severity</label>
                    <select
                      value={limitation.severity}
                      onChange={(e) => updatePhysicalLimitation(index, { severity: e.target.value })}
                      className="w-full px-3 py-2 border border-tier-border-default rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tier-info"
                    >
                      {SEVERITIES.map((sev) => (
                        <option key={sev.value} value={sev.value}>
                          {sev.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-tier-text-secondary mb-1">Affects swing?</label>
                    <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={limitation.affectsSwing}
                        onChange={(e) => updatePhysicalLimitation(index, { affectsSwing: e.target.checked })}
                        className="w-4 h-4 text-tier-info rounded"
                      />
                      <span className="text-sm text-tier-navy">Yes</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          variant="secondary"
          size="sm"
          onClick={addPhysicalLimitation}
          leftIcon={<Plus size={16} />}
        >
          Add limitation
        </Button>
      </div>
    </div>
  );
};

export default WeaknessesStep;
