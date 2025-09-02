import Cart from "../../../models/cartModel";
import { MyContext, UserCartResponse } from "../../../types";
import { getCurrentUser } from "../../../utils/getUser";

const getUserCartResolver = {
    Query: {
        getUserCart: async (
            _: unknown,
            __: unknown,
            context: MyContext
        ): Promise<UserCartResponse> => {
            try {
                const currentUser = getCurrentUser(context);

                if (!currentUser || !currentUser.userId) {
                    throw new Error("User must be logged in to get cart");
                }

                const userCart = await Cart.findOne({ userId: currentUser.userId });

                if (!userCart) {
                    return {
                        id: "",
                        userId: currentUser.userId,
                        products: [],
                        totalItems: 0,
                        maxLimit: 0
                    };
                }

                return {
                    id: userCart.id,
                    userId: userCart.userId,
                    products: userCart.products,
                    totalItems: userCart.totalItems,
                    maxLimit: userCart.maxLimit
                };
            } catch (error) {
                console.error("Error in getUserCart:", error);
                throw new Error("Failed to retrieve user cart");
            }
        }
    }
};

export default getUserCartResolver;
