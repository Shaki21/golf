/**
 * Goals Step - Player objectives and targets
 */

import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import Input from '../../../ui/primitives/Input';
import Button from '../../../ui/primitives/Button';

interface Props {
  data?: any;
  onComplete: (data: any) => void;
}

const PRIMARY_GOALS = [
  { value: 'lower_handicap', label: 'Lower handicap', description: 'Main focus on reducing handicap' },
  { value: 'compete_tournaments', label: 'Compete in tournaments', description: 'Perform well in competitions' },
  { value: 'consistency', label: 'Increase consistency', description: 'More stable rounds' },
  { value: 'enjoy_more', label: 'Enjoy the game more', description: 'Have fun and improve the experience' },
  { value: 'specific_skill', label: 'Improve specific skill', description: 'Focus on one part of the game' },
];

const TIMEFRAMES = [
  { value: '3_months', label: '3 months', description: 'Short period' },
  { value: '6_months', label: '6 months', description: 'Medium period' },
  { value: '12_months', label: '12 months', description: 'Long period' },
];

const GoalsStep: React.FC<Props> = ({ data, onComplete }) => {
  const [formData, setFormData] = useState({
    primaryGoal: data?.primaryGoal || 'lower_handicap',
    targetHandicap: data?.targetHandicap || null,
    targetScore: data?.targetScore || null,
    timeframe: data?.timeframe || '6_months',
    tournaments: data?.tournaments || [],
    specificFocus: data?.specificFocus || [],
  });

  const [newTournament, setNewTournament] = useState({
    name: '',
    date: '',
    importance: 'important' as 'major' | 'important' | 'minor',
    targetPlacement: '',
  });

  const [newFocus, setNewFocus] = useState('');

  useEffect(() => {
    onComplete(formData);
  }, [formData, onComplete]);

  const addTournament = () => {
    if (newTournament.name && newTournament.date) {
      setFormData({
        ...formData,
        tournaments: [...formData.tournaments, { ...newTournament }],
      });
      setNewTournament({ name: '', date: '', importance: 'important', targetPlacement: '' });
    }
  };

  const removeTournament = (index: number) => {
    setFormData({
      ...formData,
      tournaments: formData.tournaments.filter((_: any, i: number) => i !== index),
    });
  };

  const addFocus = () => {
    if (newFocus.trim()) {
      setFormData({
        ...formData,
        specificFocus: [...formData.specificFocus, newFocus.trim()],
      });
      setNewFocus('');
    }
  };

  const removeFocus = (index: number) => {
    setFormData({
      ...formData,
      specificFocus: formData.specificFocus.filter((_: string, i: number) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Primary Goal */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          What is your main goal?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRIMARY_GOALS.map((goal) => (
            <button
              key={goal.value}
              type="button"
              onClick={() => setFormData({ ...formData, primaryGoal: goal.value })}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                formData.primaryGoal === goal.value
                  ? 'border-tier-info bg-tier-info-light'
                  : 'border-tier-border-default hover:border-tier-info'
              }`}
            >
              <div className="font-medium text-sm text-tier-navy mb-1">{goal.label}</div>
              <div className="text-xs text-tier-text-secondary">{goal.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Targets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-tier-navy mb-2">
            Target handicap <span className="text-tier-text-secondary font-normal">(optional)</span>
          </label>
          <Input
            type="number"
            min={-5}
            max={54}
            step={0.1}
            value={formData.targetHandicap || ''}
            onChange={(e) => setFormData({ ...formData, targetHandicap: e.target.value ? parseFloat(e.target.value) : null })}
            placeholder="e.g. 18.0"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-tier-navy mb-2">
            Target score <span className="text-tier-text-secondary font-normal">(optional)</span>
          </label>
          <Input
            type="number"
            min={60}
            max={150}
            value={formData.targetScore || ''}
            onChange={(e) => setFormData({ ...formData, targetScore: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="e.g. 85"
            className="w-full"
          />
        </div>
      </div>

      {/* Timeframe */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Timeframe for goal
        </label>
        <div className="grid grid-cols-3 gap-3">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              type="button"
              onClick={() => setFormData({ ...formData, timeframe: tf.value })}
              className={`p-3 rounded-lg border-2 transition-all text-center ${
                formData.timeframe === tf.value
                  ? 'border-tier-info bg-tier-info-light'
                  : 'border-tier-border-default hover:border-tier-info'
              }`}
            >
              <div className="font-medium text-sm text-tier-navy">{tf.label}</div>
              <div className="text-xs text-tier-text-secondary mt-1">{tf.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tournaments */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Important tournaments <span className="text-tier-text-secondary font-normal">(optional)</span>
        </label>

        {formData.tournaments.length > 0 && (
          <div className="space-y-2 mb-3">
            {formData.tournaments.map((tournament: any, index: number) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-tier-surface-base rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm text-tier-navy">{tournament.name}</div>
                  <div className="text-xs text-tier-text-secondary">
                    {new Date(tournament.date).toLocaleDateString('nb-NO')} • {tournament.importance}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeTournament(index)}
                  className="p-1 text-tier-error hover:bg-tier-error-light rounded transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
          <Input
            type="text"
            value={newTournament.name}
            onChange={(e) => setNewTournament({ ...newTournament, name: e.target.value })}
            placeholder="Tournament name"
            className="w-full"
          />
          <Input
            type="date"
            value={newTournament.date}
            onChange={(e) => setNewTournament({ ...newTournament, date: e.target.value })}
            className="w-full"
          />
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={addTournament}
          disabled={!newTournament.name || !newTournament.date}
          leftIcon={<Plus size={16} />}
        >
          Add tournament
        </Button>
      </div>

      {/* Specific Focus Areas */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Specific focus areas <span className="text-tier-text-secondary font-normal">(optional)</span>
        </label>

        {formData.specificFocus.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.specificFocus.map((focus: string, index: number) => (
              <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-tier-info-light text-tier-navy rounded-full text-sm">
                <span>{focus}</span>
                <button
                  type="button"
                  onClick={() => removeFocus(index)}
                  className="hover:text-tier-error transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            type="text"
            value={newFocus}
            onChange={(e) => setNewFocus(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFocus())}
            placeholder="e.g. Putting, Driver, Mental game"
            className="flex-1"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={addFocus}
            disabled={!newFocus.trim()}
            leftIcon={<Plus size={16} />}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GoalsStep;
