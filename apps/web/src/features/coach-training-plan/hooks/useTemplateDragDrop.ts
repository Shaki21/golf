/**
 * useTemplateDragDrop Hook
 * Manages drag-and-drop functionality for template calendar sessions
 */

import { useState, useMemo } from 'react';
import {
  DndContext,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { TemplateSession } from '../types/template.types';

interface UseTemplateDragDropProps {
  sessions: TemplateSession[];
  currentWeek: number;
  onMoveSession: (sessionId: string, newWeek: number, newDay: number) => void;
}

interface UseTemplateDragDropReturn {
  sensors: ReturnType<typeof useSensors>;
  activeSession: TemplateSession | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  collisionDetection: typeof closestCenter;
}

export function useTemplateDragDrop({
  sessions,
  currentWeek,
  onMoveSession
}: UseTemplateDragDropProps): UseTemplateDragDropReturn {
  // Track currently dragged session
  const [activeSession, setActiveSession] = useState<TemplateSession | null>(null);

  // Configure sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5 // 5px movement required to start drag
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const session = sessions.find(s => s.id === active.id);

    if (session) {
      setActiveSession(session);
    }
  };

  // Handle drag over (for visual feedback)
  const handleDragOver = (event: DragOverEvent) => {
    // This can be used for hover effects on drop zones
    // Currently just logging for debugging
    const { over } = event;
    if (over) {
      // Drop zone is being hovered
      // console.log('Hovering over:', over.id);
    }
  };

  // Handle drag end (perform the move)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveSession(null);

    if (!over) {
      // Dropped outside valid drop zone
      return;
    }

    // Parse drop zone ID (format: "day-{weekNumber}-{dayOfWeek}")
    const overIdParts = String(over.id).split('-');

    if (overIdParts[0] === 'day' && overIdParts.length === 3) {
      const newWeek = parseInt(overIdParts[1], 10);
      const newDay = parseInt(overIdParts[2], 10);

      // Check if it's actually moving to a different position
      const session = sessions.find(s => s.id === active.id);
      if (session && (session.weekNumber !== newWeek || session.dayOfWeek !== newDay)) {
        onMoveSession(String(active.id), newWeek, newDay);
      }
    }
  };

  return {
    sensors,
    activeSession,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    collisionDetection: closestCenter
  };
}

export default useTemplateDragDrop;
