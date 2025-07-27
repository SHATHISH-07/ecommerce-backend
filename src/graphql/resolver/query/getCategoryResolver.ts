import { fetchCategories, fetchCategoriesByCategorySlug, fetchProductsByCategory } from "../../../services/categoryService";
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

        searchByCategory: async (_: unknown, args: { categorySlug: string }): Promise<Category[]> => {
            try {
                const category = await fetchCategoriesByCategorySlug(args.categorySlug);
                return category;
            } catch (error) {
                console.error(`Error searching category with slug ${args.categorySlug}:`, error);
                throw error;
            }
        }

    },
};

export default getCategoryResolver;