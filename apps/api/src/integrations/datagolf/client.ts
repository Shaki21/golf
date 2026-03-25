/**
 * DataGolf API Client
 * Handles communication with DataGolf API for tour statistics and player data
 *
 * Full API documentation: https://datagolf.com/api-access
 *
 * Endpoints implemented:
 * - General: /get-player-list, /get-schedule, /field-updates
 * - Predictions: /preds/skill-ratings, /preds/get-dg-rankings, /preds/player-decompositions,
 *                /preds/approach-skill, /preds/pre-tournament, /preds/pre-tournament-archive
 * - Live: /preds/in-play, /preds/live-tournament-stats, /preds/live-hole-stats
 * - Historical: /historical-raw-data/event-list, /historical-raw-data/rounds
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../../utils/logger';

export interface DataGolfPlayer {
  dg_id: number;
  player_name: string;
  country?: string;
  country_code?: string;
  amateur?: boolean;
  primary_tour?: string;
}

export interface SkillRating {
  dg_id: number;
  player_name: string;
  sg_total: number;
  sg_ott: number;
  sg_app: number;
  sg_arg: number;
  sg_putt: number;
  driving_dist?: number;
  driving_acc?: number;
}

export interface PlayerDecomposition {
  dg_id: number;
  player_name: string;
  sg_total: number;
  sg_ott: number;
  sg_app: number;
  sg_arg: number;
  sg_putt: number;
  driving_distance?: number;
  driving_accuracy?: number;
}

export interface ApproachSkillData {
  dg_id: number;
  player_name: string;
  // Approach skill by distance buckets
  approach_skill_50_75?: number;
  approach_skill_75_100?: number;
  approach_skill_100_125?: number;
  approach_skill_125_150?: number;
  approach_skill_150_175?: number;
  approach_skill_175_200?: number;
  approach_skill_200_plus?: number;
}

export interface TournamentSchedule {
  event_id: string;
  event_name: string;
  course: string;
  start_date: string;
  end_date: string;
  tour: string;
}

export interface FieldUpdate {
  dg_id: number;
  player_name: string;
  event_id: string;
  status: string;
  tee_time?: string;
  dk_salary?: number;
  fd_salary?: number;
}

export interface HistoricalRound {
  dg_id: number;
  player_name: string;
  event_id: string;
  event_name: string;
  round_num: number;
  course_name: string;
  course_par: number;
  start_hole: number;
  score: number;
  sg_total?: number;
  sg_ott?: number;
  sg_app?: number;
  sg_arg?: number;
  sg_putt?: number;
  driving_dist?: number;
  driving_acc?: number;
  gir?: number;
  scrambling?: number;
  prox_rgh?: number;
  prox_fw?: number;
}

export interface LiveTournamentStats {
  dg_id: number;
  player_name: string;
  position: string;
  total_score: number;
  thru: string;
  today: number;
  sg_total?: number;
  sg_ott?: number;
  sg_app?: number;
  sg_arg?: number;
  sg_putt?: number;
}

export class DataGolfClient {
  private client: AxiosInstance;
  private apiKey: string;
  private baseUrl: string;
  private rateLimit: number;
  private lastRequestTime: number = 0;

  constructor() {
    this.apiKey = process.env.DATAGOLF_API_KEY || '';
    this.baseUrl = process.env.DATAGOLF_BASE_URL || 'https://feeds.datagolf.com';
    this.rateLimit = parseInt(process.env.DATAGOLF_RATE_LIMIT || '1000', 10); // ms between requests

    if (!this.apiKey) {
      logger.info('DataGolf API key not configured. DataGolf features will be disabled.');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000, // Increased timeout for large data requests
    });
  }

  /**
   * Rate limiting to respect DataGolf API limits (1 request per second)
   */
  private async applyRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.rateLimit) {
      const delay = this.rateLimit - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Generic API request with rate limiting and error handling
   */
  private async request<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error('DataGolf API key not configured');
    }

    await this.applyRateLimit();

    try {
      const response = await this.client.get(endpoint, {
        params: {
          ...params,
          key: this.apiKey,
        },
      });

      logger.debug({ endpoint, params }, 'DataGolf API request successful');
      return response.data;
    } catch (error: any) {
      logger.error({ error: error.message, endpoint, params }, 'DataGolf API request failed');
      throw error;
    }
  }

  // ============================================================================
  // GENERAL USE ENDPOINTS
  // ============================================================================

  /**
   * Get full player list with IDs
   * Endpoint: /get-player-list
   */
  async getPlayerList(): Promise<DataGolfPlayer[]> {
    return this.request<DataGolfPlayer[]>('/get-player-list');
  }

  /**
   * Get tour schedule for a season
   * Endpoint: /get-schedule
   */
  async getSchedule(tour: string = 'pga', season?: number): Promise<TournamentSchedule[]> {
    const params: Record<string, any> = { tour };
    if (season) params.season = season;
    const data = await this.request<any>('/get-schedule', params);
    return this.extractData<TournamentSchedule>(data);
  }

  /**
   * Get field updates for current/upcoming tournaments
   * Endpoint: /field-updates
   */
  async getFieldUpdates(tour: string = 'pga'): Promise<FieldUpdate[]> {
    return this.request<FieldUpdate[]>('/field-updates', { tour });
  }

  // ============================================================================
  // MODEL PREDICTIONS ENDPOINTS
  // ============================================================================

  /**
   * Helper to extract data array from response
   * DataGolf API returns objects like { last_updated: "...", players: [...] }
   * Different endpoints use different field names for the array
   */
  private extractData<T>(data: any): T[] {
    if (Array.isArray(data)) return data;
    // Try all known array field names
    if (data?.players && Array.isArray(data.players)) return data.players;
    if (data?.rankings && Array.isArray(data.rankings)) return data.rankings;
    if (data?.schedule && Array.isArray(data.schedule)) return data.schedule;
    if (data?.field && Array.isArray(data.field)) return data.field;
    if (data?.rounds && Array.isArray(data.rounds)) return data.rounds;
    if (data?.data && Array.isArray(data.data)) return data.data;  // approach-skill uses 'data'
    if (data?.scores && Array.isArray(data.scores)) return data.scores;  // historical rounds uses 'scores'
    if (data?.event_list && Array.isArray(data.event_list)) return data.event_list;
    return [];
  }

  /**
   * Get skill ratings for a specific tour
   * Endpoint: /preds/skill-ratings
   */
  async getSkillRatings(tour: string = 'pga'): Promise<SkillRating[]> {
    const data = await this.request<any>('/preds/skill-ratings', { tour });
    const players = this.extractData<SkillRating>(data);
    logger.debug({ tour, playerCount: players.length }, 'Fetched DataGolf skill ratings');
    return players;
  }

  /**
   * Get DataGolf rankings (top 500)
   * Endpoint: /preds/get-dg-rankings
   */
  async getDGRankings(): Promise<any[]> {
    const data = await this.request<any>('/preds/get-dg-rankings');
    return this.extractData(data);
  }

  /**
   * Get player skill decompositions (detailed SG breakdown)
   * Endpoint: /preds/player-decompositions
   */
  async getPlayerDecompositions(tour: string = 'pga'): Promise<PlayerDecomposition[]> {
    const data = await this.request<any>('/preds/player-decompositions', { tour });
    return this.extractData<PlayerDecomposition>(data);
  }

  /**
   * Get approach skill data by distance buckets
   * Endpoint: /preds/approach-skill
   *
   * This is particularly valuable for IUP as it maps to approach tests
   */
  async getApproachSkill(tour: string = 'pga'): Promise<ApproachSkillData[]> {
    const data = await this.request<any>('/preds/approach-skill', { tour });
    return this.extractData<ApproachSkillData>(data);
  }

  /**
   * Get pre-tournament predictions
   * Endpoint: /preds/pre-tournament
   */
  async getPreTournamentPredictions(tour: string = 'pga', eventId?: string): Promise<any> {
    const params: Record<string, any> = { tour };
    if (eventId) params.event_id = eventId;
    return this.request<any>('/preds/pre-tournament', params);
  }

  /**
   * Get pre-tournament predictions archive
   * Endpoint: /preds/pre-tournament-archive
   */
  async getPreTournamentArchive(eventId: string, year: number): Promise<any> {
    return this.request<any>('/preds/pre-tournament-archive', { event_id: eventId, year });
  }

  // ============================================================================
  // LIVE MODEL ENDPOINTS
  // ============================================================================

  /**
   * Get live in-play predictions (updates every 5 minutes during tournaments)
   * Endpoint: /preds/in-play
   */
  async getLiveInPlay(tour: string = 'pga'): Promise<any> {
    return this.request<any>('/preds/in-play', { tour });
  }

  /**
   * Get live tournament stats (SG and traditional stats)
   * Endpoint: /preds/live-tournament-stats
   */
  async getLiveTournamentStats(tour: string = 'pga'): Promise<LiveTournamentStats[]> {
    const data = await this.request<any>('/preds/live-tournament-stats', { tour });
    return this.extractData<LiveTournamentStats>(data);
  }

  /**
   * Get live hole-by-hole stats
   * Endpoint: /preds/live-hole-stats
   */
  async getLiveHoleStats(tour: string = 'pga'): Promise<any> {
    return this.request<any>('/preds/live-hole-stats', { tour });
  }

  // ============================================================================
  // HISTORICAL DATA ENDPOINTS
  // ============================================================================

  /**
   * Get list of available historical events
   * Endpoint: /historical-raw-data/event-list
   */
  async getHistoricalEventList(tour?: string): Promise<any[]> {
    const params: Record<string, any> = {};
    if (tour) params.tour = tour;
    const data = await this.request<any>('/historical-raw-data/event-list', params);
    // This endpoint returns an object with event_list array
    if (data?.event_list) return data.event_list;
    return this.extractData(data);
  }

  /**
   * Get historical round data
   * Endpoint: /historical-raw-data/rounds
   *
   * @param tour - Tour name (pga, euro, kft, etc.)
   * @param eventId - Optional specific event ID
   * @param year - Optional year filter
   */
  async getHistoricalRounds(
    tour: string = 'pga',
    eventId?: string,
    year?: number
  ): Promise<HistoricalRound[]> {
    const params: Record<string, any> = { tour };
    if (eventId) params.event_id = eventId;
    if (year) params.year = year;
    const data = await this.request<any>('/historical-raw-data/rounds', params);
    return this.extractData<HistoricalRound>(data);
  }

  /**
   * Calculate tour averages from skill ratings
   * DataGolf doesn't have a direct "tour averages" endpoint, so we calculate from all players
   */
  async getTourAverages(tour: string = 'pga'): Promise<any> {
    await this.applyRateLimit();

    try {
      const skillRatings = await this.getSkillRatings(tour);

      if (!Array.isArray(skillRatings) || skillRatings.length === 0) {
        logger.warn({ tour }, 'No skill ratings data available for tour');
        return null;
      }

      // Calculate averages from all players
      const averages = {
        avgSgTotal: this.calculateAverage(skillRatings, 'sg_total'),
        avgSgOtt: this.calculateAverage(skillRatings, 'sg_ott'),
        avgSgApp: this.calculateAverage(skillRatings, 'sg_app'),
        avgSgArg: this.calculateAverage(skillRatings, 'sg_arg'),
        avgSgPutt: this.calculateAverage(skillRatings, 'sg_putt'),
      };

      logger.debug({ tour, averages }, 'Calculated tour averages');
      return averages;
    } catch (error: any) {
      logger.error({ error: error.message, tour }, 'Failed to calculate tour averages');
      throw error;
    }
  }

  /**
   * Find a player by name
   */
  async getPlayerByName(playerName: string, tour: string = 'pga'): Promise<any | null> {
    try {
      const skillRatings = await this.getSkillRatings(tour);

      if (!Array.isArray(skillRatings)) {
        return null;
      }

      const player = skillRatings.find((p: any) =>
        p.player_name?.toLowerCase().includes(playerName.toLowerCase())
      );

      if (player) {
        logger.debug({ playerName, tour, foundPlayer: player.player_name }, 'Found player in DataGolf');
      } else {
        logger.debug({ playerName, tour }, 'Player not found in DataGolf');
      }

      return player || null;
    } catch (error: any) {
      logger.error({ error: error.message, playerName, tour }, 'Failed to find player');
      return null;
    }
  }

  /**
   * Calculate average for a specific field across all players
   */
  private calculateAverage(data: any[], field: string): number {
    const values = data
      .map(item => item[field])
      .filter(val => val !== null && val !== undefined && !isNaN(val));

    if (values.length === 0) {
      return 0;
    }

    const sum = values.reduce((acc, val) => acc + val, 0);
    return Number((sum / values.length).toFixed(3));
  }

  /**
   * Check if API is configured and available
   */
  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      await this.getSkillRatings('pga');
      return true;
    } catch (error) {
      return false;
    }
  }
}
