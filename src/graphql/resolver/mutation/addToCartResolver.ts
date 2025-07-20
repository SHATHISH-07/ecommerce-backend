import { userCartModel } from "../../../models/userCartModel";
import { UserCart } from "../../../types";
import { fetchProductById } from "../../../services/productService";
import { MyContext } from "../../../types";
import { getUserId } from "../../../utils/getUserId";

const getUserCartOrThrow = async (userId: string) => {
    const cart = await userCartModel.findOne({ userId });
    if (!cart) throw new Error("User cart not found.");
    return cart;
};

const addToCartResolver = {
    Mutation: {

        // Mutation to add a product to the user's cart
        addToCart: async (
            _: unknown,
            args: { productId: number; quantity: number },
            context: MyContext
        ): Promise<UserCart> => {
            const userId = getUserId(context);
            const { productId, quantity } = args;

            if (quantity <= 0) {
                throw new Error("Quantity must be greater than zero.");
            }

            let userCart = await userCartModel.findOne({ userId });

            if (!userCart) {
                userCart = new userCartModel({
                    userId,
                    products: [],
                });
            }

            const existingProduct = userCart.products.find(
                (item) => item.externalProductId === productId
            );

            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                const productDetails = await fetchProductById(productId);

                if (!productDetails) {
                    throw new Error("Product not found.");
                }

                userCart.products.push({
                    externalProductId: productId,
                    title: productDetails.title,
                    thumbnail: productDetails.thumbnail,
                    priceAtAddTime: productDetails.price,
                    quantity,
                });
            }

            await userCart.save();

            return userCart.toJSON() as UserCart;
        },

        // Mutation to remove a product from the user's cart
        removeFromCart: async (
            _: unknown,
            args: { productId: number },
            context: MyContext
        ): Promise<UserCart> => {
            const userId = getUserId(context);
            const { productId } = args;

            if (typeof productId !== "number" || productId <= 0) {
                throw new Error("Invalid Product ID.");
            }

            const userCart = await getUserCartOrThrow(userId);

            const initialLength = userCart.products.length;

            userCart.products = userCart.products.filter(
                (item) => item.externalProductId !== productId
            );

            if (userCart.products.length === initialLength) {
                throw new Error("Product not found in cart.");
            }

            await userCart.save();

            return userCart.toJSON() as UserCart;
        },


        // Update quantity of a product in the cart
        updateCartItemQuantity: async (
            _: unknown,
            args: { productId: number; quantity: number },
            context: MyContext
        ): Promise<UserCart> => {
            const userId = getUserId(context);
            const { productId, quantity } = args;

            if (typeof productId !== "number" || productId <= 0) {
                throw new Error("Invalid Product ID.");
            }

            if (quantity <= 0) {
                throw new Error("Quantity must be greater than zero.");
            }

            const userCart = await getUserCartOrThrow(userId);

            const product = userCart.products.find(
                (item) => item.externalProductId === productId
            );

            if (!product) {
                throw new Error("Product not found in cart.");
            }

            product.quantity = quantity;
            await userCart.save();

            return userCart.toJSON() as UserCart;
        },

        // Clear the user's cart
        clearCart: async (
            _: unknown,
            context: MyContext
        ): Promise<UserCart> => {
            const userId = getUserId(context);
            const userCart = await getUserCartOrThrow(userId);

            userCart.products = [];
            await userCart.save();

            return userCart.toJSON() as UserCart;
        }
    },
};

export default addToCartResolver;
