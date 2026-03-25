/**
 * Weather API Routes
 * Provides weather data for golf courses using MET Norway API
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { WeatherService } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser } from '../../../middleware/auth';

// Schemas
const coordinatesSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

const bestCoursesSchema = z.object({
  limit: z.coerce.number().min(1).max(50).optional().default(10),
});

const regionSchema = z.object({
  city: z.string().min(1),
});

type CoordinatesQuery = z.infer<typeof coordinatesSchema>;
type BestCoursesQuery = z.infer<typeof bestCoursesSchema>;
type RegionQuery = z.infer<typeof regionSchema>;

export default async function weatherRoutes(app: FastifyInstance) {
  const prisma = getPrismaClient();
  const service = new WeatherService(prisma);

  const preHandlers = [authenticateUser];

  /**
   * Get weather for a specific golf course
   * GET /api/v1/weather/course/:courseId
   */
  app.get<{ Params: { courseId: string } }>(
    '/course/:courseId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get weather for a golf course',
        tags: ['Weather'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            courseId: { type: 'string', format: 'uuid' },
          },
          required: ['courseId'],
        },
      },
    },
    async (request: FastifyRequest<{ Params: { courseId: string } }>, reply: FastifyReply) => {
      try {
        const weather = await service.getWeatherForCourse(request.params.courseId);

        if (!weather) {
          return reply.status(404).send({ success: false, error: 'Course not found' });
        }

        return reply.send({ success: true, data: weather });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return reply.status(400).send({ success: false, error: message });
      }
    }
  );

  /**
   * Get weather for a golf club
   * GET /api/v1/weather/club/:clubId
   */
  app.get<{ Params: { clubId: string } }>(
    '/club/:clubId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get weather for a golf club',
        tags: ['Weather'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            clubId: { type: 'string', format: 'uuid' },
          },
          required: ['clubId'],
        },
      },
    },
    async (request: FastifyRequest<{ Params: { clubId: string } }>, reply: FastifyReply) => {
      try {
        const weather = await service.getWeatherForClub(request.params.clubId);

        if (!weather) {
          return reply.status(404).send({ success: false, error: 'Club not found' });
        }

        return reply.send({ success: true, data: weather });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return reply.status(400).send({ success: false, error: message });
      }
    }
  );

  /**
   * Get weather by coordinates
   * GET /api/v1/weather/location?lat=59.91&lng=10.75
   */
  app.get<{ Querystring: CoordinatesQuery }>(
    '/location',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get weather for coordinates',
        tags: ['Weather'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            lat: { type: 'number', description: 'Latitude (-90 to 90)' },
            lng: { type: 'number', description: 'Longitude (-180 to 180)' },
          },
          required: ['lat', 'lng'],
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: CoordinatesQuery }>, reply: FastifyReply) => {
      const { lat, lng } = coordinatesSchema.parse(request.query);

      try {
        const weather = await service.getWeatherByCoordinates(lat, lng);
        return reply.send({ success: true, data: weather });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return reply.status(400).send({ success: false, error: message });
      }
    }
  );

  /**
   * Get best courses to play today (based on weather)
   * GET /api/v1/weather/best-courses?limit=10
   */
  app.get<{ Querystring: BestCoursesQuery }>(
    '/best-courses',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get best Norwegian courses to play today based on weather',
        tags: ['Weather'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'number', default: 10, description: 'Number of courses (max 50)' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: BestCoursesQuery }>, reply: FastifyReply) => {
      const { limit } = bestCoursesSchema.parse(request.query);

      try {
        const courses = await service.getBestCoursesToday(limit);
        return reply.send({
          success: true,
          data: courses,
          total: courses.length,
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return reply.status(400).send({ success: false, error: message });
      }
    }
  );

  /**
   * Get weather for courses in a city/region
   * GET /api/v1/weather/region?city=Oslo
   */
  app.get<{ Querystring: RegionQuery }>(
    '/region',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get weather for all courses in a city/region',
        tags: ['Weather'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            city: { type: 'string', description: 'City name' },
          },
          required: ['city'],
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: RegionQuery }>, reply: FastifyReply) => {
      const { city } = regionSchema.parse(request.query);

      try {
        const courses = await service.getRegionWeather(city);
        return reply.send({
          success: true,
          data: courses,
          total: courses.length,
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return reply.status(400).send({ success: false, error: message });
      }
    }
  );

  /**
   * Get wind forecast for a course (next 24 hours)
   * GET /api/v1/weather/wind/:courseId
   */
  app.get<{ Params: { courseId: string } }>(
    '/wind/:courseId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get 24-hour wind forecast for a golf course',
        tags: ['Weather'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            courseId: { type: 'string', format: 'uuid' },
          },
          required: ['courseId'],
        },
      },
    },
    async (request: FastifyRequest<{ Params: { courseId: string } }>, reply: FastifyReply) => {
      try {
        const windForecast = await service.getWindForecast(request.params.courseId);

        if (!windForecast) {
          return reply.status(404).send({ success: false, error: 'Course not found' });
        }

        return reply.send({ success: true, data: windForecast });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return reply.status(400).send({ success: false, error: message });
      }
    }
  );
}
