import "dotenv/config";
import mongoose from "mongoose";
import { startApolloServer } from "./src/app";

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) throw new Error("MONGO_URI not set");

const connectToDatabase = async () => {
    await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
    });

    if (mongoose.connection.readyState !== 1) {
        throw new Error("MongoDB connection failed");
    }

    console.log("Connected to MongoDB");

    mongoose.connection.on("disconnected", async () => {
        console.warn("Disconnected. Reconnecting...");
        try {
            await mongoose.connect(mongoUri);
        } catch (e) {
            console.error("Reconnection failed", e);
        }
    });

    mongoose.connection.on("error", (error) => {
        console.error("MongoDB error:", error);
    });
};

const startServer = async () => {
    try {
        await connectToDatabase();

        const app = await startApolloServer();
        const port = process.env.PORT || 4000;

        app.listen(port, () => {
            console.log(`Server ready at http://localhost:${port}/graphql`);
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};

startServer();
