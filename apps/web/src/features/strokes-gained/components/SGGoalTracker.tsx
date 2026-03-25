/**
 * SG Goal Tracker Component - TIER Golf
 *
 * Allows players to set strokes gained targets and track progress.
 * Integrates with the goals system for comprehensive goal management.
 */

import React, { useState, useMemo } from 'react';
import { Card } from '../../../ui/primitives/Card';
import Button from '../../../ui/primitives/Button';
import { Badge } from '../../../components/shadcn/badge';
import {
  Target,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Edit3,
  Check,
  X,
  Activity,
  Flag,
  CircleDot,
  ChevronRight,
  Plus,
  Award,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type SGCategory = 'total' | 'tee' | 'approach' | 'short_game' | 'putting';

interface SGGoal {
  id: string;
  category: SGCategory;
  targetValue: number;
  currentValue: number;
  deadline?: Date;
  createdAt: Date;
  status: 'active' | 'achieved' | 'missed';
}

interface SGGoalTrackerProps {
  goals: SGGoal[];
  currentSG: {
    total: number;
    tee: number;
    approach: number;
    shortGame: number;
    putting: number;
  };
  onAddGoal?: (category: SGCategory, target: number, deadline?: Date) => void;
  onUpdateGoal?: (goalId: string, target: number) => void;
  onDeleteGoal?: (goalId: string) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORY_CONFIG: Record<
  SGCategory,
  {
    name: string;
    icon: typeof Activity;
    color: string;
    description: string;
    suggestedTargets: number[];
  }
> = {
  total: {
    name: 'Total SG',
    icon: Target,
    color: '#0A2540',
    description: 'Overall strokes gained vs benchmark',
    suggestedTargets: [0, 0.5, 1.0, 1.5, 2.0],
  },
  tee: {
    name: 'Off the Tee',
    icon: Activity,
    color: '#0A2540',
    description: 'Driving performance',
    suggestedTargets: [0, 0.2, 0.4, 0.6],
  },
  approach: {
    name: 'Approach',
    icon: Target,
    color: '#10B981',
    description: 'Approach shot performance',
    suggestedTargets: [0, 0.2, 0.4, 0.6],
  },
  short_game: {
    name: 'Short Game',
    icon: Flag,
    color: '#C9A227',
    description: 'Around the green performance',
    suggestedTargets: [0, 0.15, 0.3, 0.5],
  },
  putting: {
    name: 'Putting',
    icon: CircleDot,
    color: '#8B5CF6',
    description: 'Putting performance',
    suggestedTargets: [0, 0.2, 0.4, 0.6],
  },
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const GoalProgress: React.FC<{
  current: number;
  target: number;
  category: SGCategory;
}> = ({ current, target, category }) => {
  const progress = target === 0 ? 100 : Math.min((current / target) * 100, 150);
  const isAchieved = current >= target;
  const config = CATEGORY_CONFIG[category];

  return (
    <div className="relative h-2 bg-tier-navy/10 rounded-full overflow-visible">
      {/* Target marker */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-tier-navy/30 z-10"
        style={{ left: '66.66%' }}
        title={`Target: ${target >= 0 ? '+' : ''}${target.toFixed(2)}`}
      />

      {/* Progress bar */}
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          isAchieved ? 'bg-tier-success' : ''
        }`}
        style={{
          width: `${Math.min(progress * 0.6666, 100)}%`,
          backgroundColor: isAchieved ? undefined : config.color,
        }}
      />
    </div>
  );
};

const GoalCard: React.FC<{
  goal: SGGoal;
  currentValue: number;
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ goal, currentValue, onEdit, onDelete }) => {
  const config = CATEGORY_CONFIG[goal.category];
  const Icon = config.icon;
  const progress = ((currentValue - goal.currentValue) / (goal.targetValue - goal.currentValue)) * 100;
  const isAchieved = currentValue >= goal.targetValue;
  const trend = currentValue > goal.currentValue ? 'up' : currentValue < goal.currentValue ? 'down' : 'neutral';

  return (
    <div className="flex items-center gap-3 p-4 border-b border-tier-navy/10 last:border-b-0">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${config.color}15` }}
      >
        <Icon size={20} style={{ color: config.color }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-tier-navy">{config.name}</span>
          <div className="flex items-center gap-2">
            {isAchieved && (
              <Badge className="bg-tier-success/10 text-tier-success">
                <Trophy size={12} className="mr-1" />
                Achieved
              </Badge>
            )}
            <span
              className={`text-sm font-bold ${
                currentValue >= 0 ? 'text-tier-success' : 'text-tier-error'
              }`}
            >
              {currentValue >= 0 ? '+' : ''}
              {currentValue.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-tier-navy/60 mb-2">
          <span>
            Target: {goal.targetValue >= 0 ? '+' : ''}
            {goal.targetValue.toFixed(2)}
          </span>
          {goal.deadline && (
            <>
              <span>•</span>
              <span>
                By {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </>
          )}
          {trend !== 'neutral' && (
            <>
              <span>•</span>
              <span className={`flex items-center gap-0.5 ${trend === 'up' ? 'text-tier-success' : 'text-tier-error'}`}>
                {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(currentValue - goal.currentValue).toFixed(2)}
              </span>
            </>
          )}
        </div>

        <GoalProgress current={currentValue} target={goal.targetValue} category={goal.category} />
      </div>

      {onEdit && (
        <button
          onClick={onEdit}
          className="p-2 text-tier-navy/40 hover:text-tier-navy hover:bg-tier-navy/5 rounded-lg transition-colors"
        >
          <Edit3 size={16} />
        </button>
      )}
    </div>
  );
};

const AddGoalForm: React.FC<{
  onSubmit: (category: SGCategory, target: number, deadline?: Date) => void;
  onCancel: () => void;
  currentSG: SGGoalTrackerProps['currentSG'];
}> = ({ onSubmit, onCancel, currentSG }) => {
  const [category, setCategory] = useState<SGCategory>('total');
  const [target, setTarget] = useState('0.5');
  const [deadline, setDeadline] = useState('');

  const config = CATEGORY_CONFIG[category];
  const currentValue = category === 'total' ? currentSG.total :
    category === 'tee' ? currentSG.tee :
    category === 'approach' ? currentSG.approach :
    category === 'short_game' ? currentSG.shortGame :
    currentSG.putting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(category, parseFloat(target), deadline ? new Date(deadline) : undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-tier-navy/10 bg-tier-navy/5">
      <h4 className="text-sm font-semibold text-tier-navy mb-3">Set New SG Goal</h4>

      {/* Category Selection */}
      <div className="mb-3">
        <label className="text-xs text-tier-navy/60 block mb-1">Category</label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CATEGORY_CONFIG) as SGCategory[]).map((cat) => {
            const catConfig = CATEGORY_CONFIG[cat];
            const CatIcon = catConfig.icon;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                  transition-all border
                  ${category === cat
                    ? 'bg-tier-navy text-white border-tier-navy'
                    : 'bg-white text-tier-navy/70 border-tier-navy/20 hover:border-tier-navy/40'
                  }
                `}
              >
                <CatIcon size={14} />
                {catConfig.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Value */}
      <div className="mb-3">
        <label className="text-xs text-tier-navy/60 block mb-1">
          Target (Current: {currentValue >= 0 ? '+' : ''}{currentValue.toFixed(2)})
        </label>
        <div className="flex gap-2">
          {config.suggestedTargets.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTarget(t.toString())}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                ${target === t.toString()
                  ? 'bg-tier-gold text-white border-tier-gold'
                  : 'bg-white text-tier-navy/70 border-tier-navy/20 hover:border-tier-gold'
                }
              `}
            >
              {t >= 0 ? '+' : ''}{t.toFixed(1)}
            </button>
          ))}
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            step="0.1"
            className="w-20 px-2 py-1.5 text-xs border border-tier-navy/20 rounded-lg focus:border-tier-gold focus:outline-none"
            placeholder="Custom"
          />
        </div>
      </div>

      {/* Deadline */}
      <div className="mb-4">
        <label className="text-xs text-tier-navy/60 block mb-1">Deadline (Optional)</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-3 py-2 text-sm border border-tier-navy/20 rounded-lg focus:border-tier-gold focus:outline-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="sm" className="flex-1">
          <Check size={14} className="mr-1" />
          Set Goal
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          <X size={14} />
        </Button>
      </div>
    </form>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SGGoalTracker({
  goals,
  currentSG,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
}: SGGoalTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  const activeGoals = useMemo(
    () => goals.filter((g) => g.status === 'active'),
    [goals]
  );

  const achievedCount = useMemo(
    () => goals.filter((g) => g.status === 'achieved').length,
    [goals]
  );

  const getCurrentValue = (category: SGCategory): number => {
    switch (category) {
      case 'total':
        return currentSG.total;
      case 'tee':
        return currentSG.tee;
      case 'approach':
        return currentSG.approach;
      case 'short_game':
        return currentSG.shortGame;
      case 'putting':
        return currentSG.putting;
    }
  };

  const handleAddGoal = (category: SGCategory, target: number, deadline?: Date) => {
    onAddGoal?.(category, target, deadline);
    setShowAddForm(false);
  };

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-tier-navy/10">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-tier-gold" />
          <h3 className="text-base font-semibold text-tier-navy">SG Goals</h3>
          {achievedCount > 0 && (
            <Badge className="bg-tier-success/10 text-tier-success">
              {achievedCount} achieved
            </Badge>
          )}
        </div>
        {!showAddForm && onAddGoal && (
          <Button variant="ghost" size="sm" onClick={() => setShowAddForm(true)}>
            <Plus size={14} className="mr-1" />
            Add Goal
          </Button>
        )}
      </div>

      {/* Goals List */}
      {activeGoals.length === 0 && !showAddForm ? (
        <div className="flex flex-col items-center gap-3 p-6">
          <Target size={40} className="text-tier-navy/20" />
          <p className="text-sm text-tier-navy/60 text-center">
            No active SG goals.
            <br />
            Set targets to track your improvement.
          </p>
          {onAddGoal && (
            <Button variant="secondary" size="sm" onClick={() => setShowAddForm(true)}>
              <Plus size={14} className="mr-1" />
              Set Your First Goal
            </Button>
          )}
        </div>
      ) : (
        <div>
          {activeGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              currentValue={getCurrentValue(goal.category)}
              onEdit={onUpdateGoal ? () => {} : undefined}
              onDelete={onDeleteGoal ? () => onDeleteGoal(goal.id) : undefined}
            />
          ))}
        </div>
      )}

      {/* Add Goal Form */}
      {showAddForm && (
        <AddGoalForm
          onSubmit={handleAddGoal}
          onCancel={() => setShowAddForm(false)}
          currentSG={currentSG}
        />
      )}

      {/* View All Goals Link */}
      {goals.length > 0 && (
        <button className="flex items-center justify-center gap-1 w-full p-3 border-t border-tier-navy/10 text-sm text-tier-navy/60 hover:text-tier-navy hover:bg-tier-navy/5 transition-colors">
          View All Goals
          <ChevronRight size={14} />
        </button>
      )}
    </Card>
  );
}
