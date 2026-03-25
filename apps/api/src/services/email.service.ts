import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import Handlebars from 'handlebars';
import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config';
import { logger } from '../utils/logger';

/**
 * Email Service
 *
 * Handles email template rendering and sending using Handlebars templates
 * Includes fallback behavior for missing templates and SMTP failures
 */

interface EmailOptions {
  to: string | string[];
  subject: string;
  template: EmailTemplate;
  data: Record<string, unknown>;
  attachments?: Array<{
    filename: string;
    content?: Buffer;
    path?: string;
  }>;
}

export enum EmailTemplate {
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password-reset',
  PASSWORD_CHANGED = 'password-changed',
  TWO_FACTOR_SETUP = '2fa-setup',
  TRAINING_REMINDER = 'training-reminder',
  TEST_RESULTS = 'test-results',
  ACHIEVEMENT_UNLOCKED = 'achievement-unlocked',
  WEEKLY_SUMMARY = 'weekly-summary',
  // Payment & Subscription notifications
  PAYMENT_SUCCESSFUL = 'payment-successful',
  PAYMENT_FAILED = 'payment-failed',
  TRIAL_ENDING = 'trial-ending',
  SUBSCRIPTION_CANCELED = 'subscription-canceled',
  SUBSCRIPTION_RENEWED = 'subscription-renewed',
  PLAN_CHANGED = 'plan-changed',
}

export class EmailService {
  private transporter: Transporter | null = null;
  private templatesDir: string;
  private baseTemplate: HandlebarsTemplateDelegate | null = null;
  private isEnabled: boolean = true;

  constructor() {
    this.templatesDir = join(__dirname, '../templates/emails');

    // Load base template with fallback
    const baseTemplatePath = join(this.templatesDir, 'base.html');
    if (existsSync(baseTemplatePath)) {
      try {
        const baseHtml = readFileSync(baseTemplatePath, 'utf-8');
        this.baseTemplate = Handlebars.compile(baseHtml);
      } catch (error) {
        logger.warn({ error }, 'Failed to load base email template, using fallback');
        this.baseTemplate = Handlebars.compile(this.getFallbackBaseTemplate());
      }
    } else {
      logger.warn('Base email template not found, using fallback');
      this.baseTemplate = Handlebars.compile(this.getFallbackBaseTemplate());
    }

    // Configure email transporter with error handling
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '1025'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to create email transporter, emails will be disabled');
      this.isEnabled = false;
    }

    // Register Handlebars helpers
    this.registerHelpers();
  }

  /**
   * Fallback base template for when template file is missing
   */
  private getFallbackBaseTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{subject}}</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #2d5a27;">IUP Golf Academy</h1>
  {{{content}}}
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
  <p style="color: #666; font-size: 12px;">
    &copy; {{year}} IUP Golf Academy
  </p>
</body>
</html>`;
  }

  /**
   * Fallback template for missing specific templates
   */
  private getFallbackContentTemplate(): string {
    return `
<div style="padding: 20px;">
  <p>Hello {{firstName}},</p>
  <p>{{message}}</p>
  <p>Best regards,<br>IUP Golf Academy Team</p>
</div>`;
  }

  /**
   * Register custom Handlebars helpers
   */
  private registerHelpers(): void {
    // Format date helper
    Handlebars.registerHelper('formatDate', (date: Date | string, format: string) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (format === 'short') {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      if (format === 'long') {
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
      return d.toISOString();
    });

    // Format time helper
    Handlebars.registerHelper('formatTime', (date: Date | string) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    });

    // Conditional helper
    Handlebars.registerHelper('ifEquals', function (this: unknown, arg1: unknown, arg2: unknown, options: Handlebars.HelperOptions) {
      return arg1 === arg2 ? options.fn(this) : options.inverse(this);
    });
  }

  /**
   * Send email using template
   * Returns true if email was sent, false if sending was skipped or failed gracefully
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    const { to, subject, template, data, attachments } = options;

    // Check if email service is enabled
    if (!this.isEnabled || !this.transporter) {
      logger.warn({ to, subject }, 'Email service disabled, skipping email');
      return false;
    }

    // Load template content with fallback
    let templateContent: string;
    const templatePath = join(this.templatesDir, `${template}.html`);

    if (existsSync(templatePath)) {
      try {
        templateContent = readFileSync(templatePath, 'utf-8');
      } catch (error) {
        logger.warn({ template, error }, 'Failed to read email template, using fallback');
        templateContent = this.getFallbackContentTemplate();
      }
    } else {
      logger.warn({ template }, 'Email template not found, using fallback');
      templateContent = this.getFallbackContentTemplate();
    }

    const compiledTemplate = Handlebars.compile(templateContent);

    // Render template with data
    const content = compiledTemplate({
      ...data,
      message: data.message || `You have a new notification regarding: ${subject}`,
    });

    // Prepare base template data
    const baseData = {
      subject,
      content,
      recipientEmail: Array.isArray(to) ? to[0] : to,
      year: new Date().getFullYear(),
      unsubscribeUrl: data.unsubscribeUrl || `${config.frontend.url}/settings/notifications`,
      settingsUrl: data.settingsUrl || `${config.frontend.url}/settings`,
      supportUrl: data.supportUrl || `${config.frontend.url}/support`,
      ...data,
    };

    // Render final HTML with base template
    const html = this.baseTemplate!(baseData);

    // Generate plain text version (strip HTML)
    const text = this.htmlToText(html);

    // Send email with error handling
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'IUP Golf Academy <noreply@iup-golf.com>',
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        text,
        attachments,
      });

      logger.info({ to, subject, template }, 'Email sent successfully');
      return true;
    } catch (error) {
      logger.error({ to, subject, template, error }, 'Failed to send email');

      // In production, we don't want to throw - just log and return false
      if (config.server.isProduction) {
        return false;
      }

      // In development/test, throw to help debug issues
      throw error;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(
    to: string,
    data: {
      firstName: string;
      email: string;
      role: string;
      organizationName: string;
    }
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Welcome to IUP Golf Academy! 🎉',
      template: EmailTemplate.WELCOME,
      data: {
        ...data,
        loginUrl: `${config.frontend.url}/login`,
        docsUrl: `${config.frontend.url}/docs`,
        videoTutorialUrl: `${config.frontend.url}/tutorials/getting-started`,
        faqUrl: `${config.frontend.url}/faq`,
      },
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    to: string,
    data: {
      firstName: string;
      email: string;
      resetToken: string;
    }
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Password Reset Request',
      template: EmailTemplate.PASSWORD_RESET,
      data: {
        ...data,
        resetUrl: `${config.frontend.url}/reset-password?token=${data.resetToken}`,
      },
    });
  }

  /**
   * Send password changed confirmation email
   */
  async sendPasswordChangedEmail(
    to: string,
    data: {
      firstName: string;
      email: string;
      changedAt: string;
    }
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Password Changed Successfully',
      template: EmailTemplate.PASSWORD_CHANGED,
      data: {
        ...data,
        loginUrl: `${config.frontend.url}/login`,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@iup-golf.com',
      },
    });
  }

  /**
   * Send 2FA setup email
   */
  async send2FASetupEmail(
    to: string,
    data: {
      firstName: string;
      backupCodes: string[];
    }
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Two-Factor Authentication Enabled',
      template: EmailTemplate.TWO_FACTOR_SETUP,
      data: {
        ...data,
        settingsUrl: `${config.frontend.url}/settings/security`,
      },
    });
  }

  /**
   * Send training session reminder
   */
  async sendTrainingReminder(
    to: string,
    data: {
      firstName: string;
      sessionTitle: string;
      sessionDate: string;
      sessionTime: string;
      location: string;
      sessionDescription: string;
      coach?: string;
      focusAreas: string[];
      equipment?: string[];
      sessionId: string;
    }
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Training Reminder: ${data.sessionTitle}`,
      template: EmailTemplate.TRAINING_REMINDER,
      data: {
        ...data,
        sessionUrl: `${config.frontend.url}/sessions/${data.sessionId}`,
        cancelUrl: `${config.frontend.url}/sessions/${data.sessionId}/cancel`,
      },
    });
  }

  /**
   * Send test results email
   */
  async sendTestResults(
    to: string,
    data: {
      firstName: string;
      testName: string;
      testDate: string;
      score: number;
      performanceLevel: string;
      percentile: number;
      improvement: string;
      improvementColor: string;
      categoryProgress: number;
      metrics: Array<{ name: string; value: string; percentage: number }>;
      coachFeedback: string;
      coachName: string;
      recommendations: string[];
      testId: string;
      nextTest?: { name: string; date: string };
    }
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Test Results: ${data.testName}`,
      template: EmailTemplate.TEST_RESULTS,
      data: {
        ...data,
        resultsUrl: `${config.frontend.url}/tests/${data.testId}/results`,
      },
    });
  }

  /**
   * Send achievement unlocked email
   */
  async sendAchievementUnlocked(
    to: string,
    data: {
      firstName: string;
      achievementName: string;
      achievementTagline: string;
      achievementDescription: string;
      badgeEmoji: string;
      totalAchievements: number;
      category: string;
      categoryProgress: number;
      rank: string;
      whatItMeans: string;
      suggestions: string[];
      achievementId: string;
      nextMilestone?: {
        name: string;
        emoji: string;
        requirement: string;
        progress: number;
      };
      relatedAchievements?: Array<{ name: string; emoji: string }>;
    }
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Achievement Unlocked: ${data.achievementName}! 🏆`,
      template: EmailTemplate.ACHIEVEMENT_UNLOCKED,
      data: {
        ...data,
        achievementsUrl: `${config.frontend.url}/achievements`,
        shareUrl: `${config.frontend.url}/achievements/${data.achievementId}/share`,
      },
    });
  }

  /**
   * Send weekly summary email
   */
  async sendWeeklySummary(
    to: string,
    data: {
      firstName: string;
      weekStart: string;
      weekEnd: string;
      hoursTrained: number;
      sessionsCompleted: number;
      testsCompleted: number;
      improvements: Array<{ skill: string; progress: number; improvement: number }>;
      sessions: Array<{
        title: string;
        date: string;
        duration: number;
        focusArea: string;
        notes?: string;
      }>;
      goals: Array<{
        name: string;
        progress: number;
        target: string;
        deadline: string;
      }>;
      coachNotes: string;
      coachName: string;
      upcomingSessions: Array<{ title: string; date: string; time: string }>;
      achievements?: Array<{ name: string; emoji: string }>;
    }
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Your Weekly Training Summary (${data.weekStart} - ${data.weekEnd})`,
      template: EmailTemplate.WEEKLY_SUMMARY,
      data: {
        ...data,
        dashboardUrl: `${config.frontend.url}/dashboard`,
      },
    });
  }

  /**
   * Send payment successful notification
   */
  async sendPaymentSuccessfulEmail(
    to: string,
    data: {
      userName: string;
      amount: number;
      currency: string;
      planType: string;
      invoiceUrl?: string;
    }
  ): Promise<boolean> {
    // Format amount from cents to currency
    const formattedAmount = (data.amount / 100).toFixed(2);

    return this.sendEmail({
      to,
      subject: 'Payment Successful - IUP Golf Academy',
      template: EmailTemplate.PAYMENT_SUCCESSFUL,
      data: {
        ...data,
        formattedAmount,
        billingUrl: `${config.frontend.url}/billing`,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@iup-golf.com',
      },
    });
  }

  /**
   * Send payment failed notification
   */
  async sendPaymentFailedEmail(
    to: string,
    data: {
      userName: string;
      amount: number;
      currency: string;
      failureReason: string;
      retryDate?: Date;
    }
  ): Promise<boolean> {
    const formattedAmount = (data.amount / 100).toFixed(2);

    return this.sendEmail({
      to,
      subject: 'Payment Failed - Action Required',
      template: EmailTemplate.PAYMENT_FAILED,
      data: {
        ...data,
        formattedAmount,
        updatePaymentUrl: `${config.frontend.url}/billing`,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@iup-golf.com',
      },
    });
  }

  /**
   * Send trial ending reminder
   */
  async sendTrialEndingEmail(
    to: string,
    data: {
      userName: string;
      planType: string;
      trialEndDate: Date;
      daysRemaining: number;
    }
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Your Trial Ends in ${data.daysRemaining} Days`,
      template: EmailTemplate.TRIAL_ENDING,
      data: {
        ...data,
        formattedEndDate: data.trialEndDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
        billingUrl: `${config.frontend.url}/billing`,
        pricingUrl: `${config.frontend.url}/pricing`,
      },
    });
  }

  /**
   * Send subscription canceled notification
   */
  async sendSubscriptionCanceledEmail(
    to: string,
    data: {
      userName: string;
      planType: string;
      accessEndDate: Date;
    }
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Subscription Canceled - IUP Golf Academy',
      template: EmailTemplate.SUBSCRIPTION_CANCELED,
      data: {
        ...data,
        formattedEndDate: data.accessEndDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
        reactivateUrl: `${config.frontend.url}/billing`,
        feedbackUrl: `${config.frontend.url}/feedback`,
      },
    });
  }

  /**
   * Send subscription renewed notification
   */
  async sendSubscriptionRenewedEmail(
    to: string,
    data: {
      userName: string;
      amount: number;
      currency: string;
      planType: string;
      nextBillingDate: Date;
      invoiceUrl?: string;
    }
  ): Promise<boolean> {
    const formattedAmount = (data.amount / 100).toFixed(2);

    return this.sendEmail({
      to,
      subject: 'Subscription Renewed - IUP Golf Academy',
      template: EmailTemplate.SUBSCRIPTION_RENEWED,
      data: {
        ...data,
        formattedAmount,
        formattedNextBilling: data.nextBillingDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
        billingUrl: `${config.frontend.url}/billing`,
      },
    });
  }

  /**
   * Send plan changed notification
   */
  async sendPlanChangedEmail(
    to: string,
    data: {
      userName: string;
      oldPlan: string;
      newPlan: string;
      effectiveDate: Date;
      proratedAmount?: number;
    }
  ): Promise<boolean> {
    const formattedProrated = data.proratedAmount
      ? (data.proratedAmount / 100).toFixed(2)
      : null;

    return this.sendEmail({
      to,
      subject: 'Plan Changed Successfully - IUP Golf Academy',
      template: EmailTemplate.PLAN_CHANGED,
      data: {
        ...data,
        formattedProrated,
        formattedEffectiveDate: data.effectiveDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
        billingUrl: `${config.frontend.url}/billing`,
        plansUrl: `${config.frontend.url}/pricing`,
      },
    });
  }

  /**
   * Convert HTML to plain text using sanitize-html library
   */
  private htmlToText(html: string): string {
    // Use sanitize-html to safely strip all HTML tags
    const sanitizeHtml = require('sanitize-html');
    return sanitizeHtml(html, {
      allowedTags: [],
      allowedAttributes: {},
    })
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Preview email template (for development)
   */
  async previewEmail(template: EmailTemplate, data: Record<string, unknown>): Promise<string> {
    // Load template content
    const templatePath = join(this.templatesDir, `${template}.html`);
    const templateContent = readFileSync(templatePath, 'utf-8');
    const compiledTemplate = Handlebars.compile(templateContent);

    // Render template with data
    const content = compiledTemplate(data);

    // Prepare base template data
    const baseData = {
      subject: data.subject || 'Email Preview',
      content,
      recipientEmail: data.email || 'preview@example.com',
      year: new Date().getFullYear(),
      unsubscribeUrl: '#',
      settingsUrl: '#',
      supportUrl: '#',
      ...data,
    };

    // Render final HTML
    if (!this.baseTemplate) {
      return content; // Return content without base wrapper if base template not loaded
    }
    return this.baseTemplate(baseData);
  }
}

// Export singleton instance
export const emailService = new EmailService();
