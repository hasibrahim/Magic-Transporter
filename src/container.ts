import 'reflect-metadata';
import { container } from 'tsyringe';

// Import repositories
import { MagicItemRepository } from './database/repositories/MagicItem.repository';
import { MagicMoverRepository } from './database/repositories/MagicMover.repository';
import { ActivityLogRepository } from './database/repositories/ActivityLog.repository';

// Import services
import { MagicItemService } from './services/magicItem.service';
import { MagicMoverService } from './services/magicMover.service';

// Import controllers
import { MagicItemController } from './controllers/magicItem.controller';
import { MagicMoverController } from './controllers/magicMover.controller';

/**
 * Dependency Injection Container Configuration
 * 
 * This file sets up the TSyringe DI container and registers all dependencies.
 * The container is configured in server.ts before the app is initialized.
 */

export function setupContainer(): void {
    // Repositories are registered as singletons
    container.registerSingleton(MagicItemRepository);
    container.registerSingleton(MagicMoverRepository);
    container.registerSingleton(ActivityLogRepository);

    // Services are registered as singletons
    container.registerSingleton(MagicItemService);
    container.registerSingleton(MagicMoverService);

    // Controllers are registered as singletons
    container.registerSingleton(MagicItemController);
    container.registerSingleton(MagicMoverController);
}

export { container };

