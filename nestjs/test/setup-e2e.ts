// E2E Test Setup
// This file is run before all E2E tests

// Disable email sending during E2E tests
process.env.DISABLE_EMAILS = 'true';

// Set test environment flag
process.env.NODE_ENV = 'test';
