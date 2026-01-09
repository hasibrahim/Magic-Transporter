import mongoose from 'mongoose';
import { logger } from '../../utils/logger';
import { MONGODB_URI, MONGODB_DB_NAME, NODE_ENV } from '../../config';

/**
 * Test Database Helper
 * Manages database connection for testing
 */
class TestDatabase {
    /**
     * Connect to test database
     */
    async connect(): Promise<void> {
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
            logger.info(`🌍 Environment: ${NODE_ENV || 'test'}`);
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
            logger.error(`❌ Test database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    /**
     * Clear all collections in the database
     */
    async clearDatabase(): Promise<void> {
        if (process.env.NODE_ENV !== 'test') {
            throw new Error('Attempting to clear database in non-test environment!');
        }

        const collections = mongoose.connection.collections;

        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }

        logger.info('🗑️  Test database cleared');
    }

    /**
     * Close database connection
     */
    async disconnect(): Promise<void> {
        try {
            await mongoose.disconnect();
            logger.info('MongoDB disconnected gracefully');
        } catch (error) {
            logger.error(`Error disconnecting from MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Drop the entire test database
     */
    async dropDatabase(): Promise<void> {
        if (process.env.NODE_ENV !== 'test') {
            throw new Error('Attempting to drop database in non-test environment!');
        }

        try {
            await mongoose.connection.dropDatabase();
            logger.info('💣 Test database dropped');
        } catch (error) {
            logger.error(`❌ Error dropping test database: ${error}`);
            throw error;
        }
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return mongoose.connection.readyState === 1;
    }
}

export const testDatabase = new TestDatabase();

