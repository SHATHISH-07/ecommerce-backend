import categoryModel from "../../../models/categoryModel";
import OrderModel from "../../../models/placeOrderModel";
import productModel from "../../../models/productModel";
import userModel from "../../../models/userModel";
import { UserModelWithoutPassword, MyContext, OrderedProduct, UserOrder, Banner } from "../../../types";
import { getCurrentUser } from "../../../utils/getUser";
import { formatUser } from "../../../utils/userReturn";
import BannerModel from "../../../models/bannerModel"
import { Types } from "mongoose";


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

        getAllOrdersAdmin: async (
            _: unknown,
            __: unknown,
            context: MyContext
        ): Promise<UserOrder[]> => {
            const currentUser = getCurrentUser(context);
            if (!currentUser || currentUser.role !== "admin") {
                throw new Error("Access denied. Admins only.");
            }

            const orders = await OrderModel.find().sort({ createdAt: -1 });

            return orders;
        },

        getAllOrderByStatusAdmin: async (
            _: unknown,
            args: { status: string },
            context: MyContext
        ): Promise<UserOrder[]> => {
            const currentUser = getCurrentUser(context);

            if (!currentUser || currentUser.role !== "admin") {
                throw new Error("Access denied. Admins only.");
            }

            const orders = await OrderModel.find({ orderStatus: args.status });

            if (!orders || orders.length === 0) {
                throw new Error(`No orders found with status: ${args.status}`);
            }

            return orders;
        },

        getAdminDashboardStats: async (
            _: unknown,
            __: unknown,
            context: MyContext
        ): Promise<{
            totalOrders: number;
            totalRevenue: number;
            cancelledOrders: number;
            returnedOrders: number;
            totalProducts: number;
            totalCategories: number;
            totalUsers: number;
            activeUsers: number;
            bannedUsers: number;
            deactivatedUsers: number;
        }> => {
            const currentUser = getCurrentUser(context);
            if (!currentUser || currentUser.role !== "admin") {
                throw new Error("Access denied. Admins only.");
            }

            const [
                totalOrders,
                revenueAgg,
                cancelledOrders,
                returnedOrders,
                totalProducts,
                totalCategories,
                totalUsers,
                activeUsers,
                bannedUsers,
                deactivatedUsers,
            ] = await Promise.all([
                OrderModel.countDocuments(),
                OrderModel.aggregate([
                    { $match: { paymentStatus: "Paid" } },
                    { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
                ]),
                OrderModel.countDocuments({ orderStatus: "Cancelled" }),
                OrderModel.countDocuments({ orderStatus: "Returned" }),
                productModel.countDocuments(),
                categoryModel.countDocuments(),
                userModel.countDocuments(),
                userModel.countDocuments({ isActive: true }),
                userModel.countDocuments({ isBanned: true }),
                userModel.countDocuments({ isActive: false }),
            ]);

            const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

            return {
                totalOrders,
                totalRevenue,
                cancelledOrders,
                returnedOrders,
                totalProducts,
                totalCategories,
                totalUsers,
                activeUsers,
                bannedUsers,
                deactivatedUsers
            };
        },

        getAllBanners: async (_: unknown, __: unknown): Promise<Banner[]> => {
            const docs = await BannerModel.find().sort({ createdAt: -1 }).lean();

            return docs.map((doc) => ({
                id: (doc._id as Types.ObjectId).toHexString(),
                imageUrl: doc.imageUrl,
                title: doc.title,
                description: doc.description,
                link: doc.link,
                isActive: doc.isActive,
                createdAt: doc.createdAt.toISOString(),
            }));
        },

    }
};

export default getAdminResolver;
