import categoryModel from "../models/categoryModel";
import productModel from "../models/productModel";
import { Category, FetchProductsResponse } from "../types";

export const fetchCategories = async (): Promise<Category[]> => {
    try {
        const categories = await categoryModel.find();
        return categories;
    } catch (error) {
        console.error(" Error fetching categories from DB:", error);
        throw error;
    }
};

export const fetchProductsByCategory = async (
    categorySlug: string
): Promise<FetchProductsResponse> => {
    try {

        const category = await categoryModel.findOne({ slug: categorySlug });
        if (!category) throw new Error(" Category not found");

        const products = await productModel.find({ category: category.slug });

        return {
            products,
            total: products.length,
            skip: 0,
            limit: products.length,
        };
    } catch (error) {
        console.error(" Error fetching products by category from DB:", error);
        throw error;
    }
};

export const fetchCategoriesByCategorySlug = async (
    categorySlug: string
): Promise<Category[]> => {
    try {
        const categories = await categoryModel.find({ slug: categorySlug }).lean<Category[]>();

        return categories;
    } catch (error) {
        console.error("Error fetching categories from DB:", error);
        throw new Error("Failed to fetch categories");
    }
};
