import { UserModelWithoutPassword } from '../types';

export const formatUser = (user: any): UserModelWithoutPassword => ({
    userId: user.userId,
    name: user.name,
    username: user.username,
    email: user.email,
    address: user.address,
    phone: user.phone,
    country: user.country,
    state: user.state,
    city: user.city,
    zipCode: user.zipCode,
    role: user.role,
    isActive: user.isActive,
    isBanned: user.isBanned,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    updatedBy: user.updatedBy
});
