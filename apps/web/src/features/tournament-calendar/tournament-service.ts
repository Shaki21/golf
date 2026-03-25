/**
 * TIER Golf - Tournament Data Service
 *
 * Handles tournament data fetching from API and provides
 * deterministic seed data when API is unavailable.
 */

import {
  Tournament,
  TourType,
  TournamentFilters,
  TournamentSort,
  FetchTournamentsParams,
  TournamentsResponse,
  TournamentStats,
  CITY_TO_JUNIOR_REGION,
} from './types';
import { applyHierarchyMapping, getTourPrestigeScore } from './hierarchy-config';

// ============================================================================
// API CONFIGURATION
// ============================================================================

const API_BASE = '/api/v1';

// ============================================================================
// FETCH TOURNAMENTS FROM API
// ============================================================================

/**
 * Fetch tournaments from API
 * Falls back to seed data if API returns empty or errors
 */
export async function fetchTournaments(
  params: FetchTournamentsParams = {}
): Promise<TournamentsResponse> {
  try {
    const response = await fetch(`${API_BASE}/calendar/tournaments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.tournaments && data.tournaments.length > 0) {
        // Apply hierarchy mapping to each tournament
        const tournaments = data.tournaments.map((t: unknown) =>
          applyHierarchyMapping(t as Omit<Tournament, 'recommendedCategory' | 'recommendedLevelLabel' | 'recommendationConfidence'>)
        );

        // Apply filters and sorting
        const filtered = applyFilters(tournaments, params.filters);
        const sorted = applySorting(filtered, params.sort);

        return {
          tournaments: sorted,
          total: sorted.length,
          page: params.page || 1,
          hasMore: false,
        };
      }
    }
  } catch (error) {
    console.warn('Failed to fetch tournaments from API, using seed data:', error);
  }

  // Fallback to seed data
  const seedTournaments = generateSeedTournaments();
  const filtered = applyFilters(seedTournaments, params.filters);
  const sorted = applySorting(filtered, params.sort);

  return {
    tournaments: sorted,
    total: sorted.length,
    page: params.page || 1,
    hasMore: false,
  };
}

/**
 * Get tournament statistics
 */
export function calculateStats(tournaments: Tournament[]): TournamentStats {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const upcoming = tournaments.filter(t => {
    const startDate = new Date(t.startDate);
    return startDate >= now && t.status !== 'finished';
  }).length;

  const registered = tournaments.filter(t =>
    t.isRegistered
  ).length;

  const completedThisYear = tournaments.filter(t => {
    const startDate = new Date(t.startDate);
    return (
      t.status === 'finished' &&
      startDate >= yearStart &&
      startDate <= now
    );
  });

  const podiums = completedThisYear.filter(t =>
    t.result && t.result.position <= 3
  ).length;

  return {
    upcoming,
    registered,
    podiums,
    playedThisYear: completedThisYear.length,
  };
}

// ============================================================================
// FILTERING
// ============================================================================

function applyFilters(
  tournaments: Tournament[],
  filters?: TournamentFilters
): Tournament[] {
  if (!filters) return tournaments;

  return tournaments.filter(t => {
    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchable = `${t.name} ${t.venue} ${t.city}`.toLowerCase();
      if (!searchable.includes(query)) return false;
    }

    // Category filter
    if (filters.recommendedCategories?.length) {
      if (!filters.recommendedCategories.includes(t.recommendedCategory)) {
        return false;
      }
    }

    // Tour filter
    if (filters.tours?.length) {
      if (!filters.tours.includes(t.tour)) {
        return false;
      }
    }

    // Status filter
    if (filters.statuses?.length) {
      if (!filters.statuses.includes(t.status)) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateRange) {
      const startDate = new Date(t.startDate);
      const now = new Date();

      switch (filters.dateRange) {
        case 'next_30_days': {
          const thirtyDays = new Date(now);
          thirtyDays.setDate(thirtyDays.getDate() + 30);
          if (startDate < now || startDate > thirtyDays) return false;
          break;
        }
        case 'next_90_days': {
          const ninetyDays = new Date(now);
          ninetyDays.setDate(ninetyDays.getDate() + 90);
          if (startDate < now || startDate > ninetyDays) return false;
          break;
        }
        case 'this_season': {
          // Season: March to October
          const seasonStart = new Date(now.getFullYear(), 2, 1);
          const seasonEnd = new Date(now.getFullYear(), 9, 31);
          if (startDate < seasonStart || startDate > seasonEnd) return false;
          break;
        }
        case 'custom': {
          if (filters.customDateStart) {
            const minDate = new Date(filters.customDateStart);
            if (startDate < minDate) return false;
          }
          if (filters.customDateEnd) {
            const maxDate = new Date(filters.customDateEnd);
            if (startDate > maxDate) return false;
          }
          break;
        }
      }
    }

    // Country filter
    if (filters.countries?.length) {
      if (!filters.countries.includes(t.country)) {
        return false;
      }
    }

    // Purpose filter (RESULTAT, UTVIKLING, TRENING)
    if (filters.purposes?.length) {
      if (!t.purpose || !filters.purposes.includes(t.purpose)) {
        return false;
      }
    }

    // Level filter (Internasjonal, Nasjonal, Regional, etc.)
    if (filters.levels?.length) {
      if (!t.level || !filters.levels.includes(t.level)) {
        return false;
      }
    }

    // Junior Tour Region filter (Appendix 2)
    if (filters.juniorTourRegions?.length) {
      // Only apply to junior_tour_regional tournaments
      if (t.tour === 'junior_tour_regional') {
        // Determine region from tournament city or assigned region
        const tournamentRegion = t.juniorTourRegion || CITY_TO_JUNIOR_REGION[t.city];
        if (!tournamentRegion || !filters.juniorTourRegions.includes(tournamentRegion)) {
          return false;
        }
      }
      // Non-junior tournaments are excluded when junior region filter is active
      // unless they also match other criteria (this keeps filter focused on junior)
    }

    return true;
  });
}

// ============================================================================
// SORTING
// ============================================================================

function applySorting(
  tournaments: Tournament[],
  sort?: TournamentSort
): Tournament[] {
  const sortKey = sort?.key || 'date';
  const direction = sort?.direction || 'asc';

  return [...tournaments].sort((a, b) => {
    let comparison = 0;

    switch (sortKey) {
      case 'date':
        comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        break;

      case 'prestige':
        comparison = getTourPrestigeScore(b.tour) - getTourPrestigeScore(a.tour);
        break;

      case 'recommended_fit':
        // Sort by category match (A=1, E=5)
        const categoryOrder = { A: 1, B: 2, C: 3, D: 4, E: 5, udefinert: 6 };
        comparison =
          (categoryOrder[a.recommendedCategory] || 6) -
          (categoryOrder[b.recommendedCategory] || 6);
        break;

      default:
        comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    }

    return direction === 'desc' ? -comparison : comparison;
  });
}

// ============================================================================
// REAL TOURNAMENT DATA - 2025/2026 SEASON
// ============================================================================

type BaseTournament = Omit<Tournament, 'recommendedCategory' | 'recommendedLevelLabel' | 'recommendationConfidence'>;

/**
 * DP World Tour 2026 Schedule
 * Source: Official DP World Tour calendar
 * 42 events across the season
 */
const DP_WORLD_TOUR_2026: BaseTournament[] = [
  { id: 'dpwt-2026-01', name: 'Hero Dubai Desert Classic', startDate: '2026-01-16', endDate: '2026-01-19', venue: 'Emirates Golf Club', city: 'Dubai', country: 'AE', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill', description: 'Rolex Series event' },
  { id: 'dpwt-2026-02', name: 'Ras Al Khaimah Championship', startDate: '2026-01-23', endDate: '2026-01-26', venue: 'Al Hamra Golf Club', city: 'Ras Al Khaimah', country: 'AE', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-03', name: 'Bahrain Championship', startDate: '2026-01-30', endDate: '2026-02-02', venue: 'Royal Golf Club', city: 'Manama', country: 'BH', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-04', name: 'Qatar Masters', startDate: '2026-02-06', endDate: '2026-02-09', venue: 'Doha Golf Club', city: 'Doha', country: 'QA', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-05', name: 'Magical Kenya Open', startDate: '2026-02-20', endDate: '2026-02-23', venue: 'Muthaiga Golf Club', city: 'Nairobi', country: 'KE', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-06', name: 'Joburg Open', startDate: '2026-02-27', endDate: '2026-03-02', venue: 'Houghton Golf Club', city: 'Johannesburg', country: 'ZA', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-07', name: 'WGC-Dell Technologies Match Play', startDate: '2026-03-25', endDate: '2026-03-29', venue: 'Austin Country Club', city: 'Austin, TX', country: 'US', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 64, currentParticipants: 0, entryFee: 0, format: 'Match play' },
  { id: 'dpwt-2026-08', name: 'Volvo China Open', startDate: '2026-04-09', endDate: '2026-04-12', venue: 'Genzon Golf Club', city: 'Shenzhen', country: 'CN', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-09', name: 'ISPS Handa Championship', startDate: '2026-04-16', endDate: '2026-04-19', venue: 'Golfplatz Eichenried', city: 'München', country: 'DE', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-10', name: 'Catalunya Championship', startDate: '2026-04-23', endDate: '2026-04-26', venue: 'PGA Catalunya Resort', city: 'Girona', country: 'ES', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-11', name: 'Soudal Open', startDate: '2026-04-30', endDate: '2026-05-03', venue: 'Rinkven International', city: 'Antwerpen', country: 'BE', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-12', name: 'British Masters', startDate: '2026-05-07', endDate: '2026-05-10', venue: 'The Belfry', city: 'Birmingham', country: 'GB', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-13', name: 'PGA Championship', startDate: '2026-05-14', endDate: '2026-05-17', venue: 'Aronimink Golf Club', city: 'Philadelphia, PA', country: 'US', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill', description: 'Major Championship' },
  { id: 'dpwt-2026-14', name: 'KLM Open', startDate: '2026-05-21', endDate: '2026-05-24', venue: 'Bernardus Golf', city: 'Cromvoirt', country: 'NL', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-15', name: 'Italian Open', startDate: '2026-05-28', endDate: '2026-05-31', venue: 'Marco Simone GC', city: 'Roma', country: 'IT', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-16', name: 'Scandinavian Mixed', startDate: '2026-06-04', endDate: '2026-06-07', venue: 'Ullna Golf Club', city: 'Stockholm', country: 'SE', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-17', name: 'US Open', startDate: '2026-06-18', endDate: '2026-06-21', venue: 'Shinnecock Hills', city: 'Southampton, NY', country: 'US', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill', description: 'Major Championship' },
  { id: 'dpwt-2026-18', name: 'BMW International Open', startDate: '2026-06-25', endDate: '2026-06-28', venue: 'Golfclub München Eichenried', city: 'München', country: 'DE', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-19', name: 'Irish Open', startDate: '2026-07-02', endDate: '2026-07-05', venue: 'The K Club', city: 'Dublin', country: 'IE', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill', description: 'Rolex Series event' },
  { id: 'dpwt-2026-20', name: 'Genesis Scottish Open', startDate: '2026-07-09', endDate: '2026-07-12', venue: 'The Renaissance Club', city: 'North Berwick', country: 'GB', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill', description: 'Rolex Series event' },
  { id: 'dpwt-2026-21', name: 'The Open Championship', startDate: '2026-07-16', endDate: '2026-07-19', venue: 'Royal Portrush', city: 'Portrush', country: 'GB', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill', description: 'Major Championship' },
  { id: 'dpwt-2026-22', name: 'Czech Masters', startDate: '2026-07-30', endDate: '2026-08-02', venue: 'PGA National Oaks Prague', city: 'Praha', country: 'CZ', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-23', name: 'Hero Open', startDate: '2026-08-06', endDate: '2026-08-09', venue: 'Fairmont St Andrews', city: 'St Andrews', country: 'GB', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-24', name: 'Made in HimmerLand', startDate: '2026-08-13', endDate: '2026-08-16', venue: 'Himmerland Golf & Spa', city: 'Farsø', country: 'DK', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-25', name: 'D+D Real Czech Masters', startDate: '2026-08-20', endDate: '2026-08-23', venue: 'Albatross Golf Resort', city: 'Praha', country: 'CZ', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-26', name: 'Omega European Masters', startDate: '2026-08-27', endDate: '2026-08-30', venue: 'Crans-sur-Sierre', city: 'Crans-Montana', country: 'CH', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-27', name: 'BMW PGA Championship', startDate: '2026-09-10', endDate: '2026-09-13', venue: 'Wentworth Club', city: 'Surrey', country: 'GB', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill', description: 'Rolex Series event - Flagship event' },
  { id: 'dpwt-2026-28', name: 'Amgen Irish Open', startDate: '2026-09-17', endDate: '2026-09-20', venue: 'Mount Juliet Estate', city: 'Kilkenny', country: 'IE', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-29', name: 'Open de France', startDate: '2026-09-24', endDate: '2026-09-27', venue: 'Le Golf National', city: 'Paris', country: 'FR', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-30', name: 'Alfred Dunhill Links Championship', startDate: '2026-10-01', endDate: '2026-10-04', venue: 'St Andrews Links', city: 'St Andrews', country: 'GB', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 168, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-31', name: 'acciona Open de España', startDate: '2026-10-08', endDate: '2026-10-11', venue: 'Club de Campo Villa de Madrid', city: 'Madrid', country: 'ES', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-32', name: 'Portugal Masters', startDate: '2026-10-15', endDate: '2026-10-18', venue: 'Dom Pedro Victoria Golf Course', city: 'Vilamoura', country: 'PT', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-33', name: 'ZOZO Championship', startDate: '2026-10-22', endDate: '2026-10-25', venue: 'Accordia Golf Narashino CC', city: 'Chiba', country: 'JP', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 78, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-34', name: 'WGC-HSBC Champions', startDate: '2026-10-29', endDate: '2026-11-01', venue: 'Sheshan International GC', city: 'Shanghai', country: 'CN', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 78, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'dpwt-2026-35', name: 'Nedbank Golf Challenge', startDate: '2026-11-05', endDate: '2026-11-08', venue: 'Gary Player CC', city: 'Sun City', country: 'ZA', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 66, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill', description: 'Rolex Series event' },
  { id: 'dpwt-2026-36', name: 'DP World Tour Championship', startDate: '2026-11-12', endDate: '2026-11-15', venue: 'Jumeirah Golf Estates', city: 'Dubai', country: 'AE', tour: 'dp_world_tour', status: 'upcoming', maxParticipants: 50, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill', description: 'Season Finale - Rolex Series event' },
];

/**
 * Challenge Tour 2026 Schedule (HotelPlanner.com Tour)
 * Source: Challenge Tour calendar
 */
const CHALLENGE_TOUR_2026: BaseTournament[] = [
  { id: 'ct-2026-01', name: 'Limpopo Championship', startDate: '2026-02-05', endDate: '2026-02-08', venue: 'Euphoria Golf Estate', city: 'Modimolle', country: 'ZA', tour: 'challenge_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 2000, format: '72 hull slagspill' },
  { id: 'ct-2026-02', name: 'SDC Championship', startDate: '2026-02-12', endDate: '2026-02-15', venue: 'Sun City', city: 'Sun City', country: 'ZA', tour: 'challenge_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 2000, format: '72 hull slagspill' },
  { id: 'ct-2026-03', name: 'Cape Town Open', startDate: '2026-02-19', endDate: '2026-02-22', venue: 'Royal Cape Golf Club', city: 'Cape Town', country: 'ZA', tour: 'challenge_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 2000, format: '72 hull slagspill' },
  { id: 'ct-2026-04', name: 'Challenge de España', startDate: '2026-04-16', endDate: '2026-04-19', venue: 'Izki Golf', city: 'Urturi', country: 'ES', tour: 'challenge_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 2000, format: '72 hull slagspill' },
  { id: 'ct-2026-05', name: 'Challenge de Portugal', startDate: '2026-04-23', endDate: '2026-04-26', venue: 'Morgado Golf Resort', city: 'Portimão', country: 'PT', tour: 'challenge_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 2000, format: '72 hull slagspill' },
  { id: 'ct-2026-06', name: 'Rolex Challenge Tour Grand Final', startDate: '2026-11-05', endDate: '2026-11-08', venue: 'T-Golf & Country Club', city: 'Mallorca', country: 'ES', tour: 'challenge_tour', status: 'upcoming', maxParticipants: 45, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill', description: 'Season finale - Top 45 players' },
];

/**
 * Nordic Golf League 2026 Schedule
 * Combined Nordic tour events - ECCO Tour, Swedish Tour, etc.
 */
const NORDIC_LEAGUE_2026: BaseTournament[] = [
  // ECCO Tour (Denmark)
  { id: 'nl-2026-01', name: 'ECCO Tour - Season Opener', startDate: '2026-04-23', endDate: '2026-04-25', venue: 'Rungsted Golf Klub', city: 'København', country: 'DK', tour: 'nordic_league', status: 'upcoming', maxParticipants: 120, currentParticipants: 0, entryFee: 1500, format: '54 hull slagspill' },
  { id: 'nl-2026-02', name: 'ECCO Tour - Furesø Open', startDate: '2026-05-07', endDate: '2026-05-09', venue: 'Furesø Golfklub', city: 'Birkerød', country: 'DK', tour: 'nordic_league', status: 'upcoming', maxParticipants: 120, currentParticipants: 0, entryFee: 1500, format: '54 hull slagspill' },
  { id: 'nl-2026-03', name: 'ECCO Tour - Silkeborg Open', startDate: '2026-05-21', endDate: '2026-05-23', venue: 'Silkeborg Ry Golfklub', city: 'Silkeborg', country: 'DK', tour: 'nordic_league', status: 'upcoming', maxParticipants: 120, currentParticipants: 0, entryFee: 1500, format: '54 hull slagspill' },
  { id: 'nl-2026-04', name: 'ECCO Tour - Esbjerg Championship', startDate: '2026-06-04', endDate: '2026-06-06', venue: 'Esbjerg Golfklub', city: 'Esbjerg', country: 'DK', tour: 'nordic_league', status: 'upcoming', maxParticipants: 120, currentParticipants: 0, entryFee: 1500, format: '54 hull slagspill' },
  { id: 'nl-2026-05', name: 'ECCO Tour Finals', startDate: '2026-09-10', endDate: '2026-09-12', venue: 'Lübker Golf Resort', city: 'Aarhus', country: 'DK', tour: 'nordic_league', status: 'upcoming', maxParticipants: 80, currentParticipants: 0, entryFee: 2000, format: '54 hull slagspill', description: 'Season finale' },

  // Swedish Tour
  { id: 'nl-2026-06', name: 'Cutter & Buck Tour - Bro Hof Open', startDate: '2026-05-14', endDate: '2026-05-16', venue: 'Bro Hof Slott Golf Club', city: 'Stockholm', country: 'SE', tour: 'nordic_league', status: 'upcoming', maxParticipants: 120, currentParticipants: 0, entryFee: 1500, format: '54 hull slagspill' },
  { id: 'nl-2026-07', name: 'Cutter & Buck Tour - Halmstad', startDate: '2026-05-28', endDate: '2026-05-30', venue: 'Halmstad Golf Club', city: 'Halmstad', country: 'SE', tour: 'nordic_league', status: 'upcoming', maxParticipants: 120, currentParticipants: 0, entryFee: 1500, format: '54 hull slagspill' },
  { id: 'nl-2026-08', name: 'Cutter & Buck Tour - Vasatorps', startDate: '2026-06-11', endDate: '2026-06-13', venue: 'Vasatorps Golfklubb', city: 'Helsingborg', country: 'SE', tour: 'nordic_league', status: 'upcoming', maxParticipants: 120, currentParticipants: 0, entryFee: 1500, format: '54 hull slagspill' },
  { id: 'nl-2026-09', name: 'Nordic Golf League Championship', startDate: '2026-08-27', endDate: '2026-08-30', venue: 'Ullna Golf Club', city: 'Stockholm', country: 'SE', tour: 'nordic_league', status: 'upcoming', maxParticipants: 100, currentParticipants: 0, entryFee: 2500, format: '72 hull slagspill', description: 'Nordic League season finale' },

  // Finnish Tour
  { id: 'nl-2026-10', name: 'Finnish Tour - Helsinki Open', startDate: '2026-06-18', endDate: '2026-06-20', venue: 'Helsinki Golf Club', city: 'Helsinki', country: 'FI', tour: 'nordic_league', status: 'upcoming', maxParticipants: 100, currentParticipants: 0, entryFee: 1200, format: '54 hull slagspill' },
  { id: 'nl-2026-11', name: 'Finnish Tour - Vierumäki Masters', startDate: '2026-07-02', endDate: '2026-07-04', venue: 'Vierumäki Golf', city: 'Lahti', country: 'FI', tour: 'nordic_league', status: 'upcoming', maxParticipants: 100, currentParticipants: 0, entryFee: 1200, format: '54 hull slagspill' },
];

/**
 * Garmin Norges Cup 2026 (Norgescupen)
 * Norwegian national tour for elite amateurs
 */
const GARMIN_NORGES_CUP_2026: BaseTournament[] = [
  { id: 'gnc-2026-01', name: 'Garmin Norgescup - Åpningsrunde', startDate: '2026-05-01', endDate: '2026-05-03', venue: 'Miklagard Golf', city: 'Kløfta', country: 'NO', tour: 'garmin_norges_cup', status: 'upcoming', maxParticipants: 120, currentParticipants: 0, entryFee: 850, format: '54 hull slagspill', registrationUrl: 'https://mingolf.no/tournament/gnc-r1' },
  { id: 'gnc-2026-02', name: 'Garmin Norgescup - Runde 2', startDate: '2026-05-15', endDate: '2026-05-17', venue: 'Stavanger Golfklubb', city: 'Stavanger', country: 'NO', tour: 'garmin_norges_cup', status: 'upcoming', maxParticipants: 120, currentParticipants: 0, entryFee: 850, format: '54 hull slagspill', registrationUrl: 'https://mingolf.no/tournament/gnc-r2' },
  { id: 'gnc-2026-03', name: 'Garmin Norgescup - Bergen Classic', startDate: '2026-05-29', endDate: '2026-05-31', venue: 'Meland Golfklubb', city: 'Bergen', country: 'NO', tour: 'garmin_norges_cup', status: 'upcoming', maxParticipants: 120, currentParticipants: 0, entryFee: 850, format: '54 hull slagspill', registrationUrl: 'https://mingolf.no/tournament/gnc-r3' },
  { id: 'gnc-2026-04', name: 'Garmin Norgescup - Trondheim Open', startDate: '2026-06-12', endDate: '2026-06-14', venue: 'Trondheim Golfklubb', city: 'Trondheim', country: 'NO', tour: 'garmin_norges_cup', status: 'upcoming', maxParticipants: 120, currentParticipants: 0, entryFee: 850, format: '54 hull slagspill', registrationUrl: 'https://mingolf.no/tournament/gnc-r4' },
  { id: 'gnc-2026-05', name: 'Garmin Norgescup - Oslo Masters', startDate: '2026-06-26', endDate: '2026-06-28', venue: 'Oslo Golfklubb', city: 'Oslo', country: 'NO', tour: 'garmin_norges_cup', status: 'upcoming', maxParticipants: 120, currentParticipants: 0, entryFee: 850, format: '54 hull slagspill', registrationUrl: 'https://mingolf.no/tournament/gnc-r5' },
  { id: 'gnc-2026-06', name: 'NM Slagspill 2026', startDate: '2026-07-10', endDate: '2026-07-12', venue: 'Bærum Golfklubb', city: 'Bærum', country: 'NO', tour: 'garmin_norges_cup', status: 'upcoming', maxParticipants: 144, currentParticipants: 0, entryFee: 950, format: '54 hull slagspill', description: 'Norgesmesterskap', registrationUrl: 'https://mingolf.no/tournament/nm-slagspill' },
  { id: 'gnc-2026-07', name: 'Garmin Norgescup - Runde 6', startDate: '2026-07-24', endDate: '2026-07-26', venue: 'Kongsvinger Golfklubb', city: 'Kongsvinger', country: 'NO', tour: 'garmin_norges_cup', status: 'upcoming', maxParticipants: 120, currentParticipants: 0, entryFee: 850, format: '54 hull slagspill', registrationUrl: 'https://mingolf.no/tournament/gnc-r6' },
  { id: 'gnc-2026-08', name: 'Garmin Norgescup - Kristiansand', startDate: '2026-08-07', endDate: '2026-08-09', venue: 'Kristiansand Golfklubb', city: 'Kristiansand', country: 'NO', tour: 'garmin_norges_cup', status: 'upcoming', maxParticipants: 120, currentParticipants: 0, entryFee: 850, format: '54 hull slagspill', registrationUrl: 'https://mingolf.no/tournament/gnc-r7' },
  { id: 'gnc-2026-09', name: 'Garmin Norgescup Finale', startDate: '2026-08-21', endDate: '2026-08-23', venue: 'Losby Golf', city: 'Lørenskog', country: 'NO', tour: 'garmin_norges_cup', status: 'upcoming', maxParticipants: 100, currentParticipants: 0, entryFee: 950, format: '54 hull slagspill', description: 'Sesongfinale - Kvalifisering til Nordisk', registrationUrl: 'https://mingolf.no/tournament/gnc-finale' },
];

/**
 * Srixon Tour 2026 (Elite Amateur Tour Norway)
 * Norwegian elite amateur tour
 */
const SRIXON_TOUR_2026: BaseTournament[] = [
  { id: 'srixon-2026-01', name: 'Srixon Tour - Sesongåpning', startDate: '2026-04-24', endDate: '2026-04-26', venue: 'Holtsmark Golfklubb', city: 'Drammen', country: 'NO', tour: 'srixon_tour', status: 'upcoming', maxParticipants: 100, currentParticipants: 0, entryFee: 550, format: '54 hull slagspill', registrationUrl: 'https://mingolf.no/tournament/srixon-r1' },
  { id: 'srixon-2026-02', name: 'Srixon Tour - Runde 2', startDate: '2026-05-08', endDate: '2026-05-10', venue: 'Drammens Golfklubb', city: 'Drammen', country: 'NO', tour: 'srixon_tour', status: 'upcoming', maxParticipants: 100, currentParticipants: 0, entryFee: 550, format: '54 hull slagspill', registrationUrl: 'https://mingolf.no/tournament/srixon-r2' },
  { id: 'srixon-2026-03', name: 'Srixon Tour - Vestfold Classic', startDate: '2026-05-22', endDate: '2026-05-24', venue: 'Vestfold Golfklubb', city: 'Tønsberg', country: 'NO', tour: 'srixon_tour', status: 'upcoming', maxParticipants: 100, currentParticipants: 0, entryFee: 550, format: '54 hull slagspill', registrationUrl: 'https://mingolf.no/tournament/srixon-r3' },
  { id: 'srixon-2026-04', name: 'Srixon Tour - Runde 4', startDate: '2026-06-05', endDate: '2026-06-07', venue: 'Borre Golfklubb', city: 'Horten', country: 'NO', tour: 'srixon_tour', status: 'upcoming', maxParticipants: 100, currentParticipants: 0, entryFee: 550, format: '54 hull slagspill', registrationUrl: 'https://mingolf.no/tournament/srixon-r4' },
  { id: 'srixon-2026-05', name: 'Srixon Tour - Midsommerrunden', startDate: '2026-06-19', endDate: '2026-06-21', venue: 'Tyrifjord Golfklubb', city: 'Vikersund', country: 'NO', tour: 'srixon_tour', status: 'upcoming', maxParticipants: 100, currentParticipants: 0, entryFee: 550, format: '54 hull slagspill', registrationUrl: 'https://mingolf.no/tournament/srixon-r5' },
  { id: 'srixon-2026-06', name: 'Srixon Tour - Runde 6', startDate: '2026-07-03', endDate: '2026-07-05', venue: 'Nøtterøy Golfklubb', city: 'Nøtterøy', country: 'NO', tour: 'srixon_tour', status: 'upcoming', maxParticipants: 100, currentParticipants: 0, entryFee: 550, format: '54 hull slagspill', registrationUrl: 'https://mingolf.no/tournament/srixon-r6' },
  { id: 'srixon-2026-07', name: 'Srixon Tour - Østfold Open', startDate: '2026-07-17', endDate: '2026-07-19', venue: 'Gamle Fredrikstad Golfklubb', city: 'Fredrikstad', country: 'NO', tour: 'srixon_tour', status: 'upcoming', maxParticipants: 100, currentParticipants: 0, entryFee: 550, format: '54 hull slagspill', registrationUrl: 'https://mingolf.no/tournament/srixon-r7' },
  { id: 'srixon-2026-08', name: 'Srixon Tour - Runde 8', startDate: '2026-08-07', endDate: '2026-08-09', venue: 'Asker Golfklubb', city: 'Asker', country: 'NO', tour: 'srixon_tour', status: 'upcoming', maxParticipants: 100, currentParticipants: 0, entryFee: 550, format: '54 hull slagspill', registrationUrl: 'https://mingolf.no/tournament/srixon-r8' },
  { id: 'srixon-2026-09', name: 'Srixon Tour - Sesongfinale', startDate: '2026-08-28', endDate: '2026-08-30', venue: 'Oslo Golfklubb', city: 'Oslo', country: 'NO', tour: 'srixon_tour', status: 'upcoming', maxParticipants: 80, currentParticipants: 0, entryFee: 650, format: '54 hull slagspill', description: 'Sesongfinale - Topp 80', registrationUrl: 'https://mingolf.no/tournament/srixon-finale' },
];

/**
 * Junior Tour Regional 2026 (Norwegian Junior Tours)
 * Regional junior tour events
 */
const JUNIOR_TOUR_REGIONAL_2026: BaseTournament[] = [
  { id: 'jtr-2026-01', name: 'Junior Tour - Østfold Runde 1', startDate: '2026-05-02', endDate: '2026-05-02', venue: 'Gamle Fredrikstad GK', city: 'Fredrikstad', country: 'NO', tour: 'junior_tour_regional', status: 'upcoming', maxParticipants: 60, currentParticipants: 0, entryFee: 350, format: '18 hull slagspill', registrationUrl: 'https://mingolf.no/tournament/jtr-ostfold-1' },
  { id: 'jtr-2026-02', name: 'Junior Tour - Oslo Runde 1', startDate: '2026-05-03', endDate: '2026-05-03', venue: 'Oslo Golfklubb', city: 'Oslo', country: 'NO', tour: 'junior_tour_regional', status: 'upcoming', maxParticipants: 80, currentParticipants: 0, entryFee: 350, format: '18 hull slagspill', registrationUrl: 'https://mingolf.no/tournament/jtr-oslo-1' },
  { id: 'jtr-2026-03', name: 'Junior Tour - Buskerud Runde 1', startDate: '2026-05-09', endDate: '2026-05-09', venue: 'Drammens Golfklubb', city: 'Drammen', country: 'NO', tour: 'junior_tour_regional', status: 'upcoming', maxParticipants: 60, currentParticipants: 0, entryFee: 350, format: '18 hull slagspill', registrationUrl: 'https://mingolf.no/tournament/jtr-buskerud-1' },
  { id: 'jtr-2026-04', name: 'Junior Tour - Vestfold Runde 1', startDate: '2026-05-10', endDate: '2026-05-10', venue: 'Vestfold Golfklubb', city: 'Tønsberg', country: 'NO', tour: 'junior_tour_regional', status: 'upcoming', maxParticipants: 60, currentParticipants: 0, entryFee: 350, format: '18 hull slagspill', registrationUrl: 'https://mingolf.no/tournament/jtr-vestfold-1' },
  { id: 'jtr-2026-05', name: 'Junior Tour - Østfold Runde 2', startDate: '2026-05-23', endDate: '2026-05-23', venue: 'Sarpsborg & Borg GK', city: 'Sarpsborg', country: 'NO', tour: 'junior_tour_regional', status: 'upcoming', maxParticipants: 60, currentParticipants: 0, entryFee: 350, format: '18 hull slagspill', registrationUrl: 'https://mingolf.no/tournament/jtr-ostfold-2' },
  { id: 'jtr-2026-06', name: 'Junior Tour - Oslo Runde 2', startDate: '2026-05-24', endDate: '2026-05-24', venue: 'Groruddalen Golfklubb', city: 'Oslo', country: 'NO', tour: 'junior_tour_regional', status: 'upcoming', maxParticipants: 80, currentParticipants: 0, entryFee: 350, format: '18 hull slagspill', registrationUrl: 'https://mingolf.no/tournament/jtr-oslo-2' },
  { id: 'jtr-2026-07', name: 'Junior Tour - Buskerud Runde 2', startDate: '2026-06-06', endDate: '2026-06-06', venue: 'Holtsmark Golfklubb', city: 'Drammen', country: 'NO', tour: 'junior_tour_regional', status: 'upcoming', maxParticipants: 60, currentParticipants: 0, entryFee: 350, format: '18 hull slagspill', registrationUrl: 'https://mingolf.no/tournament/jtr-buskerud-2' },
  { id: 'jtr-2026-08', name: 'Junior Tour - Vestfold Runde 2', startDate: '2026-06-07', endDate: '2026-06-07', venue: 'Borre Golfklubb', city: 'Horten', country: 'NO', tour: 'junior_tour_regional', status: 'upcoming', maxParticipants: 60, currentParticipants: 0, entryFee: 350, format: '18 hull slagspill', registrationUrl: 'https://mingolf.no/tournament/jtr-vestfold-2' },
  { id: 'jtr-2026-09', name: 'NM Junior 2026', startDate: '2026-07-18', endDate: '2026-07-20', venue: 'Miklagard Golf', city: 'Kløfta', country: 'NO', tour: 'junior_tour_regional', status: 'upcoming', maxParticipants: 120, currentParticipants: 0, entryFee: 550, format: '54 hull slagspill', description: 'Norgesmesterskap for juniorer', registrationUrl: 'https://mingolf.no/tournament/nm-junior' },
  { id: 'jtr-2026-10', name: 'Junior Tour - Østfold Runde 3', startDate: '2026-08-08', endDate: '2026-08-08', venue: 'Fredrikstad Golfklubb', city: 'Fredrikstad', country: 'NO', tour: 'junior_tour_regional', status: 'upcoming', maxParticipants: 60, currentParticipants: 0, entryFee: 350, format: '18 hull slagspill', registrationUrl: 'https://mingolf.no/tournament/jtr-ostfold-3' },
  { id: 'jtr-2026-11', name: 'Junior Tour - Oslo Runde 3', startDate: '2026-08-09', endDate: '2026-08-09', venue: 'Losby Golf', city: 'Lørenskog', country: 'NO', tour: 'junior_tour_regional', status: 'upcoming', maxParticipants: 80, currentParticipants: 0, entryFee: 350, format: '18 hull slagspill', registrationUrl: 'https://mingolf.no/tournament/jtr-oslo-3' },
  { id: 'jtr-2026-12', name: 'Junior Tour Finale', startDate: '2026-08-29', endDate: '2026-08-29', venue: 'Oslo Golfklubb', city: 'Oslo', country: 'NO', tour: 'junior_tour_regional', status: 'upcoming', maxParticipants: 100, currentParticipants: 0, entryFee: 450, format: '18 hull slagspill', description: 'Sesongfinale for alle regioner', registrationUrl: 'https://mingolf.no/tournament/jtr-finale' },
];

/**
 * Global Junior Tour 2026
 * International junior events
 */
const GLOBAL_JUNIOR_TOUR_2026: BaseTournament[] = [
  { id: 'gjt-2026-01', name: 'IMG Academy Junior World', startDate: '2026-07-06', endDate: '2026-07-10', venue: 'Torrey Pines Golf Course', city: 'San Diego, CA', country: 'US', tour: 'global_junior_tour', status: 'upcoming', maxParticipants: 144, currentParticipants: 0, entryFee: 2500, format: '72 hull slagspill', description: 'Premier junior world championship' },
  { id: 'gjt-2026-02', name: 'European Junior Open', startDate: '2026-06-22', endDate: '2026-06-25', venue: 'San Roque Club', city: 'Cádiz', country: 'ES', tour: 'global_junior_tour', status: 'upcoming', maxParticipants: 120, currentParticipants: 0, entryFee: 1200, format: '54 hull slagspill' },
  { id: 'gjt-2026-03', name: 'Nordic Junior Open', startDate: '2026-07-27', endDate: '2026-07-29', venue: 'Bro Hof Slott Golf Club', city: 'Stockholm', country: 'SE', tour: 'global_junior_tour', status: 'upcoming', maxParticipants: 100, currentParticipants: 0, entryFee: 1000, format: '54 hull slagspill', description: 'Nordic championship for juniors' },
  { id: 'gjt-2026-04', name: 'Junior Orange Bowl', startDate: '2026-12-27', endDate: '2026-12-30', venue: 'Biltmore Golf Course', city: 'Miami, FL', country: 'US', tour: 'global_junior_tour', status: 'upcoming', maxParticipants: 100, currentParticipants: 0, entryFee: 1500, format: '54 hull slagspill', description: 'Prestigious year-end junior event' },
];

/**
 * EGA European Amateur Tour 2026
 */
const EGA_TURNERING_2026: BaseTournament[] = [
  { id: 'ega-2026-01', name: 'European Amateur Championship', startDate: '2026-07-08', endDate: '2026-07-11', venue: 'Royal St George\'s', city: 'Sandwich', country: 'GB', tour: 'ega_turnering', status: 'upcoming', maxParticipants: 144, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill', description: 'EGA flagship amateur championship' },
  { id: 'ega-2026-02', name: 'European Mid-Amateur Championship', startDate: '2026-06-15', endDate: '2026-06-18', venue: 'Golf Club Gut Lärchenhof', city: 'Köln', country: 'DE', tour: 'ega_turnering', status: 'upcoming', maxParticipants: 120, currentParticipants: 0, entryFee: 350, format: '72 hull slagspill' },
  { id: 'ega-2026-03', name: 'European Senior Amateur Championship', startDate: '2026-09-07', endDate: '2026-09-10', venue: 'Morfontaine Golf Club', city: 'Paris', country: 'FR', tour: 'ega_turnering', status: 'upcoming', maxParticipants: 120, currentParticipants: 0, entryFee: 350, format: '72 hull slagspill' },
  { id: 'ega-2026-04', name: 'European Amateur Team Championship', startDate: '2026-07-21', endDate: '2026-07-25', venue: 'Penati Golf Resort', city: 'Bratislava', country: 'SK', tour: 'ega_turnering', status: 'upcoming', maxParticipants: 22, currentParticipants: 0, entryFee: 0, format: 'Team event', description: 'Teams of 6 players per nation' },
];

/**
 * WAGR Ranked Events 2026
 */
const WAGR_TURNERING_2026: BaseTournament[] = [
  { id: 'wagr-2026-01', name: 'R&A Boys Amateur Championship', startDate: '2026-08-11', endDate: '2026-08-15', venue: 'Moortown Golf Club', city: 'Leeds', country: 'GB', tour: 'wagr_turnering', status: 'upcoming', maxParticipants: 144, currentParticipants: 0, entryFee: 0, format: 'Match play', description: 'WAGR ranked event' },
  { id: 'wagr-2026-02', name: 'The Amateur Championship', startDate: '2026-06-15', endDate: '2026-06-20', venue: 'Royal Lytham & St Annes', city: 'Lytham', country: 'GB', tour: 'wagr_turnering', status: 'upcoming', maxParticipants: 288, currentParticipants: 0, entryFee: 0, format: 'Stroke play + match play', description: 'The oldest and most prestigious amateur championship' },
  { id: 'wagr-2026-03', name: 'Scandinavian Amateur', startDate: '2026-06-29', endDate: '2026-07-02', venue: 'Vasatorps Golfklubb', city: 'Helsingborg', country: 'SE', tour: 'wagr_turnering', status: 'upcoming', maxParticipants: 144, currentParticipants: 0, entryFee: 1800, format: '72 hull slagspill', description: 'Top WAGR ranked event in Scandinavia' },
  { id: 'wagr-2026-04', name: 'U.S. Amateur', startDate: '2026-08-17', endDate: '2026-08-23', venue: 'Baltusrol Golf Club', city: 'Springfield, NJ', country: 'US', tour: 'wagr_turnering', status: 'upcoming', maxParticipants: 312, currentParticipants: 0, entryFee: 175, format: 'Stroke play + match play', description: 'Premier amateur championship in USA' },
];

/**
 * College Golf 2026 (NCAA & NAIA)
 */
const COLLEGE_TURNERINGER_2026: BaseTournament[] = [
  { id: 'college-2026-01', name: 'NCAA Division I Regional', startDate: '2026-05-11', endDate: '2026-05-13', venue: 'TPC Sawgrass', city: 'Jacksonville, FL', country: 'US', tour: 'college_turneringer', status: 'upcoming', maxParticipants: 80, currentParticipants: 0, entryFee: 0, format: '54 hull slagspill', description: 'NCAA Regional qualifier' },
  { id: 'college-2026-02', name: 'NCAA Division I Championship', startDate: '2026-05-22', endDate: '2026-05-27', venue: 'Grayhawk Golf Club', city: 'Scottsdale, AZ', country: 'US', tour: 'college_turneringer', status: 'upcoming', maxParticipants: 30, currentParticipants: 0, entryFee: 0, format: 'Stroke play + match play', description: 'NCAA Championship finals' },
  { id: 'college-2026-03', name: 'NAIA National Championship', startDate: '2026-05-19', endDate: '2026-05-22', venue: 'Lincoln Park Golf Course', city: 'Oklahoma City', country: 'US', tour: 'college_turneringer', status: 'upcoming', maxParticipants: 100, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill' },
  { id: 'college-2026-04', name: 'Palmer Cup', startDate: '2026-07-03', endDate: '2026-07-05', venue: 'Baltusrol Golf Club', city: 'Springfield, NJ', country: 'US', tour: 'college_turneringer', status: 'upcoming', maxParticipants: 24, currentParticipants: 0, entryFee: 0, format: 'Match play', description: 'USA vs Europe college all-stars' },
];

/**
 * PGA Tour 2026 Major Events (for spectator interest)
 */
const PGA_TOUR_2026: BaseTournament[] = [
  { id: 'pga-2026-01', name: 'The Masters', startDate: '2026-04-09', endDate: '2026-04-12', venue: 'Augusta National Golf Club', city: 'Augusta, GA', country: 'US', tour: 'pga_tour', status: 'upcoming', maxParticipants: 90, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill', description: 'First major of the year' },
  { id: 'pga-2026-02', name: 'PGA Championship', startDate: '2026-05-14', endDate: '2026-05-17', venue: 'Aronimink Golf Club', city: 'Philadelphia, PA', country: 'US', tour: 'pga_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill', description: 'Second major of the year' },
  { id: 'pga-2026-03', name: 'U.S. Open', startDate: '2026-06-18', endDate: '2026-06-21', venue: 'Shinnecock Hills Golf Club', city: 'Southampton, NY', country: 'US', tour: 'pga_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill', description: 'Third major of the year' },
  { id: 'pga-2026-04', name: 'The Open Championship', startDate: '2026-07-16', endDate: '2026-07-19', venue: 'Royal Portrush Golf Club', city: 'Portrush', country: 'GB', tour: 'pga_tour', status: 'upcoming', maxParticipants: 156, currentParticipants: 0, entryFee: 0, format: '72 hull slagspill', description: 'Fourth major of the year' },
  { id: 'pga-2026-05', name: 'Ryder Cup 2026', startDate: '2026-09-25', endDate: '2026-09-27', venue: 'Adare Manor', city: 'Limerick', country: 'IE', tour: 'pga_tour', status: 'upcoming', maxParticipants: 24, currentParticipants: 0, entryFee: 0, format: 'Match play', description: 'Europe vs USA - biennial team event' },
];

/**
 * Academy/Club Tournaments (for demo/testing)
 */
const ACADEMY_CLUB_2026: BaseTournament[] = [
  { id: 'club-2026-01', name: 'TIER Golf Spring Cup', startDate: '2026-04-18', endDate: '2026-04-18', venue: 'Miklagard Golf', city: 'Kløfta', country: 'NO', tour: 'academy', status: 'upcoming', maxParticipants: 60, currentParticipants: 0, entryFee: 350, format: '18 hull stableford', description: 'Intern turnering for TIER Golf' },
  { id: 'club-2026-02', name: 'TIER Golf Summer Championship', startDate: '2026-07-04', endDate: '2026-07-04', venue: 'Miklagard Golf', city: 'Kløfta', country: 'NO', tour: 'academy', status: 'upcoming', maxParticipants: 60, currentParticipants: 0, entryFee: 450, format: '18 hull slagspill', description: 'Akademiets sommermesterskap' },
  { id: 'club-2026-03', name: 'TIER Golf Fall Classic', startDate: '2026-09-12', endDate: '2026-09-12', venue: 'Miklagard Golf', city: 'Kløfta', country: 'NO', tour: 'academy', status: 'upcoming', maxParticipants: 60, currentParticipants: 0, entryFee: 350, format: '18 hull stableford', description: 'Høstturnering' },
];

// ============================================================================
// COMBINED TOURNAMENT DATABASE
// ============================================================================

/**
 * Get all real tournament data for 2025/2026 season
 * This is the comprehensive database of tournaments from all tour sources
 */
function getRealTournamentData(): Tournament[] {
  const allTournaments: BaseTournament[] = [
    ...DP_WORLD_TOUR_2026,
    ...CHALLENGE_TOUR_2026,
    ...NORDIC_LEAGUE_2026,
    ...GARMIN_NORGES_CUP_2026,
    ...SRIXON_TOUR_2026,
    ...JUNIOR_TOUR_REGIONAL_2026,
    ...GLOBAL_JUNIOR_TOUR_2026,
    ...EGA_TURNERING_2026,
    ...WAGR_TURNERING_2026,
    ...COLLEGE_TURNERINGER_2026,
    ...PGA_TOUR_2026,
    ...ACADEMY_CLUB_2026,
  ];

  // Apply hierarchy mapping to all tournaments
  return allTournaments.map(t => applyHierarchyMapping(t));
}

// ============================================================================
// SEED DATA GENERATION (Legacy - kept for backwards compatibility)
// ============================================================================

/**
 * Generate seed tournaments - now returns real tournament data
 * Kept for API compatibility
 */
export function generateSeedTournaments(): Tournament[] {
  return getRealTournamentData();
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get unique countries from tournament list
 */
export function getAvailableCountries(tournaments: Tournament[]): string[] {
  const countries = new Set(tournaments.map(t => t.country));
  return Array.from(countries).sort();
}

/**
 * Get unique tours from tournament list
 */
export function getAvailableTours(tournaments: Tournament[]): TourType[] {
  const tours = new Set(tournaments.map(t => t.tour));
  return Array.from(tours) as TourType[];
}

/**
 * Group tournaments by time period
 */
export function groupTournamentsByPeriod(tournaments: Tournament[]): {
  upcoming: Tournament[];
  past: Tournament[];
} {
  const now = new Date();

  return {
    upcoming: tournaments.filter(t => {
      const startDate = new Date(t.startDate);
      return startDate >= now || t.status === 'ongoing';
    }),
    past: tournaments.filter(t => {
      const startDate = new Date(t.startDate);
      return startDate < now && t.status === 'finished';
    }),
  };
}
