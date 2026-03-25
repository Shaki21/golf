/**
 * PlayerSessionDetail - Full session detail page with exercises
 * Shows complete session information, exercises, and completion tracking
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  Clock,
  Target,
  Dumbbell,
  PlayCircle,
  ChevronRight,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Card } from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';
import { Badge } from '../../components/shadcn/badge';
import Modal from '../../ui/composites/Modal.composite';
import { sessionsAPI, trainingPlanAPI } from '../../services/api';

// Mock session data - will be replaced with API
interface SessionExercise {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: { min: number; max: number };
  difficulty: number;
  equipment?: string[];
  instructions?: string[];
  videoUrl?: string;
}

interface SessionDetail {
  id: string;
  name: string;
  description: string;
  weekNumber: number;
  dayOfWeek: number;
  durationMinutes: number;
  categories: string[];
  phase?: string;
  environment?: string;
  cognitiveSkillsLevel?: string;
  pressureLevel?: string;
  notes?: string;
  exercises: SessionExercise[];
  completed: boolean;
}

// Mock data
const MOCK_SESSION: SessionDetail = {
  id: 'session-3',
  name: 'Transition & Downswing',
  description: 'Learn efficient transition and downswing mechanics. Focus on proper sequencing and tempo.',
  weekNumber: 2,
  dayOfWeek: 1,
  durationMinutes: 90,
  categories: ['TEE'],
  phase: 'L2',
  environment: 'C2',
  cognitiveSkillsLevel: 'CS2',
  pressureLevel: 'PR1',
  notes: 'Focus on smooth transition. Video yourself for feedback.',
  completed: false,
  exercises: [
    {
      id: 'ex-1',
      name: 'Transition Drill - Step by Step',
      description: 'Practice the transition from backswing to downswing with deliberate tempo',
      category: 'TEE',
      duration: { min: 15, max: 20 },
      difficulty: 2,
      equipment: ['Driver', 'Range balls'],
      instructions: [
        'Start with 50% swing speed',
        'Feel the weight shift from right to left',
        'Pause at the top of backswing',
        'Initiate downswing with lower body',
        'Let arms follow naturally'
      ],
    },
    {
      id: 'ex-2',
      name: 'Lag Retention Exercise',
      description: 'Maintain the angle between club and arms in downswing',
      category: 'TEE',
      duration: { min: 20, max: 25 },
      difficulty: 3,
      equipment: ['7-iron', 'Impact bag'],
      instructions: [
        'Start with half swings',
        'Feel the lag in transition',
        'Hit into impact bag',
        'Gradually increase speed',
        'Maintain wrist angle'
      ],
    },
    {
      id: 'ex-3',
      name: 'Full Swing Integration',
      description: 'Apply transition mechanics to full swings',
      category: 'TEE',
      duration: { min: 25, max: 30 },
      difficulty: 3,
      equipment: ['Driver', 'TrackMan (optional)'],
      instructions: [
        'Start with practice swings',
        'Focus on smooth transition',
        'Hit 10 shots with driver',
        'Check ball flight consistency',
        'Record data if available'
      ],
    },
  ],
};

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CATEGORY_COLORS: Record<string, string> = {
  TEE: 'bg-tier-gold/20 text-tier-gold border-tier-gold',
  APP: 'bg-tier-navy/20 text-tier-navy border-tier-navy',
  SGR: 'bg-tier-success/20 text-tier-success border-tier-success',
  PGR: 'bg-tier-accent/20 text-tier-accent border-tier-accent',
  GBR: 'bg-tier-warning/20 text-tier-warning border-tier-warning',
};

export function PlayerSessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [completed, setCompleted] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<SessionExercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch session data on mount
  const fetchSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Try to fetch from sessions API first
      const response = await sessionsAPI.getById(sessionId);
      const sessionData = response.data?.data as any;

      if (sessionData) {
        // Map API response to our interface
        const mappedSession: SessionDetail = {
          id: sessionData.id,
          name: sessionData.sessionType || sessionData.name || 'Training Session',
          description: sessionData.description || sessionData.notes || '',
          weekNumber: sessionData.weekNumber || 1,
          dayOfWeek: sessionData.dayOfWeek || new Date(sessionData.sessionDate).getDay() || 1,
          durationMinutes: sessionData.duration || 60,
          categories: sessionData.categories || [sessionData.sessionType || 'TEE'],
          phase: sessionData.phase,
          environment: sessionData.environment,
          cognitiveSkillsLevel: sessionData.cognitiveSkillsLevel,
          pressureLevel: sessionData.pressureLevel,
          notes: sessionData.notes || sessionData.coachNotes,
          exercises: sessionData.exercises || [],
          completed: sessionData.status === 'completed' || !!sessionData.completedAt,
        };

        setSession(mappedSession);
        setCompleted(mappedSession.completed);
      } else {
        // Fallback to mock data for demo
        setSession(MOCK_SESSION);
        setCompleted(MOCK_SESSION.completed);
      }
    } catch (err: any) {
      console.error('Failed to fetch session:', err);
      // Use mock data as fallback for demo
      setSession(MOCK_SESSION);
      setCompleted(MOCK_SESSION.completed);
      setError('Using offline data - changes may not be saved');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const handleToggleComplete = async () => {
    if (!sessionId || isUpdating) return;

    const newCompleted = !completed;
    setIsUpdating(true);

    try {
      if (newCompleted) {
        // Mark session as complete using the completion API
        await sessionsAPI.complete(sessionId, {
          notes: 'Completed by player',
        });
      } else {
        // Mark session as incomplete by updating status
        await sessionsAPI.update(sessionId, {
          status: 'scheduled',
        } as any);
      }

      setCompleted(newCompleted);

      // Update local session state
      if (session) {
        setSession({ ...session, completed: newCompleted });
      }
    } catch (err: any) {
      console.error('Failed to update session completion:', err);
      // Optimistic update still works - show success for demo
      setCompleted(newCompleted);
      if (session) {
        setSession({ ...session, completed: newCompleted });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBack = () => {
    navigate('/trening/plan');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-tier-navy" size={32} />
          <p className="text-tier-navy/60">Loading session...</p>
        </div>
      </div>
    );
  }

  // No session found
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-tier-warning" size={32} />
          <p className="text-tier-navy/60">Session not found</p>
          <Button variant="ghost" onClick={handleBack} className="mt-4">
            Go back to plan
          </Button>
        </div>
      </div>
    );
  }

  const categoryColorClass = CATEGORY_COLORS[session.categories[0]] || CATEGORY_COLORS.APP;

  return (
    <div className="space-y-6">
      {/* Error banner (non-blocking) */}
      {error && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Plan
          </Button>
        </div>

        <Button
          variant={completed ? 'secondary' : 'primary'}
          onClick={handleToggleComplete}
          disabled={isUpdating}
          className="flex items-center gap-2"
        >
          {isUpdating ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Updating...
            </>
          ) : completed ? (
            <>
              <CheckCircle size={18} />
              Completed
            </>
          ) : (
            <>
              <Circle size={18} />
              Mark Complete
            </>
          )}
        </Button>
      </div>

      {/* Session Overview */}
      <Card className={`p-6 border-l-4 ${completed ? 'opacity-75 bg-tier-success/5' : ''} border-l-tier-gold`}>
        <div className="space-y-4">
          {/* Title */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="default">
                Week {session.weekNumber}
              </Badge>
              <span className="text-sm text-tier-navy/60">
                {DAY_NAMES[session.dayOfWeek - 1]}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-tier-navy mb-2">
              {session.name}
            </h1>
            <p className="text-tier-navy/70">
              {session.description}
            </p>
          </div>

          {/* Session Meta */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 text-sm text-tier-navy/70">
              <Clock size={16} />
              <span>{session.durationMinutes} minutes</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-tier-navy/70">
              <Dumbbell size={16} />
              <span>{session.exercises.length} exercises</span>
            </div>
          </div>

          {/* Categories and Levels */}
          <div className="flex flex-wrap gap-2">
            {session.categories.map(cat => (
              <span key={cat} className={`px-3 py-1 text-sm font-medium rounded border ${categoryColorClass}`}>
                {cat}
              </span>
            ))}
            {session.phase && (
              <Badge variant="secondary">{session.phase}</Badge>
            )}
            {session.environment && (
              <Badge variant="secondary">{session.environment}</Badge>
            )}
            {session.cognitiveSkillsLevel && (
              <Badge variant="outline">{session.cognitiveSkillsLevel}</Badge>
            )}
            {session.pressureLevel && (
              <Badge variant="outline">{session.pressureLevel}</Badge>
            )}
          </div>

          {/* Coach Notes */}
          {session.notes && (
            <div className="p-4 bg-tier-gold/10 rounded-lg border border-tier-gold/20">
              <h3 className="text-sm font-semibold text-tier-navy mb-2">Coach Notes</h3>
              <p className="text-sm text-tier-navy/70">{session.notes}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Exercises */}
      <div>
        <h2 className="text-lg font-semibold text-tier-navy mb-4 flex items-center gap-2">
          <Target size={20} />
          Exercises ({session.exercises.length})
        </h2>

        <div className="space-y-4">
          {session.exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={index}
              onViewDetails={() => setSelectedExercise(exercise)}
            />
          ))}
        </div>
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
}

// Exercise Card Component
interface ExerciseCardProps {
  exercise: SessionExercise;
  index: number;
  onViewDetails: () => void;
}

function ExerciseCard({ exercise, index, onViewDetails }: ExerciseCardProps) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onViewDetails}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Number badge */}
          <div className="flex items-start gap-3 mb-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-tier-navy/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-tier-navy">{index + 1}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-tier-navy mb-1">
                {exercise.name}
              </h3>
              <p className="text-sm text-tier-navy/70 mb-3">
                {exercise.description}
              </p>
            </div>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-3 ml-11">
            <Badge variant="secondary" className="text-xs">
              {exercise.duration.min}-{exercise.duration.max} min
            </Badge>
            <Badge variant="outline" className="text-xs">
              Level {exercise.difficulty}
            </Badge>
            {exercise.equipment && exercise.equipment.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {exercise.equipment.join(', ')}
              </Badge>
            )}
            {exercise.videoUrl && (
              <Badge variant="default" className="text-xs flex items-center gap-1">
                <PlayCircle size={12} />
                Video
              </Badge>
            )}
          </div>
        </div>

        <ChevronRight className="text-tier-navy/40 flex-shrink-0" size={20} />
      </div>
    </Card>
  );
}

// Exercise Detail Modal
interface ExerciseDetailModalProps {
  exercise: SessionExercise;
  onClose: () => void;
}

function ExerciseDetailModal({ exercise, onClose }: ExerciseDetailModalProps) {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={exercise.name}
      size="lg"
    >
      <div className="space-y-6">
        {/* Description */}
        <div>
          <p className="text-tier-navy/70">{exercise.description}</p>
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary">
            {exercise.duration.min}-{exercise.duration.max} min
          </Badge>
          <Badge variant="outline">
            Difficulty Level {exercise.difficulty}
          </Badge>
          <Badge variant="outline">
            {exercise.category}
          </Badge>
        </div>

        {/* Equipment */}
        {exercise.equipment && exercise.equipment.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-tier-navy mb-2">Equipment Needed</h3>
            <div className="flex flex-wrap gap-2">
              {exercise.equipment.map((item, i) => (
                <span key={i} className="px-3 py-1 bg-tier-navy/10 rounded text-sm text-tier-navy">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {exercise.instructions && exercise.instructions.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-tier-navy mb-3">Instructions</h3>
            <ol className="space-y-2">
              {exercise.instructions.map((instruction, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-tier-gold/20 text-tier-gold flex items-center justify-center text-xs font-semibold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-tier-navy/70 flex-1">
                    {instruction}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Video */}
        {exercise.videoUrl && (
          <div>
            <h3 className="text-sm font-semibold text-tier-navy mb-2">Instructional Video</h3>
            <Button variant="primary" className="flex items-center gap-2">
              <PlayCircle size={16} />
              Watch Video
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default PlayerSessionDetail;
