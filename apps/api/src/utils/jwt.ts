import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AccessTokenPayload {
  id: string;        // User ID (same as userId for backwards compatibility)
  userId: string;    // Kept for backwards compatibility
  tenantId: string;
  role: 'admin' | 'coach' | 'player' | 'parent';
  email: string;
  playerId?: string; // Optional: Used when user is a player
  coachId?: string;  // Optional: Used when user is a coach
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

/**
 * Generate an access token
 */
export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry as string | number,
    issuer: 'iup-golf-backend',
    audience: 'iup-golf-api',
  } as jwt.SignOptions);
}

/**
 * Generate a refresh token
 */
export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry as string | number,
    issuer: 'iup-golf-backend',
    audience: 'iup-golf-api',
  } as jwt.SignOptions);
}

/**
 * Verify an access token
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const payload = jwt.verify(token, config.jwt.accessSecret, {
      issuer: 'iup-golf-backend',
      audience: 'iup-golf-api',
    }) as AccessTokenPayload;

    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Access token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid access token');
    }
    throw error;
  }
}

/**
 * Verify a refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const payload = jwt.verify(token, config.jwt.refreshSecret, {
      issuer: 'iup-golf-backend',
      audience: 'iup-golf-api',
    }) as RefreshTokenPayload;

    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
}

/**
 * Decode a token without verifying (useful for debugging)
 */
export function decodeToken(token: string): jwt.JwtPayload | string | null {
  return jwt.decode(token);
}
