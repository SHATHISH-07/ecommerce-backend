import bcrypt from "bcrypt";
import PendingOrderModel from "../../../models/pendingOrderModel";
import OTPModel from "../../../models/OTPModel";
import { MyContext, PaymentMethod, ShippingAddress, UserOrder, userOrderInput } from "../../../types";
import { getCurrentUser } from "../../../utils/getUser";
import otpGenerator from "../../../utils/otpGenerator";
import { sendOrderStatusEmail, sendOtpEmail } from "../../../utils/sendEmail";
import OrderModel from "../../../models/placeOrderModel";
import Cart from "../../../models/cartModel";
import productModel from "../../../models/productModel";
import userModel from "../../../models/userModel";


const userOrderResolver = {
    Mutation: {
        placeOrder: async (
            _: unknown,
            args: { input: userOrderInput },
            context: MyContext
        ): Promise<{ message: string; success: boolean }> => {
            const currentUser = getCurrentUser(context);

            if (!currentUser || !currentUser.userId) {
                throw new Error("Not authenticated, user must be logged in.");
            }

            const userId = currentUser.userId;

            const {

                products,
                totalAmount,
                paymentMethod,
                shippingAddress,
            } = args.input;

            if (!products?.length || !totalAmount || !paymentMethod || !shippingAddress) {
                throw new Error("All fields are required.");
            }

            if (!shippingAddress.phone || shippingAddress.phone.trim() === "") {
                throw new Error("Phone number is required.");
            }

            const newOrder = await PendingOrderModel.create({
                userId,
                products,
                totalAmount,
                paymentMethod,
                shippingAddress,
            });

            // Disabled due to trail account restrictions
            // const smsPhone = shippingAddress.phone.startsWith("+91")
            //     ? shippingAddress.phone
            //     : `+91${shippingAddress.phone}`;

            // const otp = otpGenerator();

            // const smsSent = await sendOtpSms(smsPhone, otp);


            const otp = otpGenerator();

            await sendOtpEmail(
                shippingAddress.email,
                otp,
                "Place order verification OTP"
            )

            const hashedOtp = await bcrypt.hash(otp, 10);

            await OTPModel.findOneAndUpdate(
                { verificationIdentifier: shippingAddress.email },
                { otp: hashedOtp, createdAt: new Date() },
                { upsert: true, new: true }
            );


            return {
                message: "OTP sent to your email. Please verify to place the order.",
                success: true,
            };
        },

        placeOrderFromCart: async (
            _: unknown,
            args: { paymentMethod: PaymentMethod, shippingAddress: ShippingAddress },
            context: MyContext
        ): Promise<{ success: boolean; message: string; order?: UserOrder }> => {
            const currentUser = getCurrentUser(context);
            if (!currentUser || !currentUser.userId) {
                throw new Error("User must be logged in to place an order");
            }

            const { shippingAddress, paymentMethod } = args;

            if (!shippingAddress) {
                throw new Error("Shipping address is required");
            }

            if (!paymentMethod) {
                throw new Error("Payment method is required");
            }

            const userId = currentUser.userId;

            const cart = await Cart.findOne({ userId });
            if (!cart || cart.products.length === 0) {
                throw new Error("Your cart is empty");
            }

            const orderedProducts = [];
            let totalAmount = 0;

            for (const cartItem of cart.products) {
                const product = await productModel.findOne({ id: cartItem.productId });
                if (!product) continue;

                const productTotal = product.price * cartItem.quantity;

                orderedProducts.push({
                    externalProductId: product.id,
                    title: product.title,
                    thumbnail: product.thumbnail,
                    priceAtPurchase: product.price,
                    quantity: cartItem.quantity,
                    totalPrice: productTotal,
                    returnPolicy: product.returnPolicy || "No_Return",
                });

                totalAmount += productTotal;
            }

            if (orderedProducts.length === 0) {
                throw new Error("All products in cart are invalid or unavailable");
            }

            const newOrder = await PendingOrderModel.create({
                userId,
                products: orderedProducts,
                shippingAddress: shippingAddress,
                paymentMethod: paymentMethod,
                totalAmount,
            });

            cart.products = [];
            await cart.save();


            const otp = otpGenerator();

            await sendOtpEmail(
                shippingAddress.email,
                otp,
                "Place order verification OTP"
            )

            const hashedOtp = await bcrypt.hash(otp, 10);

            await OTPModel.findOneAndUpdate(
                { verificationIdentifier: shippingAddress.email },
                { otp: hashedOtp, createdAt: new Date() },
                { upsert: true, new: true }
            );

            return {
                message: "OTP sent to your email. Please verify to place the order.",
                success: true,
            };
        },

        cancelOrder: async (
            _: unknown,
            args: { orderId: string; reason: string },
            context: MyContext
        ): Promise<{ success: boolean; message: string }> => {
            const currentUser = getCurrentUser(context);

            if (!currentUser || !currentUser.userId) {
                throw new Error("Not authenticated, user must be logged in.");
            }

            const { orderId, reason } = args;

            if (!orderId) {
                throw new Error("Order ID is required.");
            }

            const order = await OrderModel.findById(orderId);
            if (!order) {
                throw new Error("Order not found.");
            }

            if (order.userId.toString() !== currentUser.userId.toString()) {
                throw new Error("You are not authorized to cancel this order.");
            }

            const nonCancellableStatuses = ["Shipped", "Out_for_Delivery", "Delivered"];
            if (nonCancellableStatuses.includes(order.orderStatus)) {
                await sendOrderStatusEmail(
                    order.shippingAddress.name,
                    order.shippingAddress.email,
                    orderId,
                    new Date(order.placedAt).getTime(),
                    `Order cannot be cancelled as it is already ${order.orderStatus}.`
                );
                throw new Error(`Order cannot be cancelled as it is already ${order.orderStatus}.`);
            }

            const placedAtTimestamp = order.placedAt ? new Date(order.placedAt).getTime() : Date.now();
            const paymentMethod = order.paymentMethod?.toLowerCase();

            const cancellationMessage =
                paymentMethod === "cash_on_delivery"
                    ? `Your order has been cancelled successfully.`
                    : `Order has been cancelled successfully due to "${reason}". Refund will be initiated shortly.`;

            await sendOrderStatusEmail(
                order.shippingAddress.name,
                order.shippingAddress.email,
                orderId,
                placedAtTimestamp,
                cancellationMessage
            );

            if (paymentMethod === "cash_on_delivery") {
                await OrderModel.findByIdAndDelete(orderId);
                return {
                    success: true,
                    message: `Order (COD) has been cancelled and deleted successfully. Reason: ${reason}`,
                };
            }

            order.orderStatus = "Cancelled";
            order.cancelledOrder = {
                canceledAt: new Date(),
                canceledOrderReason: reason,
            };

            await order.save();

            return {
                success: true,
                message: `Order has been cancelled successfully. Reason: ${reason}`,
            };
        },

        returnOrder: async (
            _: unknown,
            args: { orderId: string; reason: string },
            context: MyContext
        ): Promise<{ success: boolean; message: string }> => {
            const currentUser = getCurrentUser(context);

            if (!currentUser || !currentUser.userId) {
                throw new Error("Not authenticated, user must be logged in.");
            }

            const { orderId, reason } = args;

            if (!orderId) {
                throw new Error("Order ID is required.");
            }

            const order = await OrderModel.findById(orderId);
            if (!order) {
                throw new Error("Order not found.");
            }

            if (order.userId.toString() !== currentUser.userId.toString()) {
                throw new Error("You are not authorized to return this order.");
            }

            if (order.orderStatus !== "Delivered") {
                throw new Error("Only delivered orders can be returned.");
            }

            if (!order.deliveredAt) {
                throw new Error("Delivered date not found for this order.");
            }

            const now = new Date();
            const deliveredDate = new Date(order.deliveredAt);

            const returnableProducts: typeof order.products = [];
            const expiredProducts: typeof order.products = [];

            for (const product of order.products) {
                const policy = product.returnPolicy?.toLowerCase();
                if (!policy || policy === "no return policy") {
                    expiredProducts.push(product);
                    continue;
                }

                const match = policy.match(/(\d+)\s*days/);
                if (!match) {
                    expiredProducts.push(product);
                    continue;
                }

                const returnDays = parseInt(match[1]);
                const deadline = new Date(
                    deliveredDate.getTime() + returnDays * 24 * 60 * 60 * 1000
                );

                if (now <= deadline) {
                    returnableProducts.push(product);
                } else {
                    expiredProducts.push(product);
                }
            }

            if (returnableProducts.length === 0) {
                // Track expired products in user order history
                if (expiredProducts.length > 0) {
                    const user = await userModel.findById(order.userId);
                    if (user) {
                        expiredProducts.forEach((prod) => {
                            user.userOrderHistory.push({
                                orderId: prod.externalProductId,
                                placedAt: order.placedAt,
                            });
                        });
                        await user.save();
                    }
                }

                await sendOrderStatusEmail(
                    order.shippingAddress.name,
                    order.shippingAddress.email,
                    orderId,
                    now.getTime(),
                    `Order cannot be returned as none of the products are returnable or the return period has expired.`
                );

                throw new Error("No returnable products found or return window expired.");
            }

            order.products = returnableProducts;

            if (expiredProducts.length > 0) {
                const user = await userModel.findById(order.userId);
                if (user) {
                    expiredProducts.forEach((prod) => {
                        user.userOrderHistory.push({
                            orderId: prod.externalProductId,
                            placedAt: order.placedAt,
                        });
                    });
                    await user.save();
                }
            }

            order.orderStatus = "Returned";
            order.returnedOrder = {
                returnedAt: now,
                returnedOrderReason: reason,
            };

            await order.save();

            await sendOrderStatusEmail(
                order.shippingAddress.name,
                order.shippingAddress.email,
                orderId,
                now.getTime(),
                `Your order has been returned successfully. Reason: ${reason}. Refund will be processed shortly.`
            );

            return {
                success: true,
                message: `Order has been returned successfully. Reason: ${reason}`,
            };
        }

    }
}

export default userOrderResolver;
