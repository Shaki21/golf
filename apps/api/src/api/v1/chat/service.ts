import { PrismaClient } from '@prisma/client';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../../middleware/errors';

export interface CreateGroupInput {
  name: string;
  description?: string;
  groupType: 'direct' | 'team' | 'academy' | 'coach_player';
  memberIds: Array<{ type: 'player' | 'coach' | 'parent'; id: string }>;
}

export interface SendMessageInput {
  content: string;
  messageType?: 'text' | 'image' | 'video' | 'file';
  metadata?: Record<string, any>;
  replyToId?: string;
}

export class ChatService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new chat group
   */
  async createGroup(tenantId: string, createdBy: string, input: CreateGroupInput) {
    // Validate group type
    if (input.groupType === 'direct' && input.memberIds.length !== 2) {
      throw new BadRequestError('Direct messages must have exactly 2 members');
    }

    const group = await this.prisma.chatGroup.create({
      data: {
        tenantId,
        name: input.name,
        description: input.description,
        groupType: input.groupType,
        createdBy,
        members: {
          create: input.memberIds.map((member) => ({
            memberType: member.type,
            memberId: member.id,
            role: member.id === createdBy ? 'admin' : 'member',
          })),
        },
      },
      include: {
        members: true,
      },
    });

    return group;
  }

  /**
   * Get groups for a user
   */
  async getGroups(tenantId: string, memberType: string, memberId: string) {
    const groups = await this.prisma.chatGroup.findMany({
      where: {
        tenantId,
        isArchived: false,
        members: {
          some: {
            memberType,
            memberId,
            leftAt: null,
          },
        },
      },
      include: {
        members: {
          where: { leftAt: null },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    return groups.map((group) => {
      const userMember = group.members.find(
        (m) => m.memberType === memberType && m.memberId === memberId
      );
      return {
        ...group,
        unreadCount: userMember?.unreadCount || 0,
        lastMessage: group.messages[0] || null,
      };
    });
  }

  /**
   * Get a single group with messages
   */
  async getGroup(groupId: string, memberType: string, memberId: string) {
    const group = await this.prisma.chatGroup.findUnique({
      where: { id: groupId },
      include: {
        members: { where: { leftAt: null } },
      },
    });

    if (!group) {
      throw new NotFoundError('Group not found');
    }

    // Check if user is a member
    const isMember = group.members.some(
      (m) => m.memberType === memberType && m.memberId === memberId
    );

    if (!isMember) {
      throw new ForbiddenError('You are not a member of this group');
    }

    return group;
  }

  /**
   * Get messages for a group
   */
  async getMessages(
    groupId: string,
    memberType: string,
    memberId: string,
    options: { limit?: number; before?: string } = {}
  ) {
    // Verify membership
    await this.getGroup(groupId, memberType, memberId);

    const where: any = { groupId, isDeleted: false };

    if (options.before) {
      const beforeMessage = await this.prisma.chatMessage.findUnique({
        where: { id: options.before },
      });
      if (beforeMessage) {
        where.createdAt = { lt: beforeMessage.createdAt };
      }
    }

    const messages = await this.prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options.limit || 50,
      include: {
        replyTo: {
          select: {
            id: true,
            content: true,
            senderType: true,
            senderId: true,
          },
        },
      },
    });

    // Mark as read
    await this.markAsRead(groupId, memberType, memberId);

    return messages.reverse();
  }

  /**
   * Send a message to a group
   */
  async sendMessage(
    groupId: string,
    senderType: string,
    senderId: string,
    input: SendMessageInput
  ) {
    // Verify membership
    await this.getGroup(groupId, senderType, senderId);

    const message = await this.prisma.chatMessage.create({
      data: {
        groupId,
        senderType,
        senderId,
        content: input.content,
        messageType: input.messageType || 'text',
        metadata: input.metadata,
        replyToId: input.replyToId,
      },
      include: {
        replyTo: {
          select: {
            id: true,
            content: true,
            senderType: true,
            senderId: true,
          },
        },
      },
    });

    // Update group's last message timestamp
    await this.prisma.chatGroup.update({
      where: { id: groupId },
      data: { lastMessageAt: new Date() },
    });

    // Increment unread count for other members
    await this.prisma.chatGroupMember.updateMany({
      where: {
        groupId,
        NOT: { memberType: senderType, memberId: senderId },
        leftAt: null,
      },
      data: {
        unreadCount: { increment: 1 },
      },
    });

    return message;
  }

  /**
   * Mark messages as read
   */
  async markAsRead(groupId: string, memberType: string, memberId: string) {
    const latestMessage = await this.prisma.chatMessage.findFirst({
      where: { groupId },
      orderBy: { createdAt: 'desc' },
    });

    if (latestMessage) {
      await this.prisma.chatGroupMember.updateMany({
        where: {
          groupId,
          memberType,
          memberId,
        },
        data: {
          lastReadAt: new Date(),
          lastReadMessageId: latestMessage.id,
          unreadCount: 0,
        },
      });
    }
  }

  /**
   * Edit a message
   */
  async editMessage(messageId: string, senderType: string, senderId: string, newContent: string) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    if (message.senderType !== senderType || message.senderId !== senderId) {
      throw new ForbiddenError('You can only edit your own messages');
    }

    const updated = await this.prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        content: newContent,
        isEdited: true,
        editedAt: new Date(),
      },
    });

    return updated;
  }

  /**
   * Delete a message (soft delete)
   */
  async deleteMessage(messageId: string, senderType: string, senderId: string) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    if (message.senderType !== senderType || message.senderId !== senderId) {
      throw new ForbiddenError('You can only delete your own messages');
    }

    await this.prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Leave a group
   */
  async leaveGroup(groupId: string, memberType: string, memberId: string) {
    await this.prisma.chatGroupMember.updateMany({
      where: {
        groupId,
        memberType,
        memberId,
      },
      data: {
        leftAt: new Date(),
      },
    });

    // Add system message
    await this.prisma.chatMessage.create({
      data: {
        groupId,
        senderType: 'system',
        senderId: null,
        content: 'En deltaker forlot gruppen',
        messageType: 'system',
        metadata: { action: 'member_left', memberId },
      },
    });
  }

  /**
   * Add members to a group
   */
  async addMembers(
    groupId: string,
    addedBy: { type: string; id: string },
    members: Array<{ type: string; id: string }>
  ) {
    // Verify adder is admin
    const group = await this.getGroup(groupId, addedBy.type, addedBy.id);
    const adderMember = (await this.prisma.chatGroupMember.findFirst({
      where: {
        groupId,
        memberType: addedBy.type,
        memberId: addedBy.id,
        leftAt: null,
      },
    }));

    if (adderMember?.role !== 'admin') {
      throw new ForbiddenError('Only admins can add members');
    }

    // Add new members
    for (const member of members) {
      await this.prisma.chatGroupMember.upsert({
        where: {
          groupId_memberType_memberId: {
            groupId,
            memberType: member.type,
            memberId: member.id,
          },
        },
        create: {
          groupId,
          memberType: member.type,
          memberId: member.id,
          role: 'member',
        },
        update: {
          leftAt: null,
        },
      });
    }

    // Add system message
    await this.prisma.chatMessage.create({
      data: {
        groupId,
        senderType: 'system',
        senderId: null,
        content: `${members.length} nye deltaker${members.length > 1 ? 'e' : ''} ble lagt til`,
        messageType: 'system',
        metadata: { action: 'members_added', count: members.length },
      },
    });
  }

  /**
   * Archive a group
   */
  async archiveGroup(groupId: string, memberType: string, memberId: string) {
    const member = await this.prisma.chatGroupMember.findFirst({
      where: {
        groupId,
        memberType,
        memberId,
        leftAt: null,
      },
    });

    if (!member || member.role !== 'admin') {
      throw new ForbiddenError('Only admins can archive groups');
    }

    await this.prisma.chatGroup.update({
      where: { id: groupId },
      data: { isArchived: true },
    });
  }
}
