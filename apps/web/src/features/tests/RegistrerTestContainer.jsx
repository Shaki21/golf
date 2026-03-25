/**
 * RegistrerTestContainer.jsx
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */
import React, { useState } from 'react';
import {
  Save, CheckCircle,
  Plus, Trash2
} from 'lucide-react';
import { SubSectionTitle } from '../../components/typography';
import Button from '../../ui/primitives/Button';
import apiClient from '../../services/apiClient';
import { getTestCategoryIcon } from '../../constants/icons';
import { PageHeader } from '../../ui/raw-blocks';

// ============================================================================
// CLASS MAPPINGS
// ============================================================================

const CATEGORY_CLASSES = {
  driving: {
    text: 'text-tier-navy',
    bg: 'bg-tier-navy/15',
    activeBg: 'bg-tier-navy',
    border: 'border-tier-navy',
  },
  iron_play: {
    text: 'text-tier-success',
    bg: 'bg-tier-success/15',
    activeBg: 'bg-tier-success',
    border: 'border-tier-success',
  },
  short_game: {
    text: 'text-tier-warning',
    bg: 'bg-tier-warning/15',
    activeBg: 'bg-tier-warning',
    border: 'border-tier-warning',
  },
  putting: {
    text: 'text-tier-error',
    bg: 'bg-tier-error/15',
    activeBg: 'bg-tier-error',
    border: 'border-tier-error',
  },
  physical: {
    text: 'text-gold-500',
    bg: 'bg-gold-500/15',
    activeBg: 'bg-gold-500',
    border: 'border-gold-500',
  },
};

// ============================================================================
// MOCK DATA
// ============================================================================

const TEST_CATEGORIES = [
  {
    id: 'driving',
    name: 'Driving',
    tests: [
      { id: 'driver_distance', name: 'Driver distance', unit: 'm', type: 'number' },
      { id: 'driver_accuracy', name: 'Fairway hit', unit: '%', type: 'percentage' },
      { id: 'club_speed', name: 'Club speed', unit: 'mph', type: 'number' },
      { id: 'ball_speed', name: 'Ball speed', unit: 'mph', type: 'number' },
      { id: 'smash_factor', name: 'Smash factor', unit: '', type: 'decimal' },
    ],
  },
  {
    id: 'iron_play',
    name: 'Iron Play',
    tests: [
      { id: 'gir', name: 'GIR', unit: '%', type: 'percentage' },
      { id: 'proximity_100', name: 'Proximity from 100m', unit: 'm', type: 'decimal' },
      { id: 'proximity_150', name: 'Proximity from 150m', unit: 'm', type: 'decimal' },
      { id: 'dispersion', name: 'Dispersion', unit: 'm', type: 'decimal' },
    ],
  },
  {
    id: 'short_game',
    name: 'Short Game',
    tests: [
      { id: 'scrambling', name: 'Scrambling', unit: '%', type: 'percentage' },
      { id: 'sand_saves', name: 'Sand saves', unit: '%', type: 'percentage' },
      { id: 'up_and_down', name: 'Up and down', unit: '%', type: 'percentage' },
      { id: 'chip_proximity', name: 'Chip proximity', unit: 'm', type: 'decimal' },
    ],
  },
  {
    id: 'putting',
    name: 'Putting',
    tests: [
      { id: 'putts_per_round', name: 'Putts per round', unit: '', type: 'decimal' },
      { id: 'one_putt_pct', name: 'One-putt percentage', unit: '%', type: 'percentage' },
      { id: 'three_putt_pct', name: 'Three-putt percentage', unit: '%', type: 'percentage' },
      { id: 'putt_distance_1m', name: 'Putt from 1m', unit: '%', type: 'percentage' },
      { id: 'putt_distance_3m', name: 'Putt from 3m', unit: '%', type: 'percentage' },
    ],
  },
  {
    id: 'physical',
    name: 'Physical',
    tests: [
      { id: 'core_hold', name: 'Plank hold', unit: 'sec', type: 'number' },
      { id: 'squat', name: 'Squat max', unit: 'kg', type: 'number' },
      { id: 'rotation_speed', name: 'Rotation speed', unit: 'deg/s', type: 'number' },
      { id: 'flexibility', name: 'Flexibility', unit: 'cm', type: 'number' },
    ],
  },
];

const RECENT_TESTS = [
  { id: 1, name: 'Driver distance', value: 255, unit: 'm', date: '2025-01-18' },
  { id: 2, name: 'GIR', value: 55, unit: '%', date: '2025-01-15' },
  { id: 3, name: 'Plank hold', value: 90, unit: 'sec', date: '2025-01-12' },
];

// ============================================================================
// TEST CATEGORY CARD
// ============================================================================

const TestCategoryCard = ({ category, selected, onSelect }) => {
  const CategoryIcon = getTestCategoryIcon(category.id);
  const classes = CATEGORY_CLASSES[category.id] || CATEGORY_CLASSES.driving;
  const isSelected = selected?.id === category.id;

  return (
    <button
      onClick={() => onSelect(category)}
      className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 cursor-pointer transition-all ${
        isSelected
          ? `${classes.border} ${classes.bg}`
          : 'border-transparent bg-tier-white'
      }`}
    >
      <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${
        isSelected ? classes.activeBg : classes.bg
      }`}>
        <CategoryIcon
          size={20}
          className={isSelected ? 'text-white' : classes.text}
        />
      </div>
      <span className={`text-xs font-medium ${
        isSelected ? classes.text : 'text-tier-navy'
      }`}>
        {category.name}
      </span>
    </button>
  );
};

// ============================================================================
// TEST INPUT
// ============================================================================

const TestInput = ({ test, value, onChange, onRemove }) => {
  const handleChange = (e) => {
    let val = e.target.value;
    if (test.type === 'percentage') {
      val = Math.min(100, Math.max(0, parseFloat(val) || 0));
    } else if (test.type === 'number') {
      val = Math.max(0, parseInt(val) || 0);
    } else if (test.type === 'decimal') {
      val = Math.max(0, parseFloat(val) || 0);
    }
    onChange(val);
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-tier-white rounded-[10px] shadow-sm">
      <div className="flex-1">
        <label className="block text-[13px] font-medium text-tier-navy mb-1">
          {test.name}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={value || ''}
            onChange={handleChange}
            placeholder="0"
            step={test.type === 'decimal' ? '0.1' : '1'}
            className="flex-1 py-2 px-3 rounded-lg border border-tier-border-default text-base font-medium outline-none focus:border-tier-navy"
          />
          {test.unit && (
            <span className="text-sm text-tier-text-secondary min-w-[40px]">
              {test.unit}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={onRemove}
        className="p-2 rounded-lg border-none bg-tier-error/10 cursor-pointer"
      >
        <Trash2 size={16} className="text-tier-error" />
      </button>
    </div>
  );
};

// ============================================================================
// TEST SELECTOR
// ============================================================================

const TestSelector = ({ category, selectedTests, onToggle }) => {
  if (!category) return null;

  const classes = CATEGORY_CLASSES[category.id] || CATEGORY_CLASSES.driving;

  return (
    <div className="bg-tier-white rounded-[14px] p-4 mb-5">
      <SubSectionTitle className="text-sm font-semibold text-tier-navy m-0 mb-3">
        Select tests - {category.name}
      </SubSectionTitle>
      <div className="flex flex-wrap gap-2">
        {category.tests.map((test) => {
          const isSelected = selectedTests.some((t) => t.id === test.id);

          return (
            <button
              key={test.id}
              onClick={() => onToggle(test)}
              className={`py-2 px-3 rounded-lg text-[13px] font-medium cursor-pointer flex items-center gap-1 ${
                isSelected
                  ? `border-2 ${classes.border} ${classes.bg} ${classes.text}`
                  : 'border border-tier-border-default bg-tier-surface-base text-tier-navy'
              }`}
            >
              {isSelected ? <CheckCircle size={14} /> : <Plus size={14} />}
              {test.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// RECENT TESTS
// ============================================================================

const RecentTests = ({ tests }) => (
  <div className="bg-tier-white rounded-[14px] p-4">
    <SubSectionTitle className="text-sm font-semibold text-tier-navy m-0 mb-3">
      Recent registrations
    </SubSectionTitle>
    <div className="flex flex-col gap-2">
      {tests.map((test) => (
        <div
          key={test.id}
          className="flex items-center justify-between py-2 px-3 bg-tier-surface-base rounded-lg"
        >
          <div>
            <div className="text-[13px] font-medium text-tier-navy">
              {test.name}
            </div>
            <div className="text-[11px] text-tier-text-secondary">
              {new Date(test.date).toLocaleDateString('en-US')}
            </div>
          </div>
          <div className="text-base font-semibold text-tier-navy">
            {test.value}{test.unit}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const RegistrerTestContainer = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTests, setSelectedTests] = useState([]);
  const [testValues, setTestValues] = useState({});
  const [notes, setNotes] = useState('');

  const handleToggleTest = (test) => {
    if (selectedTests.some((t) => t.id === test.id)) {
      setSelectedTests(selectedTests.filter((t) => t.id !== test.id));
      const newValues = { ...testValues };
      delete newValues[test.id];
      setTestValues(newValues);
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const handleRemoveTest = (testId) => {
    setSelectedTests(selectedTests.filter((t) => t.id !== testId));
    const newValues = { ...testValues };
    delete newValues[testId];
    setTestValues(newValues);
  };

  const handleValueChange = (testId, value) => {
    setTestValues({ ...testValues, [testId]: value });
  };

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const [submitSuccess, setSubmitSuccess] = useState(false);
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async () => {
    const data = {
      tests: selectedTests.map((test) => ({
        id: test.id,
        name: test.name,
        value: testValues[test.id],
        unit: test.unit,
      })),
      notes,
      date: new Date().toISOString(),
    };

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await apiClient.post('/tests/results', data);
      setSubmitSuccess(true);
      // Reset form after successful submission
      setSelectedTests([]);
      setTestValues({});
      setNotes('');
    } catch (err) {
      console.error('Failed to submit test results:', err);
      setSubmitError(err.message || 'Could not save the test results');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = selectedTests.length > 0 &&
    selectedTests.every((test) => testValues[test.id] !== undefined && testValues[test.id] !== '');

  return (
    <div className="w-full">
      <PageHeader
        title="Register test result"
        subtitle="Log test results for progress tracking"
        helpText="Register test results within the categories driving, iron play, short game, putting, physical and mental. Select test category, add tests from the list and register values. See previous results, trends and compare with benchmarks. Results are automatically saved in the test protocol."
      />
      {/* Category Selection */}
      <div className="bg-tier-white rounded-[14px] p-4 mb-5">
        <SubSectionTitle className="text-sm font-semibold text-tier-navy m-0 mb-3">
          Select test category
        </SubSectionTitle>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-2">
          {TEST_CATEGORIES.map((category) => (
            <TestCategoryCard
              key={category.id}
              category={category}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          ))}
        </div>
      </div>

      {/* Test Selection */}
      <TestSelector
        category={selectedCategory}
        selectedTests={selectedTests}
        onToggle={handleToggleTest}
      />

      {/* Selected Tests with Inputs */}
      {selectedTests.length > 0 && (
        <div className="mb-5">
          <SubSectionTitle className="text-sm font-semibold text-tier-navy m-0 mb-3">
            Register values
          </SubSectionTitle>
          <div className="flex flex-col gap-2">
            {selectedTests.map((test) => (
              <TestInput
                key={test.id}
                test={test}
                value={testValues[test.id]}
                onChange={(value) => handleValueChange(test.id, value)}
                onRemove={() => handleRemoveTest(test.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {selectedTests.length > 0 && (
        <div className="bg-tier-white rounded-[14px] p-4 mb-5">
          <label className="block text-sm font-semibold text-tier-navy mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about the test..."
            rows={3}
            className="w-full py-3 px-3 rounded-lg border border-tier-border-default text-sm outline-none resize-y font-inherit focus:border-tier-navy"
          />
        </div>
      )}

      {/* Submit Button */}
      {selectedTests.length > 0 && (
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
          leftIcon={<Save size={18} />}
          fullWidth
          className="mb-6"
        >
          Save test results
        </Button>
      )}

      {/* Recent Tests */}
      <RecentTests tests={RECENT_TESTS} />
    </div>
  );
};

export default RegistrerTestContainer;
