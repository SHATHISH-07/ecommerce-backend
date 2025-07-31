import Cart from "../../../models/cartModel";
import { MyContext, addCartResponse } from "../../../types";
import { getCurrentUser } from "../../../utils/getUser";

const cartResolver = {
    Mutation: {
        addToCart: async (
            _: unknown,
            args: { input: { productId: number; quantity?: number } },
            context: MyContext
        ): Promise<addCartResponse> => {
            try {
                const { productId, quantity = 1 } = args.input;

                const currentUser = getCurrentUser(context);

                if (!currentUser || !currentUser.userId) {
                    return {
                        message: "User must be logged in to add to cart",
                        success: false,
                        cart: { userId: "", products: [] },
                    };
                }

                if (!productId) {
                    return {
                        message: "Product ID is required",
                        success: false,
                        cart: { userId: currentUser.userId, products: [] },
                    };
                }

                if (quantity <= 0) {
                    return {
                        message: "Quantity must be greater than 0",
                        success: false,
                        cart: { userId: currentUser.userId, products: [] },
                    };
                }

                const userId = currentUser.userId;
                let userCart = await Cart.findOne({ userId });

                if (!userCart) {
                    // Create new cart
                    userCart = new Cart({
                        userId,
                        products: [
                            {
                                productId,
                                quantity,
                                createdAt: new Date(),
                                updatedAt: null,
                            },
                        ],
                    });

                    await userCart.save();
                    return {
                        message: "Product added to cart successfully",
                        success: true,
                        cart: userCart,
                    };
                }

                // Update existing cart
                const existingProduct = userCart.products.find(
                    (item) => item.productId === productId
                );

                if (existingProduct) {
                    existingProduct.quantity += quantity;
                    existingProduct.updatedAt = new Date();
                } else {
                    userCart.products.push({
                        productId,
                        quantity,
                        createdAt: new Date(),
                        updatedAt: null,
                    });
                }

                await userCart.save();

                return {
                    message: "Product added to cart successfully",
                    success: true,
                    cart: userCart,
                };
            } catch (error) {
                console.error("Error in addToCart:", error);
                return {
                    message: "Something went wrong while adding to cart",
                    success: false,
                    cart: { userId: "", products: [] },
                };
            }
        },
    },
};

export default cartResolver;
