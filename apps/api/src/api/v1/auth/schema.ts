import { z } from 'zod';

/**
 * Register request schema
 */
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  organizationName: z.string().min(1, 'Organization name is required'),
  role: z.enum(['admin', 'coach', 'player']).default('admin'),
});

export type RegisterInput = z.output<typeof registerSchema>;

/**
 * Login request schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Refresh token request schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

/**
 * Logout request schema
 */
export const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type LogoutInput = z.infer<typeof logoutSchema>;

/**
 * Change password schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password schema
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Verify reset token schema
 */
export const verifyResetTokenSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
});

export type VerifyResetTokenInput = z.infer<typeof verifyResetTokenSchema>;

/**
 * Setup 2FA schema
 */
export const setup2FASchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export type Setup2FAInput = z.infer<typeof setup2FASchema>;

/**
 * Verify 2FA schema
 */
export const verify2FASchema = z.object({
  token: z.string().length(6, 'Token must be 6 digits'),
});

export type Verify2FAInput = z.infer<typeof verify2FASchema>;

/**
 * Disable 2FA schema
 */
export const disable2FASchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export type Disable2FAInput = z.infer<typeof disable2FASchema>;

/**
 * Verify 2FA backup code schema
 */
export const verify2FABackupCodeSchema = z.object({
  backupCode: z.string().min(1, 'Backup code is required'),
});

export type Verify2FABackupCodeInput = z.infer<typeof verify2FABackupCodeSchema>;
