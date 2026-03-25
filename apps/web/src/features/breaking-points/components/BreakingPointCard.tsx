/**
 * Breaking Point Card
 * Displays a single breaking point with details and recommendations
 */

import React from 'react';
import { AlertTriangle, TrendingDown, TrendingUp, MinusCircle, Calendar, Target } from 'lucide-react';
import { SubSectionTitle } from '../../../components/typography/Headings';

interface BreakingPoint {
  id: string;
  type: 'plateau' | 'regression' | 'breakthrough';
  date: string;
  area: string;
  title: string;
  description?: string;
  performanceBefore: number;
  performanceAfter: number;
  causes?: string[];
  recommendations?: string[];
  priority?: 'low' | 'medium' | 'high';
}

interface Props {
  breakingPoint: BreakingPoint;
  onClick?: () => void;
  className?: string;
}

const TYPE_CONFIG = {
  plateau: {
    label: 'Plateau',
    icon: MinusCircle,
    colorClasses: 'bg-tier-warning-light text-tier-warning',
    borderColor: 'border-tier-warning',
  },
  regression: {
    label: 'Regression',
    icon: TrendingDown,
    colorClasses: 'bg-tier-error-light text-tier-error',
    borderColor: 'border-tier-error',
  },
  breakthrough: {
    label: 'Breakthrough',
    icon: TrendingUp,
    colorClasses: 'bg-tier-success-light text-tier-success',
    borderColor: 'border-tier-success',
  },
};

const BreakingPointCard: React.FC<Props> = ({ breakingPoint, onClick, className = '' }) => {
  const config = TYPE_CONFIG[breakingPoint.type];
  const Icon = config.icon;

  const performanceChange = breakingPoint.performanceAfter - breakingPoint.performanceBefore;
  const performanceChangePercent = ((performanceChange / breakingPoint.performanceBefore) * 100).toFixed(1);

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border-2 ${config.borderColor} p-6 transition-all hover:shadow-lg ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.colorClasses}`}>
            <Icon size={20} />
          </div>
          <div>
            <div className={`text-xs font-semibold ${config.colorClasses} mb-1`}>
              {config.label}
            </div>
            <SubSectionTitle style={{ marginBottom: 0 }}>{breakingPoint.title}</SubSectionTitle>
            <div className="text-sm text-tier-text-secondary">{breakingPoint.area}</div>
          </div>
        </div>
        {breakingPoint.priority && (
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              breakingPoint.priority === 'high'
                ? 'bg-tier-error-light text-tier-error'
                : breakingPoint.priority === 'medium'
                ? 'bg-tier-warning-light text-tier-warning'
                : 'bg-tier-surface-secondary text-tier-text-secondary'
            }`}
          >
            {breakingPoint.priority === 'high'
              ? 'High priority'
              : breakingPoint.priority === 'medium'
              ? 'Medium'
              : 'Low'}
          </div>
        )}
      </div>

      {/* Date */}
      <div className="flex items-center gap-2 text-tier-text-secondary text-sm mb-4">
        <Calendar size={14} />
        <span>{new Date(breakingPoint.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</span>
      </div>

      {/* Description */}
      {breakingPoint.description && (
        <p className="text-tier-text-secondary text-sm mb-4">{breakingPoint.description}</p>
      )}

      {/* Performance change */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-tier-surface-base rounded-lg mb-4">
        <div className="text-center">
          <div className="text-xs text-tier-text-secondary mb-1">Before</div>
          <div className="text-lg font-bold text-tier-navy">
            {breakingPoint.performanceBefore.toFixed(1)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-tier-text-secondary mb-1">Change</div>
          <div className={`text-lg font-bold ${performanceChange >= 0 ? 'text-tier-success' : 'text-tier-error'}`}>
            {performanceChange >= 0 ? '+' : ''}{performanceChange.toFixed(1)}
            <span className="text-xs ml-1">({performanceChangePercent}%)</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-tier-text-secondary mb-1">After</div>
          <div className="text-lg font-bold text-tier-navy">
            {breakingPoint.performanceAfter.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Causes */}
      {breakingPoint.causes && breakingPoint.causes.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-tier-navy mb-2">
            <AlertTriangle size={14} />
            Possible causes
          </div>
          <ul className="space-y-1">
            {breakingPoint.causes.map((cause, index) => (
              <li key={index} className="text-sm text-tier-text-secondary pl-4">
                • {cause}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {breakingPoint.recommendations && breakingPoint.recommendations.length > 0 && (
        <div className="p-4 bg-tier-info-light rounded-lg border border-tier-info">
          <div className="flex items-center gap-2 text-sm font-semibold text-tier-navy mb-2">
            <Target size={14} />
            Recommendations
          </div>
          <ul className="space-y-1">
            {breakingPoint.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-tier-navy pl-4">
                • {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BreakingPointCard;
