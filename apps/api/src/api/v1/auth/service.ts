import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '../../../utils/crypto';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../../utils/jwt';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../../middleware/errors';
import { RegisterInput, LoginInput } from './schema';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId: string;
    onboardingComplete?: boolean;
    profileImageUrl?: string;
  };
}

/**
 * User data with optional player ID for token generation
 */
interface UserWithOptionalPlayerId {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  playerId?: string;
  coachId?: string;
  onboardingComplete?: boolean;
  profileImageUrl?: string | null;
}

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Register a new user and create a tenant (organization)
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);

    // Create tenant and user in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create tenant (organization)
      const tenant = await tx.tenant.create({
        data: {
          name: input.organizationName,
          slug: this.generateSlug(input.organizationName),
          subscriptionTier: 'free',
          status: 'active',
        },
      });

      // Create user
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: input.email,
          passwordHash,
          firstName: input.firstName,
          lastName: input.lastName,
          role: input.role,
          isActive: true,
        },
      });

      // If role is player, create Player entity
      let playerId: string | undefined;
      if (input.role === 'player') {
        const player = await tx.player.create({
          data: {
            tenantId: tenant.id,
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            dateOfBirth: new Date('2000-01-01'), // Default DOB - must be updated by user
            gender: 'male', // Default value - can be updated later
            category: 'B', // Default category - can be updated later
          },
        });
        playerId = player.id;
      }

      // If role is coach, create Coach entity
      if (input.role === 'coach') {
        await tx.coach.create({
          data: {
            tenantId: tenant.id,
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            specializations: [], // Can be updated later
          },
        });
      }

      return { tenant, user, playerId };
    });

    // Generate tokens (with playerId if player was created)
    return this.generateAuthResponse(result.playerId ? { ...result.user, playerId: result.playerId } : result.user);
  }

  /**
   * Login with email and password
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account is inactive');
    }

    // Check if tenant is active
    if (user.tenant.status !== 'active') {
      throw new UnauthorizedError('Organization is not active');
    }

    // Verify password
    const isValidPassword = await verifyPassword(user.passwordHash, input.password);

    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // If user is a player, look up their player ID and onboarding status
    let playerId: string | undefined;
    let onboardingComplete: boolean | undefined;
    let profileImageUrl: string | null | undefined;
    if (user.role === 'player') {
      const player = await this.prisma.player.findFirst({
        where: { email: user.email },
        select: { id: true, onboardingComplete: true, profileImageUrl: true },
      });
      playerId = player?.id;
      onboardingComplete = player?.onboardingComplete ?? false;
      profileImageUrl = player?.profileImageUrl;
    }

    // If user is a coach, look up their coach ID
    let coachId: string | undefined;
    if (user.role === 'coach') {
      const coach = await this.prisma.coach.findFirst({
        where: { email: user.email, tenantId: user.tenantId },
        select: { id: true, profileImageUrl: true },
      });
      coachId = coach?.id;
      profileImageUrl = coach?.profileImageUrl;
    }

    // Generate tokens with playerId/coachId/onboardingComplete if available
    const userWithExtra = { ...user, playerId, coachId, onboardingComplete, profileImageUrl };
    return this.generateAuthResponse(userWithExtra);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
    // Verify refresh token
    try {
      verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Check if refresh token exists in database and is not revoked
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { tenant: true } } },
    });

    if (!storedToken) {
      throw new UnauthorizedError('Refresh token not found');
    }

    if (storedToken.isRevoked) {
      throw new UnauthorizedError('Refresh token has been revoked');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expired');
    }

    // Check if user is still active
    if (!storedToken.user.isActive) {
      throw new UnauthorizedError('User account is inactive');
    }

    if (storedToken.user.tenant.status !== 'active') {
      throw new UnauthorizedError('Organization is not active');
    }

    // If user is a player, look up their player ID
    let playerId: string | undefined;
    if (storedToken.user.role === 'player') {
      const player = await this.prisma.player.findFirst({
        where: { email: storedToken.user.email },
        select: { id: true },
      });
      playerId = player?.id;
    }

    // If user is a coach, look up their coach ID
    let coachId: string | undefined;
    if (storedToken.user.role === 'coach') {
      const coach = await this.prisma.coach.findFirst({
        where: { email: storedToken.user.email, tenantId: storedToken.user.tenantId },
        select: { id: true },
      });
      coachId = coach?.id;
    }

    // Generate new tokens with playerId/coachId if available
    return this.generateAuthResponse({ ...storedToken.user, playerId, coachId });
  }

  /**
   * Logout (revoke refresh token)
   */
  async logout(refreshToken: string): Promise<void> {
    // Find and revoke refresh token
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken) {
      // Silent fail - token doesn't exist (already logged out or invalid)
      return;
    }

    // Revoke the token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isValidPassword = await verifyPassword(user.passwordHash, currentPassword);

    if (!isValidPassword) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Revoke all refresh tokens for this user
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  /**
   * Generate auth response with tokens
   */
  private async generateAuthResponse(user: UserWithOptionalPlayerId): Promise<AuthResponse> {
    // Generate access token
    const accessToken = generateAccessToken({
      id: user.id,           // Primary user ID
      userId: user.id,       // Backwards compatibility
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
      playerId: user.playerId, // Include if user is a player
      coachId: user.coachId,   // Include if user is a coach
    });

    // Generate refresh token
    const refreshTokenPayload = {
      userId: user.id,
      tokenId: this.generateTokenId(),
    };

    const refreshToken = generateRefreshToken(refreshTokenPayload);

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
        isRevoked: false,
      },
    });

    // Clean up old expired tokens (async, don't wait)
    this.cleanupExpiredTokens(user.id).catch(() => {
      // Ignore errors
    });

    const response = {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        onboardingComplete: user.onboardingComplete,
        profileImageUrl: user.profileImageUrl || undefined,
      },
    };
    return response;
  }

  /**
   * Generate slug from organization name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);
  }

  /**
   * Generate unique token ID
   */
  private generateTokenId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Clean up expired refresh tokens
   */
  private async cleanupExpiredTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        OR: [
          { expiresAt: { lt: new Date() } },
          { isRevoked: true },
        ],
      },
    });
  }
}
