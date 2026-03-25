/**
 * Environment Variable Validation
 *
 * Runs on app startup to warn about missing/invalid env vars.
 * DEV: Shows warnings in console
 * PROD: Fails gracefully, logs warning
 */

const IS_DEV = process.env.NODE_ENV === 'development';

interface EnvConfig {
  apiUrl: string;
  isDefault: boolean;
}

/**
 * Get the configured API URL with validation
 */
export function getEnvConfig(): EnvConfig {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';
  const isDefault = !process.env.REACT_APP_API_URL;

  return {
    apiUrl,
    isDefault,
  };
}

/**
 * Validate environment and log warnings
 * Call once at app startup
 */
export function validateEnv(): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const config = getEnvConfig();

  // Check if using default localhost API URL in production
  if (!IS_DEV && config.isDefault) {
    warnings.push(
      'REACT_APP_API_URL is not set. Using default localhost:4000. ' +
      'This will not work in production deployment.'
    );
  }

  // Log warnings
  warnings.forEach((warning) => {
    console.warn('[EnvValidation]', warning);
  });

  if (IS_DEV && warnings.length === 0) {
    console.log('[EnvValidation] OK - API URL:', config.apiUrl);
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

/**
 * Check if API is reachable
 * Useful for showing startup errors
 */
export async function checkApiHealth(): Promise<boolean> {
  const config = getEnvConfig();
  // Health endpoint is at /health, not /api/v1/health
  const healthUrl = config.apiUrl.replace(/\/api\/v1$/, '') + '/health';

  try {
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch {
    return false;
  }
}
