/**
 * TemplatePlanCalendar Component
 * Main calendar view for training plan templates with drag-and-drop
 */

import React, { useState, useMemo, useEffect } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { Save, RotateCcw, BarChart3, Calendar as CalendarIcon, Printer, Keyboard } from 'lucide-react';
import '../styles/print.css';
import { TrainingPlanTemplate, TemplateSession } from '../types/template.types';
import { useTemplateCalendar } from '../hooks/useTemplateCalendar';
import { useTemplateDragDrop } from '../hooks/useTemplateDragDrop';
import { useTemplateBulkSelection } from '../hooks/useTemplateBulkSelection';
import TemplateWeekNavigation from './TemplateWeekNavigation';
import TemplateWeekView from './TemplateWeekView';
import TemplateSessionBlock from './TemplateSessionBlock';
import TemplateSessionEditDialog from './TemplateSessionEditDialog';
import TemplatePlanApplyDialog from './TemplatePlanApplyDialog';
import TemplateBulkActionsToolbar from './TemplateBulkActionsToolbar';
import TemplateStatisticsPanel from './TemplateStatisticsPanel';
import Button from '../../../ui/primitives/Button';
import Modal from '../../../ui/composites/Modal.composite';
import { Input } from '../../../components/shadcn/input';
import { Card } from '../../../ui/primitives/Card';
import { Badge } from '../../../components/shadcn/badge';
import { CheckSquare, Square } from 'lucide-react';

interface TemplatePlanCalendarProps {
  template: TrainingPlanTemplate;
  startDate?: string;
  onSave?: (modifiedTemplate: TrainingPlanTemplate) => void;
}

export function TemplatePlanCalendar({
  template,
  startDate: initialStartDate,
  onSave
}: TemplatePlanCalendarProps) {
  // State
  const [startDate, setStartDate] = useState(
    initialStartDate || new Date().toISOString().split('T')[0]
  );
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'statistics'>('calendar');
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Calendar hook
  const {
    currentWeek,
    weekDates,
    weekSessions,
    goToNextWeek,
    goToPrevWeek,
    goToWeek,
    updateSession,
    moveSession,
    modifiedSessions,
    hasModifications,
    resetModifications,
    getAllSessions
  } = useTemplateCalendar({
    template,
    startDate
  });

  // Drag-and-drop hook
  const {
    sensors,
    activeSession,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    collisionDetection
  } = useTemplateDragDrop({
    sessions: getAllSessions(),
    currentWeek,
    onMoveSession: moveSession
  });

  // Bulk selection hook
  const {
    selectedSessionIds,
    selectedSessions,
    selectionMode,
    isSelected,
    toggleSelection,
    selectAll,
    selectNone,
    selectWeek,
    enterSelectionMode,
    exitSelectionMode,
    hasSelection,
    selectionCount
  } = useTemplateBulkSelection({
    sessions: getAllSessions()
  });

  // Calculate sessions per week for navigation indicators
  const sessionsPerWeek = useMemo(() => {
    const map = new Map<number, number>();
    getAllSessions().forEach(session => {
      map.set(session.weekNumber, (map.get(session.weekNumber) || 0) + 1);
    });
    return map;
  }, [getAllSessions]);

  // Week summary statistics
  const weekSummary = useMemo(() => {
    const totalDuration = weekSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const categoryCounts: Record<string, number> = {};

    weekSessions.forEach(session => {
      session.categories.forEach(cat => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    });

    return {
      sessionCount: weekSessions.length,
      totalDuration,
      categoryCounts
    };
  }, [weekSessions]);

  // Handle save
  const handleSave = () => {
    if (onSave) {
      const updatedTemplate: TrainingPlanTemplate = {
        ...template,
        sessions: getAllSessions(),
        updatedAt: new Date().toISOString()
      };
      onSave(updatedTemplate);
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Bulk operation handlers
  const handleBulkEdit = (updates: Partial<TemplateSession>) => {
    selectedSessions.forEach(session => {
      updateSession(session.id, updates);
    });
    exitSelectionMode();
  };

  const handleBulkDelete = () => {
    // Note: Would need deleteSession function in useTemplateCalendar
    // For now, we'll filter out selected sessions
    selectedSessions.forEach(session => {
      updateSession(session.id, { ...session, durationMinutes: 0 }); // Mark as deleted
    });
    exitSelectionMode();
  };

  const handleBulkDuplicate = (targetWeek: number) => {
    selectedSessions.forEach(session => {
      const newSession = {
        ...session,
        id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        weekNumber: targetWeek
      };
      // Note: Would need addSession function in useTemplateCalendar
    });
    exitSelectionMode();
  };

  const handleBulkMove = (targetWeek: number, targetDay: number) => {
    selectedSessions.forEach(session => {
      moveSession(session.id, targetWeek, targetDay);
    });
    exitSelectionMode();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't interfere with input fields
      }

      // Navigation
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevWeek();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextWeek();
      }
      // Print shortcut
      else if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handlePrint();
      }
      // Show keyboard shortcuts
      else if (e.key === '?') {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
      // Escape to close shortcuts
      else if (e.key === 'Escape' && showKeyboardShortcuts) {
        setShowKeyboardShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextWeek, goToPrevWeek, showKeyboardShortcuts]);

  // Get session being edited
  const sessionToEdit = editingSession
    ? getAllSessions().find(s => s.id === editingSession) || null
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Template info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-tier-navy mb-1">
              {template.name}
            </h2>
            <p className="text-tier-navy/70 text-sm mb-3">
              {template.description}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">
                {template.durationWeeks} {template.durationWeeks === 1 ? 'week' : 'weeks'}
              </Badge>
              <Badge variant="secondary">
                {template.sessions.length} {template.sessions.length === 1 ? 'session' : 'sessions'}
              </Badge>
              <Badge variant="secondary">
                {template.targetLevel}
              </Badge>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Start date picker */}
            <div>
              <label className="text-xs text-tier-navy/60 mb-1 block">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full sm:w-auto"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              {/* Keyboard shortcuts */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKeyboardShortcuts(true)}
                title="Keyboard shortcuts (?)"
                className="no-print"
              >
                <Keyboard size={16} />
              </Button>

              {/* Print */}
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrint}
                title="Print template (Ctrl+P)"
                className="no-print"
              >
                <Printer size={16} />
              </Button>

              {/* Selection mode toggle */}
              <Button
                variant={selectionMode ? 'primary' : 'secondary'}
                size="sm"
                onClick={selectionMode ? exitSelectionMode : enterSelectionMode}
                title={selectionMode ? 'Exit selection mode' : 'Enter selection mode'}
                className="no-print"
              >
                {selectionMode ? <CheckSquare size={16} /> : <Square size={16} />}
              </Button>

              {hasModifications && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={resetModifications}
                    title="Reset all modifications"
                    className="no-print"
                  >
                    <RotateCcw size={16} />
                  </Button>
                  {onSave && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSave}
                      title="Save modifications"
                      className="no-print"
                    >
                      <Save size={16} className="mr-1" />
                      Save
                    </Button>
                  )}
                </>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowApplyDialog(true)}
                className="no-print"
              >
                Apply Template
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* View Mode Toggle */}
      <div className="flex justify-center no-print">
        <div className="inline-flex rounded-lg border border-tier-navy/20 p-1 bg-white">
          <Button
            variant={viewMode === 'calendar' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className="flex items-center gap-2"
          >
            <CalendarIcon size={16} />
            Calendar
          </Button>
          <Button
            variant={viewMode === 'statistics' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('statistics')}
            className="flex items-center gap-2"
          >
            <BarChart3 size={16} />
            Statistics
          </Button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <>
          {/* Week Navigation */}
          <TemplateWeekNavigation
        currentWeek={currentWeek}
        totalWeeks={template.durationWeeks}
        weekDates={weekDates}
        sessionsPerWeek={sessionsPerWeek}
        onPrevious={goToPrevWeek}
        onNext={goToNextWeek}
        onSelectWeek={goToWeek}
      />

      {/* Week Summary */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <span className="text-sm text-tier-navy/60">Sessions:</span>
            <span className="ml-2 text-lg font-semibold text-tier-navy">
              {weekSummary.sessionCount}
            </span>
          </div>
          <div>
            <span className="text-sm text-tier-navy/60">Total Duration:</span>
            <span className="ml-2 text-lg font-semibold text-tier-navy">
              {weekSummary.totalDuration} min
            </span>
          </div>
          {Object.keys(weekSummary.categoryCounts).length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-tier-navy/60">Categories:</span>
              <div className="flex gap-1">
                {Object.entries(weekSummary.categoryCounts).map(([cat, count]) => (
                  <Badge key={cat} variant="outline">
                    {count} {cat}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Calendar Grid with DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <TemplateWeekView
          weekNumber={currentWeek}
          weekDates={weekDates}
          sessions={getAllSessions()}
          onEditSession={session => setEditingSession(session.id)}
          selectionMode={selectionMode}
          isSelected={isSelected}
          onToggleSelection={toggleSelection}
        />

        {/* Drag Overlay */}
        <DragOverlay>
          {activeSession ? (
            <TemplateSessionBlock session={activeSession} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modification indicator */}
      {hasModifications && (
        <div className="text-center text-sm text-tier-navy/60">
          {modifiedSessions.size} {modifiedSessions.size === 1 ? 'session has' : 'sessions have'} been modified
        </div>
      )}

      {/* Bulk Actions Toolbar */}
      {hasSelection && (
        <TemplateBulkActionsToolbar
          selectedCount={selectionCount}
          selectedSessions={selectedSessions}
          onCancel={exitSelectionMode}
          onBulkEdit={handleBulkEdit}
          onBulkDelete={handleBulkDelete}
          onBulkDuplicate={handleBulkDuplicate}
          onBulkMove={handleBulkMove}
        />
      )}
        </>
      )}

      {/* Statistics View */}
      {viewMode === 'statistics' && (
        <TemplateStatisticsPanel template={template} />
      )}

      {/* Session Edit Dialog */}
      <TemplateSessionEditDialog
        session={sessionToEdit}
        isOpen={!!editingSession}
        onClose={() => setEditingSession(null)}
        onSave={updates => {
          if (editingSession) {
            updateSession(editingSession, updates);
          }
        }}
      />

      {/* Apply Dialog */}
      {showApplyDialog && (
        <TemplatePlanApplyDialog
          template={{
            ...template,
            sessions: getAllSessions() // Use modified sessions
          }}
          isOpen={showApplyDialog}
          onClose={() => setShowApplyDialog(false)}
          onSuccess={() => {
            setShowApplyDialog(false);
            // Optionally reset modifications after successful application
          }}
        />
      )}

      {/* Keyboard Shortcuts Dialog */}
      <Modal
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
        title="Keyboard Shortcuts"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-tier-navy mb-3">Navigation</h4>
            <div className="space-y-2">
              <ShortcutRow keys={['←']} description="Go to previous week" />
              <ShortcutRow keys={['→']} description="Go to next week" />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-tier-navy mb-3">Actions</h4>
            <div className="space-y-2">
              <ShortcutRow keys={['Ctrl', 'P']} description="Print template" />
              <ShortcutRow keys={['?']} description="Show keyboard shortcuts" />
              <ShortcutRow keys={['Esc']} description="Close dialogs" />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-tier-navy mb-3">Drag & Drop</h4>
            <div className="space-y-2">
              <div className="text-sm text-tier-navy/70">
                <strong>Click and drag</strong> session blocks to reschedule them to different days or weeks.
              </div>
              <div className="text-sm text-tier-navy/70">
                <strong>Click</strong> a session block to edit its details.
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-tier-navy/10">
            <p className="text-xs text-tier-navy/60 text-center">
              Tip: Most keyboard shortcuts work when not typing in input fields
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Helper component for keyboard shortcut rows
interface ShortcutRowProps {
  keys: string[];
  description: string;
}

function ShortcutRow({ keys, description }: ShortcutRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <React.Fragment key={key}>
            {index > 0 && <span className="text-tier-navy/40 text-xs mx-1">+</span>}
            <kbd className="px-2 py-1 text-xs font-mono bg-tier-navy/10 border border-tier-navy/20 rounded">
              {key}
            </kbd>
          </React.Fragment>
        ))}
      </div>
      <span className="text-sm text-tier-navy/70">{description}</span>
    </div>
  );
}

export default TemplatePlanCalendar;
