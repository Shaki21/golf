/**
 * useTemplateApplication Hook
 * Handle applying training plan templates to athletes
 */

import { useState } from 'react';
import apiClient from '../../../services/apiClient';
import {
  TrainingPlanTemplate,
  TemplateApplicationOptions,
  TemplateApplicationResult
} from '../types/template.types';

interface ConflictInfo {
  date: string;
  existingSession: string;
  templateSession: string;
}

/**
 * Hook for applying templates to athletes
 */
export function useTemplateApplication() {
  const [isApplying, setIsApplying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentAthlete, setCurrentAthlete] = useState<string | null>(null);

  /**
   * Calculate session dates from template
   */
  const calculateSessionDate = (
    startDate: string,
    weekNumber: number,
    dayOfWeek: number,
    skipWeekends: boolean = false
  ): string => {
    const start = new Date(startDate);

    // Calculate days to add: (weekNumber - 1) * 7 + dayOfWeek
    let daysToAdd = (weekNumber - 1) * 7 + dayOfWeek;

    const sessionDate = new Date(start);
    sessionDate.setDate(start.getDate() + daysToAdd);

    // Skip weekends if requested
    if (skipWeekends) {
      const dayOfWeekNum = sessionDate.getDay();
      if (dayOfWeekNum === 0) { // Sunday
        sessionDate.setDate(sessionDate.getDate() + 1); // Move to Monday
      } else if (dayOfWeekNum === 6) { // Saturday
        sessionDate.setDate(sessionDate.getDate() + 2); // Move to Monday
      }
    }

    return sessionDate.toISOString().split('T')[0];
  };

  /**
   * Check for conflicts with existing sessions
   */
  const checkConflicts = async (
    athleteId: string,
    sessionDates: string[]
  ): Promise<ConflictInfo[]> => {
    try {
      const response = await apiClient.get<{ data: Array<{ date: string; name: string }> }>(
        `/athletes/${athleteId}/sessions`,
        { params: { dates: sessionDates.join(',') } }
      );

      const existingSessions = response.data?.data || [];
      const conflicts: ConflictInfo[] = existingSessions
        .filter(session => sessionDates.includes(session.date))
        .map(session => ({
          date: session.date,
          existingSession: session.name,
          templateSession: '', // Will be populated by caller
        }));

      return conflicts;
    } catch (error) {
      console.error('Failed to check conflicts:', error);
      return [];
    }
  };

  /**
   * Create training block for athlete
   */
  const createTrainingBlock = async (
    athleteId: string,
    session: {
      name: string;
      description?: string;
      date: string;
      durationMinutes: number;
      categories: string[];
      phase?: string;
      environment?: string;
      cognitiveSkillsLevel?: string;
      pressureLevel?: string;
      notes?: string;
    }
  ): Promise<boolean> => {
    try {
      await apiClient.post(`/athletes/${athleteId}/training-blocks`, {
        title: session.name,
        description: session.description,
        scheduledDate: session.date,
        durationMinutes: session.durationMinutes,
        categories: session.categories,
        phase: session.phase,
        environment: session.environment,
        cognitiveSkillsLevel: session.cognitiveSkillsLevel,
        pressureLevel: session.pressureLevel,
        notes: session.notes,
      });

      return true;
    } catch (error) {
      console.error('Failed to create training block:', error);
      return false;
    }
  };

  /**
   * Apply template to multiple athletes
   */
  const applyTemplate = async (
    template: TrainingPlanTemplate,
    options: TemplateApplicationOptions
  ): Promise<TemplateApplicationResult> => {
    setIsApplying(true);
    setProgress(0);

    const result: TemplateApplicationResult = {
      success: true,
      sessionsCreated: 0,
      conflictsFound: 0,
      athleteResults: [],
    };

    try {
      const totalSteps = options.athleteIds.length * template.sessions.length;
      let completedSteps = 0;

      // Process each athlete
      for (const athleteId of options.athleteIds) {
        setCurrentAthlete(athleteId);

        // Fetch athlete name for result tracking
        let athleteName = athleteId;
        try {
          const athleteResponse = await apiClient.get<{ data: { firstName?: string; lastName?: string } }>(
            `/athletes/${athleteId}`
          );
          const athlete = athleteResponse.data?.data;
          if (athlete) {
            athleteName = [athlete.firstName, athlete.lastName].filter(Boolean).join(' ') || athleteId;
          }
        } catch {
          // Continue with athleteId as fallback name
        }

        const athleteResult = {
          athleteId,
          athleteName,
          sessionsCreated: 0,
          conflicts: [] as ConflictInfo[],
        };

        // Calculate all session dates for this athlete
        const sessionDates = template.sessions.map(session =>
          calculateSessionDate(
            options.startDate,
            session.weekNumber,
            session.dayOfWeek,
            options.skipWeekends
          )
        );

        // Check for conflicts if requested
        if (options.adjustForExistingSessions) {
          const conflicts = await checkConflicts(athleteId, sessionDates);
          athleteResult.conflicts = conflicts;
          result.conflictsFound = (result.conflictsFound || 0) + conflicts.length;
        }

        // Create training blocks for each session
        for (let i = 0; i < template.sessions.length; i++) {
          const session = template.sessions[i];
          const sessionDate = sessionDates[i];

          // Skip if there's a conflict and we're not overwriting
          const hasConflict = athleteResult.conflicts.some(c => c.date === sessionDate);
          if (hasConflict && options.adjustForExistingSessions) {
            completedSteps++;
            setProgress((completedSteps / totalSteps) * 100);
            continue;
          }

          // Create the training block
          const success = await createTrainingBlock(athleteId, {
            name: session.name,
            description: session.description,
            date: sessionDate,
            durationMinutes: session.durationMinutes,
            categories: session.categories,
            phase: session.phase,
            environment: session.environment,
            cognitiveSkillsLevel: session.cognitiveSkillsLevel,
            pressureLevel: session.pressureLevel,
            notes: session.notes,
          });

          if (success) {
            athleteResult.sessionsCreated++;
            result.sessionsCreated++;
          }

          completedSteps++;
          setProgress((completedSteps / totalSteps) * 100);
        }

        result.athleteResults.push(athleteResult);
      }

      result.success = result.sessionsCreated > 0;
    } catch (error) {
      console.error('Failed to apply template:', error);
      result.success = false;
      result.errors = [error instanceof Error ? error.message : 'Unknown error'];
    } finally {
      setIsApplying(false);
      setProgress(100);
      setCurrentAthlete(null);
    }

    return result;
  };

  return {
    applyTemplate,
    isApplying,
    progress,
    currentAthlete,
  };
}

export default useTemplateApplication;
