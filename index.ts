import "dotenv/config";
import mongoose from "mongoose";
import { server } from "./src/app";

const mongo_uri = process.env.MONGO_URI || "mongodb://localhost:27017/weatherapp";

mongoose
    .connect(mongo_uri)
    .then(() => {
        console.log("Connected to MongoDB");
        return server.listen({ port: process.env.PORT ? Number(process.env.PORT) : 4000 });
    })
    .then(({ url }) => {
        console.log("Server ready at " + url);
    })
    .catch((error) => {
        console.log("Error starting the server:", error);
    });
