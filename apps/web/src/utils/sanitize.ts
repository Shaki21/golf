/**
 * Sanitization utilities for XSS protection
 * Uses DOMPurify to sanitize user-generated content
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Only allows safe HTML tags and attributes
 */
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
};

/**
 * Sanitize file names to prevent path traversal attacks
 * Removes special characters and path separators
 */
export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '_') // Remove multiple dots
    .replace(/^\./, '_') // Remove leading dot
    .substring(0, 255); // Limit length
};

/**
 * Sanitize and validate URLs
 * Returns null if the URL is invalid or uses a dangerous protocol
 */
export const sanitizeUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);

    // Block dangerous protocols
    if (['javascript:', 'data:', 'vbscript:', 'file:'].includes(parsed.protocol)) {
      return null;
    }

    // Only allow http, https, and mailto
    if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      return null;
    }

    return parsed.toString();
  } catch {
    // Invalid URL
    return null;
  }
};

/**
 * Sanitize plain text (removes all HTML)
 * Use this for text that should never contain HTML
 */
export const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

/**
 * Sanitize search query to prevent injection attacks
 * Escapes special characters that could be used in injection
 */
export const sanitizeSearchQuery = (query: string): string => {
  return query
    .replace(/[<>'"\\]/g, '') // Remove dangerous characters
    .trim()
    .substring(0, 200); // Limit length
};

/**
 * Sanitize email address
 * Basic validation and sanitization
 */
export const sanitizeEmail = (email: string): string | null => {
  const trimmed = email.trim().toLowerCase();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return null;
  }

  return trimmed;
};
