import { fetchProducts, fetchProductById, searchProducts, fetchProductsByIds } from "../../../services/productService";
import { Product, FetchProductsResponse } from "../../../types";

const getProductsResolver = {
    Query: {
        getAllProducts: async (

            _: unknown,
            args: { limit?: number; skip?: number }

        ): Promise<FetchProductsResponse | null> => {

            const {
                limit = 10,
                skip = 0
            } = args;


            try {
                const response = await fetchProducts(limit, skip);
                return response;
            } catch (error) {
                console.error("Error fetching products:", error);
                return null;
            }
        },

        getProductById: async (
            _: unknown,
            args: { id: number }
        ): Promise<Product | null> => {
            const { id } = args;
            try {
                const product = await fetchProductById(id);
                return product;
            } catch (error) {
                console.error(`Error fetching product with id ${id}:`, error);
                return null;
            }
        },

        getProductsByIds: async (_: unknown, args: { ids: number[] }) => {
            try {
                const products = await fetchProductsByIds(args.ids);
                return products;
            } catch (error) {
                console.error("Error fetching products by ids:", error);
                return null;
            }
        },


        searchProducts: async (
            _: unknown,
            args: { query: string; limit?: number; skip?: number }
        ): Promise<FetchProductsResponse | null> => {

            const {
                query,
                limit = 10,
                skip = 0
            } = args;


            try {
                const response = await searchProducts(query, limit, skip);
                if (response) {
                    return response;
                }
                return null;
            } catch (error) {
                console.error("Error searching products:", error);
                return null;
            }
        }
    }
};

export default getProductsResolver;