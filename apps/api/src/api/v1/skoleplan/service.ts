import { getPrismaClient } from '../../../core/db/prisma';
import { AppError } from '../../../core/errors';

const prisma = getPrismaClient();

// ============================================================================
// TYPES
// ============================================================================

export interface CreateFagInput {
  navn: string;
  larer?: string;
  rom?: string;
  farge?: string;
}

export interface UpdateFagInput {
  navn?: string;
  larer?: string;
  rom?: string;
  farge?: string;
}

export interface CreateSkoletimeInput {
  fagId: string;
  ukedag: string;
  startTid: string;
  sluttTid: string;
}

export interface UpdateSkoletimeInput {
  fagId?: string;
  ukedag?: string;
  startTid?: string;
  sluttTid?: string;
}

export interface CreateOppgaveInput {
  fagId: string;
  testId?: string;
  tittel: string;
  beskrivelse?: string;
  frist: string;
  testDate?: string;
  prioritet?: string;
  estimatedMinutes?: number;
}

export interface UpdateOppgaveInput {
  fagId?: string;
  testId?: string;
  tittel?: string;
  beskrivelse?: string;
  frist?: string;
  testDate?: string;
  prioritet?: string;
  status?: string;
  actualMinutes?: number;
}

// ============================================================================
// FAG SERVICE
// ============================================================================

export class FagService {
  async listFag(playerId: string, tenantId: string) {
    return prisma.fag.findMany({
      where: {
        playerId,
        tenantId
      },
      orderBy: { navn: 'asc' }
    });
  }

  async getFagById(fagId: string, playerId: string, tenantId: string) {
    const fag = await prisma.fag.findUnique({
      where: { id: fagId }
    });

    if (!fag) {
      throw new AppError('validation_error', 'Fag ikke funnet', 404, { fagId });
    }

    if (fag.playerId !== playerId || fag.tenantId !== tenantId) {
      throw new AppError('authorization_error', 'Du har ikke tilgang til dette faget', 403);
    }

    return fag;
  }

  async createFag(playerId: string, tenantId: string, input: CreateFagInput) {
    return prisma.fag.create({
      data: {
        playerId,
        tenantId,
        navn: input.navn,
        larer: input.larer,
        rom: input.rom,
        farge: input.farge || '#10456A' // default primary color
      }
    });
  }

  async updateFag(fagId: string, playerId: string, tenantId: string, input: UpdateFagInput) {
    await this.getFagById(fagId, playerId, tenantId);

    return prisma.fag.update({
      where: { id: fagId },
      data: {
        ...input,
        updatedAt: new Date()
      }
    });
  }

  async deleteFag(fagId: string, playerId: string, tenantId: string) {
    await this.getFagById(fagId, playerId, tenantId);

    await prisma.fag.delete({
      where: { id: fagId }
    });

    return { success: true };
  }
}

// ============================================================================
// SKOLETIME SERVICE
// ============================================================================

export class SkoletimeService {
  private fagService = new FagService();

  // Helper to check for time conflicts
  private async checkTimeConflict(
    playerId: string,
    tenantId: string,
    ukedag: string,
    startTid: string,
    sluttTid: string,
    excludeId?: string
  ): Promise<boolean> {
    // Get all player's fag IDs
    const playerFag = await prisma.fag.findMany({
      where: { playerId, tenantId },
      select: { id: true }
    });
    const fagIds = playerFag.map(f => f.id);

    // Find overlapping skoletimer on the same day
    const conflictingTimer = await prisma.skoletime.findMany({
      where: {
        fagId: { in: fagIds },
        ukedag,
        id: excludeId ? { not: excludeId } : undefined,
      }
    });

    // Check for time overlaps
    for (const time of conflictingTimer) {
      const existingStart = time.startTid;
      const existingEnd = time.sluttTid;

      // Check if times overlap
      // Overlap occurs if: new start < existing end AND new end > existing start
      if (startTid < existingEnd && sluttTid > existingStart) {
        return true; // Conflict found
      }
    }

    return false; // No conflicts
  }

  async listTimer(playerId: string, tenantId: string) {
    // Get all player's fag IDs first
    const playerFag = await prisma.fag.findMany({
      where: {
        playerId,
        tenantId
      },
      select: { id: true }
    });
    const fagIds = playerFag.map(f => f.id);

    return prisma.skoletime.findMany({
      where: { fagId: { in: fagIds } },
      include: { fag: true },
      orderBy: [
        { ukedag: 'asc' },
        { startTid: 'asc' }
      ]
    });
  }

  async getSkoletimeById(timeId: string, playerId: string, tenantId: string) {
    const time = await prisma.skoletime.findUnique({
      where: { id: timeId },
      include: { fag: true }
    });

    if (!time) {
      throw new AppError('validation_error', 'Skoletime ikke funnet', 404, { timeId });
    }

    // Verify player owns the fag
    if (time.fag.playerId !== playerId || time.fag.tenantId !== tenantId) {
      throw new AppError('authorization_error', 'Du har ikke tilgang til denne timen', 403);
    }

    return time;
  }

  async createSkoletime(playerId: string, tenantId: string, input: CreateSkoletimeInput) {
    // Verify player owns the fag
    await this.fagService.getFagById(input.fagId, playerId, tenantId);

    // Check for time conflicts
    const hasConflict = await this.checkTimeConflict(
      playerId,
      tenantId,
      input.ukedag,
      input.startTid,
      input.sluttTid
    );

    if (hasConflict) {
      throw new AppError(
        'validation_error',
        'Tidskonflikt: Det finnes allerede en time på dette tidspunktet',
        400,
        { ukedag: input.ukedag, startTid: input.startTid, sluttTid: input.sluttTid }
      );
    }

    return prisma.skoletime.create({
      data: {
        fagId: input.fagId,
        ukedag: input.ukedag,
        startTid: input.startTid,
        sluttTid: input.sluttTid
      },
      include: { fag: true }
    });
  }

  async updateSkoletime(timeId: string, playerId: string, tenantId: string, input: UpdateSkoletimeInput) {
    const currentTime = await this.getSkoletimeById(timeId, playerId, tenantId);

    // If changing fagId, verify player owns the new fag
    if (input.fagId) {
      await this.fagService.getFagById(input.fagId, playerId, tenantId);
    }

    // Check for time conflicts if time or day is being changed
    if (input.ukedag || input.startTid || input.sluttTid) {
      const ukedag = input.ukedag || currentTime.ukedag;
      const startTid = input.startTid || currentTime.startTid;
      const sluttTid = input.sluttTid || currentTime.sluttTid;

      const hasConflict = await this.checkTimeConflict(
        playerId,
        tenantId,
        ukedag,
        startTid,
        sluttTid,
        timeId // Exclude current time from conflict check
      );

      if (hasConflict) {
        throw new AppError(
          'validation_error',
          'Tidskonflikt: Det finnes allerede en time på dette tidspunktet',
          400,
          { ukedag, startTid, sluttTid }
        );
      }
    }

    return prisma.skoletime.update({
      where: { id: timeId },
      data: {
        ...input,
        updatedAt: new Date()
      },
      include: { fag: true }
    });
  }

  async deleteSkoletime(timeId: string, playerId: string, tenantId: string) {
    await this.getSkoletimeById(timeId, playerId, tenantId);

    await prisma.skoletime.delete({
      where: { id: timeId }
    });

    return { success: true };
  }
}

// ============================================================================
// OPPGAVE SERVICE
// ============================================================================

export class OppgaveService {
  private fagService = new FagService();

  async listOppgaver(playerId: string, tenantId: string, filters?: { fagId?: string; status?: string }) {
    // Get all player's fag IDs
    const playerFag = await prisma.fag.findMany({
      where: {
        playerId,
        tenantId
      },
      select: { id: true }
    });
    const fagIds = playerFag.map(f => f.id);

    const where: any = { fagId: { in: fagIds } };

    if (filters?.fagId) {
      where.fagId = filters.fagId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    return prisma.oppgave.findMany({
      where,
      include: {
        fag: true,
        test: true
      },
      orderBy: [
        { frist: 'asc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async getOppgaveById(oppgaveId: string, playerId: string, tenantId: string) {
    const oppgave = await prisma.oppgave.findUnique({
      where: { id: oppgaveId },
      include: {
        fag: true,
        test: true
      }
    });

    if (!oppgave) {
      throw new AppError('validation_error', 'Oppgave ikke funnet', 404, { oppgaveId });
    }

    // Verify player owns the fag
    if (oppgave.fag.playerId !== playerId || oppgave.fag.tenantId !== tenantId) {
      throw new AppError('authorization_error', 'Du har ikke tilgang til denne oppgaven', 403);
    }

    return oppgave;
  }

  async createOppgave(playerId: string, tenantId: string, input: CreateOppgaveInput) {
    // Verify player owns the fag
    await this.fagService.getFagById(input.fagId, playerId, tenantId);

    // If testId is provided, verify test exists and belongs to tenant
    if (input.testId) {
      const test = await prisma.test.findFirst({
        where: { id: input.testId, tenantId }
      });
      if (!test) {
        throw new Error('Test not found or does not belong to this tenant');
      }
    }

    return prisma.oppgave.create({
      data: {
        fagId: input.fagId,
        testId: input.testId,
        tittel: input.tittel,
        beskrivelse: input.beskrivelse,
        frist: new Date(input.frist),
        testDate: input.testDate ? new Date(input.testDate) : undefined,
        prioritet: input.prioritet || 'medium',
        estimatedMinutes: input.estimatedMinutes,
        status: 'pending'
      },
      include: {
        fag: true,
        test: input.testId ? true : false
      }
    });
  }

  async updateOppgave(oppgaveId: string, playerId: string, tenantId: string, input: UpdateOppgaveInput) {
    const currentOppgave = await this.getOppgaveById(oppgaveId, playerId, tenantId);

    // If changing fagId, verify player owns the new fag
    if (input.fagId) {
      await this.fagService.getFagById(input.fagId, playerId, tenantId);
    }

    // If changing testId, verify test exists and belongs to tenant
    if (input.testId) {
      const test = await prisma.test.findFirst({
        where: { id: input.testId, tenantId }
      });
      if (!test) {
        throw new Error('Test not found or does not belong to this tenant');
      }
    }

    const data: any = { ...input, updatedAt: new Date() };
    if (input.frist) {
      data.frist = new Date(input.frist);
    }
    if (input.testDate) {
      data.testDate = new Date(input.testDate);
    }

    // Set completedAt timestamp when status changes to completed
    if (input.status === 'completed' && currentOppgave.status !== 'completed') {
      data.completedAt = new Date();
    }
    // Clear completedAt if status changes from completed to pending
    if (input.status === 'pending' && currentOppgave.status === 'completed') {
      data.completedAt = null;
    }

    return prisma.oppgave.update({
      where: { id: oppgaveId },
      data,
      include: {
        fag: true,
        test: true
      }
    });
  }

  async updateOppgaveStatus(oppgaveId: string, playerId: string, tenantId: string, status: string) {
    const currentOppgave = await this.getOppgaveById(oppgaveId, playerId, tenantId);

    const data: any = {
      status,
      updatedAt: new Date()
    };

    // Set completedAt timestamp when status changes to completed
    if (status === 'completed' && currentOppgave.status !== 'completed') {
      data.completedAt = new Date();
    }
    // Clear completedAt if status changes from completed to pending
    if (status === 'pending' && currentOppgave.status === 'completed') {
      data.completedAt = null;
    }

    return prisma.oppgave.update({
      where: { id: oppgaveId },
      data,
      include: {
        fag: true,
        test: true
      }
    });
  }

  async deleteOppgave(oppgaveId: string, playerId: string, tenantId: string) {
    await this.getOppgaveById(oppgaveId, playerId, tenantId);

    await prisma.oppgave.delete({
      where: { id: oppgaveId }
    });

    return { success: true };
  }
}

// ============================================================================
// COMBINED SKOLEPLAN SERVICE
// ============================================================================

export class SkoleplanService {
  private fagService = new FagService();
  private skoletimeService = new SkoletimeService();
  private oppgaveService = new OppgaveService();

  async getFullSkoleplan(playerId: string, tenantId: string) {
    const [fag, timer, oppgaver] = await Promise.all([
      this.fagService.listFag(playerId, tenantId),
      this.skoletimeService.listTimer(playerId, tenantId),
      this.oppgaveService.listOppgaver(playerId, tenantId)
    ]);

    return { fag, timer, oppgaver };
  }
}
