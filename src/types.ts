import { Document, Types } from "mongoose";


// User model interface with password

export interface UserModelDoc extends Document {
    name: string;
    username: string;
    email: string;
    address: string;
    phone: string;
    role?: Role;
    password: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// User model interface without password

export interface UserModelWithoutPassword {
    id: string;
    name: string;
    username: string;
    email: string;
    address: string;
    phone: string;
    role: Role;
}

export enum Role {
    User = "user",
    Admin = "admin"
}

// Context interface for user session

export interface MyContext {
    currentUser?: UserModelDoc | null;
    id?: string;
    name?: string;
    username?: string;
    email?: string;
    phone?: string;
    role?: Role;
    password?: string;
    address?: string;
}

// Token payload interface

export interface TokenPayload {
    id: string;
    token: string;
}

// User cart interface

export interface CartItem {
    externalProductId: number;
    title: string;
    thumbnail?: string;
    priceAtAddTime: number;
    quantity: number;
    addedAt?: Date;
}

export interface UserCart {
    id: string;
    userId: Types.ObjectId;
    products: CartItem[];
    createdAt: Date;
    updatedAt: Date;
}

// User ordered products interface

export interface OrderedProduct {
    externalProductId: number;
    title: string;
    thumbnail?: string;
    priceAtPurchase: number;
    quantity: number;
    totalPrice: number;
}

export interface ShippingAddress {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    postalCode: string;
    country: string;
}

export type PaymentMethod = "Cash on Delivery" | "Card" | "UPI" | "NetBanking";
export type PaymentStatus = "Pending" | "Paid" | "Failed" | "Refunded";
export type OrderStatus = "Processing" | "Packed" | "Shipped" | "Delivered" | "Cancelled";

export interface UserOrder {
    id: string;
    userId: string;
    products: OrderedProduct[];
    shippingAddress: ShippingAddress;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    totalAmount: number;
    placedAt: Date;
    refundAt?: Date | null;
}

// Product interface

export interface Product {
    id: number;
    title: string;
    description: string;
    category: string;
    price: number;
    discountPercentage: number;
    rating: number;
    stock: number;
    tags: string[];
    brand: string;
    sku: string;
    weight: number;
    dimensions: Dimensions;
    warrantyInformation: string;
    shippingInformation: string;
    availabilityStatus: string;
    reviews: Review[];
    returnPolicy: string;
    minimumOrderQuantity: number;
    meta: Meta;
    images: string[];
    thumbnail: string;
}

export interface Dimensions {
    width: number;
    height: number;
    depth: number;
}


export interface Review {
    rating: number;
    comment: string;
    date: Date;
    reviewerName: string;
    reviewerEmail: string;
}

export interface Meta {
    createdAt: Date;
    updatedAt: Date;
    barcode: string;
    qrCode: string;
}

export interface FetchProductsResponse {
    products: Product[];
    total: number;
    skip: number;
    limit: number;
}

// Category interface

export interface Category {
    slug: string;
    name: string;
    url: string;
}

