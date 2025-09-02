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
                    default: 1,
                    max: 10
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
        ],
        totalItems: {
            type: Number,
            required: true,
            default: 0,
        },
        maxLimit: {
            type: Number,
            required: true,
            default: 100,
        },
    }
);

cartSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
        ret.id = ret.id.toString();
        delete ret.id;
    },
});


cartSchema.pre("save", function (next) {
    const cart = this as CartDoc;
    cart.totalItems = cart.products.length;
    next();
});

const Cart: Model<CartDoc> = mongoose.models.Cart || mongoose.model<CartDoc>("Cart", cartSchema);

export default Cart;
