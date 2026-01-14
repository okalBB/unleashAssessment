module.exports = {
  // Use ts-jest preset for TypeScript support
  preset: 'ts-jest/presets/default-esm',
  // Test environment
  testEnvironment: 'node',
  // Root directory for tests
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  // Test file patterns
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  // Collect coverage from source files
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  // Coverage directory
  coverageDirectory: 'coverage',
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html'],
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  // Module file extensions
  moduleFileExtensions: ['ts', 'js'],
  // Ignore node_modules
  testPathIgnorePatterns: ['/node_modules/'],
  // Verbose output
  verbose: true,
}