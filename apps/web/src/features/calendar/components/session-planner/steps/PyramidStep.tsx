/**
 * PyramidStep Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 *
 * Step 1: Select pyramid level (FYS, TEK, SLAG, SPILL, TURN)
 * For FYS: Also select physical focus
 * For TURN: Also select tournament type
 */

import React from 'react';
import { type UseSessionPlannerResult } from '../hooks/useSessionPlanner';
import {
  PYRAMIDS,
  PHYSICAL_FOCUS,
  TOURNAMENT_TYPES,
  type Pyramid,
  type PhysicalFocus,
  type TournamentType,
} from '../hooks/useAKFormula';
import { SubSectionTitle } from '../../../../../components/typography';

interface PyramidStepProps {
  planner: UseSessionPlannerResult;
}

export const PyramidStep: React.FC<PyramidStepProps> = ({ planner }) => {
  const { formState, setPyramid, setPhysicalFocus, setTournamentType } = planner;

  const pyramidEntries = Object.entries(PYRAMIDS) as [Pyramid, typeof PYRAMIDS[Pyramid]][];

  return (
    <div className="space-y-6">
      {/* Pyramid selection */}
      <div>
        <SubSectionTitle className="text-sm font-medium mb-3 text-tier-text-secondary">
          Hva vil du trene?
        </SubSectionTitle>

        <div className="grid grid-cols-2 gap-3">
          {pyramidEntries.map(([key, value]) => {
            const isSelected = formState.pyramid === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setPyramid(key)}
                className={`flex flex-col items-center p-4 rounded-xl transition-all duration-200 border-2 ${
                  isSelected
                    ? 'bg-tier-navy/10 border-tier-navy'
                    : 'bg-tier-surface-base border-transparent'
                }`}
              >
                <span className="text-2xl mb-2">{value.icon}</span>
                <span
                  className={`font-medium text-sm ${
                    isSelected ? 'text-tier-navy' : 'text-tier-navy'
                  }`}
                >
                  {value.label}
                </span>
                <span className="text-xs text-center mt-1 text-tier-text-tertiary">
                  {value.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FYS: Physical focus selection */}
      {formState.pyramid === 'FYS' && (
        <div>
          <SubSectionTitle className="text-sm font-medium mb-3 text-tier-text-secondary">
            Fokusområde
          </SubSectionTitle>

          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(PHYSICAL_FOCUS) as [PhysicalFocus, typeof PHYSICAL_FOCUS[PhysicalFocus]][]).map(
              ([key, value]) => {
                const isSelected = formState.physicalFocus === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPhysicalFocus(key)}
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
              }
            )}
          </div>
        </div>
      )}

      {/* TURN: Tournament type selection */}
      {formState.pyramid === 'TURN' && (
        <div>
          <SubSectionTitle className="text-sm font-medium mb-3 text-tier-text-secondary">
            Turneringstype
          </SubSectionTitle>

          <div className="space-y-2">
            {(Object.entries(TOURNAMENT_TYPES) as [TournamentType, typeof TOURNAMENT_TYPES[TournamentType]][]).map(
              ([key, value]) => {
                const isSelected = formState.tournamentType === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTournamentType(key)}
                    className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 border-2 ${
                      isSelected
                        ? 'bg-tier-navy/10 border-tier-navy'
                        : 'bg-tier-surface-base border-transparent'
                    }`}
                  >
                    <div className="flex-1 text-left">
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
              }
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PyramidStep;
