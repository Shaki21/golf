/**
 * Data Golf API Service
 * Handles all Data Golf-related API calls for coach statistics and comparisons
 */

import apiClient from './apiClient';

/**
 * Get coach dashboard with all players and their Data Golf stats
 * @param {string} tour - Tour to compare against (pga, euro, kft)
 * @param {number} [season] - Season year (defaults to current year)
 * @returns {Promise<Object>} Coach dashboard data with player stats
 */
export const getCoachDashboard = async (tour = 'pga', season) => {
  const params = { tour };
  if (season) params.season = season;

  const response = await apiClient.get('/datagolf/coach/dashboard', { params });
  return response.data.data;
};

/**
 * Get tour averages for a specific tour and season
 * @param {string} tour - Tour (pga, euro, kft)
 * @param {number} [season] - Season year
 * @returns {Promise<Object>} Tour averages
 */
export const getTourAverages = async (tour = 'pga', season) => {
  const params = { tour };
  if (season) params.season = season;

  const response = await apiClient.get('/datagolf/tour-averages', { params });
  return response.data.data;
};

/**
 * Compare IUP player performance to tour averages
 * @param {string} playerId - IUP player ID
 * @param {string} tour - Tour to compare against
 * @param {number} [season] - Season year
 * @returns {Promise<Object>} Comparison data
 */
export const comparePlayerToTour = async (playerId, tour = 'pga', season) => {
  const params = { playerId, tour };
  if (season) params.season = season;

  const response = await apiClient.get('/datagolf/compare', { params });
  return response.data.data;
};

/**
 * Get approach skill data with filters
 * @param {Object} filters - Query filters
 * @param {string} [filters.tour] - Tour filter
 * @param {number} [filters.season] - Season filter
 * @param {number} [filters.limit] - Results limit (max 100)
 * @param {number} [filters.offset] - Offset for pagination
 * @param {string} [filters.sortBy] - Sort by distance bucket
 * @param {string} [filters.sortOrder] - Sort order (asc, desc)
 * @returns {Promise<Object>} Approach skill data with pagination
 */
export const getApproachSkillData = async (filters = {}) => {
  const response = await apiClient.get('/datagolf/approach-skill', { params: filters });
  return response.data;
};

/**
 * Get tour averages for approach skill by distance
 * @param {string} [tour] - Tour filter
 * @param {number} [season] - Season filter
 * @returns {Promise<Object>} Approach skill averages
 */
export const getApproachSkillAverages = async (tour, season) => {
  const params = {};
  if (tour) params.tour = tour;
  if (season) params.season = season;

  const response = await apiClient.get('/datagolf/approach-skill/averages', { params });
  return response.data.data;
};

/**
 * Get top players for a specific distance bucket
 * @param {string} distance - Distance bucket (e.g., '100-125', '150-175')
 * @param {Object} [options] - Additional options
 * @param {string} [options.tour] - Tour filter
 * @param {number} [options.season] - Season filter
 * @param {number} [options.limit] - Results limit
 * @returns {Promise<Array>} Top players
 */
export const getTopApproachSkillByDistance = async (distance, options = {}) => {
  const params = { distance, ...options };
  const response = await apiClient.get('/datagolf/approach-skill/top', { params });
  return response.data.data;
};

/**
 * Get approach skill for a specific player by name
 * @param {string} playerName - Player name (partial match supported)
 * @param {string} [tour] - Tour filter
 * @param {number} [season] - Season filter
 * @returns {Promise<Object|null>} Player approach skill data
 */
export const getApproachSkillByPlayer = async (playerName, tour, season) => {
  const params = {};
  if (tour) params.tour = tour;
  if (season) params.season = season;

  const response = await apiClient.get(`/datagolf/approach-skill/player/${encodeURIComponent(playerName)}`, { params });
  return response.data.data;
};

/**
 * Get top pro players for comparison
 * @param {Object} [options] - Query options
 * @param {string} [options.tour] - Tour filter (pga, euro, kft)
 * @param {number} [options.limit] - Number of players (max 100)
 * @returns {Promise<Array>} Pro players
 */
export const getProPlayers = async (options = {}) => {
  const response = await apiClient.get('/datagolf/pro-players', { params: options });
  return response.data.data;
};

/**
 * Search pro players by name for comparison feature
 * @param {string} query - Search query (min 2 characters)
 * @param {Object} [options] - Search options
 * @param {string} [options.tour] - Tour filter
 * @param {number} [options.limit] - Max results
 * @returns {Promise<Array>} Matching players
 */
export const searchProPlayers = async (query, options = {}) => {
  const params = { q: query, ...options };
  const response = await apiClient.get('/datagolf/pro-players/search', { params });
  return response.data.data;
};

/**
 * Get a specific pro player by DataGolf ID
 * @param {string} dataGolfId - DataGolf player ID
 * @returns {Promise<Object|null>} Pro player data
 */
export const getProPlayerById = async (dataGolfId) => {
  const response = await apiClient.get(`/datagolf/pro-players/${dataGolfId}`);
  return response.data.data;
};

/**
 * Get aggregated Strokes Gained summary for player dashboard
 * @param {string} [playerId] - Player ID (defaults to current user)
 * @returns {Promise<Object>} SG summary data
 */
export const getPlayerSgSummary = async (playerId) => {
  const params = {};
  if (playerId) params.playerId = playerId;

  const response = await apiClient.get('/datagolf/player-sg-summary', { params });
  return response.data.data;
};

/**
 * Trigger DataGolf data synchronization
 * @returns {Promise<Object>} Sync status
 */
export const triggerDataGolfSync = async () => {
  const response = await apiClient.post('/datagolf/sync');
  return response.data.data;
};

/**
 * Get DataGolf synchronization status
 * @returns {Promise<Object>} Sync status
 */
export const getDataGolfSyncStatus = async () => {
  const response = await apiClient.get('/datagolf/sync-status');
  return response.data.data;
};

/**
 * Convert a single PEI measurement to Strokes Gained
 * @param {Object} data - PEI data
 * @param {number} data.startDistance - Start distance in meters
 * @param {number} data.pei - PEI value (0-100, lower is better)
 * @param {string} [data.lie] - Lie type (tee, fairway, rough, bunker, recovery, green)
 * @returns {Promise<Object>} SG conversion result
 */
export const convertPeiToSg = async (data) => {
  const response = await apiClient.post('/datagolf/pei-to-sg', data);
  return response.data.data;
};

/**
 * Convert multiple PEI measurements to Strokes Gained
 * @param {Array<Object>} shots - Array of shot data
 * @returns {Promise<Object>} Batch SG conversion result
 */
export const convertBatchPeiToSg = async (shots) => {
  const response = await apiClient.post('/datagolf/pei-to-sg/batch', { shots });
  return response.data.data;
};

/**
 * Convert IUP test results to Strokes Gained
 * @param {Object} data - Test data
 * @param {number} data.testNumber - IUP test number (8-11, 15-18)
 * @param {Array<number>} [data.peiValues] - PEI values for approach/chipping/bunker
 * @param {number} [data.madeCount] - Number of putts made
 * @param {number} [data.totalAttempts] - Total putting attempts
 * @param {number} [data.startDistance] - Override start distance
 * @param {string} [data.lie] - Lie type
 * @returns {Promise<Object>} Test SG conversion result
 */
export const convertIupTestToSg = async (data) => {
  const response = await apiClient.post('/datagolf/pei-to-sg/iup-test', data);
  return response.data.data;
};

export default {
  getCoachDashboard,
  getTourAverages,
  comparePlayerToTour,
  getApproachSkillData,
  getApproachSkillAverages,
  getTopApproachSkillByDistance,
  getApproachSkillByPlayer,
  getProPlayers,
  searchProPlayers,
  getProPlayerById,
  getPlayerSgSummary,
  triggerDataGolfSync,
  getDataGolfSyncStatus,
  convertPeiToSg,
  convertBatchPeiToSg,
  convertIupTestToSg,
};
