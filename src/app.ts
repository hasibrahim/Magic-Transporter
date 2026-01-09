import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { NODE_ENV, PORT, LOG_FORMAT, CREDENTIALS, ORIGIN } from './config';
import { Routes } from './interfaces/routes.interface';
import { logger, stream } from './utils/logger';
import { errorMiddleware } from './middlewares/error.middleware';

export class App {
  public app: Express;
  public env: string;
  public port: string | number;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;

    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      logger.info('=================================');
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer(): Express {
    return this.app;
  }

  private initializeMiddlewares(): void {
    // Request logging
    this.app.use(morgan(LOG_FORMAT || 'dev', { stream }));

    // Security
    this.app.use(helmet());
    this.app.use(hpp());

    // CORS
    this.app.use(
      cors({
        origin: ORIGIN || '*',
        credentials: CREDENTIALS,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      }),
    );

    // Body parser
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression
    this.app.use(compression());

    // Cookie parser
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]): void {
    routes.forEach((route) => {
      this.app.use(route.path || '/', route.router);
      logger.info(`Route initialized: ${route.path || '/'}`);
    });
  }

  private initializeSwagger(): void {
    if (this.env !== 'production') {
      try {
        // Read swagger.yaml file
        const swaggerPath = path.join(__dirname, '../swagger.yaml');
        const swaggerFile = fs.readFileSync(swaggerPath, 'utf8');
        const swaggerDocument = yaml.load(swaggerFile) as any;

        // Update server URL dynamically based on the port
        if (swaggerDocument.servers && swaggerDocument.servers.length > 0) {
          swaggerDocument.servers[0].url = `http://localhost:${this.port}`;
        }

        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
        logger.info(`Swagger docs available at http://localhost:${this.port}/api-docs`);
      } catch (error) {
        logger.error(`Failed to load swagger.yaml: ${error.message}`);
      }
    }
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use((req, res, next) => {
      res.status(404).json({
        success: false,
        status: 404,
        message: `Route ${req.originalUrl} not found`,
      });
    });

    // Error handler
    this.app.use(errorMiddleware);
  }
}
