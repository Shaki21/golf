/**
 * TemplateBulkActionsToolbar Component
 * Toolbar showing bulk action options when sessions are selected
 */

import React, { useState } from 'react';
import { X, Edit2, Copy, Trash2, Tag, Move } from 'lucide-react';
import Button from '../../../ui/primitives/Button';
import { Badge } from '../../../components/shadcn/badge';
import Modal from '../../../ui/composites/Modal.composite';
import { Input } from '../../../components/shadcn/input';
import { Checkbox } from '../../../components/shadcn/checkbox';
import { Label } from '../../../components/shadcn/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/shadcn/select';
import { TemplateSession } from '../types/template.types';

interface TemplateBulkActionsToolbarProps {
  selectedCount: number;
  selectedSessions: TemplateSession[];
  onCancel: () => void;
  onBulkEdit: (updates: Partial<TemplateSession>) => void;
  onBulkDelete: () => void;
  onBulkDuplicate: (targetWeek: number) => void;
  onBulkMove: (targetWeek: number, targetDay: number) => void;
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

type BulkAction = 'edit' | 'duplicate' | 'move' | null;

export function TemplateBulkActionsToolbar({
  selectedCount,
  selectedSessions,
  onCancel,
  onBulkEdit,
  onBulkDelete,
  onBulkDuplicate,
  onBulkMove
}: TemplateBulkActionsToolbarProps) {
  const [activeDialog, setActiveDialog] = useState<BulkAction>(null);

  // Bulk edit form state
  const [editCategories, setEditCategories] = useState<string[]>([]);
  const [editPhase, setEditPhase] = useState<string>('');
  const [editEnvironment, setEditEnvironment] = useState<string>('');
  const [editDuration, setEditDuration] = useState<string>('');

  // Duplicate/Move form state
  const [targetWeek, setTargetWeek] = useState<string>('1');
  const [targetDay, setTargetDay] = useState<string>('0');

  // Handle bulk edit
  const handleBulkEdit = () => {
    const updates: Partial<TemplateSession> = {};

    if (editCategories.length > 0) {
      updates.categories = editCategories;
    }
    if (editPhase) {
      updates.phase = editPhase as TemplateSession['phase'];
    }
    if (editEnvironment) {
      updates.environment = editEnvironment as TemplateSession['environment'];
    }
    if (editDuration && parseInt(editDuration) > 0) {
      updates.durationMinutes = parseInt(editDuration);
    }

    onBulkEdit(updates);
    setActiveDialog(null);
    resetEditForm();
  };

  // Handle bulk duplicate
  const handleBulkDuplicate = () => {
    const week = parseInt(targetWeek);
    if (week > 0) {
      onBulkDuplicate(week);
      setActiveDialog(null);
      resetMoveForm();
    }
  };

  // Handle bulk move
  const handleBulkMove = () => {
    const week = parseInt(targetWeek);
    const day = parseInt(targetDay);
    if (week > 0 && day >= 0 && day <= 6) {
      onBulkMove(week, day);
      setActiveDialog(null);
      resetMoveForm();
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedCount} session(s)? This action cannot be undone.`)) {
      onBulkDelete();
    }
  };

  // Reset forms
  const resetEditForm = () => {
    setEditCategories([]);
    setEditPhase('');
    setEditEnvironment('');
    setEditDuration('');
  };

  const resetMoveForm = () => {
    setTargetWeek('1');
    setTargetDay('0');
  };

  // Toggle category in bulk edit
  const toggleEditCategory = (category: string) => {
    setEditCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <>
      {/* Floating Toolbar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-tier-navy text-white rounded-lg shadow-2xl p-4 flex items-center gap-4">
          {/* Selection count */}
          <div className="flex items-center gap-2">
            <Badge variant="warning" className="bg-tier-gold text-tier-navy">
              {selectedCount}
            </Badge>
            <span className="text-sm font-medium">
              {selectedCount === 1 ? 'session selected' : 'sessions selected'}
            </span>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-white/20" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveDialog('edit')}
              className="text-white hover:bg-white/10"
            >
              <Edit2 size={16} className="mr-1" />
              Edit
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveDialog('duplicate')}
              className="text-white hover:bg-white/10"
            >
              <Copy size={16} className="mr-1" />
              Duplicate
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveDialog('move')}
              className="text-white hover:bg-white/10"
            >
              <Move size={16} className="mr-1" />
              Move
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleBulkDelete}
              className="text-tier-error hover:bg-tier-error/10"
            >
              <Trash2 size={16} className="mr-1" />
              Delete
            </Button>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-white/20" />

          {/* Cancel */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-white hover:bg-white/10"
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Bulk Edit Dialog */}
      <Modal
        isOpen={activeDialog === 'edit'}
        onClose={() => setActiveDialog(null)}
        title="Bulk Edit Sessions"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setActiveDialog(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleBulkEdit}>
              Apply to {selectedCount} session(s)
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-tier-navy/70">
            Select which properties to update for {selectedCount} selected session(s). Leave blank to keep existing values.
          </p>

          {/* Categories */}
          <div>
            <Label>Categories</Label>
            <div className="mt-2 space-y-2">
              {CATEGORIES.map(category => (
                <label key={category.value} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={editCategories.includes(category.value)}
                    onCheckedChange={() => toggleEditCategory(category.value)}
                  />
                  <span className="text-sm text-tier-navy">{category.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Phase and Environment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bulk-phase">Learning Phase</Label>
              <Select value={editPhase} onValueChange={setEditPhase}>
                <SelectTrigger id="bulk-phase">
                  <SelectValue placeholder="No change" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No change</SelectItem>
                  {PHASES.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bulk-environment">Environment</Label>
              <Select value={editEnvironment} onValueChange={setEditEnvironment}>
                <SelectTrigger id="bulk-environment">
                  <SelectValue placeholder="No change" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No change</SelectItem>
                  {ENVIRONMENTS.map(env => (
                    <SelectItem key={env} value={env}>{env}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration */}
          <div>
            <Label htmlFor="bulk-duration">Duration (minutes)</Label>
            <Input
              id="bulk-duration"
              type="number"
              min={15}
              max={240}
              step={15}
              value={editDuration}
              onChange={e => setEditDuration(e.target.value)}
              placeholder="No change"
            />
          </div>
        </div>
      </Modal>

      {/* Duplicate Dialog */}
      <Modal
        isOpen={activeDialog === 'duplicate'}
        onClose={() => setActiveDialog(null)}
        title="Duplicate Sessions"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setActiveDialog(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleBulkDuplicate}>
              Duplicate to Week {targetWeek}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-tier-navy/70">
            Duplicate {selectedCount} selected session(s) to a target week.
          </p>

          <div>
            <Label htmlFor="duplicate-week">Target Week</Label>
            <Input
              id="duplicate-week"
              type="number"
              min={1}
              value={targetWeek}
              onChange={e => setTargetWeek(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Move Dialog */}
      <Modal
        isOpen={activeDialog === 'move'}
        onClose={() => setActiveDialog(null)}
        title="Move Sessions"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setActiveDialog(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleBulkMove}>
              Move to Week {targetWeek}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-tier-navy/70">
            Move {selectedCount} selected session(s) to a target week and day.
          </p>

          <div>
            <Label htmlFor="move-week">Target Week</Label>
            <Input
              id="move-week"
              type="number"
              min={1}
              value={targetWeek}
              onChange={e => setTargetWeek(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="move-day">Target Day</Label>
            <Select value={targetDay} onValueChange={setTargetDay}>
              <SelectTrigger id="move-day">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Monday</SelectItem>
                <SelectItem value="1">Tuesday</SelectItem>
                <SelectItem value="2">Wednesday</SelectItem>
                <SelectItem value="3">Thursday</SelectItem>
                <SelectItem value="4">Friday</SelectItem>
                <SelectItem value="5">Saturday</SelectItem>
                <SelectItem value="6">Sunday</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default TemplateBulkActionsToolbar;
