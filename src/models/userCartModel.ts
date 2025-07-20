import mongoose from "mongoose";
import { Schema, Document, Model, Types } from "mongoose";
import { UserCart, CartItem } from "../types";

type CartItemDoc = CartItem & Document;
export type UserCartDoc = Omit<UserCart, "id"> & Document;

const cartItemSchema = new Schema<CartItemDoc>({
    externalProductId: { type: Number, required: true },
    title: { type: String, required: true },
    thumbnail: { type: String },
    priceAtAddTime: { type: Number, required: true },
    quantity: { type: Number, default: 1, min: 1 },
    addedAt: { type: Date, default: Date.now },
}, { _id: false });

const cartSchema = new Schema<UserCartDoc>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    products: [cartItemSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

cartSchema.pre("save", function (next) {
    const doc = this as UserCartDoc;
    doc.updatedAt = new Date();
    next();
});

cartSchema.index({ userId: 1 }, { unique: true });

cartSchema.set("toJSON", {
    transform: (_document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

export const userCartModel: Model<UserCartDoc> = mongoose.model<UserCartDoc>("UserCart", cartSchema);
