import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../../../models/userModel";

const secret = process.env.SECRET_KEY;
if (!secret) {
    throw new Error("SECRET must be defined in environment variables");
}

const authResolvers = {
    Mutation: {
        login: async (_: unknown, args: { loginIdentifier: string; password: string }) => {
            const { loginIdentifier, password } = args;

            const user = await UserModel.findOne({
                $or: [{ username: loginIdentifier }, { email: loginIdentifier }]
            });
            if (!user) {
                throw new Error("Invalid credentials");
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error("Invalid credentials");
            }

            const token = jwt.sign(
                { id: user._id, username: user.username },
                secret,
                { expiresIn: "1h" }
            );

            return { id: user._id, username: user.username, email: user.email, role: user.role, token };
        },
    },
};

export default authResolvers;
