import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import productModel from "../models/productModel";

dotenv.config();

// MongoDB URI from .env
const MONGO_URI = process.env.MONGO_URI!;
mongoose
    .connect(MONGO_URI)
    .then(() => console.log(" MongoDB connected"))
    .catch((err) => console.error("Connection error:", err));

// Load JSON file and extract products
const filePath = path.join(__dirname, "../data/products.json");
const rawData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
const products = rawData.products;

async function importData() {
    try {
        await productModel.deleteMany();
        await productModel.insertMany(products);
        console.log(" Products imported successfully");
        process.exit();
    } catch (err) {
        console.error(" Error importing products:", err);
        process.exit(1);
    }
}

importData();
