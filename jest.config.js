const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/test/unit/**/*.test.ts', '**/test/**/*.spec.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/test/**',
    '!src/**/*.interface.ts',
    '!src/**/*.dto.ts',
    '!src/types/**',
  ],
  coverageDirectory: 'coverage/unit',
  verbose: true,
};
