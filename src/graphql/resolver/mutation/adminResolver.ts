import OrderModel from "../../../models/placeOrderModel";
import userModel from "../../../models/userModel";
import { Role, MyContext, UserModelWithoutPassword, OrderStatus } from "../../../types";
import { getCurrentUser } from "../../../utils/getUser";
import extractReturnDays from "../../../utils/returnDays";
import { sendEmailNoReturnPolicy, sendOrderStatusEmail } from "../../../utils/sendEmail";
import { formatUser } from "../../../utils/userReturn";



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
        banUser: async (_: unknown, args: { userId: string }, context: MyContext): Promise<UserModelWithoutPassword> => {
            const currentUser = getCurrentUser(context);

            if (!currentUser || currentUser.role !== 'admin') {
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
                    updatedBy: currentUser.userId,
                    updatedAt
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

            if (newStatus === "Delivered") {
                order.orderStatus = "Delivered";
                order.deliveredAt = new Date();
                await order.save();

                if (!order.userId) {
                    throw new Error("User ID not found in order.");
                }

                const user = await userModel.findById(order.userId);
                if (!user) {
                    throw new Error("User not found.");
                }

                for (const product of [...order.products]) {
                    const { returnPolicy, externalProductId, title } = product;

                    if (returnPolicy === "No return policy") {
                        // Notify the user
                        await sendEmailNoReturnPolicy(
                            user.name,
                            order.shippingAddress.email,
                            `Thanks for purchasing ${title}.
                    <br/> ${title} is not eligible for return.`
                        );

                        // Add to user history
                        user.userOrderHistory.push({
                            orderId: externalProductId,
                            placedAt: order.placedAt,
                        });
                        await user.save();

                        // Remove product from order
                        order.products = order.products.filter(
                            (p) => p.externalProductId !== externalProductId
                        );

                        // Delete order if empty
                        if (order.products.length === 0) {
                            await OrderModel.deleteOne({ _id: orderId });
                        } else {
                            await order.save();
                        }

                        continue;
                    }

                    // Delayed return policy handling
                    const returnDays = extractReturnDays(returnPolicy as string);
                    if (!returnDays) continue;

                    setTimeout(async () => {
                        const latestOrder = await OrderModel.findById(orderId);
                        const latestUser = await userModel.findById(order.userId as string);

                        if (!latestOrder || !latestUser) return;

                        latestUser.userOrderHistory.push({
                            orderId: externalProductId,
                            placedAt: latestOrder.placedAt,
                        });
                        await latestUser.save();

                        latestOrder.products = latestOrder.products.filter(
                            (p) => p.externalProductId !== externalProductId
                        );

                        if (latestOrder.products.length === 0) {
                            await OrderModel.deleteOne({ _id: orderId });
                        } else {
                            await latestOrder.save();
                        }
                    }, returnDays * 24 * 60 * 60 * 1000); // convert days to ms
                }
            } else {
                order.orderStatus = newStatus;
                await order.save();
            }

            await sendOrderStatusEmail(
                order.shippingAddress.name,
                order.shippingAddress.email,
                order.id,
                Date.now(),
                `Your product has been ${order.orderStatus}.
         <br/> Any further updates will be sent to your email.`
            );

            return {
                success: true,
                message: `Order status updated successfully to ${order.orderStatus}`,
            };
        }

    }

}

export default userResolver;