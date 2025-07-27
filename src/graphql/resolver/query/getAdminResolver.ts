import userModel from "../../../models/userModel";
import { UserModelWithoutPassword, MyContext } from "../../../types";
import { getCurrentUser } from "../../../utils/getUser";

const formatUser = (user: any): UserModelWithoutPassword => ({
    userId: user._id.toString(),
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

const getAdminResolver = {
    Query: {
        getAdminUsers: async (
            _: unknown,
            __: unknown,
            context: MyContext
        ): Promise<UserModelWithoutPassword[]> => {
            const currentUser = getCurrentUser(context);

            if (!currentUser || currentUser.role !== "admin") {
                throw new Error("Access denied. Admins only.");
            }

            const admins = await userModel.find({ role: "admin" }).lean();
            return admins.map(formatUser);
        },

        getAdmin: async (
            _: unknown,
            args: { adminId?: string; name?: string; email?: string; username?: string },
            context: MyContext
        ): Promise<UserModelWithoutPassword> => {
            const currentUser = getCurrentUser(context);

            if (!currentUser || currentUser.role !== "admin") {
                throw new Error("Access denied. Admins only.");
            }

            const query: any = { role: "admin" };

            if (args.adminId) query._id = args.adminId;
            if (args.name) query.name = args.name;
            if (args.email) query.email = args.email;
            if (args.username) query.username = args.username;

            const admin = await userModel.findOne(query).lean();

            if (!admin) {
                throw new Error("Admin user not found");
            }

            return formatUser(admin);
        },

        // Deactivated users (not active and not banned)
        getDeactivatedUsers: async (
            _: unknown,
            __: unknown,
            context: MyContext
        ): Promise<UserModelWithoutPassword[]> => {
            const currentUser = getCurrentUser(context);

            if (!currentUser || currentUser.role !== "admin") {
                throw new Error("Access denied. Admins only.");
            }

            const users = await userModel.find({ isActive: false, isBanned: false }).lean();
            return users.map(formatUser);
        },

        // Active users (active and not banned)
        getActiveUsers: async (
            _: unknown,
            __: unknown,
            context: MyContext
        ): Promise<UserModelWithoutPassword[]> => {
            const currentUser = getCurrentUser(context);

            if (!currentUser || currentUser.role !== "admin") {
                throw new Error("Access denied. Admins only.");
            }

            const users = await userModel.find({ isActive: true, isBanned: false }).lean();
            return users.map(formatUser);
        },

        // Banned users
        getBannedUsers: async (
            _: unknown,
            __: unknown,
            context: MyContext
        ): Promise<UserModelWithoutPassword[]> => {
            const currentUser = getCurrentUser(context);

            if (!currentUser || currentUser.role !== "admin") {
                throw new Error("Access denied. Admins only.");
            }

            const users = await userModel.find({ isBanned: true }).lean();
            return users.map(formatUser);
        },
    }
};

export default getAdminResolver;
