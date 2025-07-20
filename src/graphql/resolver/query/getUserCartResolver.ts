import { MyContext, UserCart } from "../../../types";
import { userCartModel } from "../../../models/userCartModel";
import { getUserId } from "../../../utils/getUserId";

const getUserCartResolver = {
    Query: {
        getUserCart: async (
            _: unknown,
            __: unknown,
            context: MyContext
        ): Promise<UserCart> => {
            const userId = getUserId(context);
            if (!userId) {
                throw new Error("Unauthorized access");
            }

            const userCart = await userCartModel.findOne({ userId });

            if (!userCart) {
                throw new Error("Cart not found for the user.");
            }

            return userCart as UserCart;
        }
    }
};

export default getUserCartResolver;
