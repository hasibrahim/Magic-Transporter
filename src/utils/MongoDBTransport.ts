import Transport from 'winston-transport';
import { SystemLogModel } from '../database/schemas/SystemLog.schema';

/**
 * Custom Winston Transport for MongoDB
 * Stores logs in MongoDB database
 */
class MongoDBTransport extends Transport {
    constructor(opts?: Transport.TransportStreamOptions) {
        super(opts);
    }

    async log(info: any, callback: () => void) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        try {
            // Prepare metadata
            const metadata: any = {};

            // Extract all additional properties except the standard ones
            const { level, message, timestamp, ...rest } = info;

            // Add stack trace if it exists (from errors)
            if (info.stack) {
                metadata.stack = info.stack;
            }

            // Add error object if it exists
            if (info.error) {
                metadata.error = info.error;
            }

            // Add any other metadata
            if (Object.keys(rest).length > 0) {
                Object.assign(metadata, rest);
            }

            // Save to database
            await SystemLogModel.create({
                level: info.level,
                message: info.message,
                metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
                timestamp: new Date(info.timestamp),
            });
        } catch (error) {
            // Don't throw errors from the logger itself
            // Just emit an error event that can be handled if needed
            this.emit('error', error);
            console.error('Failed to log to MongoDB:', error);
        }

        callback();
    }
}

export default MongoDBTransport;

