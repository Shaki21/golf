/**
 * Golf Courses Service
 * Handles golf course data from GolfCourseAPI
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { GolfCourseAPIClient, getGolfCourseAPIClient, GolfClubData } from '../../../integrations/golfcourse/client';
import { logger } from '../../../utils/logger';

/**
 * Course with club and tees
 */
type CourseWithRelations = Prisma.GolfCourseGetPayload<{
  include: { club: true; tees: true };
}>;

/**
 * Club with courses and tees
 */
type ClubWithCourses = Prisma.GolfClubGetPayload<{
  include: { courses: { include: { tees: true } } };
}>;

/**
 * Tee data for formatting
 */
type TeeData = Prisma.GolfCourseTeeGetPayload<object>;

export class GolfCourseService {
  private apiClient: GolfCourseAPIClient;

  constructor(private prisma: PrismaClient) {
    this.apiClient = getGolfCourseAPIClient();
  }

  /**
   * Search courses in database
   */
  async searchCourses(params: {
    query?: string;
    country?: string;
    city?: string;
    limit?: number;
    offset?: number;
  }) {
    const { query, country, city, limit = 50, offset = 0 } = params;

    const where: Prisma.GolfCourseWhereInput = {};

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { club: { name: { contains: query, mode: 'insensitive' } } },
      ];
    }

    if (country) {
      where.club = {
        ...(where.club as Prisma.GolfClubWhereInput || {}),
        country: { equals: country, mode: 'insensitive' }
      };
    }

    if (city) {
      where.club = {
        ...(where.club as Prisma.GolfClubWhereInput || {}),
        city: { contains: city, mode: 'insensitive' }
      };
    }

    const [courses, total] = await Promise.all([
      this.prisma.golfCourse.findMany({
        where,
        include: {
          club: true,
          tees: {
            orderBy: { slopeRating: 'desc' },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { name: 'asc' },
      }),
      this.prisma.golfCourse.count({ where }),
    ]);

    return {
      courses: courses.map((course) => this.formatCourse(course)),
      total,
      pagination: { limit, offset, hasMore: offset + courses.length < total },
    };
  }

  /**
   * Get course by ID
   */
  async getCourseById(id: string) {
    const course = await this.prisma.golfCourse.findUnique({
      where: { id },
      include: {
        club: true,
        tees: {
          orderBy: { slopeRating: 'desc' },
        },
      },
    });

    return course ? this.formatCourse(course) : null;
  }

  /**
   * Get all clubs in a country
   */
  async getClubsByCountry(country: string) {
    const clubs = await this.prisma.golfClub.findMany({
      where: { country: { equals: country, mode: 'insensitive' } },
      include: {
        courses: {
          include: { tees: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return clubs.map((club) => this.formatClub(club));
  }

  /**
   * Get Norwegian courses (convenience method)
   */
  async getNorwegianCourses() {
    return this.getClubsByCountry('Norway');
  }

  /**
   * Sync courses from API for a country
   */
  async syncCountry(country: string): Promise<{ clubsCreated: number; coursesCreated: number; teesCreated: number }> {
    if (!this.apiClient.isConfigured()) {
      throw new Error('GolfCourseAPI key not configured');
    }

    logger.info({ country }, 'Starting golf course sync');
    const clubs = await this.apiClient.getCoursesByCountry(country);

    let clubsCreated = 0;
    let coursesCreated = 0;
    let teesCreated = 0;

    for (const clubData of clubs) {
      try {
        const result = await this.upsertClub(clubData);
        clubsCreated += result.clubCreated ? 1 : 0;
        coursesCreated += result.coursesCreated;
        teesCreated += result.teesCreated;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error({ error: errorMessage, club: clubData.name }, 'Failed to upsert club');
      }
    }

    logger.info({ country, clubsCreated, coursesCreated, teesCreated }, 'Golf course sync completed');

    return { clubsCreated, coursesCreated, teesCreated };
  }

  /**
   * Upsert a club with its courses and tees
   */
  private async upsertClub(clubData: GolfClubData) {
    let clubCreated = false;
    let coursesCreated = 0;
    let teesCreated = 0;

    // Upsert club
    const existingClub = await this.prisma.golfClub.findUnique({
      where: { externalId: clubData.id },
    });

    const club = await this.prisma.golfClub.upsert({
      where: { externalId: clubData.id },
      create: {
        externalId: clubData.id,
        name: clubData.name,
        address: clubData.address,
        city: clubData.city,
        state: clubData.state,
        country: clubData.country,
        countryCode: clubData.countryCode,
        postalCode: clubData.postalCode,
        phone: clubData.phone,
        email: clubData.email,
        website: clubData.website,
        latitude: clubData.latitude,
        longitude: clubData.longitude,
        lastSynced: new Date(),
      },
      update: {
        name: clubData.name,
        address: clubData.address,
        city: clubData.city,
        state: clubData.state,
        phone: clubData.phone,
        email: clubData.email,
        website: clubData.website,
        latitude: clubData.latitude,
        longitude: clubData.longitude,
        lastSynced: new Date(),
      },
    });

    if (!existingClub) clubCreated = true;

    // Upsert courses
    if (clubData.courses) {
      for (const courseData of clubData.courses) {
        const existingCourse = await this.prisma.golfCourse.findUnique({
          where: { externalId: courseData.id },
        });

        const course = await this.prisma.golfCourse.upsert({
          where: { externalId: courseData.id },
          create: {
            externalId: courseData.id,
            clubId: club.id,
            name: courseData.name,
            holes: courseData.holes,
            par: courseData.par,
            designer: courseData.designer,
            yearBuilt: courseData.yearBuilt,
            courseType: courseData.courseType,
            latitude: courseData.latitude,
            longitude: courseData.longitude,
            lastSynced: new Date(),
          },
          update: {
            name: courseData.name,
            holes: courseData.holes,
            par: courseData.par,
            designer: courseData.designer,
            courseType: courseData.courseType,
            lastSynced: new Date(),
          },
        });

        if (!existingCourse) coursesCreated++;

        // Upsert tees
        if (courseData.tees) {
          for (const teeData of courseData.tees) {
            const genderValue = teeData.gender || '';
            const holeDataValue = teeData.holes
              ? (teeData.holes as unknown as Prisma.InputJsonValue)
              : Prisma.JsonNull;

            const existingTee = await this.prisma.golfCourseTee.findFirst({
              where: {
                courseId: course.id,
                teeName: teeData.name,
                gender: genderValue,
              },
            });

            await this.prisma.golfCourseTee.upsert({
              where: {
                courseId_teeName_gender: {
                  courseId: course.id,
                  teeName: teeData.name,
                  gender: genderValue,
                },
              },
              create: {
                courseId: course.id,
                teeName: teeData.name,
                teeColor: teeData.color,
                gender: genderValue,
                courseRating: teeData.courseRating,
                slopeRating: teeData.slopeRating,
                totalYards: teeData.totalYards,
                totalMeters: teeData.totalMeters,
                par: teeData.par,
                holeData: holeDataValue,
                lastSynced: new Date(),
              },
              update: {
                teeColor: teeData.color,
                courseRating: teeData.courseRating,
                slopeRating: teeData.slopeRating,
                totalYards: teeData.totalYards,
                totalMeters: teeData.totalMeters,
                par: teeData.par,
                holeData: holeDataValue,
                lastSynced: new Date(),
              },
            });

            if (!existingTee) teesCreated++;
          }
        }
      }
    }

    return { clubCreated, coursesCreated, teesCreated };
  }

  /**
   * Get sync status
   */
  async getSyncStatus() {
    const [clubCount, courseCount, teeCount, lastSync] = await Promise.all([
      this.prisma.golfClub.count(),
      this.prisma.golfCourse.count(),
      this.prisma.golfCourseTee.count(),
      this.prisma.golfClub.findFirst({
        orderBy: { lastSynced: 'desc' },
        select: { lastSynced: true },
      }),
    ]);

    // Count by country
    const countryCounts = await this.prisma.golfClub.groupBy({
      by: ['country'],
      _count: true,
      orderBy: { _count: { country: 'desc' } },
      take: 10,
    });

    return {
      totalClubs: clubCount,
      totalCourses: courseCount,
      totalTees: teeCount,
      lastSyncAt: lastSync?.lastSynced || null,
      apiConfigured: this.apiClient.isConfigured(),
      topCountries: countryCounts.map(c => ({
        country: c.country,
        clubs: c._count,
      })),
    };
  }

  /**
   * Format course for API response
   */
  private formatCourse(course: CourseWithRelations & { club: CourseWithRelations['club'] | null }) {
    return {
      id: course.id,
      name: course.name,
      holes: course.holes,
      par: course.par,
      designer: course.designer,
      yearBuilt: course.yearBuilt,
      courseType: course.courseType,
      location: course.latitude && course.longitude
        ? { lat: Number(course.latitude), lng: Number(course.longitude) }
        : null,
      club: course.club ? {
        id: course.club.id,
        name: course.club.name,
        city: course.club.city,
        country: course.club.country,
        address: course.club.address,
        phone: course.club.phone,
        website: course.club.website,
      } : null,
      tees: course.tees?.map((tee: TeeData) => ({
        id: tee.id,
        name: tee.teeName,
        color: tee.teeColor,
        gender: tee.gender,
        courseRating: tee.courseRating ? Number(tee.courseRating) : null,
        slopeRating: tee.slopeRating,
        totalYards: tee.totalYards,
        totalMeters: tee.totalMeters,
        par: tee.par,
      })) || [],
      lastSynced: course.lastSynced,
    };
  }

  /**
   * Format club for API response
   */
  private formatClub(club: ClubWithCourses) {
    return {
      id: club.id,
      name: club.name,
      address: club.address,
      city: club.city,
      state: club.state,
      country: club.country,
      phone: club.phone,
      email: club.email,
      website: club.website,
      location: club.latitude && club.longitude
        ? { lat: Number(club.latitude), lng: Number(club.longitude) }
        : null,
      courses: club.courses?.map((c) => this.formatCourse({ ...c, club: null } as CourseWithRelations & { club: null })) || [],
    };
  }
}
