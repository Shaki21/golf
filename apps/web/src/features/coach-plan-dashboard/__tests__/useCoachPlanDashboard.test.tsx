/**
 * useCoachPlanDashboard Hook Tests
 * Tests data fetching, state management, and fallback behavior
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import {
  useCoachPlanDashboard,
  useCoachAttentionCount,
} from '../hooks/useCoachPlanDashboard';
import { apiGet } from '../../../data/apiClient';
import type { CoachDashboardData } from '../types';

// Mock the API client
jest.mock('../../../data/apiClient', () => ({
  apiGet: jest.fn(),
}));

const mockApiGet = apiGet as jest.MockedFunction<typeof apiGet>;

// Mock dashboard data
const mockDashboardData: CoachDashboardData = {
  state: 'unreviewed_sessions',
  primaryAction: {
    type: 'review_session',
    label: 'Review session',
    href: '/coach/sessions/1/review',
    context: '2 sessions awaiting review',
    count: 2,
  },
  playersNeedingAttention: [
    {
      id: 'player-1',
      name: 'John Doe',
      category: 'A',
      reason: 'Session completed 3 days ago',
      actionType: 'review',
      href: '/coach/sessions/1/review',
      daysOverdue: 3,
    },
  ],
  todaySessions: [
    {
      id: 'session-1',
      title: 'Coaching session',
      time: '14:00',
      duration: 60,
      playerName: 'Jane Smith',
      playerId: 'player-2',
      focus: 'Putting practice',
    },
  ],
  teamLoadStats: {
    totalPlayers: 10,
    activePlayers: 7,
    sessionsThisWeek: 15,
    pendingReviews: 2,
  },
  upcomingTournaments: [
    {
      id: 'tournament-1',
      name: 'Club Championship',
      date: new Date('2024-02-15'),
      daysUntil: 10,
      playersEntered: 5,
      playersPrepared: 3,
      location: 'Home Course',
    },
  ],
  attentionItems: [
    {
      type: 'unreviewed_session',
      message: '2 sessions awaiting review',
      severity: 'warning',
    },
  ],
  attentionCount: 2,
};

describe('useCoachPlanDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Loading State', () => {
    it('should start with loading state', () => {
      mockApiGet.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useCoachPlanDashboard());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should have fallback data while loading', () => {
      mockApiGet.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useCoachPlanDashboard());

      // Should have default structure even while loading
      expect(result.current.data).toBeDefined();
      expect(result.current.data.state).toBe('all_clear');
    });
  });

  describe('Successful Data Fetch', () => {
    it('should fetch and return dashboard data', async () => {
      const apiResponse = {
        ...mockDashboardData,
        upcomingTournaments: mockDashboardData.upcomingTournaments.map((t) => ({
          ...t,
          date: t.date.toISOString(),
        })),
      };
      mockApiGet.mockResolvedValue(apiResponse);

      const { result } = renderHook(() => useCoachPlanDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data.state).toBe('unreviewed_sessions');
      expect(result.current.data.primaryAction.type).toBe('review_session');
      expect(result.current.error).toBeNull();
    });

    it('should convert date strings to Date objects', async () => {
      const apiResponse = {
        ...mockDashboardData,
        upcomingTournaments: [
          {
            ...mockDashboardData.upcomingTournaments[0],
            date: '2024-02-15T00:00:00.000Z',
          },
        ],
      };
      mockApiGet.mockResolvedValue(apiResponse);

      const { result } = renderHook(() => useCoachPlanDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data.upcomingTournaments[0].date).toBeInstanceOf(Date);
    });

    it('should call correct API endpoint', async () => {
      mockApiGet.mockResolvedValue({
        ...mockDashboardData,
        upcomingTournaments: [],
      });

      renderHook(() => useCoachPlanDashboard());

      await waitFor(() => {
        expect(mockApiGet).toHaveBeenCalledWith('/coach-plan-dashboard');
      });
    });
  });

  describe('Error Handling', () => {
    it('should set error state on API failure', async () => {
      const errorMessage = 'Network error';
      mockApiGet.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useCoachPlanDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
    });

    it('should use fallback data on error', async () => {
      mockApiGet.mockRejectedValue(new Error('API error'));

      const { result } = renderHook(() => useCoachPlanDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should have fallback data despite error
      expect(result.current.data).toBeDefined();
      expect(result.current.data.state).toBe('all_clear');
      expect(result.current.data.attentionCount).toBe(0);
    });

    it('should handle non-Error objects', async () => {
      mockApiGet.mockRejectedValue('String error');

      const { result } = renderHook(() => useCoachPlanDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Could not load dashboard');
    });
  });

  describe('Refetch Functionality', () => {
    it('should provide refetch function', async () => {
      mockApiGet.mockResolvedValue({
        ...mockDashboardData,
        upcomingTournaments: [],
      });

      const { result } = renderHook(() => useCoachPlanDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
    });

    it('should refetch data when called', async () => {
      mockApiGet.mockResolvedValue({
        ...mockDashboardData,
        upcomingTournaments: [],
      });

      const { result } = renderHook(() => useCoachPlanDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Clear mock to track new call
      mockApiGet.mockClear();

      // Trigger refetch
      await act(async () => {
        await result.current.refetch();
      });

      expect(mockApiGet).toHaveBeenCalledTimes(1);
    });
  });

  describe('Data Structure Validation', () => {
    it('should return all required properties', async () => {
      mockApiGet.mockResolvedValue({
        ...mockDashboardData,
        upcomingTournaments: [],
      });

      const { result } = renderHook(() => useCoachPlanDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const { data } = result.current;
      expect(data).toHaveProperty('state');
      expect(data).toHaveProperty('primaryAction');
      expect(data).toHaveProperty('playersNeedingAttention');
      expect(data).toHaveProperty('todaySessions');
      expect(data).toHaveProperty('teamLoadStats');
      expect(data).toHaveProperty('upcomingTournaments');
      expect(data).toHaveProperty('attentionItems');
      expect(data).toHaveProperty('attentionCount');
    });

    it('should return arrays for list properties', async () => {
      mockApiGet.mockResolvedValue({
        ...mockDashboardData,
        upcomingTournaments: [],
      });

      const { result } = renderHook(() => useCoachPlanDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(Array.isArray(result.current.data.playersNeedingAttention)).toBe(true);
      expect(Array.isArray(result.current.data.todaySessions)).toBe(true);
      expect(Array.isArray(result.current.data.upcomingTournaments)).toBe(true);
      expect(Array.isArray(result.current.data.attentionItems)).toBe(true);
    });
  });
});

describe('useCoachAttentionCount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should start with loading state', () => {
    mockApiGet.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useCoachAttentionCount());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.count).toBe(0);
  });

  it('should fetch attention count', async () => {
    mockApiGet.mockResolvedValue({ count: 5 });

    const { result } = renderHook(() => useCoachAttentionCount());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.count).toBe(5);
  });

  it('should call correct endpoint', async () => {
    mockApiGet.mockResolvedValue({ count: 0 });

    renderHook(() => useCoachAttentionCount());

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/coach-plan-dashboard/attention-count');
    });
  });

  it('should return 0 on error', async () => {
    mockApiGet.mockRejectedValue(new Error('API error'));

    const { result } = renderHook(() => useCoachAttentionCount());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.count).toBe(0);
  });
});
