import { Schema, Document, model } from "mongoose";
import { OrderedProduct, ShippingAddress, userPendingOrder } from "../types";

type UserPendingOrderDocument = userPendingOrder & Document;

const OrderedProductSchema = new Schema<OrderedProduct>({
    externalProductId: { type: Number, required: true },
    title: { type: String, required: true },
    thumbnail: { type: String },
    priceAtPurchase: { type: Number, required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    returnPolicy: { type: String, required: true },
});

const ShippingAddressSchema = new Schema<ShippingAddress>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
});

const UserPendingOrderSchema = new Schema<UserPendingOrderDocument>(
    {
        userId: { type: String, required: true },
        products: { type: [OrderedProductSchema], required: true },
        shippingAddress: { type: ShippingAddressSchema, required: true },
        paymentMethod: {
            type: String,
            enum: ["Cash_on_Delivery", "Card", "UPI", "NetBanking"],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed", "Refunded"],
            default: "Pending",
        },
        orderStatus: {
            type: String,
            enum: [
                "Processing", "Packed", "Shipped",
                "Out_for_Delivery", "Delivered",
                "Cancelled", "Returned", "Refunded"
            ],
            default: "Processing",
        },
        totalAmount: { type: Number, required: true },
    },
    {
        timestamps: true,
    }
);

UserPendingOrderSchema.pre("save", function (next) {
    const doc = this as UserPendingOrderDocument;

    if (doc.paymentMethod === "Cash_on_Delivery" as userPendingOrder["paymentMethod"]) {
        doc.paymentStatus = "Pending";
    } else {
        doc.paymentStatus = "Paid";
    }

    next();
});



const PendingOrderModel = model<UserPendingOrderDocument>("PendingOrder", UserPendingOrderSchema);

export default PendingOrderModel;
