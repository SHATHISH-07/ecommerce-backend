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
    emailVerified: boolean
    userOrderHistory: UserOrderHistory[];
    password: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
    isBanned: boolean;
    createdAt: Date;
    isActive: boolean;
    updatedAt: Date;
    updatedBy: Types.ObjectId | null;
}

export interface PendingUserModelDoc extends Omit<UserModelDoc, 'isActive' | 'isBanned' | 'updatedBy'> { }

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
    emailVerified?: boolean;
    role: Role;
    userOrderHistory: UserOrderHistory[];
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

export interface UserOrderHistory {
    orderId: number;
    placedAt: Date;
}

export interface UpdateUserProfileInput {
    name?: string;
    username?: string;
    email?: string;
    address?: string;
    phone?: string;
    country?: string;
    state?: string;
    city?: string;
    zipCode?: string;
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
    emailVerified?: boolean
    userOrderHistory?: UserOrderHistory[];
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

// OTP interface

export interface OTPDoc extends Document {
    verificationIdentifier: string;
    otp: string;
    createdAt: Date;
    compareOTP(candidateOTP: string): Promise<boolean>;
}

export interface OTPSignupResponse {
    message: string;
    success: boolean;
}

export interface ResendOTPResponse extends OTPSignupResponse { }

// User Cart type

export interface UserCart {
    userId: string;
    products: {
        productId: number;
        quantity: number;
        createdAt: Date;
        updatedAt: Date | null;
    }[];
    totalItems: number;
    maxLimit: number;
}

export interface UserCartResponse extends UserCart {
    id: string
}

export interface addCartResponse {
    message: string;
    success: boolean;
    cart: UserCart;
    id?: string
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
    returnPolicy: string;
    returnExpiresAt?: Date;
}
export interface ShippingAddress {
    name: string;
    email: string;
    phone: string;
    isVerified?: boolean;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export type PaymentMethod = "Cash_on_Delivery" | "Card" | "UPI" | "NetBanking";
export type PaymentStatus = "Pending" | "Paid" | "Failed" | "Refunded";
export type OrderStatus =
    | "Processing"
    | "Packed"
    | "Shipped"
    | "Out_for_Delivery"
    | "Delivered"
    | "Cancelled"
    | "Returned"
    | "Refunded";

export interface CanceledOrder {
    canceledAt: Date;
    canceledOrderReason: string;
}

export interface ReturnedOrder {
    returnedAt: Date;
    returnedOrderReason: string;
}

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
    cancelledOrder?: CanceledOrder | null;
    packedAt?: Date | null;
    shippedAt?: Date | null;
    outForDeliveryAt?: Date | null;
    returnedOrder?: ReturnedOrder | null;
    refundAt?: Date | null;
    deliveredAt?: Date | null;
}

export interface userPendingOrder extends Omit<UserOrder, "placedAt" | "refundAt"> { }

export interface userOrderInput extends Omit<userPendingOrder, "userId"> { }

export type GetOrderStatusResponse = {
    orderStatus: OrderStatus;
    products: {
        externalProductId: number;
        title: string;
        thumbnail?: string;
        priceAtPurchase: number;
        quantity: number;
        totalPrice: number;
        returnPolicy: string;
    }[];
};


// Product interface
export interface Product {
    id: number;
    title?: string;
    description?: string;
    category?: string;
    price: number;
    discountPercentage?: number;
    rating?: number;
    stock?: number;
    tags?: string[];
    brand?: string;
    sku?: string;
    weight?: number;
    dimensions?: Dimensions;
    warrantyInformation?: string;
    shippingInformation?: string;
    availabilityStatus?: string;
    reviews?: Review[];
    returnPolicy?: string;
    minimumOrderQuantity?: number;
    meta?: Meta;
    images?: string[];
    thumbnail?: string;
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
    thumbnail: string;
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

// Banner

export interface Banner {
    id: string;
    imageUrl: string;
    title?: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
}

export interface AddBannerArgs {
    imageUrl: string;
    title?: string;
    description?: string;
}

export interface UpdateBannerArgs {
    id: string;
    imageUrl?: string;
    title?: string;
    description?: string;
    isActive?: boolean;
}

export interface DeleteBannerArgs {
    id: string;
}


