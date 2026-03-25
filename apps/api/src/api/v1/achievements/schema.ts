export const achievementSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    userId: { type: 'string', format: 'uuid' },
    code: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    category: { type: 'string' },
    tier: { type: 'string' },
    icon: { type: 'string' },
    pointsValue: { type: 'integer' },
    earnedAt: { type: 'string', format: 'date-time' },
    context: { type: 'object', nullable: true },
    isNew: { type: 'boolean' },
    viewedAt: { type: 'string', format: 'date-time', nullable: true },
    createdAt: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'userId', 'code', 'title', 'description', 'category', 'tier', 'icon', 'pointsValue', 'earnedAt', 'isNew', 'createdAt']
};

export const unlockAchievementSchema = {
  body: {
    type: 'object',
    properties: {
      code: { type: 'string', minLength: 1, maxLength: 50 },
      title: { type: 'string', minLength: 1, maxLength: 100 },
      description: { type: 'string', minLength: 1 },
      category: {
        type: 'string',
        enum: ['streak', 'milestone', 'skill', 'special', 'other'],
        maxLength: 50
      },
      tier: {
        type: 'string',
        enum: ['bronze', 'silver', 'gold', 'platinum'],
        maxLength: 20
      },
      icon: { type: 'string', minLength: 1, maxLength: 50 },
      pointsValue: { type: 'integer', minimum: 0, maximum: 10000 },
      context: { type: 'object' }
    },
    required: ['code', 'title', 'description', 'category', 'icon']
  },
  response: {
    201: achievementSchema
  }
};

export const getAchievementSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' }
    },
    required: ['id']
  },
  response: {
    200: achievementSchema
  }
};

export const listAchievementsSchema = {
  querystring: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        enum: ['streak', 'milestone', 'skill', 'special', 'other']
      }
    }
  },
  response: {
    200: {
      type: 'array',
      items: achievementSchema
    }
  }
};

export const markAsViewedSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' }
    },
    required: ['id']
  },
  response: {
    200: achievementSchema
  }
};

export const markAllAsViewedSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        updatedCount: { type: 'integer' }
      }
    }
  }
};

export const deleteAchievementSchema = {
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

export const achievementStatsSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        total: { type: 'integer' },
        newCount: { type: 'integer' },
        totalPoints: { type: 'integer' },
        byCategory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              count: { type: 'integer' }
            }
          }
        },
        byTier: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              tier: { type: 'string' },
              count: { type: 'integer' }
            }
          }
        }
      }
    }
  }
};

export const recentAchievementsSchema = {
  querystring: {
    type: 'object',
    properties: {
      limit: { type: 'integer', minimum: 1, maximum: 50, default: 5 }
    }
  },
  response: {
    200: {
      type: 'array',
      items: achievementSchema
    }
  }
};
