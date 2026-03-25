export const goalSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    userId: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    description: { type: 'string', nullable: true },
    goalType: { type: 'string' },
    timeframe: { type: 'string' },
    targetValue: { type: 'number', nullable: true },
    currentValue: { type: 'number', nullable: true },
    startValue: { type: 'number', nullable: true },
    unit: { type: 'string', nullable: true },
    progressPercent: { type: 'integer' },
    startDate: { type: 'string', format: 'date' },
    targetDate: { type: 'string', format: 'date' },
    completedDate: { type: 'string', format: 'date', nullable: true },
    status: { type: 'string' },
    icon: { type: 'string', nullable: true },
    color: { type: 'string', nullable: true },
    notes: { type: 'string', nullable: true },
    milestones: { type: 'array', items: { type: 'object' } },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'userId', 'title', 'goalType', 'timeframe', 'progressPercent', 'startDate', 'targetDate', 'status', 'createdAt', 'updatedAt']
};

export const createGoalSchema = {
  body: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 255 },
      description: { type: 'string' },
      goalType: {
        type: 'string',
        enum: ['score', 'technique', 'physical', 'mental', 'competition', 'other'],
        maxLength: 50
      },
      timeframe: {
        type: 'string',
        enum: ['short', 'medium', 'long'],
        maxLength: 20
      },
      targetValue: { type: 'number' },
      currentValue: { type: 'number' },
      startValue: { type: 'number' },
      unit: { type: 'string', maxLength: 50 },
      startDate: { type: 'string', format: 'date' },
      targetDate: { type: 'string', format: 'date' },
      icon: { type: 'string', maxLength: 50 },
      color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
      notes: { type: 'string' },
      milestones: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            value: { type: 'number' },
            completed: { type: 'boolean' }
          }
        },
        maxItems: 20
      }
    },
    required: ['title', 'goalType', 'timeframe', 'startDate', 'targetDate']
  },
  response: {
    201: goalSchema
  }
};

export const updateGoalSchema = {
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
      description: { type: 'string' },
      goalType: {
        type: 'string',
        enum: ['score', 'technique', 'physical', 'mental', 'competition', 'other'],
        maxLength: 50
      },
      timeframe: {
        type: 'string',
        enum: ['short', 'medium', 'long'],
        maxLength: 20
      },
      targetValue: { type: 'number' },
      currentValue: { type: 'number' },
      startValue: { type: 'number' },
      unit: { type: 'string', maxLength: 50 },
      progressPercent: { type: 'integer', minimum: 0, maximum: 100 },
      startDate: { type: 'string', format: 'date' },
      targetDate: { type: 'string', format: 'date' },
      completedDate: { type: 'string', format: 'date' },
      status: {
        type: 'string',
        enum: ['active', 'completed', 'paused', 'cancelled'],
        maxLength: 20
      },
      icon: { type: 'string', maxLength: 50 },
      color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
      notes: { type: 'string' },
      milestones: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            value: { type: 'number' },
            completed: { type: 'boolean' }
          }
        },
        maxItems: 20
      }
    }
  },
  response: {
    200: goalSchema
  }
};

export const getGoalSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' }
    },
    required: ['id']
  },
  response: {
    200: goalSchema
  }
};

export const listGoalsSchema = {
  querystring: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['active', 'completed', 'paused', 'cancelled']
      },
      goalType: {
        type: 'string',
        enum: ['score', 'technique', 'physical', 'mental', 'competition', 'other']
      }
    }
  },
  response: {
    200: {
      type: 'array',
      items: goalSchema
    }
  }
};

export const deleteGoalSchema = {
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

export const updateProgressSchema = {
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
      currentValue: { type: 'number' }
    },
    required: ['currentValue']
  },
  response: {
    200: goalSchema
  }
};
/**
 * Goals API Schemas
 *
 * JSON Schema definitions for goals, streaks, and badges endpoints
 */

// =============================================================================
// Streak Schemas
// =============================================================================

export const getStreakSchema = {
  tags: ['Goals'],
  summary: 'Get current streak data',
  description: 'Returns the user\'s current goal streak information including longest streak',
  response: {
    200: {
      type: 'object',
      properties: {
        currentStreak: { type: 'number', description: 'Current consecutive days' },
        longestStreak: { type: 'number', description: 'Longest streak ever achieved' },
        lastActivityDate: { type: 'string', format: 'date-time', description: 'Last activity timestamp' },
        streakStatus: {
          type: 'string',
          enum: ['active', 'at_risk', 'frozen', 'inactive'],
          description: 'Current status of the streak'
        },
        daysUntilExpiry: { type: 'number', description: 'Days until streak expires (0-1)' }
      }
    }
  }
};

export const updateStreakSchema = {
  tags: ['Goals'],
  summary: 'Update streak progress',
  description: 'Records goal progress activity and updates streak',
  body: {
    type: 'object',
    required: ['goalId'],
    properties: {
      goalId: { type: 'string', description: 'ID of the goal being updated' },
      progressValue: { type: 'number', description: 'New progress value' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        currentStreak: { type: 'number' },
        streakUpdated: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  }
};

// =============================================================================
// Stats Schemas
// =============================================================================

export const getStatsSchema = {
  tags: ['Goals'],
  summary: 'Get enhanced goal statistics',
  description: 'Returns comprehensive goal statistics including active, completed, and progress data',
  response: {
    200: {
      type: 'object',
      properties: {
        totalActive: { type: 'number', description: 'Number of active goals' },
        totalCompleted: { type: 'number', description: 'Total completed goals' },
        averageProgress: { type: 'number', description: 'Average progress across all goals' },
        completedThisMonth: { type: 'number', description: 'Goals completed this month' },
        upcomingDeadlines: {
          type: 'array',
          description: 'Goals with deadlines within 7 days',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              deadline: { type: 'string', format: 'date-time' },
              progress: { type: 'number' },
              category: { type: 'string' }
            }
          }
        },
        recentActivity: {
          type: 'array',
          description: 'Recent progress updates',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string', format: 'date' },
              updates: { type: 'number', description: 'Number of updates' }
            }
          }
        }
      }
    }
  }
};

// =============================================================================
// Badges Schemas
// =============================================================================

export const getBadgesSchema = {
  tags: ['Goals'],
  summary: 'Get user badges',
  description: 'Returns all badges unlocked by the user',
  response: {
    200: {
      type: 'object',
      properties: {
        badges: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              badgeId: { type: 'string', description: 'Badge definition ID' },
              name: { type: 'string' },
              description: { type: 'string' },
              icon: { type: 'string' },
              rarity: { type: 'string', enum: ['common', 'rare', 'epic', 'legendary'] },
              unlockedAt: { type: 'string', format: 'date-time' },
              viewed: { type: 'boolean' }
            }
          }
        },
        unlockedCount: { type: 'number' },
        totalBadges: { type: 'number' },
        recentUnlocks: {
          type: 'array',
          description: 'Recently unlocked badges (last 3)',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              badgeId: { type: 'string' },
              name: { type: 'string' },
              icon: { type: 'string' },
              unlockedAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  }
};

export const unlockBadgeSchema = {
  tags: ['Goals'],
  summary: 'Unlock a badge',
  description: 'Awards a badge to the user',
  params: {
    type: 'object',
    required: ['badgeId'],
    properties: {
      badgeId: { type: 'string', description: 'Badge definition ID to unlock' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        badge: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            badgeId: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            icon: { type: 'string' },
            rarity: { type: 'string' },
            unlockedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    409: {
      type: 'object',
      properties: {
        error: { type: 'string', default: 'Badge already unlocked' }
      }
    }
  }
};

export const markBadgeViewedSchema = {
  tags: ['Goals'],
  summary: 'Mark badge as viewed',
  description: 'Marks a badge notification as viewed',
  params: {
    type: 'object',
    required: ['badgeId'],
    properties: {
      badgeId: { type: 'string', description: 'Badge ID' }
    }
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
