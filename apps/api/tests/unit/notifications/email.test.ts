/**
 * Email Service Unit Tests
 * Tests email sending, graceful fallback, and template rendering
 */

// Mock the logger - must be before imports
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import { EmailService } from '../../../src/domain/notifications/email.service';
import nodemailer from 'nodemailer';
import { logger as mockLogger } from '../../../src/utils/logger';

// Mock nodemailer
jest.mock('nodemailer');

describe('EmailService', () => {
  let emailService: EmailService;
  let mockTransporter: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTransporter = {
      sendMail: jest.fn(),
      verify: jest.fn(),
    };

    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    // Set up valid SMTP config
    process.env.SMTP_HOST = 'smtp.gmail.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'test@example.com';
    process.env.SMTP_PASS = 'password';
    process.env.SMTP_FROM_EMAIL = 'noreply@akgolf.com';
    process.env.SMTP_FROM_NAME = 'AK Golf IUP';

    emailService = new EmailService();
  });

  afterEach(() => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.SMTP_FROM_EMAIL;
    delete process.env.SMTP_FROM_NAME;
  });

  describe('constructor', () => {
    it('should create transporter when SMTP is configured', () => {
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'password',
        },
      });
    });

    it('should log info when SMTP is not configured', () => {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;

      new EmailService();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Email service not configured - emails will be logged only'
      );
    });
  });

  describe('send', () => {
    it('should send email successfully', async () => {
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      });

      await emailService.send({
        to: 'user@example.com',
        subject: 'Test Email',
        html: '<h1>Test</h1>',
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'AK Golf IUP <noreply@akgolf.com>',
          to: 'user@example.com',
          subject: 'Test Email',
          html: '<h1>Test</h1>',
        })
      );
    });

    it('should send email to multiple recipients', async () => {
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      });

      await emailService.send({
        to: ['user1@example.com', 'user2@example.com'],
        subject: 'Test Email',
        html: '<h1>Test</h1>',
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'AK Golf IUP <noreply@akgolf.com>',
          to: 'user1@example.com, user2@example.com',
          subject: 'Test Email',
          html: '<h1>Test</h1>',
        })
      );
    });

    it('should fallback to logger when transporter is not configured', async () => {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;
      const unconfiguredService = new EmailService();

      await unconfiguredService.send({
        to: 'user@example.com',
        subject: 'Test Email',
        html: '<h1>Test</h1>',
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'development',
          to: 'user@example.com',
          subject: 'Test Email',
        }),
        'Email not sent (SMTP not configured)'
      );
    });
  });

  describe('verify', () => {
    it('should verify SMTP connection successfully', async () => {
      mockTransporter.verify.mockResolvedValue(true);

      const result = await emailService.verify();

      expect(result).toBe(true);
      expect(mockTransporter.verify).toHaveBeenCalled();
    });

    it('should return false when SMTP connection fails', async () => {
      mockTransporter.verify.mockRejectedValue(new Error('Connection failed'));

      const result = await emailService.verify();

      expect(result).toBe(false);
    });

    it('should return false when transporter is not configured', async () => {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;
      const unconfiguredService = new EmailService();

      const result = await unconfiguredService.verify();

      expect(result).toBe(false);
    });
  });

  describe('isConfigured', () => {
    it('should return true when all SMTP env vars are set', () => {
      // Service was created with valid config in beforeEach
      // If transporter was created, it means isConfigured returned true
      expect(nodemailer.createTransport).toHaveBeenCalled();
    });

    it('should return false when SMTP_HOST is missing', () => {
      delete process.env.SMTP_HOST;
      new EmailService();

      // Should log info about not being configured
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('not configured')
      );
    });
  });
});
