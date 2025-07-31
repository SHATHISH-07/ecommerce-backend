import mongoose, { Schema, Document, Model } from "mongoose";
import { UserCart } from "../types";

type CartDoc = UserCart & Document;

const cartSchema: Schema<CartDoc> = new Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true
        },
        products: [
            {
                productId: {
                    type: Number,
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    default: 1
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                },
                updatedAt: {
                    type: Date,
                    default: null
                }
            }
        ]
    }
);

const Cart: Model<CartDoc> = mongoose.models.Cart || mongoose.model<CartDoc>("Cart", cartSchema);

export default Cart;
