/**
 * AI Coach Tools
 *
 * Tool definitions and handlers for Claude tool use.
 * Allows AI to dynamically fetch player data during conversations.
 */

import { getPrismaClient } from '../../core/db/prisma';
import { Tool } from './claude-client.service';

const prisma = getPrismaClient();

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const AI_COACH_TOOLS: Tool[] = [
  {
    name: 'get_player_test_results',
    description: 'Henter spillerens testresultater fra siste periode. Bruk denne for å analysere spillerens ferdigheter og progresjon.',
    input_schema: {
      type: 'object',
      properties: {
        player_id: {
          type: 'string',
          description: 'Spillerens ID',
        },
        limit: {
          type: 'number',
          description: 'Antall resultater å hente (standard: 10)',
        },
        category: {
          type: 'string',
          description: 'Filtrer på testkategori (putting, driving, iron, short_game, mental, physical)',
        },
      },
      required: ['player_id'],
    },
  },
  {
    name: 'get_player_training_history',
    description: 'Henter spillerens treningshistorikk. Bruk for å forstå treningsvaner og volum.',
    input_schema: {
      type: 'object',
      properties: {
        player_id: {
          type: 'string',
          description: 'Spillerens ID',
        },
        days: {
          type: 'number',
          description: 'Antall dager tilbake å hente (standard: 30)',
        },
      },
      required: ['player_id'],
    },
  },
  {
    name: 'get_player_goals',
    description: 'Henter spillerens aktive mål og fremgang.',
    input_schema: {
      type: 'object',
      properties: {
        player_id: {
          type: 'string',
          description: 'Spillerens ID',
        },
      },
      required: ['player_id'],
    },
  },
  {
    name: 'get_player_category_requirements',
    description: 'Henter kravene for spillerens neste kategori og nåværende status.',
    input_schema: {
      type: 'object',
      properties: {
        player_id: {
          type: 'string',
          description: 'Spillerens ID',
        },
      },
      required: ['player_id'],
    },
  },
  {
    name: 'get_upcoming_tournaments',
    description: 'Henter kommende turneringer spilleren er påmeldt eller kan delta i.',
    input_schema: {
      type: 'object',
      properties: {
        player_id: {
          type: 'string',
          description: 'Spillerens ID',
        },
        limit: {
          type: 'number',
          description: 'Antall turneringer å hente (standard: 5)',
        },
      },
      required: ['player_id'],
    },
  },
  {
    name: 'create_training_suggestion',
    description: 'Oppretter et treningsforslag som spilleren kan se i sin app. Bruk når du gir konkrete treningsanbefalinger.',
    input_schema: {
      type: 'object',
      properties: {
        player_id: {
          type: 'string',
          description: 'Spillerens ID',
        },
        title: {
          type: 'string',
          description: 'Tittel på treningsforslaget',
        },
        description: {
          type: 'string',
          description: 'Beskrivelse av treningen',
        },
        session_type: {
          type: 'string',
          description: 'Type trening: technical, physical, mental, short_game, putting, driving',
        },
        duration_minutes: {
          type: 'number',
          description: 'Estimert varighet i minutter',
        },
        exercises: {
          type: 'array',
          items: { type: 'string' },
          description: 'Liste over øvelser',
        },
      },
      required: ['player_id', 'title', 'session_type', 'duration_minutes'],
    },
  },
];

// =============================================================================
// TOOL HANDLERS
// =============================================================================

interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Execute a tool call and return the result
 */
export async function executeToolCall(
  toolName: string,
  input: Record<string, unknown>
): Promise<ToolResult> {
  try {
    switch (toolName) {
      case 'get_player_test_results':
        return await getPlayerTestResults(input);
      case 'get_player_training_history':
        return await getPlayerTrainingHistory(input);
      case 'get_player_goals':
        return await getPlayerGoals(input);
      case 'get_player_category_requirements':
        return await getPlayerCategoryRequirements(input);
      case 'get_upcoming_tournaments':
        return await getUpcomingTournaments(input);
      case 'create_training_suggestion':
        return await createTrainingSuggestion(input);
      default:
        return { success: false, error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`Tool execution error (${toolName}):`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =============================================================================
// TOOL IMPLEMENTATIONS
// =============================================================================

async function getPlayerTestResults(input: Record<string, unknown>): Promise<ToolResult> {
  const playerId = input.player_id as string;
  const limit = (input.limit as number) || 10;
  const category = input.category as string | undefined;

  interface TestResultWhere {
    playerId: string;
    test?: { category: string };
  }

  const where: TestResultWhere = { playerId };
  if (category) {
    where.test = { category };
  }

  const results = await prisma.testResult.findMany({
    where,
    orderBy: { testDate: 'desc' },
    take: limit,
    include: {
      test: {
        select: {
          name: true,
          category: true,
          testDetails: true,
        },
      },
    },
  });

  const formatted = results.map(r => {
    const testDetails = r.test.testDetails as Record<string, unknown> | null;
    return {
      testName: r.test.name,
      category: r.test.category,
      value: r.value ? parseFloat(r.value.toString()) : null,
      unit: testDetails?.unit || '',
      date: r.testDate.toISOString().split('T')[0],
      passed: r.passed,
      categoryRequirement: r.categoryRequirement ? parseFloat(r.categoryRequirement.toString()) : null,
    };
  });

  return {
    success: true,
    data: {
      count: formatted.length,
      results: formatted,
    },
  };
}

async function getPlayerTrainingHistory(input: Record<string, unknown>): Promise<ToolResult> {
  const playerId = input.player_id as string;
  const days = (input.days as number) || 30;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const assignments = await prisma.dailyTrainingAssignment.findMany({
    where: {
      playerId,
      assignedDate: { gte: startDate },
    },
    orderBy: { assignedDate: 'desc' },
    include: {
      sessionTemplate: {
        select: {
          name: true,
          sessionType: true,
        },
      },
    },
  });

  const completed = assignments.filter(a => a.status === 'completed');
  const totalMinutes = completed.reduce((sum, a) => sum + (a.estimatedDuration || 0), 0);

  // Group by session type
  const byType: Record<string, number> = {};
  completed.forEach(a => {
    const type = a.sessionTemplate?.sessionType || a.sessionType || 'general';
    byType[type] = (byType[type] || 0) + (a.estimatedDuration || 0);
  });

  return {
    success: true,
    data: {
      period: `Siste ${days} dager`,
      totalSessions: completed.length,
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      completionRate: assignments.length > 0
        ? Math.round((completed.length / assignments.length) * 100)
        : 0,
      byType,
      recentSessions: assignments.slice(0, 5).map(a => ({
        date: a.assignedDate.toISOString().split('T')[0],
        name: a.sessionTemplate?.name || 'Treningsøkt',
        type: a.sessionTemplate?.sessionType || a.sessionType,
        duration: a.estimatedDuration,
        status: a.status,
      })),
    },
  };
}

async function getPlayerGoals(input: Record<string, unknown>): Promise<ToolResult> {
  const playerId = input.player_id as string;

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: {
      goals: true,
      breakingPoints: {
        where: { status: { in: ['active', 'not_started', 'in_progress'] } },
        select: {
          specificArea: true,
          description: true,
          progressPercent: true,
          processCategory: true,
        },
      },
    },
  });

  if (!player) {
    return { success: false, error: 'Spiller ikke funnet' };
  }

  return {
    success: true,
    data: {
      goals: player.goals || [],
      breakingPoints: player.breakingPoints.map(bp => ({
        area: bp.specificArea,
        category: bp.processCategory,
        description: bp.description,
        progress: bp.progressPercent,
      })),
    },
  };
}

async function getPlayerCategoryRequirements(input: Record<string, unknown>): Promise<ToolResult> {
  const playerId = input.player_id as string;

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: {
      category: true,
      handicap: true,
      averageScore: true,
    },
  });

  if (!player) {
    return { success: false, error: 'Spiller ikke funnet' };
  }

  // Get latest test results for category assessment
  const latestResults = await prisma.testResult.findMany({
    where: { playerId },
    orderBy: { testDate: 'desc' },
    take: 20,
    include: {
      test: {
        select: {
          name: true,
          category: true,
          testDetails: true,
        },
      },
    },
  });

  // Category requirements (simplified - could be from config/db)
  const categories = ['K', 'J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
  const currentIndex = categories.indexOf(player.category || 'K');
  const nextCategory = currentIndex < categories.length - 1 ? categories[currentIndex + 1] : null;

  return {
    success: true,
    data: {
      currentCategory: player.category || 'Ukjent',
      handicap: player.handicap ? parseFloat(player.handicap.toString()) : null,
      averageScore: player.averageScore ? parseFloat(player.averageScore.toString()) : null,
      nextCategory,
      recentTestPerformance: latestResults.slice(0, 5).map(r => {
        const testDetails = r.test.testDetails as Record<string, unknown> | null;
        return {
          test: r.test.name,
          category: r.test.category,
          passed: r.passed,
          value: r.value ? parseFloat(r.value.toString()) : null,
          requirement: r.categoryRequirement ? parseFloat(r.categoryRequirement.toString()) : null,
          unit: testDetails?.unit || '',
        };
      }),
    },
  };
}

async function getUpcomingTournaments(input: Record<string, unknown>): Promise<ToolResult> {
  const playerId = input.player_id as string;
  const limit = (input.limit as number) || 5;

  // Get player's tenant to find relevant tournaments
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: { tenantId: true },
  });

  if (!player) {
    return { success: false, error: 'Spiller ikke funnet' };
  }

  // Find upcoming events that are tournaments
  const events = await prisma.event.findMany({
    where: {
      tenantId: player.tenantId,
      eventType: 'tournament',
      startTime: { gte: new Date() },
    },
    orderBy: { startTime: 'asc' },
    take: limit,
    include: {
      tournament: {
        select: {
          tournamentType: true,
          level: true,
          courseName: true,
          format: true,
        },
      },
    },
  });

  return {
    success: true,
    data: {
      count: events.length,
      tournaments: events.map(e => ({
        name: e.title,
        startDate: e.startTime.toISOString().split('T')[0],
        endDate: e.endTime.toISOString().split('T')[0],
        location: e.location,
        type: e.tournament?.tournamentType,
        level: e.tournament?.level,
        format: e.tournament?.format,
        course: e.tournament?.courseName,
      })),
    },
  };
}

async function createTrainingSuggestion(input: Record<string, unknown>): Promise<ToolResult> {
  const playerId = input.player_id as string;
  const title = input.title as string;
  const description = input.description as string | undefined;
  const sessionType = input.session_type as string;
  const durationMinutes = input.duration_minutes as number;
  const exercises = input.exercises as string[] | undefined;

  // Get player's tenant
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: { tenantId: true },
  });

  if (!player) {
    return { success: false, error: 'Spiller ikke funnet' };
  }

  // Create a session template suggestion
  const suggestion = await prisma.sessionTemplate.create({
    data: {
      tenantId: player.tenantId,
      name: `[AI] ${title}`,
      description: description || `AI-generert treningsforslag: ${title}`,
      sessionType,
      duration: durationMinutes,
      exerciseSequence: exercises ? exercises.map((ex, i) => ({ order: i + 1, exercise: ex })) : [],
      categories: [],
      periods: [],
    },
  });

  return {
    success: true,
    data: {
      message: `Treningsforslag "${title}" er opprettet`,
      suggestionId: suggestion.id,
      sessionType,
      duration: durationMinutes,
    },
  };
}
