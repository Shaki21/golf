/**
 * Health Step - Injuries and chronic conditions
 */

import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import Input from '../../../ui/primitives/Input';
import Button from '../../../ui/primitives/Button';

interface Props {
  data?: any;
  onComplete: (data: any) => void;
}

interface Injury {
  type: string;
  dateOccurred?: string;
  resolved: boolean;
  requiresModification: boolean;
  affectedAreas: string[];
}

const AGE_GROUPS = [
  { value: '<25', label: 'Under 25' },
  { value: '25-35', label: '25-35 years' },
  { value: '35-45', label: '35-45 years' },
  { value: '45-55', label: '45-55 years' },
  { value: '55-65', label: '55-65 years' },
  { value: '65+', label: 'Over 65' },
];

const HealthStep: React.FC<Props> = ({ data, onComplete }) => {
  const [formData, setFormData] = useState({
    currentInjuries: data?.currentInjuries || [],
    injuryHistory: data?.injuryHistory || [],
    chronicConditions: data?.chronicConditions || [],
    mobilityIssues: data?.mobilityIssues || [],
    ageGroup: data?.ageGroup || '35-45',
  });

  const [newCondition, setNewCondition] = useState('');
  const [newMobilityIssue, setNewMobilityIssue] = useState('');

  useEffect(() => {
    onComplete(formData);
  }, [formData, onComplete]);

  const addCurrentInjury = () => {
    setFormData({
      ...formData,
      currentInjuries: [
        ...formData.currentInjuries,
        {
          type: '',
          dateOccurred: '',
          resolved: false,
          requiresModification: false,
          affectedAreas: [],
        },
      ],
    });
  };

  const updateCurrentInjury = (index: number, updates: Partial<Injury>) => {
    const updated = formData.currentInjuries.map((inj: Injury, i: number) =>
      i === index ? { ...inj, ...updates } : inj
    );
    setFormData({ ...formData, currentInjuries: updated });
  };

  const removeCurrentInjury = (index: number) => {
    setFormData({
      ...formData,
      currentInjuries: formData.currentInjuries.filter((_: any, i: number) => i !== index),
    });
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setFormData({
        ...formData,
        chronicConditions: [...formData.chronicConditions, newCondition.trim()],
      });
      setNewCondition('');
    }
  };

  const removeCondition = (index: number) => {
    setFormData({
      ...formData,
      chronicConditions: formData.chronicConditions.filter((_: string, i: number) => i !== index),
    });
  };

  const addMobilityIssue = () => {
    if (newMobilityIssue.trim()) {
      setFormData({
        ...formData,
        mobilityIssues: [...formData.mobilityIssues, newMobilityIssue.trim()],
      });
      setNewMobilityIssue('');
    }
  };

  const removeMobilityIssue = (index: number) => {
    setFormData({
      ...formData,
      mobilityIssues: formData.mobilityIssues.filter((_: string, i: number) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Age Group */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Age group
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {AGE_GROUPS.map((group) => (
            <button
              key={group.value}
              type="button"
              onClick={() => setFormData({ ...formData, ageGroup: group.value })}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                formData.ageGroup === group.value
                  ? 'border-tier-info bg-tier-info-light text-tier-navy'
                  : 'border-tier-border-default text-tier-text-secondary hover:border-tier-info'
              }`}
            >
              {group.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current Injuries */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Current injuries <span className="text-tier-text-secondary font-normal">(optional)</span>
        </label>

        {formData.currentInjuries.length > 0 && (
          <div className="space-y-3 mb-3">
            {formData.currentInjuries.map((injury: Injury, index: number) => (
              <div key={index} className="p-4 bg-tier-surface-base rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-sm font-medium text-tier-navy">Injury #{index + 1}</div>
                  <button
                    type="button"
                    onClick={() => removeCurrentInjury(index)}
                    className="p-1 text-tier-error hover:bg-tier-error-light rounded transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <Input
                    type="text"
                    value={injury.type}
                    onChange={(e) => updateCurrentInjury(index, { type: e.target.value })}
                    placeholder="Type of injury (e.g. Golfer's elbow, Back pain)"
                    className="w-full"
                  />

                  <Input
                    type="date"
                    value={injury.dateOccurred || ''}
                    onChange={(e) => updateCurrentInjury(index, { dateOccurred: e.target.value })}
                    className="w-full"
                  />

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={injury.resolved}
                        onChange={(e) => updateCurrentInjury(index, { resolved: e.target.checked })}
                        className="w-4 h-4 text-tier-info rounded"
                      />
                      <span className="text-sm text-tier-navy">Healed</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={injury.requiresModification}
                        onChange={(e) => updateCurrentInjury(index, { requiresModification: e.target.checked })}
                        className="w-4 h-4 text-tier-warning rounded"
                      />
                      <span className="text-sm text-tier-navy">Requires modification</span>
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
          onClick={addCurrentInjury}
          leftIcon={<Plus size={16} />}
        >
          Add injury
        </Button>
      </div>

      {/* Chronic Conditions */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Chronic conditions <span className="text-tier-text-secondary font-normal">(optional)</span>
        </label>

        {formData.chronicConditions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.chronicConditions.map((condition: string, index: number) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 bg-tier-warning-light text-tier-navy rounded-full text-sm"
              >
                <span>{condition}</span>
                <button
                  type="button"
                  onClick={() => removeCondition(index)}
                  className="hover:text-tier-error transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            type="text"
            value={newCondition}
            onChange={(e) => setNewCondition(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
            placeholder="e.g. Diabetes, High blood pressure"
            className="flex-1"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={addCondition}
            disabled={!newCondition.trim()}
            leftIcon={<Plus size={16} />}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Mobility Issues */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Mobility challenges <span className="text-tier-text-secondary font-normal">(optional)</span>
        </label>

        {formData.mobilityIssues.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.mobilityIssues.map((issue: string, index: number) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 bg-tier-info-light text-tier-navy rounded-full text-sm"
              >
                <span>{issue}</span>
                <button
                  type="button"
                  onClick={() => removeMobilityIssue(index)}
                  className="hover:text-tier-error transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            type="text"
            value={newMobilityIssue}
            onChange={(e) => setNewMobilityIssue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMobilityIssue())}
            placeholder="e.g. Limited hip rotation, Stiff neck"
            className="flex-1"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={addMobilityIssue}
            disabled={!newMobilityIssue.trim()}
            leftIcon={<Plus size={16} />}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HealthStep;
