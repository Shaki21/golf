/**
 * Plan Dashboard JSON Schemas
 * Request/Response validation for Fastify
 */

export const leadingIndicatorSchema = {
  type: 'object',
  properties: {
    label: { type: 'string' },
    target: { type: 'number' },
    current: { type: 'number' },
    unit: { type: 'string' },
  },
  required: ['label', 'target', 'current', 'unit'],
};

export const planGoalSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    outcome: { type: 'string' },
    leadingIndicator: leadingIndicatorSchema,
    status: { type: 'string', enum: ['on_track', 'at_risk', 'ahead'] },
    statusReason: { type: 'string' },
    drillHref: { type: 'string', nullable: true },
  },
  required: ['id', 'title', 'outcome', 'leadingIndicator', 'status', 'statusReason'],
};

export const upcomingSessionSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    date: { type: 'string', format: 'date-time' },
    time: { type: 'string' },
    duration: { type: 'number' },
    focus: { type: 'string' },
    type: { type: 'string', enum: ['training', 'coaching', 'testing', 'tournament'] },
    confirmed: { type: 'boolean' },
  },
  required: ['id', 'title', 'date', 'time', 'duration', 'focus', 'type', 'confirmed'],
};

export const tournamentSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    date: { type: 'string', format: 'date-time' },
    daysUntil: { type: 'number' },
    hasPlan: { type: 'boolean' },
    location: { type: 'string' },
  },
  required: ['id', 'name', 'date', 'daysUntil', 'hasPlan', 'location'],
};

export const loadStatsSchema = {
  type: 'object',
  properties: {
    planned: { type: 'number' },
    completed: { type: 'number' },
    missingPurpose: { type: 'number' },
  },
  required: ['planned', 'completed', 'missingPurpose'],
};

export const attentionItemSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['at_risk_goal', 'plan_not_confirmed', 'missing_log', 'tournament_soon'],
    },
    message: { type: 'string' },
    severity: { type: 'string', enum: ['warning', 'error', 'info'] },
  },
  required: ['type', 'message', 'severity'],
};

export const primaryActionSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['start_session', 'confirm_plan', 'log_session', 'adjust_plan', 'view_tournament'],
    },
    label: { type: 'string' },
    href: { type: 'string' },
    context: { type: 'string' },
  },
  required: ['type', 'label', 'href', 'context'],
};

export const planDashboardResponseSchema = {
  type: 'object',
  properties: {
    state: {
      type: 'string',
      enum: ['no_sessions', 'session_upcoming', 'plan_not_confirmed', 'missing_log', 'tournament_soon'],
    },
    primaryAction: primaryActionSchema,
    nextSession: { ...upcomingSessionSchema, nullable: true },
    goals: {
      type: 'array',
      items: planGoalSchema,
      maxItems: 3,
    },
    loadStats: loadStatsSchema,
    upcomingTournament: { ...tournamentSchema, nullable: true },
    attentionItems: {
      type: 'array',
      items: attentionItemSchema,
    },
    missingLogs: { type: 'number' },
  },
  required: [
    'state',
    'primaryAction',
    'nextSession',
    'goals',
    'loadStats',
    'upcomingTournament',
    'attentionItems',
    'missingLogs',
  ],
};

export const getDashboardSchema = {
  tags: ['plan-dashboard'],
  summary: 'Get decision-first plan dashboard',
  description:
    'Returns aggregated dashboard data with next action, goals, load stats, and attention items. Prioritizes actions based on urgency.',
  response: {
    200: planDashboardResponseSchema,
    401: {
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
