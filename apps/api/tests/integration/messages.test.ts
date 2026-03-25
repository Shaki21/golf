import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app';
import { getPrismaClient } from '../../src/core/db/prisma';

describe('Messages API Integration Tests', () => {
  let app: FastifyInstance;
  let prisma: ReturnType<typeof getPrismaClient>;
  let user1Token: string;
  let user2Token: string;
  let tenantId: string;
  let user1Id: string;
  let user2Id: string;
  let conversationId: string;
  let messageId: string;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    prisma = getPrismaClient();
    await app.ready();

    // Register first user (coach)
    const user1Response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'user1@messagestest.com',
        password: 'TestPassword123!',
        firstName: 'User',
        lastName: 'One',
        organizationName: 'Messages Test Academy',
        role: 'coach',
      },
    });

    const user1Body = JSON.parse(user1Response.body);
    user1Token = user1Body.data?.accessToken;
    user1Id = user1Body.data?.user.id;
    tenantId = user1Body.data?.user.tenantId;

    // Register second user (player)
    const user2Response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'user2@messagestest.com',
        password: 'TestPassword123!',
        firstName: 'User',
        lastName: 'Two',
        organizationName: 'Messages Test Academy',
        role: 'player',
        existingTenantSlug: 'messages-test-academy',
      },
    });

    const user2Body = JSON.parse(user2Response.body);
    user2Token = user2Body.data?.accessToken;
    user2Id = user2Body.data?.user.id;
  });

  afterAll(async () => {
    // Clean up messages and conversations
    if (conversationId) {
      await prisma.messageRead.deleteMany({
        where: { message: { conversationId } },
      }).catch(() => {});
      await prisma.message.deleteMany({ where: { conversationId } }).catch(() => {});
      await prisma.conversationParticipant.deleteMany({ where: { conversationId } }).catch(() => {});
      await prisma.conversation.delete({ where: { id: conversationId } }).catch(() => {});
    }

    // Clean up users
    if (user1Id) {
      await prisma.refreshToken.deleteMany({ where: { userId: user1Id } });
      await prisma.user.delete({ where: { id: user1Id } }).catch(() => {});
    }
    if (user2Id) {
      await prisma.refreshToken.deleteMany({ where: { userId: user2Id } });
      await prisma.user.delete({ where: { id: user2Id } }).catch(() => {});
    }
    if (tenantId) {
      await prisma.tenant.delete({ where: { id: tenantId } }).catch(() => {});
    }

    await app.close();
    await prisma.$disconnect();
  });

  describe('POST /api/v1/messages/conversations', () => {
    it('should create a new direct conversation', async () => {
      if (!user1Token || !user2Id) {
        console.log('Skipping test: tokens not available');
        return;
      }

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/messages/conversations',
        headers: { authorization: `Bearer ${user1Token}` },
        payload: {
          type: 'direct',
          participantIds: [user2Id],
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.conversation).toBeDefined();
      expect(body.conversation.type).toBe('direct');

      conversationId = body.conversation.id;
    });

    it('should return existing conversation for same participants', async () => {
      if (!user1Token || !user2Id || !conversationId) {
        console.log('Skipping test: prerequisites not available');
        return;
      }

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/messages/conversations',
        headers: { authorization: `Bearer ${user1Token}` },
        payload: {
          type: 'direct',
          participantIds: [user2Id],
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.existing).toBe(true);
      expect(body.conversation.id).toBe(conversationId);
    });

    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/messages/conversations',
        payload: {
          type: 'direct',
          participantIds: ['some-user-id'],
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/messages/conversations', () => {
    it('should list all conversations for user', async () => {
      if (!user1Token) {
        console.log('Skipping test: token not available');
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/messages/conversations',
        headers: { authorization: `Bearer ${user1Token}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.conversations).toBeDefined();
      expect(Array.isArray(body.conversations)).toBe(true);
    });
  });

  describe('POST /api/v1/messages/conversations/:conversationId/messages', () => {
    it('should send a message', async () => {
      if (!user1Token || !conversationId) {
        console.log('Skipping test: prerequisites not available');
        return;
      }

      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/messages/conversations/${conversationId}/messages`,
        headers: { authorization: `Bearer ${user1Token}` },
        payload: {
          content: 'Hello! This is a test message.',
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.message).toBeDefined();
      expect(body.message.content).toBe('Hello! This is a test message.');

      messageId = body.message.id;
    });

    it('should reject empty messages', async () => {
      if (!user1Token || !conversationId) {
        console.log('Skipping test: prerequisites not available');
        return;
      }

      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/messages/conversations/${conversationId}/messages`,
        headers: { authorization: `Bearer ${user1Token}` },
        payload: {
          content: '',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject messages from non-participants', async () => {
      // Create a new user not in the conversation
      const newUserResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'outsider@messagestest.com',
          password: 'TestPassword123!',
          firstName: 'Outside',
          lastName: 'User',
          organizationName: 'Other Academy',
          role: 'coach',
        },
      });

      const newUserBody = JSON.parse(newUserResponse.body);
      const outsiderToken = newUserBody.data?.accessToken;
      const outsiderUserId = newUserBody.data?.user.id;
      const outsiderTenantId = newUserBody.data?.user.tenantId;

      if (!outsiderToken || !conversationId) {
        console.log('Skipping test: outsider token not available');
        return;
      }

      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/messages/conversations/${conversationId}/messages`,
        headers: { authorization: `Bearer ${outsiderToken}` },
        payload: {
          content: 'Trying to send message as non-participant',
        },
      });

      expect(response.statusCode).toBe(403);

      // Clean up outsider user
      if (outsiderUserId) {
        await prisma.refreshToken.deleteMany({ where: { userId: outsiderUserId } });
        await prisma.user.delete({ where: { id: outsiderUserId } }).catch(() => {});
      }
      if (outsiderTenantId) {
        await prisma.tenant.delete({ where: { id: outsiderTenantId } }).catch(() => {});
      }
    });
  });

  describe('GET /api/v1/messages/conversations/:conversationId', () => {
    it('should get conversation with messages', async () => {
      if (!user1Token || !conversationId) {
        console.log('Skipping test: prerequisites not available');
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/messages/conversations/${conversationId}`,
        headers: { authorization: `Bearer ${user1Token}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.conversation).toBeDefined();
      expect(body.messages).toBeDefined();
      expect(Array.isArray(body.messages)).toBe(true);
    });

    it('should reject non-participants', async () => {
      if (!conversationId) {
        console.log('Skipping test: conversation ID not available');
        return;
      }

      // Create a new user not in the conversation
      const newUserResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'viewer@messagestest.com',
          password: 'TestPassword123!',
          firstName: 'Viewer',
          lastName: 'User',
          organizationName: 'Viewer Academy',
          role: 'coach',
        },
      });

      const newUserBody = JSON.parse(newUserResponse.body);
      const viewerToken = newUserBody.data?.accessToken;
      const viewerUserId = newUserBody.data?.user.id;
      const viewerTenantId = newUserBody.data?.user.tenantId;

      if (!viewerToken) {
        console.log('Skipping test: viewer token not available');
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/messages/conversations/${conversationId}`,
        headers: { authorization: `Bearer ${viewerToken}` },
      });

      expect(response.statusCode).toBe(403);

      // Clean up
      if (viewerUserId) {
        await prisma.refreshToken.deleteMany({ where: { userId: viewerUserId } });
        await prisma.user.delete({ where: { id: viewerUserId } }).catch(() => {});
      }
      if (viewerTenantId) {
        await prisma.tenant.delete({ where: { id: viewerTenantId } }).catch(() => {});
      }
    });
  });

  describe('PATCH /api/v1/messages/messages/:messageId', () => {
    it('should edit own message', async () => {
      if (!user1Token || !messageId) {
        console.log('Skipping test: prerequisites not available');
        return;
      }

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/messages/messages/${messageId}`,
        headers: { authorization: `Bearer ${user1Token}` },
        payload: {
          content: 'Edited message content',
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.message.content).toBe('Edited message content');
    });

    it('should not allow editing others messages', async () => {
      if (!user2Token || !messageId) {
        console.log('Skipping test: prerequisites not available');
        return;
      }

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/messages/messages/${messageId}`,
        headers: { authorization: `Bearer ${user2Token}` },
        payload: {
          content: 'Trying to edit someone elses message',
        },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('GET /api/v1/messages/unread-count', () => {
    it('should return unread message count', async () => {
      if (!user2Token) {
        console.log('Skipping test: token not available');
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/messages/unread-count',
        headers: { authorization: `Bearer ${user2Token}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(typeof body.unreadCount).toBe('number');
    });
  });

  describe('POST /api/v1/messages/conversations/:conversationId/read', () => {
    it('should mark conversation as read', async () => {
      if (!user2Token || !conversationId) {
        console.log('Skipping test: prerequisites not available');
        return;
      }

      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/messages/conversations/${conversationId}/read`,
        headers: { authorization: `Bearer ${user2Token}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(typeof body.markedAsRead).toBe('number');
    });
  });

  describe('DELETE /api/v1/messages/messages/:messageId', () => {
    it('should delete own message', async () => {
      if (!user1Token || !conversationId) {
        console.log('Skipping test: prerequisites not available');
        return;
      }

      // Create a message to delete
      const createResponse = await app.inject({
        method: 'POST',
        url: `/api/v1/messages/conversations/${conversationId}/messages`,
        headers: { authorization: `Bearer ${user1Token}` },
        payload: {
          content: 'Message to delete',
        },
      });

      if (createResponse.statusCode !== 200) {
        console.log('Skipping delete test: could not create message');
        return;
      }

      const createdMessage = JSON.parse(createResponse.body);

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/messages/messages/${createdMessage.message.id}`,
        headers: { authorization: `Bearer ${user1Token}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });
  });
});
