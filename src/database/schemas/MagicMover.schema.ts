import { Schema, model, Model, Document } from 'mongoose';
import { MagicMoverState } from '../../enums';

export interface IMagicMover extends Document {
    name?: string;
    weightLimit: number;
    currentWeight: number;
    state: MagicMoverState;
    items: string[]; // Array of item IDs
    completedMissions: number;
    createdAt: Date;
    updatedAt: Date;
}

const MagicMoverSchema = new Schema<IMagicMover>(
    {
        name: {
            type: String,
            required: false,
            trim: true,
        },
        weightLimit: {
            type: Number,
            required: true,
            min: 0,
        },
        currentWeight: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        state: {
            type: String,
            enum: Object.values(MagicMoverState),
            required: true,
            default: MagicMoverState.RESTING,
        },
        items: {
            type: [String],
            required: true,
            default: [],
        },
        completedMissions: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Create indexes for better query performance
MagicMoverSchema.index({ state: 1 });
MagicMoverSchema.index({ name: 1 });

export const MagicMoverModel: Model<IMagicMover> = model<IMagicMover>('MagicMover', MagicMoverSchema);

