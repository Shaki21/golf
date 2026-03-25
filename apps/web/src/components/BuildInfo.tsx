/**
 * BuildInfo - Production build verification component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 *
 * FAILSAFE: Always logs build SHA to console and injects hidden DOM marker.
 * Used to verify which commit is actually running in production vs cache.
 *
 * Environment variables (set at build time via Dockerfile):
 * - REACT_APP_BUILD_SHA: Git commit SHA from Railway (RAILWAY_GIT_COMMIT_SHA)
 * - REACT_APP_BUILD_BRANCH: Git branch name (RAILWAY_GIT_BRANCH)
 * - REACT_APP_BUILD_DATE: Build timestamp
 *
 * Verification methods:
 * 1. Console: Look for "BUILD: <sha>" message
 * 2. DOM: document.querySelector('[data-build]').dataset.build
 * 3. Window: window.__BUILD_INFO__
 * 4. Meta tag: document.querySelector('meta[name="build"]').content
 */

import { useEffect } from 'react';

interface BuildInfoProps {
  /** Show visual indicator in corner (default: only in development) */
  showBadge?: boolean;
}

// Build info from environment (baked in at build time)
export const BUILD_INFO = {
  sha: process.env.REACT_APP_BUILD_SHA || 'local',
  branch: process.env.REACT_APP_BUILD_BRANCH || 'local',
  date: process.env.REACT_APP_BUILD_DATE || new Date().toISOString(),
  shortSha: (process.env.REACT_APP_BUILD_SHA || 'local').slice(0, 7),
};

/**
 * Injects meta tag into document head for build verification
 */
function injectBuildMeta() {
  // Remove existing meta if present (prevents duplicates on HMR)
  const existing = document.querySelector('meta[name="build"]');
  if (existing) existing.remove();

  // Create and inject meta tag
  const meta = document.createElement('meta');
  meta.name = 'build';
  meta.content = BUILD_INFO.sha;
  document.head.appendChild(meta);
}

/**
 * Logs build info to console on mount.
 * Injects hidden DOM markers for verification.
 * Optionally renders a small badge in the corner.
 */
export function BuildInfo({ showBadge = false }: BuildInfoProps) {
  useEffect(() => {
    // === FAILSAFE LOG: Always log in specific format for easy grep ===
    console.log(`BUILD: ${BUILD_INFO.sha}`);

    // Additional styled logging for better visibility
    console.log(
      '%c🏌️ TIER Golf',
      'color: #10456A; font-weight: bold; font-size: 12px;'
    );
    console.log(
      `%cCommit: %c${BUILD_INFO.sha}`,
      'color: #8E8E93;',
      'color: #4A7C59; font-family: monospace;'
    );
    console.log(
      `%cBranch: %c${BUILD_INFO.branch}`,
      'color: #8E8E93;',
      'color: #2C5F7F; font-family: monospace;'
    );
    console.log(
      `%cBuilt:  %c${BUILD_INFO.date}`,
      'color: #8E8E93;',
      'color: #D4A84B; font-family: monospace;'
    );

    // Set on window for easy DevTools access
    (window as any).__BUILD_INFO__ = BUILD_INFO;

    // Inject meta tag into head
    injectBuildMeta();
  }, []);

  // Always render hidden DOM marker (even if badge is disabled)
  return (
    <>
      {/* Hidden DOM marker - always present for verification */}
      <div
        data-build={BUILD_INFO.sha}
        data-branch={BUILD_INFO.branch}
        data-build-date={BUILD_INFO.date}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      {/* Optional visible badge */}
      {showBadge && (
        <div
          style={{
            position: 'fixed',
            bottom: '8px',
            right: '8px',
            padding: '4px 8px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'var(--tier-success-light)',
            fontFamily: 'monospace',
            fontSize: '10px',
            borderRadius: '4px',
            zIndex: 9999,
            pointerEvents: 'none',
            opacity: 0.8,
          }}
          title={`Branch: ${BUILD_INFO.branch}\nBuilt: ${BUILD_INFO.date}\nSHA: ${BUILD_INFO.sha}`}
        >
          {BUILD_INFO.shortSha}
        </div>
      )}
    </>
  );
}

export default BuildInfo;
