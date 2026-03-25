/**
 * AreaStep Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 *
 * Step 2: Select training area
 * Grouped by category: Full Swing, Kortspill, Putting
 */

import React from 'react';
import { type UseSessionPlannerResult } from '../hooks/useSessionPlanner';
import { useAKFormula, AREAS, type Area } from '../hooks/useAKFormula';
import { SubSectionTitle, CardTitle } from '../../../../../components/typography';

interface AreaStepProps {
  planner: UseSessionPlannerResult;
}

export const AreaStep: React.FC<AreaStepProps> = ({ planner }) => {
  const { formState, setArea } = planner;
  const { getValidAreas } = useAKFormula();

  const validAreas = formState.pyramid ? getValidAreas(formState.pyramid) : [];

  // Group areas by category
  const fullSwingAreas = validAreas.filter((a) => AREAS[a].category === 'fullSwing');
  const shortGameAreas = validAreas.filter((a) => AREAS[a].category === 'shortGame');
  const puttingAreas = validAreas.filter((a) => AREAS[a].category === 'putting');

  const renderAreaButton = (area: Area) => {
    const areaData = AREAS[area];
    const isSelected = formState.area === area;

    return (
      <button
        key={area}
        type="button"
        onClick={() => setArea(area)}
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
          {areaData.label}
        </span>
        <span className="text-xs mt-0.5 text-tier-text-tertiary">
          {areaData.description}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <SubSectionTitle className="text-sm font-medium text-tier-text-secondary">
        Velg treningsområde
      </SubSectionTitle>

      {/* Full Swing */}
      {fullSwingAreas.length > 0 && (
        <div>
          <CardTitle className="text-xs font-medium uppercase tracking-wide mb-2 text-tier-text-tertiary">
            Full Swing
          </CardTitle>
          <div className="grid grid-cols-2 gap-2">
            {fullSwingAreas.map(renderAreaButton)}
          </div>
        </div>
      )}

      {/* Kortspill */}
      {shortGameAreas.length > 0 && (
        <div>
          <CardTitle className="text-xs font-medium uppercase tracking-wide mb-2 text-tier-text-tertiary">
            Kortspill
          </CardTitle>
          <div className="grid grid-cols-2 gap-2">
            {shortGameAreas.map(renderAreaButton)}
          </div>
        </div>
      )}

      {/* Putting */}
      {puttingAreas.length > 0 && (
        <div>
          <CardTitle className="text-xs font-medium uppercase tracking-wide mb-2 text-tier-text-tertiary">
            Putting
          </CardTitle>
          <div className="grid grid-cols-2 gap-2">
            {puttingAreas.map(renderAreaButton)}
          </div>
        </div>
      )}

      {/* Empty state */}
      {validAreas.length === 0 && (
        <div className="text-center py-8 text-tier-text-tertiary">
          Ingen områder tilgjengelig for valgt nivå
        </div>
      )}
    </div>
  );
};

export default AreaStep;
