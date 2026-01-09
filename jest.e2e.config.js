const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/test/e2e/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  setupFilesAfterEnv: ['<rootDir>/src/test/helpers/setup.ts'],
  testTimeout: 30000, // E2E tests may take longer
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/test/**',
    '!src/**/*.interface.ts',
    '!src/**/*.dto.ts',
    '!src/types/**',
  ],
  coverageDirectory: 'coverage/e2e',
  verbose: true,
};

