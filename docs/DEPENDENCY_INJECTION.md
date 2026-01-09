# Dependency Injection Guide

This project uses **TSyringe** for dependency injection, providing better testability, loose coupling, and improved code organization.

---

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Usage Patterns](#usage-patterns)
- [Container Configuration](#container-configuration)
- [Testing with DI](#testing-with-di)
- [Best Practices](#best-practices)

---

## Overview

### What is Dependency Injection?

Dependency Injection (DI) is a design pattern where dependencies are provided to a class rather than created within it. This promotes:

- **Loose Coupling**: Components don't need to know how to create their dependencies
- **Testability**: Easy to swap real implementations with mocks
- **Maintainability**: Changes to dependencies don't affect dependent classes
- **Flexibility**: Different implementations can be injected based on context

### Why TSyringe?

- **Decorator-based**: Clean, TypeScript-native syntax
- **Lightweight**: Minimal overhead
- **Auto-wiring**: Automatic dependency resolution
- **Scopes**: Singleton, transient, and custom scopes

---

## Setup

### 1. Installation

```bash
npm install tsyringe reflect-metadata
```

### 2. TypeScript Configuration

Ensure `tsconfig.json` has these options:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### 3. Import reflect-metadata

At the entry point of your application (`server.ts`):

```typescript
import 'reflect-metadata';
import { setupContainer } from './container';

// Setup DI container before anything else
setupContainer();
```

---

## Usage Patterns

### 1. Repositories (Singleton)

Repositories are registered as **singletons** (one instance throughout the application):

```typescript
import { singleton } from 'tsyringe';

@singleton()
export class MagicItemRepository {
    async create(data: Partial<IMagicItem>): Promise<IMagicItem> {
        const magicItem = new MagicItemModel(data);
        return await magicItem.save();
    }
    
    async findById(id: string): Promise<IMagicItem | null> {
        return await MagicItemModel.findById(id).exec();
    }
}
```

**Key Points:**
- Use `@singleton()` decorator
- No need to export an instance
- Export the class itself

### 2. Services (Injectable)

Services use **constructor injection** to receive their dependencies:

```typescript
import { injectable, inject } from 'tsyringe';

@injectable()
export class MagicItemService {
    constructor(
        @inject(MagicItemRepository) 
        private magicItemRepository: MagicItemRepository
    ) {}

    async create(data: CreateMagicItemDto): Promise<IMagicItem> {
        return await this.magicItemRepository.create(data);
    }
}
```

**Key Points:**
- Use `@injectable()` decorator
- Inject dependencies via constructor
- Use `@inject()` for explicit injection
- Private properties for encapsulation

### 3. Controllers (Injectable)

Controllers inject services:

```typescript
import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';

@injectable()
export class MagicItemController {
    constructor(
        @inject(MagicItemService) 
        private magicItemService: MagicItemService
    ) {}

    public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const magicItem = await this.magicItemService.create(req.body);
            ResponseUtil.created(res, 'Magic Item created successfully', magicItem);
        } catch (error) {
            ResponseUtil.error(res, error.message, 500);
        }
    };
}
```

**Key Points:**
- Arrow functions for route handlers to preserve `this` context
- Inject services, not repositories directly
- Follow single responsibility principle

### 4. Routes

Routes resolve controllers from the DI container:

```typescript
import { Router } from 'express';
import { container } from 'tsyringe';
import { MagicItemController } from '../controllers/magicItem.controller';

class MagicItemRoute implements Routes {
    public path = '/magic-items';
    public router = Router();
    private magicItemController: MagicItemController;

    constructor() {
        // Resolve controller from DI container
        this.magicItemController = container.resolve(MagicItemController);
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post('/', this.magicItemController.create);
    }
}

export default MagicItemRoute;
```

---

## Container Configuration

### Container Setup (`src/container.ts`)

```typescript
import 'reflect-metadata';
import { container } from 'tsyringe';

// Import all classes that need to be registered
import { MagicItemRepository } from './database/repositories/MagicItem.repository';
import { MagicItemService } from './services/magicItem.service';
import { MagicItemController } from './controllers/magicItem.controller';

export function setupContainer(): void {
    // Register singletons
    container.registerSingleton(MagicItemRepository);
    container.registerSingleton(MagicMoverRepository);
    
    // Register services
    container.registerSingleton(MagicItemService);
    container.registerSingleton(MagicMoverService);
    
    // Register controllers
    container.registerSingleton(MagicItemController);
    container.registerSingleton(MagicMoverController);
}

export { container };
```

### Registration Methods

1. **registerSingleton**: One instance for the entire application
   ```typescript
   container.registerSingleton(MagicItemRepository);
   ```

2. **register**: Transient (new instance each time)
   ```typescript
   container.register(MyTransientClass, { useClass: MyTransientClass });
   ```

3. **registerInstance**: Register a specific instance
   ```typescript
   container.registerInstance('Logger', logger);
   ```

---

## Testing with DI

### Unit Testing with Mocks

DI makes testing easy by allowing mock injection:

```typescript
import { container } from 'tsyringe';
import { MagicItemService } from '../services/magicItem.service';
import { MagicItemRepository } from '../database/repositories/MagicItem.repository';

describe('MagicItemService', () => {
    let service: MagicItemService;
    let mockRepository: jest.Mocked<MagicItemRepository>;

    beforeEach(() => {
        // Create mock repository
        mockRepository = {
            create: jest.fn(),
            findById: jest.fn(),
        } as any;

        // Register mock in container
        container.registerInstance(MagicItemRepository, mockRepository);

        // Resolve service (will use mock repository)
        service = container.resolve(MagicItemService);
    });

    afterEach(() => {
        container.clearInstances();
    });

    it('should create a magic item', async () => {
        const itemData = { name: 'Test', weight: 5 };
        const expectedItem = { ...itemData, _id: '123' };

        mockRepository.create.mockResolvedValue(expectedItem as any);

        const result = await service.create(itemData as any);

        expect(mockRepository.create).toHaveBeenCalledWith(itemData);
        expect(result).toEqual(expectedItem);
    });
});
```

### E2E Testing

For E2E tests, use the real container:

```typescript
import { testServer } from '../helpers/testServer';

describe('Magic Item E2E', () => {
    const app = testServer.getServer(); // Real DI container

    it('should create item', async () => {
        const response = await request(app)
            .post('/magic-items')
            .send({ name: 'Test', weight: 5 })
            .expect(201);
        
        expect(response.body.success).toBe(true);
    });
});
```

---

## Best Practices

### 1. Use Constructor Injection

✅ **Good:**
```typescript
@injectable()
export class MagicItemService {
    constructor(
        @inject(MagicItemRepository) private repository: MagicItemRepository
    ) {}
}
```

❌ **Bad:**
```typescript
export class MagicItemService {
    private repository = container.resolve(MagicItemRepository); // Don't do this
}
```

### 2. Register at Startup

Register all dependencies in `container.ts` during application startup, not at runtime.

### 3. Use Singletons for Stateless Classes

Most services and repositories should be singletons since they're stateless.

### 4. Avoid Circular Dependencies

If you have circular dependencies, restructure your code:

```typescript
// Instead of A depending on B and B depending on A
// Create a shared interface or split into smaller services
```

### 5. Keep Container Configuration Centralized

All container registration should be in `src/container.ts`.

### 6. Don't Inject Too Many Dependencies

If a class needs many dependencies, it might be doing too much:

```typescript
// Too many dependencies - consider splitting
constructor(
    dep1, dep2, dep3, dep4, dep5, dep6, dep7 // 😱
) {}
```

### 7. Use Interfaces for Better Testing

Define interfaces for your services:

```typescript
export interface IMagicItemService {
    create(data: CreateMagicItemDto): Promise<IMagicItem>;
}

@injectable()
export class MagicItemService implements IMagicItemService {
    // Implementation
}
```

---

## Migration Guide

### Converting Existing Code to DI

#### Before (without DI):
```typescript
// service.ts
export class MagicItemService {
    // ...
}
export default new MagicItemService();

// controller.ts
import magicItemService from '../services/magicItem.service';

export class MagicItemController {
    async create(req, res) {
        const item = await magicItemService.create(req.body);
        res.json(item);
    }
}
export default new MagicItemController();
```

#### After (with DI):
```typescript
// service.ts
@injectable()
export class MagicItemService {
    constructor(
        @inject(MagicItemRepository) private repository: MagicItemRepository
    ) {}
}

// controller.ts
@injectable()
export class MagicItemController {
    constructor(
        @inject(MagicItemService) private service: MagicItemService
    ) {}
    
    create = async (req, res) => {
        const item = await this.service.create(req.body);
        res.json(item);
    };
}

// routes.ts
const controller = container.resolve(MagicItemController);
router.post('/', controller.create);
```

---

## Troubleshooting

### "No matching bindings found"

**Problem:** TSyringe can't find a registered class.

**Solution:** 
1. Ensure class is registered in `container.ts`
2. Check that `reflect-metadata` is imported at entry point
3. Verify decorators are present (`@injectable()`, `@singleton()`)

### "Maximum call stack size exceeded"

**Problem:** Circular dependency.

**Solution:** Restructure code to remove circular references.

### Tests Fail After Adding DI

**Problem:** Tests don't set up the container.

**Solution:** Set up container in test setup:

```typescript
beforeAll(() => {
    setupContainer();
});
```

---

## Resources

- [TSyringe Documentation](https://github.com/microsoft/tsyringe)
- [Dependency Injection in TypeScript](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

**Need Help?** Open an issue on GitHub!

