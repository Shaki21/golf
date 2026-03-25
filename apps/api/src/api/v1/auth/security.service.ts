/**
 * Security Service
 * Handles password reset and 2FA functionality
 */

import { PrismaClient } from '@prisma/client';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import { hashPassword, verifyPassword } from '../../../utils/crypto';
import { UnauthorizedError, NotFoundError, BadRequestError } from '../../../middleware/errors';
import { EmailService } from '../../../domain/notifications/email.service';
import { emailTemplates } from '../../../domain/notifications/email-templates';
import { logger } from '../../../utils/logger';

export class SecurityService {
  private emailService: EmailService;

  constructor(private prisma: PrismaClient) {
    this.emailService = new EmailService();
  }

  /**
   * Initiate password reset - generate token and send email
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent user enumeration
    // But only send email if user exists
    if (!user) {
      return { message: 'If an account exists with this email, you will receive a password reset link' };
    }

    // Generate reset token (32 bytes = 64 hex characters)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expiration (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Store hashed token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expiresAt,
      },
    });

    // Send password reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    const emailContent = emailTemplates.passwordReset({ email, resetUrl });

    await this.emailService.send({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    logger.info({ email: email.substring(0, 3) + '***' }, 'Password reset email sent');

    return { message: 'If an account exists with this email, you will receive a password reset link' };
  }

  /**
   * Verify reset token validity
   */
  async verifyResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return { valid: false };
    }

    return { valid: true, email: user.email };
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password and clear reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Revoke all refresh tokens for security
    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  /**
   * Setup 2FA for user - generate secret and QR code
   */
  async setup2FA(
    userId: string,
    password: string
  ): Promise<{
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
  }> {
    // Verify user exists and password is correct
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isValidPassword = await verifyPassword(user.passwordHash, password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid password');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestError('2FA is already enabled');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `IUP Golf (${user.email})`,
      issuer: 'IUP Golf Academy',
    });

    // Generate backup codes (10 codes, 8 characters each)
    const backupCodes = this.generateBackupCodes(10);
    const hashedBackupCodes = backupCodes.map(code =>
      crypto.createHash('sha256').update(code).digest('hex')
    );

    // Store secret temporarily (will be enabled after verification)
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret.base32,
        twoFactorBackupCodes: hashedBackupCodes,
      },
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32!,
      qrCodeUrl,
      backupCodes,
    };
  }

  /**
   * Verify 2FA token and enable 2FA
   */
  async verify2FA(userId: string, token: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.twoFactorSecret) {
      throw new BadRequestError('2FA setup not initiated');
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before/after for clock skew
    });

    if (!verified) {
      throw new BadRequestError('Invalid 2FA token');
    }

    // Enable 2FA
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
      },
    });
  }

  /**
   * Verify 2FA token during login
   */
  async verifyLogin2FA(userId: string, token: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return false;
    }

    return speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });
  }

  /**
   * Verify backup code during login
   */
  async verifyBackupCode(userId: string, backupCode: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorEnabled) {
      return false;
    }

    const hashedCode = crypto.createHash('sha256').update(backupCode).digest('hex');

    // Check if code exists in backup codes
    const codeIndex = user.twoFactorBackupCodes.indexOf(hashedCode);

    if (codeIndex === -1) {
      return false;
    }

    // Remove used backup code
    const updatedBackupCodes = [...user.twoFactorBackupCodes];
    updatedBackupCodes.splice(codeIndex, 1);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorBackupCodes: updatedBackupCodes,
      },
    });

    return true;
  }

  /**
   * Disable 2FA
   */
  async disable2FA(userId: string, password: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isValidPassword = await verifyPassword(user.passwordHash, password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid password');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestError('2FA is not enabled');
    }

    // Disable 2FA and clear secret
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: [],
      },
    });
  }

  /**
   * Check if user has 2FA enabled
   */
  async check2FAStatus(userId: string): Promise<{ enabled: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return { enabled: user.twoFactorEnabled };
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto
        .randomBytes(4)
        .toString('hex')
        .toUpperCase()
        .match(/.{1,4}/g)!
        .join('-');
      codes.push(code);
    }
    return codes;
  }
}
