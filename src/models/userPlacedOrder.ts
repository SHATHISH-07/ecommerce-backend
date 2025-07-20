import mongoose from "mongoose";
import { Schema, Document, Model, Types } from "mongoose";
import {
    UserOrder,
    OrderedProduct,
} from "../types";
import { time, timeStamp } from "console";

type OrderedProductDoc = OrderedProduct & Document;

export type UserOrderDoc = Omit<UserOrder, "id" | "userId"> & {
    userId: Types.ObjectId;
} & Document;

const orderedProductSchema = new Schema<OrderedProductDoc>({
    externalProductId: { type: Number, required: true },
    title: { type: String, required: true },
    thumbnail: { type: String },
    priceAtPurchase: { type: Number, required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true }
}, { _id: false });

const userOrderSchema = new Schema<UserOrderDoc>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    products: [orderedProductSchema],

    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        addressLine: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true }
    },

    paymentMethod: {
        type: String,
        enum: ["Cash on Delivery", "Card", "UPI", "NetBanking"],
        default: "Cash on Delivery"
    },

    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed", "Refunded"],
        default: "Pending"
    },

    orderStatus: {
        type: String,
        enum: ["Processing", "Packed", "Shipped", "Delivered", "Cancelled"],
        default: "Processing"
    },

    totalAmount: {
        type: Number,
        required: true
    },

    placedAt: {
        type: Date,
        default: Date.now
    },

    refundAt: {
        type: Date,
        default: null
    }
});

userOrderSchema.set("toJSON", {
    transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
    }
});

export const userOrderModel: Model<UserOrderDoc> = mongoose.model<UserOrderDoc>("UserOrder", userOrderSchema);
