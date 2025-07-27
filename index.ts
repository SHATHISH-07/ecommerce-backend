import "dotenv/config";
import mongoose from "mongoose";
import { server } from "./src/app";

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    throw new Error("MONGO_URI environment variable is not set");
}

const connectToDatabase = async () => {
    await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
    });

    if (mongoose.connection.readyState !== 1) {
        throw new Error("MongoDB connection not established");
    }

    console.log("Connected to MongoDB");

    mongoose.connection.on("connected", () => {
        console.log("Mongoose connected to MongoDB");
    });

    mongoose.connection.on("disconnected", async () => {
        console.warn("Mongoose disconnected. Attempting to reconnect...");
        try {
            await mongoose.connect(mongoUri, {
                serverSelectionTimeoutMS: 5000,
                maxPoolSize: 10,
            });
        } catch (error) {
            console.error("Reconnection failed:", error);
        }
    });

    mongoose.connection.on("error", (error) => {
        console.error("MongoDB connection error:", error);
    });
};

const startServer = async () => {
    try {
        await connectToDatabase();

        const port = process.env.PORT ? Number(process.env.PORT) : 4000;
        const { url } = await server.listen({ port });

        console.log(`Server is running at ${url}`);
    } catch (error) {
        console.error("Failed to start the server:", error);
        process.exit(1);
    }
};

startServer();
