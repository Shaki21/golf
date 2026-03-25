import { renderHook, waitFor } from '@testing-library/react';
import { useDashboard } from '../useDashboard';
import apiClient from '../../services/apiClient';

// Mock the API client module
jest.mock('../../services/apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

describe('useDashboard', () => {
  const mockApiResponse = {
    data: {
      player: {
        id: 'player-1',
        firstName: 'Test',
        lastName: 'Player',
        category: 'B',
        profileImageUrl: 'https://example.com/avatar.jpg',
        totalXP: 850,
      },
      period: {
        week: 52,
        year: 2025,
        displayText: 'Uke 52',
      },
      todaySessions: [
        {
          id: 'session-1',
          title: 'Putting Practice',
          time: '08:00',
          duration: 90,
          sessionType: 'training',
          status: 'pending',
          meta: 'Kategori B - Indoor Range',
        },
        {
          id: 'session-2',
          title: 'Long Game',
          time: '13:00',
          duration: 120,
          sessionType: 'training',
          status: 'pending',
          meta: 'Kategori B - Driving Range',
        },
      ],
      badges: [
        {
          id: 'badge-1',
          name: '7-Day Streak',
          code: 'STREAK_7',
          icon: 'flame',
        },
      ],
      goals: [
        {
          id: 'goal-1',
          title: 'Improve putting accuracy',
          progress: 75,
          variant: 'primary',
        },
      ],
      weeklyStats: {
        period: 'Uke 52',
        streak: 7,
        stats: [
          { id: 'sessions', label: 'Økter', value: 8 },
          { id: 'hours', label: 'Timer', value: '14.5' },
        ],
      },
      messages: [
        {
          id: 'msg-1',
          senderName: 'Coach Anders',
          preview: 'Great progress this week!',
          time: '10 min',
          unread: true,
          isGroup: false,
        },
      ],
      unreadCount: 1,
      nextTournament: {
        id: 'tournament-1',
        title: 'NM Individuelt 2026',
        date: '2026-06-15',
        location: 'Miklagard Golf',
        type: 'tournament',
      },
      nextTest: {
        id: 'test-1',
        title: 'Kategoritest Q1',
        date: '2026-01-20',
        location: 'TIER Golf',
      },
      breakingPoints: [
        {
          id: 'bp-1',
          area: 'Putting',
          title: 'Lag consistency under pressure',
          status: 'working',
          priority: 'high',
          progress: 65,
        },
      ],
      recentTests: [
        {
          id: 'result-1',
          testId: 'test-1',
          name: 'Putting Test',
          date: '2025-12-20',
          score: 85,
          improvement: 5,
        },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Fetching', () => {
    it('should fetch dashboard data on mount', async () => {
      apiClient.get.mockResolvedValueOnce(mockApiResponse);

      const { result } = renderHook(() => useDashboard());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(apiClient.get).toHaveBeenCalledWith('/dashboard', { params: {} });
      expect(result.current.data).toBeDefined();
      expect(result.current.error).toBeNull();
    });

    it('should fetch with date parameter when provided', async () => {
      apiClient.get.mockResolvedValueOnce(mockApiResponse);

      const testDate = new Date('2025-12-20');
      renderHook(() => useDashboard(testDate));

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith('/dashboard', {
          params: { date: '2025-12-20' },
        });
      });
    });

    it('should provide refetch function', async () => {
      apiClient.get.mockResolvedValueOnce(mockApiResponse);

      const { result } = renderHook(() => useDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      apiClient.get.mockResolvedValueOnce(mockApiResponse);
      result.current.refetch();

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Data Transformation', () => {
    beforeEach(() => {
      apiClient.get.mockResolvedValueOnce(mockApiResponse);
    });

    it('should transform player data correctly', async () => {
      const { result } = renderHook(() => useDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data.player).toEqual({
        name: 'Test Player',
        category: 'B',
        profileImageUrl: 'https://example.com/avatar.jpg',
      });
    });

    it('should transform sessions to calendar events', async () => {
      const { result } = renderHook(() => useDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const events = result.current.data.calendarEvents;
      expect(events).toHaveLength(2);
      expect(events[0]).toMatchObject({
        id: 'session-1',
        title: 'Putting Practice',
        startTime: '08:00',
        endTime: '09:30', // 08:00 + 90 min
        type: 'training',
        location: 'Indoor Range',
      });
    });

    it('should transform weekly stats correctly', async () => {
      const { result } = renderHook(() => useDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const stats = result.current.data.stats;
      expect(stats).toMatchObject({
        sessionsCompleted: 8,
        sessionsTotal: 12,
        hoursThisWeek: 14.5,
        hoursGoal: 20,
        streak: 7,
      });
    });

    it('should transform messages correctly', async () => {
      const { result } = renderHook(() => useDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const messages = result.current.data.messages;
      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        id: 'msg-1',
        from: 'Coach Anders',
        preview: 'Great progress this week!',
        time: '10 min',
        read: false, // unread: true -> read: false
        isGroup: false,
      });
    });

    it('should include new dashboard fields', async () => {
      const { result } = renderHook(() => useDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const { nextTournament, nextTest, breakingPoints, recentTests } = result.current.data;

      expect(nextTournament).toMatchObject({
        id: 'tournament-1',
        title: 'NM Individuelt 2026',
        date: '2026-06-15',
        location: 'Miklagard Golf',
      });

      expect(nextTest).toMatchObject({
        id: 'test-1',
        title: 'Kategoritest Q1',
        date: '2026-01-20',
      });

      expect(breakingPoints).toHaveLength(1);
      expect(breakingPoints[0]).toMatchObject({
        id: 'bp-1',
        area: 'Putting',
        status: 'working',
        priority: 'high',
        progress: 65,
      });

      expect(recentTests).toHaveLength(1);
      expect(recentTests[0]).toMatchObject({
        id: 'result-1',
        testId: 'test-1',
        name: 'Putting Test',
        score: 85,
      });
    });

    it('should calculate XP and level correctly', async () => {
      const { result } = renderHook(() => useDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const { xp, totalXp, level, nextLevelXp } = result.current.data;

      expect(totalXp).toBe(850);
      expect(level).toBe(5); // Math.floor(Math.sqrt(850 / 50)) + 1
      expect(xp).toBe(50); // 850 - (4^2 * 50) = 850 - 800
      expect(nextLevelXp).toBe(450); // (5^2 * 50) - (4^2 * 50) = 1250 - 800
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const errorMessage = 'Network error';
      apiClient.get.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.data).toBeDefined(); // Fallback data
    });

    it('should use fallback data when API fails', async () => {
      apiClient.get.mockRejectedValueOnce(new Error('API error'));

      const { result } = renderHook(() => useDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data.player.name).toBe('Demo Player');
      expect(result.current.data.stats.sessionsCompleted).toBe(8);
      expect(result.current.data.tasks).toBeDefined();
      expect(result.current.data.messages).toBeDefined();
    });

    it('should handle missing optional fields', async () => {
      const minimalResponse = {
        data: {
          player: { firstName: 'Test', lastName: 'User', category: 'B' },
          period: { week: 52, year: 2025, displayText: 'Uke 52' },
          todaySessions: [],
          badges: [],
          goals: [],
          weeklyStats: { period: 'Uke 52', stats: [] },
          messages: [],
          unreadCount: 0,
          nextTournament: null,
          nextTest: null,
          breakingPoints: [],
          recentTests: null,
        },
      };

      apiClient.get.mockResolvedValueOnce(minimalResponse);

      const { result } = renderHook(() => useDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should use fallback data for null tournament/test
      expect(result.current.data.nextTournament).toBeDefined();
      expect(result.current.data.nextTest).toBeDefined();
      expect(result.current.data.tasks).toBeDefined();

      // recentTests should use fallback when null or empty
      expect(result.current.data).toHaveProperty('recentTests');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty sessions array', async () => {
      const emptyResponse = {
        ...mockApiResponse,
        data: {
          ...mockApiResponse.data,
          todaySessions: [],
        },
      };

      apiClient.get.mockResolvedValueOnce(emptyResponse);

      const { result } = renderHook(() => useDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data.calendarEvents).toHaveLength(0);
      expect(result.current.data.upcomingSessions).toHaveLength(0);
    });

    it('should handle missing weeklyStats data', async () => {
      const noStatsResponse = {
        ...mockApiResponse,
        data: {
          ...mockApiResponse.data,
          weeklyStats: { period: 'Uke 52', stats: [] },
        },
      };

      apiClient.get.mockResolvedValueOnce(noStatsResponse);

      const { result } = renderHook(() => useDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data.stats.sessionsCompleted).toBe(0);
      expect(result.current.data.stats.hoursThisWeek).toBe(0);
    });

    it('should calculate end time for sessions', async () => {
      const sessionResponse = {
        ...mockApiResponse,
        data: {
          ...mockApiResponse.data,
          todaySessions: [
            {
              id: 'session-1',
              title: 'Morning Training',
              time: '08:00',
              duration: 90, // 08:00 + 90 min = 09:30
              sessionType: 'training',
              status: 'pending',
              meta: 'Kategori B - Indoor',
            },
          ],
        },
      };

      apiClient.get.mockResolvedValueOnce(sessionResponse);

      const { result } = renderHook(() => useDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const event = result.current.data.calendarEvents[0];
      expect(event.startTime).toBe('08:00');
      expect(event.endTime).toBe('09:30');
    });
  });
});
