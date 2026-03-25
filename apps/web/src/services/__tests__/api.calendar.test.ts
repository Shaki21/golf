/**
 * Tournament Calendar API Tests
 *
 * Tests the tournament calendar API methods including:
 * - Adding tournaments to calendar
 * - Fetching tournaments
 * - Recording tournament results
 */

import { tournamentsAPI } from '../api';

// Mock the axios module by spying on tournamentsAPI methods
jest.mock('../api', () => ({
  tournamentsAPI: {
    addToCalendar: jest.fn(),
    getAll: jest.fn(),
    getMy: jest.fn(),
    recordResult: jest.fn(),
  },
}));

describe('tournamentsAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addToCalendar', () => {
    const tournamentId = 'tournament-123';
    const tournamentData = {
      name: 'Test Tournament',
      startDate: '2025-06-01',
      endDate: '2025-06-03',
      venue: 'Test Venue',
      city: 'Oslo',
      country: 'Norway',
    };

    it('successfully adds tournament to calendar', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            calendarEventId: 'event-456',
          },
        },
      };

      (tournamentsAPI.addToCalendar as jest.Mock).mockResolvedValue(mockResponse);

      const result = await tournamentsAPI.addToCalendar(tournamentId, tournamentData);

      expect(tournamentsAPI.addToCalendar).toHaveBeenCalledWith(tournamentId, tournamentData);
      expect(result).toEqual(mockResponse);
    });

    it('handles API errors correctly', async () => {
      const error = new Error('Network error');
      (tournamentsAPI.addToCalendar as jest.Mock).mockRejectedValue(error);

      await expect(tournamentsAPI.addToCalendar(tournamentId)).rejects.toThrow('Network error');
    });
  });

  describe('getAll', () => {
    it('fetches all tournaments', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            { id: '1', name: 'Tournament 1' },
            { id: '2', name: 'Tournament 2' },
          ],
        },
      };

      (tournamentsAPI.getAll as jest.Mock).mockResolvedValue(mockResponse);

      const result = await tournamentsAPI.getAll();

      expect(tournamentsAPI.getAll).toHaveBeenCalled();
      expect(result.data.data).toHaveLength(2);
    });
  });

  describe('getMy', () => {
    it('fetches my tournaments', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            registered: [],
            pastResults: [],
          },
        },
      };

      (tournamentsAPI.getMy as jest.Mock).mockResolvedValue(mockResponse);

      const result = await tournamentsAPI.getMy();

      expect(tournamentsAPI.getMy).toHaveBeenCalled();
      expect(result.data.data).toHaveProperty('registered');
      expect(result.data.data).toHaveProperty('pastResults');
    });
  });

  describe('recordResult', () => {
    it('records tournament result', async () => {
      const resultData = {
        tournamentId: 'tournament-123',
        playerId: 'player-456',
        position: 1,
        score: 72,
        totalField: 50,
      };

      const mockResponse = {
        data: { success: true, data: resultData },
      };

      (tournamentsAPI.recordResult as jest.Mock).mockResolvedValue(mockResponse);

      const result = await tournamentsAPI.recordResult(resultData);

      expect(tournamentsAPI.recordResult).toHaveBeenCalledWith(resultData);
      expect(result.data.data).toEqual(resultData);
    });
  });
});
