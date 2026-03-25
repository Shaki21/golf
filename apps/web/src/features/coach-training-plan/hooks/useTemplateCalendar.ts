/**
 * useTemplateCalendar Hook
 * Manages calendar state for training plan templates
 */

import { useState, useMemo, useCallback } from 'react';
import { addWeeks, startOfWeek, addDays, format } from 'date-fns';
import {
  TrainingPlanTemplate,
  TemplateSession
} from '../types/template.types';

interface UseTemplateCalendarProps {
  template: TrainingPlanTemplate;
  startDate?: string; // ISO date string (YYYY-MM-DD)
}

interface UseTemplateCalendarReturn {
  currentWeek: number;
  weekDates: Date[];
  weekSessions: TemplateSession[];
  goToNextWeek: () => void;
  goToPrevWeek: () => void;
  goToWeek: (weekNumber: number) => void;
  updateSession: (sessionId: string, updates: Partial<TemplateSession>) => void;
  moveSession: (sessionId: string, newWeekNumber: number, newDayOfWeek: number) => void;
  modifiedSessions: Map<string, TemplateSession>;
  hasModifications: boolean;
  resetModifications: () => void;
  getAllSessions: () => TemplateSession[];
}

export function useTemplateCalendar({
  template,
  startDate
}: UseTemplateCalendarProps): UseTemplateCalendarReturn {
  // Current week (1-based index)
  const [currentWeek, setCurrentWeek] = useState(1);

  // Track modified sessions (sessionId -> modified session)
  const [modifiedSessions, setModifiedSessions] = useState<Map<string, TemplateSession>>(
    new Map()
  );

  // Calculate base start date (defaults to next Monday)
  const baseStartDate = useMemo(() => {
    if (startDate) {
      return new Date(startDate);
    }
    // Default to next Monday
    const today = new Date();
    const nextMonday = startOfWeek(addDays(today, 7), { weekStartsOn: 1 });
    return nextMonday;
  }, [startDate]);

  // Calculate dates for current week
  const weekDates = useMemo(() => {
    // Calculate start of current week (week 1 = baseStartDate, week 2 = baseStartDate + 7 days, etc.)
    const weekStart = addWeeks(baseStartDate, currentWeek - 1);

    // Generate 7 dates (Monday to Sunday)
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [baseStartDate, currentWeek]);

  // Get all sessions (original + modifications)
  const getAllSessions = useCallback((): TemplateSession[] => {
    return template.sessions.map(session => {
      const modified = modifiedSessions.get(session.id);
      return modified || session;
    });
  }, [template.sessions, modifiedSessions]);

  // Filter sessions for current week
  const weekSessions = useMemo(() => {
    const allSessions = getAllSessions();
    return allSessions.filter(session => session.weekNumber === currentWeek);
  }, [currentWeek, getAllSessions]);

  // Navigation functions
  const goToNextWeek = useCallback(() => {
    if (currentWeek < template.durationWeeks) {
      setCurrentWeek(prev => prev + 1);
    }
  }, [currentWeek, template.durationWeeks]);

  const goToPrevWeek = useCallback(() => {
    if (currentWeek > 1) {
      setCurrentWeek(prev => prev - 1);
    }
  }, [currentWeek]);

  const goToWeek = useCallback((weekNumber: number) => {
    if (weekNumber >= 1 && weekNumber <= template.durationWeeks) {
      setCurrentWeek(weekNumber);
    }
  }, [template.durationWeeks]);

  // Update session properties
  const updateSession = useCallback((sessionId: string, updates: Partial<TemplateSession>) => {
    setModifiedSessions(prev => {
      const newMap = new Map(prev);
      const originalSession = template.sessions.find(s => s.id === sessionId);
      const currentSession = prev.get(sessionId) || originalSession;

      if (!currentSession) {
        console.warn(`Session ${sessionId} not found`);
        return prev;
      }

      // Merge updates with current session
      const updatedSession = {
        ...currentSession,
        ...updates,
        id: sessionId // Ensure ID doesn't change
      };

      newMap.set(sessionId, updatedSession);
      return newMap;
    });
  }, [template.sessions]);

  // Move session to different week/day
  const moveSession = useCallback((
    sessionId: string,
    newWeekNumber: number,
    newDayOfWeek: number
  ) => {
    // Validate new position
    if (newWeekNumber < 1 || newWeekNumber > template.durationWeeks) {
      console.warn(`Week ${newWeekNumber} is outside valid range (1-${template.durationWeeks})`);
      return;
    }

    if (newDayOfWeek < 0 || newDayOfWeek > 6) {
      console.warn(`Day ${newDayOfWeek} is outside valid range (0-6)`);
      return;
    }

    updateSession(sessionId, {
      weekNumber: newWeekNumber,
      dayOfWeek: newDayOfWeek
    });
  }, [template.durationWeeks, updateSession]);

  // Check if there are modifications
  const hasModifications = useMemo(() => {
    return modifiedSessions.size > 0;
  }, [modifiedSessions]);

  // Reset all modifications
  const resetModifications = useCallback(() => {
    setModifiedSessions(new Map());
  }, []);

  return {
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
  };
}

export default useTemplateCalendar;
