import 'reflect-metadata';
import { setupContainer } from './container';
import { App } from './app';
import { ValidateEnv } from './utils/validateEnv';
import database from './database/connection';
import { logger } from './utils/logger';
import { Routes } from './interfaces/routes.interface';

// Setup Dependency Injection Container
setupContainer();

// Validate environment variables
ValidateEnv();

// Import routes
import IndexRoute from './routes/index.route';
import MagicMoverRoute from './routes/magicMover.route';
import MagicItemRoute from './routes/magicItem.route';

// Initialize routes array
const routes: Routes[] = [
  new IndexRoute(),
  new MagicMoverRoute(),
  new MagicItemRoute(),
];

// Create app instance
const app = new App(routes);

// Connect to database
database
  .connect()
  .then(() => {
    // Start server after database connection
    app.listen();
  })
  .catch((error) => {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await database.disconnect();
  process.exit(0);
});

export default app.getServer();
