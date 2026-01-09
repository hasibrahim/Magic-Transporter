import { Schema, model, Model, Document } from 'mongoose';

export interface IMagicItem extends Document {
    name: string;
    weight: number;
    createdAt: Date;
    updatedAt: Date;
}

const MagicItemSchema = new Schema<IMagicItem>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        weight: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);


export const MagicItemModel: Model<IMagicItem> = model<IMagicItem>('MagicItem', MagicItemSchema);

