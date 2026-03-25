export const archivedItemSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    userId: { type: 'string', format: 'uuid' },
    entityType: { type: 'string' },
    entityId: { type: 'string', format: 'uuid' },
    entityData: { type: 'object' },
    archivedAt: { type: 'string', format: 'date-time' },
    reason: { type: 'string', nullable: true }
  },
  required: ['id', 'userId', 'entityType', 'entityId', 'entityData', 'archivedAt']
};

export const archiveItemSchema = {
  body: {
    type: 'object',
    properties: {
      entityType: {
        type: 'string',
        enum: ['note', 'goal', 'session', 'test', 'exercise', 'other'],
        maxLength: 50
      },
      entityId: { type: 'string', format: 'uuid' },
      entityData: { type: 'object' },
      reason: { type: 'string', maxLength: 255 }
    },
    required: ['entityType', 'entityId', 'entityData']
  },
  response: {
    201: archivedItemSchema
  }
};

export const getArchivedSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' }
    },
    required: ['id']
  },
  response: {
    200: archivedItemSchema
  }
};

export const listArchivedSchema = {
  querystring: {
    type: 'object',
    properties: {
      entityType: {
        type: 'string',
        enum: ['note', 'goal', 'session', 'test', 'exercise', 'other']
      }
    }
  },
  response: {
    200: {
      type: 'array',
      items: archivedItemSchema
    }
  }
};

export const deleteArchivedSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' }
    },
    required: ['id']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' }
      }
    }
  }
};

export const restoreItemSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' }
    },
    required: ['id']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        entityType: { type: 'string' },
        entityId: { type: 'string', format: 'uuid' },
        entityData: { type: 'object' }
      }
    }
  }
};

export const archiveCountSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        total: { type: 'integer' },
        byType: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              count: { type: 'integer' }
            }
          }
        }
      }
    }
  }
};

export const bulkDeleteSchema = {
  body: {
    type: 'object',
    properties: {
      archiveIds: {
        type: 'array',
        items: { type: 'string', format: 'uuid' },
        minItems: 1,
        maxItems: 100
      }
    },
    required: ['archiveIds']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        deletedCount: { type: 'integer' }
      }
    }
  }
};
