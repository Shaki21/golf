/**
 * ContextStep Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles
 *
 * Step 4: Select context (Environment, CS level, Pressure)
 * CS slider only shown for full swing areas.
 */

import React from 'react';
import { type UseSessionPlannerResult } from '../hooks/useSessionPlanner';
import {
  useAKFormula,
  ENVIRONMENTS,
  PRESSURE_LEVELS,
  CS_LEVELS,
  type Environment,
  type Pressure,
  type CSLevel,
} from '../hooks/useAKFormula';
import { SubSectionTitle } from '../../../../../components/typography';

interface ContextStepProps {
  planner: UseSessionPlannerResult;
}

export const ContextStep: React.FC<ContextStepProps> = ({ planner }) => {
  const { formState, setEnvironment, setPressure, setCSLevel } = planner;
  const { areaUsesCS, getRecommendedCS } = useAKFormula();

  const showCSSlider = formState.area && areaUsesCS(formState.area);
  const recommendedCS = formState.lPhase ? getRecommendedCS(formState.lPhase) : null;

  // Filter environments based on pyramid
  const environments = Object.entries(ENVIRONMENTS) as [Environment, typeof ENVIRONMENTS[Environment]][];
  const pressureLevels = Object.entries(PRESSURE_LEVELS) as [Pressure, typeof PRESSURE_LEVELS[Pressure]][];

  return (
    <div className="space-y-6">
      {/* Environment */}
      <div>
        <SubSectionTitle className="text-sm font-medium mb-3 text-tier-text-secondary">
          Treningsmiljø
        </SubSectionTitle>

        <div className="grid grid-cols-2 gap-2">
          {environments.map(([key, value]) => {
            const isSelected = formState.environment === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setEnvironment(key)}
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

      {/* CS Slider (only for full swing) */}
      {showCSSlider && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <SubSectionTitle className="text-sm font-medium text-tier-text-secondary">
              Klubbhastighet
            </SubSectionTitle>
            <span className="text-lg font-bold text-tier-navy">
              {formState.csLevel}%
            </span>
          </div>

          {/* Slider - keeps inline style for dynamic gradient */}
          <div className="relative">
            <input
              type="range"
              min={0}
              max={100}
              step={10}
              value={formState.csLevel}
              onChange={(e) => setCSLevel(Number(e.target.value) as CSLevel)}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--tier-navy) 0%, var(--tier-navy) ${formState.csLevel}%, rgb(var(--border-color)) ${formState.csLevel}%, rgb(var(--border-color)) 100%)`,
              }}
            />

            {/* CS level markers */}
            <div className="flex justify-between mt-1 px-1">
              {CS_LEVELS.filter((l) => l % 20 === 0).map((level) => (
                <span key={level} className="text-xs text-tier-text-tertiary">
                  {level}
                </span>
              ))}
            </div>
          </div>

          {/* Recommended range hint */}
          {recommendedCS && (
            <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-tier-info/10">
              <span className="text-xs text-tier-info">
                Anbefalt for {formState.lPhase}: CS{recommendedCS.min}-{recommendedCS.max}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Pressure */}
      <div>
        <SubSectionTitle className="text-sm font-medium mb-3 text-tier-text-secondary">
          Pressnivå
        </SubSectionTitle>

        <div className="space-y-2">
          {pressureLevels.map(([key, value]) => {
            const isSelected = formState.pressure === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setPressure(key)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 border-2 ${
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
                <span className="text-xs font-medium px-2 py-1 rounded bg-tier-white text-tier-text-tertiary">
                  {key}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContextStep;
