import "dotenv/config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../../../models/userModel";
import { Role } from "../../../types";

const secret = process.env.SECRET_KEY;
if (!secret) {
    throw new Error("SECRET must be defined in environment variables");
}

type LoginResponse = {
    id: string;
    username: string;
    email: string;
    role: Role;
    token: string;
};

const authResolvers = {
    Mutation: {
        login: async (
            _: unknown,
            args: { loginIdentifier: string; password: string }
        ): Promise<LoginResponse> => {
            const { loginIdentifier, password } = args;

            const user = await UserModel.findOne({
                $or: [{ username: loginIdentifier }, { email: loginIdentifier }],
            });

            if (!user) {
                throw new Error("Invalid credentials");
            }

            if (!user.isActive) {
                throw new Error("User is made inactive by admin");
            }

            if (user.isBanned) {
                throw new Error("User is banned by admin");
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error("Invalid credentials");
            }

            const token = jwt.sign(
                {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
                secret,
                { expiresIn: "1d" }
            );

            return {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role!,
                token,
            };
        },
    },
};

export default authResolvers;
