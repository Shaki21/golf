/**
 * AI Coach Service
 *
 * Provides AI-powered golf coaching features:
 * - Chat with AI coach for training advice (with tool use)
 * - Training plan recommendations
 * - Breaking point analysis
 * - Progress insights
 *
 * Uses Claude tool calling for dynamic data retrieval during conversations.
 */

import { claudeClient, ChatMessage } from './claude-client.service';
import { AI_COACH_TOOLS, executeToolCall } from './ai-tools';
import { getPrismaClient } from '../../core/db/prisma';
import Anthropic from '@anthropic-ai/sdk';

const prisma = getPrismaClient();

// Types
export interface PlayerContext {
  id: string;
  name: string;
  email: string;
  category?: string;
  handicap?: number;
  averageScore?: number;
  breakingPoints?: Array<{
    area: string;
    description: string;
    progress: number;
  }>;
  recentSessions?: Array<{
    date: string;
    type: string;
    duration: number;
    rating?: number;
  }>;
  goals?: string[];
}

export interface CoachingMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface CoachingSession {
  id: string;
  playerId: string;
  messages: CoachingMessage[];
  context?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// System prompts
const GOLF_COACH_SYSTEM_PROMPT = `Du er en erfaren golf-coach ved AK Golf Academy. Du hjelper spillere med treningsråd, teknikk-tips, og mental forberedelse.

DINE EGENSKAPER:
- Vennlig og støttende, men profesjonell
- Fokusert på spillerens individuelle behov og mål
- Gir konkrete, praktiske råd
- Snakker norsk naturlig

OMRÅDER DU KAN HJELPE MED:
1. Treningsplanlegging og periodisering
2. Teknikk-forbedring (driver, jern, putting, kort spill)
3. Mental trening og selvtillit
4. Spillestrategi på banen
5. Breaking point analyse og forbedring
6. Målsetting og motivasjon

VIKTIGE PRINSIPPER:
- Tilpass råd til spillerens nivå (kategori A-D)
- Fokuser på ett område om gangen
- Gi konkrete øvelser når relevant
- Spør oppfølgingsspørsmål for å forstå bedre
- Vær realistisk om tidsrammer for forbedring

Svar alltid på norsk med mindre spilleren skriver på engelsk.`;

class AICoachService {
  /**
   * Get player context for AI coaching
   */
  async getPlayerContext(playerId: string): Promise<PlayerContext | null> {
    try {
      const player = await prisma.player.findUnique({
        where: { id: playerId },
        include: {
          user: {
            select: {
              email: true,
            },
          },
          breakingPoints: {
            where: { status: { in: ['active', 'not_started', 'in_progress'] } },
            take: 5,
            select: {
              specificArea: true,
              description: true,
              progressPercent: true,
            },
          },
        },
      });

      if (!player) return null;

      // Get recent training sessions
      const recentAssignments = await prisma.dailyTrainingAssignment.findMany({
        where: {
          playerId,
          status: 'completed',
        },
        orderBy: { assignedDate: 'desc' },
        take: 5,
        include: {
          sessionTemplate: {
            select: {
              sessionType: true,
            },
          },
        },
      });

      return {
        id: player.id,
        name: `${player.firstName} ${player.lastName}`,
        email: player.user?.email || player.email || '',
        category: player.category || undefined,
        handicap: player.handicap ? parseFloat(player.handicap.toString()) : undefined,
        averageScore: player.averageScore ? parseFloat(player.averageScore.toString()) : undefined,
        breakingPoints: player.breakingPoints?.map(bp => ({
          area: bp.specificArea,
          description: bp.description || '',
          progress: bp.progressPercent,
        })),
        recentSessions: recentAssignments.map(a => ({
          date: a.assignedDate.toISOString().split('T')[0],
          type: a.sessionTemplate?.sessionType || a.sessionType || 'general',
          duration: a.estimatedDuration || 60,
        })),
        goals: player.goals ? (player.goals as string[]) : [],
      };
    } catch (error) {
      console.error('Error getting player context:', error);
      return null;
    }
  }

  /**
   * Build system prompt with player context
   */
  private buildSystemPrompt(playerContext?: PlayerContext | null): string {
    let prompt = GOLF_COACH_SYSTEM_PROMPT;

    if (playerContext) {
      prompt += `\n\nSPILLERINFORMASJON:
- Navn: ${playerContext.name}
- Kategori: ${playerContext.category || 'Ukjent'}
- Handicap: ${playerContext.handicap !== undefined ? playerContext.handicap : 'Ukjent'}
- Snittcore: ${playerContext.averageScore || 'Ukjent'}`;

      if (playerContext.breakingPoints && playerContext.breakingPoints.length > 0) {
        prompt += `\n\nBREAKING POINTS (områder å forbedre):`;
        playerContext.breakingPoints.forEach((bp, i) => {
          prompt += `\n${i + 1}. ${bp.area}: ${bp.description} (${bp.progress}% fremgang)`;
        });
      }

      if (playerContext.recentSessions && playerContext.recentSessions.length > 0) {
        prompt += `\n\nSISTE TRENINGSØKTER:`;
        playerContext.recentSessions.forEach(s => {
          prompt += `\n- ${s.date}: ${s.type} (${s.duration} min)${s.rating ? ` - Rating: ${s.rating}/10` : ''}`;
        });
      }

      if (playerContext.goals && playerContext.goals.length > 0) {
        prompt += `\n\nSPILLERENS MÅL:`;
        playerContext.goals.forEach((g, i) => {
          prompt += `\n${i + 1}. ${g}`;
        });
      }
    }

    return prompt;
  }

  /**
   * Chat with AI coach (with tool use support)
   *
   * Implements an agentic loop that allows Claude to call tools
   * to fetch player data dynamically during the conversation.
   */
  async chat(
    playerId: string,
    message: string,
    conversationHistory: ChatMessage[] = [],
    options: { useTools?: boolean } = {}
  ): Promise<{
    response: string;
    tokens: { input: number; output: number };
    toolsUsed?: string[];
  }> {
    if (!claudeClient.isAvailable()) {
      return {
        response: 'AI-coach er ikke tilgjengelig for øyeblikket. Vennligst kontakt din trener direkte.',
        tokens: { input: 0, output: 0 },
      };
    }

    // Get player context
    const playerContext = await this.getPlayerContext(playerId);
    const systemPrompt = this.buildSystemPromptWithTools(playerContext, playerId);

    // Build initial messages
    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ];

    const useTools = options.useTools !== false; // Default to true
    const toolsUsed: string[] = [];
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    try {
      // Agentic loop - keep calling until we get a final response
      const MAX_ITERATIONS = 5;
      let iterations = 0;

      while (iterations < MAX_ITERATIONS) {
        iterations++;

        const response = await claudeClient.chat(
          messages as ChatMessage[],
          {
            system: systemPrompt,
            temperature: 0.7,
            tools: useTools ? AI_COACH_TOOLS : undefined,
          }
        );

        totalInputTokens += response.usage.inputTokens;
        totalOutputTokens += response.usage.outputTokens;

        // If no tool calls, we're done
        if (!response.toolCalls || response.toolCalls.length === 0) {
          return {
            response: response.content,
            tokens: { input: totalInputTokens, output: totalOutputTokens },
            toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
          };
        }

        // Handle tool calls
        const assistantContent: Anthropic.ContentBlockParam[] = [];

        // Add any text content from the response
        if (response.content) {
          assistantContent.push({ type: 'text', text: response.content });
        }

        // Add tool use blocks
        for (const toolCall of response.toolCalls) {
          assistantContent.push({
            type: 'tool_use',
            id: toolCall.id,
            name: toolCall.name,
            input: toolCall.input,
          });
        }

        // Add assistant message with tool calls
        messages.push({
          role: 'assistant',
          content: assistantContent,
        });

        // Execute tools and build results
        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const toolCall of response.toolCalls) {
          console.log(`[AI Coach] Executing tool: ${toolCall.name}`);
          toolsUsed.push(toolCall.name);

          const result = await executeToolCall(toolCall.name, {
            ...toolCall.input,
            player_id: playerId, // Always inject player_id
          });

          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolCall.id,
            content: JSON.stringify(result.success ? result.data : { error: result.error }),
            is_error: !result.success,
          });
        }

        // Add tool results as user message
        messages.push({
          role: 'user',
          content: toolResults,
        });
      }

      // If we hit max iterations, return what we have
      return {
        response: 'Beklager, jeg brukte for lang tid på å svare. Vennligst prøv igjen med et enklere spørsmål.',
        tokens: { input: totalInputTokens, output: totalOutputTokens },
        toolsUsed,
      };
    } catch (error) {
      console.error('AI Coach chat error:', error);
      return {
        response: 'Beklager, jeg kunne ikke behandle meldingen din. Vennligst prøv igjen.',
        tokens: { input: 0, output: 0 },
      };
    }
  }

  /**
   * Build system prompt with tool instructions
   */
  private buildSystemPromptWithTools(playerContext: PlayerContext | null, playerId: string): string {
    let prompt = this.buildSystemPrompt(playerContext);

    prompt += `\n\nVERKTØY TILGJENGELIG:
Du har tilgang til verktøy for å hente oppdatert informasjon om spilleren. Bruk disse aktivt for å gi presise svar:

- get_player_test_results: Hent testresultater for å analysere ferdigheter
- get_player_training_history: Se treningshistorikk og volum
- get_player_goals: Se spillerens mål og breaking points
- get_player_category_requirements: Se krav for neste kategori
- get_upcoming_tournaments: Se kommende turneringer
- create_training_suggestion: Opprett konkrete treningsforslag

Bruk alltid player_id: "${playerId}" når du kaller verktøy.

VIKTIG: Hvis brukeren spør om sine resultater, progresjon, eller noe som krever fersk data - bruk verktøyene for å hente informasjon før du svarer.`;

    return prompt;
  }

  /**
   * Get training recommendations (with tool-enhanced data gathering)
   *
   * Uses AI tools to fetch comprehensive player data before generating
   * personalized training recommendations.
   */
  async getTrainingRecommendations(
    playerId: string,
    options: { useTools?: boolean } = {}
  ): Promise<{
    recommendations: string;
    toolsUsed?: string[];
    suggestedExercises?: Array<{
      name: string;
      category: string;
      duration: number;
      priority: 'high' | 'medium' | 'low';
    }>;
  }> {
    const playerContext = await this.getPlayerContext(playerId);

    if (!playerContext) {
      return {
        recommendations: 'Kunne ikke finne spillerinformasjon.',
      };
    }

    const useTools = options.useTools !== false;

    const prompt = `Du skal generere treningsanbefalinger for denne spilleren.

INSTRUKSJONER:
1. FØRST: Bruk verktøyene til å hente detaljert informasjon:
   - Hent testresultater for å se styrker og svakheter
   - Hent treningshistorikk for å se nylig aktivitet
   - Hent spillerens mål og breaking points
   - Hent kategorikrav for å se hva som trengs for progresjon

2. DERETTER: Analyser all innsamlet data og gi 3-5 konkrete treningsanbefalinger.

3. For hver anbefaling, inkluder:
   - Hva spilleren bør jobbe med
   - Hvorfor dette er viktig basert på dataene
   - Spesifikke øvelser eller drill
   - Tidsanslag per uke

4. Bruk ALLTID create_training_suggestion verktøyet for å registrere de viktigste forslagene.

Fokuser på:
- Breaking points som trenger oppmerksomhet
- Balanse mellom ulike treningstyper
- Kategorikrav som ikke er oppfylt
- Realistisk tidsbruk basert på spillerens nivå

Formater svaret som en tydelig og motiverende treningsplan.`;

    if (!useTools) {
      // Simple mode without tools
      try {
        const response = await claudeClient.chat(
          [{ role: 'user', content: prompt }],
          {
            system: this.buildSystemPrompt(playerContext),
            temperature: 0.5,
          }
        );

        return { recommendations: response.content };
      } catch (error) {
        console.error('Error getting recommendations:', error);
        return {
          recommendations: 'Kunne ikke generere anbefalinger. Vennligst prøv igjen senere.',
        };
      }
    }

    // Tool-enhanced mode
    const systemPrompt = this.buildSystemPromptWithTools(playerContext, playerId);
    const messages: Anthropic.MessageParam[] = [
      { role: 'user', content: prompt },
    ];

    const toolsUsed: string[] = [];
    const suggestedExercises: Array<{
      name: string;
      category: string;
      duration: number;
      priority: 'high' | 'medium' | 'low';
    }> = [];

    try {
      const MAX_ITERATIONS = 5;
      let iterations = 0;

      while (iterations < MAX_ITERATIONS) {
        iterations++;

        const response = await claudeClient.chat(
          messages as ChatMessage[],
          {
            system: systemPrompt,
            temperature: 0.5,
            tools: AI_COACH_TOOLS,
          }
        );

        // If no tool calls, we're done
        if (!response.toolCalls || response.toolCalls.length === 0) {
          return {
            recommendations: response.content,
            toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
            suggestedExercises: suggestedExercises.length > 0 ? suggestedExercises : undefined,
          };
        }

        // Handle tool calls
        const assistantContent: Anthropic.ContentBlockParam[] = [];

        if (response.content) {
          assistantContent.push({ type: 'text', text: response.content });
        }

        for (const toolCall of response.toolCalls) {
          assistantContent.push({
            type: 'tool_use',
            id: toolCall.id,
            name: toolCall.name,
            input: toolCall.input,
          });
        }

        messages.push({
          role: 'assistant',
          content: assistantContent,
        });

        // Execute tools
        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const toolCall of response.toolCalls) {
          console.log(`[AI Recommendations] Executing tool: ${toolCall.name}`);
          toolsUsed.push(toolCall.name);

          const result = await executeToolCall(toolCall.name, {
            ...toolCall.input,
            player_id: playerId,
          });

          // Capture training suggestions for structured output
          if (toolCall.name === 'create_training_suggestion' && result.success) {
            const input = toolCall.input as Record<string, unknown>;
            suggestedExercises.push({
              name: input.title as string,
              category: input.category as string,
              duration: (input.duration_minutes as number) || 30,
              priority: (input.priority as 'high' | 'medium' | 'low') || 'medium',
            });
          }

          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolCall.id,
            content: JSON.stringify(result.success ? result.data : { error: result.error }),
            is_error: !result.success,
          });
        }

        messages.push({
          role: 'user',
          content: toolResults,
        });
      }

      return {
        recommendations: 'Kunne ikke fullføre analyse. Prøv igjen.',
        toolsUsed,
      };
    } catch (error) {
      console.error('Error getting recommendations with tools:', error);
      return {
        recommendations: 'Kunne ikke generere anbefalinger. Vennligst prøv igjen senere.',
      };
    }
  }

  /**
   * Analyze breaking point and suggest exercises
   */
  async analyzeBreakingPoint(
    playerId: string,
    breakingPointArea: string,
    description?: string
  ): Promise<string> {
    const playerContext = await this.getPlayerContext(playerId);

    const prompt = `Analyser dette breaking point for spilleren og foreslå en konkret treningsplan:

BREAKING POINT: ${breakingPointArea}
${description ? `BESKRIVELSE: ${description}` : ''}

Gi:
1. Mulige årsaker til problemet
2. 3-4 spesifikke øvelser for å forbedre
3. Forventet tidsramme for merkbar forbedring
4. Tips for å måle fremgang`;

    try {
      const response = await claudeClient.chat(
        [{ role: 'user', content: prompt }],
        {
          system: this.buildSystemPrompt(playerContext),
          temperature: 0.5,
        }
      );

      return response.content;
    } catch (error) {
      console.error('Error analyzing breaking point:', error);
      return 'Kunne ikke analysere breaking point. Vennligst prøv igjen senere.';
    }
  }

  /**
   * Generate AI-assisted training plan suggestions
   *
   * Uses AI tools to analyze player data and generate personalized
   * training plan recommendations before running full plan generation.
   */
  async generatePlanSuggestions(
    playerId: string,
    options: {
      weeklyHoursTarget?: number;
      focusAreas?: string[];
      goalDescription?: string;
    } = {}
  ): Promise<{
    summary: string;
    suggestedFocus: Array<{
      area: string;
      priority: 'high' | 'medium' | 'low';
      reason: string;
      suggestedHoursPerWeek: number;
    }>;
    weeklyStructure: {
      recommendedDays: number;
      sessionTypes: Array<{
        type: string;
        frequency: string;
        duration: string;
      }>;
    };
    periodization: {
      baseWeeks: number;
      buildWeeks: number;
      peakWeeks: number;
      rationale: string;
    };
    toolsUsed: string[];
  }> {
    const playerContext = await this.getPlayerContext(playerId);

    if (!playerContext) {
      return {
        summary: 'Kunne ikke finne spillerinformasjon.',
        suggestedFocus: [],
        weeklyStructure: { recommendedDays: 4, sessionTypes: [] },
        periodization: { baseWeeks: 16, buildWeeks: 12, peakWeeks: 24, rationale: '' },
        toolsUsed: [],
      };
    }

    const prompt = `Analyser denne spilleren og generer en treningsplan-anbefaling.

INSTRUKSJONER:
1. Bruk verktøyene til å hente:
   - Testresultater for å identifisere styrker/svakheter
   - Mål og breaking points
   - Kategorikrav for progresjon
   - Treningshistorikk

2. Basert på dataene, lag en strukturert anbefaling for treningsplan.

${options.weeklyHoursTarget ? `Spilleren ønsker å trene ca ${options.weeklyHoursTarget} timer per uke.` : ''}
${options.focusAreas?.length ? `Fokusområder: ${options.focusAreas.join(', ')}` : ''}
${options.goalDescription ? `Spillerens mål: ${options.goalDescription}` : ''}

Svar i følgende JSON-format:
{
  "summary": "Kort oppsummering av anbefalingen",
  "suggestedFocus": [
    {
      "area": "Område (f.eks. Putting, Driving, Kort spill)",
      "priority": "high/medium/low",
      "reason": "Begrunnelse basert på data",
      "suggestedHoursPerWeek": 2
    }
  ],
  "weeklyStructure": {
    "recommendedDays": 4,
    "sessionTypes": [
      {
        "type": "Putting",
        "frequency": "2x per uke",
        "duration": "45 min"
      }
    ]
  },
  "periodization": {
    "baseWeeks": 16,
    "buildWeeks": 12,
    "peakWeeks": 24,
    "rationale": "Begrunnelse for periodiseringen"
  }
}`;

    const systemPrompt = this.buildSystemPromptWithTools(playerContext, playerId);
    const messages: Anthropic.MessageParam[] = [
      { role: 'user', content: prompt },
    ];

    const toolsUsed: string[] = [];

    try {
      const MAX_ITERATIONS = 5;
      let iterations = 0;
      let finalContent = '';

      while (iterations < MAX_ITERATIONS) {
        iterations++;

        const response = await claudeClient.chat(
          messages as ChatMessage[],
          {
            system: systemPrompt,
            temperature: 0.3, // Lower temperature for structured output
            tools: AI_COACH_TOOLS,
          }
        );

        if (!response.toolCalls || response.toolCalls.length === 0) {
          finalContent = response.content;
          break;
        }

        // Handle tool calls
        const assistantContent: Anthropic.ContentBlockParam[] = [];

        if (response.content) {
          assistantContent.push({ type: 'text', text: response.content });
        }

        for (const toolCall of response.toolCalls) {
          assistantContent.push({
            type: 'tool_use',
            id: toolCall.id,
            name: toolCall.name,
            input: toolCall.input,
          });
        }

        messages.push({ role: 'assistant', content: assistantContent });

        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const toolCall of response.toolCalls) {
          console.log(`[AI Plan Suggestions] Executing tool: ${toolCall.name}`);
          toolsUsed.push(toolCall.name);

          const result = await executeToolCall(toolCall.name, {
            ...toolCall.input,
            player_id: playerId,
          });

          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolCall.id,
            content: JSON.stringify(result.success ? result.data : { error: result.error }),
            is_error: !result.success,
          });
        }

        messages.push({ role: 'user', content: toolResults });
      }

      // Parse JSON from response
      const jsonMatch = finalContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            summary: parsed.summary || '',
            suggestedFocus: parsed.suggestedFocus || [],
            weeklyStructure: parsed.weeklyStructure || { recommendedDays: 4, sessionTypes: [] },
            periodization: parsed.periodization || { baseWeeks: 16, buildWeeks: 12, peakWeeks: 24, rationale: '' },
            toolsUsed,
          };
        } catch {
          // If JSON parsing fails, return the text as summary
          return {
            summary: finalContent,
            suggestedFocus: [],
            weeklyStructure: { recommendedDays: 4, sessionTypes: [] },
            periodization: { baseWeeks: 16, buildWeeks: 12, peakWeeks: 24, rationale: '' },
            toolsUsed,
          };
        }
      }

      return {
        summary: finalContent,
        suggestedFocus: [],
        weeklyStructure: { recommendedDays: 4, sessionTypes: [] },
        periodization: { baseWeeks: 16, buildWeeks: 12, peakWeeks: 24, rationale: '' },
        toolsUsed,
      };
    } catch (error) {
      console.error('Error generating plan suggestions:', error);
      return {
        summary: 'Kunne ikke generere anbefalinger. Prøv igjen senere.',
        suggestedFocus: [],
        weeklyStructure: { recommendedDays: 4, sessionTypes: [] },
        periodization: { baseWeeks: 16, buildWeeks: 12, peakWeeks: 24, rationale: '' },
        toolsUsed,
      };
    }
  }

  /**
   * Get AI coach status
   */
  getStatus(): { available: boolean; model: string } {
    const modelInfo = claudeClient.getModelInfo();
    return {
      available: claudeClient.isAvailable(),
      model: modelInfo.model,
    };
  }
}

// Export singleton
export const aiCoach = new AICoachService();
export default aiCoach;
