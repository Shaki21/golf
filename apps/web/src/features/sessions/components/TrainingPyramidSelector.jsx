/**
 * TrainingPyramidSelector.jsx
 * Design System v3.0 - Premium Light
 *
 * FASE 5: Visual pyramid selector for training categories
 *
 * Interactive SVG pyramid showing the 5 training levels:
 * - FYS (Fysisk) - Base
 * - TEK (Teknikk)
 * - SLAG (Golfslag)
 * - SPILL (Spill)
 * - TURN (Turnering) - Peak
 */

import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

// Pyramid categories from bottom to top
const PYRAMID_LEVELS = [
  {
    code: 'FYS',
    label: 'Fysisk',
    description: 'Styrke, power, mobilitet, stabilitet, kondisjon',
    color: '#F59E0B', // amber-500
    level: 0,
  },
  {
    code: 'TEK',
    label: 'Teknikk',
    description: 'Bevegelsesmønster, posisjoner, sekvens',
    color: '#8B5CF6', // violet-500
    level: 1,
  },
  {
    code: 'SLAG',
    label: 'Golfslag',
    description: 'Slagkvalitet, avstand, nøyaktighet, konsistens',
    color: '#14B8A6', // teal-500
    level: 2,
  },
  {
    code: 'SPILL',
    label: 'Spill',
    description: 'Strategi, banehåndtering, scoring, beslutninger',
    color: '#10B981', // emerald-500
    level: 3,
  },
  {
    code: 'TURN',
    label: 'Turnering',
    description: 'Mental prestasjon, konkurransefokus',
    color: '#D4AF37', // gold
    level: 4,
  },
];

export const TrainingPyramidSelector = ({ selected, onChange, onBack }) => {
  const [hovered, setHovered] = useState(null);

  // SVG dimensions
  const width = 400;
  const height = 350;
  const baseWidth = 340;
  const topWidth = 80;
  const levelHeight = 60;
  const startY = 40;

  // Calculate trapezoid points for each level
  const getLevelPath = (levelIndex) => {
    const totalLevels = PYRAMID_LEVELS.length;
    const widthStep = (baseWidth - topWidth) / totalLevels;

    const topLevelWidth = topWidth + widthStep * (totalLevels - levelIndex);
    const bottomLevelWidth = topWidth + widthStep * (totalLevels - levelIndex - 1);

    const y1 = startY + levelIndex * levelHeight;
    const y2 = y1 + levelHeight;

    const x1Left = (width - topLevelWidth) / 2;
    const x1Right = x1Left + topLevelWidth;
    const x2Left = (width - bottomLevelWidth) / 2;
    const x2Right = x2Left + bottomLevelWidth;

    return `M ${x1Left} ${y1} L ${x1Right} ${y1} L ${x2Right} ${y2} L ${x2Left} ${y2} Z`;
  };

  // Get center point for text
  const getLevelCenter = (levelIndex) => {
    const totalLevels = PYRAMID_LEVELS.length;
    const widthStep = (baseWidth - topWidth) / totalLevels;
    const levelWidth = topWidth + widthStep * (totalLevels - levelIndex - 0.5);

    return {
      x: width / 2,
      y: startY + levelIndex * levelHeight + levelHeight / 2,
    };
  };

  const handleLevelClick = (level) => {
    onChange(level.code);
  };

  return (
    <div className="space-y-4">
      {/* Back button */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-tier-text-secondary hover:text-tier-navy transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Tilbake</span>
        </button>
      )}

      {/* Instruction text */}
      <div className="text-sm text-tier-text-secondary p-4 bg-tier-surface-base rounded-lg">
        <strong className="text-tier-navy">Velg nivå i treningspyramiden:</strong>
        <br />
        Klikk på et nivå for å velge treningsfokus. Pyramiden bygger fra fundamentet (Fysisk)
        til toppen (Turnering).
      </div>

      {/* SVG Pyramid */}
      <div className="flex justify-center">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="max-w-full"
        >
          {/* Pyramid levels from bottom to top */}
          {PYRAMID_LEVELS.map((level, index) => {
            const isSelected = selected === level.code;
            const isHovered = hovered === level.code;
            const center = getLevelCenter(index);

            return (
              <g
                key={level.code}
                onMouseEnter={() => setHovered(level.code)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleLevelClick(level)}
                style={{ cursor: 'pointer' }}
              >
                {/* Level shape */}
                <path
                  d={getLevelPath(index)}
                  fill={level.color}
                  fillOpacity={isSelected ? 0.9 : isHovered ? 0.7 : 0.5}
                  stroke={isSelected ? level.color : 'transparent'}
                  strokeWidth={isSelected ? 3 : 0}
                  className="transition-all duration-200"
                />

                {/* Level code */}
                <text
                  x={center.x}
                  y={center.y - 8}
                  textAnchor="middle"
                  className="font-mono font-bold text-sm fill-tier-white select-none"
                  style={{ fontSize: '14px' }}
                >
                  {level.code}
                </text>

                {/* Level label */}
                <text
                  x={center.x}
                  y={center.y + 8}
                  textAnchor="middle"
                  className="font-medium text-xs fill-tier-white select-none"
                  style={{ fontSize: '12px' }}
                >
                  {level.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Description of selected/hovered level */}
      {(selected || hovered) && (
        <div className="p-4 bg-tier-surface-base rounded-lg border-2 transition-all"
          style={{
            borderColor: PYRAMID_LEVELS.find(l => l.code === (selected || hovered))?.color || 'transparent',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className="font-mono font-bold text-sm"
              style={{ color: PYRAMID_LEVELS.find(l => l.code === (selected || hovered))?.color }}
            >
              {selected || hovered}
            </span>
            <span className="text-sm font-semibold text-tier-navy">
              {PYRAMID_LEVELS.find(l => l.code === (selected || hovered))?.label}
            </span>
          </div>
          <p className="text-xs text-tier-text-secondary">
            {PYRAMID_LEVELS.find(l => l.code === (selected || hovered))?.description}
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="text-xs text-tier-text-tertiary text-center">
        Valgt nivå markeres med ramme og fyldigere farge
      </div>
    </div>
  );
};

export default TrainingPyramidSelector;
