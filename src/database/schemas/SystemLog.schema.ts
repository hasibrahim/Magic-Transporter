import { Schema, model, Model, Document } from 'mongoose';

export interface ISystemLog extends Document {
    level: string; // error, warn, info, debug, etc.
    message: string;
    metadata?: {
        stack?: string;
        error?: any;
        context?: string;
        [key: string]: any;
    };
    timestamp: Date;
    createdAt: Date;
}

const SystemLogSchema: any = new Schema(
    {
        level: {
            type: String,
            required: true,
            index: true,
            enum: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
        },
        message: {
            type: String,
            required: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
            required: false,
            default: {},
        },
        timestamp: {
            type: Date,
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Create indexes for better query performance
SystemLogSchema.index({ level: 1, timestamp: -1 });
SystemLogSchema.index({ timestamp: -1 });

// Optional: Add TTL index to automatically delete old logs after 90 days
// Uncomment the line below if you want automatic cleanup
// SystemLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

export const SystemLogModel: Model<ISystemLog> = model<ISystemLog>('SystemLog', SystemLogSchema);

