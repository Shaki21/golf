/**
 * Accessibility utilities for TIER Golf
 * Provides helpers for keyboard navigation, ARIA labels, focus management, and screen reader support
 */

/**
 * Trap focus within a container (useful for modals and dialogs)
 * @param {HTMLElement} element - Container element
 * @returns {Function} Cleanup function
 */
export function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  function handleTabKey(e) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  }

  element.addEventListener('keydown', handleTabKey);

  // Focus first element
  firstFocusable?.focus();

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Get the first focusable element in a container
 * @param {HTMLElement} container
 * @returns {HTMLElement|null}
 */
export function getFirstFocusable(container) {
  const focusable = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  return focusable[0] || null;
}

/**
 * Restore focus to a previously focused element
 * Useful when closing modals/dialogs
 */
export class FocusManager {
  constructor() {
    this.previouslyFocused = null;
  }

  save() {
    this.previouslyFocused = document.activeElement;
  }

  restore() {
    if (this.previouslyFocused && this.previouslyFocused.focus) {
      this.previouslyFocused.focus();
    }
    this.previouslyFocused = null;
  }
}

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 * @param {string} politeness - 'polite' or 'assertive'
 */
export function announce(message, politeness = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', politeness);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Check if element is visible on screen
 * @param {HTMLElement} element
 * @returns {boolean}
 */
export function isElementVisible(element) {
  if (!element) return false;

  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Scroll element into view smoothly
 * @param {HTMLElement} element
 * @param {Object} options
 */
export function scrollIntoView(element, options = {}) {
  if (!element) return;

  const defaultOptions = {
    behavior: 'smooth',
    block: 'nearest',
    inline: 'nearest',
    ...options,
  };

  element.scrollIntoView(defaultOptions);
}

/**
 * Handle keyboard navigation in a list
 * @param {Event} event - Keyboard event
 * @param {Array} items - Array of items or indices
 * @param {number} currentIndex - Currently focused index
 * @param {Function} onSelect - Callback when item is selected (Enter/Space)
 * @returns {number|null} New index or null if no change
 */
export function handleListKeyNavigation(event, items, currentIndex, onSelect) {
  const { key } = event;
  const length = items.length;

  switch (key) {
    case 'ArrowDown':
    case 'Down':
      event.preventDefault();
      return (currentIndex + 1) % length;

    case 'ArrowUp':
    case 'Up':
      event.preventDefault();
      return (currentIndex - 1 + length) % length;

    case 'Home':
      event.preventDefault();
      return 0;

    case 'End':
      event.preventDefault();
      return length - 1;

    case 'Enter':
    case ' ':
    case 'Space':
      event.preventDefault();
      if (onSelect) {
        onSelect(items[currentIndex], currentIndex);
      }
      return null;

    default:
      return null;
  }
}

/**
 * Generate unique ID for accessibility attributes
 * @param {string} prefix
 * @returns {string}
 */
let idCounter = 0;
export function generateId(prefix = 'a11y') {
  return `${prefix}-${++idCounter}`;
}

/**
 * Check color contrast ratio (WCAG AA requires 4.5:1 for normal text)
 * @param {string} color1 - Hex color
 * @param {string} color2 - Hex color
 * @returns {number} Contrast ratio
 */
export function getContrastRatio(color1, color2) {
  const getLuminance = (color) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const [rs, gs, bs] = [r, g, b].map(val =>
      val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG AA standards
 * @param {string} foreground - Hex color
 * @param {string} background - Hex color
 * @param {boolean} largeText - Whether text is large (18pt+ or 14pt+ bold)
 * @returns {boolean}
 */
export function meetsContrastRequirements(foreground, background, largeText = false) {
  const ratio = getContrastRatio(foreground, background);
  const minimumRatio = largeText ? 3 : 4.5; // WCAG AA standards
  return ratio >= minimumRatio;
}

/**
 * Add skip navigation link for keyboard users
 * @param {string} targetId - ID of main content element
 */
export function addSkipLink(targetId = 'main-content') {
  const existing = document.querySelector('.skip-link');
  if (existing) return;

  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.className = 'skip-link';
  skipLink.textContent = 'Hopp til hovedinnhold';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    z-index: 100;
  `;

  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0';
  });

  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });

  document.body.insertBefore(skipLink, document.body.firstChild);
}

/**
 * Debounce function for performance
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Format date for screen readers
 * @param {Date|string} date
 * @param {string} locale
 * @returns {string}
 */
export function formatDateForScreenReader(date, locale = 'nb-NO') {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Create visually hidden text for screen readers
 * @param {string} text
 * @returns {HTMLElement}
 */
export function createScreenReaderText(text) {
  const span = document.createElement('span');
  span.className = 'sr-only';
  span.textContent = text;
  return span;
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user is using keyboard navigation
 * @returns {boolean}
 */
export function isUsingKeyboard() {
  let usingKeyboard = false;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      usingKeyboard = true;
      document.body.classList.add('using-keyboard');
    }
  });

  document.addEventListener('mousedown', () => {
    usingKeyboard = false;
    document.body.classList.remove('using-keyboard');
  });

  return usingKeyboard;
}

// Initialize keyboard detection
if (typeof window !== 'undefined') {
  isUsingKeyboard();
}

export default {
  trapFocus,
  getFirstFocusable,
  FocusManager,
  announce,
  isElementVisible,
  scrollIntoView,
  handleListKeyNavigation,
  generateId,
  getContrastRatio,
  meetsContrastRequirements,
  addSkipLink,
  debounce,
  formatDateForScreenReader,
  createScreenReaderText,
  prefersReducedMotion,
  isUsingKeyboard,
};
