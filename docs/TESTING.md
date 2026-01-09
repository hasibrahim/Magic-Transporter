# Testing Guide

Comprehensive guide to testing the Magic Transporters API with Jest and Supertest.

---

## Table of Contents

- [Overview](#overview)
- [Test Types](#test-types)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Utilities](#test-utilities)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)

---

## Overview

This project uses:
- **Jest**: Testing framework
- **Supertest**: HTTP assertion library for E2E tests
- **ts-jest**: TypeScript support for Jest
- **MongoDB Memory Server** alternative: Real test database

### Test Structure

```
src/test/
├── e2e/                          # End-to-end tests
│   ├── magicItem.e2e.test.ts
│   └── magicMover.e2e.test.ts
├── unit/                         # Unit tests (to be added)
└── helpers/                      # Test utilities
    ├── testDatabase.ts           # Database management
    ├── testServer.ts             # Server setup
    ├── testFixtures.ts           # Test data
    └── setup.ts                  # Global test setup
```

---

## Test Types

### 1. E2E (End-to-End) Tests

Test the entire application stack including:
- HTTP requests/responses
- Database operations
- Business logic
- State transitions
- Validation

**Location:** `src/test/e2e/`

**Example:**
```typescript
it('should create a magic item', async () => {
    const response = await request(app)
        .post('/magic-items')
        .send({ name: 'Phoenix Feather', weight: 0.5 })
        .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('_id');
});
```

### 2. Unit Tests

Test individual components in isolation:
- Services
- Repositories
- Utilities
- Validation

**Location:** `src/test/unit/` (to be implemented)

**Example:**
```typescript
describe('MagicItemService', () => {
    it('should create item through repository', async () => {
        const mockRepo = { create: jest.fn().mockResolvedValue(mockItem) };
        const service = new MagicItemService(mockRepo);
        
        const result = await service.create(itemData);
        
        expect(mockRepo.create).toHaveBeenCalled();
    });
});
```

---

## Setup

### 1. Test Configuration

#### E2E Tests (`jest.e2e.config.js`)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/e2e/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/test/helpers/setup.ts'],
  testTimeout: 30000,
};
```

#### Unit Tests (`jest.config.js`)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/unit/**/*.test.ts'],
  testTimeout: 10000,
};
```

### 2. Test Environment

Create `.env.test` (or copy from `env.test.template`):

```env
NODE_ENV=test
PORT=3001
MONGODB_TEST_URI=mongodb://admin:admin123@localhost:27017
MONGODB_TEST_DB_NAME=transporters_test
LOG_FORMAT=dev
```

### 3. Test Database

**Option A: Use Docker**
```bash
docker-compose -f docker-compose.dev.yml up mongodb
```

**Option B: Local MongoDB**
```bash
mongod --port 27017
```

---

## Running Tests

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Run specific test file
npm run test:e2e -- magicItem.e2e.test.ts
```

### Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run all tests
npm run test:all
```

### Test Output

```
PASS src/test/e2e/magicItem.e2e.test.ts
  Magic Item E2E Tests
    POST /magic-items
      Success Cases
        ✓ should create a magic item with valid data (123ms)
        ✓ should create multiple magic items (98ms)
      Validation Error Cases
        ✓ should return 400 when name is empty (45ms)

Test Suites: 2 passed, 2 total
Tests:       24 passed, 24 total
Time:        5.234s
```

---

## Writing Tests

### E2E Test Template

```typescript
import request from 'supertest';
import { testServer } from '../helpers/testServer';
import { testFixtures } from '../helpers/testFixtures';

describe('Feature E2E Tests', () => {
    const app = testServer.getServer();
    const baseUrl = '/api/endpoint';

    describe('POST /api/endpoint', () => {
        it('should handle success case', async () => {
            const data = testFixtures.validData();

            const response = await request(app)
                .post(baseUrl)
                .send(data)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject(data);
        });

        it('should handle validation errors', async () => {
            const response = await request(app)
                .post(baseUrl)
                .send({})
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });
});
```

### Test Organization

#### 1. Describe Blocks

Use nested describe blocks for organization:

```typescript
describe('MagicMover E2E Tests', () => {
    describe('POST /magic-movers/:id/load', () => {
        describe('Success Cases', () => {
            it('should load items', ...);
        });
        
        describe('Error Cases', () => {
            it('should reject invalid weight', ...);
        });
    });
});
```

#### 2. Test Naming

Use descriptive names that explain what is being tested:

✅ **Good:**
```typescript
it('should return 400 when weight is negative', ...);
it('should transition from LOADING to ON_MISSION', ...);
```

❌ **Bad:**
```typescript
it('test 1', ...);
it('should work', ...);
```

#### 3. Arrange-Act-Assert Pattern

```typescript
it('should create a magic item', async () => {
    // Arrange
    const itemData = { name: 'Test', weight: 5 };

    // Act
    const response = await request(app)
        .post('/magic-items')
        .send(itemData);

    // Assert
    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe(itemData.name);
});
```

---

## Test Utilities

### 1. Test Database (`testDatabase.ts`)

```typescript
import { testDatabase } from '../helpers/testDatabase';

// Connect to test database
await testDatabase.connect();

// Clear all collections
await testDatabase.clearDatabase();

// Drop database
await testDatabase.dropDatabase();

// Disconnect
await testDatabase.disconnect();
```

**Automatic Setup:**
The global setup file handles this automatically:

```typescript
// beforeAll: connects to DB
// afterEach: clears collections
// afterAll: drops DB and disconnects
```

### 2. Test Server (`testServer.ts`)

```typescript
import { testServer } from '../helpers/testServer';

const app = testServer.getServer();

// Use with supertest
await request(app).get('/').expect(200);
```

### 3. Test Fixtures (`testFixtures.ts`)

Pre-defined test data:

```typescript
import { magicItemFixtures, magicMoverFixtures } from '../helpers/testFixtures';

// Get test data
const item = magicItemFixtures.validItem1();
const mover = magicMoverFixtures.validMover1();

// Create multiple items
const items = createMultipleItems(5);
```

### 4. Helper Functions

Create custom helpers for common operations:

```typescript
// Helper to create a magic item
const createMagicItem = async (data = magicItemFixtures.validItem1()) => {
    const response = await request(app)
        .post('/magic-items')
        .send(data)
        .expect(201);
    return response.body.data;
};

// Use in tests
it('should load items', async () => {
    const item1 = await createMagicItem();
    const item2 = await createMagicItem();
    // ... test loading
});
```

---

## Best Practices

### 1. Test Independence

Each test should be independent:

✅ **Good:**
```typescript
it('should create item', async () => {
    const item = await createMagicItem();
    expect(item).toBeDefined();
});

it('should load items', async () => {
    const mover = await createMagicMover();
    const item = await createMagicItem();
    // ...
});
```

❌ **Bad:**
```typescript
let sharedItem; // Don't share state

it('should create item', async () => {
    sharedItem = await createMagicItem();
});

it('should use item', async () => {
    // Depends on previous test
    await loadItem(sharedItem);
});
```

### 2. Use Descriptive Assertions

```typescript
// ✅ Good
expect(response.body.data.state).toBe(MagicMoverState.LOADING);
expect(response.body.data.items).toHaveLength(2);

// ❌ Less clear
expect(response.body.data.state).toBe('loading');
expect(response.body.data.items.length).toBe(2);
```

### 3. Test Error Cases

Always test both success and error scenarios:

```typescript
describe('POST /magic-items', () => {
    it('should create with valid data', ...);
    it('should reject empty name', ...);
    it('should reject negative weight', ...);
    it('should reject missing fields', ...);
});
```

### 4. Clean Up After Tests

The global setup handles database cleanup, but clean up other resources:

```typescript
afterEach(() => {
    jest.clearAllMocks();
});

afterAll(async () => {
    await testDatabase.disconnect();
    // Close other connections
});
```

### 5. Use Test Coverage

```bash
npm run test:coverage
```

Aim for:
- **Lines**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%

### 6. Avoid Testing Implementation Details

Test behavior, not implementation:

✅ **Good:**
```typescript
it('should create a magic item', async () => {
    const response = await request(app)
        .post('/magic-items')
        .send({ name: 'Test', weight: 5 });
    
    expect(response.status).toBe(201);
});
```

❌ **Bad:**
```typescript
it('should call repository.create', async () => {
    // Testing internal implementation
    expect(mockRepository.create).toHaveBeenCalled();
});
```

### 7. Parallel vs Sequential Execution

E2E tests run sequentially (`--runInBand`) to avoid database conflicts:

```json
{
  "test:e2e": "jest --config jest.e2e.config.js --runInBand"
}
```

Unit tests can run in parallel:

```json
{
  "test:unit": "jest --config jest.config.js"
}
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017
        env:
          MONGO_INITDB_ROOT_USERNAME: admin
          MONGO_INITDB_ROOT_PASSWORD: admin123
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '22'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:all
        env:
          NODE_ENV: test
          MONGODB_TEST_URI: mongodb://admin:admin123@localhost:27017
          MONGODB_TEST_DB_NAME: transporters_test
      
      - name: Generate coverage
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

---

## Troubleshooting

### Tests Fail with "MongoDB not connected"

**Solution:**
1. Ensure MongoDB is running: `docker-compose -f docker-compose.dev.yml up mongodb`
2. Check `.env.test` configuration
3. Verify `MONGODB_TEST_URI` is correct

### Tests Timeout

**Problem:** E2E tests take too long.

**Solutions:**
1. Increase timeout: `testTimeout: 30000` in jest config
2. Check database performance
3. Optimize test data creation

### Random Test Failures

**Problem:** Tests fail intermittently.

**Causes:**
1. Shared state between tests
2. Race conditions
3. Database not cleaned properly

**Solutions:**
1. Ensure `afterEach` clears database
2. Make tests independent
3. Use `--runInBand` for E2E tests

### "Container not registered"

**Problem:** DI container errors in tests.

**Solution:** Ensure container is set up:

```typescript
import { setupContainer } from '../../container';

beforeAll(() => {
    setupContainer();
});
```

---

## Coverage Reports

### Viewing Coverage

After running `npm run test:coverage`:

```bash
# Open HTML report
open coverage/e2e/lcov-report/index.html
```

### Coverage Thresholds

Set minimum coverage in `jest.e2e.config.js`:

```javascript
module.exports = {
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 75,
      functions: 80,
      statements: 80
    }
  }
};
```

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Need Help?** Open an issue on GitHub!

