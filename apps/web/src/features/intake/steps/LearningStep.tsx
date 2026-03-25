/**
 * Learning Step - Preferred learning style and motivations
 */

import React, { useState, useEffect } from 'react';
import { CardTitle } from '../../../components/typography';

interface Props {
  data?: any;
  onComplete: (data: any) => void;
}

const LEARNING_STYLES = [
  { value: 'visual', label: 'Visual', description: 'Learn best by watching demonstrations and videos', icon: 'V' },
  { value: 'verbal', label: 'Verbal', description: 'Learn best through detailed explanations', icon: 'T' },
  { value: 'kinesthetic', label: 'Kinesthetic', description: 'Learn best by doing and feeling the movement', icon: 'K' },
  { value: 'mixed', label: 'Mixed', description: 'Combination of multiple learning styles', icon: 'M' },
];

const MOTIVATION_TYPES = [
  { value: 'competition', label: 'Competition', description: 'Motivated by competing and winning', icon: 'C' },
  { value: 'personal_growth', label: 'Personal growth', description: 'Motivated by personal progress', icon: 'P' },
  { value: 'social', label: 'Social', description: 'Motivated by community and social aspects', icon: 'S' },
  { value: 'achievement', label: 'Achievement', description: 'Motivated by reaching specific goals', icon: 'A' },
];

const LearningStep: React.FC<Props> = ({ data, onComplete }) => {
  const [formData, setFormData] = useState({
    preferredStyle: data?.preferredStyle || 'mixed',
    wantsDetailedExplanations: data?.wantsDetailedExplanations ?? true,
    prefersStructure: data?.prefersStructure ?? true,
    motivationType: data?.motivationType || 'personal_growth',
  });

  useEffect(() => {
    onComplete(formData);
  }, [formData, onComplete]);

  return (
    <div className="space-y-6">
      {/* Learning Style */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Preferred learning style
        </label>
        <p className="text-xs text-tier-text-secondary mb-3">
          How do you learn new golf movements best?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {LEARNING_STYLES.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => setFormData({ ...formData, preferredStyle: style.value })}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                formData.preferredStyle === style.value
                  ? 'border-tier-info bg-tier-info-light'
                  : 'border-tier-border-default hover:border-tier-info'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{style.icon}</span>
                <div className="font-medium text-sm text-tier-navy">{style.label}</div>
              </div>
              <div className="text-xs text-tier-text-secondary">{style.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Explanations */}
      <div>
        <label className="flex items-center gap-3 p-4 bg-tier-surface-base rounded-lg cursor-pointer hover:bg-tier-info-light transition-all">
          <input
            type="checkbox"
            checked={formData.wantsDetailedExplanations}
            onChange={(e) => setFormData({ ...formData, wantsDetailedExplanations: e.target.checked })}
            className="w-5 h-5 text-tier-info rounded focus:ring-tier-info"
          />
          <div>
            <div className="font-medium text-sm text-tier-navy">Want detailed explanations</div>
            <div className="text-xs text-tier-text-secondary">
              I want to understand the "why" behind each exercise and technique
            </div>
          </div>
        </label>
      </div>

      {/* Structure Preference */}
      <div>
        <label className="flex items-center gap-3 p-4 bg-tier-surface-base rounded-lg cursor-pointer hover:bg-tier-info-light transition-all">
          <input
            type="checkbox"
            checked={formData.prefersStructure}
            onChange={(e) => setFormData({ ...formData, prefersStructure: e.target.checked })}
            className="w-5 h-5 text-tier-info rounded focus:ring-tier-info"
          />
          <div>
            <div className="font-medium text-sm text-tier-navy">Prefer structured plan</div>
            <div className="text-xs text-tier-text-secondary">
              I like clear plans and routines over improvisation
            </div>
          </div>
        </label>
      </div>

      {/* Motivation Type */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          What motivates you most?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MOTIVATION_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData({ ...formData, motivationType: type.value })}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                formData.motivationType === type.value
                  ? 'border-tier-success bg-tier-success-light'
                  : 'border-tier-border-default hover:border-tier-success'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{type.icon}</span>
                <div className="font-medium text-sm text-tier-navy">{type.label}</div>
              </div>
              <div className="text-xs text-tier-text-secondary">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-tier-success-light border border-tier-success rounded-lg p-4">
        <CardTitle className="text-sm font-semibold text-tier-navy mb-2">Almost done!</CardTitle>
        <p className="text-xs text-tier-text-secondary mb-2">
          By understanding how you learn best and what motivates you, we can create a training plan
          that fits your personality and learning style. This increases the chances of long-term success.
        </p>
        <p className="text-xs font-medium text-tier-navy">
          When you click "Complete" we will generate a customized training plan for you.
        </p>
      </div>
    </div>
  );
};

export default LearningStep;
