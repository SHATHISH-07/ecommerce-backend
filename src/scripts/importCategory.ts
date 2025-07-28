import mongoose from 'mongoose';
import dotenv from 'dotenv';
import categoryModel from '../models/categoryModel';
import categoriesData from '../data/categories.json';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";

const importCategories = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected");

        await categoryModel.deleteMany();
        await categoryModel.insertMany(categoriesData.categories);

        console.log("Categories imported successfully");
        process.exit();
    } catch (error) {
        console.error("Error importing categories:", error);
        process.exit(1);
    }
};

importCategories();
