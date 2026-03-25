import { getPrismaClient } from '../../../core/db/prisma';

const prisma = getPrismaClient();

export class CollectionsService {
  async listCollections(userId: string) {
    const collections = await prisma.collection.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return { data: collections };
  }

  async getById(id: string, userId: string) {
    const collection = await prisma.collection.findFirst({
      where: { id, userId },
    });
    if (!collection) {
      throw { statusCode: 404, message: 'Collection not found' };
    }
    return { data: collection };
  }

  async create(userId: string, tenantId: string, input: {
    name: string;
    description?: string;
    type?: string;
    items?: unknown[];
    isPublic?: boolean;
    color?: string;
    icon?: string;
  }) {
    const collection = await prisma.collection.create({
      data: {
        userId,
        tenantId,
        name: input.name,
        description: input.description,
        type: input.type || 'general',
        items: input.items || [],
        isPublic: input.isPublic || false,
        color: input.color,
        icon: input.icon,
      },
    });
    return { data: collection };
  }

  async update(id: string, userId: string, input: {
    name?: string;
    description?: string;
    type?: string;
    items?: unknown[];
    isPublic?: boolean;
    color?: string;
    icon?: string;
  }) {
    const existing = await prisma.collection.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw { statusCode: 404, message: 'Collection not found' };
    }

    const collection = await prisma.collection.update({
      where: { id },
      data: input,
    });
    return { data: collection };
  }

  async delete(id: string, userId: string) {
    const existing = await prisma.collection.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw { statusCode: 404, message: 'Collection not found' };
    }

    await prisma.collection.delete({ where: { id } });
    return { success: true, message: 'Collection deleted' };
  }

  async addItem(id: string, userId: string, item: { type: string; id: string }) {
    const collection = await prisma.collection.findFirst({
      where: { id, userId },
    });
    if (!collection) {
      throw { statusCode: 404, message: 'Collection not found' };
    }

    const items = (collection.items as unknown[]) || [];
    const newItems = [...items, { ...item, order: items.length }];

    const updated = await prisma.collection.update({
      where: { id },
      data: { items: newItems },
    });
    return { data: updated };
  }

  async removeItem(id: string, userId: string, itemId: string) {
    const collection = await prisma.collection.findFirst({
      where: { id, userId },
    });
    if (!collection) {
      throw { statusCode: 404, message: 'Collection not found' };
    }

    const items = (collection.items as { id: string }[]) || [];
    const newItems = items.filter((i) => i.id !== itemId);

    const updated = await prisma.collection.update({
      where: { id },
      data: { items: newItems },
    });
    return { data: updated };
  }

  async reorderItems(id: string, userId: string, itemIds: string[]) {
    const collection = await prisma.collection.findFirst({
      where: { id, userId },
    });
    if (!collection) {
      throw { statusCode: 404, message: 'Collection not found' };
    }

    const items = (collection.items as { id: string }[]) || [];
    const reordered = itemIds.map((itemId, order) => {
      const item = items.find((i) => i.id === itemId);
      return item ? { ...item, order } : null;
    }).filter(Boolean);

    const updated = await prisma.collection.update({
      where: { id },
      data: { items: reordered },
    });
    return { data: updated };
  }
}
