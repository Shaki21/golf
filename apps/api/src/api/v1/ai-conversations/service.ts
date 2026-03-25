import { PrismaClient } from '@prisma/client';
import { NotFoundError, ForbiddenError } from '../../../middleware/errors';

export interface CreateConversationInput {
  title?: string;
  context?: Record<string, any>;
}

export interface AddMessageInput {
  role: 'user' | 'assistant' | 'system';
  content: string;
  inputTokens?: number;
  outputTokens?: number;
  toolsUsed?: string[];
}

export interface ListConversationsQuery {
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export class AIConversationsService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new AI conversation
   */
  async createConversation(playerId: string, input: CreateConversationInput = {}) {
    const conversation = await this.prisma.aIConversation.create({
      data: {
        playerId,
        title: input.title || 'Ny samtale',
        context: input.context,
        messages: [],
        isActive: true,
      },
    });

    return conversation;
  }

  /**
   * Get a conversation by ID
   */
  async getConversation(conversationId: string, playerId: string) {
    const conversation = await this.prisma.aIConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    if (conversation.playerId !== playerId) {
      throw new ForbiddenError('You can only access your own conversations');
    }

    return conversation;
  }

  /**
   * List conversations for a player
   */
  async listConversations(playerId: string, query: ListConversationsQuery = {}) {
    const { isActive, limit = 20, offset = 0 } = query;

    const where: any = { playerId };
    if (isActive !== undefined) where.isActive = isActive;

    const conversations = await this.prisma.aIConversation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        title: true,
        isActive: true,
        totalInputTokens: true,
        totalOutputTokens: true,
        toolsUsed: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const total = await this.prisma.aIConversation.count({ where });

    return {
      conversations,
      pagination: {
        limit,
        offset,
        total,
      },
    };
  }

  /**
   * Add a message to a conversation
   */
  async addMessage(conversationId: string, playerId: string, input: AddMessageInput) {
    const conversation = await this.getConversation(conversationId, playerId);

    const messages = (conversation.messages as any[]) || [];
    messages.push({
      role: input.role,
      content: input.content,
      timestamp: new Date().toISOString(),
    });

    // Update token counts
    const totalInputTokens = conversation.totalInputTokens + (input.inputTokens || 0);
    const totalOutputTokens = conversation.totalOutputTokens + (input.outputTokens || 0);

    // Update tools used
    const toolsUsed = new Set([...conversation.toolsUsed, ...(input.toolsUsed || [])]);

    const updated = await this.prisma.aIConversation.update({
      where: { id: conversationId },
      data: {
        messages,
        totalInputTokens,
        totalOutputTokens,
        toolsUsed: Array.from(toolsUsed),
        updatedAt: new Date(),
      },
    });

    return updated;
  }

  /**
   * Update conversation title
   */
  async updateTitle(conversationId: string, playerId: string, title: string) {
    await this.getConversation(conversationId, playerId);

    const updated = await this.prisma.aIConversation.update({
      where: { id: conversationId },
      data: { title },
    });

    return updated;
  }

  /**
   * Archive a conversation (set inactive)
   */
  async archiveConversation(conversationId: string, playerId: string) {
    await this.getConversation(conversationId, playerId);

    await this.prisma.aIConversation.update({
      where: { id: conversationId },
      data: { isActive: false },
    });
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string, playerId: string) {
    await this.getConversation(conversationId, playerId);

    await this.prisma.aIConversation.delete({
      where: { id: conversationId },
    });
  }

  /**
   * Get the active conversation for a player (or create one if none exists)
   */
  async getOrCreateActiveConversation(playerId: string) {
    // Try to find an active conversation
    let conversation = await this.prisma.aIConversation.findFirst({
      where: {
        playerId,
        isActive: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Create new if none exists
    if (!conversation) {
      conversation = await this.createConversation(playerId);
    }

    return conversation;
  }

  /**
   * Get usage statistics for a player
   */
  async getUsageStats(playerId: string) {
    const conversations = await this.prisma.aIConversation.findMany({
      where: { playerId },
      select: {
        totalInputTokens: true,
        totalOutputTokens: true,
        messages: true,
        createdAt: true,
      },
    });

    const totalInputTokens = conversations.reduce((sum, c) => sum + c.totalInputTokens, 0);
    const totalOutputTokens = conversations.reduce((sum, c) => sum + c.totalOutputTokens, 0);
    const totalMessages = conversations.reduce((sum, c) => sum + ((c.messages as any[])?.length || 0), 0);

    // Calculate usage over last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentConversations = conversations.filter(c => c.createdAt >= thirtyDaysAgo);
    const last30DaysInputTokens = recentConversations.reduce((sum, c) => sum + c.totalInputTokens, 0);
    const last30DaysOutputTokens = recentConversations.reduce((sum, c) => sum + c.totalOutputTokens, 0);

    return {
      totalConversations: conversations.length,
      totalMessages,
      totalInputTokens,
      totalOutputTokens,
      totalTokens: totalInputTokens + totalOutputTokens,
      last30Days: {
        conversations: recentConversations.length,
        inputTokens: last30DaysInputTokens,
        outputTokens: last30DaysOutputTokens,
        totalTokens: last30DaysInputTokens + last30DaysOutputTokens,
      },
    };
  }
}
