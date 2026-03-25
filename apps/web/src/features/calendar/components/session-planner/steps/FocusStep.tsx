/**
 * FocusStep Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 *
 * Step 5: Select focus area
 * - For full swing/short game: Position range (P1.0-P10.0)
 * - For putting: Focus + Phases
 * - For SPILL: Play focus
 */

import React from 'react';
import { type UseSessionPlannerResult } from '../hooks/useSessionPlanner';
import {
  useAKFormula,
  POSITIONS,
  POSITION_ORDER,
  PUTTING_FOCUS,
  PUTTING_PHASE_COMBOS,
  PLAY_FOCUS,
  type Position,
  type PuttingFocus,
  type PlayFocus,
} from '../hooks/useAKFormula';
import { SubSectionTitle } from '../../../../../components/typography';

interface FocusStepProps {
  planner: UseSessionPlannerResult;
}

export const FocusStep: React.FC<FocusStepProps> = ({ planner }) => {
  const {
    formState,
    setPositionStart,
    setPositionEnd,
    setPuttingFocus,
    setPuttingPhases,
    setPlayFocus,
  } = planner;
  const { isPutting, areaUsesPosition } = useAKFormula();

  const showPositionSelector = formState.area && areaUsesPosition(formState.area);
  const showPuttingFocus = formState.area && isPutting(formState.area);
  const showPlayFocus = formState.pyramid === 'SPILL';

  // Position range selector
  const renderPositionSelector = () => {
    // Simplified positions (main ones only)
    const mainPositions: Position[] = [
      'P1.0', 'P2.0', 'P3.0', 'P4.0', 'P5.0', 'P6.0', 'P7.0', 'P8.0', 'P9.0', 'P10.0'
    ];

    const startIndex = formState.positionStart
      ? mainPositions.indexOf(formState.positionStart)
      : -1;
    const endIndex = formState.positionEnd
      ? mainPositions.indexOf(formState.positionEnd)
      : startIndex;

    const handlePositionClick = (pos: Position, index: number) => {
      if (!formState.positionStart) {
        // First click: set start
        setPositionStart(pos);
        setPositionEnd(pos);
      } else if (formState.positionStart === pos && formState.positionEnd === pos) {
        // Click same position: clear
        setPositionStart(null);
        setPositionEnd(null);
      } else {
        // Set range
        const currentStartIndex = mainPositions.indexOf(formState.positionStart);
        if (index < currentStartIndex) {
          setPositionStart(pos);
        } else {
          setPositionEnd(pos);
        }
      }
    };

    return (
      <div>
        <SubSectionTitle className="text-sm font-medium mb-2 text-tier-text-secondary">
          Fokusposisjon(er)
        </SubSectionTitle>
        <p className="text-xs mb-4 text-tier-text-tertiary">
          Velg en eller flere posisjoner å fokusere på
        </p>

        {/* Position slider visualization */}
        <div className="relative mb-6">
          {/* Track */}
          <div className="h-2 rounded-full bg-tier-border-default" />

          {/* Selected range highlight */}
          {startIndex >= 0 && (
            <div
              className="absolute top-0 h-2 rounded-full bg-tier-navy"
              style={{
                left: `${(startIndex / (mainPositions.length - 1)) * 100}%`,
                width: `${((endIndex - startIndex) / (mainPositions.length - 1)) * 100}%`,
              }}
            />
          )}

          {/* Position dots */}
          <div className="absolute top-0 left-0 right-0 flex justify-between -mt-1">
            {mainPositions.map((pos, index) => {
              const isInRange = startIndex >= 0 && index >= startIndex && index <= endIndex;
              const isEndpoint = pos === formState.positionStart || pos === formState.positionEnd;

              return (
                <button
                  key={pos}
                  type="button"
                  onClick={() => handlePositionClick(pos, index)}
                  className={`w-4 h-4 rounded-full transition-all duration-200 hover:scale-125 border-2 ${
                    isInRange
                      ? 'bg-tier-navy border-tier-navy'
                      : 'bg-tier-white border-tier-border-default'
                  } ${isEndpoint ? 'scale-125' : ''}`}
                />
              );
            })}
          </div>
        </div>

        {/* Position labels */}
        <div className="grid grid-cols-5 gap-1 text-center">
          {mainPositions.map((pos) => {
            const isSelected =
              pos === formState.positionStart || pos === formState.positionEnd;
            const posData = POSITIONS[pos];

            return (
              <div key={pos} className="text-xs">
                <span
                  className={`block font-medium ${
                    isSelected ? 'text-tier-navy' : 'text-tier-text-secondary'
                  }`}
                >
                  {pos.replace('P', '')}
                </span>
                <span
                  className="block truncate text-tier-text-tertiary"
                  title={posData.description}
                >
                  {posData.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected range display */}
        {formState.positionStart && (
          <div className="mt-4 p-3 rounded-lg text-center bg-tier-navy/10">
            <span className="text-sm font-medium text-tier-navy">
              {formState.positionStart === formState.positionEnd
                ? `${POSITIONS[formState.positionStart].label}`
                : `${POSITIONS[formState.positionStart].label} → ${POSITIONS[formState.positionEnd!].label}`}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Putting focus selector
  const renderPuttingFocus = () => {
    const focusEntries = Object.entries(PUTTING_FOCUS) as [PuttingFocus, typeof PUTTING_FOCUS[PuttingFocus]][];

    return (
      <div className="space-y-6">
        {/* Focus area */}
        <div>
          <SubSectionTitle className="text-sm font-medium mb-3 text-tier-text-secondary">
            Putting-fokus
          </SubSectionTitle>

          <div className="grid grid-cols-2 gap-2">
            {focusEntries.map(([key, value]) => {
              const isSelected = formState.puttingFocus === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPuttingFocus(key)}
                  className={`flex flex-col items-start p-3 rounded-lg transition-all duration-200 border-2 ${
                    isSelected
                      ? 'bg-tier-navy/10 border-tier-navy'
                      : 'bg-tier-surface-base border-transparent'
                  }`}
                >
                  <span
                    className={`font-medium text-sm ${
                      isSelected ? 'text-tier-navy' : 'text-tier-navy'
                    }`}
                  >
                    {value.label}
                  </span>
                  <span className="text-xs mt-0.5 text-tier-text-tertiary">
                    {value.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Phases */}
        <div>
          <SubSectionTitle className="text-sm font-medium mb-3 text-tier-text-secondary">
            Faser
          </SubSectionTitle>

          <div className="flex flex-wrap gap-2">
            {PUTTING_PHASE_COMBOS.map((combo) => {
              const isSelected = formState.puttingPhases === combo;
              const label = combo === 'S-F' ? 'Hele stroke' : combo;

              return (
                <button
                  key={combo}
                  type="button"
                  onClick={() => setPuttingPhases(combo)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    isSelected
                      ? 'bg-tier-navy text-white'
                      : 'bg-tier-surface-base text-tier-text-secondary'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Play focus selector
  const renderPlayFocus = () => {
    const focusEntries = Object.entries(PLAY_FOCUS) as [PlayFocus, typeof PLAY_FOCUS[PlayFocus]][];

    return (
      <div>
        <SubSectionTitle className="text-sm font-medium mb-3 text-tier-text-secondary">
          Spillfokus
        </SubSectionTitle>

        <div className="space-y-2">
          {focusEntries.map(([key, value]) => {
            const isSelected = formState.playFocus === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setPlayFocus(key)}
                className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 border-2 ${
                  isSelected
                    ? 'bg-tier-navy/10 border-tier-navy'
                    : 'bg-tier-surface-base border-transparent'
                }`}
              >
                <div className="text-left">
                  <span
                    className={`font-medium text-sm block ${
                      isSelected ? 'text-tier-navy' : 'text-tier-navy'
                    }`}
                  >
                    {value.label}
                  </span>
                  <span className="text-xs text-tier-text-tertiary">
                    {value.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {showPuttingFocus && renderPuttingFocus()}
      {showPositionSelector && !showPuttingFocus && renderPositionSelector()}
      {showPlayFocus && renderPlayFocus()}

      {/* Skip hint for optional step */}
      {showPositionSelector && !showPuttingFocus && (
        <div className="p-3 rounded-lg bg-tier-info/10">
          <span className="text-xs text-tier-info">
            Merk: Posisjonsvalg er valgfritt. Du kan gå videre uten å velge.
          </span>
        </div>
      )}
    </div>
  );
};

export default FocusStep;
