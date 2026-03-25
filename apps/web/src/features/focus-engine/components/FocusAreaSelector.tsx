/**
 * Focus Area Selector
 * Manual priority adjustment with drag-and-drop reordering
 */

import React, { useState } from 'react';
import { GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { SubSectionTitle } from '../../../components/typography';

interface FocusArea {
  id: string;
  name: string;
  category: string;
  currentPriority: number; // 1-10
}

interface Props {
  focusAreas: FocusArea[];
  onPrioritiesChange: (areas: FocusArea[]) => void;
  className?: string;
}

const FocusAreaSelector: React.FC<Props> = ({
  focusAreas,
  onPrioritiesChange,
  className = '',
}) => {
  const [areas, setAreas] = useState<FocusArea[]>(
    [...focusAreas].sort((a, b) => b.currentPriority - a.currentPriority)
  );

  const handleMoveUp = (index: number) => {
    if (index === 0) return;

    const newAreas = [...areas];
    [newAreas[index - 1], newAreas[index]] = [newAreas[index], newAreas[index - 1]];

    // Update priorities based on new order
    const updated = newAreas.map((area, i) => ({
      ...area,
      currentPriority: newAreas.length - i,
    }));

    setAreas(updated);
    onPrioritiesChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === areas.length - 1) return;

    const newAreas = [...areas];
    [newAreas[index], newAreas[index + 1]] = [newAreas[index + 1], newAreas[index]];

    // Update priorities based on new order
    const updated = newAreas.map((area, i) => ({
      ...area,
      currentPriority: newAreas.length - i,
    }));

    setAreas(updated);
    onPrioritiesChange(updated);
  };

  const getPriorityColor = (priority: number, maxPriority: number) => {
    const percent = (priority / maxPriority) * 100;
    if (percent >= 70) return 'text-tier-error';
    if (percent >= 40) return 'text-tier-warning';
    return 'text-tier-info';
  };

  const maxPriority = Math.max(...areas.map((a) => a.currentPriority));

  return (
    <div className={`bg-white rounded-xl border border-tier-border-default ${className}`}>
      <div className="p-6 border-b border-tier-border-default">
        <SubSectionTitle style={{ marginBottom: 8 }}>Juster prioriteringer</SubSectionTitle>
        <p className="text-sm text-tier-text-secondary">
          Flytt områder opp eller ned for å justere prioritet
        </p>
      </div>

      <div className="divide-y divide-tier-border-default">
        {areas.map((area, index) => (
          <div
            key={area.id}
            className="flex items-center gap-3 p-4 hover:bg-tier-surface-base transition-colors"
          >
            {/* Drag handle */}
            <div className="text-tier-text-secondary cursor-move">
              <GripVertical size={20} />
            </div>

            {/* Area info */}
            <div className="flex-1">
              <div className="font-semibold text-tier-navy">{area.name}</div>
              <div className="text-sm text-tier-text-secondary">{area.category}</div>
            </div>

            {/* Priority indicator */}
            <div
              className={`text-2xl font-bold ${getPriorityColor(area.currentPriority, maxPriority)}`}
            >
              {area.currentPriority}
            </div>

            {/* Move buttons */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                className={`p-1 rounded transition-colors ${
                  index === 0
                    ? 'text-tier-text-tertiary cursor-not-allowed'
                    : 'text-tier-navy hover:bg-tier-surface-secondary'
                }`}
              >
                <ChevronUp size={18} />
              </button>
              <button
                onClick={() => handleMoveDown(index)}
                disabled={index === areas.length - 1}
                className={`p-1 rounded transition-colors ${
                  index === areas.length - 1
                    ? 'text-tier-text-tertiary cursor-not-allowed'
                    : 'text-tier-navy hover:bg-tier-surface-secondary'
                }`}
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-tier-surface-base text-sm text-tier-text-secondary text-center">
        Endringer lagres automatisk
      </div>
    </div>
  );
};

export default FocusAreaSelector;
