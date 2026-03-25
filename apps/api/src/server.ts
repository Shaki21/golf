import { startServer } from './app';
import { logger } from './utils/logger';
import { startDataGolfSyncJob } from './jobs/datagolf-sync.job';

/**
 * Format error for logging - handles all error types
 */
function formatError(error: unknown): { message: string; stack?: string; cause?: unknown } {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      cause: (error as NodeJS.ErrnoException).cause,
    };
  }
  return { message: String(error) };
}

/**
 * Server entry point with phase tracking
 */
async function main(): Promise<void> {
  let phase = 'init';

  try {
    phase = 'starting';
    logger.info('🚀 Starting IUP Golf Academy API...');

    phase = 'buildAndStart';
    const app = await startServer();

    phase = 'getAddress';
    const address = app.server.address();
    const port = typeof address === 'string' ? 3000 : address?.port || 3000;

    phase = 'startCronJobs';
    startDataGolfSyncJob();

    phase = 'complete';
    logger.info(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║        IUP Golf Academy API - Ready! 🏌️              ║
║                                                       ║
║  📚 Documentation: http://localhost:${port}/docs      ║
║  ❤️  Health Check: http://localhost:${port}/health   ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);
  } catch (error) {
    const errorDetails = formatError(error);

    // Log to stderr for container visibility
    console.error('═══════════════════════════════════════════════════════');
    console.error(`❌ Fatal error during startup (phase: ${phase})`);
    console.error('═══════════════════════════════════════════════════════');
    console.error('Error message:', errorDetails.message);
    if (errorDetails.stack) {
      console.error('Stack trace:');
      console.error(errorDetails.stack);
    }
    if (errorDetails.cause) {
      console.error('Cause:', errorDetails.cause);
    }
    console.error('═══════════════════════════════════════════════════════');

    // Also log via pino for structured logging
    logger.error({
      err: error,
      phase,
      errorMessage: errorDetails.message,
      errorStack: errorDetails.stack,
    }, `❌ Fatal error during startup (phase: ${phase})`);

    process.exit(1);
  }
}

// Start the server
main();
