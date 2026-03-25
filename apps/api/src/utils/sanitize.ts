/**
 * Input Sanitization Utilities
 *
 * Uses sanitize-html library for secure HTML sanitization.
 * This replaces the previous regex-based approach which had security vulnerabilities.
 */

import sanitizeHtmlLib from 'sanitize-html';

// =============================================================================
// Configuration
// =============================================================================

/**
 * Default sanitize-html options for rich text content
 */
const RICH_TEXT_OPTIONS: sanitizeHtmlLib.IOptions = {
  allowedTags: [
    'p', 'br', 'b', 'i', 'u', 'strong', 'em', 'strike', 's',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'span', 'div',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    '*': ['class', 'id'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    a: ['http', 'https', 'mailto'],
  },
  // Enforce rel="noopener noreferrer" on links
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        rel: 'noopener noreferrer',
        target: attribs.target === '_blank' ? '_blank' : undefined,
      },
    }),
  },
};

/**
 * Strict options - strips all HTML
 */
const STRIP_ALL_OPTIONS: sanitizeHtmlLib.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
};

// =============================================================================
// Sanitization Functions
// =============================================================================

/**
 * Strip all HTML tags from a string
 * Use for plain text fields like names, titles, etc.
 */
export function stripHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Use sanitize-html to strip all tags safely
  return sanitizeHtmlLib(input, STRIP_ALL_OPTIONS)
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/**
 * Escape HTML special characters
 * Use when you need to display user input in HTML without interpretation
 */
export function escapeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // sanitize-html with textFilter to escape
  return sanitizeHtmlLib(input, {
    allowedTags: [],
    allowedAttributes: {},
    textFilter: (text) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },
  });
}

/**
 * Sanitize a URL to prevent javascript: and data: attacks
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();
  const lowercased = trimmed.toLowerCase();

  // Check for dangerous schemes
  if (
    lowercased.startsWith('javascript:') ||
    lowercased.startsWith('data:') ||
    lowercased.startsWith('vbscript:')
  ) {
    return '';
  }

  // Validate URL scheme if present
  try {
    const parsed = new URL(trimmed, 'http://localhost');
    const allowedSchemes = new Set(['http:', 'https:', 'mailto:']);
    if (!allowedSchemes.has(parsed.protocol)) {
      return '';
    }
  } catch {
    // If URL parsing fails, check if it's a relative URL
    if (trimmed.startsWith('/') || trimmed.startsWith('#') || trimmed.startsWith('?')) {
      return trimmed;
    }
    return '';
  }

  return trimmed;
}

/**
 * Sanitize HTML content while preserving safe tags
 * Uses sanitize-html library for secure parsing
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return sanitizeHtmlLib(input, RICH_TEXT_OPTIONS).trim();
}

/**
 * Sanitize object values recursively
 * Useful for sanitizing entire request bodies
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: {
    stripHtml?: boolean;
    preserveRichText?: string[]; // Field names that should preserve safe HTML
  } = {}
): T {
  const { stripHtml: shouldStripHtml = true, preserveRichText = [] } = options;

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      sanitized[key] = value;
    } else if (typeof value === 'string') {
      if (preserveRichText.includes(key)) {
        sanitized[key] = sanitizeHtml(value);
      } else if (shouldStripHtml) {
        sanitized[key] = stripHtml(value);
      } else {
        sanitized[key] = escapeHtml(value);
      }
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'object' && item !== null
          ? sanitizeObject(item as Record<string, unknown>, options)
          : typeof item === 'string'
            ? (shouldStripHtml ? stripHtml(item) : escapeHtml(item))
            : item
      );
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>, options);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Sanitize SQL-like input to prevent injection
 * Note: This is a basic check - always use parameterized queries!
 * Prisma already uses parameterized queries, so this is defense-in-depth.
 */
export function sanitizeSqlInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove common SQL injection patterns
  // Note: Parameterized queries (used by Prisma) are the real protection
  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/;/g, '') // Remove semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comment start
    .replace(/\*\//g, '') // Remove block comment end
    .trim();
}

/**
 * Validate and sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmed = email.trim().toLowerCase();

  if (!emailRegex.test(trimmed)) {
    return '';
  }

  return trimmed;
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return '';
  }

  // Use path.basename equivalent logic and remove dangerous characters
  const basename = filename.split(/[/\\]/).pop() || '';

  return basename
    .replace(/\.\./g, '') // Remove path traversal sequences
    .replace(/[<>:"|?*\x00-\x1f]/g, '') // Remove invalid filename characters and control chars
    .trim();
}

// =============================================================================
// Export Default
// =============================================================================

export default {
  stripHtml,
  escapeHtml,
  sanitizeHtml,
  sanitizeUrl,
  sanitizeObject,
  sanitizeSqlInput,
  sanitizeEmail,
  sanitizeFilename,
};
