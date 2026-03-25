/**
 * Email Service
 * Handles sending emails via SMTP (Nodemailer)
 *
 * Environment variables required:
 * - SMTP_HOST
 * - SMTP_PORT
 * - SMTP_USER
 * - SMTP_PASS
 * - SMTP_FROM_EMAIL
 * - SMTP_FROM_NAME
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { logger } from '../../utils/logger';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export class EmailService {
  private transporter: Transporter | null = null;
  private enabled: boolean;

  constructor() {
    this.enabled = this.isConfigured();

    if (this.enabled) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      logger.info('Email service configured and ready');
    } else {
      logger.info('Email service not configured - emails will be logged only');
    }
  }

  /**
   * Check if email is properly configured
   */
  private isConfigured(): boolean {
    return !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM_EMAIL
    );
  }

  /**
   * Send an email
   */
  async send(options: EmailOptions): Promise<void> {
    if (!this.enabled || !this.transporter) {
      // Fallback: log email details in development mode
      logger.info({
        mode: 'development',
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
      }, 'Email not sent (SMTP not configured)');
      logger.debug({ htmlContent: options.html }, 'Email HTML content');
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `${process.env.SMTP_FROM_NAME || 'AK Golf IUP'} <${process.env.SMTP_FROM_EMAIL}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
      });

      logger.info({ messageId: info.messageId, to: options.to }, 'Email sent successfully');
    } catch (error) {
      logger.error({ error, to: options.to, subject: options.subject }, 'Failed to send email');
      throw error;
    }
  }

  /**
   * Simple HTML to text conversion using sanitize-html library
   */
  private htmlToText(html: string): string {
    // Use sanitize-html to safely strip all HTML tags
    const sanitizeHtml = require('sanitize-html');
    return sanitizeHtml(html, {
      allowedTags: [],
      allowedAttributes: {},
    })
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Verify SMTP connection
   */
  async verify(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      logger.info('SMTP connection verified');
      return true;
    } catch (error) {
      logger.error({ error }, 'SMTP connection verification failed');
      return false;
    }
  }
}
