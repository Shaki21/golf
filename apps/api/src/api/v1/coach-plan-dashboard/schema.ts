/**
 * Coach Plan Dashboard JSON Schemas
 * Request/Response validation for Fastify
 */

export const playerAttentionItemSchema = {
  type: 'object',
  properties: {
    playerId: { type: 'string' },
    playerName: { type: 'string' },
    playerInitials: { type: 'string' },
    reason: { type: 'string' },
    severity: { type: 'string', enum: ['warning', 'error', 'info'] },
    actionHref: { type: 'string' },
    sessionId: { type: 'string', nullable: true },
    daysInactive: { type: 'number', nullable: true },
  },
  required: ['playerId', 'playerName', 'playerInitials', 'reason', 'severity', 'actionHref'],
};

export const todaySessionSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    playerId: { type: 'string' },
    playerName: { type: 'string' },
    playerInitials: { type: 'string' },
    time: { type: 'string' },
    duration: { type: 'number' },
    focus: { type: 'string' },
    type: { type: 'string', enum: ['coaching', 'evaluation', 'group'] },
    status: { type: 'string', enum: ['upcoming', 'in_progress', 'completed'] },
  },
  required: ['id', 'playerId', 'playerName', 'playerInitials', 'time', 'duration', 'focus', 'type', 'status'],
};

export const teamLoadStatsSchema = {
  type: 'object',
  properties: {
    totalPlayers: { type: 'number' },
    activePlayers: { type: 'number' },
    sessionsThisWeek: { type: 'number' },
    pendingReviews: { type: 'number' },
    averageSessionsPerPlayer: { type: 'number' },
  },
  required: ['totalPlayers', 'activePlayers', 'sessionsThisWeek', 'pendingReviews', 'averageSessionsPerPlayer'],
};

export const tournamentItemSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    date: { type: 'string', format: 'date-time' },
    daysUntil: { type: 'number' },
    playersRegistered: { type: 'number' },
    playersWithPlan: { type: 'number' },
    location: { type: 'string' },
  },
  required: ['id', 'name', 'date', 'daysUntil', 'playersRegistered', 'playersWithPlan', 'location'],
};

export const coachAttentionItemSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: [
        'unreviewed_session',
        'pending_approval',
        'tournament_prep',
        'inactive_player',
      ],
    },
    message: { type: 'string' },
    severity: { type: 'string', enum: ['warning', 'error', 'info'] },
    count: { type: 'number', nullable: true },
  },
  required: ['type', 'message', 'severity'],
};

export const coachPrimaryActionSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: [
        'review_session',
        'approve_plan',
        'create_prep_plan',
        'start_session',
        'reach_out',
        'view_calendar',
        'view_dashboard',
      ],
    },
    label: { type: 'string' },
    href: { type: 'string' },
    context: { type: 'string' },
  },
  required: ['type', 'label', 'href', 'context'],
};

export const coachDashboardResponseSchema = {
  type: 'object',
  properties: {
    state: {
      type: 'string',
      enum: [
        'unreviewed_sessions',
        'pending_player_approvals',
        'tournament_prep',
        'today_sessions',
        'players_inactive',
        'all_clear',
      ],
    },
    primaryAction: coachPrimaryActionSchema,
    playersNeedingAttention: {
      type: 'array',
      items: playerAttentionItemSchema,
      maxItems: 5,
    },
    todaySessions: {
      type: 'array',
      items: todaySessionSchema,
    },
    teamLoadStats: teamLoadStatsSchema,
    upcomingTournaments: {
      type: 'array',
      items: tournamentItemSchema,
    },
    attentionItems: {
      type: 'array',
      items: coachAttentionItemSchema,
    },
    attentionCount: { type: 'number' },
  },
  required: [
    'state',
    'primaryAction',
    'playersNeedingAttention',
    'todaySessions',
    'teamLoadStats',
    'upcomingTournaments',
    'attentionItems',
    'attentionCount',
  ],
};

export const getCoachDashboardSchema = {
  tags: ['coach-plan-dashboard'],
  summary: 'Get decision-first coach dashboard',
  description:
    'Returns aggregated dashboard data with next action, players needing attention, team stats, and attention items. Prioritizes actions based on urgency for coaching workflow.',
  response: {
    200: coachDashboardResponseSchema,
    401: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
      },
    },
    403: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
      },
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
      },
    },
  },
};

export const getAttentionCountSchema = {
  tags: ['coach-plan-dashboard'],
  summary: 'Get attention count for sidebar badge',
  response: {
    200: {
      type: 'object',
      properties: {
        count: { type: 'number' },
      },
      required: ['count'],
    },
  },
};
