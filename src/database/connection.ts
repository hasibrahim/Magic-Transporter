import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { MONGODB_URI, MONGODB_DB_NAME, NODE_ENV } from '../config';

class Database {
    public async connect(): Promise<void> {
        try {
            if (!MONGODB_URI) {
                throw new Error('MONGODB_URI is not defined in environment variables');
            }

            const connectionOptions: mongoose.ConnectOptions = {
                dbName: MONGODB_DB_NAME || undefined,
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            };

            await mongoose.connect(MONGODB_URI, connectionOptions);

            logger.info('=================================');
            logger.info(`✅ MongoDB Connected Successfully`);
            logger.info(`📦 Database: ${mongoose.connection.db?.databaseName || MONGODB_DB_NAME}`);
            logger.info(`🌍 Environment: ${NODE_ENV || 'development'}`);
            logger.info('=================================');

            // Handle connection events
            mongoose.connection.on('error', (err) => {
                logger.error(`MongoDB connection error: ${err.message}`);
            });

            mongoose.connection.on('disconnected', () => {
                logger.warn('MongoDB disconnected');
            });

            mongoose.connection.on('reconnected', () => {
                logger.info('MongoDB reconnected');
            });
        } catch (error) {
            logger.error(`MongoDB connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            process.exit(1);
        }
    }

    public async disconnect(): Promise<void> {
        try {
            await mongoose.disconnect();
            logger.info('MongoDB disconnected gracefully');
        } catch (error) {
            logger.error(`Error disconnecting from MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public isConnected(): boolean {
        return mongoose.connection.readyState === 1;
    }
}

export default new Database();

