import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { emailService, EmailTemplate } from '../../../services/email.service';
import { authenticateUser, requireAdmin } from '../../../middleware/auth';

/**
 * Email preview and testing routes (development only)
 */
export async function emailRoutes(app: FastifyInstance): Promise<void> {
  // Only enable in development
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  /**
   * Preview email template
   */
  app.get<{ Params: { template: string } }>(
    '/preview/:template',
    {
      preHandler: [authenticateUser, requireAdmin],
      schema: {
        description: 'Preview email template (development only)',
        tags: ['emails'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            template: {
              type: 'string',
              enum: Object.values(EmailTemplate),
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { template: string } }>, reply: FastifyReply) => {
      const template = request.params.template as EmailTemplate;

      // Sample data for each template
      const sampleData = getTemplatePreviewData(template);

      // Generate preview HTML
      const html = await emailService.previewEmail(template, sampleData);

      // Return HTML directly
      reply.type('text/html').send(html);
    }
  );

  /**
   * List all available email templates
   */
  app.get(
    '/templates',
    {
      preHandler: [authenticateUser, requireAdmin],
      schema: {
        description: 'List all available email templates',
        tags: ['emails'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  templates: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        description: { type: 'string' },
                        previewUrl: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const templates = [
        {
          name: EmailTemplate.WELCOME,
          description: 'Welcome email for new users',
          previewUrl: `/api/v1/emails/preview/${EmailTemplate.WELCOME}`,
        },
        {
          name: EmailTemplate.PASSWORD_RESET,
          description: 'Password reset request email',
          previewUrl: `/api/v1/emails/preview/${EmailTemplate.PASSWORD_RESET}`,
        },
        {
          name: EmailTemplate.PASSWORD_CHANGED,
          description: 'Password changed confirmation',
          previewUrl: `/api/v1/emails/preview/${EmailTemplate.PASSWORD_CHANGED}`,
        },
        {
          name: EmailTemplate.TWO_FACTOR_SETUP,
          description: '2FA setup confirmation with backup codes',
          previewUrl: `/api/v1/emails/preview/${EmailTemplate.TWO_FACTOR_SETUP}`,
        },
        {
          name: EmailTemplate.TRAINING_REMINDER,
          description: 'Upcoming training session reminder',
          previewUrl: `/api/v1/emails/preview/${EmailTemplate.TRAINING_REMINDER}`,
        },
        {
          name: EmailTemplate.TEST_RESULTS,
          description: 'Test results notification',
          previewUrl: `/api/v1/emails/preview/${EmailTemplate.TEST_RESULTS}`,
        },
        {
          name: EmailTemplate.ACHIEVEMENT_UNLOCKED,
          description: 'New achievement unlocked notification',
          previewUrl: `/api/v1/emails/preview/${EmailTemplate.ACHIEVEMENT_UNLOCKED}`,
        },
        {
          name: EmailTemplate.WEEKLY_SUMMARY,
          description: 'Weekly training summary',
          previewUrl: `/api/v1/emails/preview/${EmailTemplate.WEEKLY_SUMMARY}`,
        },
      ];

      return reply.send({
        success: true,
        data: { templates },
      });
    }
  );

  /**
   * Send test email
   */
  app.post<{ Body: { template: EmailTemplate; email: string } }>(
    '/test',
    {
      preHandler: [authenticateUser, requireAdmin],
      schema: {
        description: 'Send test email (development only)',
        tags: ['emails'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['template', 'email'],
          properties: {
            template: {
              type: 'string',
              enum: Object.values(EmailTemplate),
            },
            email: {
              type: 'string',
              format: 'email',
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: { template: EmailTemplate; email: string } }>, reply: FastifyReply) => {
      const { template, email } = request.body;
      const sampleData = getTemplatePreviewData(template);

      // Send email based on template type
      switch (template) {
        case EmailTemplate.WELCOME:
          await emailService.sendWelcomeEmail(email, sampleData as any);
          break;
        case EmailTemplate.PASSWORD_RESET:
          await emailService.sendPasswordResetEmail(email, sampleData as any);
          break;
        case EmailTemplate.PASSWORD_CHANGED:
          await emailService.sendPasswordChangedEmail(email, sampleData as any);
          break;
        case EmailTemplate.TWO_FACTOR_SETUP:
          await emailService.send2FASetupEmail(email, sampleData as any);
          break;
        case EmailTemplate.TRAINING_REMINDER:
          await emailService.sendTrainingReminder(email, sampleData as any);
          break;
        case EmailTemplate.TEST_RESULTS:
          await emailService.sendTestResults(email, sampleData as any);
          break;
        case EmailTemplate.ACHIEVEMENT_UNLOCKED:
          await emailService.sendAchievementUnlocked(email, sampleData as any);
          break;
        case EmailTemplate.WEEKLY_SUMMARY:
          await emailService.sendWeeklySummary(email, sampleData as any);
          break;
      }

      return reply.send({
        success: true,
        message: `Test email sent to ${email}`,
      });
    }
  );

  app.log.info('Email preview routes registered (development mode)');
}

/**
 * Get sample data for template preview
 */
function getTemplatePreviewData(template: EmailTemplate): Record<string, unknown> {
  const baseData = {
    firstName: 'John',
    email: 'john.doe@example.com',
  };

  switch (template) {
    case EmailTemplate.WELCOME:
      return {
        ...baseData,
        role: 'coach',
        organizationName: 'Demo Golf Academy',
      };

    case EmailTemplate.PASSWORD_RESET:
      return {
        ...baseData,
        resetToken: 'sample-reset-token-123456',
      };

    case EmailTemplate.PASSWORD_CHANGED:
      return {
        ...baseData,
        changedAt: new Date().toLocaleString(),
      };

    case EmailTemplate.TWO_FACTOR_SETUP:
      return {
        ...baseData,
        backupCodes: [
          'A1B2-C3D4-E5F6',
          'G7H8-I9J0-K1L2',
          'M3N4-O5P6-Q7R8',
          'S9T0-U1V2-W3X4',
          'Y5Z6-A7B8-C9D0',
        ],
      };

    case EmailTemplate.TRAINING_REMINDER:
      return {
        ...baseData,
        sessionTitle: 'Putting Mastery Session',
        sessionDate: 'December 26, 2024',
        sessionTime: '2:00 PM',
        location: 'Practice Green #3',
        sessionDescription: 'Focus on distance control and reading greens with advanced drills',
        coach: 'Coach Sarah Anderson',
        focusAreas: ['Distance control', 'Green reading', 'Pre-shot routine', 'Mental preparation'],
        equipment: ['Putter', 'Alignment aid', 'Training balls', 'Water bottle'],
        sessionId: 'session-123',
      };

    case EmailTemplate.TEST_RESULTS:
      return {
        ...baseData,
        testName: 'Quarterly Skill Assessment',
        testDate: 'December 25, 2024',
        score: 87,
        performanceLevel: 'Excellent',
        percentile: 92,
        improvement: '+12%',
        improvementColor: '#10b981',
        categoryProgress: 85,
        metrics: [
          { name: 'Driving Accuracy', value: '85%', percentage: 85 },
          { name: 'Putting Average', value: '1.8', percentage: 90 },
          { name: 'Short Game', value: '82%', percentage: 82 },
          { name: 'Course Management', value: '88%', percentage: 88 },
        ],
        coachFeedback: 'Outstanding progress this quarter! Your putting has improved dramatically, and your course management decisions are showing real maturity. Keep focusing on maintaining consistency in your iron play.',
        coachName: 'Coach Mike Johnson',
        recommendations: [
          'Continue daily putting practice (15-20 minutes)',
          'Work on 50-75 yard wedge shots',
          'Review course strategy videos before next round',
          'Schedule follow-up assessment in 4 weeks',
        ],
        testId: 'test-123',
        nextTest: {
          name: 'Mid-Season Benchmark',
          date: 'January 15, 2025',
        },
      };

    case EmailTemplate.ACHIEVEMENT_UNLOCKED:
      return {
        ...baseData,
        achievementName: 'Consistency Champion',
        achievementTagline: 'Master of Reliable Performance',
        achievementDescription: 'Completed 10 consecutive training sessions with 90%+ completion rate and maintained consistent performance metrics across all skill categories.',
        badgeEmoji: '🏆',
        totalAchievements: 24,
        category: 'B',
        categoryProgress: 78,
        rank: 'Advanced',
        whatItMeans: 'This achievement demonstrates your dedication and consistency in training. Players who earn this badge show exceptional commitment to their development and typically see 25% faster improvement rates.',
        suggestions: [
          'Share your achievement on social media',
          'Review your training notes to identify success patterns',
          'Set a new challenge goal for next month',
          'Mentor a newer player to help them build consistency',
        ],
        achievementId: 'achievement-123',
        nextMilestone: {
          name: 'Elite Performer',
          emoji: '💎',
          requirement: '25 consecutive sessions at 95%+',
          progress: 40,
        },
        relatedAchievements: [
          { name: 'Early Bird', emoji: '🌅' },
          { name: 'Team Player', emoji: '🤝' },
          { name: 'Goal Crusher', emoji: '🎯' },
        ],
      };

    case EmailTemplate.WEEKLY_SUMMARY:
      return {
        ...baseData,
        weekStart: 'December 18, 2024',
        weekEnd: 'December 24, 2024',
        hoursTrained: 8.5,
        sessionsCompleted: 5,
        testsCompleted: 2,
        improvements: [
          { skill: 'Putting Accuracy', progress: 85, improvement: 12 },
          { skill: 'Driver Distance', progress: 78, improvement: 8 },
          { skill: 'Iron Consistency', progress: 92, improvement: 15 },
        ],
        sessions: [
          {
            title: 'Putting Fundamentals',
            date: 'Dec 18',
            duration: 90,
            focusArea: 'Distance Control',
            notes: 'Great improvement in lag putting. Keep working on 6-10 foot range.',
          },
          {
            title: 'Full Swing Analysis',
            date: 'Dec 20',
            duration: 120,
            focusArea: 'Iron Play',
          },
          {
            title: 'Short Game Mastery',
            date: 'Dec 22',
            duration: 90,
            focusArea: 'Wedge Work',
            notes: 'Excellent touch around the greens today!',
          },
        ],
        goals: [
          { name: 'Break 80 Consistently', progress: 75, target: '5 rounds under 80', deadline: 'Jan 31, 2025' },
          { name: 'Handicap to Single Digit', progress: 82, target: '9.9 or below', deadline: 'Mar 1, 2025' },
        ],
        coachNotes: 'Fantastic week! Your dedication is really showing in your performance metrics. The consistency in your putting is particularly impressive. Let\'s maintain this momentum through the holidays.',
        coachName: 'Coach Sarah Anderson',
        upcomingSessions: [
          { title: 'Course Strategy Session', date: 'Dec 26', time: '10:00 AM' },
          { title: 'Mental Game Workshop', date: 'Dec 28', time: '2:00 PM' },
        ],
        achievements: [
          { name: 'Week Warrior', emoji: '⚡' },
          { name: 'Perfect Practice', emoji: '✨' },
        ],
      };

    default:
      return baseData;
  }
}
