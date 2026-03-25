/**
 * Weather Service
 * Provides weather data for golf courses using MET Norway API
 */

import { PrismaClient } from '@prisma/client';
import { MetNoClient, getMetNoClient, GolfWeatherData } from '../../../integrations/metno/client';
import { logger } from '../../../utils/logger';

export interface CourseWeather {
  courseId: string;
  courseName: string;
  clubName: string;
  weather: GolfWeatherData;
}

export interface WeatherSearchResult {
  lat: number;
  lng: number;
  weather: GolfWeatherData;
}

export class WeatherService {
  private metnoClient: MetNoClient;

  constructor(private prisma: PrismaClient) {
    this.metnoClient = getMetNoClient();
  }

  /**
   * Get weather for a specific golf course
   */
  async getWeatherForCourse(courseId: string): Promise<CourseWeather | null> {
    const course = await this.prisma.golfCourse.findUnique({
      where: { id: courseId },
      include: { club: true },
    });

    if (!course) {
      return null;
    }

    // Use course coordinates, fallback to club coordinates
    const lat = course.latitude ? Number(course.latitude) : course.club.latitude ? Number(course.club.latitude) : null;
    const lng = course.longitude ? Number(course.longitude) : course.club.longitude ? Number(course.club.longitude) : null;

    if (!lat || !lng) {
      throw new Error(`Course ${course.name} has no coordinates`);
    }

    logger.info({ courseId, courseName: course.name, lat, lng }, 'Fetching weather for course');

    const weather = await this.metnoClient.getGolfWeather(lat, lng);

    return {
      courseId: course.id,
      courseName: course.name,
      clubName: course.club.name,
      weather,
    };
  }

  /**
   * Get weather for a golf club (uses first course or club coordinates)
   */
  async getWeatherForClub(clubId: string): Promise<CourseWeather | null> {
    const club = await this.prisma.golfClub.findUnique({
      where: { id: clubId },
      include: {
        courses: {
          take: 1,
        },
      },
    });

    if (!club) {
      return null;
    }

    // Use club coordinates or first course coordinates
    let lat = club.latitude ? Number(club.latitude) : null;
    let lng = club.longitude ? Number(club.longitude) : null;

    if ((!lat || !lng) && club.courses.length > 0) {
      const course = club.courses[0];
      lat = course.latitude ? Number(course.latitude) : null;
      lng = course.longitude ? Number(course.longitude) : null;
    }

    if (!lat || !lng) {
      throw new Error(`Club ${club.name} has no coordinates`);
    }

    logger.info({ clubId, clubName: club.name, lat, lng }, 'Fetching weather for club');

    const weather = await this.metnoClient.getGolfWeather(lat, lng);

    return {
      courseId: club.courses[0]?.id || clubId,
      courseName: club.courses[0]?.name || 'Main Course',
      clubName: club.name,
      weather,
    };
  }

  /**
   * Get weather for coordinates
   */
  async getWeatherByCoordinates(lat: number, lng: number): Promise<WeatherSearchResult> {
    const weather = await this.metnoClient.getGolfWeather(lat, lng);

    return {
      lat,
      lng,
      weather,
    };
  }

  /**
   * Get weather for multiple Norwegian courses
   * Returns the best courses to play today based on weather
   */
  async getBestCoursesToday(limit: number = 10): Promise<Array<CourseWeather & { rank: number }>> {
    // Get Norwegian clubs with coordinates
    const clubs = await this.prisma.golfClub.findMany({
      where: {
        country: { equals: 'Norway', mode: 'insensitive' },
        OR: [
          { latitude: { not: null } },
          { courses: { some: { latitude: { not: null } } } },
        ],
      },
      include: {
        courses: {
          take: 1,
          where: {
            latitude: { not: null },
          },
        },
      },
      take: 50, // Limit to avoid too many API calls
    });

    const results: Array<CourseWeather & { rank: number }> = [];

    for (const club of clubs) {
      try {
        let lat = club.latitude ? Number(club.latitude) : null;
        let lng = club.longitude ? Number(club.longitude) : null;

        if ((!lat || !lng) && club.courses.length > 0) {
          lat = club.courses[0].latitude ? Number(club.courses[0].latitude) : null;
          lng = club.courses[0].longitude ? Number(club.courses[0].longitude) : null;
        }

        if (!lat || !lng) continue;

        const weather = await this.metnoClient.getGolfWeather(lat, lng);

        results.push({
          courseId: club.courses[0]?.id || club.id,
          courseName: club.courses[0]?.name || 'Main Course',
          clubName: club.name,
          weather,
          rank: 0,
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        logger.warn({ club: club.name, error: message }, 'Failed to fetch weather for club');
      }
    }

    // Sort by golf playability score
    results.sort((a, b) => b.weather.golfConditions.score - a.weather.golfConditions.score);

    // Assign ranks and limit results
    return results.slice(0, limit).map((result, index) => ({
      ...result,
      rank: index + 1,
    }));
  }

  /**
   * Get weather summary for a region (e.g., all courses in a city)
   */
  async getRegionWeather(city: string): Promise<CourseWeather[]> {
    const clubs = await this.prisma.golfClub.findMany({
      where: {
        city: { contains: city, mode: 'insensitive' },
      },
      include: {
        courses: { take: 1 },
      },
      take: 20,
    });

    const results: CourseWeather[] = [];

    for (const club of clubs) {
      try {
        let lat = club.latitude ? Number(club.latitude) : null;
        let lng = club.longitude ? Number(club.longitude) : null;

        if ((!lat || !lng) && club.courses.length > 0) {
          lat = club.courses[0].latitude ? Number(club.courses[0].latitude) : null;
          lng = club.courses[0].longitude ? Number(club.courses[0].longitude) : null;
        }

        if (!lat || !lng) continue;

        const weather = await this.metnoClient.getGolfWeather(lat, lng);

        results.push({
          courseId: club.courses[0]?.id || club.id,
          courseName: club.courses[0]?.name || 'Main Course',
          clubName: club.name,
          weather,
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        logger.warn({ club: club.name, error: message }, 'Failed to fetch weather');
      }
    }

    return results;
  }

  /**
   * Get hourly wind forecast for a course (next 24 hours)
   */
  async getWindForecast(courseId: string): Promise<{
    courseName: string;
    hourly: Array<{
      time: string;
      windSpeed: number;
      windGust: number | null;
      windDirection: number;
      windDirectionText: string;
    }>;
  } | null> {
    const courseWeather = await this.getWeatherForCourse(courseId);

    if (!courseWeather) {
      return null;
    }

    return {
      courseName: courseWeather.courseName,
      hourly: courseWeather.weather.hourly.map((h) => ({
        time: h.time,
        windSpeed: h.windSpeed,
        windGust: h.windGust,
        windDirection: h.windDirection,
        windDirectionText: h.windDirectionText,
      })),
    };
  }
}
