import { UserModelWithoutPassword } from '../types';

export const formatCurrentUser = (user: any): UserModelWithoutPassword => ({
    userId: user.userId,
    name: user.name,
    username: user.username,
    email: user.email,
    address: user.address,
    phone: user.phone,
    country: user.country,
    state: user.state,
    city: user.city,
    userOrderHistory: user.userOrderHistory,
    emailVerified: user.emailVerified,
    zipCode: user.zipCode,
    role: user.role,
    isActive: user.isActive,
    isBanned: user.isBanned,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    updatedBy: user.updatedBy
});

export const formatUser = (user: any): UserModelWithoutPassword => ({
    userId: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    address: user.address,
    phone: user.phone,
    userOrderHistory: user.userOrderHistory,
    country: user.country,
    state: user.state,
    city: user.city,
    emailVerified: user.emailVerified,
    zipCode: user.zipCode,
    role: user.role,
    isActive: user.isActive,
    isBanned: user.isBanned,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    updatedBy: user.updatedBy
});