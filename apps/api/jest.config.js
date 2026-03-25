module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
      isolatedModules: true, // Skip type-checking for faster tests
    }],
    // Transform ESM modules that Jest can't parse by default
    '^.+\\.js$': 'babel-jest',
  },
  // Transform uuid and other ESM modules in node_modules (works with pnpm)
  transformIgnorePatterns: [
    'node_modules/(?!(\\.pnpm/(uuid|exceljs)@))',
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/server.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  moduleNameMapper: {
    // Prisma client resolution for pnpm
    '^@prisma/client$': '<rootDir>/../../node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client',
    // Source code aliases
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/api/(.*)$': '<rootDir>/src/api/$1',
    '^@/core/(.*)$': '<rootDir>/src/core/$1',
    '^@/domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@/middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@/plugins/(.*)$': '<rootDir>/src/plugins/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/config/(.*)$': '<rootDir>/src/config/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    // Test helper aliases
    '^@test/(.*)$': '<rootDir>/tests/$1',
    '^@test/helpers$': '<rootDir>/tests/helpers/index.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
  // Run tests sequentially to avoid database conflicts
  maxWorkers: 1,
  // Fail fast on first error (useful for CI)
  bail: false,
  // Verbose output
  verbose: true,
  // Clear mocks between tests
  clearMocks: true,
  // Restore mocks after each test
  restoreMocks: true,
  // Force exit after tests complete (handles open handles)
  forceExit: true,
  // Detect open handles (helps debug hanging tests)
  detectOpenHandles: false,
};
