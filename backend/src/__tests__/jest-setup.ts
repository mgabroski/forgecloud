// backend/src/__tests__/jest-setup.ts
import { AppDataSource } from '../config/data-source';

let consoleErrorSpy: jest.SpyInstance;

beforeAll(async () => {
  // 🔇 Silence console.error during tests (AuthError, ValidationError, etc.)
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
    // no-op
  });

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    // ❌ no runMigrations here – migrations are applied explicitly via CLI (migration:run)
  }
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    // ❌ no dropDatabase here – we keep the schema for next test runs
    await AppDataSource.destroy();
  }

  // Restore console.error after test run
  if (consoleErrorSpy) {
    consoleErrorSpy.mockRestore();
  }
});
