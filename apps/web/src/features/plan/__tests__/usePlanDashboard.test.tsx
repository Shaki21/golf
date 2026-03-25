/**
 * usePlanDashboard Hook Tests
 * Tests for the decision-first dashboard state machine and data fetching
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { usePlanDashboard, usePlanAttentionCount } from '../hooks/usePlanDashboard';

// Mock apiClient
jest.mock('../../../data/apiClient', () => ({
  apiGet: jest.fn(),
}));

import { apiGet } from '../../../data/apiClient';

const mockApiGet = apiGet as jest.MockedFunction<typeof apiGet>;

describe('usePlanDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('starts in loading state', () => {
      mockApiGet.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => usePlanDashboard());

      expect(result.current.isLoading).toBe(true);
    });

    it('provides fallback data while loading', () => {
      mockApiGet.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => usePlanDashboard());

      expect(result.current.data).toBeDefined();
      expect(result.current.data.state).toBeDefined();
      expect(result.current.data.primaryAction).toBeDefined();
    });
  });

  describe('Successful API Response', () => {
    const mockApiResponse = {
      state: 'session_upcoming',
      primaryAction: {
        type: 'start_session',
        label: 'Start Session',
        href: '/trening/okter/1',
        context: 'Today at 14:00',
      },
      nextSession: {
        id: '1',
        title: 'Technique Training',
        date: '2024-01-15T14:00:00Z',
        time: '14:00',
        duration: 60,
        focus: 'Putting',
        type: 'coaching',
        confirmed: true,
      },
      goals: [
        {
          id: '1',
          title: 'Improve Putting',
          outcome: '85% hole rate from 3m',
          leadingIndicator: {
            label: 'Sessions this week',
            target: 3,
            current: 1,
            unit: 'sessions',
          },
          status: 'at_risk',
          statusReason: 'Only 1 of 3 sessions completed',
        },
      ],
      loadStats: {
        planned: 8,
        completed: 5,
        missingPurpose: 2,
      },
      upcomingTournament: {
        id: '1',
        name: 'NGF Tour #3',
        date: '2024-01-25T00:00:00Z',
        daysUntil: 10,
        hasPlan: false,
        location: 'Miklagard Golf',
      },
      attentionItems: [
        {
          type: 'at_risk_goal',
          message: 'Goal at risk',
          severity: 'warning',
        },
      ],
      missingLogs: 0,
    };

    it('fetches and returns dashboard data', async () => {
      mockApiGet.mockResolvedValueOnce(mockApiResponse);

      const { result } = renderHook(() => usePlanDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data.state).toBe('session_upcoming');
      expect(result.current.data.primaryAction.type).toBe('start_session');
      expect(result.current.error).toBeNull();
    });

    it('transforms date strings to Date objects', async () => {
      mockApiGet.mockResolvedValueOnce(mockApiResponse);

      const { result } = renderHook(() => usePlanDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data.nextSession?.date).toBeInstanceOf(Date);
      expect(result.current.data.upcomingTournament?.date).toBeInstanceOf(Date);
    });
  });

  describe('Error Handling', () => {
    it('provides fallback data on error', async () => {
      mockApiGet.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => usePlanDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.data).toBeDefined();
      expect(result.current.data.state).toBeDefined();
    });

    it('includes refetch function for retry', async () => {
      mockApiGet.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => usePlanDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe('State Machine Priority', () => {
    it('returns missing_log state when missingLogs > 0', async () => {
      mockApiGet.mockResolvedValueOnce({
        state: 'missing_log',
        primaryAction: {
          type: 'log_session',
          label: 'Log Session',
          href: '/trening/logg',
          context: '2 sessions need logging',
        },
        nextSession: null,
        goals: [],
        loadStats: { planned: 0, completed: 0, missingPurpose: 0 },
        upcomingTournament: null,
        attentionItems: [],
        missingLogs: 2,
      });

      const { result } = renderHook(() => usePlanDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data.state).toBe('missing_log');
      expect(result.current.data.primaryAction.type).toBe('log_session');
    });

    it('returns no_sessions state when no data exists', async () => {
      mockApiGet.mockResolvedValueOnce({
        state: 'no_sessions',
        primaryAction: {
          type: 'adjust_plan',
          label: 'Plan Training',
          href: '/plan/kalender',
          context: 'No sessions planned this week',
        },
        nextSession: null,
        goals: [],
        loadStats: { planned: 0, completed: 0, missingPurpose: 0 },
        upcomingTournament: null,
        attentionItems: [],
        missingLogs: 0,
      });

      const { result } = renderHook(() => usePlanDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data.state).toBe('no_sessions');
      expect(result.current.data.primaryAction.type).toBe('adjust_plan');
    });
  });

  describe('Goals Handling', () => {
    it('returns goals from API response', async () => {
      const mockGoals = [
        {
          id: '1',
          title: 'Goal 1',
          outcome: 'Outcome 1',
          leadingIndicator: { label: 'Test', target: 3, current: 1, unit: 'sessions' },
          status: 'at_risk',
          statusReason: 'Behind schedule',
        },
        {
          id: '2',
          title: 'Goal 2',
          outcome: 'Outcome 2',
          leadingIndicator: { label: 'Test', target: 2, current: 2, unit: 'sessions' },
          status: 'on_track',
          statusReason: 'On schedule',
        },
      ];

      mockApiGet.mockResolvedValueOnce({
        state: 'session_upcoming',
        primaryAction: { type: 'start_session', label: 'Start', href: '/', context: '' },
        nextSession: null,
        goals: mockGoals,
        loadStats: { planned: 0, completed: 0, missingPurpose: 0 },
        upcomingTournament: null,
        attentionItems: [],
        missingLogs: 0,
      });

      const { result } = renderHook(() => usePlanDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data.goals).toHaveLength(2);
      expect(result.current.data.goals[0].status).toBe('at_risk');
    });
  });
});

describe('usePlanAttentionCount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 0 when API fails', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => usePlanAttentionCount());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.count).toBe(0);
  });

  it('returns count from API', async () => {
    mockApiGet.mockResolvedValueOnce({ count: 3 });

    const { result } = renderHook(() => usePlanAttentionCount());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.count).toBe(3);
  });

  it('starts in loading state', () => {
    mockApiGet.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => usePlanAttentionCount());

    expect(result.current.isLoading).toBe(true);
  });
});
