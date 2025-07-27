import "dotenv/config";
import jwt from "jsonwebtoken";
import { IncomingMessage } from "http";
import { TokenPayload, MyContext } from "./types";
import userModel from "./models/userModel";

const secret = process.env.SECRET_KEY;
if (!secret) {
    throw new Error("SECRET must be defined in environment variables");
}

interface ContextType {
    req: IncomingMessage;
}

const context = async ({ req }: ContextType): Promise<MyContext> => {
    const authorization = req.headers.authorization;
    // console.log("Authorization Header:", authorization);

    if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
        const token = authorization.substring(7);
        if (!token) {
            // console.log("Token is missing after 'Bearer '");
            return {};
        }

        try {
            const decodedToken = jwt.verify(token, secret) as TokenPayload;
            console.log("Decoded Token:", decodedToken);

            const userId = decodedToken.id;
            if (!userId) {
                // console.log("User ID missing in decoded token");
                return {};
            }

            const currentUser = await userModel.findById(userId);
            if (!currentUser) {
                // console.log("User not found in DB for ID:", userId);
                return {};
            }

            console.log("Current User ID:", currentUser.id);

            return {
                userId: currentUser.id,
                name: currentUser.name,
                username: currentUser.username,
                email: currentUser.email,
                address: currentUser.address,
                phone: currentUser.phone,
                role: currentUser.role,
                country: currentUser.country,
                state: currentUser.state,
                city: currentUser.city,
                zipCode: currentUser.zipCode,
                isActive: currentUser.isActive,
                isBanned: currentUser.isBanned,
                createdAt: currentUser.createdAt,
            };
        } catch (error) {
            console.error("Error verifying token:", error);
            return {};
        }
    }

    // console.log("Authorization header not valid or missing");
    return {};
};


export default context;
