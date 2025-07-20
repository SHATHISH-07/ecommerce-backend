import userModel from "../../../models/userModel";
import { UserModelWithoutPassword, Role } from "../../../types";

const formatUser = (user: any): UserModelWithoutPassword => ({
    id: user._id.toString(),
    name: user.name,
    username: user.username,
    email: user.email,
    address: user.address,
    phone: user.phone,
    role: user.role
});

const getUserResolver = {
    Query: {
        getCurrentUser: async (
            _: unknown,
            __: unknown,
            context: { currentUser: UserModelWithoutPassword | null }
        ): Promise<UserModelWithoutPassword> => {
            const { currentUser } = context;
            if (!currentUser) throw new Error("Not authenticated");
            return currentUser;
        },

        getUser: async (
            _: unknown,
            args: { username?: string; email?: string; name?: string }
        ): Promise<UserModelWithoutPassword> => {
            const conditions = [];
            if (args.username) conditions.push({ username: args.username });
            if (args.email) conditions.push({ email: args.email });
            if (args.name) conditions.push({ name: args.name });

            if (conditions.length === 0) {
                throw new Error("At least one search parameter must be provided.");
            }

            const user = await userModel.findOne({ $or: conditions }).lean();
            if (!user) throw new Error("User not found");

            return formatUser(user);
        },

        getUsers: async (): Promise<UserModelWithoutPassword[]> => {
            const users = await userModel.find().lean();
            return users.map(formatUser);
        },

        getUserById: async (
            _: unknown,
            args: { id: string }
        ): Promise<UserModelWithoutPassword> => {
            const user = await userModel.findById(args.id).lean();
            if (!user) throw new Error("User not found");

            return formatUser(user);
        },

        getUsersByRole: async (
            _: unknown,
            args: { role: Role }
        ): Promise<UserModelWithoutPassword[]> => {
            const users = await userModel.find({ role: args.role }).lean();
            return users.map(formatUser);
        }
    }
};

export default getUserResolver;
