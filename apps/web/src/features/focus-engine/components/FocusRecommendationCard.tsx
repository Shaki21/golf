/**
 * Focus Recommendation Card
 * Displays AI-generated training focus recommendation
 */

import React from 'react';
import { Target, TrendingUp, Zap, Info } from 'lucide-react';
import Button from '../../../ui/primitives/Button';
import { SubSectionTitle } from '../../../components/typography';

interface FocusRecommendation {
  id: string;
  focusArea: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  impactScore: number; // 0-100
  reasoning: string;
  currentLevel?: number;
  targetLevel?: number;
  estimatedWeeks?: number;
}

interface Props {
  recommendation: FocusRecommendation;
  onStartTraining?: (recommendation: FocusRecommendation) => void;
  className?: string;
}

const PRIORITY_CONFIG = {
  high: {
    label: 'Høy prioritet',
    colorClasses: 'bg-tier-error-light text-tier-error',
    borderColor: 'border-tier-error',
    bgColor: 'bg-tier-error',
  },
  medium: {
    label: 'Middels prioritet',
    colorClasses: 'bg-tier-warning-light text-tier-warning',
    borderColor: 'border-tier-warning',
    bgColor: 'bg-tier-warning',
  },
  low: {
    label: 'Lav prioritet',
    colorClasses: 'bg-tier-info-light text-tier-info',
    borderColor: 'border-tier-info',
    bgColor: 'bg-tier-info',
  },
};

const FocusRecommendationCard: React.FC<Props> = ({
  recommendation,
  onStartTraining,
  className = '',
}) => {
  const config = PRIORITY_CONFIG[recommendation.priority];

  return (
    <div
      className={`bg-white rounded-xl border-2 ${config.borderColor} p-6 hover:shadow-lg transition-all ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className={`${config.bgColor} text-white p-3 rounded-lg`}>
            <Target size={24} />
          </div>
          <div>
            <SubSectionTitle style={{ marginBottom: 4 }}>
              {recommendation.focusArea}
            </SubSectionTitle>
            <div className="text-sm text-tier-text-secondary">{recommendation.category}</div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${config.colorClasses}`}>
          {config.label}
        </div>
      </div>

      {/* Impact score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-medium text-tier-navy">
            <Zap size={16} className="text-tier-warning" />
            Forventet effekt
          </div>
          <span className="text-sm font-bold text-tier-navy">
            {recommendation.impactScore}/100
          </span>
        </div>
        <div className="w-full bg-tier-surface-secondary rounded-full h-2">
          <div
            className={`h-2 rounded-full ${config.bgColor}`}
            style={{ width: `${recommendation.impactScore}%` }}
          />
        </div>
      </div>

      {/* Progress info */}
      {recommendation.currentLevel !== undefined && recommendation.targetLevel !== undefined && (
        <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-tier-surface-base rounded-lg">
          <div className="text-center">
            <div className="text-xs text-tier-text-secondary mb-1">Nåværende</div>
            <div className="text-lg font-bold text-tier-navy">
              {recommendation.currentLevel.toFixed(1)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-tier-text-secondary mb-1">Mål</div>
            <div className="text-lg font-bold text-tier-success">
              {recommendation.targetLevel.toFixed(1)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-tier-text-secondary mb-1">Estimert tid</div>
            <div className="text-lg font-bold text-tier-navy">
              {recommendation.estimatedWeeks}u
            </div>
          </div>
        </div>
      )}

      {/* Reasoning */}
      <div className="mb-4 p-4 bg-tier-info-light rounded-lg border border-tier-info">
        <div className="flex items-start gap-2">
          <Info size={16} className="text-tier-info mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-sm font-semibold text-tier-navy mb-1">Hvorfor dette området?</div>
            <p className="text-sm text-tier-navy">{recommendation.reasoning}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {onStartTraining && (
        <Button
          variant="primary"
          className="w-full"
          leftIcon={<TrendingUp size={18} />}
          onClick={() => onStartTraining(recommendation)}
        >
          Start trening nå
        </Button>
      )}
    </div>
  );
};

export default FocusRecommendationCard;
