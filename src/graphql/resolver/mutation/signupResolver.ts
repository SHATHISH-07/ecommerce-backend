import UserModel from "../../../models/userModel";
import { UserModelDoc } from "../../../types"

const signupResolver = {
    Mutation: {
        signup: async (
            _: unknown,
            args: {
                input: {
                    name: string;
                    username: string;
                    email: string;
                    address: string;
                    phone: string;
                    role?: string;
                    password: string;
                }
            }
        ): Promise<Partial<UserModelDoc>> => {

            const {
                name,
                username,
                email,
                address,
                phone,
                role = "user",
                password,
            } = args.input;

            const existingUser = await UserModel.findOne({ username });
            if (existingUser) {
                throw new Error("Username already exists");
            }

            const newUser = new UserModel(args.input);
            const savedUser = await newUser.save();

            return {
                id: savedUser._id,
                name: savedUser.name,
                username: savedUser.username,
                email: savedUser.email,
                address: savedUser.address,
                phone: savedUser.phone,
                city: savedUser.city,
                state: savedUser.state,
                zipCode: savedUser.zipCode,
                country: savedUser.country,
                isActive: savedUser.isActive,
                isBanned: savedUser.isBanned,
                createdAt: savedUser.createdAt,
                updatedAt: savedUser.updatedAt,
                updatedBy: savedUser.updatedBy,
                role: savedUser.role,
            };
        },
    },
};

export default signupResolver;
