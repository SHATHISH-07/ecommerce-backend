import OrderModel from "../../../models/placeOrderModel";
import userModel from "../../../models/userModel";
import { Role, MyContext, UserModelWithoutPassword, OrderStatus, PaymentMethod } from "../../../types";
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

            // Mark COD orders as paid on delivery
            if (newStatus === "Delivered" && order.paymentMethod === "Cash_on_Delivery") {
                order.paymentStatus = "Paid";
            }

            await order.save();

            // Handle logic only if status is Delivered
            if (newStatus === "Delivered") {
                const user = await userModel.findById(order.userId);
                if (!user) {
                    throw new Error("User not found.");
                }

                for (const product of [...order.products]) {
                    const { returnPolicy, externalProductId, title } = product;

                    // No return policy case
                    if (returnPolicy === "No return policy") {
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

                        if (order.products.length === 0) {
                            await OrderModel.deleteOne({ _id: orderId });
                        } else {
                            await order.save();
                        }

                        continue;
                    }

                    // Timed return logic
                    const returnDays = extractReturnDays(returnPolicy);
                    if (!returnDays) continue;

                    setTimeout(async () => {
                        const latestOrder = await OrderModel.findById(orderId);
                        const latestUser = await userModel.findById(order.userId as string);

                        if (!latestOrder || !latestUser) return;

                        // Push product to user history
                        latestUser.userOrderHistory.push({
                            orderId: externalProductId,
                            placedAt: latestOrder.placedAt,
                        });
                        await latestUser.save();

                        // Remove product after return window expires
                        latestOrder.products = latestOrder.products.filter(
                            (p) => p.externalProductId !== externalProductId
                        );

                        if (latestOrder.products.length === 0) {
                            await OrderModel.deleteOne({ _id: orderId });
                        } else {
                            await latestOrder.save();
                        }
                    }, returnDays * 24 * 60 * 60 * 1000);
                }
            }

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

        initiateRefundOrder: async (
            _: unknown,
            args: { orderId: string },
            context: MyContext
        ): Promise<{ success: boolean; message: string }> => {
            const currentUser = getCurrentUser(context);

            if (!currentUser || currentUser.role !== "admin") {
                throw new Error("Only admins can initiate a refund.");
            }

            const { orderId } = args;

            const order = await OrderModel.findById(orderId);
            if (!order) {
                throw new Error("Order not found.");
            }

            if (order.orderStatus === "Refunded") {
                throw new Error("Refund has already been initiated.");
            }

            order.orderStatus = "Refunded";
            await order.save();

            await sendOrderStatusEmail(
                order.shippingAddress.name,
                order.shippingAddress.email,
                orderId,
                Date.now(),
                "Refund has been initiated. Amount will be credited to your account within 2–3 working days."
            );

            return {
                success: true,
                message: "Refund initiated successfully.",
            };
        },

        confirmRefundOrder: async (
            _: unknown,
            args: { orderId: string },
            context: MyContext
        ): Promise<{ success: boolean; message: string }> => {
            const currentUser = getCurrentUser(context);

            if (!currentUser || currentUser.role !== "admin") {
                throw new Error("Only admins can confirm a refund.");
            }

            const { orderId } = args;

            const order = await OrderModel.findById(orderId);
            if (!order) {
                throw new Error("Order not found.");
            }

            await sendOrderStatusEmail(
                order.shippingAddress.name,
                order.shippingAddress.email,
                orderId,
                Date.now(),
                "Your refund has been successfully processed and the amount has been credited to your account."
            );

            await OrderModel.findByIdAndDelete(orderId);

            return {
                success: true,
                message: "Refund completed and order removed.",
            };
        }
    }

}

export default userResolver;