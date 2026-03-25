/**
 * Error Reporter Utility
 *
 * Sentry-ready error tracking with fallback to console logging.
 *
 * To enable Sentry:
 *   1. npm install @sentry/react
 *   2. Set REACT_APP_SENTRY_DSN in .env
 *   3. Errors will automatically be sent to Sentry
 */

const IS_DEV = process.env.NODE_ENV === 'development';
const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN;

// Lazy-load Sentry to avoid bundle size impact when not configured
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Sentry: any = null;
let sentryInitialized = false;

// Use Function constructor to avoid TypeScript checking the module path
// This allows the code to work whether or not @sentry/react is installed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dynamicImport = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadSentry(): Promise<any> {
  if (!SENTRY_DSN) return null;
  if (Sentry) return Sentry;

  try {
    Sentry = await dynamicImport('@sentry/react');
    return Sentry;
  } catch {
    // Sentry package not installed
    return null;
  }
}

interface ErrorContext {
  /** Where the error occurred */
  source?: string;
  /** User-facing action that triggered error */
  action?: string;
  /** Additional metadata */
  extra?: Record<string, unknown>;
}

/**
 * Capture and report an exception
 */
export function captureException(error: Error, context?: ErrorContext): void {
  // Always log in DEV
  if (IS_DEV) {
    console.error('[ErrorReporter] Exception:', {
      message: error.message,
      stack: error.stack,
      ...context,
    });
  }

  // Send to Sentry if configured
  if (Sentry && sentryInitialized) {
    Sentry.captureException(error, {
      extra: context,
      tags: {
        source: context?.source,
        action: context?.action,
      },
    });
  }
}

/**
 * Capture and report a message (non-error event)
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  if (IS_DEV) {
    const logFn = level === 'error' ? console.error : level === 'warning' ? console.warn : console.log;
    logFn(`[ErrorReporter] ${level.toUpperCase()}:`, message);
  }

  // Send to Sentry if configured
  if (Sentry && sentryInitialized) {
    Sentry.captureMessage(message, level);
  }
}

/**
 * Capture API errors with structured context
 */
export function captureAPIError(
  endpoint: string,
  status: number,
  errorMessage: string
): void {
  if (IS_DEV) {
    console.error('[ErrorReporter] API Error:', {
      endpoint,
      status,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    });
  }

  // Send to Sentry if configured
  if (Sentry && sentryInitialized) {
    Sentry.captureMessage(`API Error: ${endpoint}`, {
      level: status >= 500 ? 'error' : 'warning',
      extra: {
        endpoint,
        status,
        errorMessage,
        timestamp: new Date().toISOString(),
      },
      tags: {
        type: 'api_error',
        status: String(status),
      },
    });
  }
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string; role?: string } | null): void {
  if (Sentry && sentryInitialized) {
    if (user) {
      Sentry.setUser({ id: user.id, email: user.email, role: user.role });
    } else {
      Sentry.setUser(null);
    }
  }
}

/**
 * Initialize error reporting (call once at app startup)
 */
export async function initErrorReporter(): Promise<void> {
  // Try to load and initialize Sentry
  const sentry = await loadSentry();
  if (sentry && SENTRY_DSN) {
    sentry.init({
      dsn: SENTRY_DSN,
      environment: IS_DEV ? 'development' : 'production',
      tracesSampleRate: IS_DEV ? 1.0 : 0.2,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        sentry.browserTracingIntegration(),
        sentry.replayIntegration(),
      ],
    });
    sentryInitialized = true;
    if (IS_DEV) {
      console.log('[ErrorReporter] Sentry initialized');
    }
  }

  // Global unhandled error handler
  window.onerror = (message, source, lineno, colno, error) => {
    captureException(error || new Error(String(message)), {
      source: `${source}:${lineno}:${colno}`,
      action: 'unhandled_error',
    });
  };

  // Unhandled promise rejection handler
  window.onunhandledrejection = (event) => {
    const error = event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));

    captureException(error, {
      action: 'unhandled_promise_rejection',
    });
  };

  if (IS_DEV && !sentryInitialized) {
    console.log('[ErrorReporter] Initialized (console-only mode - set REACT_APP_SENTRY_DSN to enable Sentry)');
  }
}
