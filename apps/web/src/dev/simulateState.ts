/**
 * ============================================================
 * DEV ONLY — NO EFFECT IN PRODUCTION
 * ============================================================
 * State simulation helper for testing UI states.
 * Usage: Add ?state=loading|error|empty to any page URL.
 *
 * This module is completely disabled in production builds
 * via the IS_DEV check below.
 * ============================================================
 */

export type SimState = 'loading' | 'error' | 'empty' | null;

const IS_DEV = process.env.NODE_ENV === 'development';

/**
 * Parses querystring and returns simulated state if in DEV mode.
 * @param search - location.search string (e.g., "?state=loading")
 * @returns SimState or null
 */
export function getSimState(search: string): SimState {
  if (!IS_DEV) {
    return null;
  }

  const params = new URLSearchParams(search);
  const state = params.get('state');

  if (state === 'loading' || state === 'error' || state === 'empty') {
    return state;
  }

  return null;
}
