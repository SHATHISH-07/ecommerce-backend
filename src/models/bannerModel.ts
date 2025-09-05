import mongoose, { Schema, Document, Types } from "mongoose";

export interface BannerDoc extends Document {
    imageUrl: string;
    title?: string;
    description?: string;
    link?: string;
    isActive: boolean;
    createdAt: Date;
    id: string;
}

const BannerSchema = new Schema<BannerDoc>({
    imageUrl: { type: String, required: true },
    title: { type: String },
    description: { type: String },
    link: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});


BannerSchema.virtual("id").get(function (this: BannerDoc) {
    return (this._id as Types.ObjectId).toHexString();
});

BannerSchema.set("toJSON", { virtuals: true });


export default mongoose.model<BannerDoc>("Banner", BannerSchema);
