import OrderModel from "../../../models/placeOrderModel";
import { GetOrderStatusResponse, MyContext, UserOrder } from "../../../types";
import { getCurrentUser } from "../../../utils/getUser";

const getUserOrderResolver = {
    Query: {
        getAllUserOrder: async (
            _: unknown,
            __: unknown,
            context: MyContext
        ): Promise<UserOrder[]> => {
            const currentUser = getCurrentUser(context);
            if (!currentUser || !currentUser.userId) throw new Error("Not authenticated");

            const orders = await OrderModel.find({ userId: currentUser.userId });

            if (!orders || orders.length === 0) throw new Error("No orders found.");

            return orders;
        },

        getOrderById: async (
            _: unknown,
            args: { orderId: string },
            context: MyContext
        ): Promise<UserOrder> => {
            const currentUser = getCurrentUser(context);
            if (!currentUser || !currentUser.userId) throw new Error("Not authenticated");

            if (!args.orderId) throw new Error("Order ID is required.");

            const order = await OrderModel.findOne({
                _id: args.orderId,
                userId: currentUser.userId,
            });

            if (!order) throw new Error("Order not found.");

            return order;
        },

        getOrderStatus: async (
            _: unknown,
            args: { orderId: string },
            context: MyContext
        ): Promise<GetOrderStatusResponse> => {
            const currentUser = getCurrentUser(context);
            if (!currentUser || !currentUser.userId) throw new Error("Not authenticated");

            if (!args.orderId) throw new Error("Order ID is required.");

            const order = await OrderModel.findOne({
                _id: args.orderId,
                userId: currentUser.userId,
            });

            if (!order) throw new Error("Order not found.");

            return {
                orderStatus: order.orderStatus,
                products: order.products.map((product) => ({
                    title: product.title,
                    price: product.priceAtPurchase,
                    quantity: product.quantity,
                    totalPrice: product.totalPrice,
                    thumbnail: product.thumbnail,
                    externalProductId: product.externalProductId,
                    returnPolicy: product.returnPolicy
                })),
            };
        },

        getUserOrderByStatus: async (
            _: unknown,
            args: { status: string },
            context: MyContext
        ): Promise<UserOrder[]> => {
            const currentUser = getCurrentUser(context);
            if (!currentUser || !currentUser.userId) throw new Error("Not authenticated");

            const orders = await OrderModel.find({
                userId: currentUser.userId,
                orderStatus: args.status,
            });

            if (!orders || orders.length === 0) {
                throw new Error(`No orders found with status: ${args.status}`);
            }

            return orders;
        },
    },
};

export default getUserOrderResolver;
