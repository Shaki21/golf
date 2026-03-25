// @ts-nocheck
/**
 * Maalsetninger - Goals management with shadcn/ui components
 */
import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useUrlFilters } from '../../hooks/useUrlFilters';
import { CollapsibleFilterDrawer, FilterControl } from '../../components/filters/CollapsibleFilterDrawer';
import { AICoachGuide } from '../ai-coach';
import { GUIDE_PRESETS } from '../ai-coach/types';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionTitle, SubSectionTitle, CardTitle as TypographyCardTitle } from '../../components/typography/Headings';
import {
  Target, Trophy, Dumbbell, Brain, TrendingUp, RefreshCw, Crosshair,
  Plus, Pencil, Trash2, Check, Users, X, Lightbulb, Calendar
} from 'lucide-react';
import { useGoalCategories } from '../../hooks/useTrainingConfig';
import { useAuth } from '../../contexts/AuthContext';
import { getCategoryColors } from './constants/categoryConfig';
import { GoalsWelcomeHeader } from './components/GoalsWelcomeHeader';
import { useGoalsData } from './hooks/useGoalsData';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Progress,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Textarea,
  Label,
  Switch,
  ScrollArea,
  Checkbox,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/shadcn';
import { GoalProgress, PlayerStatCard } from '../../components/shadcn/golf';
import { AnimatedStatsCard } from '../../components/dashboard/AnimatedStatsCard';
import { StreakCounter } from './components/StreakCounter';
import { BadgeShowcase } from '../../components/gamification/BadgeShowcase';
import { BADGE_DEFINITIONS } from './constants/badgeDefinitions';
import { useConfetti } from '../../hooks/useConfetti';
import { cn } from 'lib/utils';

// Types
interface Milestone {
  title: string;
  target: number;
  completed: boolean;
}

interface CoachComment {
  id: number;
  author: string;
  date: string;
  comment: string;
}

interface Goal {
  id: number;
  title: string;
  description?: string;
  category: string;
  timeframe: 'short' | 'medium' | 'long';
  measurable: boolean;
  current: number;
  target: number;
  unit: string;
  deadline?: string;
  status: 'active' | 'completed';
  sharedWithCoach: boolean;
  coachComments: CoachComment[];
  milestones: Milestone[];
}

// Icon mapping for dynamic icons from SportConfig
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  Crosshair,
  Dumbbell,
  Brain,
  Trophy,
  TrendingUp,
  RefreshCw,
};

// Helper to get icon component from string
const getIconComponent = (iconName: string) => ICON_MAP[iconName] || Target;

// Category configuration - NOW LOADED FROM SPORT CONFIG VIA useGoalCategories hook
// This fallback is kept for backwards compatibility
const DEFAULT_CATEGORIES = [
  { id: 'score', label: 'Score', icon: Target },
  { id: 'teknikk', label: 'Technique', icon: Crosshair },
  { id: 'fysisk', label: 'Physical', icon: Dumbbell },
  { id: 'mental', label: 'Mental', icon: Brain },
  { id: 'turnering', label: 'Tournament', icon: Trophy },
  { id: 'prosess', label: 'Process', icon: RefreshCw },
];

const TIMEFRAMES = [
  { id: 'short', label: 'Short-term (1-3 months)' },
  { id: 'medium', label: 'Medium-term (3-12 months)' },
  { id: 'long', label: 'Long-term (1-3 years)' },
];

// Default goals
const DEFAULT_GOALS: Goal[] = [
  {
    id: 1,
    title: 'Reach handicap 5.0',
    description: 'Reduce handicap from 8.2 to 5.0 by next season',
    category: 'score',
    timeframe: 'long',
    measurable: true,
    current: 8.2,
    target: 5.0,
    unit: 'HCP',
    deadline: '2025-09-01',
    status: 'active',
    sharedWithCoach: true,
    coachComments: [
      { id: 1, author: 'Coach Anders', date: '2025-12-10', comment: 'Great progress! You are on track.' },
    ],
    milestones: [
      { title: 'Reach 7.0 HCP', target: 7.0, completed: true },
      { title: 'Reach 6.0 HCP', target: 6.0, completed: false },
    ],
  },
  {
    id: 2,
    title: 'Increase clubspeed to 105 mph',
    category: 'fysisk',
    timeframe: 'medium',
    measurable: true,
    current: 98,
    target: 105,
    unit: 'mph',
    deadline: '2025-06-01',
    status: 'active',
    sharedWithCoach: false,
    coachComments: [],
    milestones: [],
  },
  {
    id: 3,
    title: 'Master draw shot',
    category: 'teknikk',
    timeframe: 'medium',
    measurable: true,
    current: 80,
    target: 80,
    unit: '% consistency',
    status: 'completed',
    sharedWithCoach: false,
    coachComments: [],
    milestones: [],
  },
];

// Goal Card Component
interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onToggleComplete: (id: number) => void;
  onUpdateProgress: (goal: Goal) => void;
  onShareWithCoach: (id: number) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onEdit,
  onToggleComplete,
  onUpdateProgress,
  onShareWithCoach,
}) => {
  const { categories: sportCategories, getCategory } = useGoalCategories();

  // Get category info from sport config
  const categoryData = getCategory(goal.category);
  const CategoryIcon = categoryData ? getIconComponent(categoryData.icon) : Target;
  const categoryLabel = categoryData?.nameNO || categoryData?.name || goal.category;
  const categoryColors = getCategoryColors(goal.category);
  const progressPercentage = (goal.current / goal.target) * 100;
  const isCompleted = goal.status === 'completed';

  const getStatus = (): 'on_track' | 'behind' | 'at_risk' => {
    if (progressPercentage >= 75) return 'on_track';
    if (progressPercentage >= 50) return 'behind';
    return 'at_risk';
  };

  return (
    <Card className={cn("transition-all", isCompleted && "opacity-75")}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
              categoryColors ? categoryColors.bgColor : "bg-tier-navy/10"
            )}>
              <CategoryIcon className={cn(
                "w-5 h-5",
                categoryColors ? categoryColors.textColor : "text-tier-navy"
              )} />
            </div>
            <div>
              <SubSectionTitle className={cn(
                "font-semibold text-text-primary",
                isCompleted && "line-through"
              )}>
                {goal.title}
              </SubSectionTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant={
                  goal.timeframe === 'short' ? 'secondary' :
                  goal.timeframe === 'long' ? 'default' : 'outline'
                }>
                  {TIMEFRAMES.find(t => t.id === goal.timeframe)?.label.split(' ')[0]}
                </Badge>
                {goal.sharedWithCoach && (
                  <Badge variant="outline" className="gap-1">
                    <Users className="h-3 w-3" />
                    Shared
                  </Badge>
                )}
                {goal.deadline && (
                  <span className="text-xs text-text-secondary flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(goal.deadline).toLocaleDateString('nb-NO')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onShareWithCoach(goal.id)}
              className={cn(
                "transition-transform duration-200 hover:scale-110 active:scale-95",
                goal.sharedWithCoach && "text-tier-navy"
              )}
            >
              <Users className="h-4 w-4" />
            </Button>
            <Checkbox
              checked={isCompleted}
              onCheckedChange={() => onToggleComplete(goal.id)}
              className="h-5 w-5 transition-transform duration-200 hover:scale-110"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(goal)}
              className="transition-transform duration-200 hover:scale-110 active:scale-95"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Description */}
        {goal.description && (
          <p className="text-sm text-text-secondary mb-3">{goal.description}</p>
        )}

        {/* Progress */}
        {goal.measurable && (
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-text-primary">
                {goal.current} / {goal.target} {goal.unit}
              </span>
              <span className={cn(
                "font-medium",
                progressPercentage >= 100 ? "text-tier-success" : "text-tier-navy"
              )}>
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
            {!isCompleted && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateProgress(goal)}
                className="mt-2 transition-transform duration-200 hover:scale-105 active:scale-95"
              >
                Update progress
              </Button>
            )}
          </div>
        )}

        {/* Milestones */}
        {goal.milestones && goal.milestones.length > 0 && (
          <div className="pt-3 border-t border-border-subtle">
            <p className="text-xs font-medium text-text-secondary mb-2">Milestones</p>
            <div className="space-y-1.5">
              {goal.milestones.map((milestone, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Checkbox checked={milestone.completed} disabled className="h-4 w-4" />
                  <span className={cn(
                    "text-xs flex-1",
                    milestone.completed && "line-through text-text-secondary"
                  )}>
                    {milestone.title}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {milestone.target} {goal.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coach Comments */}
        {goal.coachComments && goal.coachComments.length > 0 && (
          <div className="pt-3 mt-3 border-t border-border-subtle">
            <p className="text-xs font-medium text-text-secondary mb-2 flex items-center gap-1">
              💬 Coach feedback
            </p>
            <div className="space-y-2">
              {goal.coachComments.map(comment => (
                <div
                  key={comment.id}
                  className="p-2 rounded-lg bg-tier-navy/5 border-l-2 border-tier-navy"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{comment.author}</span>
                    <span className="text-[10px] text-text-secondary">
                      {new Date(comment.date).toLocaleDateString('nb-NO')}
                    </span>
                  </div>
                  <p className="text-xs text-text-primary">{comment.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Goal Modal Component
interface GoalModalProps {
  goal?: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (goal: Goal) => void;
  onDelete?: (id: number) => void;
}

const GoalModal: React.FC<GoalModalProps> = ({
  goal,
  open,
  onOpenChange,
  onSave,
  onDelete,
}) => {
  const { categories: sportCategories } = useGoalCategories();

  // Transform sport config categories to component format
  const CATEGORIES = useMemo(() => {
    if (!sportCategories || sportCategories.length === 0) {
      return DEFAULT_CATEGORIES;
    }
    return sportCategories.map(cat => ({
      id: cat.id,
      label: cat.nameNO || cat.name,
      icon: getIconComponent(cat.icon),
    }));
  }, [sportCategories]);

  const [formData, setFormData] = useState<Partial<Goal>>(goal || {
    title: '',
    description: '',
    category: 'score',
    timeframe: 'medium',
    measurable: true,
    current: 0,
    target: 100,
    unit: '',
    deadline: '',
  });

  React.useEffect(() => {
    if (goal) {
      setFormData(goal);
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'score',
        timeframe: 'medium',
        measurable: true,
        current: 0,
        target: 100,
        unit: '',
        deadline: '',
      });
    }
  }, [goal, open]);

  const handleSubmit = () => {
    onSave({
      ...formData,
      id: goal?.id || Date.now(),
      status: goal?.status || 'active',
      sharedWithCoach: goal?.sharedWithCoach || false,
      coachComments: goal?.coachComments || [],
      milestones: goal?.milestones || [],
    } as Goal);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="2xl">
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit goal' : 'New goal'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Goal title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="E.g. Reach handicap 5"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the goal in more detail..."
              rows={3}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <Button
                    key={cat.id}
                    variant={formData.category === cat.id ? 'default' : 'outline'}
                    className="flex-col h-auto py-3"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                  >
                    <Icon className="h-5 w-5 mb-1" />
                    <span className="text-xs">{cat.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Timeframe */}
          <div className="space-y-2">
            <Label>Timeframe</Label>
            <div className="space-y-2">
              {TIMEFRAMES.map(tf => (
                <Button
                  key={tf.id}
                  variant={formData.timeframe === tf.id ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setFormData({ ...formData, timeframe: tf.id as Goal['timeframe'] })}
                >
                  {tf.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Measurable toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-background-default">
            <Label htmlFor="measurable" className="cursor-pointer">
              Measurable goal (with numbers)
            </Label>
            <Switch
              id="measurable"
              checked={formData.measurable}
              onCheckedChange={(checked) => setFormData({ ...formData, measurable: checked })}
            />
          </div>

          {/* Measurable values */}
          {formData.measurable && (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Current</Label>
                <Input
                  type="number"
                  value={formData.current}
                  onChange={e => setFormData({ ...formData, current: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Target</Label>
                <Input
                  type="number"
                  value={formData.target}
                  onChange={e => setFormData({ ...formData, target: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Unit</Label>
                <Input
                  value={formData.unit}
                  onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="HCP"
                />
              </div>
            </div>
          )}

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (optional)</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={e => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          {goal && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="mr-auto">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the goal. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(goal.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.title}>
            {goal ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Update Progress Dialog
interface UpdateProgressDialogProps {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: number, value: number) => void;
}

const UpdateProgressDialog: React.FC<UpdateProgressDialogProps> = ({
  goal,
  open,
  onOpenChange,
  onSave,
}) => {
  const [value, setValue] = useState('');

  React.useEffect(() => {
    if (goal) {
      setValue(goal.current.toString());
    }
  }, [goal]);

  const handleSave = () => {
    if (goal && !isNaN(parseFloat(value))) {
      onSave(goal.id, parseFloat(value));
      onOpenChange(false);
    }
  };

  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Update progress</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <p className="font-medium text-text-primary">{goal.title}</p>
            <p className="text-sm text-text-secondary">
              Target: {goal.target} {goal.unit}
            </p>
          </div>
          <div className="space-y-2">
            <Label>New value ({goal.unit})</Label>
            <Input
              type="number"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={`0 - ${goal.target}`}
              step="0.1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Component
interface MaalsetningerProps {
  goals?: Goal[] | null;
}

// Badge Details Modal
interface BadgeDetailsModalProps {
  badge: {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    earnedAt?: Date;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BadgeDetailsModal: React.FC<BadgeDetailsModalProps> = ({ badge, open, onOpenChange }) => {
  if (!badge) return null;

  const badgeDefinition = BADGE_DEFINITIONS.find(b => b.id === badge.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-tier-gold" />
            Badge Details
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 flex items-center justify-center">
            <span className="text-4xl">{badge.icon || '🏆'}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">{badge.name}</h3>
            <p className="text-sm text-text-secondary mt-1">
              {badge.description || badgeDefinition?.description || 'Achievement unlocked!'}
            </p>
          </div>
          {badge.earnedAt && (
            <div className="pt-3 border-t border-border-subtle">
              <p className="text-xs text-text-tertiary">
                Earned on {new Date(badge.earnedAt).toLocaleDateString('nb-NO', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Maalsetninger: React.FC<MaalsetningerProps> = ({ goals: apiGoals }) => {
  const [goals, setGoals] = useState<Goal[]>(apiGoals || DEFAULT_GOALS);
  const { filters, setFilter } = useUrlFilters({
    category: null as string | null,
    view: 'active' as 'active' | 'completed' | 'all'
  });
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [updatingGoal, setUpdatingGoal] = useState<Goal | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<{
    id: string;
    name: string;
    description?: string;
    icon?: string;
    earnedAt?: Date;
  } | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  // Get user and goal categories
  const { user } = useAuth();
  const { categories: sportCategories } = useGoalCategories();
  const { celebrateGoalReached } = useConfetti();

  // Fetch goals data from API (streak, stats, badges)
  const { streak, stats, badges, isLoading: isLoadingGoalsData } = useGoalsData();

  // Transform sport config categories to component format
  const CATEGORIES = useMemo(() => {
    if (!sportCategories || sportCategories.length === 0) {
      return DEFAULT_CATEGORIES;
    }
    return sportCategories.map(cat => ({
      id: cat.id,
      label: cat.nameNO || cat.name,
      icon: getIconComponent(cat.icon),
    }));
  }, [sportCategories]);

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  const filteredGoals = goals.filter(goal => {
    const categoryMatch = filters.category === null || goal.category === filters.category;
    const statusMatch = filters.view === 'all' ||
      (filters.view === 'active' && goal.status === 'active') ||
      (filters.view === 'completed' && goal.status === 'completed');
    return categoryMatch && statusMatch;
  });

  const totalProgress = activeGoals.length > 0
    ? activeGoals
        .filter(g => g.measurable)
        .reduce((sum, g) => sum + (g.current / g.target) * 100, 0) /
      (activeGoals.filter(g => g.measurable).length || 1)
    : 0;

  const handleSaveGoal = (goalData: Goal) => {
    try {
      if (editingGoal) {
        setGoals(goals.map(g => g.id === goalData.id ? goalData : g));
        toast.success('Goal updated!');
      } else {
        setGoals([...goals, goalData]);
        toast.success('New goal created!');
      }
      setShowModal(false);
      setEditingGoal(null);
    } catch (error) {
      toast.error('Could not save goal. Please try again.');
      console.error('Error saving goal:', error);
    }
  };

  const handleDeleteGoal = (id: number) => {
    try {
      setGoals(goals.filter(g => g.id !== id));
      toast.success('Goal deleted');
      setShowModal(false);
      setEditingGoal(null);
    } catch (error) {
      toast.error('Could not delete goal. Please try again.');
      console.error('Error deleting goal:', error);
    }
  };

  const handleToggleComplete = (id: number) => {
    try {
      const goal = goals.find(g => g.id === id);
      const newStatus = goal?.status === 'completed' ? 'active' : 'completed';

      setGoals(goals.map(g =>
        g.id === id ? { ...g, status: newStatus } : g
      ));

      // Celebrate when goal is completed
      if (newStatus === 'completed') {
        toast.success('Congratulations! Goal completed! 🎉');
        celebrateGoalReached();
      } else {
        toast.success('Goal marked as active again');
      }
    } catch (error) {
      toast.error('Could not update goal. Please try again.');
      console.error('Error toggling goal completion:', error);
    }
  };

  const handleUpdateProgress = (id: number, value: number) => {
    try {
      const goal = goals.find(g => g.id === id);
      const previousValue = goal?.current || 0;
      const target = goal?.target || 100;

      setGoals(goals.map(g => g.id === id ? { ...g, current: value } : g));
      toast.success('Progress updated!');

      // Celebrate when progress reaches 100% for the first time
      if (goal && previousValue < target && value >= target) {
        celebrateGoalReached();
      }
    } catch (error) {
      toast.error('Could not update progress. Please try again.');
      console.error('Error updating goal progress:', error);
    }
  };

  const toggleShareWithCoach = (id: number) => {
    try {
      const goal = goals.find(g => g.id === id);
      const willShare = !goal?.sharedWithCoach;

      setGoals(goals.map(g =>
        g.id === id ? { ...g, sharedWithCoach: !g.sharedWithCoach } : g
      ));

      toast.success(willShare ? 'Goal shared with coach' : 'Sharing with coach removed');
    } catch (error) {
      toast.error('Could not update sharing. Please try again.');
      console.error('Error toggling share with coach:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background-default">
      <PageHeader
        title="My Goals"
        subtitle={`${activeGoals.length} active goals`}
        helpText="Set and track your golf goals. Share goals with your coach and track progress over time with milestones and deadlines."
        action={
          <Button
            onClick={() => { setEditingGoal(null); setShowModal(true); }}
            className="gap-2 transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            New goal
          </Button>
        }
      />

      {/* Welcome Header */}
      <div className="px-6 pt-6 max-w-4xl mx-auto">
        <GoalsWelcomeHeader
          userName={user?.name || user?.email?.split('@')[0] || 'Player'}
          activeGoals={activeGoals.length}
          totalProgress={totalProgress}
          completedThisMonth={stats?.completedThisMonth || 0}
        />
      </div>

      {/* Stats */}
      <div className="px-6 pb-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <AnimatedStatsCard
            icon={Target}
            label="Active goals"
            value={activeGoals.length}
            iconColor="rgb(var(--tier-navy))"
            iconBgColor="rgb(var(--tier-navy) / 0.1)"
            iconAnimation="pulse"
            animationDelay={0}
          />
          <AnimatedStatsCard
            icon={Trophy}
            label="Completed"
            value={completedGoals.length}
            iconColor="rgb(var(--status-success))"
            iconBgColor="rgb(var(--status-success) / 0.1)"
            iconAnimation="shine"
            animationDelay={200}
          />
          <AnimatedStatsCard
            icon={TrendingUp}
            label="Avg. progress"
            value={totalProgress}
            suffix="%"
            decimals={0}
            iconColor="rgb(var(--tier-gold))"
            iconBgColor="rgb(var(--tier-gold) / 0.1)"
            iconAnimation="pulse"
            animationDelay={400}
          />
        </div>

        {/* Streak Counter */}
        <div className="mb-6">
          <StreakCounter
            currentStreak={streak?.currentStreak || 0}
            longestStreak={streak?.longestStreak || 0}
            streakStatus={streak?.streakStatus || 'inactive'}
            nextMilestone={streak?.longestStreak ? streak.longestStreak + 7 : 7}
          />
        </div>

        {/* Badge Showcase */}
        <div className="mb-8">
          <BadgeShowcase
            title="Recent badges"
            badges={
              badges?.recentUnlocks?.map(badge => ({
                id: badge.badgeId,
                name: badge.name,
                description: BADGE_DEFINITIONS.find(b => b.id === badge.badgeId)?.description,
                icon: badge.icon,
                earnedAt: new Date(badge.unlockedAt),
              })) || []
            }
            maxDisplay={3}
            onBadgeClick={(badge) => {
              setSelectedBadge(badge);
              setShowBadgeModal(true);
            }}
          />
        </div>

        {/* AI Coach Guide */}
        <AICoachGuide config={GUIDE_PRESETS.goals} />

        {/* Collapsible Filters */}
        <CollapsibleFilterDrawer
          activeFilterCount={
            (filters.view !== 'active' ? 1 : 0) +
            (filters.category !== null ? 1 : 0)
          }
          onClearAll={() => {
            setFilter('view', 'active');
            setFilter('category', null);
          }}
        >
          <div className="space-y-4">
            {/* View mode filter */}
            <FilterControl label="View">
              <Tabs value={filters.view as string} onValueChange={(v) => setFilter('view', v)}>
                <TabsList className="w-full">
                  <TabsTrigger value="active" className="flex-1">
                    Active ({activeGoals.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="flex-1">
                    Completed ({completedGoals.length})
                  </TabsTrigger>
                  <TabsTrigger value="all" className="flex-1">
                    All ({goals.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </FilterControl>

            {/* Category filter */}
            <FilterControl label="Category">
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-2 pb-2">
                  <Button
                    variant={filters.category === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('category', null)}
                    className="transition-all"
                  >
                    All
                  </Button>
                  {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const colors = getCategoryColors(cat.id);
                    const isSelected = filters.category === cat.id;

                    return (
                      <Button
                        key={cat.id}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('category', cat.id)}
                        className={cn(
                          "gap-1 transition-all duration-200",
                          isSelected && "shadow-md",
                          !isSelected && colors && [
                            colors.borderColor,
                            colors.hoverBorderColor,
                            "hover:shadow-sm"
                          ]
                        )}
                      >
                        <Icon className={cn(
                          "h-4 w-4",
                          !isSelected && colors && colors.textColor
                        )} />
                        {cat.label}
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </FilterControl>
          </div>
        </CollapsibleFilterDrawer>

        {/* Goals list */}
        <div className="space-y-3">
          {filteredGoals.length > 0 ? (
            filteredGoals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={(g) => { setEditingGoal(g); setShowModal(true); }}
                onToggleComplete={handleToggleComplete}
                onUpdateProgress={(g) => setUpdatingGoal(g)}
                onShareWithCoach={toggleShareWithCoach}
              />
            ))
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Target className="h-12 w-12 mx-auto mb-4 text-text-tertiary" />
                <SubSectionTitle className="text-lg font-semibold text-text-primary mb-2">
                  No goals found
                </SubSectionTitle>
                <p className="text-sm text-text-secondary mb-4">
                  {filters.view === 'completed'
                    ? 'You have no completed goals yet.'
                    : 'Try adjusting the filter or create a new goal.'}
                </p>
                <Button onClick={() => { setEditingGoal(null); setShowModal(true); }}>
                  Create your first goal
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tips card */}
        {filters.view === 'active' && activeGoals.length > 0 && (
          <Card className="mt-6 bg-tier-warning/10 border-tier-warning/20">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-6 w-6 text-tier-warning flex-shrink-0" />
                <div>
                  <CardTitle className="font-semibold text-text-primary mb-1">
                    Tips for good goals
                  </CardTitle>
                  <p className="text-sm text-text-secondary">
                    Use the SMART method: Specific, Measurable, Achievable, Relevant, and
                    Time-bound goals give the best results.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <GoalModal
        goal={editingGoal}
        open={showModal}
        onOpenChange={(open) => {
          setShowModal(open);
          if (!open) setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        onDelete={handleDeleteGoal}
      />

      <UpdateProgressDialog
        goal={updatingGoal}
        open={!!updatingGoal}
        onOpenChange={(open) => { if (!open) setUpdatingGoal(null); }}
        onSave={handleUpdateProgress}
      />

      <BadgeDetailsModal
        badge={selectedBadge}
        open={showBadgeModal}
        onOpenChange={(open) => {
          setShowBadgeModal(open);
          if (!open) setSelectedBadge(null);
        }}
      />
    </div>
  );
};

export default Maalsetninger;
