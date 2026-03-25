/**
 * AI Coaching API Routes
 *
 * Endpoints for AI-powered golf coaching:
 * - Chat with AI coach
 * - Get training recommendations
 * - Breaking point analysis
 * - Conversation management
 */

import { FastifyPluginAsync } from 'fastify';
import { aiCoach, ChatMessage, aiConversationService, claudeClient, AI_COACH_TOOLS } from '../../../services/ai';

// Request/Response types
interface ChatRequest {
  message: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  useTools?: boolean;
}

interface ChatResponse {
  success: boolean;
  data: {
    response: string;
    tokens: {
      input: number;
      output: number;
    };
    toolsUsed?: string[];
  };
}

interface RecommendationsResponse {
  success: boolean;
  data: {
    recommendations: string;
    toolsUsed?: string[];
    suggestedExercises?: Array<{
      name: string;
      category: string;
      duration: number;
      priority: 'high' | 'medium' | 'low';
    }>;
  };
}

interface BreakingPointAnalysisRequest {
  area: string;
  description?: string;
}

interface BreakingPointAnalysisResponse {
  success: boolean;
  data: {
    analysis: string;
  };
}

interface StatusResponse {
  success: boolean;
  data: {
    available: boolean;
    model: string;
  };
}

const aiRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/v1/ai/status
   * Get AI coach availability status
   */
  fastify.get<{ Reply: StatusResponse }>(
    '/status',
    {
      schema: {
        description: 'Get AI coach status',
        tags: ['AI'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  available: { type: 'boolean' },
                  model: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async () => {
      const status = aiCoach.getStatus();
      return {
        success: true,
        data: status,
      };
    }
  );

  /**
   * POST /api/v1/ai/chat
   * Chat with AI coach
   */
  fastify.post<{
    Body: ChatRequest;
    Reply: ChatResponse;
  }>(
    '/chat',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Chat with AI golf coach',
        tags: ['AI'],
        body: {
          type: 'object',
          required: ['message'],
          properties: {
            message: {
              type: 'string',
              minLength: 1,
              maxLength: 2000,
            },
            conversationHistory: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  role: { type: 'string', enum: ['user', 'assistant'] },
                  content: { type: 'string' },
                },
              },
              maxItems: 20,
            },
            useTools: {
              type: 'boolean',
              default: true,
              description: 'Enable AI tools for dynamic data fetching',
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  response: { type: 'string' },
                  tokens: {
                    type: 'object',
                    properties: {
                      input: { type: 'number' },
                      output: { type: 'number' },
                    },
                  },
                  toolsUsed: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of AI tools used during the conversation',
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { message, conversationHistory = [], useTools = true } = request.body;
      const playerId = request.user?.playerId;

      if (!playerId) {
        return reply.code(401).send({
          success: false,
          error: 'Player ID required',
        } as unknown as ChatResponse);
      }

      const result = await aiCoach.chat(
        playerId,
        message,
        conversationHistory as ChatMessage[],
        { useTools }
      );

      return {
        success: true,
        data: result,
      };
    }
  );

  /**
   * GET /api/v1/ai/recommendations
   * Get AI training recommendations with tool-enhanced data gathering
   */
  fastify.get<{
    Querystring: { useTools?: boolean };
    Reply: RecommendationsResponse;
  }>(
    '/recommendations',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Get AI training recommendations',
        tags: ['AI'],
        querystring: {
          type: 'object',
          properties: {
            useTools: {
              type: 'boolean',
              default: true,
              description: 'Use AI tools for enhanced data gathering',
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  recommendations: { type: 'string' },
                  toolsUsed: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  suggestedExercises: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        category: { type: 'string' },
                        duration: { type: 'number' },
                        priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const playerId = request.user?.playerId;

      if (!playerId) {
        return reply.code(401).send({
          success: false,
          error: 'Player ID required',
        } as unknown as RecommendationsResponse);
      }

      const { useTools = true } = request.query;
      const result = await aiCoach.getTrainingRecommendations(playerId, { useTools });

      return {
        success: true,
        data: result,
      };
    }
  );

  /**
   * POST /api/v1/ai/analyze-breaking-point
   * Analyze a breaking point and get suggestions
   */
  fastify.post<{
    Body: BreakingPointAnalysisRequest;
    Reply: BreakingPointAnalysisResponse;
  }>(
    '/analyze-breaking-point',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Analyze breaking point with AI',
        tags: ['AI'],
        body: {
          type: 'object',
          required: ['area'],
          properties: {
            area: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
            },
            description: {
              type: 'string',
              maxLength: 500,
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  analysis: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { area, description } = request.body;
      const playerId = request.user?.playerId;

      if (!playerId) {
        return reply.code(401).send({
          success: false,
          error: 'Player ID required',
        } as unknown as BreakingPointAnalysisResponse);
      }

      const analysis = await aiCoach.analyzeBreakingPoint(
        playerId,
        area,
        description
      );

      return {
        success: true,
        data: { analysis },
      };
    }
  );

  // =========================================================================
  // STREAMING ENDPOINT
  // =========================================================================

  /**
   * POST /api/v1/ai/chat/stream
   * Stream chat response using Server-Sent Events
   */
  fastify.post<{ Body: ChatRequest }>(
    '/chat/stream',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Stream chat with AI golf coach using SSE',
        tags: ['AI'],
        body: {
          type: 'object',
          required: ['message'],
          properties: {
            message: { type: 'string', minLength: 1, maxLength: 2000 },
            conversationHistory: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  role: { type: 'string', enum: ['user', 'assistant'] },
                  content: { type: 'string' },
                },
              },
              maxItems: 20,
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { message, conversationHistory = [] } = request.body;
      const playerId = request.user?.playerId;

      if (!playerId) {
        return reply.code(401).send({ success: false, error: 'Player ID required' });
      }

      if (!claudeClient.isAvailable()) {
        return reply.code(503).send({
          success: false,
          error: 'AI coach is not available',
        });
      }

      // Set SSE headers
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });

      // Get player context for system prompt
      const playerContext = await aiCoach.getPlayerContext(playerId);

      // Build system prompt (simplified version)
      let systemPrompt = `Du er en erfaren golf-coach ved AK Golf Academy. Du hjelper spillere med treningsråd, teknikk-tips, og mental forberedelse. Svar alltid på norsk.`;

      if (playerContext) {
        systemPrompt += `\n\nSpillerinfo: ${playerContext.name}, kategori ${playerContext.category || 'ukjent'}, handicap ${playerContext.handicap || 'ukjent'}`;
      }

      const messages = [
        ...conversationHistory.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content: message },
      ];

      try {
        const stream = claudeClient.chatStream(messages, {
          system: systemPrompt,
          temperature: 0.7,
          tools: AI_COACH_TOOLS,
        });

        for await (const event of stream) {
          const data = JSON.stringify(event);
          reply.raw.write(`data: ${data}\n\n`);
        }

        reply.raw.end();
      } catch (error) {
        console.error('Streaming error:', error);
        const errorEvent = JSON.stringify({
          type: 'error',
          error: 'Failed to stream response',
        });
        reply.raw.write(`data: ${errorEvent}\n\n`);
        reply.raw.end();
      }
    }
  );

  // =========================================================================
  // CONVERSATION MANAGEMENT ENDPOINTS
  // =========================================================================

  /**
   * GET /api/v1/ai/conversations
   * Get all conversations for the current player
   */
  fastify.get<{
    Querystring: { limit?: number; includeInactive?: boolean };
  }>(
    '/conversations',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Get player conversations',
        tags: ['AI'],
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'number', default: 20 },
            includeInactive: { type: 'boolean', default: false },
          },
        },
      },
    },
    async (request, reply) => {
      const playerId = request.user?.playerId;
      if (!playerId) {
        return reply.code(401).send({ success: false, error: 'Player ID required' });
      }

      const conversations = await aiConversationService.getPlayerConversations(
        playerId,
        request.query
      );

      return { success: true, data: { conversations } };
    }
  );

  /**
   * GET /api/v1/ai/conversations/:id
   * Get a specific conversation
   */
  fastify.get<{ Params: { id: string } }>(
    '/conversations/:id',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Get conversation by ID',
        tags: ['AI'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    async (request, reply) => {
      const playerId = request.user?.playerId;
      if (!playerId) {
        return reply.code(401).send({ success: false, error: 'Player ID required' });
      }

      const conversation = await aiConversationService.getConversation(
        request.params.id,
        playerId
      );

      if (!conversation) {
        return reply.code(404).send({ success: false, error: 'Conversation not found' });
      }

      return { success: true, data: { conversation } };
    }
  );

  /**
   * POST /api/v1/ai/conversations
   * Create a new conversation
   */
  fastify.post<{ Body: { message?: string } }>(
    '/conversations',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Create new conversation',
        tags: ['AI'],
        body: {
          type: 'object',
          properties: {
            message: { type: 'string', maxLength: 2000 },
          },
        },
      },
    },
    async (request, reply) => {
      const playerId = request.user?.playerId;
      if (!playerId) {
        return reply.code(401).send({ success: false, error: 'Player ID required' });
      }

      const conversation = await aiConversationService.createConversation(
        playerId,
        request.body.message
      );

      return { success: true, data: { conversation } };
    }
  );

  /**
   * POST /api/v1/ai/conversations/:id/chat
   * Send a message in a conversation and get AI response
   */
  fastify.post<{
    Params: { id: string };
    Body: { message: string; useTools?: boolean };
  }>(
    '/conversations/:id/chat',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Chat in a conversation',
        tags: ['AI'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['message'],
          properties: {
            message: { type: 'string', minLength: 1, maxLength: 2000 },
            useTools: { type: 'boolean', default: true },
          },
        },
      },
    },
    async (request, reply) => {
      const playerId = request.user?.playerId;
      if (!playerId) {
        return reply.code(401).send({ success: false, error: 'Player ID required' });
      }

      const { id } = request.params;
      const { message, useTools = true } = request.body;

      // Get existing conversation
      const conversation = await aiConversationService.getConversation(id, playerId);
      if (!conversation) {
        return reply.code(404).send({ success: false, error: 'Conversation not found' });
      }

      // Add user message
      await aiConversationService.addMessage(id, playerId, {
        role: 'user',
        content: message,
      });

      // Get conversation history for AI
      const history = conversation.messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Get AI response
      const result = await aiCoach.chat(
        playerId,
        message,
        history as ChatMessage[],
        { useTools }
      );

      // Add assistant message
      const updated = await aiConversationService.addMessage(
        id,
        playerId,
        {
          role: 'assistant',
          content: result.response,
        },
        result.tokens,
        result.toolsUsed
      );

      return {
        success: true,
        data: {
          response: result.response,
          tokens: result.tokens,
          toolsUsed: result.toolsUsed,
          conversation: updated,
        },
      };
    }
  );

  /**
   * PATCH /api/v1/ai/conversations/:id
   * Update conversation (title)
   */
  fastify.patch<{
    Params: { id: string };
    Body: { title: string };
  }>(
    '/conversations/:id',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Update conversation',
        tags: ['AI'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 255 },
          },
        },
      },
    },
    async (request, reply) => {
      const playerId = request.user?.playerId;
      if (!playerId) {
        return reply.code(401).send({ success: false, error: 'Player ID required' });
      }

      const success = await aiConversationService.updateTitle(
        request.params.id,
        playerId,
        request.body.title
      );

      if (!success) {
        return reply.code(404).send({ success: false, error: 'Conversation not found' });
      }

      return { success: true };
    }
  );

  /**
   * DELETE /api/v1/ai/conversations/:id
   * Delete (archive) a conversation
   */
  fastify.delete<{ Params: { id: string }; Querystring: { permanent?: boolean } }>(
    '/conversations/:id',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Delete conversation',
        tags: ['AI'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            permanent: { type: 'boolean', default: false },
          },
        },
      },
    },
    async (request, reply) => {
      const playerId = request.user?.playerId;
      if (!playerId) {
        return reply.code(401).send({ success: false, error: 'Player ID required' });
      }

      const { permanent = false } = request.query;
      const success = permanent
        ? await aiConversationService.deleteConversation(request.params.id, playerId)
        : await aiConversationService.archiveConversation(request.params.id, playerId);

      if (!success) {
        return reply.code(404).send({ success: false, error: 'Conversation not found' });
      }

      return { success: true };
    }
  );

  /**
   * GET /api/v1/ai/stats
   * Get AI usage statistics for the player
   */
  fastify.get(
    '/stats',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Get AI usage statistics',
        tags: ['AI'],
      },
    },
    async (request, reply) => {
      const playerId = request.user?.playerId;
      if (!playerId) {
        return reply.code(401).send({ success: false, error: 'Player ID required' });
      }

      const stats = await aiConversationService.getPlayerStats(playerId);
      return { success: true, data: { stats } };
    }
  );

  /**
   * POST /api/v1/ai/plan-suggestions
   * Generate AI-assisted training plan suggestions
   */
  fastify.post<{
    Body: {
      weeklyHoursTarget?: number;
      focusAreas?: string[];
      goalDescription?: string;
    };
  }>(
    '/plan-suggestions',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Generate AI-assisted training plan suggestions',
        tags: ['AI'],
        body: {
          type: 'object',
          properties: {
            weeklyHoursTarget: {
              type: 'number',
              minimum: 1,
              maximum: 40,
              description: 'Target training hours per week',
            },
            focusAreas: {
              type: 'array',
              items: { type: 'string' },
              maxItems: 5,
              description: 'Areas to focus on (e.g., Putting, Driving)',
            },
            goalDescription: {
              type: 'string',
              maxLength: 500,
              description: 'Description of player goals',
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  summary: { type: 'string' },
                  suggestedFocus: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        area: { type: 'string' },
                        priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                        reason: { type: 'string' },
                        suggestedHoursPerWeek: { type: 'number' },
                      },
                    },
                  },
                  weeklyStructure: {
                    type: 'object',
                    properties: {
                      recommendedDays: { type: 'number' },
                      sessionTypes: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            type: { type: 'string' },
                            frequency: { type: 'string' },
                            duration: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                  periodization: {
                    type: 'object',
                    properties: {
                      baseWeeks: { type: 'number' },
                      buildWeeks: { type: 'number' },
                      peakWeeks: { type: 'number' },
                      rationale: { type: 'string' },
                    },
                  },
                  toolsUsed: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const playerId = request.user?.playerId;
      if (!playerId) {
        return reply.code(401).send({ success: false, error: 'Player ID required' });
      }

      const result = await aiCoach.generatePlanSuggestions(playerId, request.body);

      return {
        success: true,
        data: result,
      };
    }
  );
};

export default aiRoutes;
