import "dotenv/config";
import mongoose from "mongoose";
import { startApolloServer } from "./app";

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    console.error("Error: MONGO_URI not set in environment variables.");
    process.exit(1);
}

let isReconnecting = false;
const RECONNECT_INTERVAL_MS = 5000;
const MAX_RECONNECT_ATTEMPTS = 5;
let reconnectAttempts = 0;

const connectToDatabase = async () => {
    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
            maxPoolSize: 10,
            minPoolSize: 2,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            retryWrites: true,
            w: "majority",
        });


        if (mongoose.connection.readyState !== 1) {
            throw new Error("MongoDB connection failed after connect call.");
        }

        console.log("Connected to MongoDB");

        reconnectAttempts = 0;
        isReconnecting = false;

    } catch (error: any) {
        console.error("Initial MongoDB connection error:", error.message);
        throw error;
    }
};

const handleDisconnect = async () => {
    if (isReconnecting) {
        return;
    }

    isReconnecting = true;
    reconnectAttempts++;

    if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
        console.error(`MongoDB: Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Exiting process.`);
        process.exit(1);
    }

    const delay = RECONNECT_INTERVAL_MS * Math.pow(2, reconnectAttempts - 1);
    console.warn(`MongoDB: Disconnected. Attempting to reconnect in ${delay / 1000} seconds... (Attempt ${reconnectAttempts})`);

    setTimeout(async () => {
        try {
            await connectToDatabase();
            console.log("MongoDB: Successfully reconnected.");
            isReconnecting = false;
            reconnectAttempts = 0;
        } catch (e: any) {
            console.error("MongoDB: Reconnection attempt failed.", e.message);
            isReconnecting = false;

        }
    }, delay);
};

mongoose.connection.on("disconnected", handleDisconnect);

mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error);

});

mongoose.connection.on("connected", () => {
    console.log("MongoDB: Mongoose default connection open.");
});

mongoose.connection.on("close", () => {
    console.log("MongoDB: Mongoose default connection closed.");
});


const startServer = async () => {
    try {
        await connectToDatabase();

        process.on('SIGINT', async () => {
            console.log('MongoDB: SIGINT received. Closing Mongoose connection.');
            await mongoose.connection.close();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('MongoDB: SIGTERM received. Closing Mongoose connection.');
            await mongoose.connection.close();
            process.exit(0);
        });

        const app = await startApolloServer();
        const port = process.env.PORT;

        app.listen(port, () => {
            console.log(`Server ready at http://localhost:${port}/graphql`);
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};

startServer();