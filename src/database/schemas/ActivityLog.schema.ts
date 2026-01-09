import { Schema, model, Model, Document } from 'mongoose';
import { ActivityType } from '../../enums';

export interface IActivityLog extends Document {
    moverId: string; // Reference to MagicMover ID
    activityType: ActivityType;
    details?: {
        itemIds?: string[]; // Item IDs involved in loading
        itemCount?: number;
        totalWeight?: number;
        previousState?: string;
        newState?: string;
        [key: string]: any; // Allow for additional metadata
    };
    createdAt: Date;
    updatedAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
    {
        moverId: {
            type: String,
            required: true,
            index: true,
        },
        activityType: {
            type: String,
            enum: Object.values(ActivityType),
            required: true,
            index: true,
        },
        details: {
            type: Schema.Types.Mixed,
            required: false,
            default: {},
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Create compound indexes for better query performance (using createdAt instead of timestamp)
ActivityLogSchema.index({ moverId: 1, createdAt: -1 });
ActivityLogSchema.index({ activityType: 1, createdAt: -1 });

export const ActivityLogModel: Model<IActivityLog> = model<IActivityLog>('ActivityLog', ActivityLogSchema);

