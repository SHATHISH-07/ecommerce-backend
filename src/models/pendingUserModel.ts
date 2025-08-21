import mongoose, { Schema, Document } from "mongoose";
import { PendingUserModelDoc, Role } from "../types";



const pendingUserSchema = new Schema<PendingUserModelDoc>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    address: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    zipCode: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.User
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 900
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});



export default mongoose.model<PendingUserModelDoc>("PendingUser", pendingUserSchema);
