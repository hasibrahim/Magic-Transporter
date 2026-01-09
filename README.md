# Magic Transporters – Express + MongoDB Backend API

A professional, scalable **REST API** built with **Express.js**, **TypeScript**, and **MongoDB**, implementing the *Magic Transporters* system with mission management, state transitions, activity logging, **Dependency Injection**, **Docker support**, and **comprehensive E2E testing**.

---

## ✨ Key Features

- 🏗️ **Dependency Injection** with TSyringe
- 🐳 **Docker & Docker Compose** support (production & development)
- 🧪 **Comprehensive E2E Testing** with Jest & Supertest
- 📊 **MongoDB** with Mongoose ODM
- 🔄 **State Machine** for Magic Mover quest states
- 📝 **Activity Logging** with Winston
- ✅ **Validation** with class-validator
- 📖 **API Documentation** with Swagger/OpenAPI
- 🔐 **Security** with Helmet, HPP, CORS
- 🚀 **Production-ready** with multi-stage Docker builds

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 22.x**
- **MongoDB 7+** (or use Docker)
- **Docker & Docker Compose** (optional but recommended)
- npm or yarn

---

### Option 1: Using Docker (Recommended)

#### Production Mode
```bash
# Start all services (MongoDB + App + Mongo Express)
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

#### Development Mode (with hot reload)
```bash
# Start development environment
npm run docker:up:dev

# View logs
npm run docker:logs:dev

# Stop services
npm run docker:down:dev
```

**Access Points:**
- **API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs
- **MongoDB Express**: http://localhost:8081 (admin/admin123)

---

### Option 2: Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment:**
```bash
# Copy the example environment file
cp docker.env.example .env.development.local
```

3. **Configure MongoDB** in `.env.development.local`:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/transporters_dev
MONGODB_DB_NAME=transporters_dev
```

4. **Start development server:**
```bash
npm run dev
```

---

## 🧪 Testing

### Setup Test Environment

**Before running tests**, create a `.env.test.local` file in the project root:

```bash
# Test Environment Configuration
NODE_ENV=test
PORT=3001

# MongoDB Test Configuration - Using same connection as development
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=your_db_name

# Logging
LOG_FORMAT=dev

# CORS
ORIGIN=*
CREDENTIALS=true
```

> **Important:** The test database (`your_db_name`) is separate from your development database to prevent data interference.

### Running Tests

#### E2E Tests
```bash
# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

#### Unit Tests
```bash
# Run unit tests
npm run test:unit
```

#### Run All Tests
```bash
npm run test:all
```

### Test Results Summary

**Latest E2E Test Run:**
- ✅ **31 out of 35 tests passed (88.6% pass rate)**
- 🎯 **Test Suites:** 2 total
- 📊 **Tests:** 31 passed, 4 failed, 35 total

**What's Working:**
- ✅ Database connection with production-like configuration
- ✅ All CRUD operations (Create, Read, Update, Delete)
- ✅ Loading items onto movers
- ✅ Starting and ending missions
- ✅ Unloading items
- ✅ State machine transitions
- ✅ Weight limit validation
- ✅ Most validation scenarios

**Known Issues (4 failing tests):**
- 2 validation edge cases returning 500 instead of 400
- 2 test data cleanup issues between test runs

### Prerequisites
Tests require MongoDB to be running. Either:
- Use Docker: `docker-compose -f docker-compose.dev.yml up mongodb`
- Or run MongoDB locally on port 27017

---

## 📖 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/api-docs

### Main Endpoints

#### Magic Items
- `POST /magic-items` - Create a magic item

#### Magic Movers
- `POST /magic-movers` - Create a magic mover
- `GET /magic-movers` - Get all magic movers
- `GET /magic-movers/most-missions-completed` - Get top performers
- `POST /magic-movers/:id/load` - Load items onto mover
- `POST /magic-movers/:id/start-mission` - Start mission
- `POST /magic-movers/:id/end-mission` - End mission
- `POST /magic-movers/:id/unload` - Unload items

---

## 🏗️ Project Structure

```
.
├── src/
│   ├── container.ts                # DI Container configuration
│   ├── server.ts                   # Application entry point
│   ├── app.ts                      # Express app setup
│   ├── controllers/                # Route controllers (with DI)
│   │   ├── magicItem.controller.ts
│   │   └── magicMover.controller.ts
│   ├── services/                   # Business logic (with DI)
│   │   ├── magicItem.service.ts
│   │   └── magicMover.service.ts
│   ├── database/
│   │   ├── repositories/           # Data access layer (with DI)
│   │   │   ├── MagicItem.repository.ts
│   │   │   ├── MagicMover.repository.ts
│   │   │   └── ActivityLog.repository.ts
│   │   └── schemas/                # Mongoose schemas
│   │       ├── MagicItem.schema.ts
│   │       ├── MagicMover.schema.ts
│   │       └── ActivityLog.schema.ts
│   ├── routes/                     # API routes
│   ├── middlewares/                # Express middlewares
│   ├── dtos/                       # Data transfer objects
│   ├── enums/                      # Enumerations
│   ├── utils/                      # Utility functions
│   └── test/
│       ├── e2e/                    # E2E tests
│       │   ├── magicItem.e2e.test.ts
│       │   └── magicMover.e2e.test.ts
│       └── helpers/                # Test utilities
│           ├── testDatabase.ts
│           ├── testServer.ts
│           ├── testFixtures.ts
│           └── setup.ts
├── Dockerfile.prod                 # Production Docker image
├── Dockerfile.dev                  # Development Docker image
├── docker-compose.yml              # Production orchestration
├── docker-compose.dev.yml          # Development orchestration
├── jest.config.js                  # Unit test configuration
├── jest.e2e.config.js             # E2E test configuration
└── swagger.yaml                    # API documentation
```

---

## 🐳 Docker

### Docker Commands

```bash
# Build production image
npm run docker:build

# Build development image
npm run docker:build:dev

# Start production environment
npm run docker:up

# Start development environment
npm run docker:up:dev

# View application logs
npm run docker:logs

# Restart application
npm run docker:restart

# Stop and remove all containers
npm run docker:down

# Clean up (remove volumes and prune)
npm run docker:clean
```

### Docker Environment Variables

See `docker.env.example` for all available configuration options.

---

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run test:e2e     # Run E2E tests
npm run test:unit    # Run unit tests
npm run test:all     # Run all tests
npm run test:coverage # Generate coverage report
```

---

## 📚 Additional Documentation

- [Dependency Injection Guide](docs/DEPENDENCY_INJECTION.md) - TSyringe setup and usage
- [Testing Guide](docs/TESTING.md) - E2E and unit testing strategies
- [Docker Guide](docs/DOCKER.md) - Docker setup and deployment

---

## 🏛️ Architecture

### Dependency Injection

This project uses **TSyringe** for dependency injection, providing:
- Loose coupling between components
- Easy testing with mock implementations
- Better code organization and maintainability

Example:
```typescript
@injectable()
export class MagicItemService {
    constructor(
        @inject(MagicItemRepository) private magicItemRepository: MagicItemRepository
    ) {}
    
    async create(data: CreateMagicItemDto): Promise<IMagicItem> {
        return await this.magicItemRepository.create(data);
    }
}
```

### State Machine

Magic Movers follow a strict state machine:
- **RESTING** → **LOADING** (load items)
- **LOADING** → **ON_MISSION** (start mission)
- **LOADING** → **RESTING** (unload items)
- **ON_MISSION** → **RESTING** (end mission)

Invalid transitions are rejected with detailed error messages.

---

## 🔐 Environment Variables

```env
# Application
NODE_ENV=development|production|test
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/your-database
MONGODB_DB_NAME=your-database

# Logging
LOG_FORMAT=combined|dev

# CORS
ORIGIN=*
CREDENTIALS=true
```

---

## 🧪 Testing Strategy

### E2E Tests
- Test complete request/response cycles
- Test state transitions and business logic
- Test error handling and validation
- Use separate test database

### Test Coverage
- Controllers: Request validation, response formatting
- Services: Business logic, state management
- Repositories: Data persistence, queries
- Integration: Full workflow testing

---

## 🚀 Deployment

### Production Checklist

1. ✅ Set environment variables
2. ✅ Configure MongoDB connection
3. ✅ Build Docker image: `npm run docker:build`
4. ✅ Run with Docker Compose: `npm run docker:up`
5. ✅ Monitor logs: `npm run docker:logs`

### Performance

- Multi-stage Docker builds for optimized image size
- Non-root user for security
- Health checks for container orchestration
- Connection pooling for MongoDB
- Efficient logging with Winston

---

## 📝 License

ISC

---

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass: `npm run test:all`
5. Submit a pull request

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
docker ps

# View MongoDB logs
docker logs transporters_mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Test Failures

**Missing Environment Configuration:**
```bash
# If tests fail with "MONGODB_URI is not defined"
# Create .env.test.local file in project root:
cp env.test.template .env.test.local

# Then edit .env.test.local with your MongoDB connection details
```

**Database Connection Issues:**
```bash
# Ensure test database is accessible
# Check your .env.test.local configuration

# Clear test database
docker-compose -f docker-compose.dev.yml down -v

# Or manually drop the test database
mongosh
> use your_db_name
> db.dropDatabase()
```

### Docker Issues
```bash
# Clean up Docker resources
npm run docker:clean

# Rebuild from scratch
docker-compose build --no-cache
```

---

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using TypeScript, Express, MongoDB, and Docker**
