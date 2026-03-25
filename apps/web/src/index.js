import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { initializeTheme } from './theme/theme';
import { initErrorReporter } from './utils/errorReporter';
import { validateEnv } from './utils/envValidation';

// =============================================================================
// BUILD IDENTITY - Always log and expose for debugging deploy issues
// =============================================================================
const BUILD_SHA = process.env.REACT_APP_BUILD_SHA || 'local';
const BUILD_BRANCH = process.env.REACT_APP_BUILD_BRANCH || 'local';
const BUILD_DATE = process.env.REACT_APP_BUILD_DATE || new Date().toISOString();

// Log build info on every page load (critical for debugging stale UI)
console.info('='.repeat(50));
console.info('BUILD:', BUILD_SHA);
console.info('BRANCH:', BUILD_BRANCH);
console.info('DATE:', BUILD_DATE);
console.info('='.repeat(50));

// Inject build marker into DOM for easy inspection
const injectBuildMarker = () => {
  // Add meta tag
  const meta = document.createElement('meta');
  meta.name = 'build';
  meta.content = BUILD_SHA;
  document.head.appendChild(meta);

  // Add hidden div for easy DOM inspection
  const marker = document.createElement('div');
  marker.id = 'build-info';
  marker.dataset.sha = BUILD_SHA;
  marker.dataset.branch = BUILD_BRANCH;
  marker.dataset.date = BUILD_DATE;
  marker.style.display = 'none';
  document.body.appendChild(marker);
};

// =============================================================================
// INITIALIZATION
// =============================================================================

// Initialize error reporting (global handlers)
initErrorReporter();

// Validate environment variables
validateEnv();

// Initialize theme before React renders to prevent flash
initializeTheme();

// Inject build markers after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectBuildMarker);
} else {
  injectBuildMarker();
}

// =============================================================================
// RENDER APP
// =============================================================================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// =============================================================================
// SERVICE WORKER REGISTRATION
// =============================================================================
// NOTE: Service Worker is DISABLED by default in production.
// To enable PWA features, set REACT_APP_ENABLE_PWA=true
//
// When disabled, this will:
// 1. Unregister any existing service workers
// 2. Clear all caches
// 3. Ensure fresh content on every page load
//
// When enabled, the service worker uses BUILD_SHA-scoped caches
// to ensure each deploy gets fresh assets.
// =============================================================================

serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log('[App] PWA ready for offline use');
  },
  onUpdate: (registration) => {
    console.log('[App] New version detected - auto-updating...');
    // Force immediate activation of new service worker
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    // Reload to get new assets
    window.location.reload();
  },
});
