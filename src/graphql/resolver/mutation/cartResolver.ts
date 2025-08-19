import Cart from "../../../models/cartModel";
import productModel from "../../../models/productModel";
import { ClearCartResponse, MyContext, RemoveCartResponse, addCartResponse, updateCartResponse } from "../../../types";
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
                        cart: { userId: "", products: [], totalItems: 0, maxLimit: 0 },
                    };
                }

                if (!productId) {
                    return {
                        message: "Product ID is required",
                        success: false,
                        cart: { userId: currentUser.userId, products: [], totalItems: 0, maxLimit: 0 },
                    };
                }

                if (quantity <= 0) {
                    return {
                        message: "Quantity must be greater than 0",
                        success: false,
                        cart: { userId: currentUser.userId, products: [], totalItems: 0, maxLimit: 0 },
                    };
                }

                const existingProductId = await productModel.findOne({ id: productId });
                if (!existingProductId) {
                    return {
                        message: "Invalid product ID or product does not exist",
                        success: false,
                        cart: { userId: currentUser.userId, products: [], totalItems: 0, maxLimit: 0 },
                    };
                }

                const userId = currentUser.userId;
                let userCart = await Cart.findOne({ userId });

                if (!userCart) {

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
                    cart: { userId: "", products: [], totalItems: 0, maxLimit: 0 },
                };
            }
        },

        updateUserCart: async (
            _: unknown,
            args: { productId: number; quantity: number },
            context: MyContext
        ): Promise<updateCartResponse> => {
            const { productId, quantity } = args;
            const currentUser = getCurrentUser(context);

            if (!currentUser || !currentUser.userId) {
                throw new Error("User must be logged in to update cart");
            }

            try {
                const userCart = await Cart.findOne({ userId: currentUser.userId });

                if (!userCart) {
                    throw new Error("Cart not found");
                }

                if (userCart.products.length === 0) {
                    throw new Error("Cart is empty");
                }

                const productIndex = userCart.products.findIndex(
                    (item) => item.productId === productId
                );

                if (productIndex === -1) {
                    throw new Error("Product not found in cart");
                }

                if (quantity <= 0) {
                    userCart.products.splice(productIndex, 1);
                } else {
                    userCart.products[productIndex].quantity = quantity;
                }

                await userCart.save();

                return {
                    success: true,
                    message: "Cart updated successfully",
                    cart: userCart,
                };
            } catch (error) {
                console.error(error);
                throw new Error("Failed to update cart");
            }
        },

        removeCartItem: async (
            _: unknown,
            args: { productId: number },
            context: MyContext
        ): Promise<RemoveCartResponse> => {

            const currentUser = getCurrentUser(context);

            if (!currentUser || !currentUser.userId) {
                throw new Error("User must be logged in to update cart");
            }

            const { productId } = args;

            try {

                const userCart = await Cart.findOne({ userId: currentUser.userId })

                if (!userCart) {
                    throw new Error("Cart not found for the user");
                }

                if (userCart.products.length === 0) {
                    throw new Error("Cart is empty");
                }

                const productIndex = userCart.products.findIndex(
                    (item) => item.productId === productId
                );

                if (productIndex === -1) {
                    throw new Error("Product not found in cart");
                }

                userCart.products.splice(productIndex, 1);

                await userCart.save();

                return {
                    success: true,
                    message: "Product removed from cart",
                };

            } catch (error) {

                console.error(error);
                throw new Error("Failed to remove cart item");

            }

        },

        clearCartItems: async (
            _: unknown,
            __: unknown,
            context: MyContext
        ): Promise<ClearCartResponse> => {

            const currentUser = getCurrentUser(context);

            if (!currentUser || !currentUser.userId) {
                throw new Error("User must be logged in to update cart");
            }

            try {

                const userCart = await Cart.findOne({ userId: currentUser.userId })

                if (!userCart) {
                    throw new Error("Cart not found for the user");
                }

                if (userCart.products.length === 0) {
                    throw new Error("Cart is empty");
                }

                userCart.products = [];

                await userCart.save();

                return {
                    message: "Cart cleared successfully",
                    success: true
                }

            } catch (error) {

                console.error(error);
                throw new Error("Failed to clear cart");

            }

        }

    },
};

export default cartResolver;
