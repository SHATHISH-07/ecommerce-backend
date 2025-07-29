import { FileUpload, GraphQLUpload } from "graphql-upload-ts";
import categoryModel from "../../../models/categoryModel";
import { MyContext, Category, BulkCategoryResponse, AddCategoryResponse, UpdateCategoryResponse, RemoveCategoryResponse } from "../../../types";
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


const categoryResolver = {

    Upload: GraphQLUpload,

    Mutation: {
        addCategory: async (
            _: unknown,
            args: { categoryInput: Category },
            context: MyContext
        ): Promise<AddCategoryResponse> => {
            const currentUser = getCurrentUser(context);

            if (!currentUser || currentUser.role !== "admin") {
                throw new Error("Access denied. Admins only able to add products.");
            }

            try {
                const newCategory = new categoryModel(args.categoryInput);
                await newCategory.save();
                return {
                    message: "Category added successfully",
                    success: true,
                    name: newCategory.name
                };
            } catch (error) {
                console.error("Error adding Category:", error);
                throw new Error("Failed to add new category");
            }
        },

        uploadBulkCategoriesJSON: async (
            _: any,
            args: { file: Promise<FileUpload> },
            context: MyContext
        ): Promise<BulkCategoryResponse> => {

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
                const categories = parsedData.categories;

                await categoryModel.insertMany(categories);


                return {
                    success: true,
                    message: "Products uploaded successfully.",
                    total: categories.length,
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

        updateCategory: async (
            _: unknown,
            args: { slug: string; categoryInput: Category },
            context: MyContext
        ): Promise<UpdateCategoryResponse> => {
            const currentUser = getCurrentUser(context);

            if (!currentUser || currentUser.role !== "admin") {
                throw new Error("Access denied. Admins only.");
            }

            const updateFields = Object.fromEntries(
                Object.entries(args.categoryInput).filter(([_, v]) => v !== undefined)
            );

            const updated = await categoryModel.findOneAndUpdate(
                { slug: args.slug },
                updateFields,
                { new: true }
            );

            if (!updated) {
                throw new Error(`Category with slug ${args.slug} not found`);
            }

            return {
                message: "Category updated successfully",
                success: true,
                name: updated.name
            }
        },

        removeCategory: async (
            _: unknown,
            args: { slug: string },
            context: MyContext
        ): Promise<RemoveCategoryResponse> => {
            const currentUser = getCurrentUser(context);

            if (!currentUser || currentUser.role !== "admin") {
                throw new Error("Access denied. Admins only.");
            }

            const deleted = await categoryModel.deleteOne({ slug: args.slug });

            if (deleted.deletedCount === 0) {
                throw new Error(`Category with slug ${args.slug} not found`);
            }

            return {
                message: "Category removed successfully",
                success: true,
                name: args.slug
            };
        },

    }
}

export default categoryResolver;