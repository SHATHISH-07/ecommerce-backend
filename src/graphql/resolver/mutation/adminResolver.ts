import OrderModel from "../../../models/placeOrderModel";
import userModel from "../../../models/userModel";
import { Role, MyContext, UserModelWithoutPassword, OrderStatus, PaymentMethod, Banner, UpdateBannerArgs, AddBannerArgs, DeleteBannerArgs } from "../../../types";
import { getCurrentUser } from "../../../utils/getUser";
import extractReturnDays from "../../../utils/returnDays";
import { sendEmailNoReturnPolicy, sendOrderStatusEmail } from "../../../utils/sendEmail";
import { formatUser } from "../../../utils/userReturn";
import BannerModel from "../../../models/bannerModel";
import { Types } from "mongoose";



const userResolver = {
    Mutation: {

        // Update user role
        updateUserRole: async (
            _: unknown,
            args: { userId: string; newRole: Role },
            context: MyContext
        ): Promise<UserModelWithoutPassword> => {

            const currentUser = getCurrentUser(context);


            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error("Only admins can update user roles.");
            }


            if (args.userId === currentUser.userId) {
                throw new Error("You cannot deactivate your own account.");
            }

            const updatedAt = new Date()

            const user = await userModel.findByIdAndUpdate(
                args.userId,
                {
                    role: args.newRole,
                    updatedBy: currentUser.userId,
                    updatedAt: updatedAt
                },
                { new: true, lean: true }
            );

            if (!user) throw new Error("User not found");

            return formatUser(user);
        },

        // Deactivate User
        deactivateUser: async (_: unknown, args: { userId: string }, context: MyContext): Promise<UserModelWithoutPassword> => {

            const currentUser = getCurrentUser(context);

            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error("Only admins can deactivate users.");
            }

            console.log(currentUser.userId)

            if (args.userId === currentUser.userId) {
                throw new Error("You cannot deactivate your own account.");
            }

            const updatedAt = new Date();

            const user = await userModel.findByIdAndUpdate(
                args.userId,
                {
                    isActive: false,
                    updatedBy: currentUser.userId,
                    updatedAt: updatedAt
                },
                { new: true, lean: true }
            );

            if (!user) throw new Error("User not found");

            return formatUser(user)
        },

        // Activate User
        activateUser: async (_: unknown, args: { userId: string }, context: MyContext): Promise<UserModelWithoutPassword> => {

            const currentUser = getCurrentUser(context);

            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error("Only admins can activate users.");
            }

            if (args.userId === currentUser.userId) {
                throw new Error("You cannot deactivate your own account.");
            }

            const updatedAt = new Date();

            const user = await userModel.findByIdAndUpdate(
                args.userId,
                {
                    isActive: true,
                    updatedBy: currentUser.userId,
                    updatedAt: updatedAt,
                },
                { new: true, lean: true }
            );

            if (!user) throw new Error("User not found");

            return formatUser(user)
        },

        // Ban User 
        banUser: async (
            _: unknown,
            args: { userId: string },
            context: MyContext
        ): Promise<UserModelWithoutPassword> => {
            const currentUser = getCurrentUser(context);

            if (!currentUser || currentUser.role !== "admin") {
                throw new Error("Only admins can ban users.");
            }

            if (args.userId === currentUser.userId) {
                throw new Error("You cannot ban yourself.");
            }

            const updatedAt = new Date();

            const user = await userModel.findByIdAndUpdate(
                args.userId,
                {
                    isBanned: true,
                    isActive: false,
                    updatedBy: currentUser.userId,
                    updatedAt,
                },
                { new: true, lean: true }
            );

            if (!user) throw new Error("User not found");

            return formatUser(user);
        },

        updateUserOrderStatus: async (
            _: unknown,
            args: { orderId: string; newStatus: OrderStatus },
            context: MyContext
        ): Promise<{ message: string; success: boolean }> => {
            const currentUser = getCurrentUser(context);

            if (!currentUser || currentUser.role !== "admin") {
                throw new Error("Only admins can update user order status.");
            }

            const { orderId, newStatus } = args;
            if (!orderId) {
                throw new Error("Order ID is required.");
            }

            const order = await OrderModel.findById(orderId);
            if (!order) {
                throw new Error("Order not found.");
            }

            // Set timestamp based on status
            const now = new Date();
            switch (newStatus) {
                case "Packed":
                    order.packedAt = now;
                    break;
                case "Shipped":
                    order.shippedAt = now;
                    break;
                case "Out_for_Delivery":
                    order.outForDeliveryAt = now;
                    break;
                case "Delivered":
                    order.deliveredAt = now;
                    break;
            }

            order.orderStatus = newStatus;

            if (newStatus === "Delivered" && order.paymentMethod === "Cash_on_Delivery") {
                order.paymentStatus = "Paid";
            }

            if (newStatus === "Delivered") {
                const user = await userModel.findById(order.userId);
                if (!user) {
                    throw new Error("User not found.");
                }

                for (const product of order.products) {
                    const { returnPolicy, externalProductId, title } = product;

                    let expiryDate: Date | null = null;

                    if (returnPolicy === "No return policy") {
                        expiryDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

                        await sendEmailNoReturnPolicy(
                            user.name,
                            order.shippingAddress.email,
                            `Thanks for purchasing ${title}.
                            <br/> ${title} is not eligible for return.`
                        );
                    } else {
                        const returnDays = extractReturnDays(returnPolicy);
                        if (returnDays) {
                            expiryDate = new Date(now.getTime() + returnDays * 24 * 60 * 60 * 1000);
                        }
                    }

                    if (expiryDate) {
                        product.returnExpiresAt = expiryDate;
                    }
                }
            }

            await order.save();

            await sendOrderStatusEmail(
                order.shippingAddress.name,
                order.shippingAddress.email,
                order.id,
                Date.now(),
                `Your product has been <b>${order.orderStatus}</b>.
                <br/> Any further updates will be sent to your email.`
            );

            return {
                success: true,
                message: `Order status updated successfully to ${order.orderStatus}`,
            };
        },



        initiateOrConfirmRefundOrder: async (
            _: unknown,
            args: { orderId: string },
            context: MyContext
        ): Promise<{ success: boolean; message: string }> => {
            const currentUser = getCurrentUser(context);

            if (!currentUser || currentUser.role !== "admin") {
                throw new Error("Only admins can perform this action.");
            }

            const { orderId } = args;

            const order = await OrderModel.findById(orderId);
            if (!order) {
                throw new Error("Order not found.");
            }

            if (order.orderStatus === "Refunded") {
                return {
                    success: true,
                    message: "Order is already refunded.",
                };
            }

            // Update order status
            order.orderStatus = "Refunded";
            await order.save();

            try {
                // Send refund email first
                await sendOrderStatusEmail(
                    order.shippingAddress.name,
                    order.shippingAddress.email,
                    orderId,
                    Date.now(),
                    "Refund has been initiated. Amount has been credited to your account."
                );

                // Only delete after email is successfully sent
                await OrderModel.findByIdAndDelete(orderId);

                return {
                    success: true,
                    message: "Refund initiated successfully, email sent, and order deleted.",
                };
            } catch (err) {
                // If email fails, do not delete the order
                console.error("Error sending refund email:", err);
                return {
                    success: false,
                    message: "Refund could not be completed because email failed.",
                };
            }
        },

        addBanner: async (
            _: unknown,
            args: AddBannerArgs,
            context: MyContext
        ): Promise<Banner> => {
            const user = getCurrentUser(context);

            if (!user || user.role !== "admin") {
                throw new Error("Only admins can add banner.");
            }

            const bannerDoc = new BannerModel({ ...args });
            const saved = await bannerDoc.save();

            return {
                id: (saved._id as Types.ObjectId).toHexString(),
                imageUrl: saved.imageUrl,
                title: saved.title,
                description: saved.description,
                isActive: saved.isActive,
                createdAt: saved.createdAt.toISOString(),
            };
        },

        updateBanner: async (
            _: unknown,
            args: UpdateBannerArgs,
            context: MyContext
        ): Promise<Banner | null> => {
            const user = getCurrentUser(context);

            if (!user || user.role !== "admin") {
                throw new Error("Only admins can update banner.");
            }

            const updated = await BannerModel.findByIdAndUpdate(args.id, args, {
                new: true,
            });

            if (!updated) return null;

            return {
                id: (updated._id as Types.ObjectId).toHexString(),
                imageUrl: updated.imageUrl,
                title: updated.title,
                description: updated.description,
                isActive: updated.isActive,
                createdAt: updated.createdAt.toISOString(),
            };
        },

        deleteBanner: async (
            _: unknown,
            args: DeleteBannerArgs,
            context: MyContext
        ): Promise<boolean> => {
            const user = getCurrentUser(context);

            if (!user || user.role !== "admin") {
                throw new Error("Only admins can delete banner.");
            }

            const deleted = await BannerModel.findByIdAndDelete(args.id);
            return !!deleted;
        },
    }

}

export default userResolver;