import productModel from "../../../models/productModel";
import { MyContext, Product, ProductInput, UpdateProductInput } from "../../../types";
import { getCurrentUser } from "../../../utils/getUser";

const ProductResolver = {
    Mutation: {
        addProduct: async (
            _: unknown,
            args: { productInput: ProductInput },
            context: MyContext
        ): Promise<Product> => {
            const currentUser = getCurrentUser(context);

            if (!currentUser || currentUser.role !== "admin") {
                throw new Error("Access denied. Admins only able to add products.");
            }

            try {
                const newProduct = new productModel(args.productInput);
                await newProduct.save();
                return newProduct;
            } catch (error) {
                console.error("Error adding product:", error);
                throw new Error("Failed to add product");
            }
        },

        updateProduct: async (
            _: unknown,
            args: { id: number; input: UpdateProductInput },
            context: MyContext
        ): Promise<Product> => {

            const currentUser = getCurrentUser(context);

            if (!currentUser || currentUser.role !== "admin") {
                throw new Error("Access denied. Admins only able to update products.");
            }

            const { id, input } = args;

            const productDoc = await productModel.findOne({ id });

            if (!productDoc) {
                throw new Error(`Product with id ${id} not found`);
            }

            Object.entries(input).forEach(([key, value]) => {
                if (key === "dimensions" && typeof value === "object" && value !== null) {
                    productDoc.dimensions = {
                        ...productDoc.dimensions,
                        ...value,
                    };
                } else if (key === "meta" && typeof value === "object" && value !== null) {
                    productDoc.meta = {
                        ...productDoc.meta,
                        ...value,
                    };
                } else if (key === "reviews" && Array.isArray(value)) {
                    productDoc.reviews = value.map((review) => ({
                        ...review,
                    }));
                } else {
                    (productDoc as any)[key] = value;
                }
            });

            const updated = await productDoc.save();
            return updated.toObject();
        },

        removeProduct: async (
            _: unknown,
            args: { id: number },
            context: MyContext
        ): Promise<{
            message: string,
            success: boolean
        }> => {

            const currentUser = getCurrentUser(context);

            if (!currentUser || currentUser.role !== "admin") {
                throw new Error("Access denied. Admins only able to remove products.");
            }

            const { id } = args;

            const deleted = await productModel.deleteOne({ id });

            if (deleted.deletedCount === 0) {
                throw new Error(`Product with id ${id} not found`);
            }

            return {
                message: "Product removed successfully",
                success: true
            }
        }
    }
}






export default ProductResolver;
