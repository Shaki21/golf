/**
 * TrackMan / Launch Monitor API
 *
 * Track shots, analyze club gapping, import TrackMan data
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser } from '../../../middleware/auth';
import { z } from 'zod';

const createSessionSchema = z.object({
  playerId: z.string().uuid(),
  deviceType: z.enum(['TrackMan', 'Foresight', 'GCQuad', 'FlightScope', 'Other']),
  location: z.string().optional(),
  notes: z.string().optional(),
});

const addShotSchema = z.object({
  sessionId: z.string().uuid(),
  club: z.string(),
  ballSpeed: z.number().optional(),
  clubSpeed: z.number().optional(),
  launchAngle: z.number().optional(),
  spinRate: z.number().int().optional(),
  carryDistance: z.number().optional(),
  totalDistance: z.number().optional(),
  smashFactor: z.number().optional(),
  attackAngle: z.number().optional(),
  clubPath: z.number().optional(),
  faceAngle: z.number().optional(),
  sideSpin: z.number().optional(),
  backSpin: z.number().optional(),
});

// TrackMan file import schema
const importFileSchema = z.object({
  playerId: z.string().uuid(),
  club: z.string(),
  taskId: z.string().uuid().optional(),
});

export async function trackmanRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();

  // Import TrackMan file
  app.post(
    '/import',
    { preHandler: authenticateUser },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const data = await request.file();
        if (!data) {
          return reply.status(400).send({ success: false, error: 'No file uploaded' });
        }

        // Read file content
        const buffer = await data.toBuffer();
        const fileContent = buffer.toString('utf-8');
        const { playerId, club, taskId } = request.body as any;

        if (!playerId || !club) {
          return reply.status(400).send({ success: false, error: 'playerId and club are required' });
        }

        const tenantId = request.user!.tenantId;

        // Parse CSV or JSON
        let shots: any[] = [];
        if (data.filename.endsWith('.csv')) {
          // Simple CSV parser for TrackMan format
          const lines = fileContent.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim());

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const shot: any = {};
            headers.forEach((header, index) => {
              const value = values[index]?.trim();
              if (value && value !== '') {
                shot[header.toLowerCase().replace(/\s+/g, '')] = parseFloat(value) || value;
              }
            });
            if (Object.keys(shot).length > 0) {
              shots.push(shot);
            }
          }
        } else if (data.filename.endsWith('.json')) {
          shots = JSON.parse(fileContent);
        } else {
          return reply.status(400).send({ success: false, error: 'Unsupported file format' });
        }

        // Create session
        const session = await prisma.launchMonitorSession.create({
          data: {
            tenantId,
            playerId,
            coachId: request.user!.coachId,
            deviceType: 'TrackMan',
            location: 'Imported',
            totalShots: shots.length,
          },
        });

        // Store shots
        for (const shotData of shots) {
          await prisma.launchMonitorShot.create({
            data: {
              tenantId,
              sessionId: session.id,
              club,
              ballSpeed: shotData.ballspeed || shotData.bs,
              clubSpeed: shotData.clubspeed || shotData.cs,
              launchAngle: shotData.launchangle || shotData.la,
              spinRate: shotData.spinrate || shotData.spin,
              carryDistance: shotData.carry || shotData.carrydistance,
              totalDistance: shotData.total || shotData.totaldistance,
              smashFactor: shotData.smashfactor || shotData.sf,
              attackAngle: shotData.attackangle || shotData.aa,
              clubPath: shotData.clubpath || shotData.cp,
              faceAngle: shotData.faceangle || shotData.fa,
              sideSpin: shotData.sidespin || shotData.ss,
              backSpin: shotData.backspin,
            },
          });
        }

        // Get reference values for analysis
        const referenceValues = await prisma.trackmanReferenceValue.findMany({
          where: { playerId, club },
        });

        // Calculate deviations
        const analysis = {
          shots: shots.length,
          club,
          date: new Date().toISOString(),
          deviations: {} as any,
        };

        if (referenceValues.length > 0) {
          const metrics = ['attackAngle', 'clubPath', 'faceAngle', 'clubSpeed', 'ballSpeed'];
          metrics.forEach(metric => {
            const ref = referenceValues.find(r => r.parameter === metric);
            if (ref) {
              const values = shots
                .map((s: any) => s[metric.toLowerCase()])
                .filter((v: any) => v !== undefined && v !== null);

              if (values.length > 0) {
                const avg = values.reduce((a: number, b: number) => a + b) / values.length;
                const max = Math.max(...values);
                const min = Math.min(...values);
                const deviation = avg - ref.targetValue.toNumber();

                analysis.deviations[metric] = {
                  average: avg,
                  target: ref.targetValue.toNumber(),
                  tolerance: ref.tolerance.toNumber(),
                  deviation,
                  min,
                  max,
                  range: max - min,
                  inTolerance: Math.abs(deviation) <= ref.tolerance.toNumber(),
                };
              }
            }
          });
        }

        return reply.status(201).send({
          success: true,
          data: {
            sessionId: session.id,
            shotsCount: shots.length,
            analysis,
          },
        });
      } catch (error) {
        console.error('TrackMan import error:', error);
        return reply.status(500).send({ success: false, error: 'Import failed' });
      }
    }
  );

  // Create session
  app.post<{ Body: z.infer<typeof createSessionSchema> }>(
    '/sessions',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const input = createSessionSchema.parse(request.body);
      const tenantId = request.user!.tenantId;

      const session = await prisma.launchMonitorSession.create({
        data: {
          tenantId,
          playerId: input.playerId,
          coachId: request.user!.coachId,
          deviceType: input.deviceType,
          location: input.location,
          notes: input.notes,
        },
      });

      return reply.status(201).send({ success: true, data: session });
    }
  );

  // Add shot
  app.post<{ Body: z.infer<typeof addShotSchema> }>(
    '/shots',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const input = addShotSchema.parse(request.body);
      const tenantId = request.user!.tenantId;

      const shot = await prisma.launchMonitorShot.create({
        data: {
          tenantId,
          sessionId: input.sessionId,
          club: input.club,
          ballSpeed: input.ballSpeed,
          clubSpeed: input.clubSpeed,
          launchAngle: input.launchAngle,
          spinRate: input.spinRate,
          carryDistance: input.carryDistance,
          totalDistance: input.totalDistance,
          smashFactor: input.smashFactor,
          attackAngle: input.attackAngle,
          clubPath: input.clubPath,
          faceAngle: input.faceAngle,
          sideSpin: input.sideSpin,
          backSpin: input.backSpin,
        },
      });

      // Update session stats
      await prisma.launchMonitorSession.update({
        where: { id: input.sessionId },
        data: { totalShots: { increment: 1 } },
      });

      return reply.status(201).send({ success: true, data: shot });
    }
  );

  // Get session with shots
  app.get<{ Params: { id: string } }>(
    '/sessions/:id',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const session = await prisma.launchMonitorSession.findFirst({
        where: { id: request.params.id, tenantId: request.user!.tenantId },
        include: {
          shots: { orderBy: { createdAt: 'asc' } },
          player: { select: { firstName: true, lastName: true } },
        },
      });

      return reply.send({ success: true, data: session });
    }
  );

  // Club gapping analysis
  app.get<{ Params: { playerId: string } }>(
    '/club-gapping/:playerId',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const { playerId } = request.params;
      const tenantId = request.user!.tenantId;

      // Get all shots for player, grouped by club
      const shots = await prisma.launchMonitorShot.findMany({
        where: {
          tenantId,
          session: { playerId },
        },
        select: {
          club: true,
          carryDistance: true,
          totalDistance: true,
        },
      });

      // Calculate averages per club
      const clubStats = shots.reduce((acc: any, shot) => {
        if (!acc[shot.club]) {
          acc[shot.club] = { carry: [], total: [] };
        }
        if (shot.carryDistance) acc[shot.club].carry.push(shot.carryDistance.toNumber());
        if (shot.totalDistance) acc[shot.club].total.push(shot.totalDistance.toNumber());
        return acc;
      }, {});

      const gapping = Object.entries(clubStats).map(([club, data]: [string, any]) => ({
        club,
        avgCarry: data.carry.length ? data.carry.reduce((a: number, b: number) => a + b) / data.carry.length : 0,
        avgTotal: data.total.length ? data.total.reduce((a: number, b: number) => a + b) / data.total.length : 0,
        shots: data.carry.length,
      }));

      return reply.send({ success: true, data: gapping });
    }
  );

  // Save reference values for a club
  app.post(
    '/reference-values',
    { preHandler: authenticateUser },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { playerId, club, parameters } = request.body as any;

      if (!playerId || !club || !Array.isArray(parameters)) {
        return reply.status(400).send({ success: false, error: 'playerId, club, and parameters array required' });
      }

      try {
        // Delete existing values for this club
        await prisma.trackmanReferenceValue.deleteMany({
          where: { playerId, club },
        });

        // Insert new values
        const created = await prisma.trackmanReferenceValue.createMany({
          data: parameters.map((param: any) => ({
            playerId,
            club,
            parameter: param.parameter,
            targetValue: param.targetValue,
            tolerance: param.tolerance,
            unit: param.unit || '',
          })),
        });

        return reply.status(201).send({ success: true, data: { count: created.count } });
      } catch (error) {
        console.error('Failed to save reference values:', error);
        return reply.status(500).send({ success: false, error: 'Failed to save reference values' });
      }
    }
  );

  // Get reference values for a player
  app.get<{ Params: { playerId: string } }>(
    '/reference-values/:playerId',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const { playerId } = request.params;
      const { club } = request.query as any;

      const where: any = { playerId };
      if (club) {
        where.club = club;
      }

      const references = await prisma.trackmanReferenceValue.findMany({
        where,
        orderBy: [{ club: 'asc' }, { parameter: 'asc' }],
      });

      return reply.send({ success: true, data: references });
    }
  );

  // Get TrackMan sessions for a player
  app.get<{ Params: { playerId: string } }>(
    '/player/:playerId/sessions',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const { playerId } = request.params;
      const tenantId = request.user!.tenantId;

      const sessions = await prisma.launchMonitorSession.findMany({
        where: { playerId, tenantId },
        include: {
          shots: { take: 1 }, // Just to count
        },
        orderBy: { sessionDate: 'desc' },
        take: 10,
      });

      const sessionsWithCount = sessions.map(s => ({
        id: s.id,
        date: s.sessionDate,
        deviceType: s.deviceType,
        location: s.location,
        totalShots: s.totalShots,
        notes: s.notes,
      }));

      return reply.send({ success: true, data: sessionsWithCount });
    }
  );
}
