export const noteSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    userId: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    content: { type: 'string' },
    category: { type: 'string', nullable: true },
    tags: { type: 'array', items: { type: 'string' } },
    isPinned: { type: 'boolean' },
    color: { type: 'string', nullable: true },
    mood: { type: 'integer', minimum: 1, maximum: 5, nullable: true },
    sharedWithCoach: { type: 'boolean' },
    linkedEntityType: { type: 'string', nullable: true },
    linkedEntityId: { type: 'string', format: 'uuid', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'userId', 'title', 'content', 'tags', 'isPinned', 'sharedWithCoach', 'createdAt', 'updatedAt']
};

export const createNoteSchema = {
  body: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 255 },
      content: { type: 'string', minLength: 1 },
      category: { type: 'string', maxLength: 50 },
      tags: { type: 'array', items: { type: 'string', maxLength: 50 }, maxItems: 10 },
      isPinned: { type: 'boolean' },
      color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
      mood: { type: 'integer', minimum: 1, maximum: 5 },
      sharedWithCoach: { type: 'boolean' },
      linkedEntityType: { type: 'string', maxLength: 50 },
      linkedEntityId: { type: 'string', format: 'uuid' }
    },
    required: ['title', 'content']
  },
  response: {
    201: noteSchema
  }
};

export const updateNoteSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' }
    },
    required: ['id']
  },
  body: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 255 },
      content: { type: 'string', minLength: 1 },
      category: { type: 'string', maxLength: 50 },
      tags: { type: 'array', items: { type: 'string', maxLength: 50 }, maxItems: 10 },
      isPinned: { type: 'boolean' },
      color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
      mood: { type: 'integer', minimum: 1, maximum: 5 },
      sharedWithCoach: { type: 'boolean' },
      linkedEntityType: { type: 'string', maxLength: 50 },
      linkedEntityId: { type: 'string', format: 'uuid' }
    }
  },
  response: {
    200: noteSchema
  }
};

export const getNoteSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' }
    },
    required: ['id']
  },
  response: {
    200: noteSchema
  }
};

export const listNotesSchema = {
  querystring: {
    type: 'object',
    properties: {
      category: { type: 'string', maxLength: 50 },
      search: { type: 'string', maxLength: 255 }
    }
  },
  response: {
    200: {
      type: 'array',
      items: noteSchema
    }
  }
};

export const deleteNoteSchema = {
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
