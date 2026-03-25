/**
 * DagbokDrillDown
 *
 * Interactive drill-down visualization for AK Formula hierarchy.
 * User can click through: Pyramid -> Phase -> Area with hours/reps at each level.
 *
 * Example flow: TEK -> Fase 4 (L-BALL) -> Innspill 100m
 *
 * Migrated to Tailwind CSS
 */

import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Clock, Flame, TrendingUp } from 'lucide-react';
import type { Pyramid } from '../types';
import { PYRAMIDS, AREAS, L_PHASES, PYRAMID_COLORS } from '../constants';
import { PYRAMID_ICONS } from '../../../../constants/icons';

interface DrillDownData {
  pyramid: Pyramid;
  hours: number;
  reps: number;
  sessions: number;
  phases?: {
    phase: string;
    label: string;
    hours: number;
    reps: number;
    areas?: {
      area: string;
      label: string;
      hours: number;
      reps: number;
    }[];
  }[];
}

interface DagbokDrillDownProps {
  data: DrillDownData[];
  className?: string;
}

type DrillLevel = 'pyramid' | 'phase' | 'area';

export const DagbokDrillDown: React.FC<DagbokDrillDownProps> = ({
  data,
  className = '',
}) => {
  const [selectedPyramid, setSelectedPyramid] = useState<Pyramid | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  const currentLevel: DrillLevel = selectedPhase
    ? 'area'
    : selectedPyramid
    ? 'phase'
    : 'pyramid';

  const currentData = useMemo(() => {
    if (currentLevel === 'pyramid') {
      return data;
    }

    if (currentLevel === 'phase') {
      const pyramidData = data.find((d) => d.pyramid === selectedPyramid);
      return pyramidData?.phases || [];
    }

    if (currentLevel === 'area') {
      const pyramidData = data.find((d) => d.pyramid === selectedPyramid);
      const phaseData = pyramidData?.phases?.find((p) => p.phase === selectedPhase);
      return phaseData?.areas || [];
    }

    return [];
  }, [currentLevel, selectedPyramid, selectedPhase, data]);

  const handlePyramidClick = (pyramid: Pyramid) => {
    setSelectedPyramid(pyramid);
    setSelectedPhase(null);
  };

  const handlePhaseClick = (phase: string) => {
    setSelectedPhase(phase);
  };

  const handleBack = () => {
    if (currentLevel === 'area') {
      setSelectedPhase(null);
    } else if (currentLevel === 'phase') {
      setSelectedPyramid(null);
    }
  };

  const handleBreadcrumbClick = (level: DrillLevel) => {
    if (level === 'pyramid') {
      setSelectedPyramid(null);
      setSelectedPhase(null);
    } else if (level === 'phase') {
      setSelectedPhase(null);
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-tier-border-default overflow-hidden ${className}`}>
      {/* Header with breadcrumb */}
      <div className="px-4 py-3 border-b border-tier-border-default bg-tier-surface-subtle flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[13px] text-tier-text-secondary">
          <span
            className={`flex items-center gap-1 ${currentLevel === 'pyramid' ? 'text-tier-gold font-semibold cursor-default' : 'cursor-pointer font-medium'}`}
            onClick={() => handleBreadcrumbClick('pyramid')}
          >
            Pyramid
          </span>
          {selectedPyramid && (
            <>
              <ChevronRight size={14} />
              <span
                className={`flex items-center gap-1 ${currentLevel === 'phase' ? 'text-tier-gold font-semibold cursor-default' : 'cursor-pointer font-medium'}`}
                onClick={() => handleBreadcrumbClick('phase')}
              >
                {PYRAMIDS[selectedPyramid].label}
              </span>
            </>
          )}
          {selectedPhase && (
            <>
              <ChevronRight size={14} />
              <span className="flex items-center gap-1 text-tier-gold font-semibold cursor-default">
                {L_PHASES[selectedPhase as keyof typeof L_PHASES]?.label || selectedPhase}
              </span>
            </>
          )}
        </div>

        {currentLevel !== 'pyramid' && (
          <button
            className="px-3 py-1.5 text-xs font-medium text-tier-gold bg-transparent border-none cursor-pointer flex items-center gap-1 rounded hover:bg-tier-surface-subtle transition-colors duration-150"
            onClick={handleBack}
          >
            <ChevronLeft size={14} />
            Back
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {currentLevel === 'pyramid' && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
            {data.map((item) => {
              const Icon = PYRAMID_ICONS[item.pyramid];
              return (
                <div
                  key={item.pyramid}
                  className="p-3.5 rounded cursor-pointer transition-all duration-150 hover:shadow-md"
                  style={{
                    border: `2px solid ${PYRAMID_COLORS[item.pyramid].border}`,
                    backgroundColor: PYRAMID_COLORS[item.pyramid].bg,
                  }}
                  onClick={() => handlePyramidClick(item.pyramid)}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div
                      className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0 text-white"
                      style={{ backgroundColor: PYRAMID_COLORS[item.pyramid].text }}
                    >
                      <Icon size={20} />
                    </div>
                    <div
                      className="text-[15px] font-semibold flex-1"
                      style={{ color: PYRAMID_COLORS[item.pyramid].text }}
                    >
                      {PYRAMIDS[item.pyramid].label}
                    </div>
                    <ChevronRight size={18} style={{ color: PYRAMID_COLORS[item.pyramid].text }} />
                  </div>

                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-1 text-xs text-tier-text-secondary">
                      <Clock size={14} />
                      <span className="font-bold text-tier-navy tabular-nums">{item.hours}t</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-tier-text-secondary">
                      <Flame size={14} />
                      <span className="font-bold text-tier-navy tabular-nums">{item.reps}</span> reps
                    </div>
                    <div className="flex items-center gap-1 text-xs text-tier-text-secondary">
                      <TrendingUp size={14} />
                      <span className="font-bold text-tier-navy tabular-nums">{item.sessions}</span> sessions
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {currentLevel === 'phase' && selectedPyramid && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
            {(currentData as any[]).map((item) => (
              <div
                key={item.phase}
                className="p-3.5 rounded cursor-pointer transition-all duration-150 hover:shadow-md"
                style={{
                  border: `2px solid ${PYRAMID_COLORS[selectedPyramid].border}`,
                  backgroundColor: PYRAMID_COLORS[selectedPyramid].bg,
                }}
                onClick={() => handlePhaseClick(item.phase)}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="text-[15px] font-semibold flex-1"
                    style={{ color: PYRAMID_COLORS[selectedPyramid].text }}
                  >
                    {item.label}
                  </div>
                  <ChevronRight size={18} style={{ color: PYRAMID_COLORS[selectedPyramid].text }} />
                </div>

                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-1 text-xs text-tier-text-secondary">
                    <Clock size={14} />
                    <span className="font-bold text-tier-navy tabular-nums">{item.hours}t</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-tier-text-secondary">
                    <Flame size={14} />
                    <span className="font-bold text-tier-navy tabular-nums">{item.reps}</span> reps
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentLevel === 'area' && selectedPyramid && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
            {(currentData as any[]).map((item) => (
              <div
                key={item.area}
                className="p-3.5 rounded cursor-default transition-all duration-150"
                style={{
                  border: `2px solid ${PYRAMID_COLORS[selectedPyramid].border}`,
                  backgroundColor: PYRAMID_COLORS[selectedPyramid].bg,
                }}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="text-[15px] font-semibold flex-1"
                    style={{ color: PYRAMID_COLORS[selectedPyramid].text }}
                  >
                    {item.label}
                  </div>
                </div>

                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-1 text-xs text-tier-text-secondary">
                    <Clock size={14} />
                    <span className="font-bold text-tier-navy tabular-nums">{item.hours}t</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-tier-text-secondary">
                    <Flame size={14} />
                    <span className="font-bold text-tier-navy tabular-nums">{item.reps}</span> reps
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentData.length === 0 && (
          <div className="py-10 px-5 text-center text-tier-text-tertiary text-sm">
            No data available for this view
          </div>
        )}
      </div>
    </div>
  );
};

export default DagbokDrillDown;
