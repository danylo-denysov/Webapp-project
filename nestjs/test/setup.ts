// Jest setup file for E2E tests
// This file runs before each test suite

// Increase timeout for E2E tests (default is 5000ms)
jest.setTimeout(30000);

// Mock console methods to reduce noise in test output (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
// };
