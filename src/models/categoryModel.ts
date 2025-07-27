import mongoose from 'mongoose';
import { Schema, Model, Document } from 'mongoose';
import { Category } from '../types';

type CategoryDoc = Category & Document;


const categorySchema: Schema<CategoryDoc> = new Schema(
    {
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Category || mongoose.model<CategoryDoc>("Category", categorySchema);