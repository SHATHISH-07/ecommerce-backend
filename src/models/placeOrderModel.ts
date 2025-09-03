import { Schema, Document, model } from "mongoose";
import { CanceledOrder, OrderedProduct, ReturnedOrder, ShippingAddress, UserOrder } from "../types";

type UserOrderDocument = UserOrder & Document;

const OrderedProductSchema = new Schema<OrderedProduct>({
    externalProductId: { type: Number, required: true },
    title: { type: String, required: true },
    thumbnail: { type: String },
    priceAtPurchase: { type: Number, required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    returnPolicy: { type: String, required: true },
    returnExpiresAt: { type: Date, default: null }
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

const CanceledOrderSchema = new Schema<CanceledOrder>({
    canceledAt: { type: Date, required: true },
    canceledOrderReason: { type: String, required: true },
})

const ReturnedOrderSchema = new Schema<ReturnedOrder>({
    returnedAt: { type: Date, required: true },
    returnedOrderReason: { type: String, required: true },
})

const UserOrderSchema = new Schema<UserOrderDocument>(
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
            enum: ["Processing", "Packed", "Shipped", "Out_for_Delivery", "Delivered", "Cancelled", "Returned", "Refunded"],
            default: "Processing",
        },
        totalAmount: { type: Number, required: true },
        placedAt: { type: Date, default: Date.now },
        refundAt: { type: Date, default: null },
        packedAt: { type: Date, default: null },
        shippedAt: { type: Date, default: null },
        outForDeliveryAt: { type: Date, default: null },
        deliveredAt: { type: Date, default: null },
        cancelledOrder: { type: CanceledOrderSchema, default: null },
        returnedOrder: { type: ReturnedOrderSchema, default: null },
    },
    {
        timestamps: true,
    }
);

const OrderModel = model<UserOrderDocument>("Order", UserOrderSchema);

export default OrderModel;
