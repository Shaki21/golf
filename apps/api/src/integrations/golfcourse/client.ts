/**
 * GolfCourseAPI Client
 * Free golf course API - https://golfcourseapi.com
 *
 * Provides access to ~30,000 golf courses worldwide with:
 * - Club information (name, location, contact)
 * - Course data (holes, par, designer)
 * - Tee information (slope, rating, distances)
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../../utils/logger';

const GOLFCOURSE_API_BASE = 'https://api.golfcourseapi.com/v1';

export interface GolfCourseSearchParams {
  name?: string;
  city?: string;
  state?: string;
  country?: string;
  limit?: number;
  offset?: number;
}

export interface GolfClubData {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  countryCode?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  courses?: GolfCourseData[];
}

export interface GolfCourseData {
  id: string;
  clubId: string;
  name: string;
  holes: number;
  par?: number;
  designer?: string;
  yearBuilt?: number;
  courseType?: string;
  latitude?: number;
  longitude?: number;
  tees?: GolfCourseTeeData[];
}

export interface GolfCourseTeeData {
  id?: string;
  name: string;
  color?: string;
  gender?: string;
  courseRating?: number;
  slopeRating?: number;
  totalYards?: number;
  totalMeters?: number;
  par?: number;
  holes?: Array<{
    hole: number;
    par: number;
    yards?: number;
    meters?: number;
    strokeIndex?: number;
  }>;
}

export class GolfCourseAPIClient {
  private client: AxiosInstance;
  private apiKey: string | null;

  constructor() {
    this.apiKey = process.env.GOLFCOURSE_API_KEY || null;

    this.client = axios.create({
      baseURL: GOLFCOURSE_API_BASE,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      },
    });

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.debug({
          url: response.config.url,
          status: response.status
        }, 'GolfCourseAPI response');
        return response;
      },
      (error) => {
        logger.error({
          url: error.config?.url,
          status: error.response?.status,
          message: error.message
        }, 'GolfCourseAPI error');
        throw error;
      }
    );
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return this.apiKey !== null;
  }

  /**
   * Search for golf clubs/courses
   */
  async searchCourses(params: GolfCourseSearchParams): Promise<GolfClubData[]> {
    try {
      const response = await this.client.get('/courses/search', {
        params: {
          name: params.name,
          city: params.city,
          state: params.state,
          country: params.country,
          limit: params.limit || 50,
          offset: params.offset || 0,
        },
      });

      return this.normalizeSearchResults(response.data);
    } catch (error: any) {
      logger.error({ error: error.message, params }, 'Failed to search courses');
      throw new Error(`GolfCourseAPI search failed: ${error.message}`);
    }
  }

  /**
   * Get courses by country (useful for syncing Norwegian courses)
   */
  async getCoursesByCountry(country: string, limit: number = 500): Promise<GolfClubData[]> {
    return this.searchCourses({ country, limit });
  }

  /**
   * Get course details by ID
   */
  async getCourseById(courseId: string): Promise<GolfCourseData | null> {
    try {
      const response = await this.client.get(`/courses/${courseId}`);
      return this.normalizeCourse(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get club details by ID
   */
  async getClubById(clubId: string): Promise<GolfClubData | null> {
    try {
      const response = await this.client.get(`/clubs/${clubId}`);
      return this.normalizeClub(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Normalize search results from API
   */
  private normalizeSearchResults(data: any): GolfClubData[] {
    if (!data) return [];

    // Handle different response formats
    const items = Array.isArray(data) ? data : data.courses || data.clubs || data.results || [];

    return items.map((item: any) => this.normalizeClub(item));
  }

  /**
   * Normalize club data from API
   */
  private normalizeClub(data: any): GolfClubData {
    return {
      id: String(data.id || data.club_id || data.clubId),
      name: data.name || data.club_name || data.clubName || 'Unknown',
      address: data.address || data.street,
      city: data.city,
      state: data.state || data.region || data.county,
      country: data.country || 'Unknown',
      countryCode: data.country_code || data.countryCode,
      postalCode: data.postal_code || data.postalCode || data.zip,
      phone: data.phone || data.telephone,
      email: data.email,
      website: data.website || data.url,
      latitude: data.latitude || data.lat,
      longitude: data.longitude || data.lng || data.lon,
      courses: data.courses?.map((c: any) => this.normalizeCourse(c)),
    };
  }

  /**
   * Normalize course data from API
   */
  private normalizeCourse(data: any): GolfCourseData {
    return {
      id: String(data.id || data.course_id || data.courseId),
      clubId: String(data.club_id || data.clubId),
      name: data.name || data.course_name || data.courseName || 'Main Course',
      holes: data.holes || data.num_holes || 18,
      par: data.par || data.course_par,
      designer: data.designer || data.architect,
      yearBuilt: data.year_built || data.yearBuilt || data.established,
      courseType: data.course_type || data.courseType || data.type,
      latitude: data.latitude || data.lat,
      longitude: data.longitude || data.lng || data.lon,
      tees: data.tees?.map((t: any) => this.normalizeTee(t)),
    };
  }

  /**
   * Normalize tee data from API
   */
  private normalizeTee(data: any): GolfCourseTeeData {
    return {
      id: data.id ? String(data.id) : undefined,
      name: data.name || data.tee_name || data.teeName || 'Standard',
      color: data.color || data.tee_color || data.teeColor,
      gender: data.gender || data.sex,
      courseRating: data.course_rating || data.courseRating || data.rating,
      slopeRating: data.slope_rating || data.slopeRating || data.slope,
      totalYards: data.total_yards || data.totalYards || data.yards,
      totalMeters: data.total_meters || data.totalMeters || data.meters,
      par: data.par,
      holes: data.holes?.map((h: any) => ({
        hole: h.hole || h.number || h.hole_number,
        par: h.par,
        yards: h.yards || h.distance_yards,
        meters: h.meters || h.distance_meters,
        strokeIndex: h.stroke_index || h.strokeIndex || h.si || h.handicap,
      })),
    };
  }
}

// Singleton instance
let clientInstance: GolfCourseAPIClient | null = null;

export function getGolfCourseAPIClient(): GolfCourseAPIClient {
  if (!clientInstance) {
    clientInstance = new GolfCourseAPIClient();
  }
  return clientInstance;
}
