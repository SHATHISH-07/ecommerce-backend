import { Document, Types } from "mongoose";

// User model interface with password
export interface UserModelDoc extends Document {
    name: string;
    username: string;
    email: string;
    address: string;
    phone: string;
    country: string;
    state: string;
    city: string;
    zipCode: string;
    role?: Role;
    password: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
    isBanned: boolean;
    createdAt: Date;
    isActive: boolean;
    updatedAt: Date;
    updatedBy: Types.ObjectId | null;
}

// User model interface without password
export interface UserModelWithoutPassword {
    userId: string;
    name: string;
    username: string;
    email: string;
    address: string;
    phone: string;
    country: string;
    state: string;
    city: string;
    zipCode: string;
    role: Role;
    isActive: boolean;
    isBanned: boolean;
    createdAt: Date;
    updatedAt: Date;
    updatedBy: Types.ObjectId | null;
}

export enum Role {
    User = "user",
    Admin = "admin"
}

// Context interface for user session
export interface MyContext {
    userId?: string;
    name?: string;
    username?: string;
    email?: string;
    phone?: string;
    role?: Role;
    country?: string;
    state?: string;
    city?: string;
    zipCode?: string;
    isActive?: boolean;
    isBanned?: boolean;
    createdAt?: Date;
    password?: string;
    address?: string;
}

// Token payload interface
export interface TokenPayload {
    id: string;
    token: string;
}

// User Cart type

export interface UserCart {
    userId: string;
    products: {
        productId: number;
        quantity: number;
        createdAt: Date;
        updatedAt: Date | null;
    }[];
}

export interface UserCartResponse extends UserCart { }

export interface addCartResponse {
    message: string;
    success: boolean;
    cart: UserCart;
}

export interface updateCartResponse extends addCartResponse { }

export interface RemoveCartResponse extends Omit<addCartResponse, 'cart'> { }

export interface ClearCartResponse extends Omit<addCartResponse, 'cart'> { }


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

// types.ts
export interface ProductInput {
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
    returnPolicy: string;
    minimumOrderQuantity: number;
    meta: Meta;
    images: string[];
    thumbnail: string;
}
export interface UpdateProductInput {
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
    reviews: Review[];
    warrantyInformation: string;
    shippingInformation: string;
    availabilityStatus: string;
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

export interface BulkProductResponse {
    success: boolean;
    message: string;
    total: number
}

// Category interface
export interface Category {
    slug: string;
    name: string;
    url: string;
}

export interface CategoryResponse {
    success: boolean;
    message: string;
    name?: string;
}

export interface AddCategoryResponse extends CategoryResponse { }

export interface RemoveCategoryResponse extends CategoryResponse { }

export interface UpdateCategoryResponse extends CategoryResponse { }

export interface BulkCategoryResponse {
    success: boolean;
    message: string;
    total: number;
}



