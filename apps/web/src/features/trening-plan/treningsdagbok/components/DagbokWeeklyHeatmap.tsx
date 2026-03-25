/**
 * DagbokWeeklyHeatmap
 *
 * 7x5 heatmap grid showing training intensity.
 * Rows: Monday-Sunday, Columns: FYS/TEK/SLAG/SPILL/TURN
 *
 * Migrated to Tailwind CSS
 */

import React, { useState, useCallback } from 'react';

import type { WeeklyHeatmapData, HeatmapCell, DagbokWeeklyHeatmapProps, Pyramid } from '../types';
import {
  DAY_NAMES,
  HEATMAP_PYRAMID_ORDER,
  PYRAMIDS,
  HEATMAP_INTENSITY_COLORS_FALLBACK,
} from '../constants';

// =============================================================================
// CELL COMPONENT
// =============================================================================

interface HeatmapCellComponentProps {
  cell: HeatmapCell;
  dayName: string;
  pyramidLabel: string;
  onClick?: () => void;
}

const HeatmapCellComponent: React.FC<HeatmapCellComponentProps> = ({
  cell,
  dayName,
  pyramidLabel,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    setShowTooltip(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setShowTooltip(false);
  }, []);

  return (
    <div className="relative">
      <div
        className={`w-full aspect-square rounded-sm cursor-pointer transition-all duration-150 flex items-center justify-center text-[10px] font-medium ${
          isHovered ? 'border border-tier-gold text-tier-navy' : 'border border-transparent text-transparent'
        }`}
        style={{ backgroundColor: HEATMAP_INTENSITY_COLORS_FALLBACK[cell.intensity] }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        role="gridcell"
        aria-label={`${dayName} ${pyramidLabel}: ${cell.minutes} minutter`}
      >
        {cell.minutes > 0 && isHovered && cell.minutes}
      </div>

      {showTooltip && cell.minutes > 0 && (
        <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-tier-navy text-white py-2 px-3 rounded text-xs whitespace-nowrap z-50 shadow-lg">
          <div className="mb-1 font-semibold">
            {dayName} | {pyramidLabel}
          </div>
          <div className="flex justify-between gap-4">
            <span className="opacity-70">Tid:</span>
            <span className="font-semibold tabular-nums">{cell.minutes} min</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="opacity-70">Okter:</span>
            <span className="font-semibold tabular-nums">{cell.sessions}</span>
          </div>
          {cell.complianceRate > 0 && (
            <div className="flex justify-between gap-4">
              <span className="opacity-70">Compliance:</span>
              <span className="font-semibold tabular-nums">{cell.complianceRate}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// COMPONENT
// =============================================================================

export const DagbokWeeklyHeatmap: React.FC<DagbokWeeklyHeatmapProps> = ({
  data,
  isLoading = false,
  onCellClick,
  className = '',
}) => {
  // Create grid template styles
  const gridStyle = {
    gridTemplateColumns: `40px repeat(${HEATMAP_PYRAMID_ORDER.length}, 1fr)`,
    gridTemplateRows: `auto repeat(7, 1fr)`,
  };

  if (isLoading) {
    return (
      <div className={`p-4 bg-white rounded-lg border border-tier-border-default ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-tier-navy">Ukeoversikt</span>
        </div>
        <div className="grid gap-0.5" style={gridStyle}>
          {/* Header row skeleton */}
          <div className="w-10" />
          {HEATMAP_PYRAMID_ORDER.map((p) => (
            <div key={p} className="w-full aspect-square rounded-sm bg-tier-surface-subtle animate-pulse" />
          ))}
          {/* Data rows skeleton */}
          {Array.from({ length: 7 }).map((_, day) => (
            <React.Fragment key={day}>
              <div className="flex items-center justify-end pr-2 text-[11px] font-medium text-tier-text-secondary">
                {DAY_NAMES[day]}
              </div>
              {HEATMAP_PYRAMID_ORDER.map((p) => (
                <div key={`${day}-${p}`} className="w-full aspect-square rounded-sm bg-tier-surface-subtle animate-pulse" />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  // Find cells by day and pyramid
  const getCellData = (day: number, pyramid: Pyramid): HeatmapCell => {
    return (
      data.cells.find((c) => c.day === day && c.pyramid === pyramid) || {
        day,
        pyramid,
        minutes: 0,
        sessions: 0,
        intensity: 0,
        plannedMinutes: 0,
        complianceRate: 0,
      }
    );
  };

  return (
    <div className={`p-4 bg-white rounded-lg border border-tier-border-default ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-tier-navy">Ukeoversikt</span>
        <span className="text-xs text-tier-text-secondary">
          Uke {data.weekNumber}, {data.year}
        </span>
      </div>

      <div className="grid gap-0.5" style={gridStyle}>
        {/* Header row with pyramid labels */}
        <div className="w-10" />
        {HEATMAP_PYRAMID_ORDER.map((pyramid) => (
          <div key={pyramid} className="flex flex-col items-center justify-center p-1 text-[11px] font-semibold text-tier-text-secondary">
            <span className="text-sm mb-0.5">{PYRAMIDS[pyramid].icon}</span>
            <span>{pyramid}</span>
          </div>
        ))}

        {/* Data rows */}
        {Array.from({ length: 7 }).map((_, day) => (
          <React.Fragment key={day}>
            <div className="flex items-center justify-end pr-2 text-[11px] font-medium text-tier-text-secondary">
              {DAY_NAMES[day]}
            </div>
            {HEATMAP_PYRAMID_ORDER.map((pyramid) => {
              const cell = getCellData(day, pyramid);
              return (
                <HeatmapCellComponent
                  key={`${day}-${pyramid}`}
                  cell={cell}
                  dayName={DAY_NAMES[day]}
                  pyramidLabel={PYRAMIDS[pyramid].label}
                  onClick={() => onCellClick?.(cell)}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-3">
        <span className="text-[10px] text-tier-text-tertiary">Mindre</span>
        <div className="flex gap-0.5">
          {[0, 1, 2, 3, 4].map((intensity) => (
            <div
              key={intensity}
              className="w-3 h-3 rounded-sm border border-tier-border-subtle"
              style={{ backgroundColor: HEATMAP_INTENSITY_COLORS_FALLBACK[intensity as 0 | 1 | 2 | 3 | 4] }}
            />
          ))}
        </div>
        <span className="text-[10px] text-tier-text-tertiary">Mer</span>
      </div>

      {/* Summary */}
      <div className="flex justify-around mt-3 pt-3 border-t border-tier-border-subtle">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-base font-bold text-tier-navy tabular-nums">{data.totalSessions}</span>
          <span className="text-[10px] text-tier-text-tertiary uppercase">Okter</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-base font-bold text-tier-navy tabular-nums">{data.totalMinutes}</span>
          <span className="text-[10px] text-tier-text-tertiary uppercase">Minutter</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-base font-bold text-tier-navy tabular-nums">{data.avgMinutesPerDay}</span>
          <span className="text-[10px] text-tier-text-tertiary uppercase">Snitt/dag</span>
        </div>
      </div>
    </div>
  );
};

export default DagbokWeeklyHeatmap;
