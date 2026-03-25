/**
 * Security Utilities
 *
 * Collection of security helper functions for the TIER Golf platform
 */

/**
 * Token Storage Utilities
 *
 * Improved token storage with defense-in-depth approach
 */

export interface TokenStorage {
  getToken(): string | null;
  setToken(token: string): void;
  removeToken(): void;
  hasToken(): boolean;
}

/**
 * Enhanced localStorage token storage with additional security measures
 *
 * Note: For maximum security, consider migrating to httpOnly cookies
 * See SECURITY_AUDIT_REPORT.md for recommendations
 */
export const secureTokenStorage: TokenStorage = {
  getToken(): string | null {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;

      // Verify token hasn't been tampered with (basic check)
      // JWT structure: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('[Security] Invalid token format detected');
        this.removeToken();
        return null;
      }

      return token;
    } catch (error) {
      console.error('[Security] Error reading token:', error);
      return null;
    }
  },

  setToken(token: string): void {
    try {
      // Validate token format before storing
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      localStorage.setItem('accessToken', token);

      // Set flag for security monitoring
      localStorage.setItem('tokenSet', Date.now().toString());
    } catch (error) {
      console.error('[Security] Error storing token:', error);
      throw error;
    }
  },

  removeToken(): void {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('tokenSet');
    } catch (error) {
      console.error('[Security] Error removing token:', error);
    }
  },

  hasToken(): boolean {
    return this.getToken() !== null;
  },
};

/**
 * SessionStorage-based token storage (alternative - more secure)
 *
 * Tokens are cleared when browser tab/window is closed
 * Better security than localStorage for sensitive sessions
 */
export const sessionTokenStorage: TokenStorage = {
  getToken(): string | null {
    try {
      return sessionStorage.getItem('accessToken');
    } catch (error) {
      console.error('[Security] Error reading token from session:', error);
      return null;
    }
  },

  setToken(token: string): void {
    try {
      sessionStorage.setItem('accessToken', token);
    } catch (error) {
      console.error('[Security] Error storing token in session:', error);
      throw error;
    }
  },

  removeToken(): void {
    try {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('userData');
    } catch (error) {
      console.error('[Security] Error removing token from session:', error);
    }
  },

  hasToken(): boolean {
    return this.getToken() !== null;
  },
};

/**
 * Input Sanitization
 */

/**
 * Sanitize string input to prevent XSS
 *
 * Basic sanitization - for HTML content use DOMPurify
 */
export function sanitizeString(input: string): string {
  if (!input) return '';

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return '';

  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')  // Remove special chars
    .replace(/\.{2,}/g, '.')           // Remove multiple dots
    .replace(/^\.+/, '')               // Remove leading dots
    .substring(0, 255);                // Limit length
}

/**
 * Validate URL to prevent open redirect attacks
 */
export function isValidRedirectUrl(url: string, allowedHosts: string[]): boolean {
  if (!url) return false;

  try {
    const urlObj = new URL(url);

    // Check if host is in allowed list
    return allowedHosts.includes(urlObj.host);
  } catch {
    // Invalid URL - could be relative path
    // Only allow relative paths starting with /
    return url.startsWith('/') && !url.startsWith('//');
  }
}

/**
 * Content Security
 */

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') return false;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate date string format (YYYY-MM-DD)
 */
export function isValidDateString(date: string): boolean {
  if (!date || typeof date !== 'string') return false;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;

  // Check if date is valid
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
}

/**
 * Rate Limiting (Client-side)
 */

interface RateLimiter {
  canMakeRequest(): boolean;
  recordRequest(): void;
  reset(): void;
}

/**
 * Create a client-side rate limiter
 *
 * Prevents accidental API spam from frontend bugs
 */
export function createRateLimiter(
  maxRequests: number,
  windowMs: number
): RateLimiter {
  const requests: number[] = [];

  return {
    canMakeRequest(): boolean {
      const now = Date.now();
      const windowStart = now - windowMs;

      // Remove old requests outside the window
      while (requests.length > 0 && requests[0] < windowStart) {
        requests.shift();
      }

      return requests.length < maxRequests;
    },

    recordRequest(): void {
      requests.push(Date.now());
    },

    reset(): void {
      requests.length = 0;
    },
  };
}

/**
 * Error Message Sanitization
 */

/**
 * Sanitize error message to prevent information disclosure
 *
 * Removes stack traces, file paths, and other sensitive info
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (!error) return 'An error occurred';

  if (typeof error === 'string') {
    // Remove file paths
    return error
      .replace(/\/[\w\/\-.]+\.(?:ts|tsx|js|jsx)/g, '[file]')
      .replace(/at .+ \(.+\)/g, '');
  }

  if (error instanceof Error) {
    // Return only the message, not the stack
    return error.message || 'An error occurred';
  }

  return 'An error occurred';
}

/**
 * Security Headers (for development testing)
 */

/**
 * Check if response has proper security headers
 *
 * Use in development to verify backend security configuration
 */
export function validateSecurityHeaders(headers: Headers): {
  valid: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];

  const requiredHeaders = [
    'strict-transport-security',
    'x-content-type-options',
    'x-frame-options',
  ];

  const recommendedHeaders = [
    'content-security-policy',
    'referrer-policy',
  ];

  // Check required headers
  for (const header of requiredHeaders) {
    if (!headers.has(header)) {
      missing.push(header);
    }
  }

  // Check recommended headers
  for (const header of recommendedHeaders) {
    if (!headers.has(header)) {
      warnings.push(header);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * CSRF Token Management (for future httpOnly cookie implementation)
 */

/**
 * Get CSRF token from meta tag or cookie
 *
 * Placeholder for future CSRF protection implementation
 */
export function getCsrfToken(): string | null {
  // Check meta tag first
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  if (metaTag) {
    return metaTag.getAttribute('content');
  }

  // Check cookie (when httpOnly cookies are implemented)
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Security Monitoring
 */

/**
 * Report security event to monitoring service
 *
 * Currently logs to console, can be extended to send to Sentry/monitoring service
 */
export function reportSecurityEvent(
  eventType: 'xss-attempt' | 'invalid-token' | 'rate-limit' | 'suspicious-activity',
  details: Record<string, unknown>
): void {
  // Log locally
  console.warn('[Security Event]', eventType, details);

  // TODO: Send to monitoring service (Sentry, DataDog, etc.)
  // if (window.Sentry) {
  //   window.Sentry.captureMessage(`Security Event: ${eventType}`, {
  //     level: 'warning',
  //     extra: details,
  //   });
  // }
}

/**
 * Password Strength Validation (for future password change features)
 */

export interface PasswordStrength {
  score: number;  // 0-4 (weak to strong)
  feedback: string[];
  valid: boolean;
}

/**
 * Validate password strength
 *
 * Basic implementation - consider using zxcvbn for production
 */
export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (!password) {
    return { score: 0, feedback: ['Password is required'], valid: false };
  }

  // Length check
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters');
  } else {
    score += 1;
  }

  if (password.length >= 12) {
    score += 1;
  }

  // Complexity checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include both uppercase and lowercase letters');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include at least one number');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include at least one special character');
  }

  // Common passwords check (basic)
  const commonPasswords = ['password', '123456', 'qwerty', 'abc123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    score = 0;
    feedback.push('Password is too common');
  }

  return {
    score: Math.min(score, 4),
    feedback,
    valid: score >= 3 && feedback.length === 0,
  };
}

/**
 * Secure Random String Generation
 */

/**
 * Generate a cryptographically secure random string
 *
 * Useful for nonces, CSRF tokens, etc.
 */
export function generateSecureRandomString(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Type Guards
 */

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const err = error as { response?: { status?: number } };
  return err.response?.status === 401;
}

/**
 * Check if error is a permission error
 */
export function isPermissionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const err = error as { response?: { status?: number } };
  return err.response?.status === 403;
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const err = error as { response?: { status?: number } };
  return err.response?.status === 429;
}

/**
 * Export default token storage
 *
 * Can be configured to use localStorage or sessionStorage
 */
export const tokenStorage = secureTokenStorage;

// TokenStorage interface is already exported at line 13
