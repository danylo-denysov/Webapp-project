export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  moduleFileExtensions: ['ts', 'js', 'json'],
  testPathIgnorePatterns: ['<rootDir>/test/e2e'],
  coverageDirectory: 'coverage/backend',
  collectCoverageFrom: ['src/**/*.ts', '!src/main.ts', '!src/**/entities/**'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
};
