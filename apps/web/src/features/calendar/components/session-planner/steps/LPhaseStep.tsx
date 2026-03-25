/**
 * LPhaseStep Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 *
 * Step 3: Select learning phase (L-BODY, L-ARM, L-CLUB, L-BALL, L-AUTO)
 * Shows recommended CS range for each phase.
 */

import React from 'react';
import { type UseSessionPlannerResult } from '../hooks/useSessionPlanner';
import { L_PHASES, type LPhase } from '../hooks/useAKFormula';
import { SubSectionTitle } from '../../../../../components/typography';

interface LPhaseStepProps {
  planner: UseSessionPlannerResult;
}

const PHASE_ICONS: Record<LPhase, string> = {
  'L-BODY': '',
  'L-ARM': '',
  'L-CLUB': '',
  'L-BALL': '',
  'L-AUTO': '',
};

export const LPhaseStep: React.FC<LPhaseStepProps> = ({ planner }) => {
  const { formState, setLPhase } = planner;

  const phases = Object.entries(L_PHASES) as [LPhase, typeof L_PHASES[LPhase]][];

  return (
    <div className="space-y-4">
      <div>
        <SubSectionTitle className="text-sm font-medium mb-1 text-tier-text-secondary">
          Learning Phase
        </SubSectionTitle>
        <p className="text-xs text-tier-text-tertiary">
          Select your current stage in the learning process
        </p>
      </div>

      <div className="space-y-2">
        {phases.map(([key, value]) => {
          const isSelected = formState.lPhase === key;
          const csRange = value.recommendedCS;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setLPhase(key)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 border-2 ${
                isSelected
                  ? 'bg-tier-navy/10 border-tier-navy'
                  : 'bg-tier-surface-base border-transparent'
              }`}
            >
              {/* Icon */}
              <span className="text-2xl">{PHASE_ICONS[key]}</span>

              {/* Content */}
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

              {/* CS range badge */}
              {csRange && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-tier-white text-tier-text-secondary">
                  CS{csRange.min}-{csRange.max}
                </span>
              )}
              {!csRange && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-tier-white text-tier-text-tertiary">
                  CS0
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Progression hint */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-tier-info/10">
        <span className="text-sm text-tier-info">Tip:</span>
        <span className="text-xs text-tier-info">
          Start with L-BODY for new movements, and work your way up to L-AUTO
        </span>
      </div>
    </div>
  );
};

export default LPhaseStep;
