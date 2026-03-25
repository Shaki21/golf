/**
 * TemplatePlanPreview Component
 * Shows detailed preview of a training plan template
 */

import React from 'react';
import { Calendar, Clock, MapPin, TrendingUp, User, X } from 'lucide-react';
import { Card } from '../../../ui/primitives/Card';
import { Badge } from '../../../components/shadcn/badge';
import { Button } from '../../../ui/primitives/Button';
import Modal from '../../../ui/composites/Modal.composite';
import {
  TrainingPlanTemplate,
  TemplateSession,
  TemplateCategory,
  TemplateLevel
} from '../types/template.types';

interface TemplatePlanPreviewProps {
  template: TrainingPlanTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onApply?: (template: TrainingPlanTemplate) => void;
}

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  technique: 'Technique',
  fitness: 'Fitness',
  mental: 'Mental',
  'competition-prep': 'Competition Prep',
  recovery: 'Recovery',
  custom: 'Custom'
};

const LEVEL_LABELS: Record<TemplateLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  all: 'All Levels'
};

const WEEKDAY_LABELS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export function TemplatePlanPreview({
  template,
  isOpen,
  onClose,
  onApply
}: TemplatePlanPreviewProps) {
  if (!template) return null;

  // Group sessions by week
  const sessionsByWeek = template.sessions.reduce((acc, session) => {
    if (!acc[session.weekNumber]) {
      acc[session.weekNumber] = [];
    }
    acc[session.weekNumber].push(session);
    return acc;
  }, {} as Record<number, TemplateSession[]>);

  const weekNumbers = Object.keys(sessionsByWeek)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={template.name}
      size="xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {onApply && (
            <Button variant="primary" onClick={() => onApply(template)}>
              Apply Template
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Template header */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <p className="text-tier-navy/80 mb-3">{template.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">
                  {CATEGORY_LABELS[template.category]}
                </Badge>
                <Badge variant="secondary">
                  {LEVEL_LABELS[template.targetLevel]}
                </Badge>
                {template.tags.map(tag => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-tier-navy/5 rounded-lg">
            <div className="text-center">
              <Calendar className="mx-auto text-tier-gold mb-1" size={20} />
              <div className="text-2xl font-bold text-tier-navy">
                {template.durationWeeks}
              </div>
              <div className="text-xs text-tier-navy/60">
                {template.durationWeeks === 1 ? 'Week' : 'Weeks'}
              </div>
            </div>
            <div className="text-center">
              <Clock className="mx-auto text-tier-gold mb-1" size={20} />
              <div className="text-2xl font-bold text-tier-navy">
                {template.sessions.length}
              </div>
              <div className="text-xs text-tier-navy/60">
                {template.sessions.length === 1 ? 'Session' : 'Sessions'}
              </div>
            </div>
            <div className="text-center">
              <TrendingUp className="mx-auto text-tier-gold mb-1" size={20} />
              <div className="text-2xl font-bold text-tier-navy">
                {template.sessions.reduce((sum, s) => sum + s.durationMinutes, 0)}
              </div>
              <div className="text-xs text-tier-navy/60">Total Minutes</div>
            </div>
          </div>
        </div>

        {/* Sessions by week */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-tier-navy">
            Training Sessions
          </h3>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {weekNumbers.map(weekNum => (
              <div key={weekNum}>
                <h4 className="text-sm font-semibold text-tier-navy mb-2 sticky top-0 bg-white py-1">
                  Week {weekNum}
                </h4>
                <div className="space-y-2">
                  {sessionsByWeek[weekNum]
                    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                    .map(session => (
                      <SessionCard key={session.id} session={session} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Template metadata */}
        {template.usageCount !== undefined && template.usageCount > 0 && (
          <div className="text-sm text-tier-navy/60 flex items-center gap-2 pt-4 border-t border-tier-navy/10">
            <User size={16} />
            <span>
              Used by {template.usageCount}{' '}
              {template.usageCount === 1 ? 'coach' : 'coaches'}
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
}

interface SessionCardProps {
  session: TemplateSession;
}

function SessionCard({ session }: SessionCardProps) {
  return (
    <Card className="border-tier-navy/10 hover:border-tier-gold/30 transition-colors">
      <div className="p-3 space-y-2">
        {/* Session header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h5 className="font-medium text-tier-navy">{session.name}</h5>
            {session.description && (
              <p className="text-sm text-tier-navy/70 mt-1 line-clamp-2">
                {session.description}
              </p>
            )}
          </div>
        </div>

        {/* Session metadata */}
        <div className="flex flex-wrap gap-3 text-xs text-tier-navy/60">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{WEEKDAY_LABELS[session.dayOfWeek]}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{session.durationMinutes} min</span>
          </div>
          {session.phase && (
            <div className="flex items-center gap-1">
              <TrendingUp size={12} />
              <span>{session.phase}</span>
            </div>
          )}
          {session.environment && (
            <div className="flex items-center gap-1">
              <MapPin size={12} />
              <span>{session.environment}</span>
            </div>
          )}
        </div>

        {/* Categories */}
        {session.categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {session.categories.map(category => (
              <Badge key={category} variant="outline">
                {category}
              </Badge>
            ))}
          </div>
        )}

        {/* Cognitive/Pressure levels */}
        <div className="flex gap-2">
          {session.cognitiveSkillsLevel && (
            <Badge variant="secondary">
              {session.cognitiveSkillsLevel}
            </Badge>
          )}
          {session.pressureLevel && (
            <Badge variant="secondary">
              {session.pressureLevel}
            </Badge>
          )}
        </div>

        {/* Exercise count if available */}
        {session.exercises && session.exercises.length > 0 && (
          <div className="text-xs text-tier-navy/60">
            {session.exercises.length}{' '}
            {session.exercises.length === 1 ? 'exercise' : 'exercises'} included
          </div>
        )}

        {/* Notes */}
        {session.notes && (
          <div className="text-xs text-tier-navy/60 italic border-l-2 border-tier-gold pl-2">
            {session.notes}
          </div>
        )}
      </div>
    </Card>
  );
}

export default TemplatePlanPreview;
