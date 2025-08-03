import { MyContext } from "../types";

export const getCurrentUser = (context: MyContext) => {

    const currentUser = {
        userId: context.userId,
        name: context.name,
        username: context.username,
        email: context.email,
        address: context.address,
        phone: context.phone,
        role: context.role,
        country: context.country,
        emailVerified: context.emailVerified,
        state: context.state,
        city: context.city,
        zipCode: context.zipCode,
        isActive: context.isActive,
        isBanned: context.isBanned,
        createdAt: context.createdAt
    }

    return currentUser;

}

