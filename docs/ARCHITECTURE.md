# Architecture Documentation

This document describes the architecture of the Express + MongoDB backend application.

## 📁 Project Structure

```
src/
├── app.ts                 # Express app initialization
├── server.ts              # Server entry point
├── config/                # Configuration files
│   └── index.ts          # Environment variables
├── database/              # Database configuration
│   └── connection.ts     # MongoDB connection setup
├── models/                # Mongoose models/schemas
│   ├── Base.model.ts     # Base model class
│   └── index.ts          # Model exports
├── services/              # Business logic layer
│   └── base.service.ts   # Base service with CRUD operations
├── controllers/           # Request handlers
│   └── base.controller.ts # Base controller with standard endpoints
├── routes/                # Route definitions
│   ├── index.route.ts    # Root route example
│   └── ...               # Other route files
├── middlewares/           # Express middlewares
│   └── error.middleware.ts # Global error handler
├── exceptions/            # Custom exceptions
│   └── HttpException.ts  # HTTP exception class
├── utils/                 # Utility functions
│   ├── logger.ts         # Winston logger setup
│   ├── response.util.ts  # API response utilities
│   ├── pagination.util.ts # Pagination helper
│   └── validateEnv.ts    # Environment validation
├── types/                 # TypeScript type definitions
│   ├── common.types.ts   # Common types and interfaces
│   └── index.ts          # Type exports
└── interfaces/            # Interfaces
    └── routes.interface.ts # Route interface
```

## 🏗️ Architecture Pattern

### Layered Architecture

The application follows a **layered architecture** pattern:

1. **Routes Layer** (`src/routes/`)
   - Define API endpoints
   - Map routes to controllers
   - Handle route-specific middleware

2. **Controllers Layer** (`src/controllers/`)
   - Handle HTTP requests and responses
   - Validate input (when validation is added)
   - Call services to process business logic
   - Return formatted responses

3. **Services Layer** (`src/services/`)
   - Contains business logic
   - Interacts with models/database
   - Can call other services
   - Returns structured responses

4. **Models Layer** (`src/models/`)
   - Mongoose schemas and models
   - Define data structures
   - Handle data validation at schema level

### Base Classes

#### BaseService (`src/services/base.service.ts`)
Provides common CRUD operations:
- `create(data)` - Create new document
- `findById(id)` - Find by ID
- `findAll(filter, pagination)` - Find all with pagination
- `updateById(id, update)` - Update by ID
- `deleteById(id)` - Delete by ID
- `findOne(filter)` - Find one by filter

#### BaseController (`src/controllers/base.controller.ts`)
Provides standard REST endpoints:
- `POST /` - Create
- `GET /` - Get all (paginated)
- `GET /:id` - Get by ID
- `PUT /:id` - Update
- `DELETE /:id` - Delete

## 📝 Creating a New Module

To create a new module (e.g., "User"), follow these steps:

### 1. Create the Model

```typescript
// src/models/user.model.ts
import { Schema, model, Document } from 'mongoose';
import { baseSchemaOptions, BaseDocument } from './Base.model';

export interface IUser extends BaseDocument {
  name: string;
  email: string;
  age?: number;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, min: 0 },
  },
  baseSchemaOptions
);

export const User = model<IUser>('User', userSchema);
```

### 2. Create the Service

```typescript
// src/services/user.service.ts
import { BaseService } from './base.service';
import { User, IUser } from '../models/user.model';
import { Document } from 'mongoose';

class UserService extends BaseService<IUser> {
  constructor() {
    super(User);
  }

  // Add custom methods here
  async findByEmail(email: string) {
    return this.findOne({ email });
  }
}

export default new UserService();
```

### 3. Create the Controller

```typescript
// src/controllers/user.controller.ts
import { BaseController } from './base.controller';
import userService from '../services/user.service';
import { IUser } from '../models/user.model';
import { Document } from 'mongoose';

class UserController extends BaseController<IUser> {
  constructor() {
    super(userService);
  }

  // Override or add custom methods here
}

export default new UserController();
```

### 4. Create the Route

```typescript
// src/routes/user.route.ts
import { Router } from 'express';
import { Routes } from '../interfaces/routes.interface';
import UserController from '../controllers/user.controller';

class UserRoute implements Routes {
  public path = '/api/users';
  public router = Router();
  public userController = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/', this.userController.create);
    this.router.get('/', this.userController.findAll);
    this.router.get('/:id', this.userController.findById);
    this.router.put('/:id', this.userController.update);
    this.router.delete('/:id', this.userController.delete);
  }
}

export default UserRoute;
```

### 5. Register the Route

```typescript
// src/server.ts
import UserRoute from './routes/user.route';

const routes: Routes[] = [
  new IndexRoute(),
  new UserRoute(), // Add your new route here
];
```

## 🔧 Configuration

### Environment Variables

Required environment variables (`.env.development.local`):

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/your-database
MONGODB_DB_NAME=your-database
LOG_FORMAT=dev
LOG_DIR=logs
ORIGIN=http://localhost:3000
CREDENTIALS=false
```

## 🚀 Features

### Error Handling
- Global error middleware (`src/middlewares/error.middleware.ts`)
- Custom HTTP exceptions (`src/exceptions/HttpException.ts`)
- Consistent error response format

### Logging
- Winston logger with daily rotate files
- Separate log files for debug and error
- Console and file logging
- Request logging with Morgan

### API Response Format
- Consistent response structure via `ResponseUtil`
- Success responses with data
- Error responses with status and message
- Pagination support

### Database
- MongoDB with Mongoose
- Connection pooling
- Graceful connection/disconnection
- Health check utilities

### Security
- Helmet.js for security headers
- CORS configuration
- HPP (HTTP Parameter Pollution) protection
- Request size limits

### Documentation
- Swagger/OpenAPI documentation
- Available at `/api-docs` (development only)

## 📦 Dependencies

### Core
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `winston` - Logging
- `swagger-jsdoc` + `swagger-ui-express` - API documentation

### Security & Middleware
- `helmet` - Security headers
- `cors` - CORS handling
- `hpp` - Parameter pollution protection
- `compression` - Response compression
- `morgan` - HTTP request logger

## 🎯 Best Practices

1. **Separation of Concerns**: Keep business logic in services, not controllers
2. **DRY Principle**: Use base classes for common operations
3. **Error Handling**: Always use try-catch and proper error responses
4. **Type Safety**: Use TypeScript interfaces for all data structures
5. **Consistent Responses**: Use `ResponseUtil` for all API responses
6. **Pagination**: Always paginate list endpoints
7. **Logging**: Log important events and errors
8. **Environment Config**: Never hardcode configuration values

## 🔄 Next Steps (When Ready)

1. **Validation**: Add request validation middleware (e.g., using `joi` or `class-validator`)
2. **Authentication**: Add JWT authentication middleware
3. **Authorization**: Add role-based access control
4. **Testing**: Add unit and integration tests
5. **Caching**: Add Redis for caching
6. **Rate Limiting**: Add rate limiting middleware
7. **API Versioning**: Implement API versioning strategy

