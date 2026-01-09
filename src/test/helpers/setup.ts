import { testDatabase } from './testDatabase';

/**
 * Global test setup
 * Runs before all tests
 */
beforeAll(async () => {
    // Set NODE_ENV to test
    process.env.NODE_ENV = 'test';

    // Connect to test database
    await testDatabase.connect();
});

/**
 * Clean up after each test
 */
afterEach(async () => {
    // Clear all collections after each test
    await testDatabase.clearDatabase();
});

/**
 * Global test teardown
 * Runs after all tests
 */
afterAll(async () => {
    // Drop test database and disconnect
    await testDatabase.dropDatabase();
    await testDatabase.disconnect();

    // Give time for connections to close
    await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

