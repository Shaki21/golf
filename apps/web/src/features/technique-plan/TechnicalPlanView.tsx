/**
 * TIER Golf - Technical Plan (P-System)
 * Design System v3.0 - Premium Light
 *
 * P1.0 - P10.0 technical development areas with:
 * - Priority ordering (drag-and-drop)
 * - Repetitions tracking
 * - Drills assignment
 * - Responsible person assignment
 * - Status tracking (images, videos, data)
 * - TrackMan integration
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GripVertical,
  Plus,
  Trash2,
  Image,
  Video,
  BarChart3,
  Upload,
  ChevronDown,
  ChevronUp,
  User,
  Target,
  Activity,
  TrendingUp,
} from 'lucide-react';
import DrillSelector from './DrillSelector';
import ResponsiblePersonSelector from './ResponsiblePersonSelector';
import TrackManDataCard from './TrackManDataCard';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Progress,
} from '../../components/shadcn';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';
import { useAuth } from '../../contexts/AuthContext';
import { techniquePlanAPI, TechniqueTask as ApiTechniqueTask } from '../../services/api';

// ============================================================================
// TYPES
// ============================================================================

interface TechnicalTask {
  id: string;
  pLevel: string; // P1.0 - P10.0
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  repetitions: number;
  priorityOrder: number;
  status: 'active' | 'completed' | 'paused';
  drills: Array<{
    id: string;
    exerciseId: string;
    exercise?: {
      id: string;
      name: string;
      description?: string;
      exerciseType?: string;
    };
  }>;
  responsible: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  progressImages: Array<{
    id: string;
    url: string;
    uploadedAt: string;
  }>;
  progressVideos: Array<{
    id: string;
    url: string;
    uploadedAt: string;
  }>;
}

interface TrackManData {
  id: string;
  taskId: string;
  date: string;
  attackAngle: number;
  lowPoint: number;
  swingDirection: number;
  swingPlane: number;
  clubPath: number;
  faceAngle: number;
  faceToPath: number;
  dynamicLoft: number;
  impactLocation: string;
  clubSpeed: number;
  ballSpeed: number;
  rawFileUrl?: string;
}

interface TrackManReference {
  parameter: string;
  targetValue: number;
  tolerance: number;
  currentValue?: number;
  deviation?: number;
}

// ============================================================================
// P-LEVEL DEFINITIONS
// ============================================================================

const P_LEVELS = [
  { id: 'P1.0', label: 'P1.0', description: 'Address position & posture' },
  { id: 'P2.0', label: 'P2.0', description: 'Takeaway' },
  { id: 'P3.0', label: 'P3.0', description: 'Mid-backswing' },
  { id: 'P4.0', label: 'P4.0', description: 'Top of backswing' },
  { id: 'P5.0', label: 'P5.0', description: 'Transition/early downswing' },
  { id: 'P6.0', label: 'P6.0', description: 'Mid-downswing' },
  { id: 'P7.0', label: 'P7.0', description: 'Impact' },
  { id: 'P8.0', label: 'P8.0', description: 'Early follow-through' },
  { id: 'P9.0', label: 'P9.0', description: 'Mid follow-through' },
  { id: 'P10.0', label: 'P10.0', description: 'Finish position' },
];

// TrackMan Clubs
const CLUBS = [
  'Driver',
  '3 Wood',
  '5 Wood',
  '7 Wood',
  '3 Hybrid',
  '4 Hybrid',
  '5 Hybrid',
  '3 Iron',
  '4 Iron',
  '5 Iron',
  '6 Iron',
  '7 Iron',
  '8 Iron',
  '9 Iron',
  'PW',
  'GW',
  'SW',
  'LW',
  'Putter'
];

// TrackMan Parameters
const TRACKMAN_PARAMETERS = [
  { id: 'attackAngle', label: 'Attack Angle', unit: '°', defaultTolerance: 1.0 },
  { id: 'clubPath', label: 'Club Path', unit: '°', defaultTolerance: 2.0 },
  { id: 'faceAngle', label: 'Face Angle', unit: '°', defaultTolerance: 1.5 },
  { id: 'faceToPath', label: 'Face to Path', unit: '°', defaultTolerance: 1.5 },
  { id: 'dynamicLoft', label: 'Dynamic Loft', unit: '°', defaultTolerance: 1.5 },
  { id: 'swingDirection', label: 'Swing Direction', unit: '°', defaultTolerance: 2.0 },
  { id: 'swingPlane', label: 'Swing Plane', unit: '°', defaultTolerance: 2.0 },
  { id: 'lowPoint', label: 'Low Point', unit: 'in', defaultTolerance: 1.0 },
  { id: 'clubSpeed', label: 'Club Speed', unit: ' mph', defaultTolerance: 3 },
  { id: 'ballSpeed', label: 'Ball Speed', unit: ' mph', defaultTolerance: 5 },
  { id: 'smashFactor', label: 'Smash Factor', unit: '', defaultTolerance: 0.05 },
];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface TechnicalTaskCardProps {
  task: TechnicalTask;
  onUpdate: (taskId: string, updates: Partial<TechnicalTask>) => void;
  onDelete: (taskId: string) => void;
  onToggleExpand: (taskId: string) => void;
  onRefresh: () => void;
  isExpanded: boolean;
}

// Sortable wrapper for drag-and-drop
const SortableTaskCard: React.FC<TechnicalTaskCardProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TechnicalTaskCard {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
};

const TechnicalTaskCard: React.FC<TechnicalTaskCardProps & { dragHandleProps?: any }> = ({
  task,
  onUpdate,
  onDelete,
  onToggleExpand,
  onRefresh,
  isExpanded,
  dragHandleProps,
}) => {
  const pLevelInfo = P_LEVELS.find(p => p.id === task.pLevel);

  return (
    <div className="bg-tier-white border border-tier-border-default rounded-lg mb-3 hover:border-tier-navy/30 transition-colors">
      {/* Header - Always visible */}
      <div className="flex items-start gap-3 p-4">
        {/* Drag handle */}
        <div
          className="cursor-move text-tier-text-secondary hover:text-tier-navy mt-1"
          {...dragHandleProps}
        >
          <GripVertical size={20} />
        </div>

        {/* P-Level badge */}
        <div className="flex-shrink-0">
          <Badge className="bg-tier-navy text-white font-semibold text-sm px-3 py-1">
            {task.pLevel}
          </Badge>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <p className="text-base text-tier-navy font-medium">
                {task.description}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm text-tier-text-secondary">
                {task.drills.length} reps
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleExpand(task.id)}
                className="p-1 h-auto"
              >
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </Button>
            </div>
          </div>

          {/* Media preview - Always visible */}
          <div className="flex items-center gap-2 mt-2">
            {task.imageUrl && (
              <div className="flex items-center gap-1 text-xs text-tier-text-secondary">
                <Image size={14} />
                <span>Bilde</span>
              </div>
            )}
            {task.videoUrl && (
              <div className="flex items-center gap-1 text-xs text-tier-text-secondary">
                <Video size={14} />
                <span>Video</span>
              </div>
            )}
            {task.drills.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-tier-text-secondary">
                <Activity size={14} />
                <span>{task.drills.length} drills</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-tier-border-default p-4 space-y-4">
          {/* P-Level selector */}
          <div>
            <label className="block text-xs font-medium text-tier-text-secondary mb-2">
              P-Nivå
            </label>
            <select
              value={task.pLevel}
              onChange={(e) => onUpdate(task.id, { pLevel: e.target.value })}
              className="w-full px-3 py-2 border border-tier-border-default rounded-lg text-sm bg-white"
            >
              {P_LEVELS.map(level => (
                <option key={level.id} value={level.id}>
                  {level.id}
                </option>
              ))}
            </select>
          </div>

          {/* Description edit */}
          <div>
            <label className="block text-xs font-medium text-tier-text-secondary mb-2">
              Beskrivelse
            </label>
            <textarea
              value={task.description}
              onChange={(e) => onUpdate(task.id, { description: e.target.value })}
              className="w-full px-3 py-2 border border-tier-border-default rounded-lg text-sm resize-none"
              rows={3}
            />
          </div>

          {/* Media uploads */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-tier-text-secondary mb-2">
                Bilde
              </label>
              <Button variant="outline" size="sm" className="w-full">
                <Upload size={16} className="mr-2" />
                Last opp bilde
              </Button>
              {task.imageUrl && (
                <div className="mt-2 relative">
                  <img src={task.imageUrl} alt="Task" className="w-full h-32 object-cover rounded" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-tier-text-secondary mb-2">
                Video
              </label>
              <Button variant="outline" size="sm" className="w-full">
                <Upload size={16} className="mr-2" />
                Last opp video
              </Button>
              {task.videoUrl && (
                <div className="mt-2 text-xs text-tier-text-secondary">
                  Video lastet opp
                </div>
              )}
            </div>
          </div>

          {/* Drills */}
          <div>
            <DrillSelector
              taskId={task.id}
              existingDrills={task.drills}
              onDrillAdded={onRefresh}
              onDrillRemoved={onRefresh}
            />
          </div>

          {/* Responsible persons */}
          <div>
            <ResponsiblePersonSelector
              taskId={task.id}
              existingResponsible={task.responsible}
              onPersonAdded={onRefresh}
              onPersonRemoved={onRefresh}
            />
          </div>

          {/* Delete button */}
          <div className="pt-2 border-t border-tier-border-default">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="text-tier-error border-tier-error hover:bg-tier-error hover:text-white"
            >
              <Trash2 size={16} className="mr-2" />
              Delete task
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TechnicalPlanView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TechnicalTask[]>([]);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Tab state is now handled by PageHeader component
  const [trackManData, setTrackManData] = useState<{
    shots: any[];
    referenceValues: any[];
    uploadedAt?: string;
  } | undefined>(undefined);

  // TrackMan references state
  const [referenceValues, setReferenceValues] = useState<Array<{
    id: string;
    club: string;
    parameter: string;
    targetValue: number;
    tolerance: number;
    unit: string;
  }>>([]);
  const [selectedClub, setSelectedClub] = useState('7 Iron');
  const [parameterValues, setParameterValues] = useState<Record<string, { targetValue: number; tolerance: number }>>({});

  // Load saved values or defaults when club changes
  useEffect(() => {
    const values: Record<string, { targetValue: number; tolerance: number }> = {};

    TRACKMAN_PARAMETERS.forEach(param => {
      // Check if there's a saved reference value for this club and parameter
      const savedRef = referenceValues.find(
        ref => ref.club === selectedClub && ref.parameter === param.id
      );

      if (savedRef) {
        // Load saved values
        values[param.id] = {
          targetValue: savedRef.targetValue,
          tolerance: savedRef.tolerance
        };
      } else {
        // Use defaults
        values[param.id] = {
          targetValue: 0,
          tolerance: param.defaultTolerance
        };
      }
    });

    setParameterValues(values);
  }, [selectedClub, referenceValues]);

  // TrackMan sessions state
  const [trackManSessions, setTrackManSessions] = useState<Array<{
    id: string;
    date: string;
    club: string;
    shots: number;
    technicalTask?: string;
  }>>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionFilter, setSessionFilter] = useState({ club: 'all', task: 'all' });

  // Fetch TrackMan sessions from backend
  const fetchTrackManSessions = useCallback(async () => {
    if (!user?.id) return;

    try {
      const playerId = user.playerId || user.id;
      const response = await fetch(`/api/v1/trackman/sessions?playerId=${playerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const sessions = result.data || [];
        setTrackManSessions(sessions.map((s: any) => ({
          id: s.id,
          date: s.date || s.createdAt,
          club: s.club || 'Unknown',
          shots: s.shotsCount || s.shots || 0,
          technicalTask: s.technicalTask || s.pLevel,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch TrackMan sessions:', error);
    }
  }, [user]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch technical tasks from backend - reusable callback
  const fetchTasks = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use the player's ID (for players) or user's ID (for coaches viewing their own tasks)
      const playerId = user.playerId || user.id;

      const response = await techniquePlanAPI.getTasks({
        playerId,
        limit: 100
      });

      // Transform API response to component format
      const apiTasks = response.data.data || [];
      const transformedTasks: TechnicalTask[] = apiTasks.map((apiTask: ApiTechniqueTask) => ({
        id: apiTask.id,
        pLevel: apiTask.pLevel || 'P1.0',
        description: apiTask.description,
        imageUrl: apiTask.imageUrls && apiTask.imageUrls.length > 0 ? apiTask.imageUrls[0] : undefined,
        videoUrl: apiTask.videoUrl,
        repetitions: apiTask.repetitions || 0,
        priorityOrder: apiTask.priorityOrder || 0,
        status: apiTask.status as 'active' | 'completed' | 'paused' || 'active',
        drills: (apiTask.drills || []).map(drill => ({
          id: drill.id,
          exerciseId: drill.exerciseId,
          exercise: drill.exercise ? {
            id: drill.exercise.id,
            name: drill.exercise.name,
            exerciseType: drill.exercise.exerciseType,
          } : undefined,
        })),
        responsible: (apiTask.responsible || []).map(resp => ({
          id: resp.id,
          name: `${resp.user?.firstName || ''} ${resp.user?.lastName || ''}`.trim() || 'Unknown',
          role: resp.role || resp.user?.role || 'Coach',
        })),
        progressImages: (apiTask.imageUrls || []).map((url, index) => ({
          id: `img-${index}`,
          url,
          uploadedAt: apiTask.updatedAt,
        })),
        progressVideos: [],
      }));

      // Valid P-levels
      const validPLevels = ['P1.0', 'P2.0', 'P3.0', 'P4.0', 'P5.0', 'P6.0', 'P7.0', 'P8.0', 'P9.0', 'P10.0'];

      // Filter out duplicates and invalid P-levels - keep only one task per P-level (the one with highest priority order)
      const uniqueTasks: TechnicalTask[] = [];
      const seenPLevels = new Set<string>();

      // Sort by priority order first
      const sortedTasks = [...transformedTasks].sort((a, b) => b.priorityOrder - a.priorityOrder);

      for (const task of sortedTasks) {
        // Only include valid P-levels and no duplicates
        if (validPLevels.includes(task.pLevel) && !seenPLevels.has(task.pLevel)) {
          seenPLevels.add(task.pLevel);
          uniqueTasks.push(task);
        }
      }

      // Sort back by priority order
      uniqueTasks.sort((a, b) => a.priorityOrder - b.priorityOrder);

      setTasks(uniqueTasks);
    } catch (error) {
      console.error('Failed to fetch technical tasks:', error);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch on mount and auto-create P1.0-P10.0 tasks if needed
  useEffect(() => {
    const initializeTasks = async () => {
      await fetchTasks();

      // Check if we have all P-levels (P1.0 - P10.0)
      if (user?.id && tasks.length === 0) {
        const playerId = user.playerId || user.id;

        // Create default P1.0 - P10.0 tasks
        const defaultTasks = P_LEVELS.map((level, index) => ({
          playerId,
          title: `Technical task ${level.id}`,
          description: level.description,
          technicalArea: 'swing',
          pLevel: level.id,
          repetitions: 0,
          priorityOrder: index + 1,
          priority: 'medium' as const,
        }));

        try {
          // Create all default tasks
          for (const taskData of defaultTasks) {
            await techniquePlanAPI.createTask(taskData);
          }

          // Refetch to get the newly created tasks
          await fetchTasks();
        } catch (error) {
          console.error('Failed to create default P-level tasks:', error);
        }
      }
    };

    initializeTasks();
  }, [fetchTasks, user, tasks.length]);

  // Demo: Load TrackMan data (simulate uploaded data)
  useEffect(() => {
    // Simulate TrackMan data with variations
    const demoTrackManData = {
      shots: Array.from({ length: 25 }, (_, i) => ({
        attackAngle: -2.5 + (Math.random() * 4 - 2), // Target: -2.5, range: -4.5 to -0.5
        clubPath: 1.0 + (Math.random() * 6 - 3),      // Target: 1.0, range: -2 to 4
        faceAngle: 0.5 + (Math.random() * 5 - 2.5),   // Target: 0.5, range: -2 to 3
        dynamicLoft: 15.0 + (Math.random() * 4 - 2),  // Target: 15.0, range: 13 to 17
        clubSpeed: 105 + (Math.random() * 10 - 5),    // Target: 105, range: 100 to 110
      })),
      referenceValues: [
        {
          parameter: 'attackAngle',
          parameterLabel: 'Attack Angle',
          targetValue: -2.5,
          tolerance: 1.0,
          unit: '°',
        },
        {
          parameter: 'clubPath',
          parameterLabel: 'Club Path',
          targetValue: 1.0,
          tolerance: 2.0,
          unit: '°',
        },
        {
          parameter: 'faceAngle',
          parameterLabel: 'Face Angle',
          targetValue: 0.5,
          tolerance: 1.5,
          unit: '°',
        },
        {
          parameter: 'dynamicLoft',
          parameterLabel: 'Dynamic Loft',
          targetValue: 15.0,
          tolerance: 1.5,
          unit: '°',
        },
        {
          parameter: 'clubSpeed',
          parameterLabel: 'Club Speed',
          targetValue: 105,
          tolerance: 3,
          unit: ' mph',
        },
      ],
      uploadedAt: new Date().toISOString(),
    };

    // Simulate data being available after component loads
    setTimeout(() => {
      setTrackManData(demoTrackManData);
    }, 1000);

    // Demo: Add some TrackMan sessions
    const demoSessions = [
      {
        id: 'session-1',
        date: new Date(2026, 0, 10).toISOString(),
        club: '7 Iron',
        shots: 25,
        technicalTask: 'P7.0'
      },
      {
        id: 'session-2',
        date: new Date(2026, 0, 8).toISOString(),
        club: 'Driver',
        shots: 30,
        technicalTask: 'P4.0'
      },
      {
        id: 'session-3',
        date: new Date(2026, 0, 5).toISOString(),
        club: 'PW',
        shots: 20,
        technicalTask: 'P7.0'
      },
      {
        id: 'session-4',
        date: new Date(2026, 0, 3).toISOString(),
        club: '7 Iron',
        shots: 28,
        technicalTask: 'P6.0'
      },
      {
        id: 'session-5',
        date: new Date(2025, 11, 28).toISOString(),
        club: '5 Iron',
        shots: 22,
        technicalTask: 'P5.0'
      }
    ];
    setTrackManSessions(demoSessions);
  }, []);

  const handleUpdateTask = async (taskId: string, updates: Partial<TechnicalTask>) => {
    try {
      // Optimistic update
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      ));

      // Update in backend
      await techniquePlanAPI.updateTask(taskId, {
        description: updates.description,
        pLevel: updates.pLevel,
        repetitions: updates.repetitions,
        priorityOrder: updates.priorityOrder,
        status: updates.status as any,
        videoUrl: updates.videoUrl,
      });
    } catch (error) {
      console.error('Failed to update task:', error);
      setError('Failed to update task');
      // Revert optimistic update on error - refetch tasks
      if (user?.id) {
        const playerId = user.playerId || user.id;
        const response = await techniquePlanAPI.getTasks({ playerId });
        const apiTasks = response.data.data || [];
        const transformedTasks: TechnicalTask[] = apiTasks.map((apiTask: ApiTechniqueTask) => ({
          id: apiTask.id,
          pLevel: apiTask.pLevel || 'P1.0',
          description: apiTask.description,
          imageUrl: apiTask.imageUrls && apiTask.imageUrls.length > 0 ? apiTask.imageUrls[0] : undefined,
          videoUrl: apiTask.videoUrl,
          repetitions: apiTask.repetitions || 0,
          priorityOrder: apiTask.priorityOrder || 0,
          status: apiTask.status as any || 'active',
          drills: (apiTask.drills || []).map(drill => ({
            id: drill.id,
            exerciseId: drill.exerciseId,
            exercise: drill.exercise ? {
              id: drill.exercise.id,
              name: drill.exercise.name,
                            exerciseType: drill.exercise.exerciseType,
            } : undefined,
          })),
          responsible: (apiTask.responsible || []).map(resp => ({
            id: resp.id,
            name: `${resp.user?.firstName || ''} ${resp.user?.lastName || ''}`.trim() || 'Unknown',
            role: resp.role || resp.user?.role || 'Coach',
          })),
          progressImages: (apiTask.imageUrls || []).map((url, index) => ({
            id: `img-${index}`,
            url,
            uploadedAt: apiTask.updatedAt,
          })),
          progressVideos: [],
        }));
        setTasks(transformedTasks);
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      // Optimistic update
      setTasks(tasks.filter(task => task.id !== taskId));

      // Delete from backend
      await techniquePlanAPI.deleteTask(taskId);
    } catch (error) {
      console.error('Failed to delete task:', error);
      setError('Failed to delete task');
      // Revert on error - refetch tasks
      if (user?.id) {
        const playerId = user.playerId || user.id;
        const response = await techniquePlanAPI.getTasks({ playerId });
        const apiTasks = response.data.data || [];
        const transformedTasks: TechnicalTask[] = apiTasks.map((apiTask: ApiTechniqueTask) => ({
          id: apiTask.id,
          pLevel: apiTask.pLevel || 'P1.0',
          description: apiTask.description,
          imageUrl: apiTask.imageUrls && apiTask.imageUrls.length > 0 ? apiTask.imageUrls[0] : undefined,
          videoUrl: apiTask.videoUrl,
          repetitions: apiTask.repetitions || 0,
          priorityOrder: apiTask.priorityOrder || 0,
          status: apiTask.status as any || 'active',
          drills: (apiTask.drills || []).map(drill => ({
            id: drill.id,
            exerciseId: drill.exerciseId,
            exercise: drill.exercise ? {
              id: drill.exercise.id,
              name: drill.exercise.name,
                            exerciseType: drill.exercise.exerciseType,
            } : undefined,
          })),
          responsible: (apiTask.responsible || []).map(resp => ({
            id: resp.id,
            name: `${resp.user?.firstName || ''} ${resp.user?.lastName || ''}`.trim() || 'Unknown',
            role: resp.role || resp.user?.role || 'Coach',
          })),
          progressImages: (apiTask.imageUrls || []).map((url, index) => ({
            id: `img-${index}`,
            url,
            uploadedAt: apiTask.updatedAt,
          })),
          progressVideos: [],
        }));
        setTasks(transformedTasks);
      }
    }
  };

  const handleToggleExpand = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex(task => task.id === active.id);
    const newIndex = tasks.findIndex(task => task.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistically update UI
    const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);

    // Update priority orders based on new positions
    const updatedTasks = reorderedTasks.map((task, index) => ({
      ...task,
      priorityOrder: index + 1,
    }));

    setTasks(updatedTasks);

    // Update backend for the moved task
    try {
      await techniquePlanAPI.updateTaskPriority(
        active.id as string,
        newIndex + 1
      );
    } catch (error) {
      console.error('Failed to update task priority:', error);
      // Revert on error by refetching
      fetchTasks();
    }
  };

  const handleAddTask = async () => {
    if (!user?.id) return;

    try {
      const playerId = user.playerId || user.id;

      const newTaskData = {
        playerId,
        title: 'New technical task',
        description: 'Describe the technical task here',
        technicalArea: 'swing',
        pLevel: 'P1.0',
        repetitions: 0,
        priorityOrder: tasks.length + 1,
        priority: 'medium' as const,
      };

      const response = await techniquePlanAPI.createTask(newTaskData);
      const apiTask = response.data.data;

      const newTask: TechnicalTask = {
        id: apiTask.id,
        pLevel: apiTask.pLevel || 'P1.0',
        description: apiTask.description,
        imageUrl: apiTask.imageUrls && apiTask.imageUrls.length > 0 ? apiTask.imageUrls[0] : undefined,
        videoUrl: apiTask.videoUrl,
        repetitions: apiTask.repetitions || 0,
        priorityOrder: apiTask.priorityOrder || 0,
        status: apiTask.status as any || 'active',
        drills: [],
        responsible: [],
        progressImages: [],
        progressVideos: [],
      };

      setTasks([...tasks, newTask]);
      setExpandedTaskId(newTask.id);
    } catch (error) {
      console.error('Failed to create task:', error);
      setError('Failed to create task');
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Technical Plan" subtitle="P-System development areas" />
        <PageContainer paddingY="md" background="base">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tier-navy mx-auto mb-4" />
              <p className="text-tier-text-secondary">Loading technical plan...</p>
            </div>
          </div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Technical Plan"
        subtitle="P1.0 - P10.0 development areas"
        tabs={{
          items: [
            {
              id: 'tasks',
              label: 'TASKS',
              content: (
                <PageContainer paddingY="md" background="base">
            <div className="p-6 space-y-6 bg-white">
              {/* TrackMan Data Card - Full width at top */}
              <TrackManDataCard trackManData={trackManData} />

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <SectionTitle style={{ marginBottom: 0 }}>Development Areas</SectionTitle>
                  <p className="text-sm text-tier-text-secondary mt-1">
                    P-levels in priority order (drag to change priority)
                  </p>
                </div>
                <Button
                  onClick={handleAddTask}
                  className="bg-status-success hover:bg-status-success/90 text-white"
                >
                  <Plus size={18} className="mr-2" />
                  New task
                </Button>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-tier-navy/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-tier-navy" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-tier-navy">{tasks.length}</p>
                        <p className="text-xs text-tier-text-secondary">Active areas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-status-success/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-status-success" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-tier-navy">
                          {tasks.reduce((sum, t) => sum + t.drills.length, 0)}
                        </p>
                        <p className="text-xs text-tier-text-secondary">Total drills</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-tier-gold/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-tier-gold" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-tier-navy">
                          {tasks.reduce((sum, t) => sum + t.drills.length, 0)}
                        </p>
                        <p className="text-xs text-tier-text-secondary">Total reps</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tasks list - Full width */}
              <div>
                {tasks.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Target className="w-16 h-16 text-tier-text-tertiary mx-auto mb-4" />
                      <SubSectionTitle style={{ marginBottom: '0.5rem' }}>
                        No tasks yet
                      </SubSectionTitle>
                      <p className="text-sm text-tier-text-secondary mb-4">
                        Create your first technical task by clicking the button above
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={tasks.map(t => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {tasks
                        .sort((a, b) => a.priorityOrder - b.priorityOrder)
                        .map(task => (
                          <SortableTaskCard
                            key={task.id}
                            task={task}
                            onUpdate={handleUpdateTask}
                            onDelete={handleDeleteTask}
                            onToggleExpand={handleToggleExpand}
                            onRefresh={fetchTasks}
                            isExpanded={expandedTaskId === task.id}
                          />
                        ))}
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>
                </PageContainer>
              ),
            },
            {
              id: 'status',
              label: 'STATUS',
              content: (
                <PageContainer paddingY="md" background="base">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Status & Progresjon</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-tier-text-secondary mb-4">
                          Last opp bilder og videoer for å dokumentere din tekniske progresjon
                        </p>
                        {/* Placeholder for status tracking UI */}
                        <div className="text-center py-8">
                          <p className="text-tier-text-tertiary">Status tracking kommer snart</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </PageContainer>
              ),
            },
            {
              id: 'trackman',
              label: 'TRACKMAN',
              content: (
                <PageContainer paddingY="md" background="base">
            <div className="p-6 space-y-6 bg-white">
              {/* Import TrackMan File */}
              <Card>
                <CardContent className="p-4">
                  <input
                    type="file"
                    accept=".csv,.json"
                    id="trackman-file-upload"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const formData = new FormData();
                      formData.append('file', file);
                      formData.append('playerId', user?.playerId || user?.id || '');
                      formData.append('club', selectedClub);

                      try {
                        setLoading(true);
                        const response = await fetch('/api/v1/trackman/import', {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                          },
                          body: formData,
                        });

                        if (!response.ok) {
                          throw new Error('Import failed');
                        }

                        const result = await response.json();
                        alert(`TrackMan fil importert! ${result.data.shotsCount} svinger analysert.`);

                        // Refresh sessions list from backend
                        await fetchTrackManSessions();
                      } catch (error) {
                        console.error('TrackMan import error:', error);
                        alert('Kunne ikke importere TrackMan fil. Prøv igjen.');
                      } finally {
                        setLoading(false);
                        e.target.value = ''; // Reset file input
                      }
                    }}
                  />
                  <label htmlFor="trackman-file-upload" className="cursor-pointer">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('trackman-file-upload')?.click();
                      }}
                    >
                      <Upload size={18} className="mr-2" />
                      Importer TrackMan fil
                    </Button>
                  </label>
                  <p className="text-xs text-tier-text-secondary text-center mt-2">
                    Last opp TrackMan CSV/JSON fil for AI-analyse
                  </p>
                  <p className="text-xs text-tier-text-tertiary text-center mt-1">
                    Støtter: .csv, .json | Valgt kølle: <span className="font-semibold">{selectedClub}</span>
                  </p>
                </CardContent>
              </Card>

              {/* Reference Values Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Referanseverdier</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Club Selection */}
                  <div>
                    <label className="block text-sm font-medium text-tier-navy mb-2">
                      Kølle
                    </label>
                    <select
                      value={selectedClub}
                      onChange={(e) => setSelectedClub(e.target.value)}
                      className="w-full px-4 py-2 border border-tier-border-default rounded-lg text-sm bg-white focus:ring-2 focus:ring-tier-navy focus:border-transparent"
                    >
                      {CLUBS.map(club => (
                        <option key={club} value={club}>{club}</option>
                      ))}
                    </select>
                  </div>

                  {/* All Parameters Listed */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-tier-text-secondary uppercase tracking-wide">
                      TrackMan Parameters
                    </p>
                    {TRACKMAN_PARAMETERS.map(param => (
                      <div key={param.id} className="grid grid-cols-[2fr_1fr_1fr] gap-3 items-center p-3 border border-tier-border-default rounded-lg bg-tier-surface-base hover:bg-white transition-colors">
                        <div>
                          <label className="text-sm font-medium text-tier-navy">
                            {param.label}
                          </label>
                          <p className="text-xs text-tier-text-tertiary">
                            Unit: {param.unit || 'none'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs text-tier-text-secondary mb-1">
                            Target value
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={parameterValues[param.id]?.targetValue ?? 0}
                            onChange={(e) => setParameterValues({
                              ...parameterValues,
                              [param.id]: {
                                ...parameterValues[param.id],
                                targetValue: parseFloat(e.target.value) || 0
                              }
                            })}
                            className="w-full px-3 py-2 border border-tier-border-default rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-tier-text-secondary mb-1">
                            Tolerance (±)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={parameterValues[param.id]?.tolerance ?? param.defaultTolerance}
                            onChange={(e) => setParameterValues({
                              ...parameterValues,
                              [param.id]: {
                                ...parameterValues[param.id],
                                tolerance: parseFloat(e.target.value) || param.defaultTolerance
                              }
                            })}
                            className="w-full px-3 py-2 border border-tier-border-default rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={async () => {
                        try {
                          setLoading(true);

                          // Prepare parameters array for API
                          const parameters = TRACKMAN_PARAMETERS.map(param => ({
                            parameter: param.id,
                            targetValue: parameterValues[param.id]?.targetValue ?? 0,
                            tolerance: parameterValues[param.id]?.tolerance ?? param.defaultTolerance,
                            unit: param.unit
                          }));

                          // Save to backend
                          const response = await fetch('/api/v1/trackman/reference-values', {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${localStorage.getItem('token')}`,
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              playerId: user?.playerId || user?.id,
                              club: selectedClub,
                              parameters,
                            }),
                          });

                          if (!response.ok) {
                            throw new Error('Failed to save reference values');
                          }

                          // Update local state
                          const newRefs = parameters.map(param => ({
                            id: `ref-${selectedClub}-${param.parameter}-${Date.now()}`,
                            club: selectedClub,
                            parameter: param.parameter,
                            targetValue: param.targetValue,
                            tolerance: param.tolerance,
                            unit: param.unit
                          }));

                          const filteredRefs = referenceValues.filter(ref => ref.club !== selectedClub);
                          setReferenceValues([...filteredRefs, ...newRefs]);

                          alert(`Reference values for ${selectedClub} saved!`);
                        } catch (error) {
                          console.error('Failed to save reference values:', error);
                          alert('Could not save reference values. Please try again.');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="bg-status-success hover:bg-status-success/90 text-white"
                    >
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Sessions History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent TrackMan sessions</CardTitle>
                  <p className="text-xs text-tier-text-secondary mt-1">
                    Click on a session to see details
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trackManSessions.length === 0 ? (
                    <div className="text-center py-6">
                      <BarChart3 className="w-12 h-12 text-tier-text-tertiary mx-auto mb-2" />
                      <p className="text-sm text-tier-text-secondary">
                        No TrackMan sessions imported yet
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Last 5 Sessions Overview */}
                      <div className="grid grid-cols-1 gap-2">
                        {trackManSessions.slice(0, 5).map((session) => (
                          <button
                            key={session.id}
                            onClick={() => setSelectedSession(selectedSession === session.id ? null : session.id)}
                            className={`flex items-center justify-between p-3 border rounded-lg text-left transition-all ${
                              selectedSession === session.id
                                ? 'border-tier-navy bg-tier-navy/5'
                                : 'border-tier-border-default hover:border-tier-navy/30 hover:bg-tier-surface-base'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                selectedSession === session.id
                                  ? 'bg-tier-navy text-white'
                                  : 'bg-tier-surface-base text-tier-navy'
                              }`}>
                                <BarChart3 size={20} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-tier-navy">
                                  {new Date(session.date).toLocaleDateString('en-US', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </p>
                                <p className="text-xs text-tier-text-secondary">
                                  {session.club} • {session.shots} swings
                                  {session.technicalTask && ` • ${session.technicalTask}`}
                                </p>
                              </div>
                            </div>
                            {selectedSession === session.id ? (
                              <ChevronUp size={18} className="text-tier-navy" />
                            ) : (
                              <ChevronDown size={18} className="text-tier-text-secondary" />
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Session Details with Filters */}
                      {selectedSession && (
                        <div className="mt-4 p-4 border border-tier-border-default rounded-lg bg-tier-surface-base space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-tier-navy">Økt detaljer</h4>
                          </div>

                          {/* Filters */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-tier-text-secondary mb-1">
                                Filtrer på kølle
                              </label>
                              <select
                                value={sessionFilter.club}
                                onChange={(e) => setSessionFilter({ ...sessionFilter, club: e.target.value })}
                                className="w-full px-3 py-2 border border-tier-border-default rounded-lg text-sm bg-white"
                              >
                                <option value="all">All clubs</option>
                                {CLUBS.map(club => (
                                  <option key={club} value={club}>{club}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-tier-text-secondary mb-1">
                                Filter by task
                              </label>
                              <select
                                value={sessionFilter.task}
                                onChange={(e) => setSessionFilter({ ...sessionFilter, task: e.target.value })}
                                className="w-full px-3 py-2 border border-tier-border-default rounded-lg text-sm bg-white"
                              >
                                <option value="all">All tasks</option>
                                {tasks.map(task => (
                                  <option key={task.id} value={task.pLevel}>
                                    {task.pLevel} - {task.description.substring(0, 30)}...
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Filtered Results */}
                          <div className="text-center py-4">
                            <p className="text-xs text-tier-text-tertiary">
                              Showing sessions filtered by: {sessionFilter.club !== 'all' ? sessionFilter.club : 'all clubs'}
                              {sessionFilter.task !== 'all' && ` and ${sessionFilter.task}`}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
                </PageContainer>
              ),
            },
          ],
          defaultTab: 'tasks',
        }}
      />
    </>
  );
}
