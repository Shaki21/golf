/**
 * Unit Tests for Goal Domain Mappers
 *
 * Tests pure functions for:
 * - mapGoalTimeframeToUIType: canonical timeframe → UI type
 * - mapGoalStatusToUI: canonical status → UI status
 * - mapApiGoalToUI: API response → UI goal
 * - calculateAverageProgress: utility function
 */

import {
  mapGoalTimeframeToUIType,
  mapGoalStatusToUI,
  mapStringToUIGoalType,
  mapStringToUIGoalStatus,
  mapApiGoalToUI,
  mapApiGoalsToUIData,
  mapCanonicalGoalToUI,
  calculateAverageProgress,
  groupGoalsByType,
  groupGoalsByStatus,
  type UIGoal,
  type ApiGoalResponse,
  type ApiGoalsListResponse,
} from './mappers';

import type { CanonicalGoal, GoalTimeframe, GoalStatus } from './mappers';

// ============================================================================
// mapGoalTimeframeToUIType Tests
// ============================================================================

describe('mapGoalTimeframeToUIType', () => {
  describe('direct mappings', () => {
    it('maps short to short', () => {
      expect(mapGoalTimeframeToUIType('short')).toBe('short');
    });

    it('maps long to long', () => {
      expect(mapGoalTimeframeToUIType('long')).toBe('long');
    });
  });

  describe('semantic gap: medium → short', () => {
    it('maps medium to short (UI has no medium)', () => {
      expect(mapGoalTimeframeToUIType('medium')).toBe('short');
    });
  });
});

// ============================================================================
// mapGoalStatusToUI Tests
// ============================================================================

describe('mapGoalStatusToUI', () => {
  describe('direct mappings', () => {
    it('maps active to active', () => {
      expect(mapGoalStatusToUI('active')).toBe('active');
    });

    it('maps completed to completed', () => {
      expect(mapGoalStatusToUI('completed')).toBe('completed');
    });

    it('maps paused to paused', () => {
      expect(mapGoalStatusToUI('paused')).toBe('paused');
    });
  });

  describe('semantic gap: cancelled → paused', () => {
    it('maps cancelled to paused (UI has no cancelled)', () => {
      expect(mapGoalStatusToUI('cancelled')).toBe('paused');
    });
  });
});

// ============================================================================
// mapStringToUIGoalType Tests
// ============================================================================

describe('mapStringToUIGoalType', () => {
  it('maps long_term to long', () => {
    expect(mapStringToUIGoalType('long_term')).toBe('long');
  });

  it('maps long to long', () => {
    expect(mapStringToUIGoalType('long')).toBe('long');
  });

  it('maps short to short', () => {
    expect(mapStringToUIGoalType('short')).toBe('short');
  });

  it('maps unknown to short (default)', () => {
    expect(mapStringToUIGoalType('unknown')).toBe('short');
  });

  it('uses fallback when undefined', () => {
    expect(mapStringToUIGoalType(undefined, 'long')).toBe('long');
  });

  it('normalizes case', () => {
    expect(mapStringToUIGoalType('LONG')).toBe('long');
    expect(mapStringToUIGoalType('Long_Term')).toBe('long');
  });
});

// ============================================================================
// mapStringToUIGoalStatus Tests
// ============================================================================

describe('mapStringToUIGoalStatus', () => {
  it('maps completed to completed', () => {
    expect(mapStringToUIGoalStatus('completed')).toBe('completed');
  });

  it('maps done to completed', () => {
    expect(mapStringToUIGoalStatus('done')).toBe('completed');
  });

  it('maps paused to paused', () => {
    expect(mapStringToUIGoalStatus('paused')).toBe('paused');
  });

  it('maps inactive to paused', () => {
    expect(mapStringToUIGoalStatus('inactive')).toBe('paused');
  });

  it('maps cancelled to paused', () => {
    expect(mapStringToUIGoalStatus('cancelled')).toBe('paused');
  });

  it('maps active to active', () => {
    expect(mapStringToUIGoalStatus('active')).toBe('active');
  });

  it('maps unknown to active (default)', () => {
    expect(mapStringToUIGoalStatus('unknown')).toBe('active');
  });

  it('uses fallback when undefined', () => {
    expect(mapStringToUIGoalStatus(undefined, 'paused')).toBe('paused');
  });
});

// ============================================================================
// mapApiGoalToUI Tests
// ============================================================================

describe('mapApiGoalToUI', () => {
  it('maps API goal to UI goal correctly', () => {
    const apiGoal: ApiGoalResponse = {
      id: 'goal-1',
      title: 'Putting under 30',
      description: 'Reduce average putts',
      currentValue: 32,
      targetValue: 30,
      unit: 'putts',
      status: 'active',
      goalType: 'score',
      timeframe: 'short',
    };

    const result = mapApiGoalToUI(apiGoal);

    expect(result).toEqual({
      id: 'goal-1',
      title: 'Putting under 30',
      description: 'Reduce average putts',
      current: 32,
      target: 30,
      unit: 'putts',
      status: 'active',
      type: 'short',
    });
  });

  it('handles missing optional fields', () => {
    const apiGoal: ApiGoalResponse = {
      id: 'goal-2',
      title: 'Basic goal',
      currentValue: 0,
      targetValue: 100,
      unit: '',
      status: 'active',
      goalType: 'technique',
    };

    const result = mapApiGoalToUI(apiGoal);

    expect(result.description).toBeUndefined();
    expect(result.current).toBe(0);
    expect(result.target).toBe(100);
    expect(result.unit).toBe('');
  });

  it('uses goalType when timeframe is missing', () => {
    const apiGoal: ApiGoalResponse = {
      id: 'goal-3',
      title: 'Long term goal',
      currentValue: 0,
      targetValue: 100,
      unit: '%',
      status: 'active',
      goalType: 'long_term',
    };

    const result = mapApiGoalToUI(apiGoal);

    expect(result.type).toBe('long');
  });
});

// ============================================================================
// mapApiGoalsToUIData Tests
// ============================================================================

describe('mapApiGoalsToUIData', () => {
  it('maps goals list and calculates stats', () => {
    const response: ApiGoalsListResponse = {
      goals: [
        { id: '1', title: 'Goal 1', currentValue: 50, targetValue: 100, unit: '%', status: 'active', goalType: 'score' },
        { id: '2', title: 'Goal 2', currentValue: 100, targetValue: 100, unit: '%', status: 'completed', goalType: 'technique' },
        { id: '3', title: 'Goal 3', currentValue: 25, targetValue: 100, unit: '%', status: 'active', goalType: 'physical' },
      ],
    };

    const result = mapApiGoalsToUIData(response);

    expect(result.goals).toHaveLength(3);
    expect(result.stats).toHaveLength(3);
    expect(result.stats[0].value).toBe('2'); // 2 active goals
    expect(result.stats[1].value).toBe('1'); // 1 completed goal
  });

  it('returns empty stats for empty goals', () => {
    const response: ApiGoalsListResponse = { goals: [] };

    const result = mapApiGoalsToUIData(response);

    expect(result.goals).toHaveLength(0);
    expect(result.stats[0].value).toBe('0'); // 0 active goals
  });
});

// ============================================================================
// calculateAverageProgress Tests
// ============================================================================

describe('calculateAverageProgress', () => {
  it('calculates average progress correctly', () => {
    const goals: UIGoal[] = [
      { id: '1', title: 'G1', current: 50, target: 100, unit: '%', status: 'active', type: 'short' },
      { id: '2', title: 'G2', current: 75, target: 100, unit: '%', status: 'active', type: 'short' },
    ];

    const result = calculateAverageProgress(goals);

    expect(result).toBe(62.5); // (50 + 75) / 2
  });

  it('caps individual progress at 100%', () => {
    const goals: UIGoal[] = [
      { id: '1', title: 'G1', current: 150, target: 100, unit: '%', status: 'active', type: 'short' },
    ];

    const result = calculateAverageProgress(goals);

    expect(result).toBe(100);
  });

  it('returns 0 for empty array', () => {
    const result = calculateAverageProgress([]);

    expect(result).toBe(0);
  });

  it('handles zero target', () => {
    const goals: UIGoal[] = [
      { id: '1', title: 'G1', current: 50, target: 0, unit: '%', status: 'active', type: 'short' },
    ];

    const result = calculateAverageProgress(goals);

    expect(result).toBe(0);
  });
});

// ============================================================================
// groupGoalsByType Tests
// ============================================================================

describe('groupGoalsByType', () => {
  it('groups goals by type correctly', () => {
    const goals: UIGoal[] = [
      { id: '1', title: 'Short 1', current: 0, target: 100, unit: '%', status: 'active', type: 'short' },
      { id: '2', title: 'Long 1', current: 0, target: 100, unit: '%', status: 'active', type: 'long' },
      { id: '3', title: 'Short 2', current: 0, target: 100, unit: '%', status: 'active', type: 'short' },
    ];

    const result = groupGoalsByType(goals);

    expect(result.short).toHaveLength(2);
    expect(result.long).toHaveLength(1);
  });
});

// ============================================================================
// groupGoalsByStatus Tests
// ============================================================================

describe('groupGoalsByStatus', () => {
  it('groups goals by status correctly', () => {
    const goals: UIGoal[] = [
      { id: '1', title: 'Active 1', current: 0, target: 100, unit: '%', status: 'active', type: 'short' },
      { id: '2', title: 'Completed', current: 100, target: 100, unit: '%', status: 'completed', type: 'short' },
      { id: '3', title: 'Paused', current: 50, target: 100, unit: '%', status: 'paused', type: 'short' },
      { id: '4', title: 'Active 2', current: 0, target: 100, unit: '%', status: 'active', type: 'long' },
    ];

    const result = groupGoalsByStatus(goals);

    expect(result.active).toHaveLength(2);
    expect(result.completed).toHaveLength(1);
    expect(result.paused).toHaveLength(1);
  });
});

// ============================================================================
// Purity Verification Tests
// ============================================================================

describe('Purity constraints', () => {
  it('mapGoalTimeframeToUIType is deterministic', () => {
    const result1 = mapGoalTimeframeToUIType('medium');
    const result2 = mapGoalTimeframeToUIType('medium');

    expect(result1).toBe(result2);
  });

  it('mapGoalStatusToUI is deterministic', () => {
    const result1 = mapGoalStatusToUI('cancelled');
    const result2 = mapGoalStatusToUI('cancelled');

    expect(result1).toBe(result2);
  });

  it('mapApiGoalToUI is deterministic', () => {
    const apiGoal: ApiGoalResponse = {
      id: '1',
      title: 'Test',
      currentValue: 50,
      targetValue: 100,
      unit: '%',
      status: 'active',
      goalType: 'score',
    };

    const result1 = mapApiGoalToUI(apiGoal);
    const result2 = mapApiGoalToUI(apiGoal);

    expect(result1).toEqual(result2);
  });
});
