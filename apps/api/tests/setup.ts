/**
 * Jest test setup
 * Runs before all tests to configure the test environment
 */

// Mock exceljs to avoid ESM/uuid issues with Jest
jest.mock('exceljs', () => ({
  Workbook: jest.fn().mockImplementation(() => ({
    addWorksheet: jest.fn().mockReturnValue({
      columns: [],
      addRow: jest.fn(),
      getRow: jest.fn().mockReturnValue({ font: {}, fill: {} }),
    }),
    xlsx: {
      writeBuffer: jest.fn().mockResolvedValue(Buffer.from('')),
    },
  })),
}));

// Set test environment variables BEFORE any imports
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

// JWT secrets (must be minimum 32 characters)
process.env.JWT_ACCESS_SECRET = 'test-jwt-access-secret-key-for-integration-tests-12345';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-integration-tests-12345';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';

// Set database URL for tests (use a separate test database)
// Uses the same credentials as the dev database but different database name
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://iup_golf:dev_password@localhost:5432/iup_golf_test';
}

// Set Redis config for tests (use a different DB number)
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.REDIS_DB = '1';
process.env.REDIS_URL = 'redis://localhost:6379/1';

// Set S3/MinIO config for tests
process.env.S3_ENDPOINT = 'http://localhost:9000';
process.env.S3_BUCKET = 'iup-golf-test';
process.env.S3_REGION = 'eu-north-1';
process.env.S3_ACCESS_KEY_ID = 'minioadmin';
process.env.S3_SECRET_ACCESS_KEY = 'minioadmin';
process.env.S3_FORCE_PATH_STYLE = 'true';

// Default tenant for tests (use a fixed UUID for tests - same as seeded demo data)
process.env.DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';
process.env.DEFAULT_TENANT_NAME = 'AK Golf Academy';
process.env.DEFAULT_TENANT_SLUG = 'ak-golf-academy';

// Disable email sending in tests
process.env.SMTP_HOST = '';
process.env.EMAIL_ENABLED = 'false';

// Increase test timeout for integration tests
jest.setTimeout(30000);

// Suppress console output during tests (comment out for debugging)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };

// Global test lifecycle hooks
beforeAll(async () => {
  // Any global setup needed before all tests
  // The test database should already be seeded via prisma db seed
});

afterAll(async () => {
  // Global cleanup after all tests
  // Individual test files should clean up their own data
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
