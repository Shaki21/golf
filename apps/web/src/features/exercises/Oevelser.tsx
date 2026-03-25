// @ts-nocheck
import React, { useState } from 'react';
import {
  Search, Play, Clock, Star, Heart, Grid, List, X, ChevronRight
} from 'lucide-react';
import {
  GolfslagIcon, GolfTarget, GolfFlag, GolfPutter, FysiskIcon, MentalIcon, GolfBunker
} from '../../components/icons';
import { SubSectionTitle } from "../../ui/components/typography";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
  Skeleton,
  Separator,
} from '../../components/shadcn';
import { cn } from 'lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface Exercise {
  id: number | string;
  name: string;
  category: string;
  level: string;
  duration: number;
  difficulty: number;
  description: string;
  instructions: string[];
  equipment: string[];
  videoUrl?: string | null;
  ThumbnailIcon?: React.ComponentType<{ size?: number; className?: string }>;
}

interface Category {
  id: string;
  label: string;
  count?: number;
  Icon?: React.ComponentType<{ size?: number; className?: string }>;
}

interface LPhase {
  id: string;
  label: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORIES: Category[] = [
  { id: 'all', label: 'All', count: 24 },
  { id: 'langspill', label: 'Long game', count: 6, Icon: GolfslagIcon },
  { id: 'innspill', label: 'Approach', count: 5, Icon: GolfTarget },
  { id: 'shortgame', label: 'Short game', count: 4, Icon: GolfFlag },
  { id: 'putting', label: 'Putting', count: 4, Icon: GolfPutter },
  { id: 'fysisk', label: 'Physical', count: 3, Icon: FysiskIcon },
  { id: 'mental', label: 'Mental', count: 2, Icon: MentalIcon },
];

const L_PHASES: LPhase[] = [
  { id: 'all', label: 'All L-phases' },
  { id: 'L1', label: 'L1 - Exposure' },
  { id: 'L2', label: 'L2 - Fundamentals' },
  { id: 'L3', label: 'L3 - Variation' },
  { id: 'L4', label: 'L4 - Timing' },
  { id: 'L5', label: 'L5 - Automaticity' },
];

const DEFAULT_EXERCISES: Exercise[] = [
  {
    id: 1,
    name: 'Driver Carry Drill',
    category: 'langspill',
    level: 'L4',
    duration: 15,
    difficulty: 3,
    description: 'Focus on maximum carry distance with controlled swing.',
    instructions: [
      'Warm up with 10 half swings',
      'Focus on rotation and timing',
      'Goal: 5 shots over 250m carry',
      'Log best and average',
    ],
    equipment: ['Driver', 'Launch Monitor', 'Tees'],
    videoUrl: 'https://example.com/video1',
    ThumbnailIcon: GolfslagIcon,
  },
  {
    id: 2,
    name: 'Stock Shot 7-iron',
    category: 'innspill',
    level: 'L3',
    duration: 20,
    difficulty: 2,
    description: 'Build consistent stock shot with 7-iron to different targets.',
    instructions: [
      'Select 3 targets at 150m, 155m, 160m',
      'Hit 5 balls to each target',
      'Focus on same swing, adjust club selection',
      'Measure distance from target',
    ],
    equipment: ['7-iron', 'Range balls', 'Target flags'],
    ThumbnailIcon: GolfTarget,
  },
  {
    id: 3,
    name: 'Wedge Distance Control',
    category: 'innspill',
    level: 'L4',
    duration: 25,
    difficulty: 3,
    description: 'Precision training with wedges at 50-100m.',
    instructions: [
      'Set up targets at 50, 70, 90m',
      'Use 52°, 56°, 60° wedge',
      'Hit 3 balls to each target with each wedge',
      'Calculate PEI for each series',
    ],
    equipment: ['Wedges (52°, 56°, 60°)', 'Launch Monitor'],
    ThumbnailIcon: GolfTarget,
  },
  {
    id: 4,
    name: 'Bunker Escape Drill',
    category: 'shortgame',
    level: 'L3',
    duration: 15,
    difficulty: 2,
    description: 'Basic bunker shots with focus on getting out on first attempt.',
    instructions: [
      'Place 10 balls in greenside bunker',
      'Goal: All on green',
      'Focus on open stance and swing through sand',
      'Count number within 3m from hole',
    ],
    equipment: ['Sand wedge', 'Bunker rake'],
    ThumbnailIcon: GolfBunker,
  },
  {
    id: 5,
    name: 'Lag Putting Gate Drill',
    category: 'putting',
    level: 'L5',
    duration: 20,
    difficulty: 4,
    description: 'Lag control from 6-9 meters with gates.',
    instructions: [
      'Set up gates 30cm in front of hole',
      'Putt from 6m, 7.5m and 9m',
      'Goal: Stop ball between hole and 60cm past',
      'Train until 8/10 success at each distance',
    ],
    equipment: ['Putter', 'Gate sticks', 'Measuring tape'],
    ThumbnailIcon: GolfFlag,
  },
  {
    id: 6,
    name: 'Pressure Putting Challenge',
    category: 'putting',
    level: 'L5',
    duration: 15,
    difficulty: 5,
    description: 'Mental pressure training with elimination format.',
    instructions: [
      'Start with 10 balls at 2m',
      'Miss = start over',
      'Goal: 10 in a row',
      'Log best streak',
    ],
    equipment: ['Putter', 'Timer'],
    ThumbnailIcon: GolfTarget,
  },
  {
    id: 7,
    name: 'Rotary Power Drill',
    category: 'fysisk',
    level: 'L2',
    duration: 30,
    difficulty: 3,
    description: 'Build rotational power with medicine ball exercises.',
    instructions: [
      '3 sets x 10 rotational throws (right)',
      '3 sets x 10 rotational throws (left)',
      '3 sets x 10 overhead slam',
      'Focus on explosiveness from ground',
    ],
    equipment: ['Medicine ball 4kg', 'Wall/partner'],
    ThumbnailIcon: FysiskIcon,
  },
  {
    id: 8,
    name: 'Pre-shot Routine Drill',
    category: 'mental',
    level: 'L4',
    duration: 20,
    difficulty: 2,
    description: 'Build consistent pre-shot routine of 18-22 seconds.',
    instructions: [
      'Define your 5-step routine',
      'Practice routine on 10 shots',
      'Use timer to ensure consistency',
      'Goal: Variation under 3 seconds',
    ],
    equipment: ['Timer/Stopwatch', 'Video for analysis'],
    ThumbnailIcon: MentalIcon,
  },
  {
    id: 9,
    name: 'Fade/Draw Control',
    category: 'langspill',
    level: 'L4',
    duration: 25,
    difficulty: 4,
    description: 'Controlled curving of the ball both ways.',
    instructions: [
      'Warm up with 10 straight shots',
      'Hit 10 controlled fades',
      'Hit 10 controlled draws',
      'Combine: alternating fade/draw',
    ],
    equipment: ['Driver or 5-iron', 'Launch Monitor'],
    ThumbnailIcon: GolfslagIcon,
  },
  {
    id: 10,
    name: 'Chip & Run Variation',
    category: 'shortgame',
    level: 'L3',
    duration: 20,
    difficulty: 2,
    description: 'Chip with different clubs for varying roll.',
    instructions: [
      'Choose same landing spot',
      'Chip with 8-iron, PW, 56°',
      'Observe different roll',
      'Learn distances for each club',
    ],
    equipment: ['8-iron, PW, 56°', 'Chipping green'],
    ThumbnailIcon: GolfFlag,
  },
];

// ============================================================================
// LEVEL TAG COMPONENT
// ============================================================================

interface LevelTagProps {
  level: string;
}

const LevelTag: React.FC<LevelTagProps> = ({ level }) => {
  const config: Record<string, { className: string }> = {
    L1: { className: 'bg-slate-100 text-slate-600 border-slate-200' },
    L2: { className: 'bg-blue-50 text-blue-600 border-blue-200' },
    L3: { className: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    L4: { className: 'bg-amber-50 text-amber-600 border-amber-200' },
    L5: { className: 'bg-tier-navy/15 text-tier-navy border-tier-navy/30' },
  };

  const { className } = config[level] || config.L3;

  return (
    <Badge variant="outline" className={cn("text-[10px] font-semibold border", className)}>
      {level}
    </Badge>
  );
};

// ============================================================================
// DIFFICULTY STARS COMPONENT
// ============================================================================

interface DifficultyStarsProps {
  level: number;
}

const DifficultyStars: React.FC<DifficultyStarsProps> = ({ level }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star
        key={i}
        className={cn(
          "w-3.5 h-3.5",
          i <= level ? "text-achievement fill-achievement" : "text-border-subtle"
        )}
      />
    ))}
  </div>
);

// ============================================================================
// EXERCISE CARD SKELETON
// ============================================================================

const ExerciseCardSkeleton: React.FC = () => (
  <Card className="overflow-hidden">
    <Skeleton className="h-32 w-full" />
    <CardContent className="p-4 space-y-2">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-10" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex justify-between pt-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
    </CardContent>
  </Card>
);

// ============================================================================
// EXERCISE CARD COMPONENT
// ============================================================================

interface ExerciseCardProps {
  exercise: Exercise;
  isFavorite: boolean;
  onToggleFavorite: (id: number | string) => void;
  onClick: (exercise: Exercise) => void;
  viewMode: 'grid' | 'list';
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  isFavorite,
  onToggleFavorite,
  onClick,
  viewMode
}) => {
  const Icon = exercise.ThumbnailIcon || GolfTarget;

  if (viewMode === 'list') {
    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-all"
        onClick={() => onClick(exercise)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-tier-navy/10 to-success/10 flex items-center justify-center flex-shrink-0">
              <Icon size={28} className="text-tier-navy" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <SubSectionTitle className="text-sm font-semibold text-text-primary truncate">{exercise.name}</SubSectionTitle>
                <LevelTag level={exercise.level} />
              </div>
              <p className="text-xs text-text-secondary line-clamp-1">{exercise.description}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1 text-[11px] text-text-secondary">
                  <Clock className="w-3 h-3" />
                  {exercise.duration} min
                </span>
                <DifficultyStars level={exercise.difficulty} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(exercise.id);
                }}
              >
                <Heart className={cn("w-4 h-4", isFavorite && "fill-error text-error")} />
              </Button>
              <ChevronRight className="w-4 h-4 text-text-secondary" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
      onClick={() => onClick(exercise)}
    >
      {/* Thumbnail */}
      <div className="h-32 bg-gradient-to-br from-tier-navy/10 to-success/10 flex items-center justify-center relative">
        <Icon size={48} className="text-tier-navy" />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-tier-navy/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
        </div>

        {/* Favorite button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(exercise.id);
          }}
        >
          <Heart className={cn("w-4 h-4", isFavorite && "fill-error text-error")} />
        </Button>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <SubSectionTitle className="text-sm font-semibold text-text-primary line-clamp-1">{exercise.name}</SubSectionTitle>
          <LevelTag level={exercise.level} />
        </div>
        <p className="text-xs text-text-secondary line-clamp-2 mb-3">{exercise.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-text-secondary">
            <Clock className="w-3 h-3" />
            <span>{exercise.duration} min</span>
          </div>
          <DifficultyStars level={exercise.difficulty} />
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// EXERCISE DETAIL DIALOG
// ============================================================================

interface ExerciseDialogProps {
  exercise: Exercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: number | string) => void;
}

const ExerciseDialog: React.FC<ExerciseDialogProps> = ({
  exercise,
  open,
  onOpenChange,
  isFavorite,
  onToggleFavorite
}) => {
  if (!exercise) return null;

  const Icon = exercise.ThumbnailIcon || GolfTarget;
  const category = CATEGORIES.find(c => c.id === exercise.category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden max-h-[90vh]">
        {/* Header with icon */}
        <div className="h-48 bg-gradient-to-br from-tier-navy to-tier-navy/70 flex items-center justify-center relative">
          <Icon size={72} className="text-white" />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white"
            onClick={() => onToggleFavorite(exercise.id)}
          >
            <Heart className={cn("w-5 h-5", isFavorite && "fill-white")} />
          </Button>
        </div>

        <ScrollArea className="max-h-[calc(90vh-12rem)]">
          <div className="p-6 space-y-6">
            {/* Title & Badges */}
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-xl font-bold mb-2">{exercise.name}</DialogTitle>
                <div className="flex items-center gap-2">
                  <LevelTag level={exercise.level} />
                  {category && (
                    <Badge variant="secondary">{category.label}</Badge>
                  )}
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="flex items-center gap-1 text-text-secondary">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{exercise.duration} min</span>
                </div>
                <DifficultyStars level={exercise.difficulty} />
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-text-primary">{exercise.description}</p>

            <Separator />

            {/* Instructions */}
            <div>
              <SubSectionTitle className="text-sm font-semibold text-text-primary mb-3">Instructions</SubSectionTitle>
              <ol className="space-y-3">
                {exercise.instructions.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-tier-navy text-white text-xs flex items-center justify-center flex-shrink-0 font-medium">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-text-primary pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <Separator />

            {/* Equipment */}
            <div>
              <SubSectionTitle className="text-sm font-semibold text-text-primary mb-3">Equipment</SubSectionTitle>
              <div className="flex flex-wrap gap-2">
                {exercise.equipment.map((item, idx) => (
                  <Badge key={idx} variant="outline">{item}</Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Start exercise
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// CATEGORY SIDEBAR
// ============================================================================

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  favorites: (number | string)[];
  exercises: Exercise[];
  onSelectExercise: (exercise: Exercise) => void;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  favorites,
  exercises,
  onSelectExercise
}) => {
  const favoriteExercises = exercises.filter(ex => favorites.includes(ex.id)).slice(0, 3);

  return (
    <div className="hidden lg:block w-56 flex-shrink-0 space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Categories</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="py-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors",
                  selectedCategory === cat.id
                    ? "bg-tier-navy/5 text-tier-navy border-l-2 border-tier-navy"
                    : "text-text-primary hover:bg-background-elevated"
                )}
              >
                <span className="flex items-center gap-2">
                  {cat.Icon && <cat.Icon size={16} />}
                  <span className="text-sm">{cat.label}</span>
                </span>
                {cat.count !== undefined && (
                  <span className="text-xs text-text-secondary">{cat.count}</span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Favorites Quick Access */}
      {favoriteExercises.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Heart className="w-4 h-4 text-error fill-error" />
              Favorites
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {favoriteExercises.map(ex => {
              const Icon = ex.ThumbnailIcon || GolfTarget;
              return (
                <div
                  key={ex.id}
                  onClick={() => onSelectExercise(ex)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-background-elevated cursor-pointer hover:bg-border-subtle transition-colors"
                >
                  <Icon size={16} className="text-tier-navy" />
                  <span className="text-xs text-text-primary line-clamp-1">{ex.name}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface OevelserProps {
  exercises?: Exercise[] | null;
  onFilterChange?: (filters: { search?: string; category?: string | null; learningPhase?: string | null }) => void;
}

const Oevelser: React.FC<OevelserProps> = ({
  exercises: apiExercises = null,
  onFilterChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [favorites, setFavorites] = useState<(number | string)[]>([1, 5, 8]);

  const exercises = apiExercises || DEFAULT_EXERCISES;

  const toggleFavorite = (id: number | string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setDialogOpen(true);
  };

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ex.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ex.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || ex.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-background-default">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Search & Filters */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <Input
                placeholder="Search for exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Level Filter */}
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Select L-phase" />
              </SelectTrigger>
              <SelectContent>
                {L_PHASES.map(phase => (
                  <SelectItem key={phase.id} value={phase.id}>{phase.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
              <TabsList className="bg-background-elevated">
                <TabsTrigger value="grid" className="px-3">
                  <Grid className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="list" className="px-3">
                  <List className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <CategorySidebar
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            favorites={favorites}
            exercises={exercises}
            onSelectExercise={handleSelectExercise}
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-text-secondary">
                Showing {filteredExercises.length} exercises
              </p>
            </div>

            {/* Exercises Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredExercises.map(exercise => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    isFavorite={favorites.includes(exercise.id)}
                    onToggleFavorite={toggleFavorite}
                    onClick={handleSelectExercise}
                    viewMode="grid"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExercises.map(exercise => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    isFavorite={favorites.includes(exercise.id)}
                    onToggleFavorite={toggleFavorite}
                    onClick={handleSelectExercise}
                    viewMode="list"
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {filteredExercises.length === 0 && (
              <Card className="p-10 text-center">
                <GolfTarget size={48} className="text-text-secondary mx-auto mb-3" />
                <p className="text-sm text-text-secondary mb-2">No exercises found</p>
                <Button variant="link" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedLevel('all'); }}>
                  Reset filters
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Exercise Detail Dialog */}
      <ExerciseDialog
        exercise={selectedExercise}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        isFavorite={selectedExercise ? favorites.includes(selectedExercise.id) : false}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
};

export default Oevelser;
