/**
 * TemplateSessionEditDialog Component
 * Modal dialog for editing training session properties
 */

import React, { useState, useEffect } from 'react';
import Modal from '../../../ui/composites/Modal.composite';
import Button from '../../../ui/primitives/Button';
import { Input } from '../../../components/shadcn/input';
import { Checkbox } from '../../../components/shadcn/checkbox';
import { Label } from '../../../components/shadcn/label';
import { Textarea } from '../../../components/shadcn/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/shadcn/select';
import { TemplateSession, TemplateExercise } from '../types/template.types';
import TemplateExercisePicker from './TemplateExercisePicker';

interface TemplateSessionEditDialogProps {
  session: TemplateSession | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<TemplateSession>) => void;
  onDelete?: () => void;
}

const CATEGORIES = [
  { value: 'TEE', label: 'Tee Shots (TEE)' },
  { value: 'APP', label: 'Approach (APP)' },
  { value: 'SGR', label: 'Short Game Rescue (SGR)' },
  { value: 'PGR', label: 'Putting Green (PGR)' },
  { value: 'GBR', label: 'Greenside Bunker (GBR)' }
];

const PHASES = ['L1', 'L2', 'L3', 'L4', 'L5'];
const ENVIRONMENTS = ['C1', 'C2', 'C3', 'C4'];
const COGNITIVE_LEVELS = ['CS1', 'CS2', 'CS3', 'CS4', 'CS5'];
const PRESSURE_LEVELS = ['PR1', 'PR2', 'PR3', 'PR4', 'PR5'];

export function TemplateSessionEditDialog({
  session,
  isOpen,
  onClose,
  onSave,
  onDelete
}: TemplateSessionEditDialogProps) {
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [phase, setPhase] = useState<string>('');
  const [environment, setEnvironment] = useState<string>('');
  const [cognitiveSkillsLevel, setCognitiveSkillsLevel] = useState<string>('');
  const [pressureLevel, setPressureLevel] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<TemplateExercise[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when session changes
  useEffect(() => {
    if (session) {
      setName(session.name || '');
      setDescription(session.description || '');
      setDurationMinutes(session.durationMinutes || 60);
      setSelectedCategories(session.categories || []);
      setPhase(session.phase || '');
      setEnvironment(session.environment || '');
      setCognitiveSkillsLevel(session.cognitiveSkillsLevel || '');
      setPressureLevel(session.pressureLevel || '');
      setNotes(session.notes || '');
      setExercises(session.exercises || []);
      setErrors({});
    }
  }, [session]);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name || name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    } else if (name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    if (durationMinutes < 15 || durationMinutes > 240) {
      newErrors.duration = 'Duration must be between 15 and 240 minutes';
    }

    if (selectedCategories.length === 0) {
      newErrors.categories = 'At least one category must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle category toggle
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Handle save
  const handleSave = () => {
    if (!validate()) {
      return;
    }

    const updates: Partial<TemplateSession> = {
      name: name.trim(),
      description: description.trim() || undefined,
      durationMinutes,
      categories: selectedCategories,
      phase: phase ? (phase as TemplateSession['phase']) : undefined,
      environment: environment ? (environment as TemplateSession['environment']) : undefined,
      cognitiveSkillsLevel: cognitiveSkillsLevel || undefined,
      pressureLevel: pressureLevel || undefined,
      notes: notes.trim() || undefined,
      exercises: exercises.length > 0 ? exercises : undefined
    };

    onSave(updates);
    onClose();
  };

  // Exercise handlers
  const handleAddExercise = (exercise: TemplateExercise) => {
    setExercises(prev => [...prev, exercise]);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  if (!session) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Session"
      size="lg"
      footer={
        <div className="flex justify-between w-full">
          <div>
            {onDelete && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this session?')) {
                    onDelete();
                    onClose();
                  }
                }}
              >
                Delete Session
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-tier-navy">Basic Information</h3>

          {/* Name */}
          <div>
            <Label htmlFor="session-name">Session Name *</Label>
            <Input
              id="session-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Putting Alignment & Setup"
              className={errors.name ? 'border-tier-error' : ''}
            />
            {errors.name && (
              <p className="text-xs text-tier-error mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="session-description">Description</Label>
            <Textarea
              id="session-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the session focus and objectives..."
              rows={3}
            />
          </div>

          {/* Duration */}
          <div>
            <Label htmlFor="session-duration">Duration (minutes) *</Label>
            <Input
              id="session-duration"
              type="number"
              min={15}
              max={240}
              step={15}
              value={durationMinutes}
              onChange={e => setDurationMinutes(parseInt(e.target.value, 10) || 60)}
              className={errors.duration ? 'border-tier-error' : ''}
            />
            {errors.duration && (
              <p className="text-xs text-tier-error mt-1">{errors.duration}</p>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-tier-navy">Categories *</h3>
          <div className="space-y-2">
            {CATEGORIES.map(category => (
              <label
                key={category.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Checkbox
                  checked={selectedCategories.includes(category.value)}
                  onCheckedChange={() => handleCategoryToggle(category.value)}
                />
                <span className="text-sm text-tier-navy">{category.label}</span>
              </label>
            ))}
          </div>
          {errors.categories && (
            <p className="text-xs text-tier-error">{errors.categories}</p>
          )}
        </div>

        {/* Training Parameters */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="session-phase">Learning Phase</Label>
            <Select value={phase} onValueChange={setPhase}>
              <SelectTrigger id="session-phase">
                <SelectValue placeholder="Select phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {PHASES.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="session-environment">Environment</Label>
            <Select value={environment} onValueChange={setEnvironment}>
              <SelectTrigger id="session-environment">
                <SelectValue placeholder="Select environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {ENVIRONMENTS.map(env => (
                  <SelectItem key={env} value={env}>{env}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="session-cognitive">Cognitive Skills</Label>
            <Select value={cognitiveSkillsLevel} onValueChange={setCognitiveSkillsLevel}>
              <SelectTrigger id="session-cognitive">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {COGNITIVE_LEVELS.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="session-pressure">Pressure Level</Label>
            <Select value={pressureLevel} onValueChange={setPressureLevel}>
              <SelectTrigger id="session-pressure">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {PRESSURE_LEVELS.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-tier-navy">Session Exercises</h3>
          <TemplateExercisePicker
            selectedExercises={exercises}
            onAdd={handleAddExercise}
            onRemove={handleRemoveExercise}
            maxExercises={10}
          />
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="session-notes">Coach Notes</Label>
          <Textarea
            id="session-notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Additional notes or coaching points..."
            rows={3}
          />
        </div>
      </div>
    </Modal>
  );
}

export default TemplateSessionEditDialog;
