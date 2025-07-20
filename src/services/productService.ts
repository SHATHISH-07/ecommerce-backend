import mongoose from "mongoose";
import dotenv from "dotenv";
import { productModel } from "../models/productModel";
import { Product, FetchProductsResponse } from "../types";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";

export const fetchProducts = async (
    limit: number,
    skip: number
): Promise<FetchProductsResponse | null> => {
    try {
        await mongoose.connect(MONGO_URI);

        const products = await productModel.find().skip(skip).limit(limit);
        const total = await productModel.countDocuments();

        const response: FetchProductsResponse = {
            products,
            total,
            skip,
            limit,
        };

        return response;
    } catch (error) {
        console.error("Error fetching products from DB:", error);
        return null;
    } finally {
        await mongoose.disconnect();
    }
};

export const fetchProductById = async (
    id: number
): Promise<Product | null> => {
    try {
        await mongoose.connect(MONGO_URI);
        const product = await productModel.findOne({ id });
        return product;
    } catch (error) {
        console.error(`Error fetching product with id ${id}:`, error);
        return null;
    } finally {
        await mongoose.disconnect();
    }
};

export const searchProducts = async (
    query: string,
    limit: number,
    skip: number
): Promise<FetchProductsResponse | null> => {
    try {
        await mongoose.connect(MONGO_URI);

        const products = await productModel
            .find({
                title: { $regex: query, $options: "i" },
            })
            .skip(skip)
            .limit(limit);

        const total = await productModel.countDocuments({
            title: { $regex: query, $options: "i" },
        });

        const response: FetchProductsResponse = {
            products,
            total,
            skip,
            limit,
        };

        return response;
    } catch (error) {
        console.error("Error searching products:", error);
        return null;
    } finally {
        await mongoose.disconnect();
    }
};
