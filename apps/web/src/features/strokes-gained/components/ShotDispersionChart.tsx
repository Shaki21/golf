/**
 * Shot Dispersion Chart - TIER Golf
 *
 * Visual heatmap showing shot landing patterns for different categories.
 * Uses SVG for rendering the dispersion pattern.
 */

import React, { useMemo } from 'react';
import { Card } from '../../../ui/primitives/Card';
import { Badge } from '../../../components/shadcn/badge';
import { Target, MapPin, Info } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface ShotPoint {
  x: number; // -100 to 100 (left to right of target)
  y: number; // 0 to 100 (short to long)
  category: 'TEE' | 'APPROACH' | 'SHORT_GAME';
  result: 'excellent' | 'good' | 'average' | 'poor';
}

interface ShotDispersionChartProps {
  title: string;
  shots: ShotPoint[];
  targetX?: number;
  targetY?: number;
  showGrid?: boolean;
  width?: number;
  height?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const RESULT_COLORS = {
  excellent: '#10B981',
  good: '#C9A227',
  average: '#F59E0B',
  poor: '#EF4444',
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function ShotDispersionChart({
  title,
  shots,
  targetX = 50,
  targetY = 80,
  showGrid = true,
  width = 300,
  height = 400,
}: ShotDispersionChartProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    if (shots.length === 0) return null;

    const avgX = shots.reduce((sum, s) => sum + s.x, 0) / shots.length;
    const avgY = shots.reduce((sum, s) => sum + s.y, 0) / shots.length;

    // Calculate dispersion (standard deviation)
    const stdX = Math.sqrt(
      shots.reduce((sum, s) => sum + Math.pow(s.x - avgX, 2), 0) / shots.length
    );
    const stdY = Math.sqrt(
      shots.reduce((sum, s) => sum + Math.pow(s.y - avgY, 2), 0) / shots.length
    );

    // Calculate miss tendency
    const leftMisses = shots.filter((s) => s.x < targetX - 10).length;
    const rightMisses = shots.filter((s) => s.x > targetX + 10).length;
    const shortMisses = shots.filter((s) => s.y < targetY - 10).length;
    const longMisses = shots.filter((s) => s.y > targetY + 10).length;

    const tendency =
      leftMisses > rightMisses * 1.5
        ? 'left'
        : rightMisses > leftMisses * 1.5
        ? 'right'
        : shortMisses > longMisses * 1.5
        ? 'short'
        : longMisses > shortMisses * 1.5
        ? 'long'
        : 'centered';

    return {
      avgX,
      avgY,
      dispersion: (stdX + stdY) / 2,
      tendency,
      leftMisses,
      rightMisses,
      shortMisses,
      longMisses,
    };
  }, [shots, targetX, targetY]);

  // Transform coordinates to SVG space
  const toSvgX = (x: number) => ((x + 100) / 200) * width;
  const toSvgY = (y: number) => height - (y / 100) * height;

  return (
    <Card>
      <div className="p-4 border-b border-tier-navy/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-tier-gold" />
            <h3 className="text-base font-semibold text-tier-navy">{title}</h3>
          </div>
          <Badge variant="secondary">{shots.length} shots</Badge>
        </div>
      </div>

      <div className="p-4">
        {/* SVG Chart */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          style={{ maxHeight: height }}
        >
          {/* Background */}
          <rect x="0" y="0" width={width} height={height} fill="#f5f5f0" />

          {/* Grid lines */}
          {showGrid && (
            <g stroke="#e5e7eb" strokeWidth="1">
              {/* Vertical lines */}
              {[0, 25, 50, 75, 100].map((pct) => (
                <line
                  key={`v-${pct}`}
                  x1={(pct / 100) * width}
                  y1="0"
                  x2={(pct / 100) * width}
                  y2={height}
                  strokeDasharray={pct === 50 ? '0' : '4,4'}
                />
              ))}
              {/* Horizontal lines */}
              {[0, 25, 50, 75, 100].map((pct) => (
                <line
                  key={`h-${pct}`}
                  x1="0"
                  y1={height - (pct / 100) * height}
                  x2={width}
                  y2={height - (pct / 100) * height}
                  strokeDasharray={pct === 80 ? '0' : '4,4'}
                />
              ))}
            </g>
          )}

          {/* Target zone (green/fairway) */}
          <ellipse
            cx={toSvgX(0)}
            cy={toSvgY(targetY)}
            rx={width * 0.15}
            ry={height * 0.1}
            fill="#10B981"
            fillOpacity="0.2"
            stroke="#10B981"
            strokeWidth="2"
          />

          {/* Target point */}
          <circle
            cx={toSvgX(0)}
            cy={toSvgY(targetY)}
            r="6"
            fill="#10B981"
          />

          {/* Shot points */}
          {shots.map((shot, idx) => (
            <circle
              key={idx}
              cx={toSvgX(shot.x)}
              cy={toSvgY(shot.y)}
              r="5"
              fill={RESULT_COLORS[shot.result]}
              fillOpacity="0.7"
              stroke={RESULT_COLORS[shot.result]}
              strokeWidth="1"
            />
          ))}

          {/* Average point */}
          {stats && (
            <g>
              <circle
                cx={toSvgX(stats.avgX)}
                cy={toSvgY(stats.avgY)}
                r="8"
                fill="none"
                stroke="#0A2540"
                strokeWidth="2"
              />
              <line
                x1={toSvgX(stats.avgX) - 6}
                y1={toSvgY(stats.avgY)}
                x2={toSvgX(stats.avgX) + 6}
                y2={toSvgY(stats.avgY)}
                stroke="#0A2540"
                strokeWidth="2"
              />
              <line
                x1={toSvgX(stats.avgX)}
                y1={toSvgY(stats.avgY) - 6}
                x2={toSvgX(stats.avgX)}
                y2={toSvgY(stats.avgY) + 6}
                stroke="#0A2540"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Labels */}
          <text x="10" y="20" fontSize="12" fill="#6B7280">
            Long
          </text>
          <text x="10" y={height - 10} fontSize="12" fill="#6B7280">
            Short
          </text>
          <text x="10" y={height / 2} fontSize="12" fill="#6B7280">
            Left
          </text>
          <text x={width - 35} y={height / 2} fontSize="12" fill="#6B7280">
            Right
          </text>
        </svg>

        {/* Stats */}
        {stats && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-tier-navy/5 rounded-lg">
              <span className="text-lg font-bold text-tier-navy">
                {stats.dispersion.toFixed(1)}
              </span>
              <span className="block text-xs text-tier-navy/60">Dispersion</span>
            </div>
            <div className="text-center p-2 bg-tier-navy/5 rounded-lg">
              <span className="text-lg font-bold text-tier-navy capitalize">
                {stats.tendency}
              </span>
              <span className="block text-xs text-tier-navy/60">Tendency</span>
            </div>
            <div className="text-center p-2 bg-tier-navy/5 rounded-lg">
              <span className="text-lg font-bold text-tier-navy">
                {((shots.filter((s) => s.result === 'excellent' || s.result === 'good').length / shots.length) * 100).toFixed(0)}%
              </span>
              <span className="block text-xs text-tier-navy/60">On Target</span>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-3 flex justify-center gap-4">
          {Object.entries(RESULT_COLORS).map(([result, color]) => (
            <div key={result} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-tier-navy/60 capitalize">{result}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
