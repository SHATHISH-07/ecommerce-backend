import mongoose from "mongoose";
import { Schema, Document } from "mongoose";
import { Product, Dimensions, Meta, Review } from "../types";

type ProductDoc = Product & Document;

const dimensionsSchema = new Schema<Dimensions>(
    {
        width: Number,
        height: Number,
        depth: Number,
    },
    { _id: false }
);

const reviewSchema = new Schema<Review>(
    {
        rating: Number,
        comment: String,
        date: Date,
        reviewerName: String,
        reviewerEmail: String,
    },
    { _id: false }
);

const metaSchema = new Schema<Meta>(
    {
        createdAt: Date,
        updatedAt: Date,
        barcode: String,
        qrCode: String,
    },
    { _id: false }
);

const productSchema = new Schema<ProductDoc>(
    {
        id: { type: Number, unique: true },
        title: { type: String, required: true },
        description: String,
        category: String,
        price: Number,
        discountPercentage: Number,
        rating: Number,
        stock: Number,
        tags: [String],
        brand: String,
        sku: String,
        weight: Number,
        dimensions: dimensionsSchema,
        warrantyInformation: String,
        shippingInformation: String,
        availabilityStatus: String,
        reviews: [reviewSchema],
        returnPolicy: String,
        minimumOrderQuantity: Number,
        meta: metaSchema,
        images: [String],
        thumbnail: String,
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: (_, ret) => {
                delete ret._id;
                return ret;
            },
        },
    }
);

productSchema.pre("save", async function (next) {
    if (this.isNew && typeof this.id === "undefined") {
        const products = await mongoose
            .model<ProductDoc>("Product")
            .find({})
            .sort({ id: 1 })
            .select("id");

        let expectedId = 1;
        for (const product of products) {
            if (product.id !== expectedId) {
                break;
            }
            expectedId++;
        }

        this.id = expectedId; // s
    }
    next();
});


export default mongoose.model<ProductDoc>("Product", productSchema);
