import { FileUpload, GraphQLUpload } from "graphql-upload-ts";
import productModel from "../../../models/productModel";
import { BulkProductResponse, MyContext, Product, ProductInput, UpdateProductInput } from "../../../types";
import { getCurrentUser } from "../../../utils/getUser";

import fs from "fs";
import path from "path";
import { Readable } from "stream";

interface ResolvedFileUpload extends FileUpload {
    file?: {
        fieldName: string;
        filename: string;
        mimetype: string;
        encoding: string;
        createReadStream: () => Readable;
    };
}


const ProductResolver = {

    Upload: GraphQLUpload,

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

        uploadBulkProductsJSON: async (
            _: any,
            args: { file: Promise<FileUpload> },
            context: MyContext
        ): Promise<BulkProductResponse> => {

            const { file } = args;

            const currentUser = getCurrentUser(context);

            if (!currentUser || currentUser.role !== "admin") {
                throw new Error("Access denied. Admins only.");
            }

            let filename: string | undefined;

            try {

                const fileData = await file as unknown as ResolvedFileUpload;

                let actualCreateReadStream: () => Readable;

                let actualFilename: string;

                if (fileData.file && fileData.file.createReadStream && typeof fileData.file.filename === 'string') {
                    actualCreateReadStream = fileData.file.createReadStream;
                    actualFilename = fileData.file.filename;
                } else if (fileData.createReadStream && typeof fileData.filename === 'string') {

                    actualCreateReadStream = fileData.createReadStream;
                    actualFilename = fileData.filename;
                } else {
                    throw new Error("Invalid file upload: createReadStream or filename not available in expected format");
                }

                filename = actualFilename;

                if (!filename) {
                    throw new Error("Filename could not be determined for the uploaded file.");
                }

                const stream = actualCreateReadStream();
                const tempPath = path.join(__dirname, "../../../Uploads", filename);

                const uploadDir = path.dirname(tempPath);
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                await new Promise<void>((resolve, reject) => {
                    const writeStream = fs.createWriteStream(tempPath);
                    stream.pipe(writeStream);
                    writeStream.on("finish", () => resolve());
                    writeStream.on("error", reject);
                });

                const fileContent = fs.readFileSync(tempPath, "utf-8");
                const parsedData = JSON.parse(fileContent);
                const products = parsedData.products;

                const lastProduct = await productModel.findOne().sort({ id: -1 }).select("id").lean();
                let currentId = lastProduct?.id || 0;

                const productsWithIds = products.map((product: UpdateProductInput) => ({
                    ...product,
                    id: ++currentId,
                }));

                await productModel.insertMany(productsWithIds);


                return {
                    success: true,
                    message: "Products uploaded successfully.",
                    total: products.length,
                };
            } catch (err: any) {
                console.error("Upload error:", err);
                return {
                    success: false,
                    message: `Upload failed: ${err.message}`,
                    total: 0,
                };
            } finally {
                if (filename) {
                    const tempPath = path.join(__dirname, "../../../Uploads", filename);
                    if (fs.existsSync(tempPath)) {
                        fs.unlinkSync(tempPath);
                    }
                }
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
                }
                else {
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