import 'reflect-metadata';
import { Express } from 'express';
import { App } from '../../app';
import { setupContainer } from '../../container';
import { Routes } from '../../interfaces/routes.interface';

// Import routes
import IndexRoute from '../../routes/index.route';
import MagicMoverRoute from '../../routes/magicMover.route';
import MagicItemRoute from '../../routes/magicItem.route';

/**
 * Test Server Helper
 * Creates an Express app instance for testing
 */
class TestServer {
    private app: App | null = null;

    /**
     * Initialize the test server
     */
    initialize(): Express {
        // Setup DI container
        setupContainer();

        // Initialize routes
        const routes: Routes[] = [
            new IndexRoute(),
            new MagicMoverRoute(),
            new MagicItemRoute(),
        ];

        // Create app instance
        this.app = new App(routes);

        return this.app.getServer();
    }

    /**
     * Get the Express server instance
     */
    getServer(): Express {
        if (!this.app) {
            return this.initialize();
        }
        return this.app.getServer();
    }

    /**
     * Close the server
     */
    close(): void {
        this.app = null;
    }
}

export const testServer = new TestServer();

