/**
 * Breaking Point Timeline
 * Visual timeline showing performance inflection points chronologically
 */

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, MinusCircle } from 'lucide-react';
import { SubSectionTitle, CardTitle } from '../../../components/typography/Headings';

interface TimelineBreakingPoint {
  id: string;
  date: string;
  type: 'plateau' | 'regression' | 'breakthrough';
  title: string;
  area: string;
  performanceChange: number;
}

interface Props {
  breakingPoints: TimelineBreakingPoint[];
  onPointClick?: (id: string) => void;
  className?: string;
}

const TYPE_CONFIG = {
  plateau: {
    icon: MinusCircle,
    color: 'bg-tier-warning',
    borderColor: 'border-tier-warning',
    textColor: 'text-tier-warning',
  },
  regression: {
    icon: TrendingDown,
    color: 'bg-tier-error',
    borderColor: 'border-tier-error',
    textColor: 'text-tier-error',
  },
  breakthrough: {
    icon: TrendingUp,
    color: 'bg-tier-success',
    borderColor: 'border-tier-success',
    textColor: 'text-tier-success',
  },
};

const BreakingPointTimeline: React.FC<Props> = ({
  breakingPoints,
  onPointClick,
  className = '',
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Sort breaking points by date (oldest first)
  const sortedPoints = [...breakingPoints].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (sortedPoints.length === 0) {
    return (
      <div className={`bg-white rounded-xl border border-tier-border-default p-12 text-center ${className}`}>
        <div className="text-tier-text-secondary text-4xl mb-4">[Chart]</div>
        <SubSectionTitle style={{ marginBottom: '0.5rem' }}>No breaking points yet</SubSectionTitle>
        <p className="text-tier-text-secondary">
          When the system identifies significant changes in your performance, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-tier-border-default p-6 ${className}`}>
      <SubSectionTitle style={{ marginBottom: '1.5rem' }}>Timeline</SubSectionTitle>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-tier-border-default" />

        {/* Timeline points */}
        <div className="space-y-8">
          {sortedPoints.map((point, index) => {
            const config = TYPE_CONFIG[point.type];
            const Icon = config.icon;
            const isHovered = hoveredId === point.id;

            return (
              <div
                key={point.id}
                className="relative flex items-start gap-6"
                onMouseEnter={() => setHoveredId(point.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Timeline marker */}
                <div
                  className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${config.color} text-white transition-transform ${
                    isHovered ? 'scale-110' : ''
                  } ${onPointClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onPointClick?.(point.id)}
                >
                  <Icon size={20} />
                </div>

                {/* Content card */}
                <div
                  className={`flex-1 p-4 rounded-lg border-2 ${config.borderColor} bg-white transition-all ${
                    isHovered ? 'shadow-lg transform -translate-y-1' : 'shadow'
                  } ${onPointClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onPointClick?.(point.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-xs text-tier-text-secondary mb-1">
                        {new Date(point.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                      <CardTitle style={{ marginBottom: '0.25rem' }}>
                        {point.title}
                      </CardTitle>
                      <div className="text-sm text-tier-text-secondary">{point.area}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${config.textColor}`}>
                        {point.performanceChange >= 0 ? '+' : ''}
                        {point.performanceChange.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-tier-border-default">
        <div className="text-center">
          <div className="text-2xl font-bold text-tier-success mb-1">
            {sortedPoints.filter((p) => p.type === 'breakthrough').length}
          </div>
          <div className="text-sm text-tier-text-secondary">Breakthroughs</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-tier-warning mb-1">
            {sortedPoints.filter((p) => p.type === 'plateau').length}
          </div>
          <div className="text-sm text-tier-text-secondary">Plateaus</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-tier-error mb-1">
            {sortedPoints.filter((p) => p.type === 'regression').length}
          </div>
          <div className="text-sm text-tier-text-secondary">Regressions</div>
        </div>
      </div>
    </div>
  );
};

export default BreakingPointTimeline;
