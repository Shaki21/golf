/**
 * QuickLogModal - Quick Session Logging Modal
 *
 * Reduces click depth by allowing users to log sessions inline
 * without navigating to a separate page.
 *
 * Uses shadcn Dialog (powered by Catalyst UI)
 */

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '../shadcn/dialog';
import { Button } from '../shadcn/button';
import { Input } from '../shadcn/input';
import { Label } from '../shadcn/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../shadcn/select';
import { Textarea } from '../shadcn/textarea';
import { Dumbbell, Target, Flag, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ACTION_LABELS, CATEGORY_LABELS } from '../../constants/ui-labels';

// =============================================================================
// TYPES
// =============================================================================

export type SessionType = 'training' | 'test' | 'round';

export interface QuickLogModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Pre-selected session type */
  defaultSessionType?: SessionType;
  /** Pre-filled goal ID */
  prefilledGoalId?: string;
  /** Pre-filled goal name (for display) */
  prefilledGoalName?: string;
  /** Callback when session is logged successfully */
  onComplete?: (data: QuickLogData) => void;
}

export interface QuickLogData {
  sessionType: SessionType;
  category: string;
  duration: number;
  notes?: string;
  goalId?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const sessionTypeConfig: Record<SessionType, {
  label: string;
  icon: React.ElementType;
  color: string;
}> = {
  training: {
    label: 'Training',
    icon: Dumbbell,
    color: 'text-status-success bg-status-success/10',
  },
  test: {
    label: 'Test',
    icon: Target,
    color: 'text-status-info bg-status-info/10',
  },
  round: {
    label: 'Round',
    icon: Flag,
    color: 'text-tier-gold bg-tier-gold/10',
  },
};

const categoryOptions = [
  { value: 'physical', label: CATEGORY_LABELS.physical },
  { value: 'technique', label: CATEGORY_LABELS.technique },
  { value: 'putting', label: CATEGORY_LABELS.putting },
  { value: 'shortGame', label: CATEGORY_LABELS.shortGame },
  { value: 'approach', label: CATEGORY_LABELS.approach },
  { value: 'driving', label: CATEGORY_LABELS.driving },
  { value: 'mental', label: CATEGORY_LABELS.mental },
];

const durationOptions = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function QuickLogModal({
  isOpen,
  onClose,
  defaultSessionType = 'training',
  prefilledGoalId,
  prefilledGoalName,
  onComplete,
}: QuickLogModalProps) {
  // Form state
  const [sessionType, setSessionType] = useState<SessionType>(defaultSessionType);
  const [category, setCategory] = useState<string>('');
  const [duration, setDuration] = useState<number>(30);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSessionType(defaultSessionType);
      setCategory('');
      setDuration(30);
      setNotes('');
      setIsSubmitting(false);
      setIsSuccess(false);
    }
  }, [isOpen, defaultSessionType]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) return;

    setIsSubmitting(true);

    try {
      // Simulate API call (replace with actual API)
      await new Promise((resolve) => setTimeout(resolve, 800));

      const data: QuickLogData = {
        sessionType,
        category,
        duration,
        notes: notes.trim() || undefined,
        goalId: prefilledGoalId,
      };

      setIsSuccess(true);

      // Wait for success animation
      setTimeout(() => {
        onComplete?.(data);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Failed to log session:', error);
      setIsSubmitting(false);
    }
  }, [sessionType, category, duration, notes, prefilledGoalId, onComplete, onClose]);

  // Success state
  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent size="sm">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-status-success/10 flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-status-success" />
            </div>
            <h3 className="text-lg font-semibold text-tier-navy mb-1">
              Session logged!
            </h3>
            <p className="text-sm text-tier-text-secondary">
              {duration} min {categoryOptions.find(c => c.value === category)?.label} session recorded
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{ACTION_LABELS.logSession}</DialogTitle>
          <DialogDescription>
            Quickly log a training session without leaving the page.
            {prefilledGoalName && (
              <span className="block mt-1 text-tier-navy font-medium">
                Goal: {prefilledGoalName}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            {/* Session Type Selector */}
            <div>
              <Label className="mb-2 block">Session type</Label>
              <div className="flex gap-2">
                {(Object.entries(sessionTypeConfig) as [SessionType, typeof sessionTypeConfig[SessionType]][]).map(
                  ([type, config]) => {
                    const Icon = config.icon;
                    const isSelected = sessionType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSessionType(type)}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 transition-all',
                          isSelected
                            ? 'border-tier-navy bg-tier-navy/5'
                            : 'border-tier-border-default hover:border-tier-border-hover'
                        )}
                      >
                        <div className={cn('p-1.5 rounded-md', config.color)}>
                          <Icon size={16} />
                        </div>
                        <span
                          className={cn(
                            'text-sm font-medium',
                            isSelected ? 'text-tier-navy' : 'text-tier-text-secondary'
                          )}
                        >
                          {config.label}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className="mb-2 block">
                Category *
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div>
              <Label htmlFor="duration" className="mb-2 block">
                Duration
              </Label>
              <Select
                value={duration.toString()}
                onValueChange={(v) => setDuration(parseInt(v, 10))}
              >
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="mb-2 block">
                Notes (optional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about your session..."
                rows={3}
              />
            </div>
          </DialogBody>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {ACTION_LABELS.cancel}
            </Button>
            <Button
              type="submit"
              disabled={!category || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                ACTION_LABELS.logSession
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// HOOK FOR EASY USAGE
// =============================================================================

export function useQuickLogModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<Partial<QuickLogModalProps>>({});

  const openModal = useCallback((options?: Partial<QuickLogModalProps>) => {
    setConfig(options || {});
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    config,
  };
}

export default QuickLogModal;
