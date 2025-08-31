import OrderModel from "../../../models/placeOrderModel";
import { GetOrderStatusResponse, MyContext, UserOrder } from "../../../types";
import { getCurrentUser } from "../../../utils/getUser";

const transformOrder = (order: any): UserOrder | null => {

    if (!order) return null;

    if (!order.placedAt) return null;

    return {
        ...order,
        id: order._id.toString(),
        placedAt: order.placedAt.toISOString(),
        packedAt: order.packedAt?.toISOString() || null,
        shippedAt: order.shippedAt?.toISOString() || null,
        outForDeliveryAt: order.outForDeliveryAt?.toISOString() || null,
        deliveredAt: order.deliveredAt?.toISOString() || null,
        refundAt: order.refundAt?.toISOString() || null,
        cancelledOrder: order.cancelledOrder ? {
            ...order.cancelledOrder,
            canceledAt: order.cancelledOrder.canceledAt?.toISOString()
        } : null,
        returnedOrder: order.returnedOrder ? {
            ...order.returnedOrder,
            returnedAt: order.returnedOrder.returnedAt?.toISOString()
        } : null,
    };
};


const getUserOrderResolver = {
    Query: {
        getAllUserOrder: async (
            _: unknown,
            __: unknown,
            context: MyContext
        ): Promise<UserOrder[]> => {
            const currentUser = getCurrentUser(context);
            if (!currentUser || !currentUser.userId) throw new Error("Not authenticated");

            const orders = await OrderModel.find({
                userId: currentUser.userId,
            }).lean();

            if (!orders || orders.length === 0) {
                return [];
            }

            return orders.map(transformOrder).filter(order => order !== null) as UserOrder[];
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
            }).lean();

            if (!order) throw new Error("Order not found.");

            const transformedOrder = transformOrder(order);
            if (!transformedOrder) {
                throw new Error("Order data is invalid and could not be processed.");
            }
            return transformedOrder;
        },

        getOrderStatus: async (
            _: unknown,
            args: { orderId: string },
            context: MyContext
        ): Promise<GetOrderStatusResponse> => {
            const currentUser = getCurrentUser(context);
            if (!currentUser || !currentUser.userId) throw new Error("Not authenticated");

            if (!args.orderId) throw new Error("Order ID is required.");

            // Use .lean() for consistency and performance
            const order = await OrderModel.findOne({
                _id: args.orderId,
                userId: currentUser.userId,
            }).lean();

            if (!order) throw new Error("Order not found.");

            return {
                orderStatus: order.orderStatus,
                products: order.products.map((product) => ({
                    title: product.title,
                    priceAtPurchase: product.priceAtPurchase,
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
            }).lean();

            if (!orders || orders.length === 0) {
                return [];
            }

            return orders.map(transformOrder).filter(order => order !== null) as UserOrder[];
        },
    },
};

export default getUserOrderResolver;