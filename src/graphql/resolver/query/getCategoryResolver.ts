import { fetchCategories, fetchProductsByCategory } from "../../../services/categoryService";
import { Category, FetchProductsResponse } from "../../../types";

const getCategoryResolver = {
    Query: {
        getCategories: async (): Promise<Category[]> => {
            try {
                const categories = await fetchCategories();
                return categories;
            } catch (error) {
                console.error("Error fetching categories:", error);
                throw error;
            }
        },

        getProductsByCategory: async (_: unknown, args: { categorySlug: string }): Promise<FetchProductsResponse> => {
            try {
                const products = await fetchProductsByCategory(args.categorySlug);
                return products;
            } catch (error) {
                console.error(`Error fetching products for category ${args.categorySlug}:`, error);
                throw error;
            }
        },
    },
};

export default getCategoryResolver;