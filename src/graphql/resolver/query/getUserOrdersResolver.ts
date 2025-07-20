import { MyContext, UserOrder } from "../../../types";
import { userOrderModel } from "../../../models/userPlacedOrder";
import { getUserId } from "../../../utils/getUserId";

const getUserOrderResolver = {
    Query: {
        getUserOrders: async (
            _: unknown,
            __: unknown,
            context: MyContext
        ): Promise<UserOrder[]> => {
            const userId = getUserId(context);
            if (!userId) throw new Error("Unauthorized");

            const orders = await userOrderModel.find({ userId });

            if (!orders || orders.length === 0) {
                throw new Error("No orders found for the user.");
            }

            return orders.map(order => {
                const plainOrder = order.toJSON();
                return {
                    ...plainOrder,
                    userId: plainOrder.userId.toString(),
                    id: plainOrder._id.toString()
                } as UserOrder;
            });
        },
        getOrderById: async (
            _: unknown,
            args: { orderId: string },
            context: MyContext
        ) => {
            const currentUserId = getUserId(context);
            if (!currentUserId) throw new Error("Unauthorized");

            const order = await userOrderModel.findById(args.orderId);
            if (!order) throw new Error("Order not found");

            if (order.userId.toString() !== currentUserId) {
                throw new Error("You are not authorized to view this order.");
            }

            return order.toJSON();
        }
    }
};

export default getUserOrderResolver;

