/**
 * TemplateSessionBlock Component
 * Draggable session card for calendar view
 */

import React from 'react';
import { GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '../../../ui/primitives/Card';
import { Badge } from '../../../components/shadcn/badge';
import { Checkbox } from '../../../components/shadcn/checkbox';
import { TemplateSession } from '../types/template.types';

interface TemplateSessionBlockProps {
  session: TemplateSession;
  isDragging?: boolean;
  onClick?: () => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
}

// Category color mapping
const CATEGORY_COLORS: Record<string, string> = {
  TEE: 'border-tier-gold bg-tier-gold/10',
  APP: 'border-tier-navy bg-tier-navy/10',
  SGR: 'border-tier-success bg-tier-success/10',
  PGR: 'border-tier-accent bg-tier-accent/10',
  GBR: 'border-tier-warning bg-tier-warning/10'
};

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  TEE: 'bg-tier-gold/20 text-tier-gold border-tier-gold',
  APP: 'bg-tier-navy/20 text-tier-navy border-tier-navy',
  SGR: 'bg-tier-success/20 text-tier-success border-tier-success',
  PGR: 'bg-tier-accent/20 text-tier-accent border-tier-accent',
  GBR: 'bg-tier-warning/20 text-tier-warning border-tier-warning'
};

export function TemplateSessionBlock({
  session,
  isDragging = false,
  onClick,
  selectionMode = false,
  isSelected = false,
  onToggleSelection
}: TemplateSessionBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({
    id: session.id,
    data: {
      type: 'session',
      session
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1
  };

  // Get primary category for border color
  const primaryCategory = session.categories[0] || 'APP';
  const borderColorClass = CATEGORY_COLORS[primaryCategory] || CATEGORY_COLORS.APP;

  return (
    <div ref={setNodeRef} style={style} className="touch-manipulation">
      <Card
        className={`
          ${borderColorClass}
          border-l-4
          p-3
          cursor-pointer
          hover:shadow-md
          transition-all
          ${isDragging || isSortableDragging ? 'shadow-lg' : ''}
          ${isSelected ? 'ring-2 ring-tier-navy shadow-md' : ''}
        `}
        onClick={selectionMode ? onToggleSelection : onClick}
      >
        <div className="space-y-2">
          {/* Header with drag handle and selection checkbox */}
          <div className="flex items-start gap-2">
            {/* Selection checkbox (when in selection mode) */}
            {selectionMode && (
              <div
                className="flex-shrink-0 mt-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelection?.();
                }}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={onToggleSelection}
                  aria-label={`Select ${session.name}`}
                />
              </div>
            )}

            {/* Drag handle (hidden in selection mode) */}
            {!selectionMode && (
              <button
                className="
                  flex-shrink-0
                  text-tier-navy/40
                  hover:text-tier-navy
                  cursor-grab
                  active:cursor-grabbing
                  focus:outline-none
                  focus:text-tier-navy
                  -ml-1
                  mt-0.5
                "
                {...attributes}
                {...listeners}
                aria-label="Drag to reschedule"
              >
                <GripVertical size={16} />
              </button>
            )}

            {/* Session name */}
            <h4 className="flex-1 text-sm font-medium text-tier-navy leading-tight">
              {session.name}
            </h4>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap gap-1 items-center">
            {/* Duration badge */}
            <Badge variant="secondary" className="text-xs">
              {session.durationMinutes} min
            </Badge>

            {/* Exercise count badge */}
            {session.exercises && session.exercises.length > 0 && (
              <Badge variant="default" className="text-xs">
                {session.exercises.length} {session.exercises.length === 1 ? 'exercise' : 'exercises'}
              </Badge>
            )}

            {/* Phase badge */}
            {session.phase && (
              <Badge variant="secondary" className="text-xs">
                {session.phase}
              </Badge>
            )}

            {/* Environment badge */}
            {session.environment && (
              <Badge variant="secondary" className="text-xs">
                {session.environment}
              </Badge>
            )}
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-1">
            {session.categories.map(category => {
              const colorClass = CATEGORY_BADGE_COLORS[category] || CATEGORY_BADGE_COLORS.APP;
              return (
                <span
                  key={category}
                  className={`
                    ${colorClass}
                    px-1.5 py-0.5
                    text-xs
                    font-medium
                    rounded
                    border
                  `}
                >
                  {category}
                </span>
              );
            })}
          </div>

          {/* Additional levels (if present) */}
          {(session.cognitiveSkillsLevel || session.pressureLevel) && (
            <div className="flex gap-1 text-xs text-tier-navy/60">
              {session.cognitiveSkillsLevel && (
                <span>{session.cognitiveSkillsLevel}</span>
              )}
              {session.pressureLevel && (
                <span>{session.pressureLevel}</span>
              )}
            </div>
          )}

          {/* Description preview (if exists) */}
          {session.description && (
            <p className="text-xs text-tier-navy/60 line-clamp-2">
              {session.description}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

export default TemplateSessionBlock;
