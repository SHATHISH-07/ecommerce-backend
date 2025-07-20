import { userCartModel } from "../../../models/userCartModel";
import { OrderedProduct, OrderStatus } from "../../../types";
import { userOrderModel } from "../../../models/userPlacedOrder";
import { UserOrder } from "../../../types";
import { fetchProductById } from "../../../services/productService";
import { MyContext } from "../../../types";
import { getUserId } from "../../../utils/getUserId";

const userOrderResolver = {
    Mutation: {

        // Place an order for the entire cart
        placeOrder: async (
            _: unknown,
            args: {
                shippingAddress: UserOrder["shippingAddress"],
                paymentMethod: UserOrder["paymentMethod"]
            },
            context: MyContext
        ) => {
            const currentUserId = getUserId(context);
            if (!currentUserId) throw new Error("Unauthorized");

            const userCart = await userCartModel.findOne({ userId: currentUserId });
            if (!userCart || userCart.products.length === 0) {
                throw new Error("Your cart is empty.");
            }

            const orderedProducts: OrderedProduct[] = [];
            let totalAmount = 0;

            for (const item of userCart.products) {
                const productDetails = await fetchProductById(item.externalProductId);
                if (!productDetails) {
                    throw new Error(`Product with ID ${item.externalProductId} not found`);
                }

                const totalPrice = item.quantity * item.priceAtAddTime;
                totalAmount += totalPrice;

                orderedProducts.push({
                    externalProductId: item.externalProductId,
                    title: item.title,
                    thumbnail: item.thumbnail,
                    priceAtPurchase: item.priceAtAddTime,
                    quantity: item.quantity,
                    totalPrice
                });
            }

            const orderDoc = new userOrderModel({
                userId: currentUserId,
                products: orderedProducts,
                shippingAddress: args.shippingAddress,
                paymentMethod: args.paymentMethod,
                totalAmount,
                paymentStatus: "Pending",
                orderStatus: "Processing",
                placedAt: new Date()
            });

            await orderDoc.save();

            await userCartModel.updateOne({ userId: currentUserId }, { $set: { products: [] } });

            return orderDoc.toJSON();
        },

        // Place a direct order (Buy Now) for any product
        placeIndividualOrder: async (
            _: unknown,
            args: {
                productId: number;
                quantity: number;
                shippingAddress: UserOrder["shippingAddress"];
                paymentMethod: UserOrder["paymentMethod"];
            },
            context: MyContext
        ) => {
            const currentUserId = getUserId(context);
            if (!currentUserId) throw new Error("Unauthorized");

            const productDetails = await fetchProductById(args.productId);
            if (!productDetails) throw new Error("Product not found");

            const totalPrice = args.quantity * productDetails.price;

            const orderedProduct: OrderedProduct = {
                externalProductId: productDetails.id,
                title: productDetails.title,
                thumbnail: productDetails.thumbnail,
                priceAtPurchase: productDetails.price,
                quantity: args.quantity,
                totalPrice
            };

            const orderDoc = new userOrderModel({
                userId: currentUserId,
                products: [orderedProduct],
                shippingAddress: args.shippingAddress,
                paymentMethod: args.paymentMethod,
                totalAmount: totalPrice,
                paymentStatus: "Pending",
                orderStatus: "Processing",
                placedAt: new Date()
            });

            await orderDoc.save();

            await userCartModel.updateOne({ userId: currentUserId }, { $set: { products: [] } });

            return orderDoc.toJSON();
        },

        // Place order for a single product from the cart
        placeCartItemOrder: async (
            _: unknown,
            args: {
                productId: number;
                shippingAddress: UserOrder["shippingAddress"];
                paymentMethod: UserOrder["paymentMethod"];
            },
            context: MyContext
        ) => {
            const currentUserId = getUserId(context);
            if (!currentUserId) throw new Error("Unauthorized");

            const userCart = await userCartModel.findOne({ userId: currentUserId });
            if (!userCart) throw new Error("Cart not found");

            const item = userCart.products.find(p => p.externalProductId === args.productId);
            if (!item) throw new Error("Product not found in cart");

            const productDetails = await fetchProductById(item.externalProductId);
            if (!productDetails) throw new Error("Product not found in catalog");

            const totalPrice = item.quantity * item.priceAtAddTime;

            const orderedProduct: OrderedProduct = {
                externalProductId: item.externalProductId,
                title: item.title,
                thumbnail: item.thumbnail,
                priceAtPurchase: item.priceAtAddTime,
                quantity: item.quantity,
                totalPrice
            };

            const orderDoc = new userOrderModel({
                userId: currentUserId,
                products: [orderedProduct],
                shippingAddress: args.shippingAddress,
                paymentMethod: args.paymentMethod,
                totalAmount: totalPrice,
                paymentStatus: "Pending",
                orderStatus: "Processing",
                placedAt: new Date()
            });

            await orderDoc.save();

            userCart.products = userCart.products.filter(
                p => p.externalProductId !== args.productId
            );
            await userCart.save();

            return orderDoc.toJSON();
        },

        // Update order status
        updateOrderStatus: async (
            _: unknown,
            args: { orderId: string; newStatus: OrderStatus },
            context: MyContext
        ) => {
            const currentUser = context.currentUser;
            if (!currentUser || currentUser.role !== "admin") {
                throw new Error("Only admins can update order status.");
            }

            const order = await userOrderModel.findById(args.orderId);
            if (!order) throw new Error("Order not found");

            order.orderStatus = args.newStatus;
            await order.save();

            return order.toJSON();
        },


        // Cancel an order
        cancelOrder: async (
            _: unknown,
            args: { orderId: string },
            context: MyContext
        ) => {
            const currentUserId = getUserId(context);
            if (!currentUserId) throw new Error("Unauthorized");

            const order = await userOrderModel.findById(args.orderId);
            if (!order) throw new Error("Order not found");

            if (order.userId.toString() !== currentUserId) {
                throw new Error("You are not authorized to cancel this order.");
            }

            if (order.orderStatus === "Cancelled") {
                throw new Error("This order is already cancelled.");
            }

            const cancellableStatuses: OrderStatus[] = ["Processing", "Packed", "Shipped"];
            if (!cancellableStatuses.includes(order.orderStatus)) {
                throw new Error(`Cannot cancel an order with status '${order.orderStatus}'.`);
            }

            if (order.paymentStatus === "Paid") {
                order.paymentStatus = "Refunded";
                order.refundAt = new Date();
            }

            order.orderStatus = "Cancelled";
            await order.save();

            return order.toJSON();
        }

    }
};

export default userOrderResolver;
