/**
 * CoachTemplateCreator - Interface for creating custom training plan templates
 * Allows coaches to build templates from scratch with custom sessions
 */

import React, { useState } from 'react';
import { Plus, Save, X, Calendar, Target } from 'lucide-react';
import { Card } from '../../../ui/primitives/Card';
import Button from '../../../ui/primitives/Button';
import { Badge } from '../../../components/shadcn/badge';
import Modal from '../../../ui/composites/Modal.composite';
import type {
  TrainingPlanTemplate,
  TemplateSession,
  TrainingPhase,
  TrainingEnvironment
} from '../types/template.types';

interface CoachTemplateCreatorProps {
  onSave: (template: TrainingPlanTemplate) => void;
  onCancel: () => void;
  initialTemplate?: TrainingPlanTemplate;
}

interface NewSessionForm {
  name: string;
  description: string;
  weekNumber: number;
  dayOfWeek: number;
  durationMinutes: number;
  categories: string[];
  phase: TrainingPhase;
  environment: TrainingEnvironment;
  cognitiveSkillsLevel: string;
  pressureLevel: string;
  notes: string;
}

const EMPTY_SESSION: NewSessionForm = {
  name: '',
  description: '',
  weekNumber: 1,
  dayOfWeek: 1,
  durationMinutes: 60,
  categories: ['TEE'],
  phase: 'L1',
  environment: 'C1',
  cognitiveSkillsLevel: 'CS1',
  pressureLevel: 'PR1',
  notes: '',
};

const CATEGORIES = ['TEE', 'APP', 'SGR', 'PGR', 'GBR'];
const PHASES = ['L1', 'L2', 'L3', 'L4', 'L5'];
const ENVIRONMENTS = ['C1', 'C2', 'C3', 'C4'];
const COGNITIVE_LEVELS = ['CS1', 'CS2', 'CS3', 'CS4', 'CS5'];
const PRESSURE_LEVELS = ['PR1', 'PR2', 'PR3', 'PR4', 'PR5'];
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function CoachTemplateCreator({ onSave, onCancel, initialTemplate }: CoachTemplateCreatorProps) {
  const [templateName, setTemplateName] = useState(initialTemplate?.name || '');
  const [description, setDescription] = useState(initialTemplate?.description || '');
  const [durationWeeks, setDurationWeeks] = useState(initialTemplate?.durationWeeks || 8);
  const [sessions, setSessions] = useState<TemplateSession[]>(initialTemplate?.sessions || []);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [newSession, setNewSession] = useState<NewSessionForm>(EMPTY_SESSION);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddSession = () => {
    // Validate
    const validationErrors: Record<string, string> = {};
    if (!newSession.name.trim()) validationErrors.name = 'Session name is required';
    if (newSession.durationMinutes < 15 || newSession.durationMinutes > 240) {
      validationErrors.duration = 'Duration must be between 15 and 240 minutes';
    }
    if (newSession.weekNumber < 1 || newSession.weekNumber > durationWeeks) {
      validationErrors.week = `Week must be between 1 and ${durationWeeks}`;
    }
    if (newSession.categories.length === 0) {
      validationErrors.categories = 'At least one category is required';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Create session
    const session: TemplateSession = {
      id: `session-${Date.now()}`,
      name: newSession.name.trim(),
      description: newSession.description.trim(),
      weekNumber: newSession.weekNumber,
      dayOfWeek: newSession.dayOfWeek,
      durationMinutes: newSession.durationMinutes,
      categories: newSession.categories,
      phase: newSession.phase,
      environment: newSession.environment,
      cognitiveSkillsLevel: newSession.cognitiveSkillsLevel,
      pressureLevel: newSession.pressureLevel,
      notes: newSession.notes.trim(),
      exercises: [],
    };

    setSessions(prev => [...prev, session]);
    setNewSession(EMPTY_SESSION);
    setIsAddingSession(false);
    setErrors({});
  };

  const handleRemoveSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const handleSaveTemplate = () => {
    // Validate template
    if (!templateName.trim()) {
      alert('Template name is required');
      return;
    }
    if (sessions.length === 0) {
      alert('Add at least one session to the template');
      return;
    }

    const template: TrainingPlanTemplate = {
      id: initialTemplate?.id || `template-${Date.now()}`,
      name: templateName.trim(),
      description: description.trim(),
      category: 'custom',
      durationWeeks,
      targetLevel: 'all',
      sessions,
      createdBy: 'Coach',
      isPublic: false,
      tags: ['Custom'],
      createdAt: initialTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(template);
  };

  const handleCategoryToggle = (category: string) => {
    setNewSession(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  const sessionsByWeek = sessions.reduce((acc, session) => {
    if (!acc[session.weekNumber]) {
      acc[session.weekNumber] = [];
    }
    acc[session.weekNumber].push(session);
    return acc;
  }, {} as Record<number, TemplateSession[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-tier-navy flex items-center gap-2">
            <Target size={24} />
            {initialTemplate ? 'Edit Template' : 'Create New Template'}
          </h2>

          {/* Template Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-tier-navy mb-1">
                Template Name *
              </label>
              <input
                type="text"
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                placeholder="e.g., 8-Week Full Swing Development"
                className="w-full px-3 py-2 border border-tier-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-tier-navy mb-1">
                Duration (weeks) *
              </label>
              <input
                type="number"
                min="1"
                max="52"
                value={durationWeeks}
                onChange={e => setDurationWeeks(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-tier-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-tier-navy mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the focus and goals of this training plan..."
              rows={3}
              className="w-full px-3 py-2 border border-tier-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-gold resize-none"
            />
          </div>
        </div>
      </Card>

      {/* Sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-tier-navy">
            Sessions ({sessions.length})
          </h3>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddingSession(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Session
          </Button>
        </div>

        {/* Sessions by Week */}
        {Array.from({ length: durationWeeks }, (_, i) => i + 1).map(weekNum => {
          const weekSessions = sessionsByWeek[weekNum] || [];
          return (
            <Card key={weekNum} className="p-4 mb-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-tier-navy flex items-center gap-2">
                  <Calendar size={18} />
                  Week {weekNum}
                </h4>
                <Badge variant="secondary">
                  {weekSessions.length} {weekSessions.length === 1 ? 'session' : 'sessions'}
                </Badge>
              </div>

              {weekSessions.length === 0 ? (
                <p className="text-sm text-tier-navy/60 italic">No sessions scheduled</p>
              ) : (
                <div className="space-y-2">
                  {weekSessions.map(session => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 bg-tier-navy/5 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-tier-navy">{session.name}</div>
                        <div className="text-xs text-tier-navy/60 mt-1 flex items-center gap-3">
                          <span>{DAY_NAMES[session.dayOfWeek - 1]}</span>
                          <span>•</span>
                          <span>{session.durationMinutes} min</span>
                          <span>•</span>
                          <span>{session.categories.join(', ')}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveSession(session.id)}
                        className="text-tier-navy/40 hover:text-red-500 transition-colors"
                        aria-label="Remove session"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-tier-navy/10">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSaveTemplate}
          className="flex items-center gap-2"
          disabled={!templateName.trim() || sessions.length === 0}
        >
          <Save size={16} />
          Save Template
        </Button>
      </div>

      {/* Add Session Modal */}
      {isAddingSession && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsAddingSession(false);
            setNewSession(EMPTY_SESSION);
            setErrors({});
          }}
          title="Add Session"
          size="lg"
        >
          <div className="space-y-4">
            {/* Session Name */}
            <div>
              <label className="block text-sm font-medium text-tier-navy mb-1">
                Session Name *
              </label>
              <input
                type="text"
                value={newSession.name}
                onChange={e => setNewSession(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Putting Alignment & Setup"
                className="w-full px-3 py-2 border border-tier-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-gold"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-tier-navy mb-1">
                Description
              </label>
              <textarea
                value={newSession.description}
                onChange={e => setNewSession(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the session focus..."
                rows={2}
                className="w-full px-3 py-2 border border-tier-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-gold resize-none"
              />
            </div>

            {/* Week and Day */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-tier-navy mb-1">
                  Week * (1-{durationWeeks})
                </label>
                <input
                  type="number"
                  min="1"
                  max={durationWeeks}
                  value={newSession.weekNumber}
                  onChange={e => setNewSession(prev => ({ ...prev, weekNumber: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-tier-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-gold"
                />
                {errors.week && <p className="text-xs text-red-500 mt-1">{errors.week}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-tier-navy mb-1">
                  Day of Week *
                </label>
                <select
                  value={newSession.dayOfWeek}
                  onChange={e => setNewSession(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-tier-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-gold"
                >
                  {DAY_NAMES.map((day, i) => (
                    <option key={i} value={i + 1}>{day}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-tier-navy mb-1">
                Duration (minutes) * (15-240)
              </label>
              <input
                type="number"
                min="15"
                max="240"
                step="15"
                value={newSession.durationMinutes}
                onChange={e => setNewSession(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) || 60 }))}
                className="w-full px-3 py-2 border border-tier-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-gold"
              />
              {errors.duration && <p className="text-xs text-red-500 mt-1">{errors.duration}</p>}
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-tier-navy mb-2">
                Categories * (select at least one)
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryToggle(cat)}
                    className={`
                      px-3 py-1.5 rounded border text-sm font-medium transition-colors
                      ${newSession.categories.includes(cat)
                        ? 'bg-tier-gold text-white border-tier-gold'
                        : 'bg-white text-tier-navy border-tier-navy/20 hover:border-tier-gold'
                      }
                    `}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {errors.categories && <p className="text-xs text-red-500 mt-1">{errors.categories}</p>}
            </div>

            {/* Phase, Environment, Cognitive, Pressure */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-tier-navy mb-1">
                  Phase
                </label>
                <select
                  value={newSession.phase}
                  onChange={e => {
                    const phase = e.target.value as TrainingPhase;
                    setNewSession(prev => ({ ...prev, phase }));
                  }}
                  className="w-full px-3 py-2 border border-tier-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-gold"
                >
                  {PHASES.map(phase => (
                    <option key={phase} value={phase}>{phase}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-tier-navy mb-1">
                  Environment
                </label>
                <select
                  value={newSession.environment}
                  onChange={e => {
                    const environment = e.target.value as TrainingEnvironment;
                    setNewSession(prev => ({ ...prev, environment }));
                  }}
                  className="w-full px-3 py-2 border border-tier-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-gold"
                >
                  {ENVIRONMENTS.map(env => (
                    <option key={env} value={env}>{env}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-tier-navy mb-1">
                  Cognitive Skills
                </label>
                <select
                  value={newSession.cognitiveSkillsLevel}
                  onChange={e => setNewSession(prev => ({ ...prev, cognitiveSkillsLevel: e.target.value }))}
                  className="w-full px-3 py-2 border border-tier-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-gold"
                >
                  {COGNITIVE_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-tier-navy mb-1">
                  Pressure Level
                </label>
                <select
                  value={newSession.pressureLevel}
                  onChange={e => setNewSession(prev => ({ ...prev, pressureLevel: e.target.value }))}
                  className="w-full px-3 py-2 border border-tier-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-gold"
                >
                  {PRESSURE_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-tier-navy mb-1">
                Coach Notes
              </label>
              <textarea
                value={newSession.notes}
                onChange={e => setNewSession(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes or instructions for this session..."
                rows={2}
                className="w-full px-3 py-2 border border-tier-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-gold resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-tier-navy/10">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAddingSession(false);
                  setNewSession(EMPTY_SESSION);
                  setErrors({});
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAddSession}>
                Add Session
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default CoachTemplateCreator;
