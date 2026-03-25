/**
 * useTemplateBulkSelection Hook
 * Manages multi-select state for bulk operations on template sessions
 */

import { useState, useCallback, useMemo } from 'react';
import { TemplateSession } from '../types/template.types';

interface UseTemplateBulkSelectionProps {
  sessions: TemplateSession[];
}

interface UseTemplateBulkSelectionReturn {
  selectedSessionIds: Set<string>;
  selectedSessions: TemplateSession[];
  selectionMode: boolean;
  isSelected: (sessionId: string) => boolean;
  toggleSelection: (sessionId: string) => void;
  selectAll: () => void;
  selectNone: () => void;
  selectWeek: (weekNumber: number) => void;
  selectByCategory: (category: string) => void;
  enterSelectionMode: () => void;
  exitSelectionMode: () => void;
  hasSelection: boolean;
  selectionCount: number;
}

export function useTemplateBulkSelection({
  sessions
}: UseTemplateBulkSelectionProps): UseTemplateBulkSelectionReturn {
  const [selectedSessionIds, setSelectedSessionIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  // Get selected sessions
  const selectedSessions = useMemo(() => {
    return sessions.filter(s => selectedSessionIds.has(s.id));
  }, [sessions, selectedSessionIds]);

  // Check if session is selected
  const isSelected = useCallback((sessionId: string): boolean => {
    return selectedSessionIds.has(sessionId);
  }, [selectedSessionIds]);

  // Toggle single session selection
  const toggleSelection = useCallback((sessionId: string) => {
    setSelectedSessionIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  }, []);

  // Select all sessions
  const selectAll = useCallback(() => {
    setSelectedSessionIds(new Set(sessions.map(s => s.id)));
  }, [sessions]);

  // Clear selection
  const selectNone = useCallback(() => {
    setSelectedSessionIds(new Set());
  }, []);

  // Select all sessions in a specific week
  const selectWeek = useCallback((weekNumber: number) => {
    const weekSessionIds = sessions
      .filter(s => s.weekNumber === weekNumber)
      .map(s => s.id);
    setSelectedSessionIds(new Set(weekSessionIds));
  }, [sessions]);

  // Select all sessions with a specific category
  const selectByCategory = useCallback((category: string) => {
    const categorySessionIds = sessions
      .filter(s => s.categories.includes(category))
      .map(s => s.id);
    setSelectedSessionIds(new Set(categorySessionIds));
  }, [sessions]);

  // Enter selection mode
  const enterSelectionMode = useCallback(() => {
    setSelectionMode(true);
  }, []);

  // Exit selection mode and clear selection
  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedSessionIds(new Set());
  }, []);

  // Check if there are any selections
  const hasSelection = selectedSessionIds.size > 0;
  const selectionCount = selectedSessionIds.size;

  return {
    selectedSessionIds,
    selectedSessions,
    selectionMode,
    isSelected,
    toggleSelection,
    selectAll,
    selectNone,
    selectWeek,
    selectByCategory,
    enterSelectionMode,
    exitSelectionMode,
    hasSelection,
    selectionCount
  };
}

export default useTemplateBulkSelection;
